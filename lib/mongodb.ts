import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: any
    promise: Promise<any> | null
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chill-cine-hotel'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Log connection info (hide password)
const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
console.log(`📡 Connecting to: ${maskedUri}`)

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
      // Serverless-specific options for Vercel
      serverApi: {
        version: '1' as const,
        strict: true,
        deprecationErrors: true,
      },
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully')
        return mongoose
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
