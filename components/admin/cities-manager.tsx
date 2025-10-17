"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface City {
  _id: string
  code: string
  name: string
  slug: string
  isActive: boolean
  displayOrder: number
}

export function CitiesManager() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [deletingCity, setDeletingCity] = useState<City | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    slug: "",
    isActive: true,
    displayOrder: 0,
  })

  useEffect(() => {
    loadCities()
  }, [])

  const loadCities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cities?all=true")
      const data = await response.json()
      if (data.success) {
        setCities(data.data)
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Không thể tải danh sách tỉnh thành",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleOpenDialog = (city?: City) => {
    if (city) {
      setEditingCity(city)
      setFormData({
        code: city.code,
        name: city.name,
        slug: city.slug,
        isActive: city.isActive,
        displayOrder: city.displayOrder,
      })
    } else {
      setEditingCity(null)
      setFormData({
        code: "",
        name: "",
        slug: "",
        isActive: true,
        displayOrder: cities.length,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCity(null)
    setFormData({
      code: "",
      name: "",
      slug: "",
      isActive: true,
      displayOrder: 0,
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.code || !formData.name) {
      toast({
        title: "Lỗi",
        description: "Mã và Tên tỉnh thành là bắt buộc",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const url = editingCity ? `/api/cities/${editingCity._id}` : "/api/cities"
      const method = editingCity ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Thành công",
          description: data.message || (editingCity ? "Cập nhật thành công" : "Tạo mới thành công"),
        })
        handleCloseDialog()
        loadCities()
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Có lỗi xảy ra",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!deletingCity) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/cities/${deletingCity._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Thành công",
          description: "Xóa tỉnh thành thành công",
        })
        setDeleteDialogOpen(false)
        setDeletingCity(null)
        loadCities()
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Không thể xóa tỉnh thành",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
    setSubmitting(false)
  }

  const handleToggleActive = async (city: City) => {
    try {
      const response = await fetch(`/api/cities/${city._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...city,
          isActive: !city.isActive,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Thành công",
          description: `${city.isActive ? "Tắt" : "Bật"} kích hoạt thành công`,
        })
        loadCities()
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Có lỗi xảy ra",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Quản lý Tỉnh/Thành phố
              </CardTitle>
              <CardDescription>Thêm, sửa, xóa các tỉnh thành trong hệ thống</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tỉnh thành
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có tỉnh thành nào. Nhấn "Thêm tỉnh thành" để bắt đầu.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Thứ tự</TableHead>
                  <TableHead className="w-[120px]">Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-[100px]">Trạng thái</TableHead>
                  <TableHead className="w-[150px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => (
                  <TableRow key={city._id}>
                    <TableCell className="font-medium">{city.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {city.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{city.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{city.slug}</TableCell>
                    <TableCell>
                      <Switch checked={city.isActive} onCheckedChange={() => handleToggleActive(city)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(city)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingCity(city)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCity ? "Chỉnh sửa tỉnh thành" : "Thêm tỉnh thành mới"}</DialogTitle>
            <DialogDescription>
              {editingCity ? "Cập nhật thông tin tỉnh thành" : "Nhập thông tin tỉnh thành mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã tỉnh thành <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="hcm, hn, dn..."
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
              />
              <p className="text-xs text-muted-foreground">Mã viết thường, không dấu, không trùng</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên tỉnh thành <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="TP. Hồ Chí Minh, Hà Nội..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                placeholder="tp-ho-chi-minh, ha-noi... (để trống sẽ tự động tạo)"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
              />
              <p className="text-xs text-muted-foreground">Để trống sẽ tự động tạo từ tên</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Kích hoạt</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : editingCity ? (
                "Cập nhật"
              ) : (
                "Tạo mới"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tỉnh thành?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tỉnh thành <strong>{deletingCity?.name}</strong>?
              <br />
              <span className="text-destructive">Lưu ý: Không thể xóa nếu tỉnh thành đang có chi nhánh.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive hover:bg-destructive/90">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
