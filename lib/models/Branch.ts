import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBranch extends Document {
  cityId: mongoose.Types.ObjectId
  name: string
  slug: string
  address: string
  phone: string
  location: {
    lat: number
    lng: number
  }
  images: string[]
  openingHours: {
    open: string
    close: string
  }
  amenities: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BranchSchema = new Schema<IBranch>(
  {
    cityId: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
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
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      lat: {
        type: Number,
        default: 0,
      },
      lng: {
        type: Number,
        default: 0,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    openingHours: {
      open: {
        type: String,
        default: '00:00',
      },
      close: {
        type: String,
        default: '23:59',
      },
    },
    amenities: {
      type: [String],
      default: [],
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
BranchSchema.index({ cityId: 1, isActive: 1 })
BranchSchema.index({ slug: 1 })

export default (mongoose.models.Branch as Model<IBranch>) || mongoose.model<IBranch>('Branch', BranchSchema)
