import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Booking, Room, Branch } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/stats
 * Lấy thống kê tổng quan cho admin dashboard
 */
export async function GET() {
  try {
    await connectDB()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // 1. Tổng số bookings trong tháng này
    const totalBookingsThisMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth },
    })

    const totalBookingsLastMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    })

    const bookingsChange =
      totalBookingsLastMonth > 0
        ? Math.round(((totalBookingsThisMonth - totalBookingsLastMonth) / totalBookingsLastMonth) * 100)
        : 0

    // 2. Doanh thu tháng này (chỉ tính bookings đã thanh toán)
    const revenueThisMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
        },
      },
    ])

    const revenueLastMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
        },
      },
    ])

    const revenueThisMonthValue = revenueThisMonth[0]?.total || 0
    const revenueLastMonthValue = revenueLastMonth[0]?.total || 0

    const revenueChange =
      revenueLastMonthValue > 0
        ? Math.round(((revenueThisMonthValue - revenueLastMonthValue) / revenueLastMonthValue) * 100)
        : 0

    // 3. Số khách hàng unique (theo phone number) trong tháng này
    const customersThisMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: '$customerInfo.phone',
        },
      },
      {
        $count: 'total',
      },
    ])

    const customersLastMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: '$customerInfo.phone',
        },
      },
      {
        $count: 'total',
      },
    ])

    const customersThisMonthValue = customersThisMonth[0]?.total || 0
    const customersLastMonthValue = customersLastMonth[0]?.total || 0

    const customersChange =
      customersLastMonthValue > 0
        ? Math.round(((customersThisMonthValue - customersLastMonthValue) / customersLastMonthValue) * 100)
        : 0

    // 4. Tỷ lệ lấp đầy (occupancy rate)
    // Tính: Số giờ đã đặt / Tổng số giờ có thể đặt trong tháng
    const totalRooms = await Room.countDocuments({ isActive: true })
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const totalAvailableHours = totalRooms * daysInMonth * 24 // tổng giờ có thể đặt

    const bookedHours = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfMonth },
          status: { $nin: ['cancelled'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$duration' },
        },
      },
    ])

    const bookedHoursValue = bookedHours[0]?.total || 0
    const occupancyRate = totalAvailableHours > 0 ? Math.round((bookedHoursValue / totalAvailableHours) * 100) : 0

    // Giả sử tháng trước có occupancy tương tự hoặc tính được
    const occupancyChange = 5 // Mock value, có thể tính thực tế nếu cần

    // 5. Recent bookings (10 bookings gần nhất)
    const recentBookings = await Booking.find()
      .populate('roomId', 'name code')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // 6. Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    // 7. Daily revenue last 7 days (for chart)
    const last7Days = new Date(now)
    last7Days.setDate(now.getDate() - 6) // 7 days including today
    last7Days.setHours(0, 0, 0, 0)

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: last7Days },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          revenue: { $sum: '$pricing.total' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // 8. Hourly bookings today (for chart)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    const hourlyBookings = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfToday, $lt: endOfToday },
        },
      },
      {
        $group: {
          _id: { $hour: '$startTime' },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // 9. Weekly occupancy rate (last 7 days)
    const dailyOccupancy = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: last7Days },
          status: { $nin: ['cancelled'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          bookedHours: { $sum: '$duration' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Calculate occupancy percentage for each day
    const dailyAvailableHours = totalRooms * 24
    const occupancyTrend = dailyOccupancy.map((day: any) => ({
      date: day._id,
      bookedHours: day.bookedHours,
      occupancy: dailyAvailableHours > 0 ? Math.round((day.bookedHours / dailyAvailableHours) * 100) : 0,
    }))

    // 10. Top rooms by revenue
    const topRooms = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$roomId',
          revenue: { $sum: '$pricing.total' },
          bookings: { $sum: 1 },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'room',
        },
      },
      {
        $unwind: '$room',
      },
      {
        $project: {
          roomName: '$room.name',
          roomCode: '$room.code',
          revenue: 1,
          bookings: 1,
        },
      },
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalBookings: {
            value: totalBookingsThisMonth,
            change: bookingsChange,
            comparison: totalBookingsLastMonth,
          },
          revenue: {
            value: revenueThisMonthValue,
            change: revenueChange,
            comparison: revenueLastMonthValue,
          },
          customers: {
            value: customersThisMonthValue,
            change: customersChange,
            comparison: customersLastMonthValue,
          },
          occupancyRate: {
            value: occupancyRate,
            change: occupancyChange,
            bookedHours: bookedHoursValue,
            availableHours: totalAvailableHours,
          },
        },
        recentBookings: recentBookings.map((booking: any) => ({
          _id: booking._id,
          bookingCode: booking.bookingCode,
          room: booking.roomId?.name || 'N/A',
          roomCode: booking.roomId?.code || 'N/A',
          branch: booking.branchId?.name || 'N/A',
          customer: booking.customerInfo.name,
          phone: booking.customerInfo.phone,
          startTime: booking.startTime,
          endTime: booking.endTime,
          total: booking.pricing.total,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
        })),
        bookingsByStatus,
        dailyRevenue,
        hourlyBookings,
        occupancyTrend,
        topRooms,
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
