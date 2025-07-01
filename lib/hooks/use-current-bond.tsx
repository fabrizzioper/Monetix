"use client"

import React, { createContext, useContext, useState } from "react"
import type { BondRecord } from "@/lib/types/database"
import type { BondCalculationResult } from "@/lib/types/bond-calculations"

interface CurrentBondContextType {
  currentBond: BondRecord | null
  setCurrentBond: (bond: BondRecord | null) => void
  calculationResult: BondCalculationResult | null
  setCalculationResult: (result: BondCalculationResult | null) => void
  mode: "new" | "edit" | "view"
  setMode: (mode: "new" | "edit" | "view") => void
}

const CurrentBondContext = createContext<CurrentBondContextType | null>(null)

interface CurrentBondProviderProps {
  children: React.ReactNode
}

export function CurrentBondProvider({ children }: CurrentBondProviderProps) {
  const [currentBond, setCurrentBond] = useState<BondRecord | null>(null)
  const [calculationResult, setCalculationResult] = useState<BondCalculationResult | null>(null)
  const [mode, setMode] = useState<"new" | "edit" | "view">("new")

  const contextValue: CurrentBondContextType = {
    currentBond,
    setCurrentBond,
    calculationResult,
    setCalculationResult,
    mode,
    setMode,
  }

  return React.createElement(CurrentBondContext.Provider, { value: contextValue }, children)
}

export function useCurrentBond(): CurrentBondContextType {
  const context = useContext(CurrentBondContext)
  if (!context) {
    throw new Error("useCurrentBond must be used within CurrentBondProvider")
  }
  return context
}
