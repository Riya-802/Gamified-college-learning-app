const express = require('express');
const { getTasks, completeTask, completeVideo } = require('./tasksController');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getTasks);
router.post('/:id/complete', authMiddleware, completeTask);
router.post('/:id/videos/:videoId/complete', authMiddleware, completeVideo);

module.exports = router;
