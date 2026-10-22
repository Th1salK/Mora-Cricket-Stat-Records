import { describe, expect, it } from "vitest"
import type { MatchDetails } from "./draft"
import type { Draft, DraftBattingRow, DraftBowlingRow, DraftInnings, Side } from "./draft"
import type { PlayerLite } from "./matchPlayers"
import { buildPublishPayload } from "./publish"

const players: PlayerLite[] = [
  { id: "p1", fullName: "Alice Perera", shortName: "A Perera", aliases: ["A. Perera"] },
  { id: "p2", fullName: "Bob Silva", shortName: "B Silva", aliases: [] },
  { id: "p3", fullName: "Cara Fernando", shortName: "C Fernando", aliases: [] },
  { id: "p4", fullName: "Dave Jayasuriya", shortName: "D Jayasuriya", aliases: [] },
  { id: "p5", fullName: "Eve Bandara", shortName: "E Bandara", aliases: [] },
]

function details(overrides: Partial<MatchDetails> = {}): MatchDetails {
  return {
    matchType: "Friendly",
    date: "2026-10-01",
    opponent: "Kandy Strikers",
    venue: "Home",
    overs: 20,
    ...overrides,
  }
}

const zeroExtras = { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 }

function batter(overrides: Partial<DraftBattingRow> = {}): DraftBattingRow {
  return {
    name: "Alice Perera",
    howOut: "not out",
    runs: 50,
    balls: 40,
    fours: 5,
    sixes: 1,
    match: null,
    playerId: "p1",
    ...overrides,
  }
}

function bowler(overrides: Partial<DraftBowlingRow> = {}): DraftBowlingRow {
  return {
    name: "Bob Silva",
    overs: "4.0",
    maidens: 0,
    runs: 20,
    wickets: 2,
    wides: 1,
    noBalls: 0,
    match: null,
    playerId: "p2",
    ...overrides,
  }
}

function draftInnings(
  side: Side,
  batting: DraftBattingRow[],
  bowling: DraftBowlingRow[],
  total = { runs: 160, wickets: 6, overs: "20" }
): DraftInnings {
  return {
    battingTeam: side === "mora" ? "Mora Titans" : "Kandy Strikers",
    total,
    extras: { ...zeroExtras },
    batting,
    bowling,
    didNotBat: [],
    side,
  }
}

function draftOf(innings: DraftInnings[]): Draft {
  return { innings, unreadable: [] }
}

function publish(d: MatchDetails, draft: Draft) {
  return buildPublishPayload(d, draft, players)
}

function blockingProblems(problems: ReturnType<typeof publish>["problems"]) {
  return problems.filter((problem) => problem.blocking)
}

const moraFirst = draftOf([
  draftInnings("mora", [batter()], []),
  draftInnings("opposition", [], [bowler()]),
])

