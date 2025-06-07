// src/app/api/chat/route.js

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(req) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');
  if (!conversationId) {
    return new NextResponse('Falta conversationId', { status: 400 });
  }

  // autenticación
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
  if (!token) return new NextResponse('No autorizado', { status: 401 });
  let payload;
  try { payload = verifyToken(token); }
  catch { return new NextResponse('Token inválido', { status: 401 }); }
  const userId = payload.sub;

  // comprobar propiedad de la conversación
  const convo = await new Promise((res, rej) => {
    db.get(
        `SELECT id FROM conversations WHERE id = ? AND userId = ?`,
        [conversationId, userId],
        (err, row) => err ? rej(err) : res(row)
    );
  });
  if (!convo) {
    return new NextResponse('Conversación no encontrada', { status: 404 });
  }

  // recuperar mensajes
  const rows = await new Promise((res, rej) => {
    db.all(
        `SELECT role, content, createdAt
         FROM messages
        WHERE conversationId = ?
        ORDER BY id ASC`,
        [conversationId],
        (err, rs) => err ? rej(err) : res(rs)
    );
  });

  return NextResponse.json(rows);
}

export async function POST(req) {
  // autenticación
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
  if (!token) return new NextResponse('No autorizado', { status: 401 });
  let payload;
  try { payload = verifyToken(token); }
  catch { return new NextResponse('Token inválido', { status: 401 }); }
  const userId = payload.sub;

  // leer body
  const { message = '', conversationId, systemPrompt = '', modelId, extraSystem = '' } = await req.json();
  if (!conversationId) {
    return new NextResponse('Falta conversationId', { status: 400 });
  }

  // comprobar propiedad de la conversación
  const convo = await new Promise((res, rej) => {
    db.get(
        `SELECT id FROM conversations WHERE id = ? AND userId = ?`,
        [conversationId, userId],
        (err, row) => err ? rej(err) : res(row)
    );
  });
  if (!convo) {
    return new NextResponse('Conversación no encontrada', { status: 404 });
  }

  // inserta mensaje del usuario si hay texto
  if (message.trim()) {
    await new Promise((res, rej) => {
      db.run(
          `INSERT INTO messages(conversationId, role, content) VALUES(?,?,?)`,
          [conversationId, 'user', message],
          err => (err ? rej(err) : res())
      );
    });
  }

  // auto-título en primer mensaje
  await new Promise((res, rej) => {
    db.get(
        `SELECT COUNT(*) AS cnt FROM messages WHERE conversationId = ? AND role = 'user'`,
        [conversationId],
        (err, row) => {
          if (err) return rej(err);
          if (row.cnt === 1 && message.trim()) {
            const snippet = message.trim().slice(0, 30) + (message.length > 30 ? '…' : '');
            db.run(
                `UPDATE conversations SET title = ? WHERE id = ?`,
                [snippet, conversationId],
                err2 => {
                  if (err2) console.error('Error actualizando título:', err2);
                  res();
                }
            );
          } else res();
        }
    );
  });

  // recupera últimos 20 para contexto
  const history = await new Promise((res, rej) => {
    db.all(
        `SELECT role, content
         FROM messages
         WHERE conversationId = ?
         ORDER BY id DESC
           LIMIT 20`,
        [conversationId],
        (err, rows) => err ? rej(err) : res(rows.reverse())
    );
  });

  // construye array de OpenAI
  const messages = [];
  // primero extraSystem si existe
  if (extraSystem.trim()) {
    messages.push({ role: 'system', content: extraSystem });
  }
  // luego tu systemPrompt general
  if (systemPrompt.trim()) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  // luego el historial
  history.forEach(m => messages.push({ role: m.role, content: m.content }));
  // si hay un mensaje del usuario
  if (message.trim()) {
    messages.push({ role: 'user', content: message });
  }

  // llamada streaming
  const response = await openai.chat.completions.create({
    model: modelId || 'gpt-3.5-turbo',
    stream: true,
    messages,
  });

  // enviar chunks y luego guardar
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
        // guarda la respuesta completa
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
