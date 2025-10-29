// TTLock API Types

export interface TTLockCredentials {
  clientId: string
  clientSecret: string
  username?: string
  password?: string // Plain text, will be MD5 hashed
}

export interface TTLockTokenResponse {
  access_token: string
  uid: number
  expires_in: number
  scope: string
  refresh_token: string
}

export interface TTLockUnlockResponse {
  errcode: number
  errmsg: string
  description?: string
}

export interface TTLockLockDetail {
  lockId: number
  lockAlias: string
  electricQuantity: number // Battery %
  lockMac: string
  lockSound: number // 1=locked, 2=unlocked
}

export interface UnlockLog {
  timestamp: Date
  lockId: number
  success: boolean
  mode: 'mock' | 'real'
  response?: any
  error?: string
  responseTime?: number
}

export type TestMode = 'mock' | 'real'

export interface TTLockConfig {
  mode: TestMode
  credentials?: TTLockCredentials
  lockId?: number
}
