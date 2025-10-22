'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface DailyRevenueData {
  _id: string
  revenue: number
  count: number
}

interface RevenueChartProps {
  data: DailyRevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    date: format(parseISO(item._id), 'dd/MM', { locale: vi }),
    fullDate: format(parseISO(item._id), 'dd MMM yyyy', { locale: vi }),
    revenue: item.revenue,
    bookings: item.count,
  }))

  // Calculate trend
  const firstRevenue = data[0]?.revenue || 0
  const lastRevenue = data[data.length - 1]?.revenue || 0
  const trend = lastRevenue >= firstRevenue ? 'up' : 'down'
  const trendPercentage =
    firstRevenue > 0 ? Math.abs(Math.round(((lastRevenue - firstRevenue) / firstRevenue) * 100)) : 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.fullDate}</p>
          <div className="space-y-1">
            <p className="text-sm text-primary font-medium">
              Doanh thu: {payload[0].value.toLocaleString('vi-VN')}₫
            </p>
            <p className="text-sm text-muted-foreground">Bookings: {payload[0].payload.bookings}</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Doanh thu 7 ngày gần nhất</CardTitle>
            <CardDescription>Theo ngày đặt phòng (chỉ tính bookings đã thanh toán)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendPercentage}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chưa có dữ liệu doanh thu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                fill="url(#revenueGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
