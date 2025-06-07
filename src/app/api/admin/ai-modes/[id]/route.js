// src/app/api/admin/modes/[id]/route.js
import db from '@/lib/db';

export async function DELETE(req, { params }) {
  const { id } = params;
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM ia_modes WHERE id = ?', [id], function (err) {
      if (err) return reject(new Response(err.message, { status: 500 }));
      if (this.changes === 0) {
        return resolve(new Response('No encontrado', { status: 404 }));
      }
      resolve(new Response(null, { status: 204 }));
    });
  });
}
