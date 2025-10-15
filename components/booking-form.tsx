"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Film, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Room } from "@/lib/data"
import { comboPackages, menuItems } from "@/lib/data"

interface BookingFormProps {
  room: Room
  selectedDate?: Date
  selectedStartTime?: Date
  selectedEndTime?: Date
  onSubmit: (data: {
    customerName: string
    customerPhone: string
    date: Date
    startTime: Date
    endTime: Date
  }) => void
  onCancel: () => void
}

export function BookingForm({
  room,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date())
  const [startTime, setStartTime] = useState(
    selectedStartTime
      ? `${selectedStartTime.getHours().toString().padStart(2, "0")}:${selectedStartTime.getMinutes().toString().padStart(2, "0")}`
      : "14:00",
  )
  const [endTime, setEndTime] = useState(
    selectedEndTime
      ? `${selectedEndTime.getHours().toString().padStart(2, "0")}:${selectedEndTime.getMinutes().toString().padStart(2, "0")}`
      : "16:00",
  )
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null)
  const [selectedMenuItems, setSelectedMenuItems] = useState<Record<string, number>>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const roomImages = room.images || [room.image]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length)
  }

  const calculateTotal = () => {
    if (selectedCombo) {
      const combo = comboPackages.find((c) => c.id === selectedCombo)
      if (combo) {
        const menuTotal = Object.entries(selectedMenuItems).reduce((sum, [itemId, quantity]) => {
          const item = menuItems.find((m) => m.id === itemId)
          return sum + (item ? item.price * quantity : 0)
        }, 0)
        return combo.price + menuTotal
      }
    }

    if (!startTime || !endTime) return 0

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationHours = (endMinutes - startMinutes) / 60

    const roomTotal = Math.max(0, durationHours * room.pricePerHour)
    const menuTotal = Object.entries(selectedMenuItems).reduce((sum, [itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === itemId)
      return sum + (item ? item.price * quantity : 0)
    }, 0)

    return roomTotal + menuTotal
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !customerName || !customerPhone) return

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const startDateTime = new Date(date)
    startDateTime.setHours(startHour, startMin, 0, 0)

    const endDateTime = new Date(date)
    endDateTime.setHours(endHour, endMin, 0, 0)

    onSubmit({
      customerName,
      customerPhone,
      date,
      startTime: startDateTime,
      endTime: endDateTime,
    })
  }

  const toggleMenuItem = (itemId: string) => {
    setSelectedMenuItems((prev) => {
      const current = prev[itemId] || 0
      if (current === 0) {
        return { ...prev, [itemId]: 1 }
      }
      const newItems = { ...prev }
      delete newItems[itemId]
      return newItems
    })
  }

  const updateMenuItemQuantity = (itemId: string, delta: number) => {
    setSelectedMenuItems((prev) => {
      const current = prev[itemId] || 0
      const newQuantity = Math.max(0, current + delta)
      if (newQuantity === 0) {
        const newItems = { ...prev }
        delete newItems[itemId]
        return newItems
      }
      return { ...prev, [itemId]: newQuantity }
    })
  }

  return (
    <Card className="border-2 border-pink-200 max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-pink-600" />
          <CardTitle className="text-gray-800">Đặt phòng Cinema - {room.name}</CardTitle>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-800">Hình ảnh phòng</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-pink-200">
              <img
                src={roomImages[currentImageIndex] || "/placeholder.svg"}
                alt={`${room.name} - Ảnh ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {roomImages.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-pink-200"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-pink-200"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {roomImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          index === currentImageIndex ? "bg-pink-500 w-6" : "bg-white/60 hover:bg-white/80",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {room.description && (
            <div className="space-y-2 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
              <Label className="text-base font-semibold text-gray-800">Mô tả phòng</Label>
              <p className="text-sm text-gray-700 leading-relaxed">{room.description}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-800">Tiện ích phòng</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {room.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-pink-50 border border-pink-200">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-pink-200">
            <Label className="text-base font-semibold text-gray-800">Chọn gói combo</Label>
            <div className="grid grid-cols-2 gap-2">
              {comboPackages.map((combo) => (
                <Button
                  key={combo.id}
                  type="button"
                  variant={selectedCombo === combo.id ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3 flex flex-col items-start gap-1",
                    selectedCombo === combo.id
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0"
                      : "border-pink-200 hover:border-pink-400 hover:bg-pink-50",
                  )}
                  onClick={() => {
                    setSelectedCombo(selectedCombo === combo.id ? null : combo.id)
                  }}
                >
                  <span className="font-bold text-sm">{combo.name}</span>
                  <span className="text-xs opacity-90">{combo.description}</span>
                  <span className="font-bold text-base">{combo.price.toLocaleString("vi-VN")}đ</span>
                </Button>
              ))}
            </div>
          </div>

          {!selectedCombo && (
            <>
              <div className="space-y-2">
                <Label>Ngày đặt</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-pink-200",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Giờ bắt đầu</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-10 border-pink-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">Giờ kết thúc</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="pl-10 border-pink-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-3 pt-4 border-t-2 border-pink-200">
            <Label className="text-base font-semibold text-gray-800">Menu dịch vụ (tùy chọn)</Label>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                    selectedMenuItems[item.id]
                      ? "border-pink-400 bg-pink-50"
                      : "border-pink-100 hover:border-pink-300 hover:bg-pink-50/50",
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-800">{item.name}</div>
                    <div className="text-xs text-pink-600 font-semibold">{item.price.toLocaleString("vi-VN")}đ</div>
                  </div>
                  {selectedMenuItems[item.id] ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 border-pink-300 bg-transparent"
                        onClick={() => updateMenuItemQuantity(item.id, -1)}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center font-semibold text-pink-600">{selectedMenuItems[item.id]}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 border-pink-300 bg-transparent"
                        onClick={() => updateMenuItemQuantity(item.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-pink-300 hover:bg-pink-100 bg-transparent"
                      onClick={() => toggleMenuItem(item.id)}
                    >
                      Thêm
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t-2 border-pink-200">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              placeholder="Nhập họ và tên"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border-pink-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="border-pink-200"
              required
            />
          </div>

          <div className="pt-4 border-t-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 -mx-6 px-6 py-4 rounded-lg">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-800">Tổng tiền:</span>
              <span className="text-pink-600">{calculateTotal().toLocaleString("vi-VN")}đ</span>
            </div>
            {selectedCombo && <p className="text-xs text-gray-600 mt-2">* Phụ phí phát sinh: 50.000đ/giờ</p>}
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 bg-transparent border-pink-300 hover:bg-pink-50"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
          >
            Tiếp tục thanh toán
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
