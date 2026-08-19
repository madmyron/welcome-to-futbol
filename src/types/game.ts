/**
 * Shared shapes for clubs, players, matches, and save data.
 * Owns the data contracts the rest of the game reads and writes.
 */

export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const
export type Position = (typeof POSITIONS)[number]

export const KIT_PATTERNS = ['solid', 'stripes', 'hoops', 'sash', 'halves', 'chevron'] as const
export type KitPattern = (typeof KIT_PATTERNS)[number]

export const CREST_SHAPES = ['shield', 'circle', 'diamond'] as const
export type CrestShape = (typeof CREST_SHAPES)[number]

export const CREST_EMBLEMS = [
  'star',
  'lion',
  'dragon',
  'crown',
  'eagle',
  'horse',
  'wolf',
  'castle',
  'sun',
  'anchor',
] as const
export type CrestEmblem = (typeof CREST_EMBLEMS)[number]

export const SCREENS = ['home', 'squad', 'table', 'market', 'club'] as const
export type ScreenId = (typeof SCREENS)[number]

export const FORMATION_IDS = [
  '4-3-3',
  '4-4-2',
  '4-2-3-1',
  '4-1-4-1',
  '3-5-2',
  '3-4-3',
  '5-3-2',
  '5-4-1',
] as const
export type FormationId = (typeof FORMATION_IDS)[number]

export type Division = 1 | 2 | 3 | 4 | 5

export type Kit = {
  primary: string
  secondary: string
  pattern: KitPattern
}

export const CREST_FILLS = ['solid', 'linear', 'radial', 'split'] as const
export type CrestFill = (typeof CREST_FILLS)[number]

export type Crest = {
  shape: CrestShape
  emblem: CrestEmblem
  fill: CrestFill
  background: string
  background2: string
  emblemColor: string
  frame: string
}

export type Player = {
  id: string
  name: string
  country: string
  flag: string
  position: Position
  attack: number
  defense: number
  energy: number
  age: number
  wage: number
  overall: number
  pace: number
  skill: number
  pass: number
  defend: number
  body: number
  form: number
  yellows: number
  banGames: number
}

export type MatchEventKind = 'kickoff' | 'shot' | 'save' | 'goal' | 'card' | 'red' | 'ht' | 'ft'

export type CardKind = 'yellow' | 'second-yellow' | 'straight-red'

export type MatchEvent = {
  minute: number
  kind: MatchEventKind
  side: 'home' | 'away' | 'none'
  text: string
  playerName?: string
  playerId?: string
  card?: CardKind
}

export type MatchMoney = {
  home: boolean
  result: 'win' | 'draw' | 'loss'
  attendance: number
  tickets: number
  merch: number
  hospitality: number
  concessions: number
  tours: number
  winnings: number
  appearance: number
  wages: number
  net: number
  standLevel?: number
  extraLevels?: Partial<Record<StadiumExtraId, number>>
}

export type LastMatch = {
  week: number
  homeName: string
  awayName: string
  homeGoals: number
  awayGoals: number
  recap: string[]
  events: MatchEvent[]
  homeCrest: Crest
  awayCrest: Crest
  money?: MatchMoney
}

export const PITCH_STYLES = ['plain', 'stripes', 'check'] as const
export type PitchStyle = (typeof PITCH_STYLES)[number]

export const STADIUM_EXTRA_IDS = ['lights', 'shop', 'screen', 'hospitality', 'roof', 'museum'] as const
export type StadiumExtraId = (typeof STADIUM_EXTRA_IDS)[number]

export type Stadium = {
  name: string
  standLevel: number
  seatColor: string
  pitchStyle: PitchStyle
  extras: StadiumExtraId[]
  extraLevels: Partial<Record<StadiumExtraId, number>>
}

export type Club = {
  id: string
  name: string
  isHuman: boolean
  division: Division
  cash: number
  stadium: Stadium
  homeKit: Kit
  awayKit: Kit
  crest: Crest
  players: Player[]
  lineupIds: string[]
  formationId: FormationId
}

export type Fixture = {
  id: string
  week: number
  division: Division
  homeId: string
  awayId: string
  played: boolean
  homeGoals?: number
  awayGoals?: number
  recap?: string[]
  events?: MatchEvent[]
}

export type SeasonReport = {
  season: number
  division: Division
  place: number
  promoted: boolean
  relegated: boolean
  prize: number
}

export type FriendInvite = {
  id: string
  via: 'email' | 'fly'
  to: string
  sentAt: number
}

export type GameState = {
  season: number
  week: number
  clubs: Club[]
  fixtures: Fixture[]
  freeAgents: Player[]
  charges: number
  nextChargeAt: number
  lastHumanFixtureId: string | null
  lastMatch: LastMatch | null
  watchingMatch: boolean
  seasonReport: SeasonReport | null
  needsName: boolean
  invites: FriendInvite[]
}

export type GameAction =
  | { type: 'NAME_CLUB'; name: string }
  | { type: 'TOGGLE_LINEUP'; playerId: string }
  | { type: 'PLAY_WEEK'; now: number }
  | { type: 'BUY_PLAYER'; playerId: string }
  | { type: 'SELL_PLAYER'; playerId: string }
  | { type: 'UPGRADE_STADIUM' }
  | { type: 'BUY_STADIUM_EXTRA'; extraId: StadiumExtraId }
  | { type: 'SET_STADIUM'; stadium: Stadium }
  | { type: 'SET_FORMATION'; formationId: FormationId }
  | { type: 'SET_KIT'; which: 'home' | 'away'; kit: Kit }
  | { type: 'SET_CREST'; crest: Crest }
  | { type: 'RENAME_CLUB'; name: string }
  | { type: 'FILL_CHARGES' }
  | { type: 'WATCH_MATCH' }
  | { type: 'DISMISS_MATCH_WATCH' }
  | { type: 'DISMISS_SEASON_REPORT' }
  | { type: 'NEW_GAME' }
  | { type: 'ADD_INVITE'; via: 'email' | 'fly'; to: string }
