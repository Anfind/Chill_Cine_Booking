"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { parseCCCDQRData, validateCCCDData, type CCCDData } from '@/lib/cccd-scanner'
import { toast } from 'sonner'

/**
 * Component để test parse và validate CCCD QR data
 * Chỉ dùng cho development/testing
 */
export function CCCDTester() {
  const [qrText, setQrText] = useState('001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC, Quận 1, TP.HCM|01012021')
  const [customerName, setCustomerName] = useState('Nguyễn Văn A')
  const [parsedData, setParsedData] = useState<CCCDData | null>(null)
  const [validationResult, setValidationResult] = useState<any>(null)

  const handleTest = () => {
    console.log('Testing QR data:', qrText)
    
    // Parse
    const parsed = parseCCCDQRData(qrText)
    console.log('Parsed:', parsed)
    setParsedData(parsed)
    
    if (!parsed) {
      toast.error('Không thể parse QR data')
      return
    }
    
    // Validate
    const validation = validateCCCDData(parsed, customerName, 18)
    console.log('Validation:', validation)
    setValidationResult(validation)
    
    if (validation.isValid) {
      toast.success('Validation thành công!')
    } else {
      toast.error('Validation thất bại: ' + validation.errors.join(', '))
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">CCCD QR Data Tester</h3>
        <p className="text-sm text-muted-foreground">
          Tool để test parse và validate QR data mà không cần ảnh CCCD thật
        </p>
      </div>

      <Alert>
        <AlertDescription className="text-xs">
          <strong>Format QR CCCD:</strong>
          <br />
          Số CCCD|Họ tên|Ngày sinh (DDMMYYYY)|Giới tính|Địa chỉ|Ngày cấp|...
          <br />
          <br />
          <strong>Ví dụ:</strong>
          <br />
          001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC|01012021
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="qr-text">QR Data (pipe-separated)</Label>
        <Textarea
          id="qr-text"
          value={qrText}
          onChange={(e) => setQrText(e.target.value)}
          placeholder="001234567890|Nguyễn Văn A|01011990|Nam|..."
          className="font-mono text-sm mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="customer-name">Tên khách hàng (để validate)</Label>
        <Input
          id="customer-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nguyễn Văn A"
          className="mt-1"
        />
      </div>

      <Button onClick={handleTest} className="w-full">
        Test Parse & Validate
      </Button>

      {parsedData && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 space-y-2">
          <h4 className="font-semibold text-sm">Parsed Data:</h4>
          <div className="text-xs font-mono space-y-1">
            <div><strong>Số CCCD:</strong> {parsedData.idNumber}</div>
            <div><strong>Họ tên:</strong> {parsedData.fullName}</div>
            <div><strong>Ngày sinh:</strong> {parsedData.dateOfBirth}</div>
            <div><strong>Giới tính:</strong> {parsedData.gender}</div>
            <div><strong>Địa chỉ:</strong> {parsedData.address}</div>
            {parsedData.issueDate && <div><strong>Ngày cấp:</strong> {parsedData.issueDate}</div>}
            {parsedData.expiryDate && <div><strong>Ngày hết hạn:</strong> {parsedData.expiryDate}</div>}
          </div>
        </Card>
      )}

      {validationResult && (
        <Card className={`p-4 space-y-2 ${validationResult.isValid ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
          <h4 className="font-semibold text-sm">Validation Result:</h4>
          {validationResult.isValid ? (
            <p className="text-sm text-green-600">✅ Validation thành công!</p>
          ) : (
            <div className="text-sm text-red-600 space-y-1">
              {validationResult.errors.map((error: string, idx: number) => (
                <div key={idx}>❌ {error}</div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Alert>
        <AlertDescription className="text-xs">
          <strong>Quick Test Cases:</strong>
          <br />
          <button
            onClick={() => {
              setQrText('001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC|01012021')
              setCustomerName('Nguyễn Văn A')
            }}
            className="text-blue-600 underline mr-3"
          >
            Valid (18+, tên khớp)
          </button>
          <button
            onClick={() => {
              setQrText('001234567890|Trần Thị B|01011990|Nữ|456 Đường XYZ|01012021')
              setCustomerName('Nguyễn Văn A')
            }}
            className="text-blue-600 underline mr-3"
          >
            Tên không khớp
          </button>
          <button
            onClick={() => {
              setQrText('001234567890|Nguyễn Văn C|01012010|Nam|789 Đường DEF|01012021')
              setCustomerName('Nguyễn Văn C')
            }}
            className="text-blue-600 underline"
          >
            Chưa đủ 18 tuổi
          </button>
        </AlertDescription>
      </Alert>
    </Card>
  )
}
