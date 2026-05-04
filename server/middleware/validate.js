import { z } from 'zod';

/**
 * Generic validator. Pass a partial schema { body, query, params } —
 * each one optional. Replaces the matching req.* with the parsed value.
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body)   req.body   = schemas.body.parse(req.body ?? {});
    if (schemas.query)  req.query  = schemas.query.parse(req.query ?? {});
    if (schemas.params) req.params = schemas.params.parse(req.params ?? {});
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request',
        issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
};

// ────────────────────────────────────────────────
// Schemas — colocated so adding a new endpoint = one place.
// ────────────────────────────────────────────────
export const schemas = {
  login: {
    body: z.object({
      // Relaxed: must look like `local@host` but does not require a TLD,
      // because the seeded judges use internal addresses like
      // `emilie@softskills` (no `.com`).
      email: z.string().regex(/^[^\s@]+@[^\s@]+$/i).max(120),
      password: z.string().min(1).max(200),
    }),
  },
  voteInit: {
    body: z.object({
      browserToken: z.string().uuid(),
    }),
  },
  voteCast: {
    body: z.object({
      projectId: z.string().uuid(),
      browserToken: z.string().uuid(),
      voteToken: z.string().min(10).max(400).optional(),
    }),
  },
  voteCheckParam: {
    params: z.object({ token: z.string().uuid() }),
  },
  gradeBody: {
    body: z.object({
      scores: z.object({
        c1: z.number().min(0).max(5).nullable().optional(),
        c2: z.number().min(0).max(5).nullable().optional(),
        c3: z.number().min(0).max(5).nullable().optional(),
        c4: z.number().min(0).max(5).nullable().optional(),
        c5: z.number().min(0).max(5).nullable().optional(),
      }).default({}),
      feedback: z.string().max(5000).optional(),
    }),
    params: z.object({ projectId: z.string().uuid() }),
  },
  sessionUpdate: {
    body: z.object({
      nowPlaying: z.record(z.any()).optional(),
      upNext: z.record(z.any()).optional(),
      isEventLive: z.boolean().optional(),
    }),
  },
  sessionToggleBool: (key) => ({
    body: z.object({ [key]: z.boolean() }),
  }),
  aiInsightsParam: {
    params: z.object({ projectId: z.string().uuid() }),
  },
};
