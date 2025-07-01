import type { Database, User, BondRecord } from "@/lib/types/database"
import type { BondInput } from "@/lib/types/bond-calculations"
import databaseData from "@/data/database.json"
import { promises as fs } from "fs"
import path from "path"

class DatabaseService {
  private data: Database

  constructor() {
    this.data = databaseData as unknown as Database
  }

  // Simular persistencia (en una app real sería API calls)
  private async simulateDelay(ms = 300): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Usuarios
  async getUserByCredentials(email: string, password: string): Promise<User | null> {
    await this.simulateDelay()
    // Leer siempre la última versión del archivo
    try {
      const databasePath = path.join(process.cwd(), "data", "database.json")
      const dbRaw = await fs.readFile(databasePath, "utf-8")
      const db: Database = JSON.parse(dbRaw)
      type UserWithPassword = User & { password: string }
      const user = (db.users as UserWithPassword[]).find((u) => u.email === email && u.password === password)
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
      }
      return null
    } catch (e) {
      return null
    }
  }

  async getUserById(id: string): Promise<User | null> {
    await this.simulateDelay(100)
    const user = this.data.users.find((u) => u.id === id)
    if (user) {
      const { password: _, ...userWithoutPassword } = user as any
      return userWithoutPassword
    }
    return null
  }

  // Bonos
  async getBondsByUserId(userId: string): Promise<BondRecord[]> {
    await this.simulateDelay()
    return this.data.bonds.filter((b) => b.userId === userId && b.status === "active")
  }

  async getBondById(bondId: string, userId: string): Promise<BondRecord | null> {
    await this.simulateDelay(200)
    const bond = this.data.bonds.find((b) => b.id === bondId && b.userId === userId)
    return bond || null
  }

  async createBond(userId: string, bondData: { name: string; input: BondInput }): Promise<BondRecord> {
    await this.simulateDelay(500)

    const newBond: BondRecord = {
      id: this.generateId(),
      userId,
      name: bondData.name,
      code: this.generateBondCode(),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      input: bondData.input,
      lastCalculation: null,
    }

    // Simular inserción en BD
    this.data.bonds.push(newBond)

    return newBond
  }

  async updateBond(bondId: string, userId: string, updates: Partial<BondRecord>): Promise<BondRecord | null> {
    await this.simulateDelay(400)

    const bondIndex = this.data.bonds.findIndex((b) => b.id === bondId && b.userId === userId)
    if (bondIndex === -1) return null

    const updatedBond = {
      ...this.data.bonds[bondIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.data.bonds[bondIndex] = updatedBond

    return updatedBond
  }

  async deleteBond(bondId: string, userId: string): Promise<boolean> {
    await this.simulateDelay(300)

    const bondIndex = this.data.bonds.findIndex((b) => b.id === bondId && b.userId === userId)
    if (bondIndex === -1) return false

    // Soft delete
    this.data.bonds[bondIndex].status = "inactive"
    this.data.bonds[bondIndex].updatedAt = new Date().toISOString()

    return true
  }

  async saveBondCalculation(
    bondId: string,
    userId: string,
    calculation: { metrics: any; schedule?: any[] },
  ): Promise<boolean> {
    await this.simulateDelay(200)

    const bondIndex = this.data.bonds.findIndex((b) => b.id === bondId && b.userId === userId)
    if (bondIndex === -1) return false

    this.data.bonds[bondIndex].lastCalculation = {
      calculatedAt: new Date().toISOString(),
      ...calculation,
    }
    this.data.bonds[bondIndex].updatedAt = new Date().toISOString()

    return true
  }

  private generateBondCode(): string {
    const existingCodes = this.data.bonds.map((b) => b.code)
    let counter = 1
    let code: string

    do {
      code = `BON-${counter.toString().padStart(3, "0")}`
      counter++
    } while (existingCodes.includes(code))

    return code
  }

  // Crear usuario
  async createUser(userData: { email: string; password: string; name: string; avatar?: string }): Promise<{ success: boolean; user?: User; message?: string }> {
    await this.simulateDelay(300);
    const exists = this.data.users.some(u => u.email === userData.email);
    if (exists) {
      return { success: false, message: "El correo ya está registrado" };
    }
    const newUser: User = {
      id: this.generateId(),
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      createdAt: new Date().toISOString(),
      // @ts-ignore
      password: userData.password, // Solo para simulación, no guardar en producción
    };
    // @ts-ignore
    this.data.users.push(newUser);
    return { success: true, user: newUser };
  }
}

export const databaseService = new DatabaseService()
