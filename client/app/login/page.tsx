'use client';

import { FormEvent, useState } from 'react';
import { useI18n } from '@/context/i18n-context';
import { saveToken, saveUser } from '@/lib/auth';

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(t('auth.loading'));

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || t('auth.loginError'));
      return;
    }

    saveToken(data.token);
    saveUser(data.user);
    setMessage(`${t('auth.loginSuccess')}, ${data.user.name}!`);
  }

  return (
    <section className="mx-auto max-w-md soft-card soft-pink p-6">
      <h1 className="mb-4 text-2xl font-semibold">{t('auth.loginTitle')}</h1>

      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <button type="submit" className="btn-primary w-full">
          {t('auth.loginButton')}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
    </section>
  );
}
