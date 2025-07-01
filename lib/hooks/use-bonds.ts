"use client"

import { useState, useEffect } from "react"
import type { BondRecord } from "@/lib/types"

export function useBonds() {
  const [bonds, setBonds] = useState<BondRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        setIsLoading(true)
        // Este hook ya no se usa, se reemplazó por useUserBonds
        setBonds([])
        setError(null)
      } catch (err) {
        setError("Error de conexión")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBonds()
  }, [])

  return { bonds, isLoading, error }
}
