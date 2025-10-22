"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// MongoDB types
interface Room {
  _id: string
  name: string
  code: string
  capacity: number
  images: string[]
}

interface Booking {
  _id: string
  roomId: string | { _id: string }  // Can be populated or just ID
  startTime: Date | string
  endTime: Date | string
  status: string
  customerInfo?: {
    name: string
    phone: string
    email?: string
  }
}

interface TimelineBookingProps {
  rooms: Room[]
  bookings: Booking[]
  selectedDate?: Date
  onDateChange?: (date: Date) => void
  onBookingSelect: (roomId: string, startTime: Date, endTime: Date) => void
}

export function TimelineBooking({ 
  rooms, 
  bookings, 
  selectedDate: propSelectedDate,
  onDateChange,
  onBookingSelect 
}: TimelineBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Sync with prop
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate)
    }
  }, [propSelectedDate])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = currentTime.getHours()
      const scrollPosition = currentHour * 60 - 150
      scrollContainerRef.current.scrollLeft = Math.max(0, scrollPosition)
    }
  }, [])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    onDateChange?.(today)
  }

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    return hours * 60 + (minutes / 60) * 60
  }

  const getBookingPosition = (booking: Booking) => {
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)

    const startHours = start.getHours() + start.getMinutes() / 60
    let endHours = end.getHours() + end.getMinutes() / 60

    if (endHours < startHours) {
      endHours += 24
    }

    const left = startHours * 60
    const width = (endHours - startHours) * 60

    return { left, width }
  }

  const handleSlotClick = (roomId: string, hour: number) => {
    const startTime = new Date(selectedDate)
    startTime.setHours(hour, 0, 0, 0)
    const endTime = new Date(startTime)
    endTime.setHours(hour + 2, 0, 0, 0)

    onBookingSelect(roomId, startTime, endTime)
  }

  const isSlotBooked = (roomId: string, hour: number) => {
    return bookings.some((booking) => {
      // Handle both populated and unpopulated roomId
      const bookingRoomId = typeof booking.roomId === 'string' 
        ? booking.roomId 
        : booking.roomId._id
      
      if (bookingRoomId !== roomId) return false

      // Filter out cancelled and checked-out bookings from timeline
      if (booking.status === 'cancelled' || booking.status === 'checked-out') {
        return false
      }

      const start = new Date(booking.startTime)
      const end = new Date(booking.endTime)
      const slotTime = new Date(selectedDate)
      slotTime.setHours(hour, 0, 0, 0)

      return slotTime >= start && slotTime < end
    })
  }

  const isToday =
    selectedDate.getDate() === currentTime.getDate() &&
    selectedDate.getMonth() === currentTime.getMonth() &&
    selectedDate.getFullYear() === currentTime.getFullYear()

  return (
    <Card className="overflow-hidden shadow-sm border-border/40">
      <div className="border-b bg-card px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-7 sm:h-8 gap-1.5 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm font-medium bg-transparent"
                >
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">{format(selectedDate, "dd/MM/yyyy", { locale: vi })}</span>
                  <span className="xs:hidden">{format(selectedDate, "dd/MM", { locale: vi })}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={goToToday} className="h-7 sm:h-8 text-xs px-2 sm:px-3">
            Hôm nay
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          style={{
            scrollbarWidth: "thin",
          }}
        >
          <div className="relative" style={{ minWidth: "1440px" }}>
            <div className="sticky top-0 z-30 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm border-b border-border/60">
              <div className="flex h-9 sm:h-11">
                <div className="sticky left-0 z-40 w-16 sm:w-20 flex-shrink-0 bg-primary/95 text-primary-foreground font-semibold text-[10px] sm:text-xs flex items-center justify-center border-r border-border/40 shadow-sm">
                  Phòng
                </div>
                <div className="flex">
                  {hours.map((hour) => {
                    const isHighlighted = hour % 2 === 0 && hour >= 6 && hour <= 16
                    return (
                      <div
                        key={hour}
                        className={cn(
                          "w-[60px] flex-shrink-0 border-r border-border/30 flex flex-col items-center justify-center relative transition-colors",
                          isHighlighted && "bg-emerald-50/80 dark:bg-emerald-950/20",
                        )}
                      >
                        <span className="font-medium text-[10px] sm:text-xs text-foreground/90">
                          {hour.toString().padStart(2, "0")}h
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {rooms.map((room, index) => {
              const roomBookings = bookings.filter((b) => {
                const bookingRoomId = typeof b.roomId === 'string' ? b.roomId : b.roomId._id
                
                // Filter: Chỉ hiển thị booking đang active (pending, confirmed, checked-in)
                // Loại bỏ cancelled và checked-out khỏi timeline
                const isActive = b.status !== 'cancelled' && b.status !== 'checked-out'
                
                // Debug: uncomment để debug
                // if (bookingRoomId === room._id) {
                //   console.log('🔍 Booking:', b._id, 'Status:', b.status, 'Show:', isActive)
                // }
                
                return bookingRoomId === room._id && isActive
              })

              return (
                <div
                  key={room._id}
                  className={cn(
                    "flex border-b border-border/30 transition-colors hover:bg-muted/30",
                    index % 2 === 0 ? "bg-background" : "bg-muted/20",
                  )}
                >
                  <div className="sticky left-0 z-20 w-16 sm:w-20 flex-shrink-0 bg-card/95 backdrop-blur-sm border-r border-border/40 font-medium text-[10px] sm:text-xs flex items-center justify-center h-12 sm:h-14 shadow-sm">
                    <span className="text-primary/90">{room.name}</span>
                  </div>

                  <div className="relative flex-1">
                    <div className="relative h-12 sm:h-14" style={{ width: "1440px" }}>
                      {hours.map((hour) => {
                        const isBooked = isSlotBooked(room._id, hour)
                        const isHighlighted = hour % 2 === 0 && hour >= 6 && hour <= 16

                        return (
                          <div
                            key={hour}
                            className={cn(
                              "absolute top-0 h-full w-[60px] border-r border-border/20 cursor-pointer transition-all duration-150",
                              isHighlighted && "bg-emerald-50/40 dark:bg-emerald-950/10",
                              !isBooked && "hover:bg-primary/8 hover:border-primary/20 active:bg-primary/15",
                            )}
                            style={{ left: `${hour * 60}px` }}
                            onClick={() => !isBooked && handleSlotClick(room._id, hour)}
                          />
                        )
                      })}

                      {roomBookings.map((booking) => {
                        const { left, width } = getBookingPosition(booking)
                        const start = new Date(booking.startTime)
                        const end = new Date(booking.endTime)

                        return (
                          <div
                            key={booking._id}
                            className="absolute top-1.5 sm:top-2 h-9 sm:h-10 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-500 dark:from-rose-500 dark:via-rose-600 dark:to-rose-600 rounded-md flex items-center justify-between px-1.5 sm:px-2.5 text-white text-[9px] sm:text-[11px] font-medium shadow-sm hover:shadow-md transition-all cursor-pointer border border-rose-600/10 hover:scale-[1.02] group"
                            style={{
                              left: `${left}px`,
                              width: `${Math.max(width - 2, 50)}px`,
                            }}
                          >
                            <span className="whitespace-nowrap">
                              {start.getHours().toString().padStart(2, "0")}:
                              {start.getMinutes().toString().padStart(2, "0")}
                            </span>
                            <span className="text-white/70 mx-0.5 sm:mx-1 text-[8px] sm:text-[10px]">→</span>
                            <span className="whitespace-nowrap">
                              {end.getHours().toString().padStart(2, "0")}:
                              {end.getMinutes().toString().padStart(2, "0")}
                            </span>
                            {booking.customerInfo?.name && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {booking.customerInfo.name}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {isToday && (
              <div
                className="absolute top-9 sm:top-11 bottom-0 w-[2px] bg-gradient-to-b from-primary to-emerald-600 z-10 pointer-events-none shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                style={{ left: `${getCurrentTimePosition() + (window.innerWidth < 640 ? 64 : 80)}px` }}
              >
                <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap shadow-md">
                  {currentTime.getHours().toString().padStart(2, "0")}:
                  {currentTime.getMinutes().toString().padStart(2, "0")}
                </div>
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-md" />
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse pointer-events-none">
          ← Vuốt ngang để xem →
        </div>
      </div>
    </Card>
  )
}
