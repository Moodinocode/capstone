import express from 'express';
import { initVote, castVote, checkVote, getVoteCounts } from '../controllers/voteController.js';
import { validate, schemas } from '../middleware/validate.js';
import { voteLimiter } from '../middleware/limits.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Two-step vote so server-issued HMAC tokens prove the client at least
// loaded the page once. Curl loops without a /init call get rejected.
router.post('/init',           voteLimiter, validate(schemas.voteInit), asyncHandler(initVote));
router.post('/',               voteLimiter, validate(schemas.voteCast), asyncHandler(castVote));
router.get('/check/:token',    validate(schemas.voteCheckParam),        asyncHandler(checkVote));
router.get('/counts',                                                    asyncHandler(getVoteCounts));

export default router;
