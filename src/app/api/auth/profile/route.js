// src/app/api/auth/profile/route.js
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req) {
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split('; ')
    .find(c => c.startsWith('token='))
    ?.split('=')[1];
  if (!token) return new Response('No auth', { status: 401 });
  
  let payload;
  try { payload = verifyToken(token); }
  catch { return new Response('Token inválido', { status: 401 }); }
  
  // Ahora además de userId, traemos el username
  const user = await new Promise((res, rej) => {
    db.get(
      `SELECT id, username FROM users WHERE id = ?`,
      [payload.sub],
      (err, row) => err ? rej(err) : res(row)
    );
  });
  
  if (!user) return new Response('Usuario no encontrado', { status: 404 });
  
  return new Response(JSON.stringify({
    userId: user.id,
    username: user.username
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
