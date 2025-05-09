// src/app/components/NavBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 1) Solo comprobamos el perfil en rutas protegidas
  useEffect(() => {
    // Si estamos en login o register, ni llamamos al API
    if (path === '/login' || path === '/register') {
      setUser(null);
      return;
    }

    // En cualquier otra ruta, llamamos al perfil
    fetch('/api/auth/profile')
      .then(res => {
        if (res.status === 401) {
          // No autenticado: redirige a /login
          router.push('/login');
          return null;
        }
        if (!res.ok) {
          throw new Error('Error al obtener perfil');
        }
        return res.json();
      })
      .then(data => {
        if (data) setUser(data);
      })
      .catch(() => {
        // Ante cualquier otro fallo, también redirigimos
        router.push('/login');
      });
  }, [path, router]);

  // 2) Cierra el dropdown si clicas fuera
  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="bg-gray-800 flex items-center justify-between px-3 py-2">
      {/* Logo + Título */}
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-600 rounded-full" />
        <span className="text-sm font-semibold">Chat IA</span>
      </div>

      {/* Zona de enlaces o usuario */}
      {!user ? (
        <div className="flex items-center space-x-3">
          {/* En login y register no sale nada */}
          {path !== '/login' && (
            <Link href="/login" className="text-sm hover:underline">
              Iniciar sesión
            </Link>
          )}
          {path !== '/register' && (
            <Link href="/register" className="text-sm hover:underline">
              Registrarse
            </Link>
          )}
        </div>
      ) : (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center space-x-1 text-sm px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            <span>{user.username}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${
                menuOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded shadow">
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
