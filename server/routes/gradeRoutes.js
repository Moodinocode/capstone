import express from 'express';
import { getMyGrades, getGradeForProject, saveDraft, submitGrade } from '../controllers/gradeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/my', getMyGrades);
router.get('/:projectId', getGradeForProject);
router.put('/:projectId/draft', saveDraft);
router.post('/:projectId/submit', submitGrade);
export default router;
