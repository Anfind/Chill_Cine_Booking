"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react"

export function BookingsOverview() {
  // Mock statistics
  const stats = [
    {
      title: "Tổng đặt phòng",
      value: "156",
      change: "+12%",
      icon: Calendar,
      description: "So với tháng trước",
    },
    {
      title: "Doanh thu",
      value: "45.2M",
      change: "+8%",
      icon: DollarSign,
      description: "VNĐ trong tháng này",
    },
    {
      title: "Khách hàng",
      value: "89",
      change: "+15%",
      icon: Users,
      description: "Khách hàng mới",
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: "78%",
      change: "+5%",
      icon: TrendingUp,
      description: "Trung bình các phòng",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tổng quan</h2>
        <p className="text-muted-foreground">Thống kê và báo cáo hệ thống đặt phòng</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
                  <span className="text-green-600 font-medium">{stat.change}</span> {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đặt phòng gần đây</CardTitle>
          <CardDescription>Danh sách các đặt phòng mới nhất trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                room: "P102",
                customer: "Nguyễn Văn A",
                time: "09:00 - 11:00",
                date: "15/10/2025",
                status: "Đã xác nhận",
              },
              { room: "G01", customer: "Trần Thị B", time: "14:00 - 16:00", date: "15/10/2025", status: "Đã xác nhận" },
              { room: "P203", customer: "Lê Văn C", time: "10:00 - 12:00", date: "16/10/2025", status: "Chờ xác nhận" },
              {
                room: "P104",
                customer: "Phạm Thị D",
                time: "15:00 - 17:00",
                date: "16/10/2025",
                status: "Đã xác nhận",
              },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="font-medium">
                    {booking.room} - {booking.customer}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.date} • {booking.time}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium ${
                    booking.status === "Đã xác nhận" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {booking.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
