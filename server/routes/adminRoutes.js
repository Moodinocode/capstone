import express from 'express';
import {
  getStats,
  getVotesTimeseries,
  getInterRater,
  getAnomalies,
  getAuditLog,
  getJudgeProgress,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats',             asyncHandler(getStats));
router.get('/votes-timeseries',  asyncHandler(getVotesTimeseries));
router.get('/inter-rater',       asyncHandler(getInterRater));
router.get('/anomalies',         asyncHandler(getAnomalies));
router.get('/audit-log',         asyncHandler(getAuditLog));
router.get('/judge-progress',    asyncHandler(getJudgeProgress));

export default router;
