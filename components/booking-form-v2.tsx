"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Minus, Plus, Info, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { fetchComboPackages, fetchRooms, fetchMenuItems, createBooking } from "@/lib/api-client"
import { toast } from "sonner"
import { CCCDScanner } from "@/components/cccd-scanner"
import type { CCCDData } from "@/lib/cccd-scanner"

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

interface MenuItem {
  _id: string
  name: string
  price: number
  category: string
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedMenuItems, setSelectedMenuItems] = useState<Record<string, number>>({})

  // Step 2: Customer info
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerCCCD, setCustomerCCCD] = useState("")
  const [cccdData, setCccdData] = useState<CCCDData | null>(null)
  const [isCCCDVerified, setIsCCCDVerified] = useState(false)
  const [acceptedRules, setAcceptedRules] = useState(false)
  const [showRulesDialog, setShowRulesDialog] = useState(false)

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load rooms, combos and menu items
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        const [roomsRes, combosRes, menuRes] = await Promise.all([
          fetchRooms(initialRoom.branchId._id, 'available'),
          fetchComboPackages(),
          fetchMenuItems(),
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
        if (menuRes.success && menuRes.data) {
          setMenuItems(menuRes.data)
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
    
    // Menu items price
    const menuPrice = Object.entries(selectedMenuItems).reduce((sum, [itemId, quantity]) => {
      const item = menuItems.find(m => m._id === itemId)
      return sum + (item ? item.price * quantity : 0)
    }, 0)
    
    return combo.price + additionalPrice + menuPrice
  }

  const totalPrice = calculateTotalPrice()

  // Handle room change
  const handleRoomChange = (roomId: string) => {
    const newRoom = availableRooms.find(r => r._id === roomId)
    if (newRoom) {
      setRoom(newRoom)
    }
  }

  // Menu items handlers
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

    // Validate CCCD verification
    if (!isCCCDVerified || !cccdData) {
      toast.error('Vui lòng quét và xác thực CCCD')
      return false
    }

    // Validate rules acceptance
    if (!acceptedRules) {
      toast.error('Vui lòng đọc và chấp nhận nội quy Chill Cine')
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
          cccd: customerCCCD.trim(),
        },
        bookingDate: date,
        startTime: timeCalc.start,
        endTime: timeCalc.end,
        duration: timeCalc.totalHours,
        comboPackageId: selectedCombo,
        menuItems: Object.entries(selectedMenuItems).map(([menuItemId, quantity]) => ({
          menuItemId,
          quantity,
        })),
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <SelectContent position="popper" sideOffset={4} align="start" className="max-w-[calc(100vw-2rem)]">
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

            {/* Menu Items Selection */}
            <div className="space-y-3 pt-4 border-t-2 border-pink-200">
              <Label className="text-base font-semibold text-gray-800">Menu dịch vụ (tùy chọn)</Label>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                  <span className="ml-2 text-sm text-gray-600">Đang tải menu...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <div
                      key={item._id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                        selectedMenuItems[item._id]
                          ? "border-pink-400 bg-pink-50"
                          : "border-pink-100 hover:border-pink-300 hover:bg-pink-50/50",
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">{item.name}</div>
                        <div className="text-xs text-pink-600 font-semibold">{item.price.toLocaleString("vi-VN")}đ</div>
                      </div>
                      {selectedMenuItems[item._id] ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 border-pink-300 bg-transparent"
                            onClick={() => updateMenuItemQuantity(item._id, -1)}
                          >
                            -
                          </Button>
                          <span className="w-6 text-center font-semibold text-pink-600">{selectedMenuItems[item._id]}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 border-pink-300 bg-transparent"
                            onClick={() => updateMenuItemQuantity(item._id, 1)}
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
                          onClick={() => toggleMenuItem(item._id)}
                        >
                          Thêm
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

              {/* CCCD Scanner Component */}
              <CCCDScanner
                customerName={customerName}
                minAge={18}
                onScanSuccess={(data) => {
                  setCccdData(data)
                  setCustomerCCCD(data.idNumber)
                  setIsCCCDVerified(true)
                  toast.success('Xác thực CCCD thành công!')
                }}
                onScanError={(error) => {
                  setIsCCCDVerified(false)
                  toast.error(error)
                }}
              />

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
              <div className="border-2 border-pink-200 rounded-lg p-4 bg-gradient-to-br from-pink-50 to-purple-50 space-y-3">
                <h4 className="font-semibold text-base text-gray-800 mb-3 border-b border-pink-200 pb-2">
                  Thông tin đặt phòng
                </h4>
                
                {/* Room Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Phòng:</span>
                    <span className="font-semibold text-gray-800 text-right">{room.code} - {room.name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Hạng phòng:</span>
                    <span className="font-semibold text-gray-800">{room.roomTypeId.name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Số người:</span>
                    <span className="font-semibold text-gray-800">{room.capacity} người</span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="space-y-2 pt-2 border-t border-pink-200">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Nhận phòng:</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {timeCalc && format(timeCalc.start, 'HH:mm - dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Trả phòng:</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {timeCalc && format(timeCalc.end, 'HH:mm - dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Thời lượng:</span>
                    <span className="font-semibold text-pink-600">{timeCalc?.totalHours || 0} giờ</span>
                  </div>
                </div>

                {/* Combo Info */}
                {selectedCombo && (
                  <div className="space-y-2 pt-2 border-t border-pink-200">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 text-sm">Combo:</span>
                      <span className="font-semibold text-gray-800 text-right">
                        {combos.find(c => c._id === selectedCombo)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 text-sm">Giá combo:</span>
                      <span className="font-semibold text-gray-800">
                        {combos.find(c => c._id === selectedCombo)?.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                )}

                {/* Additional Hours */}
                {additionalHours > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Giờ bổ sung:</span>
                    <span className="font-semibold text-gray-800">
                      {additionalHours}h × {room.pricePerHour.toLocaleString('vi-VN')}đ = {(additionalHours * room.pricePerHour).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                )}

                {/* Menu Items */}
                {Object.keys(selectedMenuItems).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-pink-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Dịch vụ bổ sung:</div>
                    {Object.entries(selectedMenuItems).map(([itemId, quantity]) => {
                      const item = menuItems.find(m => m._id === itemId)
                      if (!item) return null
                      return (
                        <div key={itemId} className="flex justify-between items-start pl-3">
                          <span className="text-gray-600 text-sm">
                            • {item.name} × {quantity}
                          </span>
                          <span className="font-medium text-gray-800">
                            {(item.price * quantity).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Total */}
                <div className="border-t-2 border-pink-300 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-base">Tổng tiền thanh toán:</span>
                  <span className="font-bold text-pink-600 text-xl">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Rules Acceptance */}
              <div className="flex items-start gap-3 p-4 border-2 border-pink-200 rounded-lg bg-pink-50">
                <Checkbox
                  id="rules"
                  checked={acceptedRules}
                  onCheckedChange={(checked) => setAcceptedRules(checked === true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="rules"
                    className="text-xs leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-700"
                  >
                    Chấp nhận{" "}
                    <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-pink-600 font-semibold underline hover:text-pink-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          điều khoản
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-gray-800">
                            📋 Nội quy Homestay nhà Chốn
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-gray-700 py-4">
                          <div className="space-y-4">
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">1.</span>
                              <span>Xin quý khách xuất trình ảnh CCCD, giấy tờ hợp lệ khi trú tại Chốn.</span>
                            </p>
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">2.</span>
                              <span>Không mang theo vũ khí, chất độc, chất dễ cháy nổ, buôn bán tàng trữ hàng cấm.</span>
                            </p>
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">3.</span>
                              <span>Không mời giới và mua bán mại dâm dưới mọi hình thức tại Chốn.</span>
                            </p>
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">4.</span>
                              <span>Quý khách không được tự ý thay đổi phòng, đem thêm người vào ở khi chưa được bên Chốn cho phép. Không được nấu ăn tại phòng.</span>
                            </p>
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">5.</span>
                              <span>Những đồ chơi vật dụng trang trí ở phòng khách làm hư hỏng thì phải bồi thường cho khách sau.</span>
                            </p>
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">6.</span>
                              <span>Rút thẻ điện khi khách ra khỏi bên Chốn để phòng chập điện.</span>
                            </p>
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">7.</span>
                              <span>Không đem vật nuôi vào phòng Chốn. Không hút thuốc phòng Chốn.</span>
                            </p>
                            <p className="flex gap-3">
                              <span className="font-bold flex-shrink-0">8.</span>
                              <span>Sau 23h khách vui lòng giảm âm lượng máy chiếu để giữ trật tự chung ở Chốn.</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center pt-4 border-t">
                          <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white px-8"
                            onClick={() => setShowRulesDialog(false)}
                          >
                            Đã hiểu
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {" "}đặt phòng & chính sách bảo mật thông tin của Chốn Cinehome{" "}
                    <span className="text-red-500">*</span>
                  </label>
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
