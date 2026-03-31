# Банк покупок — стартовый проект

Структура:
- `client` — Next.js + Tailwind CSS + i18n (RU/EN/MAR)
- `server` — Node.js + Express + JWT + MongoDB + file upload + mock AI

## Быстрый старт

```bash
npm install
npm run dev
```

После запуска:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api/health

## Auth API

- `POST /api/auth/register`
  - body: `{ name, email, password, language }`
- `POST /api/auth/login`
  - body: `{ email, password }`

## Quest + Upload API

- `GET /api/quest/tasks` — список заданий квеста
- `GET /api/quest/progress/:userId` — получить прогресс пользователя (например, 1/5)
- `POST /api/quest/progress/:userId/complete` — отметить уровень завершённым
  - body: `{ level, answer? }`
- `POST /api/uploads` — загрузка фото/видео для задания
  - multipart fields:
    - `file`
    - `questTaskId`
    - `userId` (опционально)

Загруженные файлы доступны по `/uploads/<filename>`.

## Mock AI API

- `POST /api/ai/validate`
  - body: `{ submissionId }` или `{ originalName, fileType }`
  - checks:
    - `hasPerson`
    - `hasGreenColor`

Архитектура сделана через provider-слой:
- `server/src/services/ai/ai-provider.js` — контракт
- `server/src/services/ai/mock-ai-provider.js` — mock реализация
- `server/src/services/ai/index.js` — factory

Это позволяет заменить mock на реальный AI без изменения API-роутов.

## i18n

- Поддерживаемые языки: русский (`ru`), английский (`en`), марийский (`mar`)
- JSON-переводы находятся в `client/i18n/translations`
- Переключатель языка доступен в верхней навигации

## Переменные окружения (server)

```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/bank_pokupok
JWT_SECRET=dev-secret
AI_PROVIDER=mock
```

## Команды

```bash
# Запуск двух сервисов одновременно
npm run dev

# По отдельности
npm run dev:client
npm run dev:server

# Сборка фронтенда
npm run build

# Запуск backend в production-режиме
npm run start
```
