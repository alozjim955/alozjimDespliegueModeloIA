// src/app/api/ocr/route.js

import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    // 1) Autenticación
    const cookie = req.headers.get('cookie') || '';
    const token = cookie
        .split('; ')
        .find(c => c.startsWith('token='))
        ?.split('=')[1];
    if (!token) return new NextResponse('No autorizado', { status: 401 });
    try {
        verifyToken(token);
    } catch {
        return new NextResponse('Token inválido', { status: 401 });
    }

    // 2) Parse multipart/form-data
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
        return new NextResponse('No se recibió fichero', { status: 400 });
    }

    // 3) OCR con Tesseract
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    try {
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
            logger: m => console.log(m) // opcional, muestra progreso
        });
        return NextResponse.json({ text });
    } catch (e) {
        console.error('OCR error', e);
        return new NextResponse('Error procesando imagen', { status: 500 });
    }
}
