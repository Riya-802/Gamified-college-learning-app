const express = require('express');
const { 
  getPeers, 
  getSeniors, 
  requestMentorship, 
  getRequests, 
  updateRequestStatus,
  getChatHistory
} = require('./mentorController');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/peers', authMiddleware, getPeers);
router.get('/seniors', authMiddleware, getSeniors);
router.post('/request', authMiddleware, requestMentorship);
router.get('/requests', authMiddleware, getRequests);
router.put('/requests/:id', authMiddleware, updateRequestStatus);
router.get('/chat/:peerId', authMiddleware, getChatHistory);

module.exports = router;
