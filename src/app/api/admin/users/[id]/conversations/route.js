// src/app/api/admin/users/[id]/conversations/route.js
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

export async function GET(req, { params }) {
  await requireAdmin(req);
  const userId = params.id;
  const convos = await new Promise((res, rej) => {
    db.all(
      `SELECT id, title, createdAt
         FROM conversations
        WHERE userId = ?
        ORDER BY createdAt DESC`,
      [userId],
      (err, rows) => (err ? rej(err) : res(rows))
    );
  });
  return NextResponse.json(convos);
}
