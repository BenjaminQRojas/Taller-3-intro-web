import { Radar } from 'react-chartjs-2'
import { baseOptions } from './config'

type Props = { labels: string[]; data: number[]; label?: string; color?: string }

export default function RadarChart({ labels, data: values, label = 'Comparativa', color = 'rgba(107,138,253,0.5)' }: Props) {
  // Compute a sensible suggested max to avoid cramped center
  const maxVal = Math.max(...values, 0)
  const suggestedMax = maxVal > 0 ? Math.ceil(maxVal * 1.1) : 1

  const data = {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: color,
        borderColor: '#6b8afd',
        pointBackgroundColor: '#6b8afd',
        pointBorderColor: '#6b8afd',
        pointRadius: 3,
      },
    ],
  }
  const opts = {
    ...baseOptions,
    plugins: { ...baseOptions.plugins, legend: { display: true, position: 'top' as const } },
    layout: { padding: 16 },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax,
        ticks: {
          backdropPadding: 4,
          font: { size: 10 },
          // Format large numbers with thousands separators
          callback: (value: unknown) => {
            const n = typeof value === 'number' ? value : Number(value)
            return isNaN(n) ? String(value) : n.toLocaleString()
          },
        },
        angleLines: { color: 'rgba(0,0,0,0.1)' },
        grid: { color: 'rgba(0,0,0,0.1)' },
      },
    },
  }
  return <div className="h-64"><Radar data={data} options={opts as any} /></div>
}
