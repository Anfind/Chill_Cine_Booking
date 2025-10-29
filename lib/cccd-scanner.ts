import jsQR from 'jsqr'

export interface CCCDData {
  idNumber: string
  fullName: string
  dateOfBirth: string
  gender: string
  address: string
  issueDate?: string
  expiryDate?: string
  nationality?: string
  ethnicity?: string
  religion?: string
  personalIdentification?: string
  raw: string
}

/**
 * Parse Vietnamese CCCD QR code data
 * Format: field1|field2|field3|...
 * Example: 001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC, Quận 1, TP.HCM|01012021
 */
export function parseCCCDQRData(qrData: string): CCCDData | null {
  try {
    const fields = qrData.split('|')
    
    // CCCD mới có định dạng chuẩn theo Circular 07/2016/TT-BCA
    // Minimum fields: ID, Name, DOB, Gender, Address
    if (fields.length < 5) {
      console.error('Invalid CCCD QR format: insufficient fields')
      return null
    }

    // Parse basic fields
    const idNumber = fields[0]?.trim() || ''
    const fullName = fields[1]?.trim() || ''
    const dateOfBirth = fields[2]?.trim() || ''
    const gender = fields[3]?.trim() || ''
    const address = fields[4]?.trim() || ''
    
    // Optional fields (may vary by CCCD version)
    const issueDate = fields[5]?.trim()
    const expiryDate = fields[6]?.trim()
    const nationality = fields[7]?.trim()
    const ethnicity = fields[8]?.trim()
    const religion = fields[9]?.trim()
    const personalIdentification = fields[10]?.trim()

    return {
      idNumber,
      fullName,
      dateOfBirth,
      gender,
      address,
      issueDate,
      expiryDate,
      nationality,
      ethnicity,
      religion,
      personalIdentification,
      raw: qrData,
    }
  } catch (error) {
    console.error('Error parsing CCCD QR data:', error)
    return null
  }
}

/**
 * Scan QR code from image file with multiple attempts
 */
export async function scanQRFromImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            console.error('Cannot get canvas context')
            resolve(null)
            return
          }

          // Set canvas size to image size
          canvas.width = img.width
          canvas.height = img.height
          
          console.log(`Image size: ${img.width}x${img.height}`)
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0)
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          console.log('Scanning QR code...')
          
          // Try scanning with different inversion modes
          const attempts = ['dontInvert', 'onlyInvert', 'attemptBoth'] as const
          
          for (const inversionMode of attempts) {
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: inversionMode,
            })
            
            if (qrCode && qrCode.data) {
              console.log('QR Code found!', qrCode.data.substring(0, 50) + '...')
              resolve(qrCode.data)
              return
            }
          }
          
          // If still not found, try with resized image (sometimes helps)
          console.log('First attempt failed, trying with resized image...')
          const maxSize = 1500
          let newWidth = img.width
          let newHeight = img.height
          
          if (img.width > maxSize || img.height > maxSize) {
            if (img.width > img.height) {
              newWidth = maxSize
              newHeight = (img.height * maxSize) / img.width
            } else {
              newHeight = maxSize
              newWidth = (img.width * maxSize) / img.height
            }
            
            canvas.width = newWidth
            canvas.height = newHeight
            ctx.drawImage(img, 0, 0, newWidth, newHeight)
            
            const resizedImageData = ctx.getImageData(0, 0, newWidth, newHeight)
            
            for (const inversionMode of attempts) {
              const qrCode = jsQR(resizedImageData.data, newWidth, newHeight, {
                inversionAttempts: inversionMode,
              })
              
              if (qrCode && qrCode.data) {
                console.log('QR Code found with resized image!')
                resolve(qrCode.data)
                return
              }
            }
          }
          
          console.error('QR Code not found after all attempts')
          resolve(null)
        } catch (error) {
          console.error('Error scanning QR:', error)
          resolve(null)
        }
      }
      
      img.onerror = (error) => {
        console.error('Image load error:', error)
        resolve(null)
      }
      
      if (e.target?.result) {
        img.src = e.target.result as string
      } else {
        console.error('No image data in FileReader result')
        resolve(null)
      }
    }
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error)
      resolve(null)
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Format: DDMMYYYY or DD/MM/YYYY
 * @returns age in years
 */
export function calculateAge(dateOfBirth: string): number | null {
  try {
    // Remove any non-digit characters
    const digits = dateOfBirth.replace(/\D/g, '')
    
    if (digits.length !== 8) {
      return null
    }

    const day = parseInt(digits.substring(0, 2), 10)
    const month = parseInt(digits.substring(2, 4), 10)
    const year = parseInt(digits.substring(4, 8), 10)

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
      return null
    }

    const birthDate = new Date(year, month - 1, day)
    const today = new Date()
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  } catch (error) {
    console.error('Error calculating age:', error)
    return null
  }
}

/**
 * Normalize Vietnamese string for comparison
 * Removes diacritics and converts to lowercase
 */
export function normalizeVietnameseString(str: string): string {
  // Remove extra spaces
  let normalized = str.trim().replace(/\s+/g, ' ')
  
  // Convert to lowercase
  normalized = normalized.toLowerCase()
  
  // Remove Vietnamese diacritics
  const diacriticsMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
  }
  
  return normalized.split('').map(char => diacriticsMap[char] || char).join('')
}

/**
 * Compare two Vietnamese names
 * Returns true if they match (ignoring diacritics and case)
 */
export function compareVietnameseNames(name1: string, name2: string): boolean {
  const normalized1 = normalizeVietnameseString(name1)
  const normalized2 = normalizeVietnameseString(name2)
  return normalized1 === normalized2
}

/**
 * Validate CCCD data
 */
export function validateCCCDData(
  cccdData: CCCDData, 
  inputName: string,
  minAge: number = 18
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate name match
  if (!compareVietnameseNames(cccdData.fullName, inputName)) {
    errors.push(`Tên trên CCCD (${cccdData.fullName}) không khớp với tên đã nhập (${inputName})`)
  }

  // Validate age
  const age = calculateAge(cccdData.dateOfBirth)
  if (age === null) {
    errors.push('Không thể xác định ngày sinh từ CCCD')
  } else if (age < minAge) {
    errors.push(`Bạn phải từ ${minAge} tuổi trở lên (hiện tại: ${age} tuổi)`)
  }

  // Validate ID number format (12 digits)
  if (!/^\d{12}$/.test(cccdData.idNumber)) {
    errors.push('Số CCCD không hợp lệ (phải là 12 chữ số)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
