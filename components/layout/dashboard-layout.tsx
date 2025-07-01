"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AppSidebar } from "./app-sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on mobile when clicking outside or resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false) // Close mobile menu on desktop
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    document.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Mobile top padding for hamburger button */}
          <div className="flex-1 overflow-auto">
            <div className="p-3 pt-16 sm:p-4 sm:pt-16 lg:pt-4 lg:p-6 min-h-full">{children}</div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
