import { RoomsClient } from "./rooms-client"
import { branches } from "@/lib/data"

export default async function RoomsPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params

  return <RoomsClient branchId={branchId} />
}

export async function generateMetadata({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params
  const branch = branches.find((b) => b.id === branchId)

  return {
    title: branch ? `${branch.name} - Danh sách phòng` : "Không tìm thấy chi nhánh",
    description: branch ? `Xem và đặt phòng tại ${branch.name}, ${branch.address}` : "",
  }
}
