// src/app/api/upload/route.js

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    // 1) Autenticación
    const cookie = req.headers.get('cookie') || '';
    const token = cookie
        .split('; ')
        .find(c => c.startsWith('token='))
        ?.split('=')[1];
    if (!token) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    try {
        verifyToken(token);
    } catch {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // 2) Parse multipart/form-data
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'No se recibió fichero' }, { status: 400 });
    }

    // 3) Guarda el fichero en public/uploads
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    // 4) Devuelve la URL pública
    return NextResponse.json({ url: `/uploads/${filename}` });
}
