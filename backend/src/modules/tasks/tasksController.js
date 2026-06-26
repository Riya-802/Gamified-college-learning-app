const Task = require('../../models/Task');
const User = require('../../models/User');

// Seed default tasks if empty or if videos are missing
const seedTasks = async () => {
  const count = await Task.countDocuments();
  const hasVideos = await Task.findOne({ videos: { $exists: true, $not: { $size: 0 } } });

  if (count === 0 || !hasVideos) {
    // Clean up old task definitions
    await Task.deleteMany({});

    const defaultTasks = [
      // Basics
      {
        title: 'Learn Variables & Data Types',
        category: 'basics',
        xpReward: 100,
        difficulty: 'Easy',
        order: 1,
        videos: [
          { title: 'JavaScript Variables & Data Types', url: 'https://www.youtube.com/watch?v=upDLs1sn7g4', instructor: 'CodeWithHarry' },
          { title: 'Variables in JS Complete Guide', url: 'https://www.youtube.com/watch?v=R8SjM4DKK80', instructor: 'Apna College' }
        ]
      },
      {
        title: 'Master Control Flow & Loops',
        category: 'basics',
        xpReward: 120,
        difficulty: 'Easy',
        order: 2,
        videos: [
          { title: 'Conditional Statements & Loops in JS', url: 'https://www.youtube.com/watch?v=2md4ap6Hn2M', instructor: 'CodeWithHarry' }
        ]
      },
      {
        title: 'Understand Functions & Scope',
        category: 'basics',
        xpReward: 150,
        difficulty: 'Easy',
        order: 3,
        videos: [
          { title: 'JS Functions Explained clearly', url: 'https://www.youtube.com/watch?v=cvvwSg_LwzY', instructor: 'Chai aur Code' }
        ]
      },
      {
        title: 'Intro to OOP Concepts',
        category: 'basics',
        xpReward: 200,
        difficulty: 'Medium',
        order: 4,
        videos: [
          { title: 'Object Oriented Programming in JS', url: 'https://www.youtube.com/watch?v=13-A_9E3xY0', instructor: 'CodeHelp - Babbar' }
        ]
      },

      // DSA
      {
        title: 'Arrays & Big-O Notation',
        category: 'dsa',
        xpReward: 200,
        difficulty: 'Easy',
        order: 5,
        videos: [
          { title: 'Complete Guide to Arrays & Big O', url: 'https://www.youtube.com/watch?v=V6mKVRU1evU', instructor: 'Anuj Bhaiya' },
          { title: 'Big O Notation in 10 Minutes', url: 'https://www.youtube.com/watch?v=__yNz2FOTw4', instructor: 'Clément Mihailescu' }
        ]
      },
      {
        title: 'Linked Lists & Stacks/Queues',
        category: 'dsa',
        xpReward: 250,
        difficulty: 'Medium',
        order: 6,
        videos: [
          { title: 'Linked List Tutorial Java/C++', url: 'https://www.youtube.com/watch?v=58YClmXAms4', instructor: 'Anuj Bhaiya' },
          { title: 'Stacks & Queues DSA Tutorials', url: 'https://www.youtube.com/watch?v=r7S5v9bT6O4', instructor: 'Apna College' }
        ]
      },
      {
        title: 'Recursion & Sorting Algorithms',
        category: 'dsa',
        xpReward: 300,
        difficulty: 'Medium',
        order: 7,
        videos: [
          { title: 'Recursion Explained Visualized', url: 'https://www.youtube.com/watch?v=k7-N8R0-KY4', instructor: 'Kunal Kushwaha' },
          { title: 'Sorting Algorithms Overview', url: 'https://www.youtube.com/watch?v=g-PGLbMth_g', instructor: 'Anuj Bhaiya' }
        ]
      },
      {
        title: 'Binary Trees & Graphs Basics',
        category: 'dsa',
        xpReward: 400,
        difficulty: 'Hard',
        order: 8,
        videos: [
          { title: 'Binary Tree Introduction & Traversals', url: 'https://www.youtube.com/watch?v=5NiXlPrLg5c', instructor: 'Striver' },
          { title: 'Introduction to Graphs & BFS/DFS', url: 'https://www.youtube.com/watch?v=59fUtYYz7ZU', instructor: 'Striver' }
        ]
      },

      // Projects
      {
        title: 'Build a Personal Portfolio Site',
        category: 'projects',
        xpReward: 300,
        difficulty: 'Easy',
        order: 9,
        videos: [
          { title: 'Portfolio Website Design HTML/CSS', url: 'https://www.youtube.com/watch?v=h3bGym8mrgU', instructor: 'CodewithSadee' }
        ]
      },
      {
        title: 'Create an Express REST API',
        category: 'projects',
        xpReward: 400,
        difficulty: 'Medium',
        order: 10,
        videos: [
          { title: 'Build a Node/Express REST API', url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48', instructor: 'Traversy Media' }
        ]
      },
      {
        title: 'Build a Full-Stack MERN Application',
        category: 'projects',
        xpReward: 600,
        difficulty: 'Hard',
        order: 11,
        videos: [
          { title: 'MERN Stack Project from Scratch', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M', instructor: 'EdRoh' }
        ]
      },

      // Resume
      {
        title: 'Create a Single-Page Tech Resume',
        category: 'resume',
        xpReward: 150,
        difficulty: 'Easy',
        order: 12,
        videos: [
          { title: 'Perfect Tech Resume Guide', url: 'https://www.youtube.com/watch?v=yp693O87Gg8', instructor: 'Kunal Kushwaha' }
        ]
      },
      {
        title: 'Polish GitHub & LinkedIn Profiles',
        category: 'resume',
        xpReward: 150,
        difficulty: 'Easy',
        order: 13,
        videos: [
          { title: 'How to Build a Great GitHub Profile', url: 'https://www.youtube.com/watch?v=Tcr4P7M4R2A', instructor: 'Kunal Kushwaha' }
        ]
      },
      {
        title: 'Write Project Case Studies',
        category: 'resume',
        xpReward: 200,
        difficulty: 'Medium',
        order: 14,
        videos: [
          { title: 'Writing Dev Case Studies', url: 'https://www.youtube.com/watch?v=4yO9gZ2L0n4', instructor: 'Academind' }
        ]
      },

      // Interviews
      {
        title: 'Practice Behavioral Questions',
        category: 'interviews',
        xpReward: 150,
        difficulty: 'Easy',
        order: 15,
        videos: [
          { title: 'Cracking the Behavioral Interview', url: 'https://www.youtube.com/watch?v=1mHjMNZZvFo', instructor: 'Jeff H Sipe' }
        ]
      },
      {
        title: 'Mock Technical Interview',
        category: 'interviews',
        xpReward: 300,
        difficulty: 'Medium',
        order: 16,
        videos: [
          { title: 'React Mock Interview', url: 'https://www.youtube.com/watch?v=qM2h-UorvjA', instructor: 'RoadsideCoder' }
        ]
      },
      {
        title: 'System Design Basics',
        category: 'interviews',
        xpReward: 450,
        difficulty: 'Hard',
        order: 17,
        videos: [
          { title: 'System Design for Beginners', url: 'https://www.youtube.com/watch?v=SqcXyztPa1c', instructor: 'ByteByteGo' }
        ]
      }
    ];

    await Task.insertMany(defaultTasks);
    console.log('Roadmap tasks seeded successfully with tutorial videos.');
  }
};

// Auto-seed tasks
seedTasks().catch(err => console.error('Error seeding tasks:', err));

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ order: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if task is already completed
    const alreadyCompleted = user.completedTasks.some(
      t => t.taskId.toString() === taskId
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Mark task completed
    user.completedTasks.push({ taskId, completedAt: new Date() });
    
    // Reward XP
    user.xp += task.xpReward;

    // Level calculation: Every 500 XP is a level
    const newLevel = Math.floor(user.xp / 500) + 1;
    let leveledUp = false;
    const badgesEarned = [];

    if (newLevel > user.level) {
      user.level = newLevel;
      leveledUp = true;
    }

    // Award Badge check
    if (user.completedTasks.length === 1) {
      const badge = {
        name: 'First Step',
        icon: '🚀',
        description: 'Completed your first learning roadmap task!'
      };
      user.badges.push(badge);
      badgesEarned.push(badge.name);
    }

    if (leveledUp && user.level === 3) {
      const badge = {
        name: 'DSA Apprentice',
        icon: '🛡️',
        description: 'Reached level 3 and unlocked DSA mastery roadmap!'
      };
      user.badges.push(badge);
      badgesEarned.push(badge.name);
    }

    if (leveledUp && user.level === 5) {
      const badge = {
        name: 'Full Stack Wizard',
        icon: '🔮',
        description: 'Reached level 5 and successfully built projects!'
      };
      user.badges.push(badge);
      badgesEarned.push(badge.name);
    }

    // Update active state and streak
    const now = new Date();
    const lastActiveDate = new Date(user.lastActive);
    const diffTime = Math.abs(now - lastActiveDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
    user.lastActive = now;

    await user.save();

    res.json({
      message: 'Task completed successfully',
      xpEarned: task.xpReward,
      currentXp: user.xp,
      currentLevel: user.level,
      leveledUp,
      badgesEarned,
      completedTasks: user.completedTasks
    });
  } catch (err) {
    next(err);
  }
};

const completeVideo = async (req, res, next) => {
  try {
    const { id: taskId, videoId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const video = task.videos.id(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if video is already completed
    const alreadyCompletedVideo = user.completedVideos.some(
      v => v.videoId.toString() === videoId
    );

    if (alreadyCompletedVideo) {
      return res.status(400).json({ message: 'Video already completed' });
    }

    // Mark video completed
    user.completedVideos.push({ taskId, videoId, completedAt: new Date() });

    // Reward +20 XP for video completion
    let totalXpEarned = 20;
    user.xp += 20;

    // Check if all videos for this task are completed
    const taskVideosIds = task.videos.map(v => v._id.toString());
    const completedVideosForTask = user.completedVideos
      .filter(v => v.taskId.toString() === taskId)
      .map(v => v.videoId.toString());

    const allVideosCompleted = taskVideosIds.every(id => completedVideosForTask.includes(id));

    let taskCompletedNow = false;
    let leveledUp = false;
    const badgesEarned = [];

    // Check if task is already completed
    const alreadyCompletedTask = user.completedTasks.some(
      t => t.taskId.toString() === taskId
    );

    if (allVideosCompleted && !alreadyCompletedTask) {
      user.completedTasks.push({ taskId, completedAt: new Date() });
      user.xp += task.xpReward;
      totalXpEarned += task.xpReward;
      taskCompletedNow = true;

      // Award Badge checks
      if (user.completedTasks.length === 1) {
        const badge = {
          name: 'First Step',
          icon: '🚀',
          description: 'Completed your first learning roadmap task!'
        };
        user.badges.push(badge);
        badgesEarned.push(badge.name);
      }
    }

    // Level calculation: Every 500 XP is a level
    const newLevel = Math.floor(user.xp / 500) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      leveledUp = true;

      if (user.level === 3) {
        const badge = {
          name: 'DSA Apprentice',
          icon: '🛡️',
          description: 'Reached level 3 and unlocked DSA mastery roadmap!'
        };
        user.badges.push(badge);
        badgesEarned.push(badge.name);
      }

      if (user.level === 5) {
        const badge = {
          name: 'Full Stack Wizard',
          icon: '🔮',
          description: 'Reached level 5 and successfully built projects!'
        };
        user.badges.push(badge);
        badgesEarned.push(badge.name);
      }
    }

    // Update active state and streak
    const now = new Date();
    const lastActiveDate = new Date(user.lastActive);
    const diffTime = Math.abs(now - lastActiveDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
    user.lastActive = now;

    await user.save();

    res.json({
      message: taskCompletedNow ? 'Video completed, and entire milestone achieved!' : 'Video completed successfully',
      xpEarned: totalXpEarned,
      currentXp: user.xp,
      currentLevel: user.level,
      leveledUp,
      badgesEarned,
      taskCompletedNow,
      completedVideos: user.completedVideos,
      completedTasks: user.completedTasks
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  completeTask,
  completeVideo
};
