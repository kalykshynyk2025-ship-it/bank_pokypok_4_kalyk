const mongoose = require('mongoose');

const aiValidationSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'mock-ai' },
    checks: {
      hasPerson: { type: Boolean, default: false },
      hasGreenColor: { type: Boolean, default: false }
    },
    score: { type: Number, default: 0 },
    raw: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: false }
);

const questSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    questTaskId: {
      type: String,
      required: true
    },
    questTaskTitle: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    aiValidation: {
      type: aiValidationSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('QuestSubmission', questSubmissionSchema);
