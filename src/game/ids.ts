/**
 * Tiny unique ids for players, clubs, and fixtures.
 * Owns id strings only — not the objects they label.
 */
export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function hashToIndex(id: string, modulo: number): number {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  }
  return modulo === 0 ? 0 : h % modulo
}
