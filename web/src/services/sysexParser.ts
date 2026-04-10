/**
 * Sysex Parser - Decodes MIDI sysex messages from Pocket Scion
 * Reference: https://github.com/ucodia/pocket-scion-osc
 */

export interface SysexMessage {
  data: Uint8Array
  timestamp: number
}

export interface BiofeedbackData {
  min: number
  max: number
  delta: number
  mean: number
  variance: number
  deviation: number
}

export interface ParsedSysex {
  data: BiofeedbackData
  timestamp: number
}

// Constants from pocket-scion-osc
const SYSEX_HEADER = [0x00, 0x16, 0x19, 0x19] // Manufacturer ID (0x0016) + Device ID (0x1919)
const SYSEX_LENGTH = 53

/**
 * Nibble view for decoding sysex data
 * Pocket Scion uses nibble-packed data
 */
class NibbleView {
  private data: number[]

  constructor(data: number[]) {
    this.data = data
  }

  /**
   * Extract unsigned integer from nibbles
   */
  uint(offset: number, count: number): number {
    let value = 0
    for (let i = 0; i < count; i++) {
      value += this.data[offset + i] << (4 * i)
    }
    return value
  }

  /**
   * Extract 32-bit float from nibbles
   */
  float32(offset: number, pad: number[] = []): number {
    const nibs = [...this.data.slice(offset, offset + 8 - pad.length), ...pad]
    const bytes = []
    for (let i = 0; i < 8; i += 2) {
      bytes.push(nibs[i] | (nibs[i + 1] << 4))
    }
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    for (let i = 0; i < 4; i++) {
      view.setUint8(i, bytes[i])
    }
    return view.getFloat32(0, true) // Little-endian
  }
}

/**
 * Parse MIDI sysex message from Pocket Scion
 * Based on pocket-scion-osc implementation
 */
export function parseSysex(sysexData: Uint8Array, timestamp: number): ParsedSysex | null {
  // Validate sysex message
  if (sysexData.length < 2 || sysexData[0] !== 0xF0 || sysexData[sysexData.length - 1] !== 0xF7) {
    console.warn('Invalid sysex message format')
    return null
  }

  // Extract data payload (strip start/end bytes)
  const payload = Array.from(sysexData.slice(1, -1))
  
  // Validate length and header
  if (payload.length !== SYSEX_LENGTH) {
    console.warn(`Invalid sysex length: expected ${SYSEX_LENGTH}, got ${payload.length}`)
    return null
  }

  const header = payload.slice(0, 4)
  if (header[0] !== SYSEX_HEADER[0] || header[1] !== SYSEX_HEADER[1] ||
      header[2] !== SYSEX_HEADER[2] || header[3] !== SYSEX_HEADER[3]) {
    console.warn('Invalid sysex header:', header)
    return null
  }

  // Decode using nibble view
  const n = new NibbleView(payload)

  const data: BiofeedbackData = {
    min: n.uint(5, 3) / 1000,
    max: n.uint(13, 4) / 1000,
    delta: n.uint(21, 4) / 1000,
    mean: n.float32(29) / 1000,
    variance: n.float32(37) / 1_000_000,
    deviation: n.float32(45, [4]) / 1000,
  }

  return { data, timestamp }
}

/**
 * Check if sysex message is from Pocket Scion
 */
export function isPocketScionSysex(sysexData: Uint8Array): boolean {
  if (sysexData.length < 2 || sysexData[0] !== 0xF0 || sysexData[sysexData.length - 1] !== 0xF7) {
    return false
  }

  const payload = sysexData.slice(1, -1)
  if (payload.length < 4) {
    return false
  }

  // Check header
  return payload[0] === SYSEX_HEADER[0] && 
         payload[1] === SYSEX_HEADER[1] &&
         payload[2] === SYSEX_HEADER[2] && 
         payload[3] === SYSEX_HEADER[3]
}
