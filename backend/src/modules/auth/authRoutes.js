const express = require('express');
const { signup, login, signupSchema, loginSchema } = require('./authController');
const validate = require('../../middleware/validate');

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

module.exports = router;
