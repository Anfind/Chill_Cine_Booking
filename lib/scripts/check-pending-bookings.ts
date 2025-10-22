/**
 * Debug Script - Check Pending Bookings
 * 
 * Chạy: npx tsx lib/scripts/check-pending-bookings.ts
 */

import { config } from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || ''

async function checkPendingBookings() {
  console.log('🔍 Connecting to MongoDB...\n')
  
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { collection: 'bookings', strict: false }))

    // Get current time
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - 10 * 60 * 1000) // 10 minutes ago

    console.log('⏰ Current time:', now.toISOString())
    console.log('⏰ Cutoff time (10 min ago):', cutoffTime.toISOString())
    console.log()

    // Find all pending AND cancelled unpaid bookings
    const allPending = await Booking.find({
      status: 'pending',
      paymentStatus: 'unpaid'
    })
    .select('bookingCode createdAt customerInfo.name status')
    .lean()

    const allCancelled = await Booking.find({
      status: 'cancelled',
      paymentStatus: 'unpaid'
    })
    .select('bookingCode createdAt customerInfo.name status')
    .lean()

    console.log(`📊 Total pending unpaid bookings: ${allPending.length}`)
    console.log(`📊 Total cancelled unpaid bookings: ${allCancelled.length}`)
    console.log()

    if (allPending.length === 0 && allCancelled.length === 0) {
      console.log('✅ No pending or cancelled bookings found')
      await mongoose.disconnect()
      return
    }

    // Categorize by age
    const expired: any[] = []
    const notExpired: any[] = []
    const cancelledList: any[] = []

    // Process pending bookings
    allPending.forEach((booking: any) => {
      const createdAt = new Date(booking.createdAt)
      const ageInMinutes = (now.getTime() - createdAt.getTime()) / (60 * 1000)
      
      const bookingInfo = {
        code: booking.bookingCode,
        customer: booking.customerInfo?.name || 'N/A',
        createdAt: createdAt.toISOString(),
        ageMinutes: Math.floor(ageInMinutes),
        ageSeconds: Math.floor((now.getTime() - createdAt.getTime()) / 1000),
        status: booking.status
      }

      if (createdAt < cutoffTime) {
        expired.push(bookingInfo)
      } else {
        notExpired.push(bookingInfo)
      }
    })

    // Process cancelled bookings
    allCancelled.forEach((booking: any) => {
      const createdAt = new Date(booking.createdAt)
      const ageInMinutes = (now.getTime() - createdAt.getTime()) / (60 * 1000)
      
      cancelledList.push({
        code: booking.bookingCode,
        customer: booking.customerInfo?.name || 'N/A',
        createdAt: createdAt.toISOString(),
        ageMinutes: Math.floor(ageInMinutes),
        ageSeconds: Math.floor((now.getTime() - createdAt.getTime()) / 1000),
        status: booking.status
      })
    })

    console.log(`🔴 EXPIRED (should be cancelled): ${expired.length} bookings`)
    console.log(`🟢 NOT EXPIRED (< 10 min): ${notExpired.length} bookings`)
    console.log(`❌ CANCELLED (already cancelled): ${cancelledList.length} bookings`)
    console.log()

    if (cancelledList.length > 0) {
      console.log('✅ CANCELLED BOOKINGS (cron job worked):')
      console.log('─'.repeat(80))
      cancelledList.forEach((b, i) => {
        console.log(`${i + 1}. ${b.code} - ${b.customer}`)
        console.log(`   Created: ${b.createdAt}`)
        console.log(`   Age: ${b.ageMinutes} minutes (${b.ageSeconds} seconds)`)
        console.log(`   Status: ${b.status}`)
        console.log()
      })
    }

    if (expired.length > 0) {
      console.log('⚠️  BOOKINGS THAT SHOULD BE CANCELLED (but still pending):')
      console.log('─'.repeat(80))
      expired.forEach((b, i) => {
        console.log(`${i + 1}. ${b.code} - ${b.customer}`)
        console.log(`   Created: ${b.createdAt}`)
        console.log(`   Age: ${b.ageMinutes} minutes (${b.ageSeconds} seconds)`)
        console.log()
      })
    }

    if (notExpired.length > 0) {
      console.log('ℹ️  RECENT BOOKINGS (< 10 minutes):')
      console.log('─'.repeat(80))
      notExpired.forEach((b, i) => {
        console.log(`${i + 1}. ${b.code} - ${b.customer}`)
        console.log(`   Created: ${b.createdAt}`)
        console.log(`   Age: ${b.ageMinutes} minutes (${b.ageSeconds} seconds)`)
        console.log()
      })
    }

    await mongoose.disconnect()
    console.log('✅ Done')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkPendingBookings()
