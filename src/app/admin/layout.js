// src/app/admin/layout.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export default function AdminLayout({ children }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) throw new Error();
    const payload = verifyToken(token);
    if (payload.role !== 'admin') throw new Error();
  } catch {
    redirect('/login');
  }
  return <>{children}</>;
}
