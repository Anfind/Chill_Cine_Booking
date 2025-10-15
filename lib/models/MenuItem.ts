import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMenuItem extends Document {
  name: string
  price: number
  category: 'drink' | 'snack' | 'food' | 'extra'
  image: string
  description: string
  isAvailable: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['drink', 'snack', 'food', 'extra'],
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isAvailable: {
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
MenuItemSchema.index({ category: 1, isAvailable: 1, displayOrder: 1 })

export default (mongoose.models.MenuItem as Model<IMenuItem>) ||
  mongoose.model<IMenuItem>('MenuItem', MenuItemSchema)
