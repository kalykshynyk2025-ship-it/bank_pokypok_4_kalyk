'use client';

import { FormEvent, useState } from 'react';
import { saveToken } from '@/lib/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('RU');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('Загрузка...');

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, language })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Ошибка регистрации');
      return;
    }

    saveToken(data.token);
    setMessage(`Регистрация успешна. Добро пожаловать, ${data.user.name}!`);
  }

  return (
    <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold">Регистрация</h1>

      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
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
          <option value="RU">RU</option>
          <option value="EN">EN</option>
          <option value="MAR">MAR</option>
        </select>

        <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-white">
          Зарегистрироваться
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
    </section>
  );
}
