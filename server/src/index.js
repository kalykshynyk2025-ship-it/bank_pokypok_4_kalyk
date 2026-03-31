const express = require('express');
const cors = require('cors');
const path = require('path');
let mongoose;
try {
  mongoose = require('mongoose');
} catch (error) {
  console.error('Missing dependency: mongoose. Run `npm install` at repository root.');
  process.exit(1);
}
const authRoutes = require('./routes/auth');
const { questRouter } = require('./routes/quest');
const { createUploadRouter } = require('./routes/uploads');
const { createAiRouter } = require('./routes/ai');
const { createAiService } = require('./services/ai');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bank_pokupok';
const ALLOW_NO_DB = (process.env.ALLOW_NO_DB || 'true') === 'true';

const aiService = createAiService();
let dbConnected = false;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Express backend работает',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/quest', questRouter);
app.use('/api/uploads', createUploadRouter(aiService));
app.use('/api/ai', createAiRouter(aiService));
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

function startHttpServer() {
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    console.log(`DB mode: ${dbConnected ? 'MongoDB connected' : 'No DB mode'}`);
  });
}

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    dbConnected = true;
    console.log('MongoDB connected');
    startHttpServer();
  } catch (error) {
    if (!ALLOW_NO_DB) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }

    console.warn('MongoDB недоступен. Сервер запущен в режиме без БД.');
    console.warn(`Причина: ${error.message}`);
    startHttpServer();
  }
}

startServer();
