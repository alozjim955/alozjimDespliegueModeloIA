// src/app/api/chat/route.js
import { OpenAI } from 'openai';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const openai = new OpenAI();

export async function POST(req) {
  // 1) Autorización
  const cookie = req.headers.get('cookie') || '';
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return new Response('No autorizado', { status: 401 });
  let payload;
  try {
    payload = verifyToken(tokenMatch[1]);
  } catch {
    return new Response('Token inválido', { status: 401 });
  }
  const userId = payload.sub;

  // 2) Extraer body
  const { message, conversationId } = await req.json();

  // 3) Obtener el prompt y modelo asignados al usuario
  const row = await new Promise((res, rej) => {
    db.get(
      `SELECT m.prompt, mo.modelId AS modelName
         FROM users u
    LEFT JOIN ia_modes  m  ON u.modeId  = m.id
    LEFT JOIN ia_models mo ON u.modelId = mo.id
        WHERE u.id = ?`,
      [userId],
      (e, r) => (e ? rej(e) : res(r))
    );
  });
  const systemPrompt = row?.prompt || 'You are a helpful assistant.';
  const modelToUse  = row?.modelName || 'gpt-3.5-turbo';

  // 4) Recuperar historial de esta conversación
  const history = await new Promise((res, rej) => {
    db.all(
      'SELECT role, content FROM messages WHERE conversationId = ? ORDER BY createdAt',
      [conversationId],
      (e, rows) => (e ? rej(e) : res(rows))
    );
  });

  // 5) Guardar el mensaje del usuario
  await new Promise((res, rej) => {
    db.run(
      'INSERT INTO messages (conversationId, role, content) VALUES (?, "user", ?)',
      [conversationId, message],
      err => (err ? rej(err) : res())
    );
  });

  // 6) Lanzar stream a OpenAI
  const response = await openai.chat.completions.create({
    model: modelToUse,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ]
  });

  // 7) Devolvemos stream y, al final, lo guardamos
  return new Response(
    response,
    {
      headers: { 'Content-Type': 'text/event-stream' }
    }
  );
}
