// src/app/api/admin/conversations/[id]/download/route.js
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
  const convoId = params.id;

  // Metadatos de la conversación
  const convo = await new Promise((res, rej) => {
    db.get(
      `SELECT c.id, c.title, c.createdAt, u.username
         FROM conversations c
         JOIN users u ON u.id = c.userId
        WHERE c.id = ?`,
      [convoId],
      (err, row) => (err ? rej(err) : res(row))
    );
  });
  if (!convo) return new NextResponse('Not found', { status: 404 });

  // Mensajes de la conversación
  const messages = await new Promise((res, rej) => {
    db.all(
      `SELECT role, content, createdAt
         FROM messages
        WHERE conversationId = ?
        ORDER BY id ASC`,
      [convoId],
      (err, rows) => (err ? rej(err) : res(rows))
    );
  });

  const data = { conversation: convo, messages };
  const filename = `convo-${convoId}.json`;
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
