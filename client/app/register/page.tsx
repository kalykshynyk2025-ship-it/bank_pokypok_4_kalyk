'use client';

import { FormEvent, useState } from 'react';
import { useI18n } from '@/context/i18n-context';
import { saveToken, saveUser } from '@/lib/auth';

export default function RegisterPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('RU');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(t('auth.loading'));

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, language })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || t('auth.registerError'));
      return;
    }

    saveToken(data.token);
    saveUser(data.user);
    setMessage(`${t('auth.registerSuccess')}, ${data.user.name}!`);
  }

  return (
    <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold">{t('auth.registerTitle')}</h1>

      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder={t('auth.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
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
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
        >
          <option value="RU">{t('language.ru')}</option>
          <option value="EN">{t('language.en')}</option>
          <option value="MAR">{t('language.mar')}</option>
        </select>

        <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-white">
          {t('auth.registerButton')}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
    </section>
  );
}
