/**
 * Script to simulate IPN callback and test the IPN handler
 */

const bookingId = process.argv[2]

if (!bookingId) {
  console.error('❌ Usage: node scripts/test-ipn-simulator.js <bookingId>')
  process.exit(1)
}

const testPayloads = {
  success: {
    accessKey: process.env.PAY2S_ACCESS_KEY || '40fc988c0c175b57096f15bb03b4d098400f60b1f66d934446ec9063d45f6cfa',
    amount: 160000,
    extraData: '',
    message: 'Payment successful',
    orderId: bookingId,
    orderInfo: 'Test booking payment',
    orderType: 'booking',
    partnerCode: process.env.PAY2S_PARTNER_CODE || 'PAY2S8FE2PW8DSTKYTWN',
    payType: 'qr',
    requestId: 'REQ' + Date.now(),
    responseTime: Date.now(),
    resultCode: 0, // SUCCESS
    transId: 'TRANS' + Date.now(),
  },
  pending: {
    accessKey: process.env.PAY2S_ACCESS_KEY || '40fc988c0c175b57096f15bb03b4d098400f60b1f66d934446ec9063d45f6cfa',
    amount: 160000,
    extraData: '',
    message: 'Payment pending',
    orderId: bookingId,
    orderInfo: 'Test booking payment',
    orderType: 'booking',
    partnerCode: process.env.PAY2S_PARTNER_CODE || 'PAY2S8FE2PW8DSTKYTWN',
    payType: 'qr',
    requestId: 'REQ' + Date.now(),
    responseTime: Date.now(),
    resultCode: 1001, // PENDING
    transId: null,
  }
}

console.log('🧪 IPN Simulator')
console.log('================')
console.log('')
console.log('Available test scenarios:')
console.log('  1. Success (resultCode: 0) - Should mark booking as paid')
console.log('  2. Pending (resultCode: 1001) - Should skip, keep booking as unpaid')
console.log('')
console.log('To test manually:')
console.log('')
console.log('curl -X POST http://localhost:3000/api/payment/pay2s/ipn \\')
console.log('  -H "Content-Type: application/json" \\')
console.log('  -d \'' + JSON.stringify(testPayloads.pending, null, 2) + '\'')
console.log('')
console.log('Or for success:')
console.log('')
console.log('curl -X POST http://localhost:3000/api/payment/pay2s/ipn \\')
console.log('  -H "Content-Type: application/json" \\')
console.log('  -d \'' + JSON.stringify(testPayloads.success, null, 2) + '\'')
console.log('')
console.log('⚠️  Note: These test payloads will FAIL signature verification.')
console.log('   The IPN handler will reject them, which is correct behavior.')
console.log('   You need real Pay2S signed payloads to test successfully.')
