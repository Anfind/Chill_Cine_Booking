/**
 * Script test Pay2S IPN
 * Run: node test-pay2s-ipn.js
 */

const crypto = require('crypto')

// Thông tin từ .env.local
const SECRET_KEY = '872e484b36d07f1d92e3f8a1ddaacac5f2e7d68b0fb5a6ac6b25d2ee51c78a58'
const ACCESS_KEY = '40fc988c0c175b57096f15bb03b4d098400f60b1f66d934446ec9063d45f6cfa'
const PARTNER_CODE = 'PAY2S8FE2PW8DSTKYTWN'

// Mock IPN data
const ipnData = {
  accessKey: ACCESS_KEY,
  amount: 200000,
  extraData: '',
  message: 'Giao dịch thành công',
  orderId: '670a1234567890abcdef1234', // Fake booking ID - thay bằng booking ID thật từ DB
  orderInfo: 'BK202510190001',
  orderType: 'pay2s',
  partnerCode: PARTNER_CODE,
  payType: 'qr',
  requestId: Date.now().toString(),
  responseTime: Date.now().toString(),
  resultCode: 0,
  transId: 2588659987,
}

// Tạo signature
const rawHash = `accessKey=${ipnData.accessKey}&amount=${ipnData.amount}&extraData=${ipnData.extraData}&message=${ipnData.message}&orderId=${ipnData.orderId}&orderInfo=${ipnData.orderInfo}&orderType=${ipnData.orderType}&partnerCode=${ipnData.partnerCode}&payType=${ipnData.payType}&requestId=${ipnData.requestId}&responseTime=${ipnData.responseTime}&resultCode=${ipnData.resultCode}&transId=${ipnData.transId}`

const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(rawHash)
  .digest('hex')

ipnData.m2signature = signature

console.log('📝 IPN Test Data:')
console.log(JSON.stringify(ipnData, null, 2))
console.log('\n🔐 Raw Hash (first 100 chars):')
console.log(rawHash.substring(0, 100) + '...')
console.log('\n🔑 Signature:')
console.log(signature)
console.log('\n📤 Sending to IPN endpoint...\n')

// Gửi IPN request
fetch('https://b0fd13d62299.ngrok-free.app/api/payment/pay2s/ipn', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(ipnData),
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Response:', data)
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
  })
