/**
 * Cash display and transfer-fee math.
 * Owns formatting and price formulas so screens stay dumb.
 */
import { SELL_BACK_RATE, TRANSFER_FEE_FACTOR, WAGE_PER_OVERALL } from './constants.ts'
import type { Player } from '../types/game.ts'

export function formatMoney(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const n = Math.abs(Math.round(amount))
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    const text = m >= 10 ? m.toFixed(0) : m.toFixed(1)
    return `${sign}$${text}M`
  }
  return `${sign}$${n.toLocaleString('en-US')}`
}

export function wageForOverall(overall: number): number {
  return overall * WAGE_PER_OVERALL
}

export function transferFee(player: Player): number {
  return player.overall * TRANSFER_FEE_FACTOR
}

export function sellFee(player: Player): number {
  return Math.round(transferFee(player) * SELL_BACK_RATE)
}
