"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { branches, cities, type Branch } from "@/lib/data"

export function BranchesManager() {
  const [branchList, setBranchList] = useState<Branch[]>(branches)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    cityId: "",
    address: "",
  })

  const handleAdd = () => {
    setEditingBranch(null)
    setFormData({ name: "", cityId: "", address: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      cityId: branch.cityId,
      address: branch.address,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (branchId: string) => {
    if (confirm("Bạn có chắc muốn xóa chi nhánh này?")) {
      setBranchList(branchList.filter((b) => b.id !== branchId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingBranch) {
      // Update existing branch
      setBranchList(
        branchList.map((b) =>
          b.id === editingBranch.id
            ? { ...b, name: formData.name, cityId: formData.cityId, address: formData.address }
            : b,
        ),
      )
    } else {
      // Add new branch
      const newBranch: Branch = {
        id: `branch-${Date.now()}`,
        name: formData.name,
        cityId: formData.cityId,
        address: formData.address,
      }
      setBranchList([...branchList, newBranch])
    }

    setIsDialogOpen(false)
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
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chi nhánh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {branchList.map((branch) => {
              const city = cities.find((c) => c.id === branch.cityId)
              return (
                <Card key={branch.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{branch.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{city?.name}</p>
                        <p className="text-sm">{branch.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(branch)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(branch.id)}>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Tỉnh thành</Label>
                <Select value={formData.cityId} onValueChange={(value) => setFormData({ ...formData, cityId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tỉnh thành" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">{editingBranch ? "Cập nhật" : "Thêm"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
