# Банк покупок — стартовый проект

Структура:
- `client` — Next.js + Tailwind CSS
- `server` — Node.js + Express + JWT + MongoDB

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

## Переменные окружения (server)

```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/bank_pokupok
JWT_SECRET=dev-secret
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
