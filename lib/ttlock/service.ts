import crypto from 'crypto'
import {
  TTLockCredentials,
  TTLockTokenResponse,
  TTLockUnlockResponse,
  TTLockLockDetail,
  TestMode,
} from './types'

export class TTLockService {
  private baseURL = 'https://api.sciener.com'
  private mode: TestMode = 'mock'
  private accessToken?: string
  private clientId?: string

  constructor(mode: TestMode = 'mock') {
    this.mode = mode
  }

  /**
   * Get access token from TTLock API
   * Requires: username + password (MD5 hashed)
   */
  async getAccessToken(credentials: TTLockCredentials): Promise<TTLockTokenResponse> {
    if (this.mode === 'mock') {
      // Mock response
      await this.delay(500)
      return {
        access_token: 'mock_access_token_' + Date.now(),
        uid: 1234567890,
        expires_in: 7776000,
        scope: 'user,key,room',
        refresh_token: 'mock_refresh_token_' + Date.now(),
      }
    }

    // Real API call
    const { clientId, clientSecret, username, password } = credentials

    if (!username || !password) {
      throw new Error('Username and password are required')
    }

    // MD5 hash password (lowercase)
    const md5Password = crypto
      .createHash('md5')
      .update(password)
      .digest('hex')
      .toLowerCase()

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      username: username,
      password: md5Password,
      grant_type: 'password',
    })

    const response = await fetch(`${this.baseURL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const data = await response.json()

    if (data.errcode && data.errcode !== 0) {
      throw new Error(`TTLock API error: ${data.errmsg || 'Unknown error'}`)
    }

    // Save token for subsequent calls
    this.accessToken = data.access_token
    this.clientId = clientId

    return data
  }

  /**
   * Unlock door via TTLock API
   */
  async unlockDoor(lockId: number, accessToken?: string, clientId?: string): Promise<TTLockUnlockResponse> {
    if (this.mode === 'mock') {
      // Mock response
      await this.delay(800)
      
      // 90% success rate in mock
      const success = Math.random() > 0.1
      
      if (success) {
        return {
          errcode: 0,
          errmsg: 'success',
          description: 'Door unlocked successfully (MOCK)',
        }
      } else {
        return {
          errcode: -4043,
          errmsg: 'Remote unlock not enabled',
          description: 'Please enable remote unlock in TTLock app',
        }
      }
    }

    // Real API call
    const token = accessToken || this.accessToken
    const client = clientId || this.clientId

    if (!token || !client) {
      throw new Error('Access token and client ID required. Call getAccessToken first.')
    }

    const body = new URLSearchParams({
      clientId: client,
      accessToken: token,
      lockId: lockId.toString(),
      date: Date.now().toString(),
    })

    const response = await fetch(`${this.baseURL}/v3/lock/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const data = await response.json()
    return data
  }

  /**
   * Get lock details
   */
  async getLockDetail(lockId: number, accessToken?: string, clientId?: string): Promise<TTLockLockDetail> {
    if (this.mode === 'mock') {
      await this.delay(400)
      return {
        lockId: lockId,
        lockAlias: `Mock Lock ${lockId}`,
        electricQuantity: 85,
        lockMac: 'AA:BB:CC:DD:EE:FF',
        lockSound: 1, // locked
      }
    }

    const token = accessToken || this.accessToken
    const client = clientId || this.clientId

    if (!token || !client) {
      throw new Error('Access token and client ID required')
    }

    const params = new URLSearchParams({
      clientId: client,
      accessToken: token,
      lockId: lockId.toString(),
      date: Date.now().toString(),
    })

    const response = await fetch(`${this.baseURL}/v3/lock/detail?${params}`)
    const data = await response.json()
    return data
  }

  /**
   * Get lock list
   */
  async getLockList(accessToken?: string, clientId?: string) {
    if (this.mode === 'mock') {
      await this.delay(600)
      return {
        list: [
          {
            lockId: 7654321,
            lockName: 'M302_c36bf7',
            lockAlias: 'Vung Tau - ChillCine',
            lockMac: '93:64:38:7F:6B:C3',
            electricQuantity: 85,
          },
          {
            lockId: 7654322,
            lockName: 'M302_beb509',
            lockAlias: 'Vt phia trong',
            lockMac: 'AF:E9:58:09:B5:BE',
            electricQuantity: 80,
          },
        ],
      }
    }

    const token = accessToken || this.accessToken
    const client = clientId || this.clientId

    if (!token || !client) {
      throw new Error('Access token and client ID required')
    }

    const params = new URLSearchParams({
      clientId: client,
      accessToken: token,
      pageNo: '1',
      pageSize: '100',
      date: Date.now().toString(),
    })

    const response = await fetch(`${this.baseURL}/v3/lock/list?${params}`)
    const data = await response.json()
    return data
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
