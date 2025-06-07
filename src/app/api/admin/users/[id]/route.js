// src/app/api/admin/users/[id]/route.js
import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function PATCH(req, { params }) {
  const userId = params.id;
  const { modeId, modelId, role, password } = await req.json();

  // Si password llega, luego deberías hashearla y actualizar passwordHash:
  const updates = [];
  const args = [];

  if (modeId !== undefined)  { updates.push('modeId  = ?'); args.push(modeId); }
  if (modelId !== undefined) { updates.push('modelId = ?'); args.push(modelId); }
  if (role)                  { updates.push('role    = ?'); args.push(role); }

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    updates.push('passwordHash = ?');
    args.push(hash);
  }

  if (updates.length === 0) {
    return new Response('Nada que actualizar', { status: 400 });
  }

  args.push(userId);
  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db.run(sql, args, function (err) {
      if (err) return reject(new Response(err.message, { status: 500 }));
      if (this.changes === 0) {
        return resolve(new Response('Usuario no encontrado', { status: 404 }));
      }
      resolve(new Response(null, { status: 204 }));
    });
  });
}
