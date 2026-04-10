import { useEffect, useRef } from 'react'
import { Controls } from './components/Controls'
import { PlotView } from './components/PlotView'
import { StatusBar } from './components/StatusBar'
import { midiService } from './services/midiService'
import { useStore } from './store/useStore'
import { parseSysex } from './services/sysexParser'
import type { MIDIDevice } from './services/midiService'
import type { SysexMessage } from './services/sysexParser'

function App() {
  const setMidiInitialized = useStore((state) => state.setMidiInitialized)
  const setMidiDevices = useStore((state) => state.setMidiDevices)
  const setDeviceConnected = useStore((state) => state.setDeviceConnected)
  const setSignalOk = useStore((state) => state.setSignalOk)
  const setLastRxTime = useStore((state) => state.setLastRxTime)
  const selectedDeviceId = useStore((state) => state.selectedDeviceId)
  const addMeanData = useStore((state) => state.addMeanData)
  const addDeviationData = useStore((state) => state.addDeviationData)

  const timeOffsetRef = useRef<number | null>(null)

  // Check Web MIDI API support
  const isMidiSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator

  // Initialize MIDI service on mount
  useEffect(() => {
    if (!isMidiSupported) {
      return
    }

    const initMIDI = async () => {
      const success = await midiService.initialize()
      setMidiInitialized(success)
      
      // Register sysex callback after MIDI is initialized
      const unsubscribe = midiService.onSysex((message: SysexMessage) => {
        // Use current time as timestamp since message.timestamp is undefined
        const now = Date.now()
        
        // Parse sysex data
        const parsed = parseSysex(message.data, now)
        if (parsed) {
          // Set time offset on first message
          if (timeOffsetRef.current === null) {
            timeOffsetRef.current = now
          }

          // Calculate relative time (always positive, starting from 0)
          const relativeTime = timeOffsetRef.current !== null 
            ? (now - timeOffsetRef.current) / 1000 
            : 0

          // Get current show settings from store to respect user's selection
          const { showMean: currentShowMean, showDeviation: currentShowDeviation } = useStore.getState()

          // Only collect data for selected data types
          if (currentShowMean) {
            addMeanData({ timestamp: relativeTime, value: parsed.data.mean })
          }
          if (currentShowDeviation) {
            addDeviationData({ timestamp: relativeTime, value: parsed.data.deviation })
          }
        }

        // Update signal status
        setSignalOk(true)
        setLastRxTime(Date.now())
      })
      
      // Store unsubscribe function for cleanup
      return unsubscribe
    }

    const unsubscribePromise = initMIDI()

    // Cleanup on unmount
    return () => {
      midiService.shutdown()
      unsubscribePromise.then(unsubscribe => unsubscribe?.())
    }
  }, [])

  // Listen for device changes
  useEffect(() => {
    const unsubscribe = midiService.onDeviceChange((devices: MIDIDevice[]) => {
      setMidiDevices(devices)
    })

    // Manually trigger a device scan after callback registration
    // to ensure initial devices are captured
    setTimeout(() => {
      const devices = midiService.getInputDevices()
      setMidiDevices(devices)
    }, 100)

    return () => unsubscribe()
  }, [setMidiDevices])

  // Handle device selection
  useEffect(() => {
    const connectToDevice = async () => {
      if (selectedDeviceId) {
        const success = await midiService.openInput(selectedDeviceId)
        setDeviceConnected(success)
      } else {
        await midiService.closeAllInputs()
        setDeviceConnected(false)
      }
    }

    connectToDevice()
  }, [selectedDeviceId, setDeviceConnected])

  // Check signal timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const lastRxTime = useStore.getState().lastRxTime
      const signalOk = Date.now() - lastRxTime < 3000
      setSignalOk(signalOk)
    }, 1000)

    return () => clearInterval(interval)
  }, [setSignalOk])

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-dark-accent mb-6">
          Pocket Scion Data Plotter
        </h1>

        {!isMidiSupported && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            <p className="font-bold">Web MIDI API Not Supported</p>
            <p className="text-sm mt-1">
              Your browser does not support the Web MIDI API. This application requires a desktop browser 
              such as Chrome, Edge, or Firefox. iOS Safari and mobile browsers are not supported.
            </p>
          </div>
        )}

        {isMidiSupported && <Controls />}

        <PlotView />

        <StatusBar />
      </div>
    </div>
  )
}

export default App
