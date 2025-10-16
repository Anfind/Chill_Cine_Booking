/**
 * Model Registry
 * Import tất cả models để đảm bảo Mongoose register schemas
 * Sử dụng file này trong API routes để tránh lỗi "Schema hasn't been registered"
 */

import City from './City'
import Branch from './Branch'
import RoomType from './RoomType'
import Room from './Room'
import ComboPackage from './ComboPackage'
import MenuItem from './MenuItem'
import Booking from './Booking'
import User from './User'

export { City, Branch, RoomType, Room, ComboPackage, MenuItem, Booking, User }

export default {
  City,
  Branch,
  RoomType,
  Room,
  ComboPackage,
  MenuItem,
  Booking,
  User,
}
