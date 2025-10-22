"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PaymentDebugPage() {
  const [bookingId, setBookingId] = useState("68f4b7feb2dc78a488d5d105")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testCreatePayment = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🔄 Testing /api/payment/pay2s/create with bookingId:", bookingId)
      
      const response = await fetch("/api/payment/pay2s/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })

      console.log("📥 Response status:", response.status)
      
      const data = await response.json()
      console.log("📥 Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "API call failed")
      }

      setResult(data)
    } catch (err: any) {
      console.error("❌ Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testCheckStatus = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🔄 Testing /api/payment/status with bookingId:", bookingId)
      
      const response = await fetch(`/api/payment/status?bookingId=${bookingId}`)
      const data = await response.json()

      console.log("📥 Response:", data)

      if (!response.ok) {
        throw new Error(data.error || "API call failed")
      }

      setResult(data)
    } catch (err: any) {
      console.error("❌ Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment API Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookingId">Booking ID</Label>
              <Input
                id="bookingId"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter booking ID"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={testCreatePayment} disabled={loading}>
                {loading ? "Testing..." : "Test Create Payment"}
              </Button>
              <Button onClick={testCheckStatus} disabled={loading} variant="outline">
                {loading ? "Testing..." : "Test Check Status"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-500">❌ Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-red-50 p-4 rounded text-sm overflow-auto">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-500">✅ Success</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-green-50 p-4 rounded text-sm overflow-auto max-h-[500px]">
                {JSON.stringify(result, null, 2)}
              </pre>

              {result.qrCode && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">QR Code:</h3>
                  <img src={result.qrCode} alt="QR Code" className="max-w-xs" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Enter a valid booking ID</p>
            <p>2. Click "Test Create Payment" to create a Pay2S payment link</p>
            <p>3. Check the console (F12) for detailed logs</p>
            <p>4. If you see QR code here, payment creation worked!</p>
            <p className="text-muted-foreground mt-4">
              Current test booking ID: 68f4b7feb2dc78a488d5d105
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
