import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const bonds = await prisma.bond.findMany();
  return NextResponse.json(bonds);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newBond = await prisma.bond.create({
    data: {
      ...body,
      tasaOportunidad: body.tasaOportunidad ?? (body.input?.tasaOportunidad ?? null),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastCalculation: null as any,
    },
  });
  return NextResponse.json(newBond, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  const bond = await prisma.bond.update({
    where: { id },
    data: {
      ...updates,
      tasaOportunidad: updates.tasaOportunidad ?? (updates.input?.tasaOportunidad ?? null),
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(bond);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.bond.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const { id, lastCalculation } = await req.json();
  const bond = await prisma.bond.update({
    where: { id },
    data: { lastCalculation: lastCalculation as any, updatedAt: new Date() },
  });
  return NextResponse.json(bond);
} 