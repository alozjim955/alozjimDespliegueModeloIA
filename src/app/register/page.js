// src/app/register/page.js
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()

  const submit = async e => {
    e.preventDefault()
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      router.push('/login')
    } else {
      setErr(await res.text())
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded shadow">
        <h2 className="mb-4 text-gray-100">Regístrate</h2>
        {err && <p className="text-red-400 mb-2">{err}</p>}
        <input
          className="w-full mb-2 p-2 rounded bg-gray-700 text-gray-100"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-gray-700 text-gray-100"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full py-2 bg-blue-600 rounded text-white">
          Crear cuenta
        </button>
        <p className="mt-4 text-gray-400 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
