-- Suspicious vote records produced by the anomaly detector.
-- High-severity rows are excluded from the People's Choice tally in
-- winnersController.js.
create table if not exists vote_flags (
  id              uuid primary key default gen_random_uuid(),
  vote_id         uuid,
  project_id      uuid not null references projects(id) on delete cascade,
  browser_token   uuid,
  ip              text,
  user_agent_hash text,
  score           integer not null,
  severity        text not null check (severity in ('low','medium','high')),
  reasons         jsonb not null default '[]'::jsonb,
  created_at      timestamptz default now()
);

create index if not exists vote_flags_project_idx     on vote_flags (project_id);
create index if not exists vote_flags_severity_idx    on vote_flags (severity);
create index if not exists vote_flags_created_at_idx  on vote_flags (created_at desc);
