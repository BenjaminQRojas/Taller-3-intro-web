import { Scatter } from 'react-chartjs-2'
import { baseOptions } from './config'

type Point = { x: number; y: number }
type Props = { points: Point[]; label?: string; color?: string }

export default function ScatterChart({ points, label = 'Relación', color = '#6b8afd' }: Props) {
  const data = {
    datasets: [
      {
        label,
        data: points,
        backgroundColor: color,
      },
    ],
  }
  const opts = { ...baseOptions, scales: { x: { type: 'linear' }, y: { type: 'linear' } } }
  return <div className="h-64"><Scatter data={data} options={opts as any} /></div>
}
