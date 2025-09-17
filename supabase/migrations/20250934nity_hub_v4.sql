-- Community Hub v4: Slack user mapping on users table

alter table if exists users
  add column if not exists slack_user_id text;


