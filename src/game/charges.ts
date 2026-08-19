/**
 * Match charge recharge (2.5 minutes, store up to 3).
 * Owns toilet-session pacing; UI only displays what this returns.
 */
import type { GameState } from '../types/game.ts'
import { CHARGE_MS, MAX_CHARGES } from './constants.ts'

export function applyRecharge(state: GameState, now: number): GameState {
  let { charges, nextChargeAt } = state
  if (charges >= MAX_CHARGES) {
    if (nextChargeAt === 0) return state
    return { ...state, charges: MAX_CHARGES, nextChargeAt: 0 }
  }
  if (!nextChargeAt) {
    return { ...state, nextChargeAt: now + CHARGE_MS }
  }
  let next = nextChargeAt
  let c = charges
  while (c < MAX_CHARGES && now >= next) {
    c += 1
    next += CHARGE_MS
  }
  if (c >= MAX_CHARGES) {
    c = MAX_CHARGES
    next = 0
  }
  if (c === charges && next === nextChargeAt) return state
  return { ...state, charges: c, nextChargeAt: next }
}

export function spendCharge(state: GameState, now: number): GameState {
  const charged = applyRecharge(state, now)
  if (charged.charges < 1) return charged
  const charges = charged.charges - 1
  const nextChargeAt = charged.nextChargeAt || now + CHARGE_MS
  return { ...charged, charges, nextChargeAt: charges >= MAX_CHARGES ? 0 : nextChargeAt }
}

export function msUntilNextCharge(state: GameState, now: number): number {
  const live = applyRecharge(state, now)
  if (live.charges >= MAX_CHARGES || !live.nextChargeAt) return 0
  return Math.max(0, live.nextChargeAt - now)
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
