'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Clock } from 'lucide-react'

interface HourlyBookingData {
  _id: number
  count: number
  revenue: number
}

interface BookingsChartProps {
  data: HourlyBookingData[]
}

export function BookingsChart({ data }: BookingsChartProps) {
  // Create full 24-hour data (fill missing hours with 0)
  const fullHourData = Array.from({ length: 24 }, (_, i) => {
    const hourData = data.find((item) => item._id === i)
    return {
      hour: i,
      hourLabel: `${i.toString().padStart(2, '0')}:00`,
      count: hourData?.count || 0,
      revenue: hourData?.revenue || 0,
    }
  })

  // Find peak hour
  const peakHour = fullHourData.reduce((max, item) => (item.count > max.count ? item : max), fullHourData[0])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.hourLabel}</p>
          <div className="space-y-1">
            <p className="text-sm text-primary font-medium">Bookings: {payload[0].value}</p>
            <p className="text-sm text-muted-foreground">
              Doanh thu: {payload[0].payload.revenue.toLocaleString('vi-VN')}₫
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const getBarColor = (hour: number, count: number) => {
    if (count === 0) return 'hsl(var(--muted))'
    if (hour === peakHour.hour) return 'hsl(var(--chart-1))' // Peak hour - bright
    if (hour >= 18 && hour <= 23) return 'hsl(var(--chart-2))' // Evening - popular
    if (hour >= 12 && hour <= 17) return 'hsl(var(--chart-3))' // Afternoon
    return 'hsl(var(--chart-4))' // Morning/night
  }

  const totalBookingsToday = fullHourData.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bookings theo giờ - Hôm nay</CardTitle>
            <CardDescription>Phân bố số lượng đặt phòng trong 24 giờ</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Clock className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <span className="font-semibold text-primary">{peakHour.hourLabel}</span>
              <span className="text-muted-foreground ml-1">Peak</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalBookingsToday === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chưa có bookings hôm nay
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fullHourData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="hour"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                interval={2}
                tickFormatter={(value: number) => `${value}h`}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={40}>
                {fullHourData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.hour, entry.count)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <span>Peak giờ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span>Tối (18-23h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
            <span>Chiều (12-17h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
            <span>Sáng/Đêm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
