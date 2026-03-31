const mongoose = require('mongoose');

const mallQuestLevelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    level: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    question: { type: String, default: '' }
  },
  { _id: false }
);

const mallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    questLevels: { type: [mallQuestLevelSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mall', mallSchema);
