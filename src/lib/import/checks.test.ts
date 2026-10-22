import { describe, expect, it } from "vitest"
import type { Innings } from "./schema"
import { checkExtraction, checkInnings } from "./checks"

// Batting and total are real (from a CricHeroes screenshot).
// Bowling is invented, but consistent with the real batting and total.
function makeInnings(): Innings {
  return {
    battingTeam: "Mora Titans",
    total: { runs: 119, wickets: 5, overs: "10.0" },
    extras: { byes: 0, legByes: 0, wides: 2, noBalls: 0, penalty: 0 },
    batting: [
      {
        name: "Isuru Udana Kavishan",
        howOut: "c Sanithu Wijeyarathne b Behan Wickramasinghe",
        runs: 11,
        balls: 9,
        fours: 2,
        sixes: 0,
      },
      {
        name: "Gavin Botheju",
        howOut: "st †Shasith Rambukwella b Kevindu Perera",
        runs: 24,
        balls: 9,
        fours: 4,
        sixes: 1,
      },
      {
        name: "Prabodh wanigasinghe",
        howOut: "b Behan Wickramasinghe",
        runs: 0,
        balls: 1,
        fours: 0,
        sixes: 0,
      },
      {
        name: "Mudusaritha Gangamina",
        howOut: "c Lahiru Amarasekara b Behan Wickramasinghe",
        runs: 51,
        balls: 23,
        fours: 4,
        sixes: 4,
      },
      {
        name: "Yasanga Ayashan",
        howOut: "b Lahiru Amarasekara",
        runs: 8,
        balls: 9,
        fours: 1,
        sixes: 0,
      },
      {
        name: "Kasun Tharinda Bandara (c)*",
        howOut: "not out",
        runs: 5,
        balls: 3,
        fours: 1,
        sixes: 0,
      },
      {
        name: "Dhananjaya Daluwaththa (…",
        howOut: "not out",
        runs: 18,
        balls: 6,
        fours: 2,
        sixes: 1,
      },
    ],
    bowling: [
      {
        name: "Behan Wickramasinghe",
        overs: "2.0",
        maidens: 0,
        runs: 28,
        wickets: 3,
        wides: 1,
        noBalls: 0,
      },
      {
        name: "Kevindu Perera",
        overs: "2.0",
        maidens: 0,
        runs: 25,
        wickets: 1,
        wides: 0,
        noBalls: 0,
      },
      {
        name: "Lahiru Amarasekara",
        overs: "2.0",
        maidens: 0,
        runs: 22,
        wickets: 1,
        wides: 1,
        noBalls: 0,
      },
      {
        name: "Bowler Four",
        overs: "2.0",
        maidens: 0,
        runs: 24,
        wickets: 0,
        wides: 0,
        noBalls: 0,
      },
      {
        name: "Bowler Five",
        overs: "2.0",
        maidens: 0,
        runs: 20,
        wickets: 0,
        wides: 0,
        noBalls: 0,
      },
    ],
    didNotBat: [],
  }
}

function codesFor(innings: Innings): string[] {
  return checkInnings(innings, 1).map((warning) => warning.code)
}

describe("checkInnings", () => {
  it("returns no warnings for the consistent fixture", () => {
    expect(checkInnings(makeInnings(), 1)).toEqual([])
  })

  it("flags a batting total mismatch", () => {
    const innings = makeInnings()
    innings.batting[3].runs = 57

    expect(codesFor(innings)).toContain("batting-total")
  })

  it("flags a bowling total mismatch", () => {
    const innings = makeInnings()
    innings.bowling[0].runs = 23

    expect(codesFor(innings)).toContain("bowling-total")
  })

  it("flags unreadable bowler overs", () => {
    const innings = makeInnings()
    innings.bowling[1].overs = "1.6"

    expect(codesFor(innings)).toContain("bad-overs")
  })

  it("flags a wicket count mismatch", () => {
    const innings = makeInnings()
    innings.batting[5].howOut = "b Kevindu Perera"

    expect(codesFor(innings)).toContain("wickets")
  })

  it("flags impossible run counts", () => {
    const innings = makeInnings()
    innings.batting[0].runs = 99
    innings.batting[0].balls = 9

    expect(codesFor(innings)).toContain("impossible-runs")
  })

  it("flags an unknown dismissal", () => {
    const innings = makeInnings()
    innings.batting[2].howOut = "obstructing the field"

    expect(codesFor(innings)).toContain("unknown-dismissal")
  })

  it("uses the supplied innings number in warnings", () => {
    const innings = makeInnings()
    innings.batting[3].runs = 57

    expect(checkInnings(innings, 2)[0].innings).toBe(2)
  })
})

describe("checkExtraction", () => {
  it("numbers warnings from one across innings", () => {
    const first = makeInnings()
    first.batting[3].runs = 57

    const second = makeInnings()
    second.bowling[1].overs = "1.6"

    const warnings = checkExtraction({ innings: [first, second], unreadable: [] })

    expect(warnings).toContainEqual(
      expect.objectContaining({ innings: 1, code: "batting-total" })
    )
    expect(warnings).toContainEqual(
      expect.objectContaining({ innings: 2, code: "bad-overs" })
    )
  })

  it("returns no warnings for consistent innings", () => {
    expect(
      checkExtraction({ innings: [makeInnings(), makeInnings()], unreadable: [] })
    ).toEqual([])
  })
})
