// src/app/admin/modes/layout.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ModesLayout({ children }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      router.replace('/'); // redirige al home si no es admin
    }
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Cargando…
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header de la sección “Modos de IA” */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Modos de IA
        </h2>
        {/* Enlace de volver al Panel general de Admin */}
        <Link
          href="/admin"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Volver al Panel
        </Link>
      </header>

      {/* Contenedor para el contenido específico de “modes” */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
