/**
 * Cron Jobs Service
 * 
 * Quản lý các scheduled tasks tự động chạy theo lịch trình
 * 
 * Jobs:
 * 1. Cleanup Expired Bookings - Chạy mỗi 2 phút để hủy booking quá hạn thanh toán
 */

import cron from 'node-cron'

// Track if cron jobs are running
let isInitialized = false

/**
 * Initialize all cron jobs
 * Chỉ chạy 1 lần khi server start
 */
export function initCronJobs() {
  // Prevent duplicate initialization
  if (isInitialized) {
    console.log('⏰ Cron jobs already initialized, skipping...')
    return
  }

  console.log('🚀 Initializing cron jobs...')

  // Job 1: Cleanup expired bookings - Chạy mỗi 2 phút
  // Cron pattern: */2 * * * * = every 2 minutes
  const cleanupJob = cron.schedule('*/2 * * * *', async () => {
    const now = new Date()
    console.log(`\n⏰ [${now.toLocaleTimeString('vi-VN')}] Running booking cleanup job...`)

    try {
      const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-change-me'
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      const response = await fetch(`${apiUrl}/api/bookings/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        if (result.cancelledCount > 0) {
          console.log(`✅ Cleanup job completed: ${result.cancelledCount} booking(s) cancelled`)
          console.log('   Cancelled bookings:', result.bookings.map((b: any) => b.bookingCode).join(', '))
        } else {
          console.log('✅ Cleanup job completed: No expired bookings')
        }
      } else {
        console.error('❌ Cleanup job failed:', result.error)
      }
    } catch (error) {
      console.error('❌ Error running cleanup job:', error instanceof Error ? error.message : error)
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
  })

  console.log('✅ Cron job initialized: Booking Cleanup (every 2 minutes)')
  console.log('   Pattern: */2 * * * * (every 2 minutes)')
  console.log('   Timezone: Asia/Ho_Chi_Minh (GMT+7)')
  console.log('   Status: Running ✓')

  isInitialized = true

  // Return cleanup function (optional - for graceful shutdown)
  return () => {
    console.log('🛑 Stopping cron jobs...')
    cleanupJob.stop()
    isInitialized = false
  }
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs() {
  if (!isInitialized) {
    console.log('⏰ Cron jobs not running, nothing to stop')
    return
  }

  cron.getTasks().forEach((task) => {
    task.stop()
  })

  isInitialized = false
  console.log('✅ All cron jobs stopped')
}

/**
 * Get status of cron jobs
 */
export function getCronJobsStatus() {
  const tasks = cron.getTasks()
  return {
    initialized: isInitialized,
    tasksCount: tasks.size,
  }
}
