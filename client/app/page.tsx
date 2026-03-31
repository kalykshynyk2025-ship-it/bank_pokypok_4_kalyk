async function getBackendStatus(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch('http://localhost:4000/api/health', {
      cache: 'no-store'
    });

    if (!response.ok) {
      return { status: 'error', message: `Backend недоступен (${response.status})` };
    }

    return response.json();
  } catch {
    return { status: 'error', message: 'Backend не отвечает' };
  }
}

export default async function HomePage() {
  const backend = await getBackendStatus();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Главная страница</h1>
      <p className="text-slate-700">
        Это стартовый шаблон проекта с Next.js + Tailwind CSS на frontend и Express на backend.
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Проверка подключения к backend</h2>
        <p className="mt-2 text-sm text-slate-700">
          Статус: <span className="font-medium">{backend.status}</span>
        </p>
        <p className="text-sm text-slate-700">Сообщение: {backend.message}</p>
      </div>
    </section>
  );
}
