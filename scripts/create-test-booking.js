/**
 * Script để tạo booking test và lấy payment URL
 * Run: node scripts/create-test-booking.js
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

// Booking Schema (matching current model)
const BookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    cccd: { type: String, required: true }, // CCCD/CMND
  },
  bookingDate: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  comboPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ComboPackage' },
  roomPrice: { type: Number, required: true },
  menuItems: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number,
  }],
  pricing: {
    roomTotal: { type: Number, required: true, default: 0 },
    menuTotal: { type: Number, default: 0 },
    subtotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'ewallet', 'bank', 'cash'],
  },
  paymentTransactionId: String,
  notes: String,
  checkInTime: Date,
  checkOutTime: Date,
  cancelledAt: Date,
  cancelReason: String,
}, { timestamps: true })

async function createTestBooking() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get Booking model
    const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema)

    // Get a room from database
    const Room = mongoose.models.Room || mongoose.model('Room', new mongoose.Schema({}, { strict: false }))
    const room = await Room.findOne()

    if (!room) {
      console.error('❌ No rooms found in database. Please create a room first.')
      process.exit(1)
    }

    console.log('🏠 Using room:', room.name)

    // Get branch from room
    const Branch = mongoose.models.Branch || mongoose.model('Branch', new mongoose.Schema({}, { strict: false }))
    const branch = await Branch.findById(room.branchId)

    if (!branch) {
      console.error('❌ Branch not found for room. Please check room data.')
      process.exit(1)
    }

    console.log('🏢 Branch:', branch.name)

    // Generate booking code
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const bookingCode = `BK${dateStr}${randomNum}`

    // Create test booking
    const bookingDate = new Date()
    bookingDate.setHours(0, 0, 0, 0)
    
    const startTime = new Date()
    startTime.setHours(startTime.getHours() + 1)
    startTime.setMinutes(0, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 2)

    const duration = 2 // hours
    const roomTotal = room.pricePerHour * duration

    const testBooking = new Booking({
      bookingCode,
      roomId: room._id,
      branchId: branch._id,
      bookingDate,
      startTime,
      endTime,
      duration,
      roomPrice: room.pricePerHour,
      customerInfo: {
        name: 'Nguyễn Văn Test',
        phone: '0123456789',
        email: 'test@example.com',
        cccd: '001202300001', // CCCD test 12 số
      },
      menuItems: [],
      pricing: {
        roomTotal,
        menuTotal: 0,
        subtotal: roomTotal,
        tax: 0,
        discount: 0,
        total: roomTotal,
      },
      status: 'pending',
      paymentStatus: 'unpaid',
    })

    await testBooking.save()

    console.log('\n✅ Test booking created successfully!')
    console.log('─────────────────────────────────────')
    console.log('📋 Booking Details:')
    console.log('   Booking ID:', testBooking._id.toString())
    console.log('   Booking Code:', testBooking.bookingCode)
    console.log('   Branch:', branch.name)
    console.log('   Room:', room.name)
    console.log('   Customer:', testBooking.customerInfo.name)
    console.log('   Phone:', testBooking.customerInfo.phone)
    console.log('   Date:', testBooking.bookingDate.toLocaleDateString('vi-VN'))
    console.log('   Start:', testBooking.startTime.toLocaleTimeString('vi-VN'))
    console.log('   End:', testBooking.endTime.toLocaleTimeString('vi-VN'))
    console.log('   Duration:', testBooking.duration, 'giờ')
    console.log('   Room Price:', testBooking.roomPrice.toLocaleString('vi-VN'), 'đ/giờ')
    console.log('   Total:', testBooking.pricing.total.toLocaleString('vi-VN'), 'đ')
    console.log('─────────────────────────────────────')
    console.log('\n🚀 Test Payment URL:')
    console.log(`   http://localhost:3000/payment?bookingId=${testBooking._id}`)
    console.log('\n💡 Open this URL in your browser to test payment flow!')
    console.log('')

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

createTestBooking()
