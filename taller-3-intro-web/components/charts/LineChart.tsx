import { Line } from 'react-chartjs-2'
import { baseOptions } from './config'

type Props = { labels: string[]; datasets: { label: string; data: number[]; borderColor?: string }[] }

export default function LineChart({ labels, datasets }: Props) {
  const data = { labels, datasets }
  return <div className="h-48 sm:h-64"><Line data={data} options={baseOptions as any} /></div>
}
