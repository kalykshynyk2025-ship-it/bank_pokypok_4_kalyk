const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d'
  });
}

router.post('/register', async (req, res) => {
  const { name, email, password, language } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email и password обязательны' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Пользователь уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    language: language || 'RU'
  });

  const token = createToken(user._id.toString());

  return res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      language: user.language
    }
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email и password обязательны' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Неверные данные для входа' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Неверные данные для входа' });
  }

  const token = createToken(user._id.toString());

  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      language: user.language
    }
  });
});

module.exports = router;
