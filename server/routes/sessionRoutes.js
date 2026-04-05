import express from 'express';
import { getSession, updateSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getSession);
router.put('/', protect, updateSession);
export default router;
