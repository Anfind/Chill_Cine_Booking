"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, ChevronLeft, Film, Tv, Gamepad2, Armchair, Loader2 } from "lucide-react"
import { fetchBranchById, fetchRooms } from "@/lib/api-client"
import Image from "next/image"

interface Branch {
  _id: string
  name: string
  address: string
  phone: string
  images: string[]
}

interface Room {
  _id: string
  code: string
  name: string
  capacity: number
  pricePerHour: number
  images: string[]
  amenities: string[]
  status: string
  roomTypeId: {
    name: string
    color: string
  }
}

export function RoomsClient({ branchId }: { branchId: string }) {
  const router = useRouter()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [branchId])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    // Load branch info
    const branchResponse = await fetchBranchById(branchId)
    if (!branchResponse.success) {
      setError(branchResponse.error || 'Không tìm thấy chi nhánh')
      setLoading(false)
      return
    }
    setBranch(branchResponse.data)

    // Load rooms
    const roomsResponse = await fetchRooms(branchId, 'available')
    if (roomsResponse.success && roomsResponse.data) {
      setRooms(roomsResponse.data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">{error || 'Không tìm thấy chi nhánh'}</h1>
          <Button onClick={() => router.push("/")} size="lg">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-100 to-purple-100 backdrop-blur-sm border-b-2 border-pink-200 shadow-md">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex-shrink-0 hover:bg-pink-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-pink-600" />
                <h1 className="font-bold text-lg sm:text-xl truncate text-gray-800">{branch.name}</h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                <span className="truncate">{branch.address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="space-y-1">
                <Film className="h-6 w-6 mx-auto text-pink-600" />
                <p className="text-xs font-medium text-gray-700">Máy chiếu 4K</p>
              </div>
              <div className="space-y-1">
                <Tv className="h-6 w-6 mx-auto text-purple-600" />
                <p className="text-xs font-medium text-gray-700">Netflix & YT</p>
              </div>
              <div className="space-y-1">
                <Gamepad2 className="h-6 w-6 mx-auto text-pink-600" />
                <p className="text-xs font-medium text-gray-700">Board Game</p>
              </div>
              <div className="space-y-1">
                <Armchair className="h-6 w-6 mx-auto text-purple-600" />
                <p className="text-xs font-medium text-gray-700">Ghế Sofa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {rooms.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="mb-4 text-5xl sm:text-6xl">🎬</div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Chưa có phòng nào</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
              Chi nhánh này hiện chưa có phòng khả dụng
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Chọn chi nhánh khác
            </Button>
          </div>
        ) : (
          rooms.map((room) => (
            <Card
              key={room._id}
              className="overflow-hidden hover:shadow-xl transition-all duration-200 border-2 border-pink-100 hover:border-pink-300"
            >
              <div className="relative h-44 sm:h-52 w-full">
                <Image src={room.images[0] || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <Badge className="bg-pink-500 text-white border-0 shadow-lg text-xs">
                    <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    {room.capacity} người
                  </Badge>
                </div>
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <Badge className="bg-purple-500 text-white border-0 shadow-lg text-xs">
                    <Film className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    {room.roomTypeId?.name || 'Cinema'}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6 bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-xl sm:text-2xl text-gray-800">{room.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3 sm:pb-4 px-4 sm:px-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">Từ</div>
                  <div className="text-2xl sm:text-3xl font-bold text-pink-600">
                    {room.pricePerHour.toLocaleString("vi-VN")}đ
                  </div>
                  <div className="text-xs text-gray-500">/giờ</div>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {room.amenities.slice(0, 4).map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="text-xs font-normal bg-pink-100 text-pink-700 border-pink-200"
                    >
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 4 && (
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal bg-purple-100 text-purple-700 border-purple-200"
                    >
                      +{room.amenities.length - 4} tiện ích
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <Button
                  className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
                  onClick={() => router.push(`/booking/${room._id}`)}
                >
                  Đặt phòng ngay
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
