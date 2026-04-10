/**
 * TypeScript types for the application
 */

import type { MIDIDevice } from '../services/midiService'

export interface DataPoint {
  timestamp: number
  value: number
}

export interface AppState {
  // MIDI state
  midiInitialized: boolean
  midiDevices: MIDIDevice[]
  selectedDeviceId: string | null
  deviceConnected: boolean
  
  // Data state
  meanData: DataPoint[]
  deviationData: DataPoint[]
  
  // UI state
  showMean: boolean
  showDeviation: boolean
  autoScale: boolean
  
  // Signal state
  signalOk: boolean
  lastRxTime: number
}
