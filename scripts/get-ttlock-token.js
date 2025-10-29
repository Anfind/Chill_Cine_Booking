/**
 * Script lấy TTLock Access Token
 * Chạy: node scripts/get-ttlock-token.js
 */

const CLIENT_ID = '7d00ffcd55a146a3a981626227b375fb'
const CLIENT_SECRET = '215d2828bbd9ff32a4656e979bf15d24'

async function getAccessToken() {
  try {
    console.log('🔑 Đang lấy Access Token từ TTLock...\n')

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })

    const response = await fetch('https://euopen.ttlock.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    const data = await response.json()

    if (response.ok && data.access_token) {
      console.log('✅ SUCCESS! Access Token:\n')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`Access Token: ${data.access_token}`)
      console.log(`Expires in: ${data.expires_in} seconds (${Math.floor(data.expires_in / 86400)} days)`)
      console.log(`Token Type: ${data.token_type}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      
      console.log('📝 Copy vào .env.local:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`TTLOCK_CLIENT_ID=${CLIENT_ID}`)
      console.log(`TTLOCK_CLIENT_SECRET=${CLIENT_SECRET}`)
      console.log(`TTLOCK_ACCESS_TOKEN=${data.access_token}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      
      return data.access_token
    } else {
      console.error('❌ ERROR:', data)
      throw new Error('Failed to get access token')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  }
}

// Run
getAccessToken()
  .then(() => {
    console.log('✅ Done! Bây giờ bạn có thể test unlock.')
  })
  .catch(() => {
    process.exit(1)
  })
