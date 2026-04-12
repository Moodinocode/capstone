-- =============================================
-- Spotlight LAU Capstone -- Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================

-- Judges (users who log in and grade projects)
CREATE TABLE judges (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  is_admin      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Projects (pitches, TED talks, and interviews — distinguished by segment_type)
CREATE TABLE projects (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_number TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  team_name      TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT DEFAULT '',
  members        JSONB DEFAULT '[]',
  image_url      TEXT DEFAULT '',
  video_url      TEXT DEFAULT '',
  document_url   TEXT DEFAULT '',
  zoom_link      TEXT DEFAULT '',
  is_live        BOOLEAN DEFAULT false,
  vote_count     INTEGER DEFAULT 0,
  tags           TEXT[] DEFAULT '{}',
  segment_type   TEXT NOT NULL DEFAULT 'project'
                   CHECK (segment_type IN ('project','ted_talk','interview')),
  is_seeded      BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Which projects are assigned to which judge
CREATE TABLE judge_projects (
  judge_id   UUID REFERENCES judges(id)   ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (judge_id, project_id)
);

-- Grades submitted by judges for projects
CREATE TABLE grades (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judge_id           UUID REFERENCES judges(id)   NOT NULL,
  project_id         UUID REFERENCES projects(id) NOT NULL,
  score_innovation   NUMERIC(4,1),
  score_soft_skills  NUMERIC(4,1),
  score_presentation NUMERIC(4,1),
  score_viability    NUMERIC(4,1),
  total_score        NUMERIC(5,1) DEFAULT 0,
  feedback           TEXT DEFAULT '',
  status             TEXT DEFAULT 'not_started'
                       CHECK (status IN ('not_started','in_progress','submitted')),
  last_saved_at      TIMESTAMPTZ,
  submitted_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (judge_id, project_id)
);

-- Audience votes (one per browser token)
CREATE TABLE votes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    UUID REFERENCES projects(id) NOT NULL,
  browser_token TEXT UNIQUE NOT NULL,
  ip_address    TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Single live event session state
CREATE TABLE live_sessions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key            TEXT UNIQUE DEFAULT 'main',
  is_event_live  BOOLEAN DEFAULT false,
  now_playing    JSONB DEFAULT '{}',
  up_next        JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Event program schedule (opening, TED talks, pitches, breaks, closing)
CREATE TABLE schedule_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order INTEGER NOT NULL,
  time       TEXT NOT NULL,
  label      TEXT NOT NULL,
  type       TEXT NOT NULL,
  start_time TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helper function to atomically increment vote count
CREATE OR REPLACE FUNCTION increment_vote_count(p_id UUID)
RETURNS VOID AS $$
  UPDATE projects SET vote_count = vote_count + 1 WHERE id = p_id;
$$ LANGUAGE SQL;
