export const DISMISSAL_TYPES = [
  "bowled",
  "caught",
  "lbw",
  "stumped",
  "run out",
  "hit wicket",
  "not out",
  "retired hurt",
  "retired out",
  "did not bat",
  "other",
] as const

export type DismissalType = (typeof DISMISSAL_TYPES)[number]

export type Dismissal = {
  type: DismissalType
  fielder: string | null
  bowler: string | null
  raw: string
}

export function oversToBalls(overs: string | null | undefined): number | null {
  if (overs == null) return null

  const match = overs.trim().match(/^(\d+)(?:\.(\d))?$/)
  if (!match) return null

  const balls = match[2] === undefined ? 0 : Number(match[2])
  if (balls > 5) return null

  return Number(match[1]) * 6 + balls
}

export function ballsToOvers(balls: number): string {
  return `${Math.floor(balls / 6)}.${balls % 6}`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function cleanName(
  raw: string,
  teamNames: string[] = []
): { name: string; isCaptain: boolean; isKeeper: boolean; truncated: boolean } {
  const normalized = raw.replace(/\s+/g, " ").trim()

  const isCaptain = /\(c\)/i.test(normalized)
  const isKeeper = /†|\(wk\)/i.test(normalized)
  const truncated = /\(?\s*(?:…|\.\.\.)\s*\)?$/.test(normalized)

  let name = normalized
    .replace(/\(c\)/gi, " ")
    .replace(/\(wk\)/gi, " ")
    .replace(/†/g, " ")
    .replace(/\*/g, " ")
    .replace(/\s*\(?\s*(?:…|\.\.\.)\s*\)?\s*$/, " ")
    .replace(/\s+/g, " ")
    .trim()

  for (const teamName of teamNames) {
    const team = teamName.trim()
    if (!team) continue

    const suffix = new RegExp(`\\s+${escapeRegExp(team)}$`, "i")
    if (suffix.test(name)) {
      name = name.replace(suffix, "").trim()
      break
    }
  }

  return { name, isCaptain, isKeeper, truncated }
}

export function parseHowOut(raw: string): Dismissal {
  const normalized = raw.replace(/†/g, " ").replace(/\s+/g, " ").trim()
  const lower = normalized.toLowerCase()

  if (lower === "not out") {
    return { type: "not out", fielder: null, bowler: null, raw }
  }

  if (lower === "did not bat" || lower === "dnb") {
    return { type: "did not bat", fielder: null, bowler: null, raw }
  }

  if (lower.startsWith("retired out")) {
    return { type: "retired out", fielder: null, bowler: null, raw }
  }

  if (lower.startsWith("retired")) {
    return { type: "retired hurt", fielder: null, bowler: null, raw }
  }

  const caughtAndBowled = normalized.match(/^c\s*(?:&|and)\s*b\s+(.+)$/i)
  if (caughtAndBowled) {
    const bowler = caughtAndBowled[1].trim()
    return { type: "caught", fielder: bowler, bowler, raw }
  }

  const caught = normalized.match(/^c\s+(.+?)\s+b\s+(.+)$/i)
  if (caught) {
    return { type: "caught", fielder: caught[1].trim(), bowler: caught[2].trim(), raw }
  }

  const stumped = normalized.match(/^st\s+(.+?)\s+b\s+(.+)$/i)
  if (stumped) {
    return { type: "stumped", fielder: stumped[1].trim(), bowler: stumped[2].trim(), raw }
  }

  const lbw = normalized.match(/^lbw\s+b\s+(.+)$/i)
  if (lbw) {
    return { type: "lbw", fielder: null, bowler: lbw[1].trim(), raw }
  }

  const hitWicket = normalized.match(/^hit wicket\s+b\s+(.+)$/i)
  if (hitWicket) {
    return { type: "hit wicket", fielder: null, bowler: hitWicket[1].trim(), raw }
  }

  const runOutWithFielder = normalized.match(/^run out\s*\((.+)\)$/i)
  if (runOutWithFielder) {
    return { type: "run out", fielder: runOutWithFielder[1].trim(), bowler: null, raw }
  }

  if (/^run out\b/i.test(normalized)) {
    return { type: "run out", fielder: null, bowler: null, raw }
  }

  const bowled = normalized.match(/^b\s+(.+)$/i)
  if (bowled) {
    return { type: "bowled", fielder: null, bowler: bowled[1].trim(), raw }
  }

  return { type: "other", fielder: null, bowler: null, raw }
}

export function countsAsOut(type: DismissalType): boolean {
  return type !== "not out" && type !== "retired hurt" && type !== "did not bat"
}

export function creditsBowler(type: DismissalType): boolean {
  return (
    type === "bowled" ||
    type === "caught" ||
    type === "lbw" ||
    type === "stumped" ||
    type === "hit wicket"
  )
}
