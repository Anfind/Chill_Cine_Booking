"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, MapPin } from "lucide-react"
import { toast } from "sonner"

interface City {
  _id: string
  name: string
  code: string
}

interface Branch {
  _id: string
  name: string
  cityId: { _id: string; name: string; code: string }
  address: string
  phone?: string
  slug: string
  images?: string[]
  amenities?: string[]
  openingHours?: {
    open: string
    close: string
  }
}

export function BranchesManager() {
  const [branchList, setBranchList] = useState<Branch[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cityId: "",
    address: "",
    phone: "",
    images: "",
    amenities: "",
    openTime: "00:00",
    closeTime: "23:59",
  })

  // Fetch branches and cities on mount
  useEffect(() => {
    fetchBranches()
    fetchCities()
  }, [])

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches')
      const data = await res.json()
      if (data.success) {
        setBranchList(data.data)
      } else {
        toast.error('Không thể tải danh sách chi nhánh')
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities')
      const data = await res.json()
      if (data.success) {
        setCities(data.data)
      } else {
        toast.error('Không thể tải danh sách tỉnh thành')
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleAdd = () => {
    setEditingBranch(null)
    setFormData({ 
      name: "", 
      cityId: "", 
      address: "", 
      phone: "",
      images: "",
      amenities: "",
      openTime: "00:00",
      closeTime: "23:59",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      cityId: typeof branch.cityId === 'object' ? branch.cityId._id : branch.cityId,
      address: branch.address,
      phone: branch.phone || "",
      images: branch.images?.join("\n") || "",
      amenities: branch.amenities?.join(", ") || "",
      openTime: branch.openingHours?.open || "00:00",
      closeTime: branch.openingHours?.close || "23:59",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (branchId: string) => {
    if (!confirm("Bạn có chắc muốn xóa chi nhánh này?")) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Xóa chi nhánh thành công')
        fetchBranches() // Refresh list
      } else {
        toast.error(data.error || 'Không thể xóa chi nhánh')
      }
    } catch (error) {
      console.error('Error deleting branch:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Parse amenities (comma separated)
      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a)

      // Parse images (newline separated)
      const imagesArray = formData.images
        .split("\n")
        .map((img) => img.trim())
        .filter((img) => img)

      const payload = {
        name: formData.name,
        cityId: formData.cityId,
        address: formData.address,
        phone: formData.phone,
        openingHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
        amenities: amenitiesArray,
        images: imagesArray,
      }

      let res
      if (editingBranch) {
        // Update existing branch
        res = await fetch(`/api/branches/${editingBranch._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // Add new branch
        res = await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (data.success) {
        toast.success(editingBranch ? 'Cập nhật chi nhánh thành công' : 'Thêm chi nhánh thành công')
        setIsDialogOpen(false)
        fetchBranches() // Refresh list
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error saving branch:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý chi nhánh</CardTitle>
              <CardDescription>Thêm, sửa, xóa các chi nhánh trong hệ thống</CardDescription>
            </div>
            <Button onClick={handleAdd} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chi nhánh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {branchList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có chi nhánh nào
              </p>
            ) : (
              branchList.map((branch) => {
                const city = typeof branch.cityId === 'object' ? branch.cityId : null
                return (
                  <Card key={branch._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{branch.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{city?.name}</p>
                          <p className="text-sm">{branch.address}</p>
                          {branch.phone && <p className="text-sm text-muted-foreground">{branch.phone}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEdit(branch)}
                            disabled={isLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDelete(branch._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Sửa chi nhánh" : "Thêm chi nhánh mới"}</DialogTitle>
            <DialogDescription>
              {editingBranch ? "Cập nhật thông tin chi nhánh" : "Nhập thông tin chi nhánh mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên chi nhánh</Label>
                <Input
                  id="name"
                  placeholder="Chi nhánh Quận 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Tỉnh thành</Label>
                <Select 
                  value={formData.cityId} 
                  onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tỉnh thành" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city._id} value={city._id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  placeholder="123 Nguyễn Huệ, Quận 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="028 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openTime">Giờ mở cửa</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeTime">Giờ đóng cửa</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Tiện ích (phân cách bằng dấu phẩy)</Label>
                <Textarea
                  id="amenities"
                  placeholder="WiFi miễn phí, Bãi đỗ xe, Thang máy, Điều hòa"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Hình ảnh (mỗi URL một dòng)</Label>
                <Textarea
                  id="images"
                  placeholder="https://images.unsplash.com/photo-1.jpg&#10;https://images.unsplash.com/photo-2.jpg&#10;https://images.unsplash.com/photo-3.jpg"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  rows={4}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập mỗi URL hình ảnh trên một dòng. Ảnh đầu tiên sẽ được dùng làm thumbnail.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : (editingBranch ? "Cập nhật" : "Thêm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
