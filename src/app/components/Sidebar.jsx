'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const [convos, setConvos] = useState([]);
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const selectedId = params.get('convo');

  // carga lista al montar
  useEffect(() => {
    fetch('/api/conversations')
      .then(r => r.json())
      .then(setConvos);
  }, []);

  // crear nueva conversación
  const newConvo = async () => {
    const { id } = await fetch('/api/conversations', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title: 'Sin título' })
    }).then(r=>r.json());
    router.push(`/?convo=${id}`);
  };

  const deleteConvo = async id => {
    await fetch(`/api/conversations/${id}`, { method:'DELETE' });
    setConvos(cs => cs.filter(c=>c.id!==id));
    if (selectedId === String(id)) {
      router.push('/'); // sin conversación seleccionada
    }
  };

  return (
    <aside className="w-60 bg-gray-800 text-gray-100 flex-shrink-0">
      <button
        className="w-full py-2 hover:bg-gray-700"
        onClick={newConvo}
      >
        + Nueva conversación
      </button>
      <ul>
        {convos.map(c => (
          <li
            key={c.id}
            className={`flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-700 ${
              selectedId === String(c.id) ? 'bg-gray-700' : ''
            }`}
            onClick={() => router.push(`/?convo=${c.id}`)}
          >
            <span className="truncate">{c.title || 'Sin título'}</span>
            <button
              onClick={e => { e.stopPropagation(); deleteConvo(c.id); }}
              className="text-red-500 hover:text-red-400"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
