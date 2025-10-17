"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Minus, Plus, Info, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { fetchComboPackages, fetchRooms, createBooking } from "@/lib/api-client"
import { toast } from "sonner"

interface Room {
  _id: string
  name: string
  code: string
  capacity: number
  pricePerHour: number
  images: string[]
  branchId: {
    _id: string
    name: string
  }
  roomTypeId: {
    _id: string
    name: string
  }
}

interface ComboPackage {
  _id: string
  name: string
  code: string
  description: string
  price: number
  duration: number
}

interface BookingFormV2Props {
  room: Room
  selectedDate?: Date
  selectedStartTime?: Date
  selectedEndTime?: Date
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function BookingFormV2({
  room: initialRoom,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSubmit,
  onCancel,
}: BookingFormV2Props) {
  // Step state
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Room & Time selection
  const [room, setRoom] = useState(initialRoom)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [combos, setCombos] = useState<ComboPackage[]>([])
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null)
  const [date, setDate] = useState<Date>(selectedDate || new Date())
  const [startHour, setStartHour] = useState(selectedStartTime?.getHours() || 14)
  const [startMinute, setStartMinute] = useState(selectedStartTime?.getMinutes() || 0)
  const [additionalHours, setAdditionalHours] = useState(0)

  // Step 2: Customer info
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load rooms and combos
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        const [roomsRes, combosRes] = await Promise.all([
          fetchRooms(initialRoom.branchId._id, 'available'),
          fetchComboPackages(),
        ])

        if (roomsRes.success && roomsRes.data) {
          setAvailableRooms(roomsRes.data)
        }
        if (combosRes.success && combosRes.data) {
          setCombos(combosRes.data)
          // Auto select first combo if available
          if (combosRes.data.length > 0) {
            setSelectedCombo(combosRes.data[0]._id)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Không thể tải dữ liệu')
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [initialRoom.branchId._id])

  // Calculate end time and duration
  const calculateEndTime = () => {
    if (!selectedCombo) return null

    const combo = combos.find(c => c._id === selectedCombo)
    if (!combo) return null

    const start = new Date(date)
    start.setHours(startHour, startMinute, 0, 0)

    const totalHours = combo.duration + additionalHours
    const end = new Date(start)
    end.setHours(start.getHours() + totalHours)

    return { start, end, totalHours }
  }

  const timeCalc = calculateEndTime()

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedCombo) return 0

    const combo = combos.find(c => c._id === selectedCombo)
    if (!combo) return 0

