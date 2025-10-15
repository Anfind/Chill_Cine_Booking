"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, CreditCard, Wallet, Building2, ChevronLeft } from "lucide-react"
import { rooms } from "@/lib/data"

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const roomId = searchParams.get("room")
  const customerName = searchParams.get("name")
  const customerPhone = searchParams.get("phone")

  const room = rooms.find((r) => r.id === roomId)

  if (!room || !customerName || !customerPhone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Thông tin không hợp lệ</h1>
          <Button onClick={() => router.push("/")}>Quay về trang chủ</Button>
        </div>
      </div>
    )
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Đặt phòng thành công!</h2>
              <p className="text-muted-foreground">
                Cảm ơn bạn đã đặt phòng. Chúng tôi đã gửi thông tin xác nhận đến số điện thoại của bạn.
              </p>
            </div>
            <div className="pt-4 space-y-2">
              <Button onClick={() => router.push("/")} className="w-full">
                Về trang chủ
              </Button>
              <Button onClick={() => router.push(`/rooms/${room.branchId}`)} variant="outline" className="w-full">
                Đặt phòng khác
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock booking details
  const bookingDetails = {
    date: new Date().toLocaleDateString("vi-VN"),
    startTime: "09:00",
    endTime: "11:00",
    duration: 2,
    total: room.pricePerHour * 2,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">Thanh toán</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đặt phòng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phòng:</span>
                <span className="font-medium">{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày:</span>
                <span className="font-medium">{bookingDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời gian:</span>
                <span className="font-medium">
                  {bookingDetails.startTime} - {bookingDetails.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời lượng:</span>
                <span className="font-medium">{bookingDetails.duration} giờ</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Họ tên:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span className="font-medium">{customerPhone}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá phòng:</span>
                <span>{room.pricePerHour.toLocaleString("vi-VN")}đ/giờ</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{bookingDetails.total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Phương thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Thẻ tín dụng/ghi nợ</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, JCB</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="ewallet" id="ewallet" />
                <Label htmlFor="ewallet" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Ví điện tử</div>
                    <div className="text-sm text-muted-foreground">MoMo, ZaloPay, VNPay</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-muted-foreground">Chuyển khoản trực tiếp</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePayment} disabled={isProcessing} className="w-full" size="lg">
              {isProcessing ? "Đang xử lý..." : `Thanh toán ${bookingDetails.total.toLocaleString("vi-VN")}đ`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">Đang tải...</div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
