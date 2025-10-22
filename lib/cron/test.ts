/**
 * Test Script for Cron Jobs
 * 
 * Chạy: npx tsx lib/cron/test.ts
 */

import { config } from 'dotenv'
import path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

async function testCleanupAPI() {
  console.log('🧪 Testing Cleanup API...\n')

  const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-change-me'
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    // Test 1: Preview (GET)
    console.log('1️⃣  Testing preview endpoint (GET)...')
    const previewResponse = await fetch(`${apiUrl}/api/bookings/cleanup`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
      },
    })

    const previewResult = await previewResponse.json()
    console.log('   Preview result:', JSON.stringify(previewResult, null, 2))
    console.log()

    // Test 2: Execute (POST)
    console.log('2️⃣  Testing execute endpoint (POST)...')
    const executeResponse = await fetch(`${apiUrl}/api/bookings/cleanup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    })

    const executeResult = await executeResponse.json()
    console.log('   Execute result:', JSON.stringify(executeResult, null, 2))
    console.log()

    // Test 3: Check cron status
    console.log('3️⃣  Testing cron status endpoint...')
    const statusResponse = await fetch(`${apiUrl}/api/cron/status`)
    const statusResult = await statusResponse.json()
    console.log('   Status result:', JSON.stringify(statusResult, null, 2))
    console.log()

    console.log('✅ All tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests
testCleanupAPI()
