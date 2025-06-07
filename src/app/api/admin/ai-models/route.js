// src/app/api/admin/models/route.js
import db from '@/lib/db';

export async function GET() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, name, modelId, createdAt FROM ia_models ORDER BY createdAt DESC',
      (err, rows) => {
        if (err) return reject(new Response(err.message, { status: 500 }));
        resolve(new Response(JSON.stringify(rows), { status: 200 }));
      }
    );
  });
}

export async function POST(req) {
  const { name, modelId } = await req.json();
  if (!name || !modelId) {
    return new Response(JSON.stringify({ error: 'Faltan campos' }), { status: 400 });
  }
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO ia_models (name, modelId) VALUES (?, ?)',
      [name, modelId],
      function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return resolve(new Response(JSON.stringify({ error: 'Ya existe ese modelo' }), { status: 409 }));
          }
          return reject(new Response(err.message, { status: 500 }));
        }
        resolve(new Response(null, { status: 201 }));
      }
    );
  });
}
