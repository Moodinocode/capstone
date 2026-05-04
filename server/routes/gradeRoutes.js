import express from 'express';
import { getMyGrades, getGradeForProject, saveDraft, submitGrade } from '../controllers/gradeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, schemas } from '../middleware/validate.js';
import { gradeLimiter } from '../middleware/limits.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();
router.use(protect);
router.use(gradeLimiter);

router.get('/my',                                        asyncHandler(getMyGrades));
router.get('/:projectId',                                asyncHandler(getGradeForProject));
router.put('/:projectId/draft',  validate(schemas.gradeBody), asyncHandler(saveDraft));
router.post('/:projectId/submit', validate(schemas.gradeBody), asyncHandler(submitGrade));

export default router;
