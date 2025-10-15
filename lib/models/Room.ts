import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRoom extends Document {
  branchId: mongoose.Types.ObjectId
  roomTypeId: mongoose.Types.ObjectId
  name: string
  code: string
  capacity: number
  pricePerHour: number
  images: string[]
  amenities: string[]
  description: string
  status: 'available' | 'maintenance' | 'unavailable'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const RoomSchema = new Schema<IRoom>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'unavailable'],
      default: 'available',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
RoomSchema.index({ branchId: 1, isActive: 1, status: 1 })
RoomSchema.index({ code: 1, branchId: 1 }, { unique: true })
RoomSchema.index({ roomTypeId: 1 })

export default (mongoose.models.Room as Model<IRoom>) || mongoose.model<IRoom>('Room', RoomSchema)
