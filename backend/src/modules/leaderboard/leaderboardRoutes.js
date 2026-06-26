const express = require('express');
const { getLeaderboard } = require('./leaderboardController');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getLeaderboard);

module.exports = router;
