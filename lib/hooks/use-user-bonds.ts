"use client"

import { useState, useEffect, useCallback } from "react"
import type { BondRecord } from "@/lib/types/database"
import type { BondInput, BondCalculationResult } from "@/lib/types/bond-calculations"
import { BondsService } from "@/lib/services/bonds.service"
import { useAuth } from "./use-auth"

export function useUserBonds() {
  const { user } = useAuth()
  const [bonds, setBonds] = useState<BondRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar bonos del usuario
  const loadBonds = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)
      const userBonds = await BondsService.getUserBonds(user.id)
      setBonds(userBonds)
    } catch (err) {
      setError("Error al cargar los bonos")
      console.error("Error loading bonds:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Crear nuevo bono
  const createBond = useCallback(
    async (name: string, input: BondInput): Promise<BondRecord | null> => {
      if (!user?.id) return null

      try {
        const newBond = await BondsService.createBond(user.id, name, input)
        setBonds((prev) => [newBond, ...prev])
        return newBond
      } catch (err) {
        setError("Error al crear el bono")
        console.error("Error creating bond:", err)
        return null
      }
    },
    [user?.id],
  )

  // Actualizar bono existente
  const updateBond = useCallback(
    async (bondId: string, updates: { name?: string; input?: BondInput }): Promise<BondRecord | null> => {
      if (!user?.id) return null

      try {
        const updatedBond = await BondsService.updateBond(bondId, user.id, updates)
        if (updatedBond) {
          setBonds((prev) => prev.map((bond) => (bond.id === bondId ? updatedBond : bond)))
        }
        return updatedBond
      } catch (err) {
        setError("Error al actualizar el bono")
        console.error("Error updating bond:", err)
        return null
      }
    },
    [user?.id],
  )

  // Eliminar bono
  const deleteBond = useCallback(
    async (bondId: string): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const success = await BondsService.deleteBond(bondId, user.id)
        if (success) {
          setBonds((prev) => prev.filter((bond) => bond.id !== bondId))
        }
        return success
      } catch (err) {
        setError("Error al eliminar el bono")
        console.error("Error deleting bond:", err)
        return false
      }
    },
    [user?.id],
  )

  // Calcular bono y guardar
  const calculateBond = useCallback(
    async (bondId: string): Promise<BondCalculationResult | null> => {
      if (!user?.id) return null

      try {
        const result = await BondsService.calculateAndSaveBond(bondId, user.id)
        if (result) {
          // Actualizar el bono en la lista local
          await loadBonds()
        }
        return result
      } catch (err) {
        setError("Error al calcular el bono")
        console.error("Error calculating bond:", err)
        return null
      }
    },
    [user?.id, loadBonds],
  )

  // Obtener un bono específico
  const getBond = useCallback(
    async (bondId: string): Promise<BondRecord | null> => {
      if (!user?.id) return null

      try {
        return await BondsService.getBond(bondId, user.id)
      } catch (err) {
        setError("Error al obtener el bono")
        console.error("Error getting bond:", err)
        return null
      }
    },
    [user?.id],
  )

  // Cargar bonos al montar el componente
  useEffect(() => {
    loadBonds()
  }, [loadBonds])

  return {
    bonds,
    isLoading,
    error,
    loadBonds,
    createBond,
    updateBond,
    deleteBond,
    calculateBond,
    getBond,
  }
}
