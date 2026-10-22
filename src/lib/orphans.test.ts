import { describe, expect, it } from "vitest"
import { isOrphan } from "./orphans"

describe("isOrphan", () => {
  const existingMatchIds = new Set(["match-1"])
  const existingPlayerIds = new Set(["player-1"])

  it("keeps a performance whose match and player both exist", () => {
    expect(
      isOrphan({ matchId: "match-1", playerId: "player-1" }, existingMatchIds, existingPlayerIds)
    ).toBe(false)
  })

  it("flags a performance whose match no longer exists", () => {
    expect(
      isOrphan({ matchId: "match-2", playerId: "player-1" }, existingMatchIds, existingPlayerIds)
    ).toBe(true)
  })

  it("flags a performance whose player no longer exists", () => {
    expect(
      isOrphan({ matchId: "match-1", playerId: "player-2" }, existingMatchIds, existingPlayerIds)
    ).toBe(true)
  })

  it("flags a performance with a null match reference", () => {
    expect(
      isOrphan({ matchId: null, playerId: "player-1" }, existingMatchIds, existingPlayerIds)
    ).toBe(true)
  })

  it("flags a performance with a missing player reference", () => {
    expect(
      isOrphan({ matchId: "match-1" }, existingMatchIds, existingPlayerIds)
    ).toBe(true)
  })
})
