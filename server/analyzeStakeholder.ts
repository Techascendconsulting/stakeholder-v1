import type { Request, Response } from 'express';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeStakeholder(req: Request, res: Response) {
  try {
    const { transcript, context } = req.body ?? {};
    if (!transcript) return res.status(400).json({ error: 'Missing transcript' });

    const started = Date.now();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'You are a BA stakeholder analysis assistant.' },
        { role: 'user', content: buildPrompt(transcript, context) },
      ],
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(502).json({ error: 'Empty completion' });

    res.json({ analysis: text, latencyMs: Date.now() - started, model: completion.model });
  } catch (e: any) {
    res.status(e?.status ?? 500).json({ error: e?.message ?? 'OpenAI call failed', code: e?.code, type: e?.type });
  }
}

function buildPrompt(transcript: string, context?: any) {
  return [
    'Analyze the stakeholder response. List concerns, risks, and 3 next best BA questions.',
    context ? `Context:\n${JSON.stringify(context).slice(0, 1500)}` : '',
    'Response:',
    transcript,
  ].filter(Boolean).join('\n\n');
}
