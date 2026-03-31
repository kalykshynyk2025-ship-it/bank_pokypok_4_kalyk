const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const { questRouter } = require('./routes/quest');
const { createUploadRouter } = require('./routes/uploads');
const { createAiRouter } = require('./routes/ai');
const { createAiService } = require('./services/ai');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bank_pokupok';

const aiService = createAiService();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Express backend работает'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/quest', questRouter);
app.use('/api/uploads', createUploadRouter(aiService));
app.use('/api/ai', createAiRouter(aiService));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
