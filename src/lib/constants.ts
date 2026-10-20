export const MATCH_TYPES = ["Home and Home", "Practice", "Friendly", "Div 3", "Inter Uni", "SLUG"] as const

export type MatchTypeValue = (typeof MATCH_TYPES)[number]
export type MatchTypeFilter = MatchTypeValue | "All"
