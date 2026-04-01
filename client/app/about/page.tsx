'use client';

import { useI18n } from '@/context/i18n-context';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{t('about.title')}</h1>
      <p className="text-slate-700">{t('about.description')}</p>
      <button className="btn-secondary">
        {t('buttons.back')}
      </button>
    </section>
  );
}
