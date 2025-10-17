"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, DoorOpen, LayoutDashboard, Calendar, LogOut, User, MapPin } from "lucide-react"
import { BranchesManager } from "@/components/admin/branches-manager"
import { RoomsManager } from "@/components/admin/rooms-manager"
import { BookingsOverview } from "@/components/admin/bookings-overview"
import { BookingsManager } from "@/components/admin/bookings-manager"
import { CitiesManager } from "@/components/admin/cities-manager"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                Quản trị hệ thống
                <Badge variant="outline" className="text-xs font-normal">
                  🔐 Protected
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">Quản lý tỉnh thành, chi nhánh, phòng và đặt phòng</p>
            </div>

            <div className="flex items-center gap-3">
              {session?.user && (
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50 border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {session.user.name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{session.user.role}</p>
                  </div>
                </div>
              )}

              <Button variant="outline" size="sm" onClick={() => (window.location.href = "/")}>
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Trang chủ</span>
              </Button>

              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Đặt phòng</span>
            </TabsTrigger>
            <TabsTrigger value="cities" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Tỉnh thành</span>
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Chi nhánh</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-2">
              <DoorOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Phòng</span>
            </TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </div>
  )
}
