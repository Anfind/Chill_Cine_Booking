import { connect, disconnect } from 'mongoose'
import User from '../models/User'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chillcinehotel'

async function seedAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await connect(MONGODB_URI)
    console.log('✅ Connected!')

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@chillcine.com' })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!')
      console.log('📧 Email:', existingAdmin.email)
      console.log('👤 Name:', existingAdmin.name)
      console.log('🔑 Role:', existingAdmin.role)
      return
    }

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@chillcine.com',
      password: 'Admin@123', // Will be hashed by pre-save hook
      name: 'Admin',
      role: 'admin',
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('👤 Name:', adminUser.name)
    console.log('🔑 Role:', adminUser.role)
    console.log('🔐 Password:', 'Admin@123')
    console.log('')
    console.log('🎉 You can now login at: http://localhost:3000/auth/login')
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
  } finally {
    await disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

seedAdminUser()
