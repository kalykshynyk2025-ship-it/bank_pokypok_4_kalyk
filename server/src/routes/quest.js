const express = require('express');
const QuestProgress = require('../models/QuestProgress');
const User = require('../models/User');

const router = express.Router();

const questTasks = [
  {
    id: 'lvl1',
    level: 1,
    title: 'Уровень 1: Фото зелёного объекта',
    description: 'Сделайте фото любого зелёного объекта и загрузите его.',
    type: 'photo'
  },
  {
    id: 'lvl2',
    level: 2,
    title: 'Уровень 2: Фото орнамента + вопрос',
    description: 'Загрузите фото орнамента и ответьте: что символизирует орнамент?',
    type: 'photo+question',
    question: 'Что символизирует орнамент?'
  },
  {
    id: 'lvl3',
    level: 3,
    title: 'Уровень 3: Видео в магазине',
    description: 'Снимите короткое видео в магазине и загрузите его.',
    type: 'video'
  },
  {
    id: 'lvl4',
    level: 4,
    title: 'Уровень 4: Фото с человеком',
    description: 'Сделайте фото, где есть человек, и загрузите его.',
    type: 'photo'
  },
  {
    id: 'lvl5',
    level: 5,
    title: 'Уровень 5: Финальный вопрос',
    description: 'Ответьте на финальный вопрос квеста.',
    type: 'question',
    question: 'Почему важно сохранять культурное наследие?'
  }
];

const rewardPool = ['Амулет ветра', 'Талисман леса', 'Камень предков', 'Оберег солнца'];

function parseQrCodeToTaskId(code) {
  const normalized = String(code || '').trim().toLowerCase();
  const match = normalized.match(/lvl[1-5]/);

  if (!match) {
    return null;
  }

  return match[0];
}

async function getOrCreateProgress(userId) {
  let progress = await QuestProgress.findOne({ userId });

  if (!progress) {
    progress = await QuestProgress.create({
      userId,
      currentLevel: 1,
      completedLevels: []
    });
  }

  return progress;
}

function getRandomReward() {
  const index = Math.floor(Math.random() * rewardPool.length);
  return rewardPool[index];
}

router.get('/tasks', (_req, res) => {
  res.json({ tasks: questTasks });
});

router.get('/tasks/:id', (req, res) => {
  const task = questTasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Задание не найдено' });
  }

  return res.json({ task });
});

router.post('/scan/:userId', async (req, res) => {
  const { userId } = req.params;
  const { code } = req.body;

  const taskId = parseQrCodeToTaskId(code);
  if (!taskId) {
    return res.status(400).json({ message: 'Невалидный QR код' });
  }

  const task = questTasks.find((item) => item.id === taskId);
  if (!task) {
    return res.status(404).json({ message: 'Уровень не найден' });
  }

  const progress = await getOrCreateProgress(userId);

  if (task.level > progress.currentLevel) {
    return res.status(403).json({
      message: `Нет доступа: сейчас открыт уровень ${progress.currentLevel}`,
      allowed: false,
      currentLevel: progress.currentLevel
    });
  }

  return res.json({
    allowed: true,
    level: task.level,
    task,
    message: `Открыт уровень ${task.level}`
  });
});

router.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  const progress = await getOrCreateProgress(userId);

  return res.json({ progress });
});

router.post('/progress/:userId/complete', async (req, res) => {
  const { userId } = req.params;
  const { level, answer } = req.body;

  if (!level || level < 1 || level > 5) {
    return res.status(400).json({ message: 'Укажите корректный уровень (1-5)' });
  }

  const progress = await getOrCreateProgress(userId);

  if (!progress.completedLevels.includes(level)) {
    progress.completedLevels.push(level);
  }

  if (answer) {
    progress.answers.set(String(level), answer);
  }

  progress.currentLevel = Math.min(5, level + 1);

  await progress.save();

  let reward = null;
  const questCompleted = progress.completedLevels.length >= 5;

  if (questCompleted) {
    const user = await User.findById(userId);

    if (user) {
      reward = getRandomReward();
      user.rewards.push(reward);
      await user.save();
    }
  }

  return res.json({
    message: 'Прогресс обновлён',
    progress,
    questCompleted,
    reward
  });
});

module.exports = { questRouter: router, questTasks };
