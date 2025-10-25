'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Lock, Mail, AlertCircle, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ Handle URL error parameters
  useEffect(() => {
    if (urlError === 'AuthRequired') {
      setError('⚠️ Vui lòng đăng nhập để tiếp tục')
    } else if (urlError === 'AdminOnly') {
      setError('🔒 Bạn không có quyền truy cập trang Admin. Vui lòng đăng nhập bằng tài khoản Admin.')
    }
  }, [urlError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Email hoặc password không đúng')
        setLoading(false)
        return
      }

      // Success - redirect
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Đã xảy ra lỗi, vui lòng thử lại')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Đăng nhập Admin
          </CardTitle>
          <CardDescription className="text-base">
            Chill Cine Booking - Quản trị viên
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@chillcine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 border-border/60 focus-visible:ring-primary"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 border-border/60 focus-visible:ring-primary"
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/30">
                💡 <strong>Test Account:</strong>
                <br />
                Email: <code className="text-foreground">admin@chillcine.com</code>
                <br />
                Password: <code className="text-foreground">Admin@123</code>
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => router.push('/')}
              disabled={loading}
            >
              Quay về trang chủ
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
