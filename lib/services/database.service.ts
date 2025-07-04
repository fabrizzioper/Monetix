import { PrismaClient } from '@/lib/generated/prisma'
import type { BondInput } from "@/lib/types/bond-calculations"

const prisma = new PrismaClient()

class DatabaseService {
  // Usuarios
  async getUserByCredentials(email: string, password: string) {
    // Busca usuario por email y password (¡en producción nunca guardes password plano!)
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user as any
      return userWithoutPassword
    }
    return null
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (user) {
      const { password: _, ...userWithoutPassword } = user as any
      return userWithoutPassword
    }
    return null
  }

  // Bonos
  async getBondsByUserId(userId: string) {
    return await prisma.bond.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getBondById(bondId: string, userId: string) {
    return await prisma.bond.findFirst({ where: { id: bondId, userId } })
  }

  async createBond(userId: string, bondData: { name: string; input: BondInput }) {
    // Generar código único
    const existingCodes = (await prisma.bond.findMany({ select: { code: true } })).map(b => b.code)
    let counter = 1
    let code: string
    do {
      code = `BON-${counter.toString().padStart(3, "0")}`
      counter++
    } while (existingCodes.includes(code))

    const newBond = await prisma.bond.create({
      data: {
        userId,
        name: bondData.name,
        code,
        status: 'active',
        input: bondData.input as any,
        lastCalculation: null as any,
      },
    })
    return newBond
  }

  async updateBond(bondId: string, userId: string, updates: any) {
    const bond = await prisma.bond.update({
      where: { id: bondId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })
    return bond
  }

  async deleteBond(bondId: string, userId: string) {
    // Soft delete
    await prisma.bond.update({
      where: { id: bondId },
      data: { status: 'inactive', updatedAt: new Date() },
    })
    return true
  }

  async saveBondCalculation(
    bondId: string,
    userId: string,
    calculation: { metrics: any; schedule?: any[] },
  ) {
    await prisma.bond.update({
      where: { id: bondId },
      data: {
        lastCalculation: {
          calculatedAt: new Date().toISOString(),
          ...calculation,
        },
        updatedAt: new Date(),
      },
    })
    return true
  }

  // Crear usuario
  async createUser(userData: { email: string; password: string; name: string; avatar?: string }) {
    const exists = await prisma.user.findUnique({ where: { email: userData.email } })
    if (exists) {
      return { success: false, message: "El correo ya está registrado" }
    }
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        avatar: userData.avatar,
      },
    })
    return { success: true, user: newUser }
  }
}

export const databaseService = new DatabaseService()
