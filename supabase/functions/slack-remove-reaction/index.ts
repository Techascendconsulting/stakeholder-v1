import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const { channel, ts, emoji } = await req.json();

    if (!channel || !ts || !emoji) {
      return new Response(JSON.stringify({ success: false, error: 'Missing channel, ts, or emoji' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("SLACK_BOT_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'SLACK_BOT_TOKEN not configured' }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://slack.com/api/reactions.remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, timestamp: ts, name: emoji }),
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Slack API error');

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});


















