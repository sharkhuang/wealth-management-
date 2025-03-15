'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts'
import { format } from 'date-fns'
import api from '@/app/api'
import toast from 'react-hot-toast'

interface NetWorthData {
  date: string
  net_worth: number
}

interface ApiResponse {
  date: string;
  value: number;
}

interface Highlights {
  current: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
}

interface Props {
  onHighlightsChange?: (highlights: Highlights | null) => void;
}

export default function NetWorthChart({ onHighlightsChange }: Props) {
  const [data, setData] = useState<NetWorthData[]>([])
  const [loading, setLoading] = useState(true)

  // Theme colors
  const colors = {
    primary: '#818CF8',    // Indigo-400
    secondary: '#C084FC',  // Purple-400
    gradient: {
      from: '#818CF8',     // Indigo-400
      to: '#C084FC',       // Purple-400
    },
    success: '#34D399',    // Emerald-400
    error: '#F87171',      // Red-400
    text: {
      primary: '#F8FAFC',   // Slate-50
      secondary: '#CBD5E1', // Slate-300
    },
    background: {
      card: '#1E293B',     // Slate-800
      highlight: '#0F172A', // Slate-900
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('net-worth/history')
        const formattedData = response.data.map((item: ApiResponse) => ({
          date: item.date,
          net_worth: Number(item.value)
        }))
        setData(formattedData)
        
        // Calculate and send highlights
        if (formattedData.length > 0) {
          const highlights = getHighlights(formattedData)
          onHighlightsChange?.(highlights)
        } else {
          onHighlightsChange?.(null)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        toast.error('Failed to fetch net worth history')
        setData([])
        onHighlightsChange?.(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [onHighlightsChange])

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM yyyy')
    } catch (err) {
      return 'Invalid Date'
    }
  }

  const getHighlights = (data: NetWorthData[]) => {
    if (!data.length) return null;

    const latest = data[data.length - 1];
    const first = data[0];
    const change = latest.net_worth - first.net_worth;
    const percentChange = ((change / first.net_worth) * 100).toFixed(1);
    const isPositive = change >= 0;

    return {
      current: formatCurrency(latest.net_worth),
      change: formatCurrency(Math.abs(change)),
      percentChange: `${isPositive ? '+' : '-'}${percentChange}%`,
      isPositive
    };
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="text-lg font-medium text-slate-300">Loading...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="text-lg font-medium text-slate-300">No data available</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] h-[600px] bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl shadow-indigo-500/10">
      <div className="h-full p-8 relative">
        <div className="absolute -top-1 left-8 text-sm font-medium text-slate-400">
          Net Worth History
        </div>
        <LineChart 
          width={1100}
          height={500}
          data={data}
          margin={{ top: 24, right: 40, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.gradient.from} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.gradient.to} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(203, 213, 225, 0.1)" 
            vertical={false} 
          />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke={colors.text.secondary}
            tick={{ fill: colors.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: 'rgba(203, 213, 225, 0.2)' }}
            dy={10}
            tickMargin={10}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            stroke={colors.text.secondary}
            tick={{ fill: colors.text.secondary, fontSize: 12 }}
            width={80}
            axisLine={{ stroke: 'rgba(203, 213, 225, 0.2)' }}
            dx={-10}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={formatDate}
            contentStyle={{ 
              backgroundColor: colors.background.card,
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
              color: colors.text.primary
            }}
            cursor={{ stroke: colors.gradient.from, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="net_worth"
            stroke="url(#colorNet)"
            fill="url(#colorNet)"
            fillOpacity={1}
          />
          <Line 
            type="monotone"
            dataKey="net_worth"
            stroke={colors.primary}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors.primary, strokeWidth: 2, stroke: colors.background.card }}
            activeDot={{ 
              r: 6, 
              fill: colors.primary, 
              strokeWidth: 2, 
              stroke: colors.background.card
            }}
          />
        </LineChart>
      </div>
    </div>
  )
}
