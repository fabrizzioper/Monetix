import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
    }
    const { password: _, ...userWithoutPassword } = user;
    // Token simulado
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return NextResponse.json({ success: true, user: userWithoutPassword, token });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 });
  }
} 