/**
 * Script to monitor IPN logs from the development server
 * Run this in a separate terminal while testing payments
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Monitoring for IPN logs...')
console.log('📋 When you test payment, check the main dev server terminal for:')
console.log('')
console.log('Expected logs:')
console.log('  📨 Pay2S IPN Received: { ... }')
console.log('  ⏭️  Skipping IPN - resultCode XXX is not success')
console.log('  OR')
console.log('  ✅ Payment confirmed for booking BKXXXXXXXXXXXX')
console.log('')
console.log('⚠️  IMPORTANT: Check the resultCode value!')
console.log('   - resultCode: 0 or 9000 = SUCCESS (will update booking)')
console.log('   - resultCode: other values = PENDING/FAILED (will skip)')
console.log('')
console.log('If booking is marked as paid immediately without transfer:')
console.log('  1. Check the IPN log for resultCode value')
console.log('  2. Check if Pay2S is sending test/old transactions')
console.log('  3. Verify the transId in the IPN matches a real transaction')
console.log('')
console.log('Press Ctrl+C to exit')

// Keep the script running
setInterval(() => {
  // Do nothing, just keep alive
}, 10000)
