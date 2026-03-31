const express = require('express');
const QuestProgress = require('../models/QuestProgress');
const User = require('../models/User');
const Mall = require('../models/Mall');

const router = express.Router();

const rewardPool = ['Амулет ветра', 'Талисман леса', 'Камень предков', 'Оберег солнца'];

const defaultMallData = [
  {
    name: 'ТЦ Алатырь',
    city: 'Йошкар-Ола',
    questLevels: [
      { id: 'al-lvl1', level: 1, title: 'Зелёный объект в Алатыре', description: 'Найдите и загрузите фото зелёного объекта.', type: 'photo' },
      { id: 'al-lvl2', level: 2, title: 'Орнамент Алатырь', description: 'Фото орнамента + вопрос.', type: 'photo+question', question: 'Что символизирует орнамент?' },
      { id: 'al-lvl3', level: 3, title: 'Видео из ТЦ Алатырь', description: 'Запишите короткое видео в ТЦ.', type: 'video' },
      { id: 'al-lvl4', level: 4, title: 'Фото с человеком', description: 'Сделайте фото с человеком.', type: 'photo' },
      { id: 'al-lvl5', level: 5, title: 'Финальный вопрос Алатырь', description: 'Ответьте на финальный вопрос.', type: 'question', question: 'Почему важно сохранять культурное наследие?' }
    ]
  },
  {
    name: 'ТЦ Планета',
    city: 'Казань',
    questLevels: [
      { id: 'pl-lvl1', level: 1, title: 'Зелёный символ Планеты', description: 'Найдите зелёный объект в ТЦ Планета.', type: 'photo' },
      { id: 'pl-lvl2', level: 2, title: 'Орнамент Планеты', description: 'Фото орнамента + вопрос.', type: 'photo+question', question: 'Что передаёт узор в культуре?' },
      { id: 'pl-lvl3', level: 3, title: 'Видео в галерее ТЦ', description: 'Снимите видео в торговой галерее.', type: 'video' },
      { id: 'pl-lvl4', level: 4, title: 'Командное фото', description: 'Фото с человеком на фоне символа ТЦ.', type: 'photo' },
      { id: 'pl-lvl5', level: 5, title: 'Финальный вопрос Планеты', description: 'Ответьте на финальный вопрос.', type: 'question', question: 'Что объединяет людей через традиции?' }
    ]
  }
];

async function ensureDefaultMalls() {
  const count = await Mall.countDocuments();

  if (count === 0) {
    await Mall.insertMany(defaultMallData);
  }
}

function parseQrCodeToLevel(code) {
  const normalized = String(code || '').trim().toLowerCase();
  const match = normalized.match(/lvl[1-5]/);

  if (!match) {
    return null;
  }

  return Number(match[0].replace('lvl', ''));
}

async function getOrCreateProgress(userId, mallId) {
  let progress = await QuestProgress.findOne({ userId, mallId });

  if (!progress) {
    progress = await QuestProgress.create({ userId, mallId, currentLevel: 1, completedLevels: [] });
  }

  return progress;
}

function getRandomReward() {
  const index = Math.floor(Math.random() * rewardPool.length);
  return rewardPool[index];
}

router.get('/malls', async (_req, res) => {
  await ensureDefaultMalls();
  const malls = await Mall.find({ isActive: true }).select('name city');
  res.json({ malls });
});

router.get('/malls/:mallId/levels', async (req, res) => {
  await ensureDefaultMalls();
  const mall = await Mall.findById(req.params.mallId);

  if (!mall) {
    return res.status(404).json({ message: 'ТЦ не найден' });
  }

  return res.json({ mall: { id: mall._id, name: mall.name, city: mall.city }, tasks: mall.questLevels });
});

router.post('/scan/:userId', async (req, res) => {
  const { userId } = req.params;
  const { code, mallId } = req.body;

  if (!mallId) {
    return res.status(400).json({ message: 'mallId обязателен' });
  }

  const mall = await Mall.findById(mallId);
  if (!mall) {
    return res.status(404).json({ message: 'ТЦ не найден' });
  }

  const level = parseQrCodeToLevel(code);
  if (!level) {
    return res.status(400).json({ message: 'Невалидный QR код' });
  }

  const task = mall.questLevels.find((item) => item.level === level);
  if (!task) {
    return res.status(404).json({ message: 'Уровень не найден для выбранного ТЦ' });
  }

  const progress = await getOrCreateProgress(userId, mallId);

  if (task.level > progress.currentLevel) {
    return res.status(403).json({ message: `Нет доступа: сейчас открыт уровень ${progress.currentLevel}`, allowed: false, currentLevel: progress.currentLevel });
  }

  return res.json({ allowed: true, level: task.level, task, message: `Открыт уровень ${task.level}` });
});

router.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  const { mallId } = req.query;

  if (!mallId) {
    return res.status(400).json({ message: 'mallId обязателен' });
  }

  const progress = await getOrCreateProgress(userId, mallId);
  return res.json({ progress });
});

router.post('/progress/:userId/complete', async (req, res) => {
  const { userId } = req.params;
  const { level, answer, mallId } = req.body;

  if (!mallId) {
    return res.status(400).json({ message: 'mallId обязателен' });
  }

  if (!level || level < 1 || level > 5) {
    return res.status(400).json({ message: 'Укажите корректный уровень (1-5)' });
  }

  const progress = await getOrCreateProgress(userId, mallId);

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
      user.rewards.push(`${reward} (${mallId})`);
      await user.save();
    }
  }

  return res.json({ message: 'Прогресс обновлён', progress, questCompleted, reward });
});

module.exports = { questRouter: router };
