"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, Calendar } from "lucide-react"
import confetti from "canvas-confetti"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingInfo, setBookingInfo] = useState<any>(null)

  const bookingId = searchParams.get("bookingId")
  const bookingCode = searchParams.get("code")

  useEffect(() => {
    // Fire confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    // Fetch booking details if bookingId provided
    if (bookingId) {
      fetch(`/api/payment/status?bookingId=${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setBookingInfo(data.data)
          }
        })
        .catch((error) => {
          console.error("Error fetching booking:", error)
        })
    }

    return () => clearInterval(interval)
  }, [bookingId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-500">
              Thanh toán thành công! 🎉
            </h1>
            <p className="text-lg text-muted-foreground">
              Đặt phòng của bạn đã được xác nhận
            </p>
          </div>

          {/* Booking Details */}
          {(bookingCode || bookingInfo) && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="text-sm text-muted-foreground">Mã đặt phòng</div>
              <div className="text-2xl font-mono font-bold tracking-wider">
                {bookingCode || bookingInfo?.bookingCode}
              </div>
              {bookingInfo?.total && (
                <div className="text-sm text-muted-foreground pt-2">
                  Số tiền: {bookingInfo.total.toLocaleString("vi-VN")}đ
                </div>
              )}
            </div>
          )}

          {/* Information */}
          <div className="text-sm text-muted-foreground px-4">
            Thông tin chi tiết đã được gửi đến số điện thoại của bạn. 
            Vui lòng đến quầy lễ tân và xuất trình mã đặt phòng để nhận phòng.
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <Button 
              onClick={() => router.push("/")} 
              className="w-full" 
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Về trang chủ
            </Button>
            <Button 
              onClick={() => router.push("/")} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Đặt phòng khác
            </Button>
          </div>

          {/* Contact Support */}
          <div className="pt-4 text-xs text-muted-foreground">
            Cần hỗ trợ? Liên hệ hotline:{" "}
            <a 
              href={`tel:${process.env.NEXT_PUBLIC_HOTLINE}`}
              className="font-semibold text-primary hover:underline"
            >
              {process.env.NEXT_PUBLIC_HOTLINE || "0989760000"}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">Đang tải...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
