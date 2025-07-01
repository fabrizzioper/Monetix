import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios" }, { status: 400 });
    }
    const databasePath = path.join(process.cwd(), "data", "database.json");
    const dbRaw = await fs.readFile(databasePath, "utf-8");
    const db = JSON.parse(dbRaw);
    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
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