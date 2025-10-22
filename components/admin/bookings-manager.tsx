"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Search, Eye, X, Loader2, Filter } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Booking {
  _id: string
  bookingCode: string
  roomId: { _id: string; name: string; code: string }
  branchId: { _id: string; name: string }
  customerInfo: {
    name: string
    phone: string
    email?: string
  }
  bookingDate: string
  startTime: string
  endTime: string
  duration: number
  comboPackageId?: { _id: string; name: string }
  roomPrice: number
  menuItems: Array<{
    menuItemId: string
    name: string
    price: number
    quantity: number
    subtotal: number
  }>
  pricing: {
    roomTotal: number
    menuTotal: number
    subtotal: number
    tax: number
    discount: number
    total: number
  }
  status: string
  paymentStatus: string
  paymentMethod?: string
  notes?: string
  createdAt: string
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bookings, searchQuery, filterStatus, filterPaymentStatus, filterDate])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()

      if (data.success) {
        setBookings(data.data)
      } else {
        toast.error('Không thể tải danh sách đặt phòng')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...bookings]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.bookingCode.toLowerCase().includes(query) ||
          booking.customerInfo.name.toLowerCase().includes(query) ||
          booking.customerInfo.phone.includes(query) ||
          (typeof booking.roomId === 'object' && booking.roomId.name?.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((booking) => booking.status === filterStatus)
    }

    // Payment status filter
    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter((booking) => booking.paymentStatus === filterPaymentStatus)
    }

    // Date filter
    if (filterDate) {
      const selectedDate = format(filterDate, 'yyyy-MM-dd')
      filtered = filtered.filter((booking) => {
        const bookingDate = format(new Date(booking.bookingDate), 'yyyy-MM-dd')
        return bookingDate === selectedDate
      })
    }

    setFilteredBookings(filtered)
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailDialogOpen(true)
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Cập nhật trạng thái thành công')
        fetchBookings()
        setIsDetailDialogOpen(false)
      } else {
        toast.error(data.error || 'Không thể cập nhật trạng thái')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Bạn có chắc muốn hủy booking này? Booking sẽ biến mất khỏi timeline.')) return

    await handleUpdateStatus(bookingId, 'cancelled')
  }

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
    setFilterPaymentStatus("all")
    setFilterDate(undefined)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý đặt phòng</CardTitle>
              <CardDescription>Xem và quản lý tất cả các đặt phòng trong hệ thống</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchBookings} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Làm mới"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Mã booking, tên, SĐT, phòng..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="checked-in">Đang sử dụng</SelectItem>
                  <SelectItem value="checked-out">Đã trả phòng</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment">Thanh toán</Label>
              <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger id="payment">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, 'dd/MM/yyyy', { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filterDate} onSelect={setFilterDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(searchQuery || filterStatus !== 'all' || filterPaymentStatus !== 'all' || filterDate) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Tìm thấy {filteredBookings.length} kết quả
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Không tìm thấy đặt phòng nào
            </p>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => {
                const room = typeof booking.roomId === 'object' ? booking.roomId : null
                const branch = typeof booking.branchId === 'object' ? booking.branchId : null

                return (
                  <Card key={booking._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">{booking.bookingCode}</span>
                            {getStatusBadge(booking.status)}
                            {getPaymentBadge(booking.paymentStatus)}
                          </div>
                          
                          <div className="grid gap-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Khách hàng:</span>
                              <span className="font-medium">{booking.customerInfo.name}</span>
                              <span className="text-muted-foreground">|</span>
                              <span>{booking.customerInfo.phone}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Phòng:</span>
                              <span className="font-medium">{room?.name || 'N/A'} ({room?.code || 'N/A'})</span>
                              <span className="text-muted-foreground">-</span>
                              <span>{branch?.name || 'N/A'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Thời gian:</span>
                              <span>
                                {format(new Date(booking.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })} - 
                                {format(new Date(booking.endTime), 'HH:mm', { locale: vi })}
                              </span>
                              <span className="text-muted-foreground">({booking.duration}h)</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Tạo đơn:</span>
                              <span className="text-xs">
                                {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Tổng tiền:</span>
                              <span className="font-semibold text-primary">{formatCurrency(booking.pricing.total)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                          
                          {/* Chỉ cho phép hủy booking ở trạng thái pending và confirmed */}
                          {booking.status !== 'cancelled' && booking.status !== 'checked-out' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Hủy
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đặt phòng</DialogTitle>
            <DialogDescription>Mã: {selectedBooking?.bookingCode}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Họ tên:</span>
                    <span className="font-medium">{selectedBooking.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số điện thoại:</span>
                    <span>{selectedBooking.customerInfo.phone}</span>
                  </div>
                  {selectedBooking.customerInfo.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedBooking.customerInfo.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin đặt phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phòng:</span>
                    <span className="font-medium">
                      {typeof selectedBooking.roomId === 'object' ? selectedBooking.roomId.name : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chi nhánh:</span>
                    <span>
                      {typeof selectedBooking.branchId === 'object' ? selectedBooking.branchId.name : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bắt đầu:</span>
                    <span>{format(new Date(selectedBooking.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kết thúc:</span>
                    <span>{format(new Date(selectedBooking.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời lượng:</span>
                    <span>{selectedBooking.duration} giờ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạo đơn lúc:</span>
                    <span className="font-medium text-primary">
                      {format(new Date(selectedBooking.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                    </span>
                  </div>
                  {selectedBooking.comboPackageId && typeof selectedBooking.comboPackageId === 'object' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Combo:</span>
                      <span>{selectedBooking.comboPackageId.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Menu Items */}
              {selectedBooking.menuItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Đồ ăn & uống</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {selectedBooking.menuItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Chi tiết giá</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tiền phòng:</span>
                    <span>{formatCurrency(selectedBooking.pricing.roomTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tiền menu:</span>
                    <span>{formatCurrency(selectedBooking.pricing.menuTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatCurrency(selectedBooking.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thuế:</span>
                    <span>{formatCurrency(selectedBooking.pricing.tax)}</span>
                  </div>
                  {selectedBooking.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(selectedBooking.pricing.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatCurrency(selectedBooking.pricing.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trạng thái booking:</span>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trạng thái thanh toán:</span>
                    {getPaymentBadge(selectedBooking.paymentStatus)}
                  </div>
                  {selectedBooking.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phương thức thanh toán:</span>
                      <span className="capitalize">{selectedBooking.paymentMethod}</span>
                    </div>
                  )}
                  {selectedBooking.notes && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground block mb-1">Ghi chú:</span>
                      <p className="text-sm">{selectedBooking.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              {/* Chỉ hiển thị actions cho booking chưa cancelled/checked-out */}
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'checked-out' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Cập nhật trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {selectedBooking.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'confirmed')}
                        >
                          Xác nhận
                        </Button>
                      )}
                      {selectedBooking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'checked-in')}
                        >
                          Check-in
                        </Button>
                      )}
                      {selectedBooking.status === 'checked-in' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'checked-out')}
                        >
                          Check-out
                        </Button>
                      )}
                      {/* Nút hủy - chỉ cho pending và confirmed */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelBooking(selectedBooking._id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Hủy booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
