const mongoose = require('mongoose');

const questProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
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

module.exports = mongoose.model('QuestProgress', questProgressSchema);
