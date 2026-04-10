/**
 * Plot View Component
 * Real-time plotting using Chart.js
 */

import React, { useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useStore } from '../store/useStore'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export const PlotView: React.FC = () => {
  const meanData = useStore((state) => state.meanData)
  const deviationData = useStore((state) => state.deviationData)
  const showMean = useStore((state) => state.showMean)
  const showDeviation = useStore((state) => state.showDeviation)
  const autoScale = useStore((state) => state.autoScale)

  const chartRef = useRef<ChartJS<'line'>>(null)

  // Prepare data for Chart.js
  const datasets = []

  if (showMean && meanData.length > 0) {
    const sortedMean = [...meanData].sort((a, b) => a.timestamp - b.timestamp)
    datasets.push({
      label: 'Mean',
      data: sortedMean.map((point) => ({ x: point.timestamp, y: point.value })),
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      fill: false,
    })
  }

  if (showDeviation && deviationData.length > 0) {
    const sortedDeviation = [...deviationData].sort((a, b) => a.timestamp - b.timestamp)
    datasets.push({
      label: 'Deviation',
      data: sortedDeviation.map((point) => ({ x: point.timestamp, y: point.value })),
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      fill: false,
    })
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    scales: {
      x: {
        type: 'linear',
        display: true,
        min: 0,
        title: {
          display: true,
          text: 'Time (seconds)',
          color: '#E0E0E0',
        },
        ticks: {
          color: '#E0E0E0',
        },
        grid: {
          color: '#555555',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Resistance (MΩ)',
          color: '#E0E0E0',
        },
        ticks: {
          color: '#E0E0E0',
        },
        grid: {
          color: '#555555',
        },
        ...(autoScale ? {} : { min: 0 }),
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#E0E0E0',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  }

  const data = {
    datasets,
  }

  return (
    <div className="bg-dark-bg rounded p-4" style={{ minHeight: '400px' }}>
      {datasets.length > 0 ? (
        <Line ref={chartRef} data={data} options={options} />
      ) : (
        <div className="flex items-center justify-center h-96 text-dark-text opacity-70">
          <p>No data to display. Select a MIDI device and enable data streams.</p>
        </div>
      )}
    </div>
  )
}
