import { NextResponse } from "next/server";
import { databaseService } from "@/lib/services/database.service";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { email, password, name, avatar } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios" }, { status: 400 });
    }
    const result = await databaseService.createUser({ email, password, name, avatar });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }
    // Persistir el usuario en database.json
    const databasePath = path.join(process.cwd(), "data", "database.json");
    // Leer el archivo actual
    const dbRaw = await fs.readFile(databasePath, "utf-8");
    const db = JSON.parse(dbRaw);
    db.users.push({ ...result.user, password }); // Guardar con password para login simulado
    await fs.writeFile(databasePath, JSON.stringify(db, null, 2), "utf-8");
    // No devolver la contraseña si existe
    const user = result.user ? { ...result.user } : {};
    if ('password' in user) delete (user as any).password;
    return NextResponse.json({ success: true, user });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 });
  }
} 