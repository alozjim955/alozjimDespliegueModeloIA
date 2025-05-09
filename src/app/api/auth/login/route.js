import db from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return new Response('Faltan campos', { status: 400 });
  }

  // obtenemos al usuario
  const user = await new Promise((res, rej) => {
    db.get(
      `SELECT id, passwordHash FROM users WHERE username = ?`,
      [username],
      (err, row) => (err ? rej(err) : res(row))
    );
  });

  if (!user) {
    return new Response('Usuario no encontrado', { status: 404 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return new Response('Credenciales inválidas', { status: 401 });
  }

  // firmamos token
  const token = signToken({ sub: user.id });
  // devolvemos cookie HTTPOnly
  const headers = new Headers({
    'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  });
  return new Response('Logueado', { status: 200, headers });
}
