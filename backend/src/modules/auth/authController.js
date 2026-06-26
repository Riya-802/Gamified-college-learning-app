const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../../models/User');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate email domain
    const collegeDomainRegex = /@([a-zA-Z0-9-]+\.)*(edu|ac\.in|edu\.in)$/i;
    if (!collegeDomainRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Registration requires a valid college email address (ending in .edu, .ac.in, or .edu.in)' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      // Fresh user starts at level 1 with 0 XP
      level: 1,
      xp: 0,
      streak: 1, // Start streak at 1
      lastActive: new Date()
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'dev-secret', 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update daily streak
    const now = new Date();
    const lastActiveDate = new Date(user.lastActive);
    const diffTime = Math.abs(now - lastActiveDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1; // Reset streak if missed a day
    }
    user.lastActive = now;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'dev-secret', 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  signupSchema,
  loginSchema
};
