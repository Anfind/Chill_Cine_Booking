/**
 * API Client Utilities
 * Helper functions để fetch data từ MongoDB API
 */

// Use relative URLs for API calls - works with ngrok and any domain
const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
  filters?: Record<string, any>
}

/**
 * Generic fetch function với error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    // Always use relative URLs from client-side (browser)
    // This ensures API calls work with ngrok or any domain
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'API request failed',
        message: data.message,
      }
    }

    return data
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    return {
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Cities API
 */
export async function fetchCities() {
  return apiFetch<any[]>('/api/cities')
}

/**
 * Branches API
 */
export async function fetchBranches(cityId?: string) {
  const query = cityId ? `?cityId=${cityId}` : ''
  return apiFetch<any[]>(`/api/branches${query}`)
}

export async function fetchBranchById(id: string) {
  return apiFetch<any>(`/api/branches/${id}`)
}

/**
 * Rooms API
 */
export async function fetchRooms(branchId?: string, status?: string) {
  const params = new URLSearchParams()
  if (branchId) params.append('branchId', branchId)
  if (status) params.append('status', status)

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<any[]>(`/api/rooms${query}`)
}

export async function fetchRoomById(id: string) {
  return apiFetch<any>(`/api/rooms/${id}`)
}

/**
 * Combo Packages API
 */
export async function fetchComboPackages() {
  return apiFetch<any[]>('/api/combos')
}

/**
 * Menu Items API
 */
export async function fetchMenuItems(category?: string) {
  const query = category ? `?category=${category}` : ''
  return apiFetch<any[]>(`/api/menu${query}`)
}

/**
 * Bookings API
 */
export async function fetchBookings(filters?: { roomId?: string; date?: string; branchId?: string }) {
  const params = new URLSearchParams()
  if (filters?.roomId) params.append('roomId', filters.roomId)
  if (filters?.date) params.append('date', filters.date)
  if (filters?.branchId) params.append('branchId', filters.branchId)

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<any[]>(`/api/bookings${query}`)
}

export async function fetchBookingById(id: string) {
  return apiFetch<any>(`/api/bookings/${id}`)
}

export async function createBooking(bookingData: any) {
  return apiFetch<any>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  })
}

export async function updateBooking(id: string, updateData: any) {
  return apiFetch<any>(`/api/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  })
}

export async function cancelBooking(id: string) {
  return apiFetch<any>(`/api/bookings/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Client-side fetch với revalidation
 */
export async function fetchWithRevalidate<T>(endpoint: string, revalidate: number = 0) {
  return apiFetch<T>(endpoint, {
    next: { revalidate },
  })
}

/**
 * Server Component fetch với cache
 */
export async function fetchWithCache<T>(endpoint: string, cache: RequestCache = 'force-cache') {
  return apiFetch<T>(endpoint, { cache })
}
