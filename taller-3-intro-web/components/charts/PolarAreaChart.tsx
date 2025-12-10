import { PolarArea } from 'react-chartjs-2'
import { baseOptions } from './config'

type Props = { labels: string[]; data: number[]; label?: string; colors?: string[] }

export default function PolarAreaChart({ labels, data: values, label = 'Distribución', colors }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor:
          colors || ['#6b8afd66', '#7bdff266', '#f4e04d66', '#f25f5c66', '#70e00066', '#9b5de566'],
        borderColor: ['#6b8afd', '#7bdff2', '#f4e04d', '#f25f5c', '#70e000', '#9b5de5'],
        borderWidth: 1,
      },
    ],
  }

  const opts = {
    ...baseOptions,
    plugins: { ...baseOptions.plugins, legend: { display: true, position: 'top' as const } },
    scales: {
      r: {
        ticks: {
          font: { size: 10 },
          callback: (value: unknown) => {
            const n = typeof value === 'number' ? value : Number(value)
            return isNaN(n) ? String(value) : n.toLocaleString()
          },
        },
      },
    },
  }

  return <div className="h-64"><PolarArea data={data} options={opts as any} /></div>
}
