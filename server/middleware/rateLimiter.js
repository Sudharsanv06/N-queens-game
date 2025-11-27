import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const hintLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many hint requests. Please wait a moment before trying again.'
  },
  keyGenerator: (req) => {
    return req.body.sessionId || ipKeyGenerator(req);
  },
  skip: (req) => {
    return !req.body.sessionId;
  }
});

const saveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many save requests. Please slow down.'
  },
  keyGenerator: (req) => {
    if (req.user?.id) return `user-${req.user.id}`;
    if (req.body.sessionId) return `session-${req.body.sessionId}`;
    return ipKeyGenerator(req);
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  },
  keyGenerator: (req) => ipKeyGenerator(req)
});

export default {
  hintLimiter,
  saveLimiter,
  generalLimiter
};
