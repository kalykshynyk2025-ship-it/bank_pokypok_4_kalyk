const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

const defaultProducts = [
  { name: 'Сумка', description: 'Стильная сумка с национальным орнаментом', price: 1990, questEligible: true },
  { name: 'Игрушка', description: 'Мягкая игрушка в этно-стиле', price: 1290, questEligible: true },
  { name: 'Украшения', description: 'Набор украшений ручной работы', price: 2490, questEligible: true },
  { name: 'Открытка', description: 'Памятная открытка с символикой квеста', price: 290, questEligible: true }
];

router.get('/', async (_req, res) => {
  const existingCount = await Product.countDocuments();

  if (existingCount === 0) {
    await Product.insertMany(defaultProducts);
  }

  const products = await Product.find().sort({ createdAt: 1 });

  res.json({ products });
});

module.exports = router;
