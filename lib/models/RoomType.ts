import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRoomType extends Document {
  name: string
  slug: string
  description: string
  features: string[]
  color: string
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const RoomTypeSchema = new Schema<IRoomType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: '#ec4899', // Pink default
    },
    displayOrder: {
      type: Number,
      default: 0,
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
RoomTypeSchema.index({ slug: 1 })
RoomTypeSchema.index({ isActive: 1, displayOrder: 1 })

export default (mongoose.models.RoomType as Model<IRoomType>) ||
  mongoose.model<IRoomType>('RoomType', RoomTypeSchema)
