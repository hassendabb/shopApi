const express = require('express');
const { body } = require('express-validator');
const validationMiddleware = require('../middlewares/validationMiddleware');
const User = require('../models/users');
const ROLES = require('../enums/roles.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config');


const router = express.Router();

router.post(
  '/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(ROLES),
  validationMiddleware,
  async (req, res) => {
    const { email, password, role } = req.body;

    console.log('register!');

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        email,
        password,
        role,
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validationMiddleware,
  async (req, res) => {
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const valide = await bcrypt.compare(password, user.password);

      if (!valide){
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
