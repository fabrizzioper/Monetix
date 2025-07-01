import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/database.json');

async function readDB() {
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
}

async function writeDB(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  const db = await readDB();
  return NextResponse.json(db.bonds);
}

export async function POST(req: NextRequest) {
  const db = await readDB();
  const body = await req.json();
  const newBond = {
    ...body,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculation: null,
  };
  db.bonds.push(newBond);
  await writeDB(db);
  return NextResponse.json(newBond, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const db = await readDB();
  const body = await req.json();
  const { id, ...updates } = body;
  const idx = db.bonds.findIndex((b: any) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Bond not found' }, { status: 404 });
  db.bonds[idx] = { ...db.bonds[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeDB(db);
  return NextResponse.json(db.bonds[idx]);
}

export async function DELETE(req: NextRequest) {
  const db = await readDB();
  const { id } = await req.json();
  const idx = db.bonds.findIndex((b: any) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Bond not found' }, { status: 404 });
  db.bonds.splice(idx, 1);
  await writeDB(db);
  return NextResponse.json({ success: true });
}

// PATCH para calcular y guardar el resultado en lastCalculation
export async function PATCH(req: NextRequest) {
  const db = await readDB();
  const { id, lastCalculation } = await req.json();
  const idx = db.bonds.findIndex((b: any) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Bond not found' }, { status: 404 });
  db.bonds[idx].lastCalculation = lastCalculation;
  db.bonds[idx].updatedAt = new Date().toISOString();
  await writeDB(db);
  return NextResponse.json(db.bonds[idx]);
} 