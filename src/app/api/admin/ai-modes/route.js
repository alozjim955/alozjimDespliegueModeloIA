// src/app/api/admin/modes/route.js
import db from '@/lib/db';

export async function GET() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, name, prompt, createdAt FROM ia_modes ORDER BY createdAt DESC',
      (err, rows) => {
        if (err) return reject(new Response(err.message, { status: 500 }));
        resolve(new Response(JSON.stringify(rows), { status: 200 }));
      }
    );
  });
}

export async function POST(req) {
  const { name, prompt } = await req.json();
  if (!name || !prompt) {
    return new Response(JSON.stringify({ error: 'Faltan campos' }), { status: 400 });
  }
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO ia_modes (name, prompt) VALUES (?, ?)',
      [name, prompt],
      function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return resolve(new Response(JSON.stringify({ error: 'Ya existe ese modo' }), { status: 409 }));
          }
          return reject(new Response(err.message, { status: 500 }));
        }
        resolve(new Response(null, { status: 201 }));
      }
    );
  });
}
