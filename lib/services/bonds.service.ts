import type { BondRecord, BondInput } from "@/lib/types/database"
import type { BondCalculationResult } from "@/lib/types/bond-calculations"
import { databaseService } from "./database.service"
import { calculateBond } from "./bond-calculations.service"

export class BondsService {
  static async getUserBonds(userId: string): Promise<BondRecord[]> {
    const res = await fetch('/api/bonds', { cache: 'no-store' })
    const bonds = await res.json()
    return bonds.filter((b: any) => b.userId === userId && b.status === 'active')
  }

  static async getBond(bondId: string, userId: string): Promise<BondRecord | null> {
    const res = await fetch('/api/bonds', { cache: 'no-store' })
    const bonds = await res.json()
    return bonds.find((b: any) => b.id === bondId && b.userId === userId) || null
  }

  static async createBond(userId: string, name: string, input: BondInput): Promise<BondRecord> {
    const res = await fetch('/api/bonds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, input, tasaOportunidad: input.tasaOportunidad }),
    })
    return await res.json()
  }

  static async updateBond(bondId: string, userId: string, updates: { name?: string; input?: BondInput }): Promise<BondRecord | null> {
    const res = await fetch('/api/bonds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bondId, userId, ...updates, tasaOportunidad: updates.input?.tasaOportunidad }),
    })
    if (!res.ok) return null
    return await res.json()
  }

  static async deleteBond(bondId: string, userId: string): Promise<boolean> {
    const res = await fetch('/api/bonds', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bondId, userId }),
    })
    return res.ok
  }

  static async calculateAndSaveBond(bondId: string, userId: string, lastCalculation?: any): Promise<any> {
    // PATCH para guardar el cálculo
    const res = await fetch('/api/bonds', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bondId, userId, lastCalculation }),
    })
    if (!res.ok) return null
    return await res.json()
  }

  static async calculateBondPreview(input: BondInput, bondName = "Vista Previa"): Promise<BondCalculationResult> {
    return calculateBond(input, bondName)
  }
}
