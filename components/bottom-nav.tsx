"use client"

import { Search, Phone, MessageCircle, Facebook, MapPin } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()

  // Don't show on admin pages
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const navItems = [
    {
      icon: Search,
      label: "Tìm cửa",
      href: "/",
    },
    {
      icon: Phone,
      label: "Hotline",
      href: "tel:1900xxxx",
    },
    {
      icon: MessageCircle,
      label: "Nhắn tin",
      href: "https://m.me/yourpage",
    },
    {
      icon: Facebook,
      label: "Fanpage",
      href: "https://facebook.com/yourpage",
    },
    // Tạm thời ẩn "Vị trí" vì chưa có page /locations
    // {
    //   icon: MapPin,
    //   label: "Vị trí",
    //   href: "/locations",
    // },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isExternal = item.href.startsWith("http") || item.href.startsWith("tel:")

          if (isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
