"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2 } from "lucide-react"
import { TimelineBooking } from "@/components/timeline-booking"
import { BookingForm } from "@/components/booking-form"
import { RoomDetailsPanel } from "@/components/room-details-panel"
import { fetchRoomById, fetchRooms, fetchBookings } from "@/lib/api-client"
import { format } from "date-fns"

interface Room {
  _id: string
  name: string
  code: string
  capacity: number
  pricePerHour: number
  images: string[]
  amenities: string[]
  description: string
  branchId: any
  roomTypeId: any
}

interface Booking {
  _id: string
  roomId: string
  startTime: Date
  endTime: Date
  status: string
  customerInfo: any
}

export default function BookingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const router = useRouter()
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<{
    startTime: Date
    endTime: Date
  } | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Data states
  const [room, setRoom] = useState<Room | null>(null)
  const [branchRooms, setBranchRooms] = useState<Room[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on mount and when date changes
  useEffect(() => {
    loadData()
  }, [roomId, selectedDate])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Load room details
      const roomResponse = await fetchRoomById(roomId)
      if (!roomResponse.success || !roomResponse.data) {
        setError('Không tìm thấy phòng')
        setLoading(false)
        return
      }
      const roomData = roomResponse.data
      setRoom(roomData)

      // 2. Load all rooms in the same branch
      const roomsResponse = await fetchRooms(roomData.branchId._id, 'available')
      if (roomsResponse.success && roomsResponse.data) {
        setBranchRooms(roomsResponse.data)
      }

      // 3. Load bookings for the selected date
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      const bookingsResponse = await fetchBookings({
        branchId: roomData.branchId._id,
        date: dateString,
      })
      if (bookingsResponse.success && bookingsResponse.data) {
        setAllBookings(bookingsResponse.data)
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu')
      console.error('Error loading booking page data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin phòng...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Không tìm thấy phòng'}</h1>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    )
  }

  const branch = room.branchId // Already populated from API

  const handleBookingSelect = (roomId: string, startTime: Date, endTime: Date) => {
    setSelectedBooking({ startTime, endTime })
    setShowBookingForm(true)
  }

  const handleBookingSubmit = async (bookingData: any) => {
    // This will be handled in BookingForm component
    // After successful booking creation, redirect to payment
    if (bookingData.bookingId) {
      router.push(`/payment?bookingId=${bookingData.bookingId}`)
    }
  }

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate)
    setShowBookingForm(false)
    setSelectedBooking(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-pink-100 to-purple-100 backdrop-blur-sm border-b-2 border-pink-200 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 hover:bg-pink-200">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg text-gray-800">Đặt phòng {room.name}</h1>
              <p className="text-sm text-gray-600">{branch.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {!showBookingForm ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Chọn khung giờ</h2>
                <p className="text-sm text-gray-600">Nhấn vào ô trống để chọn giờ đặt phòng</p>
              </div>
              <TimelineBooking 
                rooms={branchRooms} 
                bookings={allBookings} 
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                onBookingSelect={handleBookingSelect} 
              />
            </div>
            <div className="lg:col-span-1">
              <RoomDetailsPanel room={room} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingForm
                room={room}
                selectedDate={selectedDate}
                selectedStartTime={selectedBooking?.startTime}
                selectedEndTime={selectedBooking?.endTime}
                onSubmit={handleBookingSubmit}
                onCancel={() => setShowBookingForm(false)}
              />
            </div>
            <div className="lg:col-span-1">
              <RoomDetailsPanel room={room} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
