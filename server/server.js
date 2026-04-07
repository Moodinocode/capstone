import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';

const app = express();

app.use(helmet());
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/schedule', scheduleRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
