"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { TimelineBooking } from "@/components/timeline-booking"
import { BookingForm } from "@/components/booking-form"
import { RoomDetailsPanel } from "@/components/room-details-panel"
import { rooms, getRoomsByBranch, getBookingsByRoom, branches } from "@/lib/data"

export default function BookingPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params
  const router = useRouter()
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<{
    startTime: Date
    endTime: Date
  } | null>(null)

  const room = rooms.find((r) => r.id === roomId)
  const branch = room ? branches.find((b) => b.id === room.branchId) : null
  const branchRooms = room ? getRoomsByBranch(room.branchId) : []
  const allBookings = branchRooms.flatMap((r) => getBookingsByRoom(r.id))

  if (!room || !branch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy phòng</h1>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    )
  }

  const handleBookingSelect = (roomId: string, startTime: Date, endTime: Date) => {
    setSelectedBooking({ startTime, endTime })
    setShowBookingForm(true)
  }

  const handleBookingSubmit = (data: any) => {
    router.push(`/payment?room=${roomId}&name=${encodeURIComponent(data.customerName)}&phone=${data.customerPhone}`)
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
              <TimelineBooking rooms={branchRooms} bookings={allBookings} onBookingSelect={handleBookingSelect} />
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
                selectedDate={new Date()}
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
