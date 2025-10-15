"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Building2, DoorOpen, LayoutDashboard } from "lucide-react"
import { BranchesManager } from "@/components/admin/branches-manager"
import { RoomsManager } from "@/components/admin/rooms-manager"
import { BookingsOverview } from "@/components/admin/bookings-overview"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>
              <p className="text-sm text-muted-foreground">Quản lý chi nhánh, phòng và đặt phòng</p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Tổng quan</span>
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
