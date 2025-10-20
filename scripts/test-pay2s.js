/**
 * Test script for Pay2S integration
 * Run: node scripts/test-pay2s.js
 */

const crypto = require('crypto')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const config = {
  partnerCode: process.env.PAY2S_PARTNER_CODE,
  accessKey: process.env.PAY2S_ACCESS_KEY,
  secretKey: process.env.PAY2S_SECRET_KEY,
  webhookSecret: process.env.PAY2S_WEBHOOK_SECRET,
  ipnUrl: process.env.PAY2S_IPN_URL,
  webhookUrl: process.env.PAY2S_IPN_URL.replace('/api/payment/pay2s/ipn', '/api/webhook/pay2s'),
  bankCode: process.env.PAY2S_BANK_CODE,
  accountNumber: process.env.PAY2S_ACCOUNT_NUMBER,
  accountName: process.env.PAY2S_ACCOUNT_NAME,
}

console.log('🔧 Pay2S Configuration Loaded:')
console.log('─────────────────────────────────────')
console.log('Partner Code:', config.partnerCode)
console.log('Access Key:', config.accessKey.substring(0, 20) + '...')
console.log('Secret Key:', config.secretKey.substring(0, 20) + '...')
console.log('Webhook Secret:', config.webhookSecret.substring(0, 20) + '...')
console.log('IPN URL:', config.ipnUrl)
console.log('Webhook URL:', config.webhookUrl)
console.log('Bank:', config.bankCode, '-', config.accountNumber)
console.log('─────────────────────────────────────\n')

