import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'

/**
 * GET /api/payment/status?bookingId=xxx
 * Check payment status of a booking
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId parameter' },
        { status: 400 }
      )
    }

    await connectDB()

    const booking = await Booking.findById(bookingId)
      .select('paymentStatus status bookingCode pricing.total paymentTransactionId')
      .lean()

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        total: booking.pricing.total,
        transactionId: booking.paymentTransactionId,
      },
    })
  } catch (error) {
    console.error('❌ Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
