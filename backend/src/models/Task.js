const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  instructor: { type: String }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['basics', 'dsa', 'projects', 'resume', 'interviews'] 
  },
  xpReward: { type: Number, default: 100 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  order: { type: Number, required: true },
  videos: [VideoSchema]
});

module.exports = mongoose.model('Task', TaskSchema);
