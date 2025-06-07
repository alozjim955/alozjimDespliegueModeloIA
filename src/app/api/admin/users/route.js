// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, verifyToken } from '@/lib/auth';

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

// GET: listar todos los usuarios
export async function GET(req) {
  await requireAdmin(req);
  const users = await new Promise((res, rej) => {
    db.all(
      `SELECT id, username, createdAt, role
         FROM users
        ORDER BY createdAt DESC`,
      (err, rows) => (err ? rej(err) : res(rows))
    );
  });
  return NextResponse.json(users);
}

// POST: crear usuario nuevo
export async function POST(req) {
  await requireAdmin(req);
  const { username, password, role = 'user' } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  try {
    await new Promise((res, rej) => {
      db.run(
        `INSERT INTO users(username, passwordHash, role) VALUES(?,?,?)`,
        [username, passwordHash, role],
        err => (err ? rej(err) : res())
      );
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Usuario ya existe' }, { status: 409 });
  }
}
