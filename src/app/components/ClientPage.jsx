// src/app/components/ClientPage.jsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

export default function ClientPage({ conversationId }) {
  const [convos, setConvos] = useState([]);

  const refreshConvos = async () => {
    const res = await fetch('/api/conversations');
    if (res.ok) setConvos(await res.json());
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
