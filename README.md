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

## Malls + Multi-quest API

- `GET /api/quest/malls` — список ТЦ
- `GET /api/quest/malls/:mallId/levels` — уровни квеста выбранного ТЦ
- `GET /api/quest/progress/:userId?mallId=...` — прогресс пользователя в конкретном ТЦ
- `POST /api/quest/scan/:userId` — проверка QR для конкретного ТЦ
  - body: `{ code, mallId }`
- `POST /api/quest/progress/:userId/complete`
  - body: `{ level, answer?, mallId }`

## Admin API (basic)

- `GET /api/admin/malls` — список ТЦ и квестов (header `x-admin-key`)
- `POST /api/admin/malls` — создать ТЦ с квест-структурой
- `GET /api/admin/quests/:mallId` — квест-уровни по ТЦ

- `POST /api/uploads` — загрузка фото/видео для задания
  - multipart fields:
    - `file`
    - `questTaskId`
    - `userId` (опционально)

Загруженные файлы доступны по `/uploads/<filename>`.


## Products API

- `GET /api/products` — каталог товаров (сумка, игрушка, украшения, открытка)

## Profile API

- `GET /api/users/:userId/profile` — профиль пользователя и список наград

## Orders + VTB Pay API

- `POST /api/orders/create` — создать заказ на товар
  - body: `{ userId, productId }`
- `GET /api/orders/:orderId/status` — получить статус заказа
- `GET /api/payments/vtbpay/mock-success?orderId=...&paymentId=...` — mock подтверждение оплаты VTB Pay

После оплаты статус заказа меняется на `paid`.

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


Frontend QR scanner: используется BarcodeDetector API (с fallback на ручной ввод QR-кода).


После завершения 5 уровней квеста пользователю выдаётся случайная награда и сохраняется в профиле.
