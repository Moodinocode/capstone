import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const shapeJudge = async (row) => {
  const { data: assignments } = await supabase
    .from('judge_projects')
    .select('project_id')
    .eq('judge_id', row.id);

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    isAdmin: row.is_admin,
    assignedProjects: assignments?.map((a) => a.project_id) ?? [],
  };
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const { data: judge } = await supabase
    .from('judges')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (!judge || !(await bcrypt.compare(password, judge.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(judge.id);
  const shaped = await shapeJudge(judge);
  res.json({ token, judge: shaped });
};

export const getMe = async (req, res) => {
  res.json(req.judge);
};
