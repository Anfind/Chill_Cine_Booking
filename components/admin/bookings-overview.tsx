"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Users, TrendingUp, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { RevenueChart } from "./revenue-chart"
import { BookingsChart } from "./bookings-chart"
import { OccupancyChart } from "./occupancy-chart"

interface AdminStats {
  stats: {
    totalBookings: { value: number; change: number }
    revenue: { value: number; change: number }
    customers: { value: number; change: number }
    occupancyRate: { value: number; change: number }
  }
  recentBookings: Array<{
    _id: string
    bookingCode: string
    room: string
    roomCode: string
    branch: string
    customer: string
    startTime: string
    endTime: string
    total: number
    status: string
    paymentStatus: string
    createdAt: string
  }>
  dailyRevenue: Array<{ _id: string; revenue: number; count: number }>
  hourlyBookings: Array<{ _id: number; count: number; revenue: number }>
  occupancyTrend: Array<{ date: string; bookedHours: number; occupancy: number }>
}

export function BookingsOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/stats')
      const data = await res.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Không thể tải thống kê')
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error || 'Không có dữ liệu'}</p>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    return `${(value / 1000).toFixed(0)}K`
  }

  const statsCards = [
    {
      title: "Tổng đặt phòng",
      value: stats.stats.totalBookings.value.toString(),
      change: stats.stats.totalBookings.change,
      icon: Calendar,
      description: "So với tháng trước",
    },
    {
      title: "Doanh thu",
      value: formatCurrency(stats.stats.revenue.value),
      change: stats.stats.revenue.change,
      icon: DollarSign,
      description: "VNĐ trong tháng này",
    },
    {
      title: "Khách hàng",
      value: stats.stats.customers.value.toString(),
      change: stats.stats.customers.change,
      icon: Users,
      description: "Khách hàng unique",
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: `${stats.stats.occupancyRate.value}%`,
      change: stats.stats.occupancyRate.change,
      icon: TrendingUp,
      description: "Trung bình các phòng",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Chờ xác nhận", variant: "outline" },
      confirmed: { label: "Đã xác nhận", variant: "default" },
      'checked-in': { label: "Đang sử dụng", variant: "secondary" },
      'checked-out': { label: "Đã trả phòng", variant: "secondary" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
    }
    const config = variants[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      unpaid: { label: "Chưa thanh toán", variant: "outline" },
      paid: { label: "Đã thanh toán", variant: "default" },
      refunded: { label: "Đã hoàn tiền", variant: "secondary" },
    }
    const config = variants[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tổng quan</h2>
        <p className="text-muted-foreground">Thống kê và báo cáo hệ thống đặt phòng</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>{" "}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={stats.dailyRevenue || []} />
        <BookingsChart data={stats.hourlyBookings || []} />
      </div>

      <div className="grid gap-6">
        <OccupancyChart data={stats.occupancyTrend || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đặt phòng gần đây</CardTitle>
          <CardDescription>Danh sách {stats.recentBookings.length} đặt phòng mới nhất trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có booking nào</p>
          ) : (
            <div className="space-y-4">
              {stats.recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">
                      {booking.roomCode} - {booking.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.startTime), 'dd/MM/yyyy • HH:mm', { locale: vi })} - 
                      {format(new Date(booking.endTime), 'HH:mm', { locale: vi })}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.branch}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total)}
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.paymentStatus)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
