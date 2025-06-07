// src/app/api/admin/ai-models/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) throw new NextResponse('No autorizado', { status: 401 });
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new NextResponse('Token inválido', { status: 401 });
  }
  if (payload.role !== 'admin') throw new NextResponse('Forbidden', { status: 403 });
  return payload;
}

// GET: listar modelos
export async function GET(req) {
  await requireAdmin(req);
  const models = await new Promise((res, rej) => {
    db.all(
      `SELECT id, label, value FROM ai_models ORDER BY id ASC`,
      (err, rows) => (err ? rej(err) : res(rows))
    );
  });
  return NextResponse.json(models);
}

// POST: crear modelo
export async function POST(req) {
  await requireAdmin(req);
  const { label, value } = await req.json();
  if (!label || !value) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
  }
  try {
    await new Promise((res, rej) => {
      db.run(
        `INSERT INTO ai_models(label, value) VALUES(?, ?)`,
        [label, value],
        err => (err ? rej(err) : res())
      );
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Modelo ya existe' }, { status: 409 });
  }
}
