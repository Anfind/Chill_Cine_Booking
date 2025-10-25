import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'admin'
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

    // If accessing admin page but not admin role, redirect to login
    if (isAdminPage && !isAdmin) {
      return NextResponse.redirect(new URL('/auth/login?error=AdminOnly', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // This callback is called before the middleware function
      // Return true to allow the middleware to run
      authorized: ({ token, req }) => {
        const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
        
        // For admin pages, require authentication
        if (isAdminPage) {
          return !!token
        }
        
        // For other pages, allow access
        return true
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

// Specify which routes to protect
export const config = {
  matcher: [
    '/admin/:path*',
    // You can add more protected routes here if needed
  ],
}
