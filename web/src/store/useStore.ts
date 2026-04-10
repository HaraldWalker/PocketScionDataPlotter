/**
 * Zustand store for application state management
 */

import { create } from 'zustand'
import type { AppState, DataPoint } from './types'

interface AppStore extends AppState {
  // Actions
  setMidiInitialized: (initialized: boolean) => void
  setMidiDevices: (devices: any[]) => void
  setSelectedDeviceId: (deviceId: string | null) => void
  setDeviceConnected: (connected: boolean) => void
  addMeanData: (point: DataPoint) => void
  addDeviationData: (point: DataPoint) => void
  clearData: () => void
  setShowMean: (show: boolean) => void
  setShowDeviation: (show: boolean) => void
  setAutoScale: (auto: boolean) => void
  setCapturePaused: (paused: boolean) => void
  setSignalOk: (ok: boolean) => void
  setLastRxTime: (time: number) => void
}

const MAX_DATA_POINTS = 20000

export const useStore = create<AppStore>((set) => ({
  // Initial state
  midiInitialized: false,
  midiDevices: [],
  selectedDeviceId: null,
  deviceConnected: false,
  meanData: [],
  deviationData: [],
  showMean: true,
  showDeviation: true,
  autoScale: true,
  capturePaused: false,
  signalOk: false,
  lastRxTime: 0,

  // Actions
  setMidiInitialized: (initialized) => set({ midiInitialized: initialized }),
  
  setMidiDevices: (devices) => set({ midiDevices: devices }),
  
  setSelectedDeviceId: (deviceId) => set({ selectedDeviceId: deviceId }),
  
  setDeviceConnected: (connected) => set({ deviceConnected: connected }),
  
  addMeanData: (point) => set((state) => ({
    meanData: [...state.meanData, point].slice(-MAX_DATA_POINTS)
  })),
  
  addDeviationData: (point) => set((state) => ({
    deviationData: [...state.deviationData, point].slice(-MAX_DATA_POINTS)
  })),
  
  clearData: () => set({ meanData: [], deviationData: [] }),
  
  setShowMean: (show) => set({ showMean: show }),
  
  setShowDeviation: (show) => set({ showDeviation: show }),
  
  setAutoScale: (auto) => set({ autoScale: auto }),
  
  setCapturePaused: (paused) => set({ capturePaused: paused }),
  
  setSignalOk: (ok) => set({ signalOk: ok }),
  
  setLastRxTime: (time) => set({ lastRxTime: time }),
}))
