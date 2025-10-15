"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, ChevronRight, ChevronLeft } from "lucide-react"
import { cities, getBranchesByCity, type City, type Branch } from "@/lib/data"
import Image from "next/image"

interface LocationSelectorProps {
  open: boolean
  onLocationSelected: (branchId: string) => void
}

export function LocationSelector({ open, onLocationSelected }: LocationSelectorProps) {
  const [step, setStep] = useState<"city" | "branch">("city")
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setStep("branch")
  }

  const handleBranchSelect = (branch: Branch) => {
    onLocationSelected(branch.id)
  }

  const handleBack = () => {
    setStep("city")
    setSelectedCity(null)
  }

  const cityBranches = selectedCity ? getBranchesByCity(selectedCity.id) : []

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
          {step === "branch" && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">Chọn chi nhánh của bạn</p>
          )}
        </DialogHeader>

        <div className="px-3 sm:px-4 pb-4 sm:pb-6 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          {step === "city" ? (
            <>
              {cities.map((city) => (
                <Card
                  key={city.id}
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
              {cityBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 active:scale-[0.98] hover:bg-primary/5"
                  onClick={() => handleBranchSelect(branch)}
                >
                  <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border">
                      <Image src={branch.image || "/placeholder.svg"} alt={branch.name} fill className="object-cover" />
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
