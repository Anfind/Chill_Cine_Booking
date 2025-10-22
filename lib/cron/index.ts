/**
 * Initialize Cron Jobs on Server Startup
 * 
 * File này được import trong layout.tsx hoặc app startup
 * để khởi động cron jobs khi server Next.js start
 */

import { initCronJobs } from './jobs'

// Chỉ chạy cron jobs trên server-side (không chạy trong browser)
if (typeof window === 'undefined') {
  // Chỉ chạy trong production hoặc development
  // Không chạy trong build time
  if (process.env.NODE_ENV !== 'test') {
    try {
      initCronJobs()
      console.log('✅ Cron jobs initialization completed')
    } catch (error) {
      console.error('❌ Failed to initialize cron jobs:', error)
    }
  }
}

export { initCronJobs, stopCronJobs, getCronJobsStatus } from './jobs'
