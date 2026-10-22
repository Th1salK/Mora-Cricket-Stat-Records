import { describe, expect, it } from "vitest"
import type { Extraction, Innings } from "./schema"
import type { PlayerLite } from "./matchPlayers"
import {
  buildDraft,
  canPublish,
  detectSides,
  draftWarnings,
  setPlayer,
  swapSides,
} from "./draft"

const players: PlayerLite[] = [
  { id: "p1", fullName: "Nimal Perera", shortName: "N Perera", aliases: [] },
  { id: "p2", fullName: "Nimal Perera", shortName: "N Perera", aliases: [] },
  { id: "p3", fullName: "Kasun Silva", shortName: "K Silva", aliases: [] },
]

const moraPlayer: PlayerLite = {
  id: "m1",
  fullName: "Mora Player",
  shortName: "M Player",
  aliases: [],
}

function innings(overrides: Partial<Innings>): Innings {
  return {
    battingTeam: "Team",
    total: { runs: 0, wickets: 0, overs: "0.0" },
    extras: { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 },
    batting: [],
    bowling: [],
    didNotBat: [],
    ...overrides,
  }
}

function moraBattingInnings(name = "N Perera"): Innings {
  return innings({
    battingTeam: "Mora Titans",
    total: { runs: 10, wickets: 0, overs: "0.0" },
    batting: [
      { name, howOut: "not out", runs: 10, balls: 10, fours: 1, sixes: 0 },
    ],
  })
}

function oppositionInnings(bowlerName = "N Perera"): Innings {
  return innings({
    battingTeam: "Kandy Strikers",
    total: { runs: 6, wickets: 0, overs: "1.0" },
    batting: [
      { name: "Opp Batter", howOut: "not out", runs: 6, balls: 6, fours: 1, sixes: 0 },
    ],
    bowling: [
      {
        name: bowlerName,
        overs: "1.0",
        maidens: 0,
        runs: 6,
        wickets: 0,
        wides: 0,
        noBalls: 0,
      },
    ],
  })
}

function extraction(...inningsList: Innings[]): Extraction {
  return { innings: inningsList, unreadable: [] }
}

describe("detectSides", () => {
  it("puts the second innings on the Mora side when Mora bat second", () => {
    const result = detectSides(
      [oppositionInnings(), moraBattingInnings()],
      "Kandy Strikers"
    )

    expect(result).toEqual({ sides: ["opposition", "mora"], confident: true })
  })

  it("fills the unknown team as the opposition when one team is Mora", () => {
    const result = detectSides(
      [moraBattingInnings(), innings({ battingTeam: "Unknown XI" })],
      "Kandy Strikers"
    )

    expect(result).toEqual({ sides: ["mora", "opposition"], confident: true })
  })

  it("falls back to the default order when neither team is recognisable", () => {
    const result = detectSides(
      [
        innings({ battingTeam: "Colombo Stars" }),
        innings({ battingTeam: "Galle Gladiators" }),
      ],
      "Kandy Strikers"
    )

    expect(result).toEqual({ sides: ["mora", "opposition"], confident: false })
  })

  it("treats a single non-Mora innings as the opposition", () => {
    const result = detectSides([oppositionInnings()], "Kandy Strikers")

    expect(result).toEqual({ sides: ["opposition"], confident: true })
  })

  it("never calls a two-Mora-innings extraction confident", () => {
    const result = detectSides(
      [moraBattingInnings(), moraBattingInnings()],
      "Kandy Strikers"
    )

    expect(result).toEqual({ sides: ["mora", "opposition"], confident: false })
  })
})

describe("buildDraft", () => {
  it("matches only Mora batting in the Mora innings", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings("Mora Player")),
      [moraPlayer],
      "Kandy Strikers"
    )

    expect(draft.innings[0].side).toBe("mora")
    expect(draft.innings[0].batting[0].match?.status).toBe("exact")
    expect(draft.innings[0].batting[0].playerId).toBe("m1")
  })

  it("matches only Mora bowling in the opposition innings", () => {
    const draft = buildDraft(
      extraction(oppositionInnings("M Player")),
      [moraPlayer],
      "Kandy Strikers",
      ["opposition"]
    )

    expect(draft.innings[0].side).toBe("opposition")
    expect(draft.innings[0].bowling[0].playerId).toBe("m1")
    expect(draft.innings[0].batting[0].playerId).toBeNull()
  })

  it("uses the given sides instead of detecting them", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings(), oppositionInnings()),
      [moraPlayer],
      "Kandy Strikers",
      ["opposition", "mora"]
    )

    expect(draft.innings.map((inn) => inn.side)).toEqual(["opposition", "mora"])
  })
})

