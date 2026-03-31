'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/context/i18n-context';

interface QuestTask {
  id: string;
  title: string;
}

interface AiResult {
  checks: {
    hasPerson: boolean;
    hasGreenColor: boolean;
  };
  score: number;
}

export default function QuestUpload() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<QuestTask[]>([]);
  const [questTaskId, setQuestTaskId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [aiResult, setAiResult] = useState<AiResult | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    async function loadTasks() {
      const response = await fetch('/api/quest/tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
      if (data.tasks?.length) {
        setQuestTaskId(data.tasks[0].id);
      }
    }

    loadTasks();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setAiResult(null);
  }

  async function onUpload(event: FormEvent) {
    event.preventDefault();

    if (!file || !questTaskId) {
      setMessage(t('upload.selectError'));
      return;
    }

    setMessage(t('upload.uploading'));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('questTaskId', questTaskId);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || t('upload.uploadError'));
      return;
    }

    setAiResult(data.aiValidation || null);
    setMessage(t('upload.uploadSuccess'));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold">{t('upload.title')}</h3>

      <form onSubmit={onUpload} className="mt-3 space-y-3">
        <label className="block text-sm text-slate-700">{t('upload.taskLabel')}</label>
        <select
          value={questTaskId}
          onChange={(event) => setQuestTaskId(event.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
        >
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>

        <label className="inline-flex cursor-pointer rounded bg-slate-900 px-4 py-2 text-sm text-white">
          {t('upload.pickFile')}
          <input type="file" className="hidden" onChange={onFileChange} accept="image/*,video/*" />
        </label>

        {previewUrl && file && (
          <div className="rounded border border-slate-200 p-3">
            <p className="mb-2 text-sm text-slate-700">{t('upload.preview')}</p>
            {file.type.startsWith('image/') ? (
              <img src={previewUrl} alt="preview" className="max-h-64 rounded" />
            ) : (
              <video src={previewUrl} controls className="max-h-64 rounded" />
            )}
          </div>
        )}

        <button type="submit" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800">
          {t('upload.uploadButton')}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}

      {aiResult && (
        <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
          <p>
            {t('upload.aiPerson')}: {aiResult.checks.hasPerson ? t('upload.yes') : t('upload.no')}
          </p>
          <p>
            {t('upload.aiGreen')}: {aiResult.checks.hasGreenColor ? t('upload.yes') : t('upload.no')}
          </p>
          <p>
            {t('upload.aiScore')}: {aiResult.score}
          </p>
        </div>
      )}
    </section>
  );
}
