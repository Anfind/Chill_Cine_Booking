'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Activity } from 'lucide-react'

interface OccupancyData {
  date: string
  bookedHours: number
  occupancy: number
}

interface OccupancyChartProps {
  data: OccupancyData[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), 'dd/MM', { locale: vi }),
    fullDate: format(parseISO(item.date), 'dd MMM yyyy', { locale: vi }),
    occupancy: item.occupancy,
    bookedHours: item.bookedHours,
  }))

  // Calculate average occupancy
  const avgOccupancy =
    data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.occupancy, 0) / data.length) : 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.fullDate}</p>
          <div className="space-y-1">
            <p className="text-sm text-primary font-medium">Lấp đầy: {payload[0].value}%</p>
            <p className="text-sm text-muted-foreground">Giờ đã đặt: {payload[0].payload.bookedHours}h</p>
          </div>
        </div>
      )
    }
    return null
  }

  const getOccupancyColor = () => {
    if (avgOccupancy >= 80) return 'text-green-500'
    if (avgOccupancy >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getOccupancyLabel = () => {
    if (avgOccupancy >= 80) return 'Tốt'
    if (avgOccupancy >= 50) return 'Trung bình'
    return 'Thấp'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tỷ lệ lấp đầy 7 ngày</CardTitle>
            <CardDescription>Phần trăm giờ đã đặt / tổng giờ có thể đặt</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border">
            <Activity className={`h-4 w-4 ${getOccupancyColor()}`} />
            <div className="text-sm">
              <span className={`font-semibold ${getOccupancyColor()}`}>{avgOccupancy}%</span>
              <span className="text-muted-foreground ml-1">{getOccupancyLabel()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chưa có dữ liệu lấp đầy
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
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
                tickFormatter={(value: number) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#occupancyGradient)"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-muted-foreground">Tốt</p>
            <p className="text-sm font-semibold text-green-500">≥80%</p>
          </div>
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-muted-foreground">Trung bình</p>
            <p className="text-sm font-semibold text-yellow-500">50-79%</p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-muted-foreground">Thấp</p>
            <p className="text-sm font-semibold text-red-500">&lt;50%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
