import { readFileSync,readdirSync } from "node:fs"
import path from  "node:path"
import { GoogleGenAI } from "@google/genai"
import {z} from "zod"
import { ExtractionSchema,extractionJsonSchema } from "@/lib/import/schema"
import { checkExtraction } from "@/lib/import/checks"

const PROMPT = `You read cricket scorecard screenshots from CricHeroes or SL Cricket Scorers.
Fill in the given JSON schema, one entry in "innings" per innings shown.
Rules:
- Extract only innings totals, extras, batting and bowling. Ignore match details, result, fall of wickets, summaries and ads.
- Copy names exactly as shown, including (c), *, † and cut-off names.
- Copy overs as text exactly as shown, e.g. "8.5".
- Copy "how out" text exactly, e.g. "c X b Y", "not out".
- If screenshots overlap, list each player once per innings.
- Never calculate or guess. Use null for anything hidden or unclear and describe it in "unreadable".`

//retrying if the main model fails
const sleep = (ms:number)=> new Promise((r)=>setTimeout(r,ms))

function isRetryable(err:unknown){
    const status = (err as {status?:number})?.status
    return status===503||status===429
    //503: server busy, 429:rate limit
}

async function generateWithRetry(
    ai:GoogleGenAI,
    request:Omit<Parameters<typeof ai.models.generateContent>[0],"model">,
){
    const models = [process.env.GEMINI_MODEL!,process.env.GEMINI_FALLBACK_MODEL].filter(Boolean) as string[]

    for(const model of models){
        for(let attempt =1;attempt<=3;attempt++){
            try{
                console.log(`Trying ${model} (attempt ${attempt})...`)
                return await ai.models.generateContent({...request,model})
            }catch(err){
                if(!isRetryable(err)) throw err
                const wait = 2000*2**(attempt-1)
                console.log(`  busy (${(err as { status?: number }).status}), waiting ${wait / 1000}s`)
                await sleep(wait)
        }
    }
    console.log(`${model} still busy, switching model...`)
    }
    throw new Error("All models busy, Try again later.")
}

async function main(){
   const folder =  process.argv[2]
   if(!folder) throw new Error("Usage: try-extract <folder>")

    const files = readdirSync(folder)
    .filter((f)=>/\.(jpe?g|png)$/i.test(f))
    .sort()

    const images = files.map((f)=>({
        inlineData:{
              mimeType: f.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
              data: readFileSync(path.join(folder, f)).toString("base64")
        },
    }))

   console.log(`Sending ${files.length} screenshots to ${process.env.GEMINI_MODEL}...`)

   const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY})
   const started = Date.now()

    const res = await generateWithRetry(ai, {
    contents: [{ role: "user", parts: [{ text: PROMPT }, ...images] }],
    config: { 
        responseMimeType: "application/json",responseJsonSchema:extractionJsonSchema, //gemini must answer in this shape everytime.
        temperature: 0 },
  })

   console.log(`Answered in ${((Date.now() - started) / 1000).toFixed(1)}s`)
    const raw = JSON.parse(res.text ?? "{}")
  const parsed = ExtractionSchema.safeParse(raw)

  if (!parsed.success) {
    console.error("AI reply didn't match the schema:")
    console.error(z.prettifyError(parsed.error))
    console.log(JSON.stringify(raw, null, 2))
    process.exit(1)
  }

  const data = parsed.data   // from here on, TypeScript knows the exact shape
  console.log(JSON.stringify(data, null, 2))

  const warnings = checkExtraction(data)
  if (warnings.length === 0) {
    console.log("✓ All checks passed")
  } else {
    console.log(`${warnings.length} warning(s):`)
    for (const warning of warnings) {
      console.log(`  [innings ${warning.innings}] ${warning.code}: ${warning.message}`)
    }
  }

  if (data.unreadable.length > 0) {
    console.log("Unreadable:")
    for (const item of data.unreadable) {
      console.log(`  - ${item}`)
    }
  }
}
main().catch((err) => { console.error(err); process.exit(1) })