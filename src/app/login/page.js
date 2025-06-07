// src/app/login/page.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Redirige según rol:
        if (data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setErr(data.error || 'Error desconocido');
      }
    } catch {
      setErr('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-100">Iniciar sesión</h2>
        {err && <p className="text-red-400 mb-3">{err}</p>}
        <input
          type="text"
          className="w-full mb-2 p-2 rounded bg-gray-700 text-gray-100 focus:outline-none"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-gray-700 text-gray-100 focus:outline-none"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mb-4 bg-blue-600 rounded text-white disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
        <p className="text-center text-gray-400 text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
