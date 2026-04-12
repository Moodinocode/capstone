import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

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
  } catch {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.judge?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
