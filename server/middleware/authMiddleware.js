import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: judge } = await supabase
      .from('judges')
      .select('id, name, email, is_admin')
      .eq('id', decoded.id)
      .single();

    if (!judge) return res.status(401).json({ message: 'Judge not found' });

    const { data: assignments } = await supabase
      .from('judge_projects')
      .select('project_id')
      .eq('judge_id', judge.id);

    req.judge = {
      _id: judge.id,
      name: judge.name,
      email: judge.email,
      isAdmin: judge.is_admin,
      assignedProjects: assignments?.map((a) => a.project_id) ?? [],
    };

    next();
  } catch (err) {
    // JWT errors (TokenExpiredError, JsonWebTokenError) → 401.
    // Other errors propagate so the global handler logs them.
    if (err?.name === 'TokenExpiredError' || err?.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    logger.error({ err: err.message }, 'auth middleware unexpected');
    next(err);
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.judge?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
