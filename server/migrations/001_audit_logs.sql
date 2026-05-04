-- Append-only log of every privileged write. Read by /admin/audit-log.
create table if not exists audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_type   text not null,           -- 'judge' | 'system' | 'public'
  actor_id     uuid,                    -- judge id when applicable
  action       text not null,           -- e.g. 'grade.submit', 'session.set_public'
  target_type  text,                    -- 'project' | 'session' | ...
  target_id    text,
  metadata     jsonb default '{}'::jsonb,
  ip           text,
  created_at   timestamptz default now()
);

create index if not exists audit_logs_action_idx     on audit_logs (action);
create index if not exists audit_logs_actor_idx      on audit_logs (actor_id);
create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);
