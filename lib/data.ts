// Mock data for cities, branches, and rooms

export interface City {
  id: string
  name: string
}

export interface Branch {
  id: string
  cityId: string
  name: string
  address: string
  image: string
}

export interface Room {
  id: string
  branchId: string
  name: string
  capacity: number
  pricePerHour: number
  amenities: string[]
  image: string
  images?: string[] // Added multiple images for slideshow
  description?: string // Added detailed description
  comboPackages?: ComboPackage[]
}

export interface ComboPackage {
  id: string
  name: string
  duration: number // in hours
  price: number
  description: string
}

export interface MenuItem {
  id: string
  name: string
  price: number
  category: "drink" | "snack" | "food" | "extra"
}

export interface Booking {
  id: string
  roomId: string
  startTime: Date
  endTime: Date
  customerName?: string
  customerPhone?: string
}

export const cities: City[] = [
  { id: "hcm", name: "Thành phố Hồ Chí Minh" },
  { id: "hn", name: "Hà Nội" },
  { id: "dn", name: "Đà Nẵng" },
  { id: "ct", name: "Cần Thơ" },
]

export const branches: Branch[] = [
  {
    id: "hcm-q1",
    cityId: "hcm",
    name: "Chi nhánh Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    image: "/branch-hcm-q1.jpg",
  },
  {
    id: "hcm-q3",
    cityId: "hcm",
    name: "Chi nhánh Quận 3",
    address: "456 Võ Văn Tần, Quận 3, TP.HCM",
    image: "/branch-hcm-q3.jpg",
  },
  {
    id: "hcm-td",
    cityId: "hcm",
    name: "Chi nhánh Thủ Đức",
    address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    image: "/branch-hcm-td.jpg",
  },
  {
    id: "hn-hk",
    cityId: "hn",
    name: "Chi nhánh Hoàn Kiếm",
    address: "321 Hàng Bài, Hoàn Kiếm, Hà Nội",
    image: "/branch-hn-hk.jpg",
  },
  {
    id: "hn-cg",
    cityId: "hn",
    name: "Chi nhánh Cầu Giấy",
    address: "654 Xuân Thủy, Cầu Giấy, Hà Nội",
    image: "/branch-hn-cg.jpg",
  },
  {
    id: "dn-hc",
    cityId: "dn",
    name: "Chi nhánh Hải Châu",
    address: "147 Trần Phú, Hải Châu, Đà Nẵng",
    image: "/branch-dn-hc.jpg",
  },
  {
    id: "ct-nt",
    cityId: "ct",
    name: "Chi nhánh Ninh Kiều",
    address: "258 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
    image: "/branch-ct-nt.jpg",
  },
]

// Mock bookings for timeline demo
export const mockBookings: Booking[] = [
  // HCM Q1 bookings
  {
    id: "b1",
    roomId: "g01",
    startTime: new Date(new Date().setHours(8, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 0, 0, 0)),
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
  },
  {
    id: "b2",
    roomId: "p102",
    startTime: new Date(new Date().setHours(9, 30, 0, 0)),
    endTime: new Date(new Date().setHours(11, 30, 0, 0)),
    customerName: "Trần Thị B",
    customerPhone: "0912345678",
  },
  {
    id: "b3",
    roomId: "p103",
    startTime: new Date(new Date().setHours(13, 0, 0, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0, 0)),
    customerName: "Lê Văn C",
    customerPhone: "0923456789",
  },
  {
    id: "b4",
    roomId: "p104",
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)),
    customerName: "Phạm Thị D",
    customerPhone: "0934567890",
  },
  {
    id: "b5",
    roomId: "p202",
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(12, 0, 0, 0)),
    customerName: "Hoàng Văn E",
    customerPhone: "0945678901",
  },
  {
    id: "b6",
    roomId: "p203",
    startTime: new Date(new Date().setHours(15, 0, 0, 0)),
    endTime: new Date(new Date().setHours(17, 30, 0, 0)),
    customerName: "Vũ Thị F",
    customerPhone: "0956789012",
  },
  // HCM Q3 bookings
  {
    id: "b7",
    roomId: "q3-101",
    startTime: new Date(new Date().setHours(8, 30, 0, 0)),
    endTime: new Date(new Date().setHours(10, 30, 0, 0)),
    customerName: "Đặng Văn G",
    customerPhone: "0967890123",
  },
  {
    id: "b8",
    roomId: "q3-102",
    startTime: new Date(new Date().setHours(11, 0, 0, 0)),
    endTime: new Date(new Date().setHours(13, 0, 0, 0)),
    customerName: "Bùi Thị H",
    customerPhone: "0978901234",
  },
  {
    id: "b9",
    roomId: "q3-201",
    startTime: new Date(new Date().setHours(14, 30, 0, 0)),
    endTime: new Date(new Date().setHours(16, 30, 0, 0)),
    customerName: "Dương Văn I",
    customerPhone: "0989012345",
  },
  {
    id: "b10",
    roomId: "q3-202",
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(11, 30, 0, 0)),
    customerName: "Mai Thị K",
    customerPhone: "0990123456",
  },
  // HCM Thu Duc bookings
  {
    id: "b11",
    roomId: "td-a01",
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(12, 0, 0, 0)),
    customerName: "Lý Văn L",
    customerPhone: "0901234568",
  },
  {
    id: "b12",
    roomId: "td-a02",
    startTime: new Date(new Date().setHours(13, 30, 0, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0, 0)),
    customerName: "Phan Thị M",
    customerPhone: "0912345679",
  },
  {
    id: "b13",
    roomId: "td-b01",
    startTime: new Date(new Date().setHours(16, 0, 0, 0)),
    endTime: new Date(new Date().setHours(18, 0, 0, 0)),
    customerName: "Võ Văn N",
    customerPhone: "0923456780",
  },
  {
    id: "b14",
    roomId: "td-b02",
    startTime: new Date(new Date().setHours(8, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 30, 0, 0)),
    customerName: "Trương Thị O",
    customerPhone: "0934567891",
  },
]

