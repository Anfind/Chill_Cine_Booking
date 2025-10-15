"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LocationSelector } from "@/components/location-selector"
import { Film } from "lucide-react"

export default function HomePage() {
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setShowLocationSelector(true)
  }, [])

  const handleLocationSelected = (branchId: string) => {
    setShowLocationSelector(false)
    router.push(`/rooms/${branchId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <LocationSelector open={showLocationSelector} onLocationSelected={handleLocationSelected} />

      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 flex items-center justify-center shadow-2xl">
              <Film className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">🎬</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600">
            CHILL CINE
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">HOTEL - CINEMAX</h2>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-pink-200">
          <p className="text-lg text-gray-700 font-medium mb-4">Trải nghiệm xem phim riêng tư</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">🎬</span>
              <span>Máy chiếu siêu nét</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">📺</span>
              <span>Netflix & Youtube</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">🎮</span>
              <span>Board game</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">🛋️</span>
              <span>Ghế sofa/lưới</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">Hotline: 0989.76.0000</p>
      </div>
    </div>
  )
}
