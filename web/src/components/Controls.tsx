/**
 * Controls Component
 * Data selection and display options
 */

import React from 'react'
import { useStore } from '../store/useStore'
import { exportToJSON, exportToCSV } from '../utils/exportUtils'

export const Controls: React.FC = () => {
  const showMean = useStore((state) => state.showMean)
  const showDeviation = useStore((state) => state.showDeviation)
  const autoScale = useStore((state) => state.autoScale)
  const capturePaused = useStore((state) => state.capturePaused)
  const meanData = useStore((state) => state.meanData)
  const deviationData = useStore((state) => state.deviationData)
  const midiDevices = useStore((state) => state.midiDevices)
  const selectedDeviceId = useStore((state) => state.selectedDeviceId)
  const deviceConnected = useStore((state) => state.deviceConnected)
  const setShowMean = useStore((state) => state.setShowMean)
  const setShowDeviation = useStore((state) => state.setShowDeviation)
  const setAutoScale = useStore((state) => state.setAutoScale)
  const setCapturePaused = useStore((state) => state.setCapturePaused)
  const clearData = useStore((state) => state.clearData)
  const setSelectedDeviceId = useStore((state) => state.setSelectedDeviceId)

  const handleExportJSON = () => {
    exportToJSON(meanData, deviationData)
  }

  const handleExportCSV = () => {
    exportToCSV(meanData, deviationData)
  }

  const handleSaveImage = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'pocket-scion-graph.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value || null)
  }

  return (
    <div className="bg-dark-panel rounded p-4 mb-4">
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <label className="text-dark-text font-bold">MIDI Device:</label>
          <select
            value={selectedDeviceId || ''}
            onChange={handleDeviceChange}
            disabled={midiDevices.length === 0}
            className="px-3 py-2 rounded bg-dark-bg border border-dark-grid text-dark-text disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span className="text-sm text-dark-accent">● Connected</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-dark-text font-bold">Data:</label>
          <label className="flex items-center gap-2 text-dark-text cursor-pointer">
            <input
              type="checkbox"
              checked={showMean}
              onChange={(e) => setShowMean(e.target.checked)}
              className="w-4 h-4"
            />
            Mean
          </label>
          <label className="flex items-center gap-2 text-dark-text cursor-pointer">
            <input
              type="checkbox"
              checked={showDeviation}
              onChange={(e) => setShowDeviation(e.target.checked)}
              className="w-4 h-4"
            />
            Deviation
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-dark-text font-bold">Options:</label>
          <label className="flex items-center gap-2 text-dark-text cursor-pointer">
            <input
              type="checkbox"
              checked={autoScale}
              onChange={(e) => setAutoScale(e.target.checked)}
              className="w-4 h-4"
            />
            Auto Scale
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCapturePaused(!capturePaused)}
            className={`px-4 py-2 text-white rounded transition-colors ${
              capturePaused 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {capturePaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={clearData}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSaveImage}
            disabled={meanData.length === 0 && deviationData.length === 0}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Image
          </button>
          <button
            onClick={handleExportJSON}
            disabled={meanData.length === 0 && deviationData.length === 0}
            className="px-4 py-2 bg-dark-accent text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            disabled={meanData.length === 0 && deviationData.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
