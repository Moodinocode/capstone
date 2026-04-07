import supabase from '../config/supabase.js';

export const getSchedule = async (req, res) => {
  const { data, error } = await supabase
    .from('schedule_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });

  const items = data.map((row) => ({
    id:        row.id,
    sortOrder: row.sort_order,
    time:      row.time,       // display string e.g. "09:00"
    startTime: row.start_time, // "HH:MM:SS" for status calculation
    label:     row.label,
    type:      row.type,
  }));

  res.json({ items });
};
