'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import QuestUpload from '@/components/quest-upload';
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
    <section className="space-y-5 fade-up">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{t('home.title')}</h1>
        <p className="text-slate-700">{t('home.description')}</p>
      </div>

      <div className="soft-card soft-green">
        <h2 className="text-lg font-semibold">{t('home.backendTitle')}</h2>
        <p className="mt-2 text-sm text-slate-700">
          {t('home.status')}: <span className="font-medium">{backend.status}</span>
        </p>
        <p className="text-sm text-slate-700">
          {t('home.message')}: {backend.message}
        </p>
      </div>

      <div className="soft-card soft-yellow">
        <h2 className="text-lg font-semibold">{t('home.questTitle')}</h2>
        <p className="mt-2 text-sm text-slate-700">{t('home.questDescription')}</p>
        <div className="mt-4 flex gap-3">
          <Link href="/quest" className="btn-primary">
            {t('home.startQuest')}
          </Link>
          <Link href="/catalog" className="btn-secondary">
            {t('home.shopButton')}
          </Link>
        </div>
      </div>

      <QuestUpload />
    </section>
  );
}
