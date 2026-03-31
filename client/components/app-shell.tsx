'use client';

import Link from 'next/link';
import { I18nProvider, useI18n } from '@/context/i18n-context';

function Header() {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="ethno-pattern sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <Link href="/" className="mr-2 rounded-xl bg-white/80 px-3 py-1 font-semibold text-slate-900">
          {t('nav.brand')}
        </Link>
        <Link href="/" className="text-sm text-slate-700 hover:text-slate-900">{t('nav.home')}</Link>
        <Link href="/quest" className="text-sm text-slate-700 hover:text-slate-900">{t('nav.quest')}</Link>
        <Link href="/catalog" className="text-sm text-slate-700 hover:text-slate-900">{t('nav.catalog')}</Link>
        <Link href="/profile" className="text-sm text-slate-700 hover:text-slate-900">{t('nav.profile')}</Link>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-700 hover:text-slate-900">{t('nav.login')}</Link>
          <Link href="/register" className="text-sm text-slate-700 hover:text-slate-900">{t('nav.register')}</Link>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="rounded-xl border border-slate-200 bg-white/90 px-2 py-1 text-xs sm:text-sm"
          >
            <option value="ru">{t('language.ru')}</option>
            <option value="en">{t('language.en')}</option>
            <option value="mar">{t('language.mar')}</option>
          </select>
        </div>
      </nav>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </I18nProvider>
  );
}
