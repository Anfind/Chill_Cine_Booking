import { RoomsClient } from "./rooms-client"

export default async function RoomsPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params

  return <RoomsClient branchId={branchId} />
}

export async function generateMetadata({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params
  
  try {
    // Fetch branch from API for metadata
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chill-cine.vercel.app'
    const res = await fetch(`${baseUrl}/api/branches/${branchId}`, {
      cache: 'no-store'
    })
    const data = await res.json()
    
    if (data.success && data.data) {
      const branch = data.data
      const cityName = typeof branch.cityId === 'object' ? branch.cityId.name : ''
      
      return {
        title: `${branch.name} - Danh sách phòng`,
        description: `Xem và đặt phòng tại ${branch.name}, ${branch.address}${cityName ? ` - ${cityName}` : ''}`,
      }
    }
  } catch (error) {
    console.error('Error fetching branch for metadata:', error)
  }

  return {
    title: "Danh sách phòng",
    description: "Xem và đặt phòng",
  }
}
