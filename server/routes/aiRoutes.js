import express from 'express';
import { getInsights, aiHealth } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, schemas } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/health', asyncHandler(aiHealth));

// Reads are public — anyone on the spotlight page can see the cached
// "quick read" snippet for a project.
router.get(
  '/insights/:projectId',
  validate(schemas.aiInsightsParam),
  asyncHandler(getInsights),
);

// Forced regeneration is judge-only (and ?refresh=1 inside the controller
// is gated to admins).
router.post(
  '/insights/:projectId',
  protect,
  validate(schemas.aiInsightsParam),
  asyncHandler(getInsights),
);

export default router;