describe("result margin", () => {
  it("uses runs when Mora batted first and won", () => {
    const { payload } = publish(
      details({ result: { outcome: "won" } }),
      draftOf([
        draftInnings("mora", [batter()], [], { runs: 160, wickets: 6, overs: "20" }),
        draftInnings("opposition", [], [bowler()], {
          runs: 140,
          wickets: 8,
          overs: "20",
        }),
      ])
    )

    expect(payload?.match.result).toEqual({
      outcome: "won",
      margin: 20,
      marginType: "runs",
    })
  })

  it("uses wickets when Mora batted second and won", () => {
    const { payload } = publish(
      details({ result: { outcome: "won" } }),
      draftOf([
        draftInnings("opposition", [], [bowler()], {
          runs: 150,
          wickets: 7,
          overs: "20",
        }),
        draftInnings("mora", [batter()], [], { runs: 151, wickets: 4, overs: "19.2" }),
      ])
    )

    expect(payload?.match.result).toEqual({
      outcome: "won",
      margin: 6,
      marginType: "wickets",
    })
  })

  it("uses wickets when Mora batted first and lost", () => {
    const { payload } = publish(
      details({ result: { outcome: "lost" } }),
      draftOf([
        draftInnings("mora", [batter()], [], { runs: 140, wickets: 9, overs: "20" }),
        draftInnings("opposition", [], [bowler()], {
          runs: 160,
          wickets: 5,
          overs: "20",
        }),
      ])
    )

    expect(payload?.match.result).toEqual({
      outcome: "lost",
      margin: 5,
      marginType: "wickets",
    })
  })

  it("uses runs when Mora batted second and lost", () => {
    const { payload } = publish(
      details({ result: { outcome: "lost" } }),
      draftOf([
        draftInnings("opposition", [], [bowler()], {
          runs: 160,
          wickets: 6,
          overs: "20",
        }),
        draftInnings("mora", [batter()], [], { runs: 150, wickets: 8, overs: "20" }),
      ])
    )

    expect(payload?.match.result).toEqual({
      outcome: "lost",
      margin: 10,
      marginType: "runs",
    })
  })

  it("omits the margin for a tie", () => {
    const { payload } = publish(
      details({ result: { outcome: "tie" } }),
      moraFirst
    )

    expect(payload?.match.result).toEqual({ outcome: "tie" })
  })

  it("flags a won result that does not match the scores, without a margin", () => {
    const d = details({ result: { outcome: "won" } })
    const draft = draftOf([
      draftInnings("mora", [batter()], [], { runs: 130, wickets: 6, overs: "20" }),
      draftInnings("opposition", [], [bowler()], {
        runs: 140,
        wickets: 8,
        overs: "20",
      }),
    ])

    const { payload, problems } = publish(d, draft)

    expect(blockingProblems(problems)).toEqual([])
    expect(problems).toContainEqual({
      blocking: false,
      message: "The result you picked doesn't match the scores",
    })
    expect(payload?.match.result).toEqual({ outcome: "won" })
  })
})

describe("performance rows", () => {
  it("saves only Mora batting and Mora bowling rows", () => {
    const draft = draftOf([
      draftInnings(
        "mora",
        [batter({ playerId: "p1" }), batter({ name: "Bob Silva", playerId: "p2" })],
        [bowler({ playerId: "p3" })]
      ),
      draftInnings(
        "opposition",
        [batter({ name: "Opp Batter", playerId: null })],
        [bowler({ playerId: "p3" }), bowler({ playerId: "p4" })]
      ),
    ])

    const { payload } = publish(details(), draft)

    expect(payload?.batting.map((row) => row.playerId)).toEqual(["p1", "p2"])
    expect(payload?.bowling.map((row) => row.playerId)).toEqual(["p3", "p4"])
  })

  it("skips did-not-bat rows, numbers positions and sets out flags", () => {
    const draft = draftOf([
      draftInnings("mora", [
        batter({ name: "Alice Perera", howOut: "c X b Y", playerId: "p1" }),
        batter({ name: "Bob Silva", howOut: "did not bat", playerId: "p2" }),
        batter({ name: "Cara Fernando", howOut: "run out (X)", playerId: "p3" }),
        batter({ name: "Dave Jayasuriya", howOut: "retired hurt", playerId: "p4" }),
        batter({ name: "Eve Bandara", howOut: "not out", playerId: "p5" }),
      ], []),
      draftInnings("opposition", [], [bowler()]),
    ])

    const { payload } = publish(details(), draft)

    expect(payload?.batting.map((row) => row.playerId)).toEqual(["p1", "p3", "p4", "p5"])
    expect(payload?.batting.map((row) => row.position)).toEqual([1, 2, 3, 4])
    expect(payload?.batting.map((row) => row.out)).toEqual([true, true, false, false])
    expect(payload?.batting[0].dismissal).toEqual({
      type: "caught",
      fielder: "X",
      bowler: "Y",
    })
    expect(payload?.batting[1].dismissal).toEqual({
      type: "run out",
      fielder: "X",
      bowler: null,
    })
  })

  it("converts overs 3.2 to 20 balls", () => {
    const draft = draftOf([
      draftInnings("mora", [batter()], []),
      draftInnings("opposition", [], [bowler({ overs: "3.2" })]),
    ])

    const { payload } = publish(details(), draft)

    expect(payload?.bowling[0].balls).toBe(20)
  })

  it("treats null extras as zero", () => {
    const inn = draftInnings("mora", [batter()], [])
    inn.extras = { byes: null, legByes: null, wides: null, noBalls: null, penalty: null }

    const { payload } = publish(details(), draftOf([inn, draftInnings("opposition", [], [bowler()])]))

    expect(payload?.match.innings[0].extras).toEqual(zeroExtras)
  })
})

