import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBooking extends Document {
  bookingCode: string
  roomId: mongoose.Types.ObjectId
  branchId: mongoose.Types.ObjectId
  customerId?: mongoose.Types.ObjectId
  customerInfo: {
    name: string
    phone: string
    email?: string
    cccd: string // Căn cước công dân (12 chữ số)
  }
  bookingDate: Date
  startTime: Date
  endTime: Date
  duration: number
  comboPackageId?: mongoose.Types.ObjectId
  roomPrice: number
  menuItems: Array<{
    menuItemId: mongoose.Types.ObjectId
    name: string
    price: number
    quantity: number
    subtotal: number
  }>
  pricing: {
    roomTotal: number
    menuTotal: number
    subtotal: number
    tax: number
    discount: number
    total: number
  }
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  paymentMethod?: 'card' | 'ewallet' | 'bank' | 'cash'
  paymentTransactionId?: string // Pay2S transaction ID
  notes?: string
  checkInTime?: Date
  checkOutTime?: Date
  cancelledAt?: Date
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    customerInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      cccd: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function(v: string) {
            // CCCD mới: 12 chữ số
            // CMND cũ: 9 hoặc 12 chữ số
            return /^\d{9}$|^\d{12}$/.test(v)
          },
          message: 'CCCD/CMND phải là 9 hoặc 12 chữ số'
        }
      },
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    comboPackageId: {
      type: Schema.Types.ObjectId,
      ref: 'ComboPackage',
    },
    roomPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    menuItems: [
      {
        menuItemId: {
          type: Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
      },
    ],
    pricing: {
      roomTotal: {
        type: Number,
        required: true,
        default: 0,
      },
      menuTotal: {
        type: Number,
        default: 0,
      },
      subtotal: {
        type: Number,
        required: true,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        default: 0,
      },
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
    paymentTransactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    checkInTime: Date,
    checkOutTime: Date,
    cancelledAt: Date,
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
BookingSchema.index({ bookingCode: 1 })
BookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 })
BookingSchema.index({ branchId: 1, bookingDate: 1 })
BookingSchema.index({ customerId: 1, createdAt: -1 })
BookingSchema.index({ status: 1, paymentStatus: 1 })
BookingSchema.index({ 'customerInfo.phone': 1 })

export default (mongoose.models.Booking as Model<IBooking>) || mongoose.model<IBooking>('Booking', BookingSchema)
