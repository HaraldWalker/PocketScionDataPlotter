/**
 * Resistance Calculator - 555 Timer calculations
 * Based on the Python implementation
 */

// 555 Timer constants
const K_555 = 0.693
const C_555 = 4.3e-9 // 4.3 nF
const RA_555 = 100_000 // 100 kΩ

/**
 * Convert edge value to milliseconds
 * If value > 1000, divide by 1000 (assumes microseconds)
 * Otherwise, use as-is (assumes milliseconds)
 */
export function edgeToMs(v: number): number {
  const value = parseFloat(v.toString())
  return value > 1000 ? value / 1000.0 : value
}

/**
 * Convert period to mega-ohms resistance
 * Based on 555 timer formula: T = K * C * (RA + 2*RB)
 * Solving for RB: RB = (T / (K * C) - RA) / 2
 */
export function periodToMohm(T_ms: number): number | null {
  const T_s = T_ms / 1000.0
  
  if (T_s <= 0) {
    return null
  }
  
  const RB = (T_s / (K_555 * C_555) - RA_555) / 2.0
  return Math.max(RB, 0.0) / 1e6 // Convert to mega-ohms
}

/**
 * Calculate resistance from a single edge value
 * This is used for deviation calculations
 */
export function edgeToMohm(edge_ms: number): number | null {
  const period_ms = edge_ms * 2 // Approximate deviation as half-period
  return periodToMohm(period_ms)
}

/**
 * Calculate resistance from two consecutive edge values (mean)
 */
export function edgesToMohm(edge1_ms: number, edge2_ms: number): number | null {
  const period_ms = edge1_ms + edge2_ms
  return periodToMohm(period_ms)
}
