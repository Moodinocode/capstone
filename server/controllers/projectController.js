import supabase from '../config/supabase.js';

const shapeProject = (row) => ({
  _id: row.id,
  projectNumber: row.project_number,
  title: row.title,
  teamName: row.team_name,
  category: row.category,
  description: row.description,
  members: row.members ?? [],
  imageUrl: row.image_url,
  videoUrl: row.video_url,
  documentUrl: row.document_url,
  zoomLink: row.zoom_link,
  isLive: row.is_live,
  voteCount: row.vote_count,
  tags: row.tags ?? [],
  segmentType: row.segment_type ?? 'project',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getProjects = async (req, res) => {
  const { category, search, page = 1, limit = 50, segmentType } = req.query;

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('project_number', { ascending: true })
    .range((page - 1) * limit, page * limit - 1);

  // Public gallery only shows pitches; judges can request other types
  query = query.eq('segment_type', segmentType ?? 'project');

  if (category && category !== 'All') query = query.eq('category', category);
  if (search) {
    query = query.or(`title.ilike.%${search}%,team_name.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error('[getProjects] Supabase error:', error);
    return res.status(500).json({ message: error.message });
  }

  res.json({ projects: data.map(shapeProject), total: count, page: Number(page) });
};

export const getProjectById = async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Project not found' });
  res.json(shapeProject(data));
};

export const createProject = async (req, res) => {
  const b = req.body;
  const { data, error } = await supabase
    .from('projects')
    .insert({
      project_number: b.projectNumber,
      title: b.title,
      team_name: b.teamName,
      category: b.category,
      description: b.description ?? '',
      members: b.members ?? [],
      image_url: b.imageUrl ?? '',
      video_url: b.videoUrl ?? '',
      document_url: b.documentUrl ?? '',
      zoom_link: b.zoomLink ?? '',
      is_live: b.isLive ?? false,
      tags: b.tags ?? [],
    })
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(shapeProject(data));
};

export const updateProject = async (req, res) => {
  const b = req.body;
  const updates = { updated_at: new Date().toISOString() };

  if (b.projectNumber !== undefined) updates.project_number = b.projectNumber;
  if (b.title !== undefined) updates.title = b.title;
  if (b.teamName !== undefined) updates.team_name = b.teamName;
  if (b.category !== undefined) updates.category = b.category;
  if (b.description !== undefined) updates.description = b.description;
  if (b.members !== undefined) updates.members = b.members;
  if (b.imageUrl !== undefined) updates.image_url = b.imageUrl;
  if (b.videoUrl !== undefined) updates.video_url = b.videoUrl;
  if (b.documentUrl !== undefined) updates.document_url = b.documentUrl;
  if (b.zoomLink !== undefined) updates.zoom_link = b.zoomLink;
  if (b.isLive !== undefined) updates.is_live = b.isLive;
  if (b.tags !== undefined) updates.tags = b.tags;
  if (b.voteCount !== undefined) updates.vote_count = b.voteCount;

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ message: 'Project not found' });
  res.json(shapeProject(data));
};
