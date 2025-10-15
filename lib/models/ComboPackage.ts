import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IComboPackage extends Document {
  name: string
  code: string
  duration: number
  price: number
  description: string
  isSpecial: boolean
  timeRange?: {
    start: string
    end: string
  }
  extraFeePerHour: number
  isActive: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const ComboPackageSchema = new Schema<IComboPackage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    timeRange: {
      start: String,
      end: String,
    },
    extraFeePerHour: {
      type: Number,
      default: 50000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
ComboPackageSchema.index({ code: 1 })
ComboPackageSchema.index({ isActive: 1, displayOrder: 1 })

export default (mongoose.models.ComboPackage as Model<IComboPackage>) ||
  mongoose.model<IComboPackage>('ComboPackage', ComboPackageSchema)
