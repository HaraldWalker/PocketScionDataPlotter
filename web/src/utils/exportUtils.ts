/**
 * Export utilities for data export
 */

import type { DataPoint } from '../store/types'

/**
 * Export data to JSON format
 */
export function exportToJSON(meanData: DataPoint[], deviationData: DataPoint[]): void {
  const data = {
    timestamp: new Date().toISOString(),
    meanData: meanData,
    deviationData: deviationData,
    units: 'Resistance (MΩ)',
    timeUnits: 'seconds',
  }

  const jsonString = JSON.stringify(data, null, 2)
  downloadFile(jsonString, `scion_data_${getTimestamp()}.json`, 'application/json')
}

/**
 * Export data to CSV format
 */
export function exportToCSV(meanData: DataPoint[], deviationData: DataPoint[]): void {
  let csv = 'Time (s),Mean (MΩ),Deviation (MΩ)\n'

  // Find max length to align data
  const maxLength = Math.max(meanData.length, deviationData.length)

  for (let i = 0; i < maxLength; i++) {
    const time = meanData[i]?.timestamp ?? deviationData[i]?.timestamp ?? ''
    const mean = meanData[i]?.value ?? ''
    const deviation = deviationData[i]?.value ?? ''
    csv += `${time},${mean},${deviation}\n`
  }

  downloadFile(csv, `scion_data_${getTimestamp()}.csv`, 'text/csv')
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Get timestamp string for filename
 */
function getTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
}
