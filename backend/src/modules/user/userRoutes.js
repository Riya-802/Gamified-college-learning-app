const express = require('express');
const { getProfile, getPublicProfile } = require('./userController');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.get('/:id', authMiddleware, getPublicProfile);

module.exports = router;
