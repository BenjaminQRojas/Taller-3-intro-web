import { Doughnut } from 'react-chartjs-2'
import { baseOptions } from './config'

type Props = { labels: string[]; data: number[]; colors?: string[]; label?: string }

export default function DoughnutChart({ labels, data: values, colors, label = 'Distribución' }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: colors || ['#6b8afd', '#7bdff2', '#f4e04d', '#f25f5c', '#70e000', '#9b5de5'],
      },
    ],
  }
  return <div className="h-64"><Doughnut data={data} options={{ ...baseOptions, scales: {} } as any} /></div>
}
