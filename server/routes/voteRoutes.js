import express from 'express';
import { castVote, checkVote, getVoteCounts } from '../controllers/voteController.js';

const router = express.Router();
router.post('/', castVote);
router.get('/check/:token', checkVote);
router.get('/counts', getVoteCounts);
export default router;