describe("warnings and publishing", () => {
  it("blocks publishing when an ambiguous name is unmatched", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings(), oppositionInnings()),
      players,
      "Kandy Strikers"
    )

    const unmatched = draftWarnings(draft).filter(
      (warning) => warning.code === "unmatched-player"
    )
    expect(unmatched).toHaveLength(2)
    expect(unmatched.every((warning) => warning.blocking)).toBe(true)
    expect(canPublish(draft)).toBe(false)
  })

  it("allows publishing when every Mora row is linked", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings("M Player"), oppositionInnings("M Player")),
      [moraPlayer],
      "Kandy Strikers"
    )

    expect(draftWarnings(draft)).toEqual([])
    expect(canPublish(draft)).toBe(true)
  })

  it("turns a probable match into a non-blocking warning", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings("Mora Playr")),
      [moraPlayer],
      "Kandy Strikers"
    )

    expect(draft.innings[0].batting[0].match?.status).toBe("confirm")
    const confirm = draftWarnings(draft).filter(
      (warning) => warning.code === "confirm-player"
    )
    expect(confirm).toHaveLength(1)
    expect(confirm[0].blocking).toBe(false)
    expect(canPublish(draft)).toBe(true)
  })

  it("blocks the same player appearing twice in one table", () => {
    const inn = moraBattingInnings("M Player")
    inn.batting.push({
      name: "M Player",
      howOut: "not out",
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
    })

    const draft = buildDraft(extraction(inn), [moraPlayer], "Kandy Strikers", [
      "mora",
    ])

    const duplicates = draftWarnings(draft).filter(
      (warning) => warning.code === "duplicate-player"
    )
    expect(duplicates).toHaveLength(1)
    expect(duplicates[0].blocking).toBe(true)
  })
})

describe("setPlayer", () => {
  it("links a player without mutating the original draft", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings(), oppositionInnings()),
      players,
      "Kandy Strikers"
    )

    const updated = setPlayer(draft, 0, "batting", 0, "p2")

    expect(draft.innings[0].batting[0].playerId).toBeNull()
    expect(updated.innings[0].batting[0].playerId).toBe("p2")
    expect(updated.innings[0].batting[0].match?.status).toBe("exact")
    expect(updated.innings[0].batting[0].match?.reason).toBe("picked manually")
  })

  it("can clear a player again", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings("M Player"), oppositionInnings("M Player")),
      [moraPlayer],
      "Kandy Strikers"
    )

    const updated = setPlayer(draft, 1, "bowling", 0, null)

    expect(updated.innings[1].bowling[0].playerId).toBeNull()
    expect(
      draftWarnings(updated).some((warning) => warning.code === "unmatched-player")
    ).toBe(true)
  })
})

describe("swapSides", () => {
  it("flips the sides and re-matches the new Mora rows", () => {
    const draft = buildDraft(
      extraction(moraBattingInnings("M Player"), oppositionInnings("M Player")),
      [moraPlayer],
      "Kandy Strikers",
      ["opposition", "mora"]
    )

    expect(draft.innings[0].batting[0].playerId).toBeNull()
    expect(draft.innings[1].bowling[0].playerId).toBeNull()

    const swapped = swapSides(draft, [moraPlayer])

    expect(swapped.innings.map((inn) => inn.side)).toEqual(["mora", "opposition"])
    expect(swapped.innings[0].batting[0].playerId).toBe("m1")
    expect(swapped.innings[0].bowling).toEqual([])
    expect(swapped.innings[1].batting[0].playerId).toBeNull()
    expect(swapped.innings[1].bowling[0].playerId).toBe("m1")
  })
})
