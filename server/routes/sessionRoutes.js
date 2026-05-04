import express from 'express';
import {
  getSession,
  updateSession,
  setVotesVisible,
  setPublic,
  streamSession,
} from '../controllers/sessionController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validate, schemas } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/',         asyncHandler(getSession));
router.get('/stream',   streamSession); // SSE — long-lived, not async-handled

router.put('/',
  protect, adminOnly, validate(schemas.sessionUpdate),
  asyncHandler(updateSession));

router.post('/votes-visible',
  protect, adminOnly, validate(schemas.sessionToggleBool('visible')),
  asyncHandler(setVotesVisible));

router.post('/set-public',
  protect, adminOnly, validate(schemas.sessionToggleBool('public')),
  asyncHandler(setPublic));

export default router;
