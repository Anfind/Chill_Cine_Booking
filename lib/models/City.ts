import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICity extends Document {
  code: string
  name: string
  slug: string
  isActive: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const CitySchema = new Schema<ICity>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
CitySchema.index({ code: 1 })
CitySchema.index({ slug: 1 })
CitySchema.index({ isActive: 1, displayOrder: 1 })

export default (mongoose.models.City as Model<ICity>) || mongoose.model<ICity>('City', CitySchema)
