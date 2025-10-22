/**
 * Delete test booking by ID
 * Run: node scripts/delete-booking.js <BOOKING_ID>
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

async function deleteBooking() {
  try {
    const bookingId = process.argv[2] || '68f4b7feb2dc78a488d5d105'
    
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Booking = mongoose.models.Booking || mongoose.model('Booking', new mongoose.Schema({}, { strict: false }))
    
    const result = await Booking.deleteOne({ _id: bookingId })
    
    if (result.deletedCount > 0) {
      console.log('✅ Booking deleted:', bookingId)
    } else {
      console.log('⚠️  Booking not found:', bookingId)
    }

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

deleteBooking()
