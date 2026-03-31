const express = require('express');
const multer = require('multer');
const path = require('path');
const QuestSubmission = require('../models/QuestSubmission');
const { questTasks } = require('./quest');

function createUploadRouter(aiService) {
  const router = express.Router();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(process.cwd(), 'server', 'uploads'));
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 15 * 1024 * 1024
    }
  });

  router.post('/', upload.single('file'), async (req, res) => {
    const { questTaskId, userId } = req.body;

    if (!questTaskId) {
      return res.status(400).json({ message: 'questTaskId обязателен' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Файл не был загружен' });
    }

    const task = questTasks.find((item) => item.id === questTaskId);
    if (!task) {
      return res.status(400).json({ message: 'Некорректный questTaskId' });
    }

    const aiValidation = await aiService.validateMedia({
      originalName: req.file.originalname,
      fileType: req.file.mimetype
    });

    const submission = await QuestSubmission.create({
      userId: userId || undefined,
      questTaskId,
      questTaskTitle: task.title,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      aiValidation
    });

    return res.status(201).json({
      message: 'Файл успешно загружен',
      submission,
      aiValidation
    });
  });

  return router;
}

module.exports = { createUploadRouter };
