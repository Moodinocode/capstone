import express from 'express';
import { getSession, updateSession, setVotesVisible, setPublic } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getSession);
router.put('/', protect, updateSession);
router.post('/votes-visible', setVotesVisible);
router.post('/set-public', setPublic);
export default router;
