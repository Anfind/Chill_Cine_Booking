"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Check, Film } from "lucide-react"
import { cn } from "@/lib/utils"

// MongoDB Room type
interface Room {
  _id: string
  name: string
  code: string
  capacity: number
  pricePerHour: number
  images: string[]
  amenities: string[]
  description?: string
}

interface RoomDetailsPanelProps {
  room: Room
}

export function RoomDetailsPanel({ room }: RoomDetailsPanelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const roomImages = room.images || []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length)
  }

  return (
    <div className="space-y-4">
      {/* Image Slideshow */}
      <Card className="border-2 border-pink-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-pink-600" />
            <CardTitle className="text-lg text-gray-800">{room.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-pink-500 text-white border-0">{room.pricePerHour.toLocaleString("vi-VN")}đ/giờ</Badge>
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              {room.capacity} người
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Slideshow */}
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-pink-200 h-8 w-8"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-pink-200 h-8 w-8"
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

          {/* Description */}
          {room.description && (
            <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Mô tả phòng</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{room.description}</p>
            </div>
          )}

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Tiện ích phòng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {room.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-pink-50 border border-pink-200">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
