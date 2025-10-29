"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { UnlockLog } from '@/lib/ttlock/types'

export default function TTLockTestPage() {
  const [mode, setMode] = useState<'mock' | 'real'>('mock')
  const [loading, setLoading] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  
  // Credentials
  const [clientId, setClientId] = useState('7d00ffcd55a146a3a981626227b375fb')
  const [clientSecret, setClientSecret] = useState('215d2828bbd9ff32a4656e979bf15d24')
  const [username, setUsername] = useState('haycubatdau@gmail.com')
  const [password, setPassword] = useState('Chill2025@')
  
  // Token & Lock
  const [accessToken, setAccessToken] = useState('d4daf0130e2de14fc2a0f9411146a4e6')
  const [lockId, setLockId] = useState('26183042')
  
  // Logs
  const [logs, setLogs] = useState<UnlockLog[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleGetToken = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/test/ttlock/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          credentials: {
            clientId,
            clientSecret,
            username: mode === 'real' ? username : undefined,
            password: mode === 'real' ? password : undefined,
          },
        }),
      })

      const data = await res.json()

      if (data.success) {
        setAccessToken(data.data.access_token)
        setMessage({
          type: 'success',
          text: `Token obtained! Expires in ${Math.floor(data.data.expires_in / 86400)} days`,
        })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!accessToken && mode === 'real') {
      setMessage({ type: 'error', text: 'Please get access token first' })
      return
    }

    setUnlocking(true)
    setMessage(null)

    const startTime = Date.now()

    try {
      const res = await fetch('/api/test/ttlock/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          lockId,
          accessToken,
          clientId,
        }),
      })

      const data = await res.json()
      const responseTime = Date.now() - startTime

      // Add log
      const newLog: UnlockLog = {
        timestamp: new Date(),
        lockId: parseInt(lockId),
        success: data.success,
        mode,
        response: data.data,
        error: data.error,
        responseTime,
      }

      setLogs((prev) => [newLog, ...prev].slice(0, 10))

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Door unlocked! (${responseTime}ms)`,
        })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to unlock' })
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      
      const newLog: UnlockLog = {
        timestamp: new Date(),
        lockId: parseInt(lockId),
        success: false,
        mode,
        error: error.message,
        responseTime,
      }

      setLogs((prev) => [newLog, ...prev].slice(0, 10))
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔐 TTLock Test Playground</h1>
        <p className="text-muted-foreground">
          Test TTLock API integration with Mock or Real mode
        </p>
      </div>

      {/* Mode Toggle */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Mode</CardTitle>
          <CardDescription>
            Choose between Mock (demo) or Real (actual API calls)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={mode === 'mock' ? 'default' : 'outline'}
              onClick={() => setMode('mock')}
              className="flex-1"
            >
              🎭 Mock Mode
            </Button>
            <Button
              variant={mode === 'real' ? 'default' : 'outline'}
              onClick={() => setMode('real')}
              className="flex-1"
            >
              ⚡ Real Mode
            </Button>
          </div>
          <div className="mt-4">
            <Badge variant={mode === 'mock' ? 'secondary' : 'default'}>
              Current: {mode.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Credentials Card */}
          <Card>
            <CardHeader>
              <CardTitle>Credentials</CardTitle>
              <CardDescription>
                {mode === 'mock' 
                  ? 'Mock mode - credentials are optional'
                  : 'Real mode - all credentials required'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="7d00ffcd55a146a3..."
                />
              </div>

              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="215d2828bbd9..."
                />
              </div>

              {mode === 'real' && (
                <>
                  <Separator />
                  <Alert>
                    <AlertDescription>
                      Username & Password from <strong>TTLock APP</strong> account (not developer account)
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="username">Username (TTLock App)</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Email or phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your app password"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Will be MD5 hashed automatically
                    </p>
                  </div>
                </>
              )}

              <Button
                onClick={handleGetToken}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Getting Token...' : '🔑 Get Access Token'}
              </Button>
            </CardContent>
          </Card>

          {/* Access Token Card */}
          {accessToken && (
            <Card>
              <CardHeader>
                <CardTitle>Access Token</CardTitle>
                <CardDescription>Token ready for API calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md break-all text-sm font-mono">
                  {accessToken}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lock ID Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lock Configuration</CardTitle>
              <CardDescription>Specify the lock to test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lockId">Lock ID</Label>
                <Input
                  id="lockId"
                  value={lockId}
                  onChange={(e) => setLockId(e.target.value)}
                  placeholder="7654321"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  From your TTLock app - Lock Details
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Action & Logs */}
        <div className="space-y-6">
          {/* Unlock Button Card */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Unlock Test</CardTitle>
              <CardDescription>
                Press the button to test unlock functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleUnlock}
                disabled={unlocking || (!accessToken && mode === 'real')}
                size="lg"
                className="w-full h-20 text-2xl"
              >
                {unlocking ? (
                  <>
                    <span className="animate-spin mr-2">🔄</span>
                    Unlocking...
                  </>
                ) : (
                  <>🔓 UNLOCK DOOR</>
                )}
              </Button>

              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Logs Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>Last 10 unlock attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tests yet. Click unlock to start testing.
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border ${
                        log.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.success ? '✅ Success' : '❌ Failed'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Lock ID:</strong> {log.lockId}
                        </div>
                        <div>
                          <strong>Mode:</strong>{' '}
                          <Badge variant="outline" className="text-xs">
                            {log.mode}
                          </Badge>
                        </div>
                        <div>
                          <strong>Response Time:</strong> {log.responseTime}ms
                        </div>
                        {log.response && (
                          <div className="mt-2 text-xs bg-white p-2 rounded border">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.response, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.error && (
                          <div className="mt-2 text-xs text-red-600">
                            Error: {log.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📚 How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mock">
            <TabsList>
              <TabsTrigger value="mock">Mock Mode</TabsTrigger>
              <TabsTrigger value="real">Real Mode</TabsTrigger>
            </TabsList>
            <TabsContent value="mock" className="space-y-2">
              <p><strong>1.</strong> Select &quot;Mock Mode&quot;</p>
              <p><strong>2.</strong> Click &quot;Get Access Token&quot; (optional)</p>
              <p><strong>3.</strong> Enter any Lock ID</p>
              <p><strong>4.</strong> Click &quot;UNLOCK DOOR&quot; to test</p>
              <p className="text-sm text-muted-foreground mt-4">
                ✨ Mock mode simulates API responses without making real calls.
                Great for testing UI and flow!
              </p>
            </TabsContent>
            <TabsContent value="real" className="space-y-2">
              <p><strong>1.</strong> Select &quot;Real Mode&quot;</p>
              <p><strong>2.</strong> Enter Client ID & Secret (from developer account)</p>
              <p><strong>3.</strong> Enter Username & Password (from TTLock app)</p>
              <p><strong>4.</strong> Click &quot;Get Access Token&quot;</p>
              <p><strong>5.</strong> Enter Lock ID (from your lock details)</p>
              <p><strong>6.</strong> Click &quot;UNLOCK DOOR&quot;</p>
              <p className="text-sm text-muted-foreground mt-4">
                ⚠️ Real mode makes actual API calls to TTLock servers and will
                unlock your physical lock if gateway is online!
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
