import rateLimit from 'express-rate-limit';

// Per-IP login limit — defends against credential stuffing.
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait a minute.' },
});

// Per-IP voting limit — public endpoint, must be tight.
export const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many votes from this address.' },
});

// Per-judge grading limit — keyed on the JWT-validated judge id, not IP,
// so multiple judges behind one NAT aren't penalised.
export const gradeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.judge?._id || req.ip,
  message: { message: 'Too many grading requests, slow down.' },
});

// Coarse global limit — last resort.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});
