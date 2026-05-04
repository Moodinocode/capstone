import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './middleware/errorHandler.js';
import logger, { httpLogger } from './utils/logger.js';
import { apiLimiter } from './middleware/limits.js';
import asyncHandler from './utils/asyncHandler.js';
import supabase from './config/supabase.js';
import { cache } from './utils/cache.js';
import { clientCount } from './services/eventBus.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import winnersRoutes from './routes/winnersRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// ── core middleware ────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '256kb' }));
app.use(httpLogger);
app.use('/api', apiLimiter);

// ── routes ─────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/grades',   gradeRoutes);
app.use('/api/votes',    voteRoutes);
app.use('/api/session',  sessionRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/winners',  winnersRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/admin',    adminRoutes);

// ── deep health probe — pings the DB so /api/health doubles as a
//    liveness AND readiness check, and surfaces useful runtime metrics.
app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    const t0 = Date.now();
    let dbMs = null;
    let dbOk = false;
    try {
      const { error } = await supabase
        .from('projects').select('id', { head: true, count: 'exact' }).limit(1);
      dbMs = Date.now() - t0;
      dbOk = !error;
    } catch {
      dbOk = false;
    }
    const mem = process.memoryUsage();
    res.json({
      status: dbOk ? 'ok' : 'degraded',
      uptimeSec: Math.round(process.uptime()),
      db: { ok: dbOk, latencyMs: dbMs },
      memory: {
        rssMb:       +(mem.rss / 1024 / 1024).toFixed(1),
        heapUsedMb:  +(mem.heapUsed / 1024 / 1024).toFixed(1),
        heapTotalMb: +(mem.heapTotal / 1024 / 1024).toFixed(1),
      },
      cache: cache.stats(),
      sseClients: clientCount(),
      timestamp: new Date().toISOString(),
    });
  }),
);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logger.info({ port: PORT }, 'server.listening'));

export default app;
