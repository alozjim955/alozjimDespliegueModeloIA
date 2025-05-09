// src/app/api/chat/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  // 1) Autenticación
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
  if (!token) return new NextResponse('No autorizado', { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return new NextResponse('Token inválido', { status: 401 });
  }
  const userId = payload.sub;

  // 2) Parámetros
  const { message, conversationId } = await req.json();
  if (!message || !conversationId) {
    return new NextResponse('Faltan parámetros', { status: 400 });
  }

  // 3) Validar que exista la conversación para este usuario
  const convo = await new Promise((res, rej) => {
    db.get(
      `SELECT id, title FROM conversations WHERE id = ? AND userId = ?`,
      [conversationId, userId],
      (err, row) => (err ? rej(err) : res(row))
    );
  });
  if (!convo) {
    return new NextResponse('Conversación no encontrada', { status: 404 });
  }

  // 4) Inserta el mensaje de usuario
  await new Promise((res, rej) => {
    db.run(
      `INSERT INTO messages(conversationId, role, content) VALUES(?,?,?)`,
      [conversationId, 'user', message],
      err => (err ? rej(err) : res())
    );
  });

  // 5) Si es el PRIMER mensaje de usuario, actualiza el título automático
  await new Promise((res, rej) => {
    db.get(
      `SELECT COUNT(*) AS cnt FROM messages WHERE conversationId = ? AND role = 'user'`,
      [conversationId],
      (err, row) => {
        if (err) return rej(err);
        if (row.cnt === 1) {
          const snippet = message.trim().slice(0, 30) + (message.length > 30 ? '…' : '');
          db.run(
            `UPDATE conversations SET title = ? WHERE id = ?`,
            [snippet, conversationId],
            err2 => {
              if (err2) console.error('Error actualizando título:', err2);
              res();
            }
          );
        } else {
          res();
        }
      }
    );
  });

  // 6) Recupera los últimos 20 mensajes como contexto
  const history = await new Promise((res, rej) => {
    db.all(
      `
      SELECT role, content
        FROM messages
       WHERE conversationId = ?
       ORDER BY id DESC
       LIMIT 20
      `,
      [conversationId],
      (err, rows) => (err ? rej(err) : res(rows.reverse()))
    );
  });

  // 7) Llamada a OpenAI en streaming
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: history.map(m => ({ role: m.role, content: m.content })),
  });

  // 8) Construye un ReadableStream para enviar los chunks al cliente
  let fullReply = '';
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of response) {
          const chunk = part.choices[0].delta.content;
          if (chunk) {
            fullReply += chunk;
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        }
        // 9) Guarda la respuesta completa de la IA
        db.run(
          `INSERT INTO messages(conversationId, role, content) VALUES(?,?,?)`,
          [conversationId, 'assistant', fullReply],
          err => {
            if (err) console.error('Error guardando IA:', err);
          }
        );
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

export async function GET(req) {
  // autentica token…
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  // consulta:
  const rows = await new Promise((res, rej) => {
    db.all(
      `SELECT role, content, createdAt FROM messages WHERE conversationId = ? ORDER BY id ASC`,
      [conversationId],
      (err, rs) => (err ? rej(err) : res(rs))
    );
  });
  return NextResponse.json(rows);
}
