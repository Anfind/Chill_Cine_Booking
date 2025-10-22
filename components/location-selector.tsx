"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { fetchCities, fetchBranches } from "@/lib/api-client"
import Image from "next/image"

interface LocationSelectorProps {
  open: boolean
  onLocationSelected: (branchId: string) => void
}

interface City {
  _id: string
  name: string
  code: string
  slug: string
  isActive: boolean
  displayOrder: number
}

interface Branch {
  _id: string
  name: string
  slug: string
  address: string
  phone: string
  cityId: any
  images: string[]
  isActive: boolean
}

export function LocationSelector({ open, onLocationSelected }: LocationSelectorProps) {
  const [step, setStep] = useState<"city" | "branch">("city")
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load cities on mount
  useEffect(() => {
    loadCities()
  }, [])

  // Load branches when city selected
  useEffect(() => {
    if (selectedCity) {
      loadBranches(selectedCity._id)
    }
  }, [selectedCity])

  const loadCities = async () => {
    setLoading(true)
    setError(null)
    const response = await fetchCities()
    if (response.success && response.data) {
      setCities(response.data)
    } else {
      setError(response.error || 'Không thể tải danh sách tỉnh thành')
    }
    setLoading(false)
  }

  const loadBranches = async (cityId: string) => {
    setLoading(true)
    setError(null)
    const response = await fetchBranches(cityId)
    if (response.success && response.data) {
      setBranches(response.data)
    } else {
      setError(response.error || 'Không thể tải danh sách chi nhánh')
    }
    setLoading(false)
  }

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setStep("branch")
  }

  const handleBranchSelect = (branch: Branch) => {
    onLocationSelected(branch._id)
  }

  const handleBack = () => {
    setStep("city")
    setSelectedCity(null)
    setBranches([])
  }

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b bg-gradient-to-r from-primary/5 to-emerald-500/5">
          {step === "branch" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="absolute left-3 sm:left-4 top-3 sm:top-4 h-9 w-9 rounded-full hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <DialogTitle className="text-lg sm:text-xl font-bold text-center">
            {step === "city" ? "Chọn tỉnh thành" : selectedCity?.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-center">
            {step === "city" ? "Chọn tỉnh/thành phố để xem các chi nhánh" : "Chọn chi nhánh của bạn"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-3 sm:px-4 pb-4 sm:pb-6 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={step === "city" ? loadCities : () => loadBranches(selectedCity!._id)}>
                Thử lại
              </Button>
            </div>
          ) : step === "city" ? (
            <>
              {cities.map((city) => (
                <Card
                  key={city._id}
                  className="p-3 sm:p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 active:scale-[0.98] hover:bg-primary/5"
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <span className="font-semibold text-base sm:text-lg">{city.name}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <>
              {branches.map((branch) => (
                <Card
                  key={branch._id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 active:scale-[0.98] hover:bg-primary/5"
                  onClick={() => handleBranchSelect(branch)}
                >
                  <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border">
                      <Image src={branch.images[0] || "/placeholder.svg"} alt={branch.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{branch.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{branch.address}</p>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
