// src/app/layout.js
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from './components/NavBar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'Chat IA',
  description: 'Tu chat con IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* BODY como flex columna de altura completa */}
      <body
        className={`flex flex-col h-screen ${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
      >
        <NavBar />

        {/* MAIN ocupa el resto de altura y oculta overflow */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
