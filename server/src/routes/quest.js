const express = require('express');

const router = express.Router();

const questTasks = [
  { id: 'lvl1', title: 'Уровень 1: Найдите первый QR-код' },
  { id: 'lvl2', title: 'Уровень 2: Соберите артефакт' },
  { id: 'lvl3', title: 'Уровень 3: Ответьте на загадку' },
  { id: 'lvl4', title: 'Уровень 4: Фото-доказательство точки' },
  { id: 'lvl5', title: 'Уровень 5: Финальное видео-послание' }
];

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

module.exports = { questRouter: router, questTasks };
