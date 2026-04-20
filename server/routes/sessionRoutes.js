import express from 'express';
import { getSession, updateSession, setVotesVisible } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getSession);
router.put('/', protect, updateSession);
router.post('/votes-visible', setVotesVisible);
export default router;
