/* eslint-disable no-console */
import connectDB from '../mongodb'
import City from '../models/City'
import Branch from '../models/Branch'
import RoomType from '../models/RoomType'
import Room from '../models/Room'
import ComboPackage from '../models/ComboPackage'
import MenuItem from '../models/MenuItem'

async function seedDatabase() {
  try {
    await connectDB()

    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await City.deleteMany({})
    await Branch.deleteMany({})
    await RoomType.deleteMany({})
    await Room.deleteMany({})
    await ComboPackage.deleteMany({})
    await MenuItem.deleteMany({})

    console.log('✅ Cleared existing data')

    // 1. Seed Cities
    const cities = await City.insertMany([
      { code: 'hcm', name: 'TP. Hồ Chí Minh', slug: 'tp-ho-chi-minh', isActive: true, displayOrder: 1 },
      { code: 'hn', name: 'Hà Nội', slug: 'ha-noi', isActive: true, displayOrder: 2 },
      { code: 'dn', name: 'Đà Nẵng', slug: 'da-nang', isActive: true, displayOrder: 3 },
      { code: 'ct', name: 'Cần Thơ', slug: 'can-tho', isActive: true, displayOrder: 4 },
    ])
    console.log(`✅ Created ${cities.length} cities`)

    // 2. Seed Branches
    const hcmCity = cities.find((c) => c.code === 'hcm')!
    const hnCity = cities.find((c) => c.code === 'hn')!
    const dnCity = cities.find((c) => c.code === 'dn')!
    const ctCity = cities.find((c) => c.code === 'ct')!

    const branches = await Branch.insertMany([
      {
        cityId: hcmCity._id,
        name: 'Chi nhánh Quận 1',
        slug: 'chi-nhanh-quan-1',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        phone: '0989760000',
        images: ['/branch-hcm-q1.jpg'],
        amenities: [
          'Máy chiếu siêu nét',
          'Netflix & Youtube',
          'Board game',
          'Ghế sofa/lưới',
          'Gương toàn thân',
          'WC trong phòng',
          'Check-in tự động',
        ],
      },
      {
        cityId: hcmCity._id,
        name: 'Chi nhánh Quận 3',
        slug: 'chi-nhanh-quan-3',
        address: '456 Võ Văn Tần, Quận 3, TP.HCM',
        phone: '0989760000',
        images: ['/branch-hcm-q3.jpg'],
        amenities: [
          'Máy chiếu siêu nét',
          'Netflix & Youtube',
          'Board game',
          'Ghế sofa/lưới',
          'Gương toàn thân',
          'WC trong phòng',
          'Check-in tự động',
        ],
      },
      {
        cityId: hcmCity._id,
        name: 'Chi nhánh Thủ Đức',
        slug: 'chi-nhanh-thu-duc',
        address: '789 Võ Văn Ngân, Thủ Đức, TP.HCM',
        phone: '0989760000',
        images: ['/branch-hcm-td.jpg'],
        amenities: [
          'Máy chiếu siêu nét',
          'Netflix & Youtube',
          'Board game',
          'Ghế sofa/lưới',
          'Gương toàn thân',
          'WC trong phòng',
          'Check-in tự động',
        ],
      },
      {
        cityId: hnCity._id,
        name: 'Chi nhánh Hoàn Kiếm',
        slug: 'chi-nhanh-hoan-kiem',
        address: '321 Hàng Bài, Hoàn Kiếm, Hà Nội',
        phone: '0989760000',
        images: ['/branch-hn-hk.jpg'],
        amenities: [
          'Máy chiếu siêu nét',
          'Netflix & Youtube',
          'Board game',
          'Ghế sofa/lưới',
          'Gương toàn thân',
          'WC trong phòng',
          'Check-in tự động',
        ],
      },
      {
        cityId: hnCity._id,
        name: 'Chi nhánh Cầu Giấy',
        slug: 'chi-nhanh-cau-giay',
        address: '654 Xuân Thủy, Cầu Giấy, Hà Nội',
        phone: '0989760000',
        images: ['/branch-hn-cg.jpg'],
        amenities: [
          'Máy chiếu siêu nét',
          'Netflix & Youtube',
          'Board game',
          'Ghế sofa/lưới',
          'Gương toàn thân',
          'WC trong phòng',
          'Check-in tự động',
        ],
      },
      {
        cityId: dnCity._id,
        name: 'Chi nhánh Hải Châu',
        slug: 'chi-nhanh-hai-chau',
        address: '147 Trần Phú, Hải Châu, Đà Nẵng',
        phone: '0989760000',
        images: ['/branch-dn-hc.jpg'],
        amenities: [
          'Máy chiếu siêu nét',
          'Netflix & Youtube',
          'Board game',
          'Ghế sofa/lưới',
          'Gương toàn thân',
          'WC trong phòng',
          'Check-in tự động',
        ],
      },
      {
        cityId: ctCity._id,
        name: 'Chi nhánh Ninh Kiều',
        slug: 'chi-nhanh-ninh-kieu',
        address: '258 Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ',
        phone: '0989760000',
        images: ['/branch-ct-nt.jpg'],
        amenities: [
          'Máy chiếu siêu nét',
          'Netflix & Youtube',
          'Board game',
          'Ghế sofa/lưới',
          'Gương toàn thân',
          'WC trong phòng',
          'Check-in tự động',
        ],
      },
    ])
    console.log(`✅ Created ${branches.length} branches`)

    // 3. Seed Room Types
    const roomTypes = await RoomType.insertMany([
      {
        name: 'Classic',
        slug: 'classic',
        description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi',
        features: ['Máy chiếu HD', 'Netflix', 'Board game cơ bản'],
        color: '#ec4899',
        displayOrder: 1,
      },
      {
        name: 'Luxury',
        slug: 'luxury',
        description: 'Phòng cao cấp với không gian rộng rãi',
        features: ['Máy chiếu 4K', 'Netflix Premium', 'Board game cao cấp', 'Ghế massage'],
        color: '#8b5cf6',
        displayOrder: 2,
      },
      {
        name: 'VIP',
        slug: 'vip',
        description: 'Phòng VIP với trải nghiệm đẳng cấp',
        features: ['Máy chiếu 4K HDR', 'Netflix Premium', 'Board game cao cấp', 'Ghế massage', 'Mini bar'],
        color: '#f59e0b',
        displayOrder: 3,
      },
    ])
    console.log(`✅ Created ${roomTypes.length} room types`)

    // 4. Seed Rooms
    const classicType = roomTypes.find((t) => t.slug === 'classic')!
    const luxuryType = roomTypes.find((t) => t.slug === 'luxury')!

    const roomsData = []
    for (const branch of branches) {
      for (let i = 1; i <= 4; i++) {
        const capacity = i <= 2 ? 2 : 4
        const pricePerHour = capacity === 2 ? 80000 : 100000
        const roomType = i <= 2 ? classicType : luxuryType

        roomsData.push({
          branchId: branch._id,
          roomTypeId: roomType._id,
          name: `Cinema Room ${String(i).padStart(2, '0')}`,
          code: `R${String(i).padStart(2, '0')}`,
          capacity,
          pricePerHour,
          images: [
            '/modern-meeting-room.png',
            '/modern-conference-room.png',
            '/modern-business-meeting.png',
            '/large-meeting-room.png',
          ],
          amenities: [
            'Máy chiếu siêu nét',
            'Có sẵn Netflix & Youtube',
            'Board game cho couple',
            'Ghế sofa hoặc ghế lưới',
            'Gương toàn thân',
            'Nhà vệ sinh trong phòng',
            'Checkin tự động',
          ],
          description: `Phòng cinema ${roomType.name.toLowerCase()} với không gian ${capacity === 2 ? 'couple' : 'nhóm'} ấm cúng, ghế sofa êm ái. Trang bị màn hình chiếu lớn, âm thanh vòm sống động.`,
          status: 'available',
        })
      }
    }

    const rooms = await Room.insertMany(roomsData)
    console.log(`✅ Created ${rooms.length} rooms`)

    // 5. Seed Combo Packages
    const combos = await ComboPackage.insertMany([
      {
        name: 'COMBO 2H',
        code: 'combo-2h',
        duration: 2,
        price: 159000,
        description: '2 giờ xem phim',
        displayOrder: 1,
      },
      {
        name: 'COMBO 4H',
        code: 'combo-4h',
        duration: 4,
        price: 239000,
        description: '4 giờ xem phim',
        displayOrder: 2,
      },
      {
        name: 'COMBO 6H',
        code: 'combo-6h',
        duration: 6,
        price: 309000,
        description: '6 giờ xem phim',
        displayOrder: 3,
      },
      {
        name: 'COMBO 10H',
        code: 'combo-10h',
        duration: 10,
        price: 369000,
        description: '10 giờ xem phim',
        displayOrder: 4,
      },
      {
        name: 'QUA ĐÊM',
        code: 'combo-overnight',
        duration: 15,
        price: 409000,
        description: '21H-12H',
        isSpecial: true,
        timeRange: { start: '21:00', end: '12:00' },
        displayOrder: 5,
      },
      {
        name: 'NGÀY',
        code: 'combo-day',
        duration: 22,
        price: 499000,
        description: '14H-12H',
        isSpecial: true,
        timeRange: { start: '14:00', end: '12:00' },
        displayOrder: 6,
      },
    ])
    console.log(`✅ Created ${combos.length} combo packages`)

    // 6. Seed Menu Items
    const menuItems = await MenuItem.insertMany([
      { name: 'NƯỚC SUỐI', price: 10000, category: 'drink', displayOrder: 1 },
      { name: 'NƯỚC NGỌT', price: 20000, category: 'drink', displayOrder: 2 },
      { name: 'ĐỒ ĂN SẶY', price: 40000, category: 'food', displayOrder: 3 },
      { name: 'SNACK', price: 10000, category: 'snack', displayOrder: 4 },
      { name: 'BCS THÊM', price: 15000, category: 'extra', displayOrder: 5 },
    ])
    console.log(`✅ Created ${menuItems.length} menu items`)

    console.log('\n🎉 Database seeded successfully!')
    console.log('📊 Summary:')
    console.log(`   - Cities: ${cities.length}`)
    console.log(`   - Branches: ${branches.length}`)
    console.log(`   - Room Types: ${roomTypes.length}`)
    console.log(`   - Rooms: ${rooms.length}`)
    console.log(`   - Combo Packages: ${combos.length}`)
    console.log(`   - Menu Items: ${menuItems.length}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
