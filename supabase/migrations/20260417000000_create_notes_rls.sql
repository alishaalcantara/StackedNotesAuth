-- Create notes table
create table if not exists notes (
  id          text        primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  title       text        not null default '',
  content     text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  view_count  integer     not null default 0,
  is_bookmarked boolean   not null default false,
  deleted_at  timestamptz
);

-- Indexes
create index if not exists notes_user_id_idx        on notes (user_id);
create index if not exists notes_user_deleted_idx   on notes (user_id, deleted_at);

-- Enable Row Level Security
alter table notes enable row level security;

-- SELECT: users can only read their own notes
create policy "notes_select_own"
  on notes for select
  using (auth.uid() = user_id);

-- INSERT: users can only insert rows for themselves
create policy "notes_insert_own"
  on notes for insert
  with check (auth.uid() = user_id);

-- UPDATE: users can only update their own rows
create policy "notes_update_own"
  on notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: users can only delete their own rows
create policy "notes_delete_own"
  on notes for delete
  using (auth.uid() = user_id);
