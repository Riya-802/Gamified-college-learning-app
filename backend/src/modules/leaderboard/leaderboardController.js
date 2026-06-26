const User = require('../../models/User');

const getLeaderboard = async (req, res, next) => {
  try {
    // Fetch top 50 users sorted by XP descending
    const leaderboard = await User.find()
      .select('name email level xp streak badges')
      .sort({ xp: -1 })
      .limit(50);
    
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeaderboard
};
