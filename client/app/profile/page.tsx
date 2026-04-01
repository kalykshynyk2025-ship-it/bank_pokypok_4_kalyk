'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/context/i18n-context';
import { getUser } from '@/lib/auth';

interface Profile {
  name: string;
  email: string;
  language: string;
  rewards: string[];
}

export default function ProfilePage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const user = getUser();

      if (!user?.id) {
        setMessage(t('profile.loginRequired'));
        return;
      }

      const response = await fetch(`/api/users/${user.id}/profile`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || t('profile.loadError'));
        return;
      }

      setProfile(data.user);
    }

    loadProfile();
  }, [t]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      {profile && (
        <div className="soft-card soft-yellow">
          <p>
            <b>{t('profile.name')}:</b> {profile.name}
          </p>
          <p>
            <b>{t('profile.email')}:</b> {profile.email}
          </p>

          <div className="mt-4">
            <h2 className="text-lg font-semibold">{t('profile.rewards')}</h2>
            {profile.rewards.length ? (
              <ul className="mt-2 list-disc pl-5 text-slate-700">
                {profile.rewards.map((reward, index) => (
                  <li key={`${reward}-${index}`}>{reward}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">{t('profile.noRewards')}</p>
            )}
          </div>
        </div>
      )}

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </section>
  );
}
