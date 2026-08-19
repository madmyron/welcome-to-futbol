/**
 * Tuning knobs for matches, money, and toilet-session pacing.
 * Owns the numbers that make the loop feel fair; change here, not scattered in UI.
 */

export const HUMAN_CLUB_ID = 'human'
export const TEAMS_PER_DIVISION = 10
export const WEEKS_PER_SEASON = 18
export const MAX_CHARGES = 3
export const CHARGE_MS = 2.5 * 60 * 1000
export const MAX_SQUAD = 22
export const MIN_SQUAD = 11
export const SAVE_KEY = 'wtf-save-v1'
export const MARKET_COUNTS = { GK: 12, DEF: 20, MID: 20, FWD: 16 } as const
export const MIN_FREE_AGENTS = 50

export const STADIUM_TIERS = [8000, 12000, 18000, 25000, 35000, 50000] as const
export const STADIUM_COSTS = [0, 280000, 520000, 900000, 1500000, 2600000] as const
export const MAX_EXTRA_LEVEL = 5

export const STARTING_CASH = 750_000
export const WAGE_PER_OVERALL = 40
export const TRANSFER_FEE_FACTOR = 4500
export const SELL_BACK_RATE = 0.65
export const MATCH_TICK_MS = 2600
export const MATCH_GOAL_TICK_MS = 3800
