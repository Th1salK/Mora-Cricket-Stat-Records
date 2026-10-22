// Server-only module: it reads GEMINI_API_KEY. Never import this from a client component.

import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { ExtractionSchema, extractionJsonSchema, type Extraction } from "./schema"

export const EXTRACTION_PROMPT = `You read cricket scorecard screenshots from CricHeroes or SL Cricket Scorers.
Fill in the given JSON schema, one entry in "innings" per innings shown.
Rules:
- Extract only innings totals, extras, batting and bowling. Ignore match details, result, fall of wickets, summaries and ads.
- Copy names exactly as shown, including (c), *, † and cut-off names.
- Copy overs as text exactly as shown, e.g. "8.5".
- Copy "how out" text exactly, e.g. "c X b Y", "not out".
- If screenshots overlap, list each player once per innings.
- Never calculate or guess. Use null for anything hidden or unclear and describe it in "unreadable".`

export type ImageInput = { mimeType: string; data: string }

export class ExtractionError extends Error {
  code: "config" | "all-busy" | "bad-reply" | "api"

  constructor(code: ExtractionError["code"], message: string) {
    super(message)
    this.name = "ExtractionError"
    this.code = code
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isRetryable(err: unknown): boolean {
  const status = (err as { status?: number })?.status
  return status === 503 || status === 429
}

function modelsToTry(): string[] {
  const configured = process.env.GEMINI_MODELS?.split(",")
    .map((model) => model.trim())
    .filter(Boolean)

  if (configured && configured.length > 0) return configured

  return [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL].filter(
    (model): model is string => Boolean(model)
  )
}

export async function extractScorecard(
  images: ImageInput[]
): Promise<{ data: Extraction; modelUsed: string; seconds: number }> {
  const apiKey = process.env.GEMINI_API_KEY
  const models = modelsToTry()

  if (!apiKey || models.length === 0) {
    throw new ExtractionError("config", "Gemini is not configured on the server.")
  }

  const ai = new GoogleGenAI({ apiKey })
  const started = Date.now()
  const contents = [
    {
      role: "user",
      parts: [
        { text: EXTRACTION_PROMPT },
        ...images.map((image) => ({
          inlineData: { mimeType: image.mimeType, data: image.data },
        })),
      ],
    },
  ]

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: extractionJsonSchema,
            temperature: 0,
          },
        })

        let raw: unknown
        try {
          raw = JSON.parse(response.text ?? "")
        } catch {
          throw new ExtractionError("bad-reply", "The AI's answer was not valid JSON.")
        }

        const parsed = ExtractionSchema.safeParse(raw)
        if (!parsed.success) {
          throw new ExtractionError(
            "bad-reply",
            `The AI's answer could not be read:\n${z.prettifyError(parsed.error)}`
          )
        }

        return {
          data: parsed.data,
          modelUsed: model,
          seconds: (Date.now() - started) / 1000,
        }
      } catch (err) {
        if (err instanceof ExtractionError) throw err

        if (!isRetryable(err)) {
          throw new ExtractionError(
            "api",
            err instanceof Error ? err.message : "The Gemini request failed."
          )
        }

        // 503 = model busy, 429 = rate limit. Back off 2s, then 4s, then 8s.
        await sleep(2000 * 2 ** (attempt - 1))
      }
    }
  }

  throw new ExtractionError(
    "all-busy",
    "Gemini is busy or the daily free limit is reached. Try again later, or enter the stats manually."
  )
}
