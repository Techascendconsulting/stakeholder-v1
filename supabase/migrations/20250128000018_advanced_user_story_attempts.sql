-- Create advanced_user_story_attempts table for storing advanced practice sessions
create table advanced_user_story_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  scenario_id text not null,
  step integer not null default 1,
  user_story text not null,
  acceptance_criteria jsonb default '[]'::jsonb,
  feedback_history jsonb default '{}'::jsonb,
  advanced_metadata jsonb default '{}'::jsonb,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index idx_advanced_attempts_user_id on advanced_user_story_attempts(user_id);
create index idx_advanced_attempts_scenario_id on advanced_user_story_attempts(scenario_id);
create index idx_advanced_attempts_completed on advanced_user_story_attempts(completed);
create index idx_advanced_attempts_created_at on advanced_user_story_attempts(created_at desc);
create index idx_advanced_attempts_user_scenario on advanced_user_story_attempts(user_id, scenario_id);

-- Enable Row Level Security
alter table advanced_user_story_attempts enable row level security;

-- Create policies
-- Users can only see their own advanced attempts
create policy "Users can view own advanced attempts" on advanced_user_story_attempts
  for select using (auth.uid() = user_id);

-- Users can insert their own advanced attempts
create policy "Users can insert own advanced attempts" on advanced_user_story_attempts
  for insert with check (auth.uid() = user_id);

-- Users can update their own advanced attempts
create policy "Users can update own advanced attempts" on advanced_user_story_attempts
  for update using (auth.uid() = user_id);

-- Users can delete their own advanced attempts
create policy "Users can delete own advanced attempts" on advanced_user_story_attempts
  for delete using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function update_advanced_attempts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_advanced_user_story_attempts_updated_at
  before update on advanced_user_story_attempts
  for each row
  execute function update_advanced_attempts_updated_at();




