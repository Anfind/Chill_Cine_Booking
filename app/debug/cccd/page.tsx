"use client"

import { CCCDScanner } from '@/components/cccd-scanner'
import { CCCDTester } from '@/components/cccd-tester'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CCCDDebugPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CCCD Scanner Debug</h1>
        <p className="text-muted-foreground">
          Tool để test và debug tính năng quét CCCD
        </p>
      </div>

      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="tester">Data Tester</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <Card className="p-6">
            <CCCDScanner
              customerName="Nguyễn Văn A"
              minAge={18}
              onScanSuccess={(data) => {
                console.log('✅ Scan Success:', data)
              }}
              onScanError={(error) => {
                console.error('❌ Scan Error:', error)
              }}
            />
          </Card>

          <Card className="p-6 mt-4 bg-muted">
            <h3 className="font-semibold mb-3">Debug Tips:</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Mở Developer Console (F12) để xem logs chi tiết</li>
              <li>✓ Kiểm tra tab Console để thấy quá trình scan</li>
              <li>✓ Nếu không có CCCD thật, dùng tab "Data Tester"</li>
              <li>✓ Ảnh CCCD nên có độ phân giải tối thiểu 800x600</li>
              <li>✓ QR code phải rõ nét, không bị mờ hoặc lóe</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="tester">
          <CCCDTester />

          <Card className="p-6 mt-4 bg-muted">
            <h3 className="font-semibold mb-3">Hướng dẫn sử dụng:</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Nhập hoặc chọn test case có sẵn</li>
              <li>Click "Test Parse & Validate"</li>
              <li>Kiểm tra kết quả parse và validation</li>
              <li>Sử dụng để test logic mà không cần ảnh CCCD</li>
            </ol>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 mt-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ Development Only
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Trang này chỉ dùng cho development/testing. Không nên expose ra production.
          <br />
          Xem logs trong Console (F12) để debug chi tiết.
        </p>
      </Card>
    </div>
  )
}
