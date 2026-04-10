/**
 * Device Selector Component
 * Allows user to select MIDI input device
 */

import React from 'react'
import { useStore } from '../store/useStore'

export const DeviceSelector: React.FC = () => {
  const midiDevices = useStore((state) => state.midiDevices)
  const selectedDeviceId = useStore((state) => state.selectedDeviceId)
  const setSelectedDeviceId = useStore((state) => state.setSelectedDeviceId)
  const deviceConnected = useStore((state) => state.deviceConnected)

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value || null)
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-2 text-dark-text">
        MIDI Device
      </label>
      <select
        value={selectedDeviceId || ''}
        onChange={handleDeviceChange}
        disabled={midiDevices.length === 0}
        className="w-full p-2 rounded bg-dark-bg border border-dark-grid text-dark-text disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">-- Select Device --</option>
        {midiDevices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name}
            {device.manufacturer && ` (${device.manufacturer})`}
          </option>
        ))}
      </select>
      {deviceConnected && (
        <p className="text-sm text-dark-accent mt-1">● Connected</p>
      )}
      {midiDevices.length === 0 && (
        <p className="text-sm text-dark-text mt-1 opacity-70">
          No MIDI devices detected. Connect your Pocket Scion and enable Raw Output Mode.
        </p>
      )}
    </div>
  )
}
