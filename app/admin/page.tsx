"use client"

import { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, DoorOpen, LayoutDashboard, Calendar, LogOut, User, MapPin, Package, Coffee, Loader2 } from "lucide-react"
import { BranchesManager } from "@/components/admin/branches-manager"
import { RoomsManager } from "@/components/admin/rooms-manager"
import { BookingsOverview } from "@/components/admin/bookings-overview"
import { BookingsManager } from "@/components/admin/bookings-manager"
import { CitiesManager } from "@/components/admin/cities-manager"
import { CombosManager } from "@/components/admin/combos-manager"
import { MenuItemsManager } from "@/components/admin/menu-items-manager"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // ✅ SECURITY: Check authentication and admin role
  useEffect(() => {
    if (status === 'loading') return // Still loading

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/auth/login?error=AuthRequired')
      return
    }

    // If authenticated but not admin, redirect to login with error
    if (session?.user && session.user.role !== 'admin') {
      router.push('/auth/login?error=AdminOnly')
      return
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // Don't render admin page if not authenticated or not admin
  if (!session || session.user?.role !== 'admin') {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                <span className="truncate">Quản trị hệ thống</span>
                <Badge variant="outline" className="text-[10px] sm:text-xs font-normal flex-shrink-0">
                  🔐
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                Quản lý tỉnh thành, chi nhánh, phòng và đặt phòng
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {session?.user && (
                <div className="hidden md:flex items-center gap-3 px-3 sm:px-4 py-2 rounded-lg bg-secondary/50 border">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                      {session.user.name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{session.user.role}</p>
                  </div>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => (window.location.href = "/")}
                className="h-8 px-2 sm:px-3"
              >
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline text-xs">Trang chủ</span>
              </Button>

              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="h-8 px-2 sm:px-3"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline text-xs">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Tabs - Scrollable on mobile */}
          <div className="relative">
            <TabsList className="grid w-full max-w-6xl grid-cols-7 gap-0.5 sm:gap-1 h-auto p-0.5 sm:p-1 overflow-x-auto scrollbar-thin">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm flex-shrink-0">
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Tổng quan</span>
                <span className="lg:hidden">TQ</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm flex-shrink-0">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Đặt phòng</span>
                <span className="lg:hidden">ĐP</span>
              </TabsTrigger>
              <TabsTrigger value="cities" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm flex-shrink-0">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Tỉnh thành</span>
                <span className="lg:hidden">TT</span>
              </TabsTrigger>
              <TabsTrigger value="branches" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm flex-shrink-0">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Chi nhánh</span>
                <span className="lg:hidden">CN</span>
              </TabsTrigger>
              <TabsTrigger value="rooms" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm flex-shrink-0">
                <DoorOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Phòng</span>
                <span className="lg:hidden">P</span>
              </TabsTrigger>
              <TabsTrigger value="combos" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm flex-shrink-0">
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Combo</span>
                <span className="lg:hidden">CB</span>
              </TabsTrigger>
              <TabsTrigger value="menu-items" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm flex-shrink-0">
                <Coffee className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">Dịch vụ</span>
                <span className="lg:hidden">DV</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Mobile scroll hint */}
            <div className="lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground animate-pulse pointer-events-none">
              ← Vuốt để xem thêm →
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <BookingsOverview />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <BookingsManager />
          </TabsContent>

          <TabsContent value="cities" className="space-y-4">
            <CitiesManager />
          </TabsContent>

          <TabsContent value="branches" className="space-y-4">
            <BranchesManager />
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            <RoomsManager />
          </TabsContent>

          <TabsContent value="combos" className="space-y-4">
            <CombosManager />
          </TabsContent>

          <TabsContent value="menu-items" className="space-y-4">
            <MenuItemsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
