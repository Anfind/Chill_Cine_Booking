"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, DollarSign, Coffee, Cookie, UtensilsCrossed, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface MenuItem {
  _id: string
  name: string
  price: number
  category: 'drink' | 'snack' | 'food' | 'extra'
  image: string
  description: string
  isAvailable: boolean
  displayOrder: number
}

const categoryLabels = {
  drink: 'Đồ uống',
  snack: 'Snack',
  food: 'Đồ ăn',
  extra: 'Dịch vụ thêm',
}

const categoryIcons = {
  drink: Coffee,
  snack: Cookie,
  food: UtensilsCrossed,
  extra: Gift,
}

export function MenuItemsManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "drink",
    image: "",
    description: "",
    displayOrder: "0",
    isAvailable: true,
  })

  useEffect(() => {
    fetchMenuItems()
  }, [selectedCategory])

  const fetchMenuItems = async () => {
    try {
      const url = selectedCategory && selectedCategory !== 'all'
        ? `/api/menu-items?category=${selectedCategory}`
        : '/api/menu-items'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setMenuItems(data.data)
      } else {
        toast.error('Không thể tải danh sách dịch vụ')
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      price: "",
      category: "drink",
      image: "",
      description: "",
      displayOrder: "0",
      isAvailable: true,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      image: item.image || "",
      description: item.description || "",
      displayOrder: item.displayOrder.toString(),
      isAvailable: item.isAvailable,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/menu-items/${itemId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Xóa dịch vụ thành công')
        fetchMenuItems()
      } else {
        toast.error(data.error || 'Không thể xóa dịch vụ')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        price: parseInt(formData.price),
        category: formData.category,
        image: formData.image,
        description: formData.description,
        displayOrder: parseInt(formData.displayOrder),
        isAvailable: formData.isAvailable,
      }

      let res
      if (editingItem) {
        res = await fetch(`/api/menu-items/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/menu-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (data.success) {
        toast.success(editingItem ? 'Cập nhật dịch vụ thành công' : 'Thêm dịch vụ thành công')
        setIsDialogOpen(false)
        fetchMenuItems()
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
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
              <CardTitle>Quản lý Dịch vụ thêm</CardTitle>
              <CardDescription>Quản lý đồ ăn, đồ uống và các dịch vụ bổ sung</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="drink">Đồ uống</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="food">Đồ ăn</SelectItem>
                  <SelectItem value="extra">Dịch vụ thêm</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm dịch vụ
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.length === 0 ? (
              <div className="col-span-full">
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có dịch vụ nào
                </p>
              </div>
            ) : (
              menuItems.map((item) => {
                const Icon = categoryIcons[item.category]
                return (
                  <Card key={item._id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-semibold">{item.name}</h3>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(item)}
                              disabled={isLoading}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDelete(item._id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {categoryLabels[item.category]}
                          </Badge>
                          {!item.isAvailable && (
                            <Badge variant="destructive" className="text-xs">Hết hàng</Badge>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-primary font-medium">
                          <DollarSign className="h-4 w-4" />
                          <span>{item.price.toLocaleString("vi-VN")}đ</span>
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
            <DialogTitle>{editingItem ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Cập nhật thông tin dịch vụ" : "Nhập thông tin dịch vụ mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên dịch vụ *</Label>
              <Input
                id="name"
                placeholder="VD: Coca Cola"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Loại *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drink">Đồ uống</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="food">Đồ ăn</SelectItem>
                    <SelectItem value="extra">Dịch vụ thêm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá tiền (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="VD: 15000"
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
                placeholder="Mô tả chi tiết về dịch vụ"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL hình ảnh</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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

            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
              />
              <Label htmlFor="isAvailable">Còn hàng</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : editingItem ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
