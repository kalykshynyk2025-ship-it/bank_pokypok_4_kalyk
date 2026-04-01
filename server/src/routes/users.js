const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/:userId/profile', async (req, res) => {
  const user = await User.findById(req.params.userId).select('name email language rewards');

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  return res.json({ user });
});

module.exports = router;
