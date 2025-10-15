"use client"

import type React from "react"

import { useState } from "react"
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
import { rooms, branches, type Room } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

export function RoomsManager() {
  const [roomList, setRoomList] = useState<Room[]>(rooms)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    branchId: "",
    capacity: "",
    pricePerHour: "",
    amenities: "",
  })

  const handleAdd = () => {
    setEditingRoom(null)
    setFormData({ name: "", branchId: "", capacity: "", pricePerHour: "", amenities: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      branchId: room.branchId,
      capacity: room.capacity.toString(),
      pricePerHour: room.pricePerHour.toString(),
      amenities: room.amenities.join(", "),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (roomId: string) => {
    if (confirm("Bạn có chắc muốn xóa phòng này?")) {
      setRoomList(roomList.filter((r) => r.id !== roomId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amenitiesArray = formData.amenities
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a)

    if (editingRoom) {
      // Update existing room
      setRoomList(
        roomList.map((r) =>
          r.id === editingRoom.id
            ? {
                ...r,
                name: formData.name,
                branchId: formData.branchId,
                capacity: Number.parseInt(formData.capacity),
                pricePerHour: Number.parseInt(formData.pricePerHour),
                amenities: amenitiesArray,
              }
            : r,
        ),
      )
    } else {
      // Add new room
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: formData.name,
        branchId: formData.branchId,
        capacity: Number.parseInt(formData.capacity),
        pricePerHour: Number.parseInt(formData.pricePerHour),
        amenities: amenitiesArray,
        image: "/placeholder.svg?height=200&width=400",
      }
      setRoomList([...roomList, newRoom])
    }

    setIsDialogOpen(false)
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
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phòng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roomList.map((room) => {
              const branch = branches.find((b) => b.id === room.branchId)
              return (
                <Card key={room.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{room.name}</h3>
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {room.capacity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{branch?.name}</p>
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <DollarSign className="h-4 w-4" />
                          {room.pricePerHour.toLocaleString("vi-VN")}đ/giờ
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(room)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(room.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Chi nhánh</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Giá/giờ (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="50000"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Tiện ích (phân cách bằng dấu phẩy)</Label>
                <Textarea
                  id="amenities"
                  placeholder="WiFi, Máy lạnh, TV, Bảng trắng"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">{editingRoom ? "Cập nhật" : "Thêm"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
