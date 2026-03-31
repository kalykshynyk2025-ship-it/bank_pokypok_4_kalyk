import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Банк покупок',
  description: 'Базовый старт проекта (Next.js + Express)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
            <Link href="/" className="font-semibold text-slate-900">
              Банк покупок
            </Link>
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              Главная
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900">
              О проекте
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
