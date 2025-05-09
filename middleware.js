// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Rutas públicas que NO requieren auth:
  const PUBLIC_FILE = /\.(.*)$/;
  if (
    pathname.startsWith('/api/auth') ||  // tus endpoints de login/register
    pathname === '/login' ||
    pathname === '/register' ||
    PUBLIC_FILE.test(pathname) ||        // archivos estáticos (css, js, ico...)
    pathname.startsWith('/_next')        // recursos internos de Next
  ) {
    return NextResponse.next();
  }

  // 2) Comprueba la cookie 'token'
  const token = request.cookies.get('token');
  if (!token) {
    // No hay token: redirige a login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3) Si hay token, deja seguir
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto las públicas:
     * - Páginas auth (/login, /register)
     * - API de auth (/api/auth/...)
     * - Recursos estáticos y Next.js internals
     */
    '/((?!login|register|api/auth|_next|.*\\..*).*)'
  ],
};
