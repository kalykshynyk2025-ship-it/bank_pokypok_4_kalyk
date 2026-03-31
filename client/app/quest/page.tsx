'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import QrScanner from '@/components/qr-scanner';
import { useI18n } from '@/context/i18n-context';
import { getUser } from '@/lib/auth';

interface QuestTask {
  id: string;
  level: number;
  title: string;
  description: string;
  type: string;
  question?: string;
}

interface QuestProgress {
  currentLevel: number;
  completedLevels: number[];
  answers?: Record<string, string>;
}

export default function QuestPage() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<QuestTask[]>([]);
  const [progress, setProgress] = useState<QuestProgress>({ currentLevel: 1, completedLevels: [] });
  const [userId, setUserId] = useState<string | null>(null);
  const [answerByLevel, setAnswerByLevel] = useState<Record<number, string>>({});
  const [fileByLevel, setFileByLevel] = useState<Record<number, File | null>>({});
  const [message, setMessage] = useState('');
  const [openedLevel, setOpenedLevel] = useState<number>(1);
  const [questReward, setQuestReward] = useState<string | null>(null);

  const levelText = (key: string, level: number) => t(key).replace('{level}', String(level));

  useEffect(() => {
    const user = getUser();
    if (!user?.id) {
      setMessage(t('quest.loginRequired'));
      return;
    }

    setUserId(user.id);
  }, [t]);

  useEffect(() => {
    async function loadData() {
      const tasksResponse = await fetch('/api/quest/tasks');
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks || []);
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadProgress() {
      if (!userId) {
        return;
      }

      const progressResponse = await fetch(`/api/quest/progress/${userId}`);
      const progressData = await progressResponse.json();
      setProgress(progressData.progress);
      setOpenedLevel(progressData.progress?.currentLevel || 1);
    }

    loadProgress();
  }, [userId]);

  const doneCount = useMemo(() => progress.completedLevels.length, [progress.completedLevels.length]);

  function onSelectFile(level: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setFileByLevel((prev) => ({ ...prev, [level]: file }));
  }

  async function handleQrDetected(code: string) {
    if (!userId) {
      setMessage(t('quest.authNeeded'));
      return;
    }

    const response = await fetch(`/api/quest/scan/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || t('quest.qrDenied'));
      return;
    }

    if (data.allowed) {
      setOpenedLevel(data.level);
      setMessage(data.message || levelText('quest.levelOpened', data.level));
      const element = document.getElementById(`level-${data.level}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async function uploadForTask(task: QuestTask) {
    if (!userId) {
      setMessage(t('quest.authNeeded'));
      return false;
    }

    const file = fileByLevel[task.level];
    if (!file) {
      setMessage(levelText('quest.fileRequired', task.level));
      return false;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('questTaskId', task.id);
    formData.append('userId', userId);

    const uploadResponse = await fetch('/api/uploads', {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      setMessage(errorData.message || 'Ошибка загрузки файла');
      return false;
    }

    return true;
  }

  async function completeLevel(task: QuestTask) {
    if (!userId) {
      setMessage(t('quest.authNeeded'));
      return;
    }

    const requiresUpload = task.type.includes('photo') || task.type.includes('video');
    if (requiresUpload) {
      const ok = await uploadForTask(task);
      if (!ok) {
        return;
      }
    }

    const answer = answerByLevel[task.level];
    if (task.type.includes('question') && !answer?.trim()) {
      setMessage(levelText('quest.answerRequired', task.level));
      return;
    }

    const response = await fetch(`/api/quest/progress/${userId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: task.level, answer })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Ошибка обновления прогресса');
      return;
    }

    setProgress(data.progress);
    setOpenedLevel(Math.min(5, task.level + 1));

    if (data.questCompleted) {
      setQuestReward(data.reward || null);
      setMessage(t('quest.spiritAccepted'));
      return;
    }

    setMessage(levelText('quest.levelDone', task.level));
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-bold">{t('quest.title')}</h1>
        <p className="mt-2 text-slate-700">
          {t('quest.progress')}: {doneCount}/5
        </p>
      </div>

      <QrScanner onDetected={handleQrDetected} />

      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => {
          const completed = progress.completedLevels.includes(task.level);
          const isCurrent = task.level === progress.currentLevel;
          const isOpened = task.level === openedLevel;

          return (
            <article
              id={`level-${task.level}`}
              key={task.id}
              className={`rounded-lg border p-4 ${
                completed
                  ? 'border-emerald-300 bg-emerald-50'
                  : isCurrent || isOpened
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <h2 className="text-lg font-semibold">
                {task.level}. {task.title}
              </h2>
              <p className="mt-2 text-sm text-slate-700">{task.description}</p>

              {(task.type.includes('photo') || task.type.includes('video')) && (isCurrent || isOpened) && (
                <div className="mt-3 space-y-2">
                  <label className="text-sm text-slate-700">{t('quest.uploadLabel')}</label>
                  <input
                    type="file"
                    accept={task.type.includes('video') ? 'video/*' : 'image/*'}
                    onChange={(event) => onSelectFile(task.level, event)}
                    className="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              {task.type.includes('question') && (isCurrent || isOpened) && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-slate-800">{task.question}</p>
                  <textarea
                    rows={3}
                    value={answerByLevel[task.level] || ''}
                    onChange={(event) =>
                      setAnswerByLevel((prev) => ({
                        ...prev,
                        [task.level]: event.target.value
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder={t('quest.answerPlaceholder')}
                  />
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => completeLevel(task)}
                  disabled={!isCurrent || completed}
                  className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {completed ? t('quest.done') : isCurrent ? t('quest.completeNext') : t('quest.locked')}
                </button>
              </div>
            </article>
          );
        })}
      </div>


      {questReward && (
        <div className="rounded-xl border border-purple-300 bg-purple-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-purple-900">{t('quest.spiritAccepted')}</h2>
          <p className="mt-2 text-purple-800">{t('quest.yourReward')}: <b>{questReward}</b></p>
        </div>
      )}

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </section>
  );
}
