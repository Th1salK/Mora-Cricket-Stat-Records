import { describe, expect, it } from "vitest"
import {
  ballsToOvers,
  cleanName,
  countsAsOut,
  creditsBowler,
  oversToBalls,
  parseHowOut,
  type DismissalType,
} from "./parse"

describe("oversToBalls", () => {
  it.each<[string, number]>([
    ["10.0", 60],
    ["8.5", 53],
    ["36.5", 221],
    ["4", 24],
    ["0.4", 4],
  ])("converts %s to %i balls", (overs, expected) => {
    expect(oversToBalls(overs)).toBe(expected)
  })

  it.each<string | null | undefined>(["8.6", "8.55", "abc", "", null, undefined])(
    "returns null for %s",
    (overs) => {
      expect(oversToBalls(overs)).toBeNull()
    }
  )
})

describe("ballsToOvers", () => {
  it.each<[number, string]>([
    [53, "8.5"],
    [60, "10.0"],
    [0, "0.0"],
  ])("converts %i balls to %s", (balls, expected) => {
    expect(ballsToOvers(balls)).toBe(expected)
  })
})

describe("cleanName", () => {
  it("strips the captain marker and star", () => {
    expect(cleanName("Kasun Tharinda Bandara  (c)*")).toEqual({
      name: "Kasun Tharinda Bandara",
      isCaptain: true,
      isKeeper: false,
      truncated: false,
    })
  })

  it("strips an unterminated truncation marker", () => {
    const result = cleanName("Dhananjaya Daluwaththa (…")

    expect(result.name).toBe("Dhananjaya Daluwaththa")
    expect(result.truncated).toBe(true)
  })

  it("removes a trailing team name", () => {
    expect(cleanName("Darshana Madushanka Mora Cricket", ["Mora Cricket"]).name).toBe(
      "Darshana Madushanka"
    )
  })

  it("detects a keeper marked with a dagger", () => {
    expect(cleanName("†Shasith Rambukwella")).toMatchObject({
      name: "Shasith Rambukwella",
      isKeeper: true,
    })
  })

  it("detects a keeper marked with (wk)", () => {
    expect(cleanName("Someone (WK)")).toMatchObject({
      name: "Someone",
      isKeeper: true,
    })
  })

  it("detects a parenthesised ellipsis", () => {
    expect(cleanName("Someone (...)")).toMatchObject({
      name: "Someone",
      truncated: true,
    })
  })
})

describe("parseHowOut", () => {
  const cases: Array<[string, DismissalType, string | null, string | null]> = [
    [
      "c Sanithu Wijeyarathne b Behan Wickramasinghe",
      "caught",
      "Sanithu Wijeyarathne",
      "Behan Wickramasinghe",
    ],
    [
      "st †Shasith Rambukwella b Kevindu Perera",
      "stumped",
      "Shasith Rambukwella",
      "Kevindu Perera",
    ],
    ["b Behan Wickramasinghe", "bowled", null, "Behan Wickramasinghe"],
    [
      "c Lahiru Amarasekara  b Behan Wickramasinghe",
      "caught",
      "Lahiru Amarasekara",
      "Behan Wickramasinghe",
    ],
    ["lbw b Kevindu Perera", "lbw", null, "Kevindu Perera"],
    [
      "c & b Lahiru Amarasekara",
      "caught",
      "Lahiru Amarasekara",
      "Lahiru Amarasekara",
    ],
    [
      "run out (Behan Wickramasinghe)",
      "run out",
      "Behan Wickramasinghe",
      null,
    ],
    ["not out", "not out", null, null],
  ]

  it.each(cases)("parses %s", (raw, type, fielder, bowler) => {
    expect(parseHowOut(raw)).toMatchObject({ type, fielder, bowler })
  })

  it("keeps the original text in raw", () => {
    const raw = "st †Shasith Rambukwella b Kevindu Perera"
    expect(parseHowOut(raw).raw).toBe(raw)
  })

  it("flags an unrecognised dismissal as other", () => {
    expect(parseHowOut("obstructing the field")).toMatchObject({
      type: "other",
      fielder: null,
      bowler: null,
    })
  })

  it("flags a bare run out without a fielder", () => {
    expect(parseHowOut("run out")).toMatchObject({
      type: "run out",
      fielder: null,
      bowler: null,
    })
  })

  it("treats retired hurt as retired hurt", () => {
    expect(parseHowOut("retired hurt")).toMatchObject({
      type: "retired hurt",
      fielder: null,
      bowler: null,
    })
  })
})

describe("countsAsOut", () => {
  it("counts a run out as out", () => {
    expect(countsAsOut("run out")).toBe(true)
  })

  it("counts a retired out as out", () => {
    expect(countsAsOut("retired out")).toBe(true)
  })

  it("does not count a retired hurt as out", () => {
    expect(countsAsOut("retired hurt")).toBe(false)
  })

  it("does not count a did not bat as out", () => {
    expect(countsAsOut("did not bat")).toBe(false)
  })
})

describe("creditsBowler", () => {
  it("does not credit the bowler for a run out", () => {
    expect(creditsBowler("run out")).toBe(false)
  })

  it.each<DismissalType>(["bowled", "caught", "lbw", "stumped", "hit wicket"])(
    "credits the bowler for %s",
    (type) => {
      expect(creditsBowler(type)).toBe(true)
    }
  )
})
