import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, "Access-Control-Allow-Methods": "POST, OPTIONS" } });
  }
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    const token = Deno.env.get('SLACK_BOT_TOKEN');
    if (!token) {
      return new Response(JSON.stringify({ error: 'SLACK_BOT_TOKEN not configured' }), { status: 500, headers: corsHeaders });
    }

    const { channel, ts, text } = await req.json();
    if (!channel || !ts || !text) {
      return new Response(JSON.stringify({ error: 'Missing channel, ts or text' }), { status: 400, headers: corsHeaders });
    }

    const res = await fetch('https://slack.com/api/chat.update', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, ts, text })
    });
    const data = await res.json();
    if (!data.ok) {
      return new Response(JSON.stringify({ error: data.error || 'Slack API error' }), { status: 400, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});



