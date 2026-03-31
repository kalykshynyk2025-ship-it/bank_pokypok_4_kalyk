'use client';

import Link from 'next/link';
import { I18nProvider, useI18n } from '@/context/i18n-context';

function Header() {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-4">
        <Link href="/" className="mr-2 font-semibold text-slate-900">
          {t('nav.brand')}
        </Link>
        <Link href="/" className="text-slate-600 hover:text-slate-900">
          {t('nav.home')}
        </Link>
        <Link href="/about" className="text-slate-600 hover:text-slate-900">
          {t('nav.about')}
        </Link>
        <Link href="/login" className="text-slate-600 hover:text-slate-900">
          {t('nav.login')}
        </Link>
        <Link href="/register" className="text-slate-600 hover:text-slate-900">
          {t('nav.register')}
        </Link>

        <label className="ml-auto flex items-center gap-2 text-sm text-slate-700">
          {t('language.label')}
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="rounded border border-slate-300 bg-white px-2 py-1"
          >
            <option value="ru">{t('language.ru')}</option>
            <option value="en">{t('language.en')}</option>
            <option value="mar">{t('language.mar')}</option>
          </select>
        </label>
      </nav>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </I18nProvider>
  );
}
