import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Booking, Room, Branch, ComboPackage } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/bookings/[id]
 * Lấy thông tin chi tiết một booking
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params

    // Support both ObjectId and bookingCode
    const booking = await Booking.findOne({
      $or: [{ _id: id }, { bookingCode: id.toUpperCase() }],
    })
      .populate('roomId', 'name code capacity images')
      .populate('branchId', 'name address phone')
      .populate('comboPackageId', 'name price duration description')
      .lean()

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bookings/[id]
 * PUT /api/bookings/[id]
 * Cập nhật booking (status, payment, check-in/out)
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const body = await request.json()

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      )
    }

    // Update allowed fields
    if (body.status !== undefined) booking.status = body.status
    if (body.paymentStatus !== undefined) booking.paymentStatus = body.paymentStatus
    if (body.paymentMethod !== undefined) booking.paymentMethod = body.paymentMethod
    if (body.checkInTime !== undefined) booking.checkInTime = new Date(body.checkInTime)
    if (body.checkOutTime !== undefined) booking.checkOutTime = new Date(body.checkOutTime)
    if (body.notes !== undefined) booking.notes = body.notes
    if (body.cancelReason !== undefined) booking.cancelReason = body.cancelReason

    if (body.status === 'cancelled') {
      booking.cancelledAt = new Date()
    }

    await booking.save()

    const updatedBooking = await Booking.findById(id)
      .populate('roomId', 'name code')
      .populate('branchId', 'name address')
      .lean()

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully',
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Alias PUT to PATCH for compatibility
export const PUT = PATCH

/**
 * DELETE /api/bookings/[id]
 * Xóa/Hủy booking
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      )
    }

    // Soft delete: chuyển status thành cancelled
    booking.status = 'cancelled'
    booking.cancelledAt = new Date()
    booking.cancelReason = 'Cancelled by user'
    await booking.save()

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
