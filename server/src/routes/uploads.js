const express = require('express');
const multer = require('multer');
const path = require('path');
const QuestSubmission = require('../models/QuestSubmission');

function createUploadRouter(aiService) {
  const router = express.Router();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'server', 'uploads')),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

  router.post('/', upload.single('file'), async (req, res) => {
    const { questTaskId, questTaskTitle, userId, mallId } = req.body;

    if (!questTaskId) return res.status(400).json({ message: 'questTaskId обязателен' });
    if (!req.file) return res.status(400).json({ message: 'Файл не был загружен' });

    const aiValidation = await aiService.validateMedia({ originalName: req.file.originalname, fileType: req.file.mimetype });

    const submission = await QuestSubmission.create({
      userId: userId || undefined,
      mallId: mallId || undefined,
      questTaskId,
      questTaskTitle: questTaskTitle || questTaskId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      aiValidation
    });

    return res.status(201).json({ message: 'Файл успешно загружен', submission, aiValidation });
  });

  return router;
}

module.exports = { createUploadRouter };
