/**
 * Pay2S Payment Gateway Constants
 * https://docs.pay2s.vn
 */

export const PAY2S_RESULT_CODES = {
  SUCCESS: 0,
  AUTHORIZED: 9000,
  CANCELLED: 2,
  INVALID_SIGNATURE: 1002,
  TRANSACTION_NOT_FOUND: 1003,
} as const

export const PAY2S_RESULT_MESSAGES: Record<number, string> = {
  [PAY2S_RESULT_CODES.SUCCESS]: 'Giao dịch thành công',
  [PAY2S_RESULT_CODES.AUTHORIZED]: 'Giao dịch được cấp quyền thành công',
  [PAY2S_RESULT_CODES.CANCELLED]: 'Giao dịch đã bị hủy',
  [PAY2S_RESULT_CODES.INVALID_SIGNATURE]: 'Sai chữ ký xác thực',
  [PAY2S_RESULT_CODES.TRANSACTION_NOT_FOUND]: 'Giao dịch không tồn tại',
}

export const PAY2S_TRANSFER_TYPES = {
  IN: 'IN',   // Incoming payment
  OUT: 'OUT', // Outgoing payment
} as const

export const PAY2S_BANK_CODES = {
  VCB: 'VCB',       // Vietcombank
  TCB: 'TCB',       // Techcombank
  BIDV: 'BIDV',     // BIDV
  ACB: 'ACB',       // ACB
  MBB: 'MBB',       // MBBank
  TPB: 'TPB',       // TPBank
  VPB: 'VPB',       // VPBank
  SHB: 'SHB',       // SHB
  OCB: 'OCB',       // OCB
  MSB: 'MSB',       // MSB
  AGRI: 'AGRI',     // Agribank
  HDBank: 'HDBank', // HDBank
  VIB: 'VIB',       // VIB
  SCB: 'SCB',       // Sacombank
} as const

export const PAY2S_BANK_NAMES: Record<string, string> = {
  VCB: 'Vietcombank',
  TCB: 'Techcombank',
  BIDV: 'BIDV',
  ACB: 'ACB',
  MBB: 'MBBank',
  TPB: 'TPBank',
  VPB: 'VPBank',
  SHB: 'SHB',
  OCB: 'OCB',
  MSB: 'MSB',
  AGRI: 'Agribank',
  HDBank: 'HDBank',
  VIB: 'VIB',
  SCB: 'Sacombank',
}

export const PAY2S_CONFIG = {
  // IPN retry settings
  MAX_RETRY_ATTEMPTS: 5,
  RETRY_INTERVAL_SECONDS: 60,
  IPN_TIMEOUT_SECONDS: 30,
  
  // QR Code expiry
  QR_EXPIRY_MINUTES: 10,
  
  // Polling interval for frontend
  PAYMENT_STATUS_POLL_INTERVAL_MS: 3000, // 3 seconds
  
  // Rate limits
  API_RATE_LIMIT_PER_MINUTE: 60,
} as const

/**
 * Helper: Check if result code indicates success
 */
export function isPaymentSuccessful(resultCode: number): boolean {
  return resultCode === PAY2S_RESULT_CODES.SUCCESS || 
         resultCode === PAY2S_RESULT_CODES.AUTHORIZED
}

/**
 * Helper: Get result message from code
 */
export function getResultMessage(resultCode: number): string {
  return PAY2S_RESULT_MESSAGES[resultCode] || 'Lỗi không xác định'
}

/**
 * Helper: Get bank name from code
 */
export function getBankName(bankCode: string): string {
  return PAY2S_BANK_NAMES[bankCode] || bankCode
}
