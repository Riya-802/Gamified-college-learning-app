const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/user/userRoutes');
const tasksRoutes = require('./modules/tasks/tasksRoutes');
const leaderboardRoutes = require('./modules/leaderboard/leaderboardRoutes');
const mentorRoutes = require('./modules/mentor/mentorRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/mentors', mentorRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
