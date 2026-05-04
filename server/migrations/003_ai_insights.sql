-- Cached LLM-generated advisory insights per project.
create table if not exists ai_insights (
  project_id  uuid primary key references projects(id) on delete cascade,
  model       text not null,
  payload     jsonb not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
