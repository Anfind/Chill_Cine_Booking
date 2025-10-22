/**
 * MongoDB Performance Optimization
 * 
 * Script để tạo indexes cho các collections quan trọng
 * Chạy script này sau khi seed database để tăng tốc queries
 * 
 * Usage: pnpm tsx lib/scripts/create-indexes.ts
 */

import mongoose from 'mongoose'
import connectDB from '../mongodb'
import { 
  Booking, 
  Room, 
  Branch, 
  City, 
  ComboPackage, 
  MenuItem,
  User 
} from '../models'

async function createIndexes() {
  try {
    console.log('🚀 Creating MongoDB indexes for performance...\n')
    
    await connectDB()

    // Booking indexes
    console.log('📋 Creating Booking indexes...')
    await Booking.collection.createIndex({ bookingCode: 1 }, { unique: true })
    await Booking.collection.createIndex({ status: 1 })
    await Booking.collection.createIndex({ paymentStatus: 1 })
    await Booking.collection.createIndex({ roomId: 1 })
    await Booking.collection.createIndex({ branchId: 1 })
    await Booking.collection.createIndex({ createdAt: -1 })
    await Booking.collection.createIndex({ startTime: 1, endTime: 1 })
    await Booking.collection.createIndex({ 
      status: 1, 
      paymentStatus: 1, 
      createdAt: -1 
    })
    console.log('   ✅ Booking indexes created')

    // Room indexes
    console.log('📋 Creating Room indexes...')
    await Room.collection.createIndex({ code: 1 }, { unique: true })
    await Room.collection.createIndex({ branchId: 1 })
    await Room.collection.createIndex({ roomTypeId: 1 })
    await Room.collection.createIndex({ status: 1 })
    await Room.collection.createIndex({ isActive: 1 })
    await Room.collection.createIndex({ 
      branchId: 1, 
      status: 1, 
      isActive: 1 
    })
    console.log('   ✅ Room indexes created')

    // Branch indexes
    console.log('📋 Creating Branch indexes...')
    await Branch.collection.createIndex({ slug: 1 }, { unique: true })
    await Branch.collection.createIndex({ cityId: 1 })
    await Branch.collection.createIndex({ isActive: 1 })
    await Branch.collection.createIndex({ 
      cityId: 1, 
      isActive: 1 
    })
    console.log('   ✅ Branch indexes created')

    // City indexes
    console.log('📋 Creating City indexes...')
    await City.collection.createIndex({ code: 1 }, { unique: true })
    await City.collection.createIndex({ slug: 1 }, { unique: true })
    await City.collection.createIndex({ isActive: 1 })
    console.log('   ✅ City indexes created')

    // ComboPackage indexes
    console.log('📋 Creating ComboPackage indexes...')
    await ComboPackage.collection.createIndex({ code: 1 }, { unique: true })
    await ComboPackage.collection.createIndex({ isActive: 1 })
    await ComboPackage.collection.createIndex({ displayOrder: 1 })
    console.log('   ✅ ComboPackage indexes created')

    // MenuItem indexes
    console.log('📋 Creating MenuItem indexes...')
    await MenuItem.collection.createIndex({ category: 1 })
    await MenuItem.collection.createIndex({ isAvailable: 1 })
    await MenuItem.collection.createIndex({ displayOrder: 1 })
    console.log('   ✅ MenuItem indexes created')

    // User indexes
    console.log('📋 Creating User indexes...')
    await User.collection.createIndex({ email: 1 }, { unique: true })
    await User.collection.createIndex({ role: 1 })
    console.log('   ✅ User indexes created')

    console.log('\n✅ All indexes created successfully!')
    console.log('🚀 Database is now optimized for performance')

    // List all indexes
    console.log('\n📊 Index Summary:')
    const collections = [
      { name: 'Bookings', model: Booking },
      { name: 'Rooms', model: Room },
      { name: 'Branches', model: Branch },
      { name: 'Cities', model: City },
      { name: 'Combos', model: ComboPackage },
      { name: 'MenuItems', model: MenuItem },
      { name: 'Users', model: User },
    ]

    for (const { name, model } of collections) {
      const indexes = await model.collection.listIndexes().toArray()
      console.log(`   ${name}: ${indexes.length} indexes`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  createIndexes()
}

export default createIndexes
