"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { scanQRFromImage, parseCCCDQRData, validateCCCDData, type CCCDData } from '@/lib/cccd-scanner'
import { cn } from '@/lib/utils'

interface CCCDScannerProps {
  customerName: string
  minAge?: number
  onScanSuccess: (data: CCCDData) => void
  onScanError?: (error: string) => void
  className?: string
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error'

export function CCCDScanner({
  customerName,
  minAge = 18,
  onScanSuccess,
  onScanError,
  className,
}: CCCDScannerProps) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [cccdData, setCccdData] = useState<CCCDData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errMsg = 'Vui lòng chọn file ảnh'
      console.error(errMsg)
      setErrorMessage(errMsg)
      setScanStatus('error')
      onScanError?.(errMsg)
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Start scanning
    setScanStatus('scanning')
    setErrorMessage('')
    console.log('Starting QR scan...')

    try {
      // Scan QR code
      console.log('Calling scanQRFromImage...')
      const qrData = await scanQRFromImage(file)
      
      console.log('QR scan result:', qrData ? `Found (length: ${qrData.length})` : 'Not found')
      
      if (!qrData) {
        throw new Error('Không tìm thấy mã QR trên ảnh CCCD. Vui lòng:\n• Chụp rõ nét hơn\n• Đảm bảo có đủ ánh sáng\n• QR code phải nằm trong khung hình\n• Thử chụp gần hơn hoặc xa hơn')
      }

      // Parse QR data
      console.log('Parsing QR data...')
      const parsedData = parseCCCDQRData(qrData)
      
      console.log('Parsed result:', parsedData)
      
      if (!parsedData) {
        throw new Error(`Không thể đọc dữ liệu từ mã QR.\n\nDữ liệu QR: ${qrData.substring(0, 100)}...\n\nVui lòng kiểm tra lại ảnh hoặc thử CCCD khác.`)
      }

      // Validate data
      console.log('Validating CCCD data...')
      const validation = validateCCCDData(parsedData, customerName, minAge)
      
      console.log('Validation result:', validation)
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'))
      }

      // Success
      console.log('CCCD scan successful!')
      setCccdData(parsedData)
      setScanStatus('success')
      onScanSuccess(parsedData)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi quét CCCD'
      console.error('CCCD scan error:', error)
      setErrorMessage(message)
      setScanStatus('error')
      onScanError?.(message)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleReset = () => {
    setScanStatus('idle')
    setCccdData(null)
    setErrorMessage('')
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label className="text-base font-medium">
          Xác thực CCCD <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Chụp ảnh CCCD (mặt có mã QR) để xác thực danh tính
        </p>
      </div>

      {/* Upload Button */}
      {scanStatus === 'idle' && (
        <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/20">
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-center gap-4">
              <Camera className="h-12 w-12 text-muted-foreground/50" />
              <Upload className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Chụp hoặc tải ảnh CCCD</p>
              <p className="text-xs text-muted-foreground">
                CCCD phải có mã QR (CCCD gắn chip từ 2021)
              </p>
            </div>
            <Button
              type="button"
              onClick={handleButtonClick}
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              Chọn ảnh CCCD
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Card>
      )}

      {/* Scanning Status */}
      {scanStatus === 'scanning' && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <div className="p-6 text-center space-y-4">
            {previewImage && (
              <div className="flex justify-center">
                <img
                  src={previewImage}
                  alt="CCCD Preview"
                  className="max-h-48 rounded-lg border-2 border-blue-500"
                />
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-blue-600">Đang quét mã QR...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Status */}
      {scanStatus === 'success' && cccdData && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <div className="p-6 space-y-4">
            {previewImage && (
              <div className="flex justify-center">
                <img
                  src={previewImage}
                  alt="CCCD Preview"
                  className="max-h-48 rounded-lg border-2 border-green-500"
                />
              </div>
            )}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-green-600">Xác thực thành công!</p>
                <div className="space-y-1 text-sm">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-muted-foreground">Số CCCD:</span>
                    <span className="font-medium">{cccdData.idNumber}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-muted-foreground">Họ tên:</span>
                    <span className="font-medium">{cccdData.fullName}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-muted-foreground">Ngày sinh:</span>
                    <span className="font-medium">
                      {cccdData.dateOfBirth.substring(0, 2)}/
                      {cccdData.dateOfBirth.substring(2, 4)}/
                      {cccdData.dateOfBirth.substring(4, 8)}
                    </span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-muted-foreground">Giới tính:</span>
                    <span className="font-medium">{cccdData.gender}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              Quét lại
            </Button>
          </div>
        </Card>
      )}

      {/* Error Status */}
      {scanStatus === 'error' && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <div className="p-6 space-y-4">
            {previewImage && (
              <div className="flex justify-center">
                <img
                  src={previewImage}
                  alt="CCCD Preview"
                  className="max-h-48 rounded-lg border-2 border-red-500 opacity-75"
                />
              </div>
            )}
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-red-600">Xác thực thất bại</p>
                <p className="text-sm text-red-600 whitespace-pre-line">{errorMessage}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              Thử lại
            </Button>
          </div>
        </Card>
      )}

      {/* Info Alert */}
      {scanStatus === 'idle' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Chỉ chấp nhận CCCD gắn chip (từ 2021) có mã QR ở mặt sau</li>
              <li>Chụp ảnh rõ nét, đầy đủ thông tin và mã QR</li>
              <li>Tên trên CCCD phải khớp với tên đã nhập ở trên</li>
              <li>Chỉ chấp nhận người từ {minAge} tuổi trở lên</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
