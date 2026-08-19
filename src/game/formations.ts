/**
 * Named formations and where each spot sits on the pitch drawing.
 * Owns the menu of shapes; lineup rules read slots from here.
 */
import type { FormationId, Position } from '../types/game.ts'
import { FORMATION_IDS } from '../types/game.ts'

export type { FormationId }

export type FormationSlots = Record<Position, number>

export type PitchDot = {
  position: Position
  x: number
  y: number
}

export type Formation = {
  id: FormationId
  name: string
  blurb: string
  slots: FormationSlots
  dots: PitchDot[]
}

function f(
  id: FormationId,
  blurb: string,
  slots: Omit<FormationSlots, 'GK'>,
  dots: PitchDot[],
): Formation {
  return { id, name: id, blurb, slots: { GK: 1, ...slots }, dots: [{ position: 'GK', x: 50, y: 90 }, ...dots] }
}

export const FORMATIONS: Formation[] = [
  f(
    '4-3-3',
    'Attacking. Three forwards.',
    { DEF: 4, MID: 3, FWD: 3 },
    [
      { position: 'DEF', x: 18, y: 72 },
      { position: 'DEF', x: 38, y: 74 },
      { position: 'DEF', x: 62, y: 74 },
      { position: 'DEF', x: 82, y: 72 },
      { position: 'MID', x: 28, y: 48 },
      { position: 'MID', x: 50, y: 50 },
      { position: 'MID', x: 72, y: 48 },
      { position: 'FWD', x: 18, y: 20 },
      { position: 'FWD', x: 50, y: 16 },
      { position: 'FWD', x: 82, y: 20 },
    ],
  ),
  f(
    '4-4-2',
    'Classic two strikers.',
    { DEF: 4, MID: 4, FWD: 2 },
    [
      { position: 'DEF', x: 18, y: 72 },
      { position: 'DEF', x: 38, y: 74 },
      { position: 'DEF', x: 62, y: 74 },
      { position: 'DEF', x: 82, y: 72 },
      { position: 'MID', x: 16, y: 46 },
      { position: 'MID', x: 38, y: 48 },
      { position: 'MID', x: 62, y: 48 },
      { position: 'MID', x: 84, y: 46 },
      { position: 'FWD', x: 35, y: 18 },
      { position: 'FWD', x: 65, y: 18 },
    ],
  ),
  f(
    '4-2-3-1',
    'Two holding mids plus three attacking mids (all MID) and one striker.',
    { DEF: 4, MID: 5, FWD: 1 },
    [
      { position: 'DEF', x: 18, y: 74 },
      { position: 'DEF', x: 38, y: 76 },
      { position: 'DEF', x: 62, y: 76 },
      { position: 'DEF', x: 82, y: 74 },
      { position: 'MID', x: 35, y: 58 },
      { position: 'MID', x: 65, y: 58 },
      { position: 'MID', x: 18, y: 36 },
      { position: 'MID', x: 50, y: 38 },
      { position: 'MID', x: 82, y: 36 },
      { position: 'FWD', x: 50, y: 16 },
    ],
  ),
  f(
    '4-1-4-1',
    '4 defenders, 1 holding mid, 4 more mids, 1 striker. The middle 4 are MID, not FWD.',
    { DEF: 4, MID: 5, FWD: 1 },
    [
      { position: 'DEF', x: 18, y: 74 },
      { position: 'DEF', x: 38, y: 76 },
      { position: 'DEF', x: 62, y: 76 },
      { position: 'DEF', x: 82, y: 74 },
      { position: 'MID', x: 50, y: 60 },
      { position: 'MID', x: 16, y: 40 },
      { position: 'MID', x: 34, y: 42 },
      { position: 'MID', x: 66, y: 42 },
      { position: 'MID', x: 84, y: 40 },
      { position: 'FWD', x: 50, y: 16 },
    ],
  ),
  f(
    '3-5-2',
    'Wing-backs and two strikers.',
    { DEF: 3, MID: 5, FWD: 2 },
    [
      { position: 'DEF', x: 26, y: 74 },
      { position: 'DEF', x: 50, y: 78 },
      { position: 'DEF', x: 74, y: 74 },
      { position: 'MID', x: 10, y: 48 },
      { position: 'MID', x: 32, y: 50 },
      { position: 'MID', x: 50, y: 46 },
      { position: 'MID', x: 68, y: 50 },
      { position: 'MID', x: 90, y: 48 },
      { position: 'FWD', x: 35, y: 18 },
      { position: 'FWD', x: 65, y: 18 },
    ],
  ),
  f(
    '3-4-3',
    'Wide forwards, three at the back.',
    { DEF: 3, MID: 4, FWD: 3 },
    [
      { position: 'DEF', x: 26, y: 74 },
      { position: 'DEF', x: 50, y: 78 },
      { position: 'DEF', x: 74, y: 74 },
      { position: 'MID', x: 18, y: 48 },
      { position: 'MID', x: 38, y: 50 },
      { position: 'MID', x: 62, y: 50 },
      { position: 'MID', x: 82, y: 48 },
      { position: 'FWD', x: 18, y: 18 },
      { position: 'FWD', x: 50, y: 16 },
      { position: 'FWD', x: 82, y: 18 },
    ],
  ),
  f(
    '5-3-2',
    'Solid back five, two up top.',
    { DEF: 5, MID: 3, FWD: 2 },
    [
      { position: 'DEF', x: 10, y: 74 },
      { position: 'DEF', x: 30, y: 72 },
      { position: 'DEF', x: 50, y: 76 },
      { position: 'DEF', x: 70, y: 72 },
      { position: 'DEF', x: 90, y: 74 },
      { position: 'MID', x: 28, y: 46 },
      { position: 'MID', x: 50, y: 48 },
      { position: 'MID', x: 72, y: 46 },
      { position: 'FWD', x: 35, y: 18 },
      { position: 'FWD', x: 65, y: 18 },
    ],
  ),
  f(
    '5-4-1',
    'Park the bus. One striker.',
    { DEF: 5, MID: 4, FWD: 1 },
    [
      { position: 'DEF', x: 10, y: 74 },
      { position: 'DEF', x: 30, y: 72 },
      { position: 'DEF', x: 50, y: 76 },
      { position: 'DEF', x: 70, y: 72 },
      { position: 'DEF', x: 90, y: 74 },
      { position: 'MID', x: 18, y: 46 },
      { position: 'MID', x: 38, y: 48 },
      { position: 'MID', x: 62, y: 48 },
      { position: 'MID', x: 82, y: 46 },
      { position: 'FWD', x: 50, y: 16 },
    ],
  ),
]

export const DEFAULT_FORMATION: FormationId = '4-3-3'

export function getFormation(id: FormationId | undefined): Formation {
  return FORMATIONS.find((item) => item.id === id) ?? FORMATIONS[0]!
}

export function slotsLine(formation: Formation): string {
  const s = formation.slots
  return `${s.GK} GK · ${s.DEF} DEF · ${s.MID} MID · ${s.FWD} FWD`
}

export function isFormationId(value: unknown): value is FormationId {
  return typeof value === 'string' && (FORMATION_IDS as readonly string[]).includes(value)
}
