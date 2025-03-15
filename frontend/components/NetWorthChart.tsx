'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import axios from 'axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) => `$${value.toLocaleString()}`,
      },
    },
  },
}

export default function NetWorthChart() {
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/net-worth/history')
        const data = response.data

        setChartData({
          labels: data.map((item: any) => new Date(item.date).toLocaleDateString()),
          datasets: [
            {
              label: 'Net Worth',
              data: data.map((item: any) => item.value),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.3,
            },
          ],
        })
      } catch (error) {
        console.error('Error fetching net worth data:', error)
        // Use sample data for demonstration
        const sampleData = generateSampleData()
        setChartData({
          labels: sampleData.map(item => item.date),
          datasets: [
            {
              label: 'Net Worth',
              data: sampleData.map(item => item.value),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.3,
            },
          ],
        })
      }
    }

    fetchData()
  }, [])

  return (
    <div className="h-[400px] w-full">
      <Line options={options} data={chartData} />
    </div>
  )
}

// Helper function to generate sample data
function generateSampleData() {
  const data = []
  const startDate = new Date('2023-01-01')
  let value = 100000

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)
    
    // Add some random variation
    value = value * (1 + (Math.random() * 0.1 - 0.05))
    
    data.push({
      date: date.toLocaleDateString(),
      value: Math.round(value),
    })
  }

  return data
} 