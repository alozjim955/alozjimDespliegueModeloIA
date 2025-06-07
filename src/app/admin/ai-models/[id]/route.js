// src/app/api/admin/ai-models/[id]/route.js
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

export async function DELETE(req, { params }) {
  await requireAdmin(req);
  const id = params.id;
  await new Promise((res, rej) => {
    db.run(`DELETE FROM ai_models WHERE id = ?`, [id], err => (err ? rej(err) : res()));
  });
  return new NextResponse(null, { status: 204 });
}
