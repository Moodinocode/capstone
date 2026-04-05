import supabase from '../config/supabase.js';

const shapeSession = (row) => ({
  _id: row.id,
  key: row.key,
  isEventLive: row.is_event_live,
  nowPlaying: row.now_playing ?? {},
  upNext: row.up_next ?? {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getSession = async (req, res) => {
  let { data } = await supabase
    .from('live_sessions').select('*').eq('key', 'main').single();

  if (!data) {
    const { data: created } = await supabase
      .from('live_sessions').insert({ key: 'main' }).select().single();
    data = created;
  }

  res.json(shapeSession(data));
};

export const updateSession = async (req, res) => {
  const { nowPlaying, upNext, isEventLive } = req.body;

  const { data, error } = await supabase
    .from('live_sessions')
    .upsert(
      {
        key: 'main',
        now_playing: nowPlaying,
        up_next: upNext,
        is_event_live: isEventLive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(shapeSession(data));
};
