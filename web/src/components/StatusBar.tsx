/**
 * Status Bar Component
 * Displays connection status and current values
 */

import React from 'react'
import { useStore } from '../store/useStore'

export const StatusBar: React.FC = () => {
  const signalOk = useStore((state) => state.signalOk)
  const meanData = useStore((state) => state.meanData)
  const deviationData = useStore((state) => state.deviationData)

  const latestMean = meanData.length > 0 ? meanData[meanData.length - 1].value : null
  const latestDev = deviationData.length > 0 ? deviationData[deviationData.length - 1].value : null

  return (
    <div className="bg-dark-panel rounded p-4 mt-6 flex justify-between items-center">
      <div className="text-dark-text">
        {latestMean !== null && (
          <span className="mr-4">Mean: {latestMean.toFixed(3)} MΩ</span>
        )}
        {latestDev !== null && (
          <span className="mr-4">Deviation: {latestDev.toFixed(3)} MΩ</span>
        )}
        <span className="opacity-70">
          Samples: {meanData.length} mean, {deviationData.length} deviation
        </span>
      </div>
      <div className={`font-bold ${signalOk ? 'text-dark-accent' : 'text-red-500'}`}>
        ● {signalOk ? 'Signal OK' : 'No Signal'}
      </div>
    </div>
  )
}
