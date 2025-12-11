import { Bar } from 'react-chartjs-2'
import { baseOptions } from './config'

type Props = { labels: string[]; datasets: { label: string; data: number[]; backgroundColor?: string }[] }

export default function BarChart({ labels, datasets }: Props) {
  const data = { labels, datasets }
  return <div className="h-48 sm:h-64"><Bar data={data} options={baseOptions as any} /></div>
}
