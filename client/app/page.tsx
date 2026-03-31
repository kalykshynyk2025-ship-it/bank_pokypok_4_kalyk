'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/context/i18n-context';

interface BackendState {
  status: string;
  message: string;
}

export default function HomePage() {
  const { t } = useI18n();
  const [backend, setBackend] = useState<BackendState>({
    status: '...',
    message: '...'
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch('/api/health');

        if (!response.ok) {
          setBackend({
            status: 'error',
            message: `${t('home.backendUnavailable')} (${response.status})`
          });
          return;
        }

        const data = (await response.json()) as BackendState;
        setBackend(data);
      } catch {
        setBackend({ status: 'error', message: t('home.backendError') });
      }
    }

    loadStatus();
  }, [t]);

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{t('home.title')}</h1>
        <p className="text-slate-700">{t('home.description')}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">{t('home.backendTitle')}</h2>
        <p className="mt-2 text-sm text-slate-700">
          {t('home.status')}: <span className="font-medium">{backend.status}</span>
        </p>
        <p className="text-sm text-slate-700">
          {t('home.message')}: {backend.message}
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-lg font-semibold">{t('home.questTitle')}</h2>
        <p className="mt-2 text-sm text-slate-700">{t('home.questDescription')}</p>
        <div className="mt-4 flex gap-3">
          <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white">{t('home.startQuest')}</button>
          <button className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800">
            {t('home.shopButton')}
          </button>
        </div>
      </div>
    </section>
  );
}
