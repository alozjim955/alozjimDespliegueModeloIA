// src/app/components/AdminPanel.jsx
'use client';

import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [tab, setTab] = useState('users'); // 'users', 'modes', 'models'
  const [users, setUsers] = useState([]);
  const [convosByUser, setConvosByUser] = useState({});

  // Estados para creación de usuario
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserErr, setCreateUserErr] = useState('');

  // Estados para creación de modo IA
  const [modes, setModes] = useState([]);
  const [newMode, setNewMode] = useState({ label: '', value: '' });
  const [creatingMode, setCreatingMode] = useState(false);
  const [createModeErr, setCreateModeErr] = useState('');

  // Estados para creación de modelo IA
  const [models, setModels] = useState([]);
  const [newModel, setNewModel] = useState({ label: '', value: '' });
  const [creatingModel, setCreatingModel] = useState(false);
  const [createModelErr, setCreateModelErr] = useState('');

  // 1) Funciones para usuarios
  async function fetchUsers() {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      setUsers(await res.json());
    } else {
      console.error('Error cargando usuarios:', await res.text());
    }
  }

  async function deleteUser(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(u => u.filter(x => x.id !== id));
    } else {
      console.error('Error borrando usuario:', await res.text());
    }
  }

  async function updateUser(id, data) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchUsers();
    } else {
      console.error('Error actualizando usuario:', await res.text());
    }
  }

  async function loadConvos(userId) {
    const res = await fetch(`/api/admin/users/${userId}/conversations`);
    if (res.ok) {
      const list = await res.json();
      setConvosByUser(m => ({ ...m, [userId]: list }));
    } else {
      console.error('Error cargando conversaciones:', await res.text());
    }
  }

  function downloadConvo(convoId) {
    window.open(`/api/admin/conversations/${convoId}/download`, '_blank');
  }

  async function createUser(e) {
    e.preventDefault();
    setCreateUserErr('');
    setCreatingUser(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (res.ok) {
      setNewUser({ username: '', password: '', role: 'user' });
      await fetchUsers();
    } else {
      setCreateUserErr(data.error || 'Error creando usuario');
    }
    setCreatingUser(false);
  }

  // 2) Funciones para modos de IA
  async function fetchModes() {
    const res = await fetch('/api/admin/ai-modes');
    if (res.ok) {
      setModes(await res.json());
    } else {
      console.error('Error cargando modos IA:', await res.text());
    }
  }

  async function deleteMode(id) {
    const res = await fetch(`/api/admin/ai-modes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setModes(m => m.filter(x => x.id !== id));
    } else {
      console.error('Error borrando modo IA:', await res.text());
    }
  }

  async function createMode(e) {
    e.preventDefault();
    setCreateModeErr('');
    setCreatingMode(true);
    const res = await fetch('/api/admin/ai-modes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMode),
    });
    const data = await res.json();
    if (res.ok) {
      setNewMode({ label: '', value: '' });
      await fetchModes();
    } else {
      setCreateModeErr(data.error || 'Error creando modo IA');
    }
    setCreatingMode(false);
  }

  // 3) Funciones para modelos de IA
  async function fetchModels() {
    const res = await fetch('/api/admin/ai-models');
    if (res.ok) {
      setModels(await res.json());
    } else {
      console.error('Error cargando modelos IA:', await res.text());
    }
  }

  async function deleteModel(id) {
    const res = await fetch(`/api/admin/ai-models/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setModels(m => m.filter(x => x.id !== id));
    } else {
      console.error('Error borrando modelo IA:', await res.text());
    }
  }

  async function createModel(e) {
    e.preventDefault();
    setCreateModelErr('');
    setCreatingModel(true);
    const res = await fetch('/api/admin/ai-models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newModel),
    });
    const data = await res.json();
    if (res.ok) {
      setNewModel({ label: '', value: '' });
      await fetchModels();
    } else {
      setCreateModelErr(data.error || 'Error creando modelo IA');
    }
    setCreatingModel(false);
  }

  // 4) Cargar todo al montar o al cambiar de pestaña
  useEffect(() => {
    fetchUsers();
    if (tab === 'modes') fetchModes();
    if (tab === 'models') fetchModels();
  }, [tab]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Panel de Administración
      </h1>

      {/* Navegación de pestañas */}
      <div className="mb-6 space-x-4">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded ${
            tab === 'users' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
          }`}
        >
          Usuarios
        </button>
        <button
          onClick={() => setTab('modes')}
          className={`px-4 py-2 rounded ${
            tab === 'modes'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
          }`}
        >
          Modos de IA
        </button>
        <button
          onClick={() => setTab('models')}
          className={`px-4 py-2 rounded ${
            tab === 'models'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
          }`}
        >
          Modelos de IA
        </button>
      </div>

      {/* Sección Usuarios */}
      {tab === 'users' && (
        <div>
          {/* Formulario para crear usuario */}
          <form onSubmit={createUser} className="mb-6 p-4 bg-gray-800 rounded text-gray-100">
            <h2 className="mb-2 text-lg font-semibold">Crear nuevo usuario</h2>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Usuario"
                value={newUser.username}
                onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))}
                required
                className="p-2 bg-gray-700 rounded"
                disabled={creatingUser}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                required
                className="p-2 bg-gray-700 rounded"
                disabled={creatingUser}
              />
              <select
                value={newUser.role}
                onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                className="p-2 bg-gray-700 rounded"
                disabled={creatingUser}
              >
                <option value="user">Usuario estándar</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {createUserErr && <p className="text-red-400 mt-2">{createUserErr}</p>}
            <button
              type="submit"
              disabled={creatingUser}
              className="mt-3 px-4 py-2 bg-green-600 rounded disabled:opacity-50"
            >
              {creatingUser ? 'Creando…' : 'Crear usuario'}
            </button>
          </form>

          {/* Tabla de usuarios */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Usuario</th>
                <th className="border px-2 py-1">Creado</th>
                <th className="border px-2 py-1">Rol</th>
                <th className="border px-2 py-1">Cambiar contraseña</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                  <td className="border px-2 py-1">{u.username}</td>
                  <td className="border px-2 py-1">{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1">
                    <select
                      value={u.role}
                      onChange={e => updateUser(u.id, { role: e.target.value })}
                      className="bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-1 rounded"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => {
                        const newPass = prompt('Nueva contraseña para ' + u.username);
                        if (newPass) updateUser(u.id, { password: newPass });
                      }}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Cambiar
                    </button>
                  </td>
                  <td className="border px-2 py-1 space-x-2">
                    <button
                      onClick={() => loadConvos(u.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Ver convos
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                  {/* Conversaciones anidadas */}
                  {convosByUser[u.id]?.map(c => (
                    <tr key={c.id} className="bg-gray-200 dark:bg-gray-600">
                      <td colSpan={3} className="border px-2 py-1">{c.title || '(sin título)'}</td>
                      <td className="border px-2 py-1">{new Date(c.createdAt).toLocaleString()}</td>
                      <td className="border px-2 py-1">
                        <button
                          onClick={() => downloadConvo(c.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Descargar JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sección Modos de IA */}
      {tab === 'modes' && (
        <div>
          {/* Formulario para crear modo de IA */}
          <form onSubmit={createMode} className="mb-6 p-4 bg-gray-800 rounded text-gray-100">
            <h2 className="mb-2 text-lg font-semibold">Crear nuevo modo de IA</h2>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Etiqueta (label)"
                value={newMode.label}
                onChange={e => setNewMode(m => ({ ...m, label: e.target.value }))}
                required
                className="p-2 bg-gray-700 rounded"
                disabled={creatingMode}
              />
              <input
                type="text"
                placeholder="Valor (value)"
                value={newMode.value}
                onChange={e => setNewMode(m => ({ ...m, value: e.target.value }))}
                required
                className="p-2 bg-gray-700 rounded"
                disabled={creatingMode}
              />
            </div>
            {createModeErr && <p className="text-red-400 mt-2">{createModeErr}</p>}
            <button
              type="submit"
              disabled={creatingMode}
              className="mt-3 px-4 py-2 bg-green-600 rounded disabled:opacity-50"
            >
              {creatingMode ? 'Creando…' : 'Crear modo IA'}
            </button>
          </form>

          {/* Tabla de modos de IA */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Etiqueta</th>
                <th className="border px-2 py-1">Valor</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modes.map(m => (
                <tr key={m.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                  <td className="border px-2 py-1">{m.id}</td>
                  <td className="border px-2 py-1">{m.label}</td>
                  <td className="border px-2 py-1">{m.value}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => deleteMode(m.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sección Modelos de IA */}
      {tab === 'models' && (
        <div>
          {/* Formulario para crear modelo de IA */}
          <form onSubmit={createModel} className="mb-6 p-4 bg-gray-800 rounded text-gray-100">
            <h2 className="mb-2 text-lg font-semibold">Crear nuevo modelo de IA</h2>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Etiqueta (label)"
                value={newModel.label}
                onChange={e => setNewModel(m => ({ ...m, label: e.target.value }))}
                required
                className="p-2 bg-gray-700 rounded"
                disabled={creatingModel}
              />
              <input
                type="text"
                placeholder="Valor (value)"
                value={newModel.value}
                onChange={e => setNewModel(m => ({ ...m, value: e.target.value }))}
                required
                className="p-2 bg-gray-700 rounded"
                disabled={creatingModel}
              />
            </div>
            {createModelErr && <p className="text-red-400 mt-2">{createModelErr}</p>}
            <button
              type="submit"
              disabled={creatingModel}
              className="mt-3 px-4 py-2 bg-green-600 rounded disabled:opacity-50"
            >
              {creatingModel ? 'Creando…' : 'Crear modelo IA'}
            </button>
          </form>

          {/* Tabla de modelos de IA */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Etiqueta</th>
                <th className="border px-2 py-1">Valor</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {models.map(m => (
                <tr key={m.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                  <td className="border px-2 py-1">{m.id}</td>
                  <td className="border px-2 py-1">{m.label}</td>
                  <td className="border px-2 py-1">{m.value}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => deleteModel(m.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