export function getBranchesByCity(cityId: string): Branch[] {
  return branches.filter((branch) => branch.cityId === cityId)
}

export function getRoomsByBranch(branchId: string): Room[] {
  return rooms.filter((room) => room.branchId === branchId)
}

export function getBookingsByRoom(roomId: string): Booking[] {
  return mockBookings.filter((booking) => booking.roomId === roomId)
}

export const cinemaAmenities = [
  "Máy chiếu siêu nét",
  "Có sẵn Netflix & Youtube",
  "Board game cho couple",
  "Ghế sofa hoặc ghế lưới",
  "Gương toàn thân",
  "Nhà vệ sinh trong phòng",
  "Checkin tự động",
]

export const rooms: Room[] = [
  // HCM Q1 rooms (4 rooms)
  {
    id: "g01",
    branchId: "hcm-q1",
    name: "Cinema Room 01",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-meeting-room.png",
    images: ["/modern-meeting-room.png", "/modern-conference-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema couple lãng mạn với không gian ấm cúng, ghế sofa êm ái. Trang bị màn hình chiếu lớn, âm thanh vòm sống động. Hoàn hảo cho các cặp đôi muốn có không gian riêng tư xem phim, chơi game hoặc đơn giản là thư giãn bên nhau.",
  },
  {
    id: "p102",
    branchId: "hcm-q1",
    name: "Cinema Room 02",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-conference-room.png",
    images: ["/modern-conference-room.png", "/modern-meeting-room.png", "/small-office-room.jpg"],
    description:
      "Phòng cinema hiện đại với thiết kế tối giản, sang trọng. Ghế lưới thoải mái, ánh sáng điều chỉnh được. Lý tưởng cho những ai yêu thích không gian hiện đại, xem Netflix chill hoặc làm việc trong môi trường yên tĩnh.",
  },
  {
    id: "p103",
    branchId: "hcm-q1",
    name: "Cinema Room 03",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/large-meeting-room.png",
    images: ["/large-meeting-room.png", "/executive-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema rộng rãi dành cho nhóm bạn 4 người. Ghế sofa lớn, màn hình chiếu siêu rộng, hệ thống âm thanh chất lượng cao. Thích hợp cho nhóm bạn xem phim, chơi board game, hoặc tổ chức sinh nhật mini.",
  },
  {
    id: "p104",
    branchId: "hcm-q1",
    name: "Cinema Room 04",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/small-office-room.jpg",
    images: ["/small-office-room.jpg", "/modern-meeting-room.png", "/modern-conference-room.png"],
    description:
      "Phòng cinema cozy với tone màu ấm áp, tạo cảm giác thư giãn tối đa. Ghế sofa êm ái, đèn LED điều chỉnh được. Hoàn hảo cho couple muốn có không gian riêng tư, lãng mạn để xem phim hoặc trò chuyện.",
  },
  // HCM Q3 rooms (4 rooms)
  {
    id: "q3-101",
    branchId: "hcm-q3",
    name: "Cinema Room 05",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-meeting-room.png",
    images: ["/modern-meeting-room.png", "/modern-conference-room.png", "/small-office-room.jpg"],
    description:
      "Phòng cinema phong cách minimalist với thiết kế tinh tế. Không gian thoáng đãng, ánh sáng tự nhiên. Thích hợp cho những ai yêu thích sự đơn giản nhưng vẫn đầy đủ tiện nghi để thưởng thức phim ảnh.",
  },
  {
    id: "q3-102",
    branchId: "hcm-q3",
    name: "Cinema Room 06",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-conference-room.png",
    images: ["/modern-conference-room.png", "/modern-business-meeting.png", "/modern-meeting-room.png"],
    description:
      "Phòng cinema couple với không gian riêng tư tuyệt đối. Ghế sofa cao cấp, màn hình 4K sắc nét. Âm thanh Dolby Digital. Lý tưởng cho các cặp đôi muốn có những giây phút riêng tư, xem phim hoặc nghe nhạc.",
  },
  {
    id: "q3-201",
    branchId: "hcm-q3",
    name: "Cinema Room 07",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/large-meeting-room.png",
    images: ["/large-meeting-room.png", "/executive-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema VIP cho nhóm 4 người với không gian sang trọng. Ghế sofa da cao cấp, màn hình chiếu lớn, hệ thống âm thanh vòm 5.1. Hoàn hảo cho nhóm bạn thân muốn có trải nghiệm xem phim đẳng cấp.",
  },
  {
    id: "q3-202",
    branchId: "hcm-q3",
    name: "Cinema Room 08",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/executive-meeting-room.png",
    images: ["/executive-meeting-room.png", "/large-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema premium với thiết kế hiện đại, đầy đủ tiện nghi. Ghế massage thư giãn, tủ lạnh mini, bàn trà. Thích hợp cho nhóm bạn muốn có không gian vừa xem phim vừa thư giãn thoải mái.",
  },
  // HCM Thu Duc rooms (4 rooms)
  {
    id: "td-a01",
    branchId: "hcm-td",
    name: "Cinema Room 09",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/small-office-room.jpg",
    images: ["/small-office-room.jpg", "/modern-conference-room.png", "/modern-meeting-room.png"],
    description:
      "Phòng cinema ấm cúng với tone màu pastel dịu nhẹ. Ghế sofa êm ái, chăn ấm, gối tựa. Không gian lý tưởng cho couple muốn có cảm giác như ở nhà, xem phim và thư giãn cùng nhau.",
  },
  {
    id: "td-a02",
    branchId: "hcm-td",
    name: "Cinema Room 10",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-conference-room.png",
    images: ["/modern-conference-room.png", "/modern-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema hiện đại với công nghệ chiếu phim mới nhất. Màn hình LED 4K, âm thanh Dolby Atmos. Ghế sofa điện tử điều chỉnh được. Hoàn hảo cho những ai yêu thích công nghệ và chất lượng hình ảnh.",
  },
  {
    id: "td-b01",
    branchId: "hcm-td",
    name: "Cinema Room 11",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/large-meeting-room.png",
    images: ["/large-meeting-room.png", "/executive-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema rộng rãi cho nhóm bạn với không gian vui vẻ, năng động. Màn hình chiếu lớn, ghế sofa thoải mái, bàn để đồ ăn. Lý tưởng cho nhóm bạn xem phim, ăn uống và trò chuyện.",
  },
  {
    id: "td-b02",
    branchId: "hcm-td",
    name: "Cinema Room 12",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/executive-meeting-room.png",
    images: ["/executive-meeting-room.png", "/large-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema cao cấp với thiết kế sang trọng, đẳng cấp. Ghế sofa da thật, hệ thống âm thanh hi-end, điều hòa thông minh. Thích hợp cho nhóm bạn muốn trải nghiệm xem phim như rạp chiếu thực thụ.",
  },
  // Hanoi Hoan Kiem rooms (4 rooms)
  {
    id: "hk-101",
    branchId: "hn-hk",
    name: "Cinema Room 13",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-meeting-room.png",
    images: ["/modern-meeting-room.png", "/modern-conference-room.png", "/small-office-room.jpg"],
    description:
      "Phòng cinema couple tại trung tâm Hà Nội với view đẹp. Không gian lãng mạn, ánh sáng vàng ấm áp. Ghế sofa êm ái, chăn ấm. Hoàn hảo cho couple muốn hẹn hò, xem phim trong không gian riêng tư.",
  },
  {
    id: "hk-102",
    branchId: "hn-hk",
    name: "Cinema Room 14",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-conference-room.png",
    images: ["/modern-conference-room.png", "/modern-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema hiện đại với thiết kế tối giản, thanh lịch. Màn hình chiếu sắc nét, âm thanh trong treo. Không gian yên tĩnh, lý tưởng cho những ai muốn tập trung thưởng thức phim ảnh.",
  },
  {
    id: "hk-201",
    branchId: "hn-hk",
    name: "Cinema Room 15",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/executive-meeting-room.png",
    images: ["/executive-meeting-room.png", "/large-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema VIP cho nhóm với không gian rộng rãi, thoải mái. Ghế sofa lớn, bàn trà, tủ lạnh mini. Hệ thống âm thanh chất lượng cao. Thích hợp cho nhóm bạn tổ chức tiệc nhỏ, xem phim cùng nhau.",
  },
  {
    id: "hk-202",
    branchId: "hn-hk",
    name: "Cinema Room 16",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/large-meeting-room.png",
    images: ["/large-meeting-room.png", "/executive-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema premium với đầy đủ tiện nghi cao cấp. Màn hình chiếu 120 inch, âm thanh vòm 7.1, ghế massage. Hoàn hảo cho nhóm bạn muốn có trải nghiệm xem phim đẳng cấp như rạp chiếu chuyên nghiệp.",
  },
  // Hanoi Cau Giay rooms (4 rooms)
  {
    id: "cg-a1",
    branchId: "hn-cg",
    name: "Cinema Room 17",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/small-office-room.jpg",
    images: ["/small-office-room.jpg", "/modern-conference-room.png", "/modern-meeting-room.png"],
    description:
      "Phòng cinema cozy với không gian ấm áp, thân thiện. Ghế sofa êm, đèn LED nhiều màu sắc. Lý tưởng cho couple muốn có không gian riêng tư để xem phim, nghe nhạc hoặc đơn giản là ở bên nhau.",
  },
  {
    id: "cg-a2",
    branchId: "hn-cg",
    name: "Cinema Room 18",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-conference-room.png",
    images: ["/modern-conference-room.png", "/modern-meeting-room.png", "/small-office-room.jpg"],
    description:
      "Phòng cinema hiện đại với thiết kế trẻ trung, năng động. Màn hình 4K, âm thanh stereo chất lượng cao. Không gian thoáng đãng, thích hợp cho couple trẻ yêu thích phong cách hiện đại.",
  },
  {
    id: "cg-b1",
    branchId: "hn-cg",
    name: "Cinema Room 19",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/large-meeting-room.png",
    images: ["/large-meeting-room.png", "/executive-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema rộng cho nhóm bạn với không gian vui vẻ. Ghế sofa lớn, bàn để đồ ăn, tủ lạnh. Màn hình chiếu lớn, âm thanh vòm. Hoàn hảo cho nhóm bạn xem phim, chơi game, ăn uống cùng nhau.",
  },
  {
    id: "cg-b2",
    branchId: "hn-cg",
    name: "Cinema Room 20",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/executive-meeting-room.png",
    images: ["/executive-meeting-room.png", "/large-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema cao cấp với thiết kế sang trọng, đẳng cấp. Ghế sofa da cao cấp, hệ thống âm thanh hi-end, điều hòa thông minh. Lý tưởng cho nhóm bạn muốn trải nghiệm xem phim như rạp thực thụ.",
  },
  // Da Nang rooms (4 rooms)
  {
    id: "dn-101",
    branchId: "dn-hc",
    name: "Cinema Room 21",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-meeting-room.png",
    images: ["/modern-meeting-room.png", "/modern-conference-room.png", "/small-office-room.jpg"],
    description:
      "Phòng cinema couple tại Đà Nẵng với view biển đẹp. Không gian lãng mạn, thoáng mát. Ghế sofa êm ái, ánh sáng điều chỉnh được. Hoàn hảo cho couple muốn hẹn hò, xem phim trong không gian riêng tư.",
  },
  {
    id: "dn-102",
    branchId: "dn-hc",
    name: "Cinema Room 22",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/large-meeting-room.png",
    images: ["/large-meeting-room.png", "/executive-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema rộng rãi cho nhóm bạn với không gian thoải mái. Màn hình chiếu lớn, ghế sofa êm, bàn trà. Thích hợp cho nhóm bạn xem phim, chơi board game, hoặc tổ chức sinh nhật mini.",
  },
  {
    id: "dn-201",
    branchId: "dn-hc",
    name: "Cinema Room 23",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-conference-room.png",
    images: ["/modern-conference-room.png", "/modern-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema hiện đại với thiết kế minimalist. Màn hình 4K sắc nét, âm thanh Dolby. Không gian yên tĩnh, lý tưởng cho couple muốn tập trung thưởng thức phim ảnh chất lượng cao.",
  },
  {
    id: "dn-202",
    branchId: "dn-hc",
    name: "Cinema Room 24",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/executive-meeting-room.png",
    images: ["/executive-meeting-room.png", "/large-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema VIP với đầy đủ tiện nghi cao cấp. Ghế sofa da thật, hệ thống âm thanh vòm, tủ lạnh mini. Hoàn hảo cho nhóm bạn muốn có trải nghiệm xem phim đẳng cấp tại Đà Nẵng.",
  },
  // Can Tho rooms (4 rooms)
  {
    id: "ct-101",
    branchId: "ct-nt",
    name: "Cinema Room 25",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/small-office-room.jpg",
    images: ["/small-office-room.jpg", "/modern-conference-room.png", "/modern-meeting-room.png"],
    description:
      "Phòng cinema ấm cúng tại Cần Thơ với không gian thân thiện. Ghế sofa êm, chăn ấm, gối tựa. Lý tưởng cho couple muốn có không gian riêng tư, xem phim và thư giãn cùng nhau.",
  },
  {
    id: "ct-102",
    branchId: "ct-nt",
    name: "Cinema Room 26",
    capacity: 2,
    pricePerHour: 80000,
    amenities: cinemaAmenities,
    image: "/modern-conference-room.png",
    images: ["/modern-conference-room.png", "/modern-meeting-room.png", "/small-office-room.jpg"],
    description:
      "Phòng cinema hiện đại với thiết kế trẻ trung. Màn hình chiếu sắc nét, âm thanh chất lượng cao. Không gian thoáng đãng, thích hợp cho couple trẻ yêu thích phong cách hiện đại.",
  },
  {
    id: "ct-201",
    branchId: "ct-nt",
    name: "Cinema Room 27",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/large-meeting-room.png",
    images: ["/large-meeting-room.png", "/executive-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema rộng cho nhóm bạn với không gian vui vẻ, năng động. Ghế sofa lớn, bàn trà, màn hình chiếu lớn. Hoàn hảo cho nhóm bạn xem phim, chơi game, ăn uống cùng nhau.",
  },
  {
    id: "ct-202",
    branchId: "ct-nt",
    name: "Cinema Room 28",
    capacity: 4,
    pricePerHour: 100000,
    amenities: cinemaAmenities,
    image: "/executive-meeting-room.png",
    images: ["/executive-meeting-room.png", "/large-meeting-room.png", "/modern-business-meeting.png"],
    description:
      "Phòng cinema premium với thiết kế sang trọng. Ghế sofa cao cấp, hệ thống âm thanh vòm, điều hòa thông minh. Lý tưởng cho nhóm bạn muốn trải nghiệm xem phim đẳng cấp tại Cần Thơ.",
  },
]

export const comboPackages: ComboPackage[] = [
  { id: "combo-2h", name: "COMBO 2H", duration: 2, price: 159000, description: "2 giờ xem phim" },
  { id: "combo-4h", name: "COMBO 4H", duration: 4, price: 239000, description: "4 giờ xem phim" },
  { id: "combo-6h", name: "COMBO 6H", duration: 6, price: 309000, description: "6 giờ xem phim" },
  { id: "combo-10h", name: "COMBO 10H", duration: 10, price: 369000, description: "10 giờ xem phim" },
  { id: "combo-overnight", name: "QUA ĐÊM", duration: 15, price: 409000, description: "21H-12H" },
  { id: "combo-day", name: "NGAY", duration: 22, price: 499000, description: "14H-12H" },
]

export const menuItems: MenuItem[] = [
  { id: "water", name: "NƯỚC SUỐI", price: 10000, category: "drink" },
  { id: "soft-drink", name: "NƯỚC NGỌT", price: 20000, category: "drink" },
  { id: "snack-food", name: "ĐỒ ĂN SẶY", price: 40000, category: "food" },
  { id: "snack", name: "SNACK", price: 10000, category: "snack" },
  { id: "extra-charge", name: "BCS THÊM", price: 15000, category: "extra" },
]
