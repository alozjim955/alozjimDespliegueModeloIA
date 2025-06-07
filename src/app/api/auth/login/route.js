// src/app/api/auth/login/route.js
import db from '@/lib/db';
import { comparePasswords, generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
  }

  const user = await new Promise((res, rej) => {
    db.get(
      `SELECT id, passwordHash, role, username FROM users WHERE username = ?`,
      [username],
      (err, row) => (err ? rej(err) : res(row))
    );
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const valid = await comparePasswords(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const token = generateToken({ sub: user.id, role: user.role });

  // Prepara la respuesta con JSON y cookie
  const res = NextResponse.json(
    { username: user.username, role: user.role },
    { status: 200 }
  );
  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
