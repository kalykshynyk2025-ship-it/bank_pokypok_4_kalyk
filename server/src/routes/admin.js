const express = require('express');
const Mall = require('../models/Mall');

const router = express.Router();

function adminGuard(req, res, next) {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== (process.env.ADMIN_KEY || 'dev-admin-key')) {
    return res.status(403).json({ message: 'Доступ только для админа' });
  }

  return next();
}

router.use(adminGuard);

router.get('/malls', async (_req, res) => {
  const malls = await Mall.find().sort({ createdAt: 1 });
  res.json({ malls });
});

router.post('/malls', async (req, res) => {
  const { name, city, questLevels } = req.body;

  if (!name || !city) {
    return res.status(400).json({ message: 'name и city обязательны' });
  }

  const mall = await Mall.create({ name, city, questLevels: questLevels || [] });
  res.status(201).json({ mall });
});

router.get('/quests/:mallId', async (req, res) => {
  const mall = await Mall.findById(req.params.mallId);

  if (!mall) {
    return res.status(404).json({ message: 'ТЦ не найден' });
  }

  res.json({ mallId: mall._id, mallName: mall.name, questLevels: mall.questLevels });
});

module.exports = router;
