"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ChevronLeft, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Clock,
  QrCode,
  Building2
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // States
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [isPolling, setIsPolling] = useState(false)

  const bookingId = searchParams.get("bookingId")

  // Fetch booking details
  useEffect(() => {
    if (!bookingId) {
      setError("Không tìm thấy thông tin đặt phòng")
      setIsLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/payment/status?bookingId=${bookingId}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Không thể tải thông tin đặt phòng")
        }

        setBookingData(data.data)

        // If already paid, redirect to success
        if (data.data.paymentStatus === "paid") {
          router.push(`/payment/success?bookingId=${bookingId}&code=${data.data.bookingCode}`)
          return
        }

        setIsLoading(false)
      } catch (err: any) {
        setError(err.message)
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router])

  // Create payment when component mounts
  useEffect(() => {
    if (!bookingData || paymentData || isCreatingPayment) return

    const createPayment = async () => {
      setIsCreatingPayment(true)
      try {
        // Clean up expired payment cache from localStorage
        const cleanupExpiredCache = () => {
          const now = Date.now()
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('payment_')) {
              try {
                const cached = JSON.parse(localStorage.getItem(key) || '{}')
                if (cached.createdAt) {
                  const elapsed = (now - new Date(cached.createdAt).getTime()) / 1000
                  if (elapsed >= 600) {
                    console.log(`🗑️  Removing expired cache: ${key}`)
                    localStorage.removeItem(key)
                  }
                }
              } catch (e) {
                // Invalid cache, remove it
                localStorage.removeItem(key)
              }
            }
          })
        }
        
        // Cleanup first
        cleanupExpiredCache()
        
        // Try to get existing payment data from localStorage
        const storageKey = `payment_${bookingId}`
        const cached = localStorage.getItem(storageKey)
        
        if (cached) {
          try {
            const cachedData = JSON.parse(cached)
            // Check if cache is still valid (within 10 minutes)
            const createdTime = new Date(cachedData.createdAt).getTime()
            const now = Date.now()
            const elapsed = Math.floor((now - createdTime) / 1000)
            
            if (elapsed < 600) {
              console.log(`♻️  Using cached payment data for booking ${bookingId}`)
              setPaymentData(cachedData)
              const remaining = Math.max(0, 600 - elapsed)
              setTimeLeft(remaining)
              setIsPolling(true)
              setIsCreatingPayment(false)
              return
            } else {
              console.log('🗑️  Cache expired, creating new payment')
              localStorage.removeItem(storageKey)
            }
          } catch (e) {
            console.error('Error parsing cached payment data:', e)
            localStorage.removeItem(storageKey)
          }
        }
        
        // Create new payment
        const res = await fetch("/api/payment/pay2s/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Không thể tạo thanh toán")
        }

        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(data))
        
        setPaymentData(data)
        
        // Tính thời gian còn lại dựa trên createdAt
        if (data.createdAt) {
          const createdTime = new Date(data.createdAt).getTime()
          const now = Date.now()
          const elapsed = Math.floor((now - createdTime) / 1000) // seconds đã trôi qua
          const remaining = Math.max(0, 600 - elapsed) // 600s = 10 phút
          setTimeLeft(remaining)
        }
        
        setIsPolling(true)
      } catch (err: any) {
        toast.error(err.message)
        setError(err.message)
      } finally {
        setIsCreatingPayment(false)
      }
    }

    createPayment()
  }, [bookingData, paymentData, isCreatingPayment, bookingId])

  // Poll payment status every 3 seconds
  useEffect(() => {
    if (!isPolling || !bookingId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?bookingId=${bookingId}`)
        const data = await res.json()

        if (data.success && data.data.paymentStatus === "paid") {
          setIsPolling(false)
          clearInterval(interval)
          
          // Clear cache when payment successful
          const storageKey = `payment_${bookingId}`
          localStorage.removeItem(storageKey)
          
          toast.success("Thanh toán thành công!")
          setTimeout(() => {
            router.push(`/payment/success?bookingId=${bookingId}&code=${data.data.bookingCode}`)
          }, 1000)
        }
      } catch (err) {
        console.error("Error polling payment status:", err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPolling, bookingId, router])

  // Countdown timer
  useEffect(() => {
    if (!paymentData || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          
          // Show toast notification
          toast.error("Hết thời gian thanh toán. Đơn đặt phòng đã bị huỷ.", {
            duration: 5000,
          })
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            router.push("/")
          }, 2000)
          
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentData, timeLeft, router])

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}`)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin đặt phòng...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Có lỗi xảy ra</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bankInfo = {
    bank: "ACB",
    accountNumber: "22226061",
    accountName: "HÀ VĂN TÙNG",
    amount: bookingData?.total || 0,
    content: bookingData?.bookingCode || "",
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()} 
                className="h-9 w-9"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold text-lg">Thanh toán</h1>
            </div>
            {paymentData && timeLeft > 0 && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className={timeLeft < 60 ? "text-red-500" : "text-orange-500"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {/* Status Alert */}
        {isPolling && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Đang chờ thanh toán... Hệ thống sẽ tự động cập nhật khi phát hiện giao dịch.
            </AlertDescription>
          </Alert>
        )}

        {/* QR Code Section */}
        {paymentData?.qrCode && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5" />
                Quét mã QR để thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code Image */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Image
                    src={paymentData.qrCode}
                    alt="QR Code"
                    width={280}
                    height={280}
                    className="rounded"
                    priority
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Mở app ngân hàng và quét mã QR
                </p>
                <p className="text-lg font-semibold text-primary">
                  {bookingData?.total.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Transfer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Thông tin chuyển khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {/* Bank */}
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Ngân hàng</div>
                  <div className="font-semibold">{bankInfo.bank}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(bankInfo.bank, "tên ngân hàng")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Account Number */}
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Số tài khoản</div>
                  <div className="font-semibold font-mono">{bankInfo.accountNumber}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(bankInfo.accountNumber, "số tài khoản")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Account Name */}
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Chủ tài khoản</div>
                  <div className="font-semibold">{bankInfo.accountName}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(bankInfo.accountName, "tên chủ tài khoản")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div>
                  <div className="text-xs text-muted-foreground">Số tiền</div>
                  <div className="font-bold text-lg text-primary">
                    {bankInfo.amount.toLocaleString("vi-VN")}đ
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(bankInfo.amount.toString(), "số tiền")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Transfer Content */}
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                <div className="flex-1">
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ⚠️ Nội dung chuyển khoản (BẮT BUỘC)
                  </div>
                  <div className="font-bold text-lg font-mono">{bankInfo.content}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(bankInfo.content, "nội dung")}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200 text-sm">
                <strong>Lưu ý quan trọng:</strong> Vui lòng nhập chính xác nội dung{" "}
                <strong>{bankInfo.content}</strong> để hệ thống tự động xác nhận thanh toán.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đặt phòng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã đặt phòng:</span>
              <span className="font-mono font-semibold">{bookingData?.bookingCode}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng thanh toán:</span>
              <span className="text-primary">
                {bookingData?.total.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Hướng dẫn thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p>Quét mã QR bằng app ngân hàng hoặc chuyển khoản thủ công</p>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p>Nhập chính xác số tiền và nội dung chuyển khoản</p>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p>Hệ thống tự động xác nhận trong vòng 5-10 giây</p>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p>Bạn sẽ nhận được xác nhận qua SMS</p>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-sm text-muted-foreground py-4">
          Cần hỗ trợ? Liên hệ hotline:{" "}
          <a
            href={`tel:${process.env.NEXT_PUBLIC_HOTLINE}`}
            className="font-semibold text-primary hover:underline"
          >
            {process.env.NEXT_PUBLIC_HOTLINE || "0989760000"}
          </a>
        </div>
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
