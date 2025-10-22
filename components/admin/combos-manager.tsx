"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Clock, DollarSign, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface Combo {
  _id: string
  name: string
  code: string
  duration: number
  price: number
  description: string
  isSpecial: boolean
  timeRange?: {
    start: string
    end: string
  }
  extraFeePerHour: number
  isActive: boolean
  displayOrder: number
}

export function CombosManager() {
  const [comboList, setComboList] = useState<Combo[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration: "",
    price: "",
    description: "",
    isSpecial: false,
    hasTimeRange: false,
    timeRangeStart: "",
    timeRangeEnd: "",
    extraFeePerHour: "50000",
    displayOrder: "0",
    isActive: true,
  })

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    try {
      const res = await fetch('/api/combos')
      const data = await res.json()
      if (data.success) {
        setComboList(data.data)
      } else {
        toast.error('Không thể tải danh sách combo')
      }
    } catch (error) {
      console.error('Error fetching combos:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleAdd = () => {
    setEditingCombo(null)
    setFormData({
      name: "",
      code: "",
      duration: "",
      price: "",
      description: "",
      isSpecial: false,
      hasTimeRange: false,
      timeRangeStart: "",
      timeRangeEnd: "",
      extraFeePerHour: "50000",
      displayOrder: "0",
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (combo: Combo) => {
    setEditingCombo(combo)
    setFormData({
      name: combo.name,
      code: combo.code,
      duration: combo.duration.toString(),
      price: combo.price.toString(),
      description: combo.description || "",
      isSpecial: combo.isSpecial,
      hasTimeRange: !!combo.timeRange,
      timeRangeStart: combo.timeRange?.start || "",
      timeRangeEnd: combo.timeRange?.end || "",
      extraFeePerHour: combo.extraFeePerHour.toString(),
      displayOrder: combo.displayOrder.toString(),
      isActive: combo.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (comboId: string) => {
    if (!confirm("Bạn có chắc muốn xóa combo này?")) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/combos/${comboId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Xóa combo thành công')
        fetchCombos()
      } else {
        toast.error(data.error || 'Không thể xóa combo')
      }
    } catch (error) {
      console.error('Error deleting combo:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: any = {
        name: formData.name,
        code: formData.code,
        duration: parseInt(formData.duration),
        price: parseInt(formData.price),
        description: formData.description,
        isSpecial: formData.isSpecial,
        extraFeePerHour: parseInt(formData.extraFeePerHour),
        displayOrder: parseInt(formData.displayOrder),
        isActive: formData.isActive,
      }

      if (formData.hasTimeRange && formData.timeRangeStart && formData.timeRangeEnd) {
        payload.timeRange = {
          start: formData.timeRangeStart,
          end: formData.timeRangeEnd,
        }
      }

      let res
      if (editingCombo) {
        res = await fetch(`/api/combos/${editingCombo._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/combos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (data.success) {
        toast.success(editingCombo ? 'Cập nhật combo thành công' : 'Thêm combo thành công')
        setIsDialogOpen(false)
        fetchCombos()
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error saving combo:', error)
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
              <CardTitle>Quản lý Combo</CardTitle>
              <CardDescription>Thêm, sửa, xóa các gói combo trong hệ thống</CardDescription>
            </div>
            <Button onClick={handleAdd} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Combo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comboList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có combo nào
              </p>
            ) : (
              comboList.map((combo) => (
                <Card key={combo._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{combo.name}</h3>
                          <Badge variant="secondary">{combo.code.toUpperCase()}</Badge>
                          {combo.isSpecial && (
                            <Badge variant="default" className="bg-yellow-500">
                              <Star className="h-3 w-3 mr-1" />
                              Đặc biệt
                            </Badge>
                          )}
                          {!combo.isActive && (
                            <Badge variant="destructive">Đã ẩn</Badge>
                          )}
                        </div>
                        {combo.description && (
                          <p className="text-sm text-muted-foreground">{combo.description}</p>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{combo.duration} giờ</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <DollarSign className="h-4 w-4" />
                            {combo.price.toLocaleString("vi-VN")}đ
                          </div>
                          {combo.timeRange && (
                            <Badge variant="outline" className="text-xs">
                              {combo.timeRange.start} - {combo.timeRange.end}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Phụ phí: {combo.extraFeePerHour.toLocaleString("vi-VN")}đ/giờ vượt
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEdit(combo)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDelete(combo._id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCombo ? "Sửa Combo" : "Thêm Combo mới"}</DialogTitle>
            <DialogDescription>
              {editingCombo ? "Cập nhật thông tin combo" : "Nhập thông tin combo mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên combo *</Label>
                <Input
                  id="name"
                  placeholder="VD: Combo 2 giờ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Mã combo *</Label>
                <Input
                  id="code"
                  placeholder="VD: combo-2h"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian (giờ) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="VD: 2"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá tiền (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="VD: 200000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về combo"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="extraFeePerHour">Phụ phí (VNĐ/giờ vượt)</Label>
                <Input
                  id="extraFeePerHour"
                  type="number"
                  min="0"
                  placeholder="VD: 50000"
                  value={formData.extraFeePerHour}
                  onChange={(e) => setFormData({ ...formData, extraFeePerHour: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  placeholder="VD: 0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isSpecial"
                checked={formData.isSpecial}
                onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
              />
              <Label htmlFor="isSpecial">Combo đặc biệt</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasTimeRange"
                checked={formData.hasTimeRange}
                onCheckedChange={(checked) => setFormData({ ...formData, hasTimeRange: checked })}
              />
              <Label htmlFor="hasTimeRange">Áp dụng theo khung giờ</Label>
            </div>

            {formData.hasTimeRange && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeRangeStart">Từ giờ</Label>
                  <Input
                    id="timeRangeStart"
                    type="time"
                    value={formData.timeRangeStart}
                    onChange={(e) => setFormData({ ...formData, timeRangeStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeRangeEnd">Đến giờ</Label>
                  <Input
                    id="timeRangeEnd"
                    type="time"
                    value={formData.timeRangeEnd}
                    onChange={(e) => setFormData({ ...formData, timeRangeEnd: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Hiển thị (Active)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : editingCombo ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
