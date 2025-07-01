export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Re-exportar tipos de bond-calculations para evitar duplicados
export type { BondInput, BondMetrics, FlowRow, BondCalculationResult, BondConstants } from "./bond-calculations"
export type { BondRecord, Database } from "./database"
