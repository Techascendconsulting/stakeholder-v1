-- Create practice_user_stories table for storing user practice sessions
create table practice_user_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  scenario_id text not null,
  user_story text not null,
  acceptance_criteria jsonb default '[]'::jsonb,
  feedback_result jsonb default '{}'::jsonb,
  current_step integer default 0,
  status text default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index idx_practice_user_stories_user_id on practice_user_stories(user_id);
create index idx_practice_user_stories_scenario_id on practice_user_stories(scenario_id);
create index idx_practice_user_stories_status on practice_user_stories(status);
create index idx_practice_user_stories_created_at on practice_user_stories(created_at desc);

-- Enable Row Level Security
alter table practice_user_stories enable row level security;

-- Create policies
-- Users can only see their own practice stories
create policy "Users can view own practice stories" on practice_user_stories
  for select using (auth.uid() = user_id);

-- Users can insert their own practice stories
create policy "Users can insert own practice stories" on practice_user_stories
  for insert with check (auth.uid() = user_id);

-- Users can update their own practice stories
create policy "Users can update own practice stories" on practice_user_stories
  for update using (auth.uid() = user_id);

-- Users can delete their own practice stories
create policy "Users can delete own practice stories" on practice_user_stories
  for delete using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_practice_user_stories_updated_at
  before update on practice_user_stories
  for each row
  execute function update_updated_at_column();


