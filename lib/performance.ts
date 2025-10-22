// Performance optimization utilities

/**
 * Delay function for debouncing
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Debounce function for search, form inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for scroll, resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Intersection Observer for lazy loading
 */
export const createLazyLoader = (
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined') return null

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback()
        observer.disconnect()
      }
    })
  }, options)

  return observer
}

/**
 * Preload critical resources
 */
export const preloadResource = (href: string, as: string) => {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = href
  document.head.appendChild(link)
}

/**
 * Cache API responses in memory (simple implementation)
 */
const cache = new Map<string, { data: any; timestamp: number }>()

export const cacheGet = <T>(key: string, ttl: number = 60000): T | null => {
  const cached = cache.get(key)
  if (!cached) return null

  const age = Date.now() - cached.timestamp
  if (age > ttl) {
    cache.delete(key)
    return null
  }

  return cached.data as T
}

export const cacheSet = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() })
}

export const cacheClear = (key?: string) => {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
