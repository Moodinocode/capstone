import { Router } from 'express';
import { getWinners } from '../controllers/winnersController.js';

const router = Router();
router.get('/', getWinners);

export default router;
