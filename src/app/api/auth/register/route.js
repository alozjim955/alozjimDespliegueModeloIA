import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return new Response('Faltan campos', { status: 400 });
  }

  const pwHash = await hashPassword(password);

  return new Promise((res, rej) => {
    db.run(
      `INSERT INTO users(username, passwordHash) VALUES(?,?)`,
      [username, pwHash],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res(new Response('Usuario ya existe', { status: 409 }));
          }
          return rej(err);
        }
        res(new Response('Registrado', { status: 201 }));
      }
    );
  });
}
