import type { BondInput, BondMetrics, FlowRow, BondConstants, BondCalculationResult } from "./bond-calculations"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface BondRecord {
  id: string
  userId: string
  name: string
  code: string
  status: "active" | "inactive" | "draft"
  createdAt: string
  updatedAt: string
  input: BondInput
  lastCalculation?: {
    calculatedAt: string
    input: BondInput
    constants: BondConstants
    metrics: BondMetrics
    schedule?: FlowRow[]
  } | null
}

export interface Database {
  users: User[]
  bonds: BondRecord[]
}

// Re-exportar tipos de cálculos
export type { BondInput, BondMetrics, FlowRow, BondConstants, BondCalculationResult } from "./bond-calculations"