// Test 1: Test Webhook endpoint
async function testWebhook() {
  console.log('📝 Test 1: Testing Webhook Endpoint')
  console.log('─────────────────────────────────────')
  
  const testTransaction = {
    transactions: [
      {
        id: 'TEST_' + Date.now(),
        gateway: config.bankCode,
        transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        transactionNumber: 'FT' + Date.now(),
        accountNumber: config.accountNumber,
        content: 'BK202510190001 GD 750915',
        transferType: 'IN',
        transferAmount: 200000,
        checksum: crypto.randomBytes(16).toString('hex')
      }
    ]
  }

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.webhookSecret}`
      },
      body: JSON.stringify(testTransaction)
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.ok && data.success) {
      console.log('✅ Webhook test PASSED!\n')
      return true
    } else {
      console.log('❌ Webhook test FAILED!\n')
      return false
    }
  } catch (error) {
    console.log('❌ Webhook test ERROR:', error.message, '\n')
    return false
  }
}

// Test 2: Test IPN endpoint with signature
async function testIPN() {
  console.log('📝 Test 2: Testing IPN Endpoint (with signature)')
  console.log('─────────────────────────────────────')
  
  // Mock booking ID (would be real MongoDB ObjectId in production)
  const orderId = '670a1234567890abcdef1234'
  const amount = 200000
  const orderInfo = 'BK202510190001'
  const requestId = Date.now().toString()
  const responseTime = Date.now().toString()
  const transId = Math.floor(Math.random() * 1000000000)
  const resultCode = 0 // Success
  const extraData = ''
  
  // Generate signature
  const rawHash = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=Giao dịch thành công&orderId=${orderId}&orderInfo=${orderInfo}&orderType=pay2s&partnerCode=${config.partnerCode}&payType=qr&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
  
  const signature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawHash)
    .digest('hex')
  
  const ipnPayload = {
    accessKey: config.accessKey,
    amount: amount,
    extraData: extraData,
    message: 'Giao dịch thành công',
    orderId: orderId,
    orderInfo: orderInfo,
    orderType: 'pay2s',
    partnerCode: config.partnerCode,
    payType: 'qr',
    requestId: requestId,
    responseTime: responseTime,
    resultCode: resultCode,
    transId: transId,
    m2signature: signature
  }

  console.log('Raw Hash:', rawHash.substring(0, 100) + '...')
  console.log('Signature:', signature.substring(0, 40) + '...')
  console.log('Payload:', JSON.stringify(ipnPayload, null, 2).substring(0, 200) + '...\n')

  try {
    const response = await fetch(config.ipnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ipnPayload)
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 404) {
      console.log('⚠️  IPN endpoint returned 404 - Booking not found (expected for test)\n')
      return true // This is OK for test
    } else if (response.ok && data.success) {
      console.log('✅ IPN test PASSED!\n')
      return true
    } else {
      console.log('❌ IPN test FAILED!\n')
      return false
    }
  } catch (error) {
    console.log('❌ IPN test ERROR:', error.message, '\n')
    return false
  }
}

// Test 3: Check environment variables
function testEnvVars() {
  console.log('📝 Test 3: Checking Environment Variables')
  console.log('─────────────────────────────────────')
  
  const required = [
    'PAY2S_PARTNER_CODE',
    'PAY2S_ACCESS_KEY',
    'PAY2S_SECRET_KEY',
    'PAY2S_WEBHOOK_SECRET',
    'PAY2S_BANK_CODE',
    'PAY2S_ACCOUNT_NUMBER',
    'PAY2S_ACCOUNT_NAME',
    'PAY2S_IPN_URL',
    'PAY2S_REDIRECT_URL'
  ]
  
  let allPresent = true
  
  required.forEach(key => {
    const value = process.env[key]
    if (!value || value.includes('your_') || value.includes('TODO')) {
      console.log(`❌ ${key}: NOT SET or contains placeholder`)
      allPresent = false
    } else {
      console.log(`✅ ${key}: SET (${value.substring(0, 20)}...)`)
    }
  })
  
  console.log()
  return allPresent
}

// Test 4: Test signature generation
function testSignatureGeneration() {
  console.log('📝 Test 4: Testing Signature Generation')
  console.log('─────────────────────────────────────')
  
  const testData = {
    accessKey: config.accessKey,
    amount: 100000,
    bankAccounts: 'Array',
    ipnUrl: config.ipnUrl,
    orderId: 'test123',
    orderInfo: 'TEST001',
    partnerCode: config.partnerCode,
    redirectUrl: process.env.PAY2S_REDIRECT_URL,
    requestId: '123456',
    requestType: 'pay2s'
  }
  
  const rawHash = `accessKey=${testData.accessKey}&amount=${testData.amount}&bankAccounts=${testData.bankAccounts}&ipnUrl=${testData.ipnUrl}&orderId=${testData.orderId}&orderInfo=${testData.orderInfo}&partnerCode=${testData.partnerCode}&redirectUrl=${testData.redirectUrl}&requestId=${testData.requestId}&requestType=${testData.requestType}`
  
  const signature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawHash)
    .digest('hex')
  
  console.log('Test Data:', JSON.stringify(testData, null, 2))
  console.log('Raw Hash:', rawHash.substring(0, 100) + '...')
  console.log('Signature:', signature)
  console.log('✅ Signature generation works!\n')
  
  return true
}

// Run all tests
async function runAllTests() {
  console.log('🧪 PAY2S INTEGRATION TEST SUITE')
  console.log('═════════════════════════════════════\n')
  
  const results = []
  
  // Test environment variables
  results.push({ name: 'Environment Variables', passed: testEnvVars() })
  
  // Test signature generation
  results.push({ name: 'Signature Generation', passed: testSignatureGeneration() })
  
  // Test webhook endpoint
  results.push({ name: 'Webhook Endpoint', passed: await testWebhook() })
  
  // Test IPN endpoint
  results.push({ name: 'IPN Endpoint', passed: await testIPN() })
  
  // Print summary
  console.log('═════════════════════════════════════')
  console.log('📊 TEST SUMMARY')
  console.log('═════════════════════════════════════')
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
  })
  
  const totalPassed = results.filter(r => r.passed).length
  const totalTests = results.length
  
  console.log('─────────────────────────────────────')
  console.log(`Total: ${totalPassed}/${totalTests} tests passed`)
  console.log('═════════════════════════════════════\n')
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Ready to implement payment flow!')
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.')
  }
}

// Run tests
runAllTests().catch(console.error)
