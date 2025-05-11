// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('convo');
  const [convos, setConvos] = useState([]);

  // Recarga la lista de conversaciones
  const refreshConvos = async () => {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      setConvos(await res.json());
    }
  };

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
