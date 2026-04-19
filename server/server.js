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
import winnersRoutes from './routes/winnersRoutes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/winners', winnersRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
