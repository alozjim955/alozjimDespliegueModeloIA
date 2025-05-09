// src/app/api/conversations/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// LISTAR conversaciones para el usuario
export async function GET(req) {
  // autentica
  const cookie = req.headers.get('cookie') || '';
  const token = cookie
    .split('; ')
    .find(c => c.startsWith('token='))
    ?.split('=')[1];
  if (!token) return new NextResponse('No autorizado', { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return new NextResponse('Token inválido', { status: 401 });
  }
  const userId = payload.sub;

  // lee de la DB
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

// CREAR nueva conversación
export async function POST(req) {
  // autentica (idéntico a GET)
  const cookie = req.headers.get('cookie') || '';
  const token = cookie
    .split('; ')
    .find(c => c.startsWith('token='))
    ?.split('=')[1];
  if (!token) return new NextResponse('No autorizado', { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return new NextResponse('Token inválido', { status: 401 });
  }
  const userId = payload.sub;

  // lee título opcional
  const { title } = await req.json();
  if (title != null && typeof title !== 'string') {
    return new NextResponse('Título inválido', { status: 400 });
  }

  // inserta y devuelve el nuevo ID + título
  try {
    const result = await new Promise((res, rej) => {
      db.run(
        `INSERT INTO conversations(userId, title) VALUES(?,?)`,
        [userId, title || 'Sin título'],
        function (err) {
          if (err) return rej(err);
          res({ id: this.lastID, title: title || 'Sin título' });
        }
      );
    });
    return new NextResponse(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Error creando conversación:', e);
    return new NextResponse('Error interno', { status: 500 });
  }
}