describe("blocking problems", () => {
  it("blocks an invalid innings overs value", () => {
    const draft = draftOf([
      draftInnings("mora", [batter()], [], { runs: 160, wickets: 6, overs: "20.7" }),
      draftInnings("opposition", [], [bowler()]),
    ])

    const { payload, problems } = publish(details(), draft)

    expect(payload).toBeNull()
    expect(blockingProblems(problems).some((problem) => problem.message.includes("Innings 1"))).toBe(true)
  })

  it("blocks an invalid bowler overs value", () => {
    const draft = draftOf([
      draftInnings("mora", [batter()], []),
      draftInnings("opposition", [], [bowler({ overs: "3.7" })]),
    ])

    const { payload, problems } = publish(details(), draft)

    expect(payload).toBeNull()
    expect(blockingProblems(problems).some((problem) => problem.message.includes("Bob Silva"))).toBe(true)
  })

  it("blocks a batter with null runs", () => {
    const draft = draftOf([
      draftInnings("mora", [batter({ runs: null })], []),
      draftInnings("opposition", [], [bowler()]),
    ])

    const { payload, problems } = publish(details(), draft)

    expect(payload).toBeNull()
    expect(blockingProblems(problems).some((problem) => problem.message.includes("Alice Perera"))).toBe(true)
  })

  it("blocks an unlinked Mora player", () => {
    const draft = draftOf([
      draftInnings("mora", [batter({ playerId: null })], []),
      draftInnings("opposition", [], [bowler()]),
    ])

    const { payload, problems } = publish(details(), draft)

    expect(payload).toBeNull()
    expect(blockingProblems(problems).length).toBeGreaterThan(0)
  })

  it("blocks two innings that both look like Mora's", () => {
    const draft = draftOf([
      draftInnings("mora", [batter()], []),
      draftInnings("mora", [batter()], []),
    ])

    const { payload, problems } = publish(details(), draft)

    expect(payload).toBeNull()
    expect(problems).toContainEqual({
      blocking: true,
      message: "Mark which innings is Mora's",
    })
  })
})

describe("aliases", () => {
  it("adds a new scorecard spelling once, even if it appears twice", () => {
    const draft = draftOf([
      draftInnings("mora", [batter({ name: "Alice P." })], []),
      draftInnings("opposition", [], [bowler({ name: "Alice P.", playerId: "p1" })]),
    ])

    const { payload } = publish(details(), draft)

    expect(payload?.aliases).toEqual([{ playerId: "p1", alias: "Alice P." }])
  })

  it("does not add a spelling equal to the full name", () => {
    const draft = draftOf([
      draftInnings("mora", [batter({ name: "alice-perera" })], []),
      draftInnings("opposition", [], [bowler()]),
    ])

    const { payload } = publish(details(), draft)

    expect(payload?.aliases).toEqual([])
  })

  it("does not add a spelling equal to an existing alias, ignoring case and punctuation", () => {
    const draft = draftOf([
      draftInnings("mora", [batter({ name: "a-perera" })], []),
      draftInnings("opposition", [], [bowler()]),
    ])

    const { payload } = publish(details(), draft)

    expect(payload?.aliases).toEqual([])
  })
})
