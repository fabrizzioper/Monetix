import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const usersPath = path.resolve(process.cwd(), 'data/users.json');

async function readUsers() {
  const data = await fs.readFile(usersPath, 'utf-8');
  return JSON.parse(data);
}

async function writeUsers(data: any) {
  await fs.writeFile(usersPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(req: NextRequest) {
  const { email, password, name, avatar } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
  }
  const db = await readUsers();
  const exists = db.users.some((u: any) => u.email === email);
  if (exists) {
    return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 409 });
  }
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();
  const user = { id, email, password, name, avatar: avatar || '/images/monetix-icon.png', createdAt };
  db.users.push(user);
  await writeUsers(db);
  const { password: _, ...userWithoutPassword } = user;
  return NextResponse.json(userWithoutPassword, { status: 201 });
} 