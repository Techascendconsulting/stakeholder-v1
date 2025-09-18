// Supabase Edge Function: create-slack-channel
// Deno runtime
// Set SLACK_BOT_TOKEN as an environment variable in Supabase Functions settings

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface SlackCreateResponse {
  ok: boolean;
  error?: string;
  channel?: { id: string; name: string };
}

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const token = Deno.env.get('SLACK_BOT_TOKEN');
    if (!token) {
      return new Response(JSON.stringify({ error: 'SLACK_BOT_TOKEN not configured' }), { status: 500 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400 });
    }

    const channelName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const res = await fetch('https://slack.com/api/conversations.create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: channelName, is_private: false })
    });

    const data = (await res.json()) as SlackCreateResponse;
    if (!data.ok || !data.channel?.id) {
      return new Response(JSON.stringify({ error: data.error || 'Slack API error' }), { status: 400 });
    }

    return new Response(JSON.stringify({ id: data.channel.id, name: data.channel.name }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});