    // Base combo price + additional hours price
    const additionalPrice = additionalHours * room.pricePerHour
    return combo.price + additionalPrice
  }

  const totalPrice = calculateTotalPrice()

  // Handle room change
  const handleRoomChange = (roomId: string) => {
    const newRoom = availableRooms.find(r => r._id === roomId)
    if (newRoom) {
      setRoom(newRoom)
    }
  }

  // Validation for step 1
  const validateStep1 = () => {
    if (!selectedCombo) {
      toast.error('Vui lòng chọn combo')
      return false
    }

    if (!date) {
      toast.error('Vui lòng chọn ngày')
      return false
    }

    if (!timeCalc) {
      toast.error('Thời gian không hợp lệ')
      return false
    }

    // Validate: startTime >= now + 5 minutes
    const now = new Date()
    const minBookingTime = new Date(now.getTime() + 5 * 60 * 1000)

    if (timeCalc.start < minBookingTime) {
      toast.error('Không thể đặt phòng cho giờ quá khứ', {
        description: 'Vui lòng chọn giờ bắt đầu ít nhất 5 phút sau thời điểm hiện tại'
      })
      return false
    }

    // Validate: endTime > startTime
    if (timeCalc.end <= timeCalc.start) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu')
      return false
    }

    // Validate: duration >= 1 hour
    if (timeCalc.totalHours < 1) {
      toast.error('Thời gian thuê tối thiểu 1 giờ')
      return false
    }

    return true
  }

  // Validation for step 2
  const validateStep2 = () => {
    if (!customerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng')
      return false
    }

    if (!customerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return false
    }

    // Validate phone number (basic)
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(customerPhone.trim())) {
      toast.error('Số điện thoại không hợp lệ (10-11 số)')
      return false
    }

    return true
  }

  // Handle next step
  const handleNext = () => {
    if (!validateStep1()) return
    setCurrentStep(2)
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) return
    if (!timeCalc) return

    setIsSubmitting(true)

    try {
      const combo = combos.find(c => c._id === selectedCombo)

      const bookingData = {
        roomId: room._id,
        branchId: typeof room.branchId === 'string' ? room.branchId : room.branchId._id,
        customerInfo: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
        },
        bookingDate: date,
        startTime: timeCalc.start,
        endTime: timeCalc.end,
        duration: timeCalc.totalHours,
        comboPackageId: selectedCombo,
        menuItems: [], // No menu items in this simplified version
        notes: `Combo: ${combo?.name}, Additional hours: ${additionalHours}h`,
      }

      const response = await createBooking(bookingData)

      if (response.success && response.data) {
        toast.success('Đặt phòng thành công!')
        onSubmit({
          ...bookingData,
          bookingId: response.data._id,
        })
      } else {
        toast.error(response.error || 'Không thể tạo booking')
      }
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi đặt phòng')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      {/* Header with Step Indicator */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Đặt phòng
          </h2>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mt-4">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-colors",
            currentStep === 1 ? "bg-white text-pink-500" : "bg-white/30 text-white"
          )}>
            1
          </div>
          <div className="h-[2px] flex-1 bg-white/30" />
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-colors",
            currentStep === 2 ? "bg-white text-pink-500" : "bg-white/30 text-white"
          )}>
            2
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {currentStep === 1 ? (
          <>
            {/* Step 1: Room & Time Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-1">Bước 1: Chọn phòng và thời gian</h3>
              <p className="text-sm text-muted-foreground">Vui lòng chọn phòng và thời gian đặt phòng</p>
            </div>

            {/* Alert */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Lưu ý:</strong> Mỗi booking phải cách nhau tối thiểu 15 phút.
              </AlertDescription>
            </Alert>

            {/* Room Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hạng phòng</Label>
                <Input value={room.roomTypeId.name} disabled className="mt-1" />
              </div>
              <div>
                <Label>Phòng</Label>
                <Select value={room._id} onValueChange={handleRoomChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} align="start">
                    {availableRooms.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.code} - {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Combo Selection */}
            <div>
              <Label className="mb-3 block">Chọn combo</Label>
              <div className="grid grid-cols-2 gap-3">
                {combos.map((combo) => (
                  <label
                    key={combo._id}
                    className={cn(
                      "flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-pink-50",
                      selectedCombo === combo._id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="combo"
                      value={combo._id}
                      checked={selectedCombo === combo._id}
                      onChange={() => setSelectedCombo(combo._id)}
                      className="w-4 h-4 text-pink-500"
                    />
                    <span className="text-sm font-medium text-pink-600">
                      {combo.name.replace('Combo ', '')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-4">
              <div>
                <Label>Thời gian nhận</Label>
                <div className="flex gap-2 mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={startHour.toString()} onValueChange={(v) => setStartHour(Number(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}h
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={startMinute.toString()} onValueChange={(v) => setStartMinute(Number(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      {[0, 15, 30, 45].map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Hours */}
              <div className="flex items-center justify-between">
                <Label className="text-pink-600 font-medium">Thêm giờ</Label>
                <div className="flex items-center gap-2 border-2 border-pink-500 rounded-lg p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-pink-600 hover:bg-pink-100"
                    onClick={() => setAdditionalHours(Math.max(0, additionalHours - 1))}
                    disabled={additionalHours <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold text-pink-600">{additionalHours}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-pink-600 hover:bg-pink-100"
                    onClick={() => setAdditionalHours(additionalHours + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* End Time (Auto calculated) */}
              <div>
                <Label>Thời gian trả</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={timeCalc ? format(timeCalc.end, 'dd/MM/yyyy', { locale: vi }) : ''}
                    disabled
                    className="flex-1"
                  />
                  <Input
                    value={timeCalc ? format(timeCalc.end, 'HH:mm') : ''}
                    disabled
                    className="w-32"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <span className="text-muted-foreground">Thời gian: </span>
                <span className="font-semibold">{timeCalc?.totalHours || 0} giờ</span>
              </div>
              <div className="text-lg">
                <span className="text-muted-foreground">Tổng: </span>
                <span className="font-bold text-pink-600">
                  {totalPrice.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                onClick={handleNext}
              >
                Tiếp tục
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-1">Bước 2: Thông tin khách hàng</h3>
              <p className="text-sm text-muted-foreground">Vui lòng điền thông tin liên hệ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0987654321"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email (tùy chọn)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="mt-1"
                />
              </div>

              {/* Booking Summary */}
              <div className="border rounded-lg p-4 bg-gray-50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phòng:</span>
                  <span className="font-medium">{room.code} - {room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian:</span>
                  <span className="font-medium">
                    {timeCalc && format(timeCalc.start, 'HH:mm dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời lượng:</span>
                  <span className="font-medium">{timeCalc?.totalHours || 0} giờ</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Tổng tiền:</span>
                  <span className="font-bold text-pink-600 text-lg">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận đặt phòng'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
