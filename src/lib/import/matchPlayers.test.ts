import { describe, expect, it } from "vitest"
import {
  levenshtein,
  matchName,
  normalise,
  similarity,
  type PlayerLite,
} from "./matchPlayers"

const players: PlayerLite[] = [
  { id: "p1", fullName: "Prabodh Wanigasinghe", shortName: "P Wanigasinghe", aliases: [] },
  { id: "p2", fullName: "Dhananjaya Daluwaththa", shortName: "D Daluwaththa", aliases: [] },
  { id: "p3", fullName: "Mudusaritha Gangameena", shortName: "M Gangameena", aliases: [] },
  { id: "p4", fullName: "Kasun Tharinda Bandara", shortName: "Kasun", aliases: ["K T Bandara"] },
  { id: "p5", fullName: "Nimal Perera", shortName: "N Perera", aliases: [] },
  { id: "p6", fullName: "Nuwan Perera", shortName: "N Perera", aliases: [] },
]

describe("normalise", () => {
  it("lowercases, replaces punctuation and collapses spaces", () => {
    expect(normalise("Prabodh  WANIGASINGHE.")).toBe("prabodh wanigasinghe")
  })
})

describe("levenshtein", () => {
  it("counts the edits between two spellings", () => {
    expect(levenshtein("gangamina", "gangameena")).toBe(2)
  })

  it("returns zero for identical strings", () => {
    expect(levenshtein("same", "same")).toBe(0)
  })
})

describe("similarity", () => {
  it("returns one for identical strings", () => {
    expect(similarity("abc", "abc")).toBe(1)
  })
})

describe("matchName", () => {
  it("matches a full name case-insensitively", () => {
    const result = matchName("Prabodh wanigasinghe", players)
    expect(result.status).toBe("exact")
    expect(result.playerId).toBe("p1")
  })

  it("ignores captain and star markers", () => {
    const result = matchName("Kasun Tharinda Bandara (c)*", players)
    expect(result.status).toBe("exact")
    expect(result.playerId).toBe("p4")
  })

  it("matches a saved alias", () => {
    const result = matchName("K T Bandara", players)
    expect(result.status).toBe("exact")
    expect(result.playerId).toBe("p4")
    expect(result.reason).toBe("saved alias")
  })

  it("confirms a truncated full name", () => {
    const result = matchName("Dhananjaya Daluwa (…", players)
    expect(result.status).toBe("confirm")
    expect(result.playerId).toBe("p2")
  })

  it("confirms the closest spelling", () => {
    const result = matchName("Mudusaritha Gangamina", players)
    expect(result.status).toBe("confirm")
    expect(result.playerId).toBe("p3")
  })

  it("does not auto-match when a short name is shared", () => {
    const result = matchName("N Perera", players)
    expect(result.status).toBe("unmatched")
    expect(result.suggestions).toContain("p5")
    expect(result.suggestions).toContain("p6")
  })

  it("returns unmatched when no player is close", () => {
    const result = matchName("Somebody Completely Different", players)
    expect(result.status).toBe("unmatched")
  })
})
