// src/app/page.js
export const dynamic = 'force-dynamic';  // siempre dinámico, sin SSG

import ClientPage from './components/ClientPage';

export default function Page({ searchParams }) {
  // extraemos aquí conversationId sin hooks
  const conversationId = searchParams.convo || null;
  return <ClientPage conversationId={conversationId} />;
}
