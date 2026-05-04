import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, schemas } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/limits.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/login', loginLimiter, validate(schemas.login), asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

export default router;
