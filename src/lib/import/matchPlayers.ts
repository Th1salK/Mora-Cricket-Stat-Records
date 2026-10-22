import { cleanName } from "./parse"

export type PlayerLite = {
  id: string
  fullName: string
  shortName: string
  aliases: string[]
}

export type MatchStatus = "exact" | "confirm" | "unmatched"

export type NameMatch = {
  raw: string
  cleaned: string
  status: MatchStatus
  playerId: string | null
  reason: string
  suggestions: string[]
}

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function levenshtein(a: string, b: string): number {
  // No edits needed when the strings are identical, and an empty string
  // costs one insertion per character of the other string.
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // One row of the DP table: previous[j] is the distance between the part
  // of "a" processed so far and the first j characters of "b".
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)

  for (let i = 1; i <= a.length; i++) {
    // Turning the first i characters of "a" into "" takes i deletions.
    const current = [i]

    for (let j = 1; j <= b.length; j++) {
      // Replace the last character (free when they already match).
      const replace = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      // Delete the last character of "a".
      const remove = previous[j] + 1
      // Insert the last character of "b".
      const insert = current[j - 1] + 1

      current[j] = Math.min(replace, remove, insert)
    }

    // The row we just built becomes "previous" for the next character of "a".
    previous = current
  }

  return previous[b.length]
}

export function similarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length)
  if (longest === 0) return 1
  return 1 - levenshtein(a, b) / longest
}

export function matchName(
  raw: string,
  players: PlayerLite[],
  teamNames: string[] = []
): NameMatch {
  const { name: cleaned, truncated } = cleanName(raw, teamNames)
  const key = normalise(cleaned)
  const suggestions: string[] = []

  if (!key) {
    return {
      raw,
      cleaned,
      status: "unmatched",
      playerId: null,
      reason: "empty name",
      suggestions,
    }
  }

  const aliasMatches = players.filter((player) =>
    player.aliases.some((alias) => normalise(alias) === key)
  )
  if (aliasMatches.length === 1) {
    return {
      raw,
      cleaned,
      status: "exact",
      playerId: aliasMatches[0].id,
      reason: "saved alias",
      suggestions,
    }
  }

  const fullNameMatches = players.filter((player) => normalise(player.fullName) === key)
  if (fullNameMatches.length === 1) {
    return {
      raw,
      cleaned,
      status: "exact",
      playerId: fullNameMatches[0].id,
      reason: "full name",
      suggestions,
    }
  }

  const shortNameMatches = players.filter((player) => normalise(player.shortName) === key)
  if (shortNameMatches.length === 1) {
    return {
      raw,
      cleaned,
      status: "exact",
      playerId: shortNameMatches[0].id,
      reason: "short name",
      suggestions,
    }
  }

  if (truncated) {
    const prefixMatches = players.filter((player) =>
      normalise(player.fullName).startsWith(key)
    )
    if (prefixMatches.length === 1) {
      return {
        raw,
        cleaned,
        status: "confirm",
        playerId: prefixMatches[0].id,
        reason: "start of a cut-off name",
        suggestions,
      }
    }
  }

  const scored = players
    .map((player) => {
      const names = [player.fullName, player.shortName, ...player.aliases].map(normalise)
      return {
        id: player.id,
        score: Math.max(...names.map((name) => similarity(key, name))),
      }
    })
    .sort((a, b) => b.score - a.score)

  suggestions.push(
    ...scored
      .filter((entry) => entry.score >= 0.5)
      .slice(0, 3)
      .map((entry) => entry.id)
  )

  const best = scored[0]
  const secondBest = scored[1]?.score ?? 0

  if (best && best.score >= 0.85 && secondBest < best.score - 0.05) {
    return {
      raw,
      cleaned,
      status: "confirm",
      playerId: best.id,
      reason: `closest spelling (${Math.round(best.score * 100)}%)`,
      suggestions,
    }
  }

  return {
    raw,
    cleaned,
    status: "unmatched",
    playerId: null,
    reason: "no confident match",
    suggestions,
  }
}
