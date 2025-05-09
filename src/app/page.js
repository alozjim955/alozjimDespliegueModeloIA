// src/app/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('convo');

  const [convos, setConvos] = useState([]);

  // Función para recargar la lista de conversaciones
  const refreshConvos = async () => {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const data = await res.json();
      setConvos(data);
    }
  };

  // Al montar, carga la lista
  useEffect(() => {
    refreshConvos();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar
        convos={convos}
        selectedId={conversationId}
        refreshConvos={refreshConvos}
      />
      <div className="flex-1 flex flex-col">
        {!conversationId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona o crea una conversación
          </div>
        ) : (
          <ChatWindow
            conversationId={conversationId}
            onMessageSent={refreshConvos}
          />
        )}
      </div>
    </div>
  );
}

function Sidebar({ convos, selectedId, refreshConvos }) {
  const router = useRouter();

  // Crear nueva conversación
  const newConvo = async () => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Sin título' }),
    });
    if (!res.ok) return console.error('Error creando conversación', res.status);
    const { id, title } = await res.json();
    // Podemos insertar directamente o recargar toda la lista
    await refreshConvos();
    router.push(`/?convo=${id}`);
  };

  // Borrar conversación
  const deleteConvo = async (id) => {
    const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    if (!res.ok) return console.error('Error borrando conversación', res.status);
    await refreshConvos();
    if (String(id) === selectedId) {
      router.push('/');
    }
  };

  return (
    <aside className="w-60 bg-gray-800 text-gray-100 flex-shrink-0 flex flex-col">
      <button
        className="w-full py-2 hover:bg-gray-700"
        onClick={newConvo}
      >
        + Nueva conversación
      </button>
      <ul className="flex-1 overflow-y-auto">
        {convos.map((c) => (
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

function ChatWindow({ conversationId, onMessageSent }) {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);    // { role, content, ts?, streaming? }
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Al montar o cambiar de conversación, carga el historial
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`);
      if (!res.ok) return;
      const history = await res.json();
      // history: [{ role, content, createdAt }]
      const formatted = history.map(m => ({
        role: m.role,
        content: m.content,
        ts: new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
        streaming: false
      }));
      setChat(formatted);
    })();
  }, [conversationId]);

  // Auto-scroll al final
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chat]);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const tsUser = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

    // Añade user + placeholder IA
    setChat(prev => [
      ...prev,
      { role: 'user', content: input, ts: tsUser, streaming: false },
      { role: 'assistant', content: '', streaming: true }
    ]);
    const message = input;
    setInput('');

    // Streaming desde la API
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId })
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let assistantContent = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value);
        for (const char of chunk) {
          assistantContent += char;
          setChat(prev => {
            const copy = [...prev];
            const last = copy.length - 1;
            copy[last] = { ...copy[last], content: assistantContent };
            return copy;
          });
          await new Promise(r => setTimeout(r, 25));
        }
      }
    }

    const tsAI = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setChat(prev => {
      const copy = [...prev];
      const last = copy.length - 1;
      copy[last] = { ...copy[last], streaming: false, ts: tsAI };
      return copy;
    });

    setLoading(false);
    // Después de procesar el primer mensaje, refresca títulos
    onMessageSent();
  };

  return (
    <>
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {chat.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[75%] px-4 py-2 rounded-lg
                ${isUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-200 rounded-bl-none shadow'}
              `}>
                <p className="whitespace-pre-wrap inline">
                  {m.content}
                  {m.streaming && (
                    <span className="inline-block w-[1ch] bg-gray-200 animate-blink ml-1">
                      &nbsp;
                    </span>
                  )}
                </p>
                {!m.streaming && (
                  <span className="block text-xs text-gray-400 mt-1 text-right">
                    {m.ts}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-gray-800 p-3 flex items-center">
        <button className="p-2 mr-2 text-gray-400 hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
        <input
          type="text"
          className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-2
                     placeholder-gray-500 focus:outline-none focus:ring focus:ring-blue-500
                     focus:border-blue-500 text-gray-100"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading}
          className="ml-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90 text-white"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M3 10l9-4 9 4-9 4-9-4z" />
            <path d="M3 14l9 4 9-4" />
          </svg>
        </button>
      </div>
    </>
  );
}
