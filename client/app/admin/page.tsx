'use client';

import { useState } from 'react';

interface Mall {
  _id: string;
  name: string;
  city: string;
  questLevels: Array<{ level: number; title: string }>;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [malls, setMalls] = useState<Mall[]>([]);
  const [message, setMessage] = useState('');

  async function loadAdminData() {
    const response = await fetch('/api/admin/malls', { headers: { 'x-admin-key': adminKey } });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Ошибка загрузки админ-данных');
      return;
    }

    setMalls(data.malls || []);
    setMessage('Админ-структура загружена');
  }

  return (
    <section className="space-y-6 fade-up">
      <div className="soft-card soft-yellow">
        <h1 className="text-2xl font-bold">Admin panel (basic)</h1>
        <p className="mt-2 text-sm text-slate-700">Управление ТЦ и квест-структурой.</p>
        <div className="mt-3 flex gap-2">
          <input value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="x-admin-key" className="w-full rounded-xl border px-3 py-2" />
          <button className="btn-primary" onClick={loadAdminData}>Загрузить</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {malls.map((mall) => (
          <article key={mall._id} className="soft-card soft-pink">
            <h2 className="text-lg font-semibold">{mall.name}</h2>
            <p className="text-sm text-slate-700">{mall.city}</p>
            <p className="mt-2 text-sm">Квест-уровней: {mall.questLevels?.length || 0}</p>
          </article>
        ))}
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </section>
  );
}
