"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CreditCard, User, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/use-auth"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  {
    title: "Mis Bonos",
    href: "/dashboard",
    icon: CreditCard,
  },
  {
    title: "Mi Perfil",
    href: "/profile",
    icon: User,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 lg:hidden bg-white shadow-lg border border-gray-200 h-10 w-10 rounded-lg"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none",
          // Mobile: slide in/out
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:relative lg:z-auto",
          "w-72 sm:w-80 lg:w-64",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image src="/images/monetix-icon.png" alt="Monetix" width={32} height={32} className="rounded w-8 h-8" />
            <span className="font-semibold text-gray-900 text-lg lg:text-base">Monetix</span>
          </div>
          {/* Close button for mobile */}
          <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 lg:p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 lg:h-10 lg:w-10">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback className="bg-monetix-primary text-white text-lg lg:text-sm">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-base lg:text-sm font-medium text-gray-900 truncate">{user?.name || "Usuario"}</p>
              <p className="text-sm lg:text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 lg:p-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onToggle()} // Close mobile menu on navigation
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 lg:px-3 lg:py-2 rounded-lg text-base lg:text-sm font-medium transition-colors w-full",
                      isActive
                        ? "bg-monetix-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-6 w-6 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 lg:p-3 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 h-12 lg:h-10 text-base lg:text-sm"
          >
            <LogOut className="h-6 w-6 lg:h-5 lg:w-5 flex-shrink-0" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </>
  )
}
