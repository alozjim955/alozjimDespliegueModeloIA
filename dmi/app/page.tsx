"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { SignUp, useUser } from "@clerk/nextjs";

function ChatApp() {
  const runtime = useChatRuntime({ api: "/api/chat" });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="h-dvh grid grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
        <ThreadList />
        <Thread />
      </main>
    </AssistantRuntimeProvider>
  );
}

export default function Home() {
  const { user, isLoaded } = useUser();

  // Mostrar loader mientras se carga Clerk
  if (!isLoaded) {
    return (
      <div className="h-dvh flex items-center justify-center text-xl">
        Cargando...
      </div>
    );
  }

  // Si ya cargó y no hay usuario, mostrar el SignUp
  if (!user) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <SignUp routing="hash" />
      </div>
    );
  }

  // Si hay usuario, mostrar la app del chat
  return <ChatApp />;
}