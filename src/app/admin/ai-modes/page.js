// src/app/admin/modes/page.js
'use client';

import { useState, useEffect } from 'react';

export default function ModesPage() {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formularios para crear un nuevo modo
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Carga la lista de modos desde el endpoint /api/admin/modes
  const fetchModes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/modes');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error cargando modos');
      }
      const data = await res.json();
      setModes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModes();
  }, []);

  // Envía el formulario para crear un nuevo modo
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (!newName.trim() || !newPrompt.trim()) {
      setCreateError('Debe rellenar ambos campos');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/modes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          prompt: newPrompt.trim(),
        }),
      });
      if (res.status === 201) {
        setNewName('');
        setNewPrompt('');
        await fetchModes();
      } else {
        const json = await res.json();
        setCreateError(json.error || 'Error creando modo');
      }
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  // Borra un modo por su id
  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que quieres borrar este modo?')) return;
    try {
      const res = await fetch(`/api/admin/modes/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        await fetchModes();
      } else {
        const text = await res.text();
        alert('Error borrando modo: ' + text);
      }
    } catch (e) {
      alert('Error borrando modo: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1) Formulario para crear nuevo modo */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Crear nuevo modo
        </h3>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del modo
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Ej. Tutor Universitario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prompt del modo
            </label>
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Escribe aquí la instrucción del modo..."
              rows={3}
            />
          </div>
          {createError && (
            <p className="text-sm text-red-500">{createError}</p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded"
          >
            {creating ? 'Creando…' : 'Crear modo'}
          </button>
        </form>
      </section>

      {/* 2) Listado de modos existentes */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Modos existentes
        </h3>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Cargando modos…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : modes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No hay modos creados aún.
          </p>
        ) : (
          <ul className="space-y-4">
            {modes.map((mode) => (
              <li
                key={mode.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {mode.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                    {mode.prompt}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Creado: {new Date(mode.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <button
                    onClick={() => handleDelete(mode.id)}
                    className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
