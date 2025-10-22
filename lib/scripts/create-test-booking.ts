/**
 * Create Test Booking Script
 * 
 * Tạo booking test với timestamp cũ để kiểm tra auto-cancel
 * 
 * Chạy: npx tsx lib/scripts/create-test-booking.ts
 */

import { config } from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || ''

async function createTestBooking() {
  console.log('🔍 Connecting to MongoDB...\n')
  
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { collection: 'bookings', strict: false }))

    // Tạo booking với createdAt = 15 phút trước (quá hạn)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

    const testBooking = {
      bookingCode: `TEST-${Date.now()}`,
      branchId: new mongoose.Types.ObjectId('000000000000000000000000'),
      roomId: new mongoose.Types.ObjectId('000000000000000000000000'),
      date: new Date(),
      startTime: '14:00',
      endTime: '16:00',
      totalPrice: 100000,
      status: 'pending',
      paymentStatus: 'unpaid',
      customerInfo: {
        name: 'Test Customer',
        phone: '0123456789',
        email: 'test@example.com'
      },
      createdAt: fifteenMinutesAgo,
      updatedAt: fifteenMinutesAgo
    }

    const created = await Booking.create(testBooking)
    const createdDoc: any = created.toObject()

    console.log('✅ Test booking created:')
    console.log(`   Code: ${createdDoc.bookingCode}`)
    console.log(`   Created: ${createdDoc.createdAt.toISOString()}`)
    console.log(`   Age: 15 minutes (should be auto-cancelled)`)
    console.log()
    console.log('⏰ Next cron run will be in ~2 minutes')
    console.log('   Check admin UI to see if it gets cancelled automatically')

    await mongoose.disconnect()

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createTestBooking()
