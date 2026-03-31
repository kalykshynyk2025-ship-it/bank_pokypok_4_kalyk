const mongoose = require('mongoose');

const questProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mall',
      required: true
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    completedLevels: {
      type: [Number],
      default: []
    },
    answers: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

questProgressSchema.index({ userId: 1, mallId: 1 }, { unique: true });

module.exports = mongoose.model('QuestProgress', questProgressSchema);
