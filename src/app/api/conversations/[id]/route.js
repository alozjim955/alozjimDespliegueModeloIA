// src/app/api/conversations/[id]/route.js

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req, { params }) {
  // 1) Resuelve params
  const { id: convoId } = await params;

  // 2) Autenticación
  const cookie = req.headers.get('cookie') || '';
  const token = cookie
    .split('; ')
    .find(c => c.startsWith('token='))
    ?.split('=')[1];
  if (!token) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return new NextResponse('Token inválido', { status: 401 });
  }
  const userId = payload.sub;

  // 3) Verifica que la conversación exista y pertenezca al usuario
  const convo = await new Promise((res, rej) => {
    db.get(
      `SELECT id FROM conversations WHERE id = ? AND userId = ?`,
      [convoId, userId],
      (err, row) => (err ? rej(err) : res(row))
    );
  });
  if (!convo) {
    return new NextResponse('Conversación no encontrada', { status: 404 });
  }

  // 4) Borra los mensajes asociados (si no usas ON DELETE CASCADE)
  await new Promise((res, rej) => {
    db.run(
      `DELETE FROM messages WHERE conversationId = ?`,
      [convoId],
      (err) => (err ? rej(err) : res())
    );
  });

  // 5) Borra la conversación
  await new Promise((res, rej) => {
    db.run(
      `DELETE FROM conversations WHERE id = ?`,
      [convoId],
      (err) => (err ? rej(err) : res())
    );
  });

  // 6) Responde 204 No Content
  return new NextResponse(null, { status: 204 });
}
