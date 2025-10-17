import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
// import { Analytics } from "@vercel/analytics/next" // Tắt khi dev local
import { Suspense } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Chill Cine Hotel - Cinemax",
  description: "Trải nghiệm xem phim riêng tư với Netflix, board game và nhiều tiện ích khác",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <div className="pb-16">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
          <BottomNav />
          <Toaster />
        </AuthProvider>
        {/* <Analytics /> */} {/* Tắt khi dev local */}
      </body>
    </html>
  )
}
