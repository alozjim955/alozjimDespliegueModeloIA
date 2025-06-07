// src/app/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import ClientPage from './components/ClientPage';

export const dynamic = 'force-dynamic';

export default function Page({ searchParams }) {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect('/login');
  }

  // Si es admin, al panel
  if (payload.role === 'admin') {
    redirect('/admin');
  }

  // Sólo usuarios estándar siguen al chat
  const conversationId = searchParams.convo || null;
  return <ClientPage conversationId={conversationId} />;
}
