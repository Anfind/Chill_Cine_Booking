/**
 * Initialize Cron Jobs on Server Startup
 * 
 * File này được import trong layout.tsx hoặc app startup
 * để khởi động cron jobs khi server Next.js start
 */

import { initCronJobs } from './jobs'

// Chỉ chạy cron jobs trên server-side (không chạy trong browser)
// Tắt cron jobs trên Vercel vì sẽ dùng Vercel Cron thay thế
if (typeof window === 'undefined' && !process.env.VERCEL) {
  // Chỉ chạy trong development local
  // Không chạy trong build time hoặc production (Vercel)
  if (process.env.NODE_ENV === 'development') {
    try {
      initCronJobs()
      console.log('✅ Cron jobs initialization completed (Development only)')
    } catch (error) {
      console.error('❌ Failed to initialize cron jobs:', error)
    }
  }
}

export { initCronJobs, stopCronJobs, getCronJobsStatus } from './jobs'
