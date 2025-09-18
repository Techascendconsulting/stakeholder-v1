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

    const { channel, text, blocks } = await req.json();
    if (!channel || !text) {
      return new Response(JSON.stringify({ error: 'Missing channel or text' }), { status: 400, headers: corsHeaders });
    }

    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel, text, blocks })
    });

    const data = await res.json();
    if (!data.ok) {
      return new Response(JSON.stringify({ error: data.error || 'Slack API error' }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true, ts: data.ts }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});


