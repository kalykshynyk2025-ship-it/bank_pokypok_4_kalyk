const express = require('express');
const QuestSubmission = require('../models/QuestSubmission');

function createAiRouter(aiService) {
  const router = express.Router();

  router.post('/validate', async (req, res) => {
    const { submissionId, originalName, fileType } = req.body;

    let source = null;

    if (submissionId) {
      source = await QuestSubmission.findById(submissionId);
      if (!source) {
        return res.status(404).json({ message: 'Submission not found' });
      }
    } else if (originalName && fileType) {
      source = { originalName, fileType };
    } else {
      return res.status(400).json({
        message: 'Передайте submissionId или пару originalName + fileType'
      });
    }

    const aiResult = await aiService.validateMedia({
      originalName: source.originalName,
      fileType: source.fileType
    });

    if (submissionId && source) {
      source.aiValidation = aiResult;
      await source.save();
    }

    return res.json({
      source: submissionId ? 'submission' : 'direct',
      aiResult
    });
  });

  return router;
}

module.exports = { createAiRouter };
