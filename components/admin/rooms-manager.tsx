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
import { Plus, Pencil, Trash2, Users, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Branch {
  _id: string
  name: string
  address: string
}

interface RoomType {
  _id: string
  name: string
  slug: string
  color: string
}

interface Room {
  _id: string
  name: string
  branchId: { _id: string; name: string } | string
  roomTypeId: { _id: string; name: string; color: string } | string
  description: string
  images: string[]
  amenities: string[]
  capacity: number
  price: number
  status: string
}

export function RoomsManager() {
  const [roomList, setRoomList] = useState<Room[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    branchId: "",
    roomTypeId: "",
    description: "",
    capacity: "",
    price: "",
    amenities: "",
    images: "",
    status: "available",
  })

  // Fetch data on mount
  useEffect(() => {
    fetchRooms()
    fetchBranches()
    fetchRoomTypes()
  }, [])

  // Refetch rooms when branch filter changes
  useEffect(() => {
    fetchRooms(selectedBranch)
  }, [selectedBranch])

  const fetchRooms = async (branchId?: string) => {
    try {
      const url = branchId && branchId !== 'all' 
        ? `/api/rooms?branchId=${branchId}` 
        : '/api/rooms'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setRoomList(data.data)
      } else {
        toast.error('Không thể tải danh sách phòng')
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches')
      const data = await res.json()
      if (data.success) {
        setBranches(data.data)
      } else {
        toast.error('Không thể tải danh sách chi nhánh')
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const fetchRoomTypes = async () => {
    try {
      const res = await fetch('/api/room-types')
      const data = await res.json()
      if (data.success) {
        setRoomTypes(data.data)
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  const handleAdd = () => {
    setEditingRoom(null)
    setFormData({
      name: "",
      branchId: "",
      roomTypeId: "",
      description: "",
      capacity: "",
      price: "",
      amenities: "",
      images: "",
      status: "available",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      branchId: typeof room.branchId === 'object' ? room.branchId._id : room.branchId,
      roomTypeId: typeof room.roomTypeId === 'object' ? room.roomTypeId._id : room.roomTypeId,
      description: room.description || "",
      capacity: room.capacity.toString(),
      price: room.price.toString(),
      amenities: room.amenities.join(", "),
      images: room.images.join("\n"),
      status: room.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (roomId: string) => {
    if (!confirm("Bạn có chắc muốn xóa phòng này?")) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Xóa phòng thành công')
        fetchRooms(selectedBranch)
      } else {
        toast.error(data.error || 'Không thể xóa phòng')
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a)

      const imagesArray = formData.images
        .split("\n")
        .map((img) => img.trim())
        .filter((img) => img)

      const payload = {
        name: formData.name,
        branchId: formData.branchId,
        roomTypeId: formData.roomTypeId,
        description: formData.description,
        capacity: parseInt(formData.capacity),
        price: parseInt(formData.price),
        amenities: amenitiesArray,
        images: imagesArray,
        status: formData.status,
      }

      let res
      if (editingRoom) {
        // Update existing room
        res = await fetch(`/api/rooms/${editingRoom._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // Add new room
        res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (data.success) {
        toast.success(editingRoom ? 'Cập nhật phòng thành công' : 'Thêm phòng thành công')
        setIsDialogOpen(false)
        fetchRooms(selectedBranch)
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error saving room:', error)
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
              <CardTitle>Quản lý phòng</CardTitle>
              <CardDescription>Thêm, sửa, xóa các phòng trong hệ thống</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Lọc theo chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm phòng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roomList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có phòng nào
              </p>
            ) : (
              roomList.map((room) => {
                const branch = typeof room.branchId === 'object' ? room.branchId : null
                const roomType = typeof room.roomTypeId === 'object' ? room.roomTypeId : null
                return (
                  <Card key={room._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{room.name}</h3>
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {room.capacity}
                            </Badge>
                            {roomType && (
                              <Badge 
                                variant="outline" 
                                style={{ backgroundColor: roomType.color + '20', borderColor: roomType.color }}
                              >
                                {roomType.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{branch?.name}</p>
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <DollarSign className="h-4 w-4" />
                            {typeof room.price === 'number' ? room.price.toLocaleString("vi-VN") : '0'}đ/giờ
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.map((amenity, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEdit(room)}
                            disabled={isLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDelete(room._id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Sửa phòng" : "Thêm phòng mới"}</DialogTitle>
            <DialogDescription>
              {editingRoom ? "Cập nhật thông tin phòng" : "Nhập thông tin phòng mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Tên phòng</Label>
                <Input
                  id="room-name"
                  placeholder="P101"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Chi nhánh</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomType">Loại phòng</Label>
                <Select
                  value={formData.roomTypeId}
                  onValueChange={(value) => setFormData({ ...formData, roomTypeId: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Sức chứa</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="4"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Giá/giờ (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả phòng..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Tiện ích (phân cách bằng dấu phẩy)</Label>
                <Textarea
                  id="amenities"
                  placeholder="WiFi, Máy lạnh, TV, Bảng trắng"
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
                  placeholder="https://example.com/image1.jpg"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Sẵn sàng</SelectItem>
                    <SelectItem value="occupied">Đang sử dụng</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="unavailable">Không khả dụng</SelectItem>
                  </SelectContent>
                </Select>
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
                {isLoading ? "Đang xử lý..." : (editingRoom ? "Cập nhật" : "Thêm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
