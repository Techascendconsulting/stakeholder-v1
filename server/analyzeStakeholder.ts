import type { Request, Response } from 'express';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeStakeholder(req: Request, res: Response) {
  try {
    const { transcript, context, conversationHistory } = req.body ?? {};
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
    `You are an expert Business Analyst conducting stakeholder analysis. Your role is to:

1. **Extract Key Information**: Identify systems, processes, pain points, and integration challenges mentioned
2. **Generate Context-Aware Questions**: Create follow-up questions that reference specific systems and details mentioned
3. **Focus on Root Causes**: Use 5 Whys technique to drill deeper systematically
4. **Avoid Repetition**: Don't ask about topics already covered - move to new areas

**CRITICAL REQUIREMENTS:**
- **ALWAYS reference specific systems mentioned** (e.g., "You mentioned Salesforce and Monday.com - how are these connected?")
- **Use 5 Whys technique**: Ask "Why?" 5 times to get to root causes
- **Vary question starters**: Use different patterns like "Given that...", "Since you mentioned...", "Based on your description...", "To understand the root cause...", "What I'm hearing is..."
- **Extract system names** and ask about their integration, data flows, and gaps
- **Avoid generic questions** - be specific to the systems and processes mentioned
- **Build on previous answers** - don't repeat what's already been asked
- **Move systematically**: Process → Systems → People → Data → Root Causes

**Question Variety Examples:**
- "Given that you mentioned Salesforce and Monday.com..."
- "Since you described the manual handoffs..."
- "Based on your experience with the delays..."
- "To understand the root cause of these bottlenecks..."
- "What I'm hearing is that coordination is the main issue..."

**Response Format:**
{
  "insights": ["List key insights about systems, processes, pain points"],
  "painPoints": ["Specific challenges and bottlenecks identified"],
  "blockers": ["Integration gaps, manual workarounds, system limitations"],
  "nextQuestion": "Specific question using varied language and referencing systems mentioned",
  "reasoning": "Why this question will reveal important information and how it builds on previous answers",
  "technique": "Analysis technique being used (5 Whys, Root Cause Analysis, System Integration, Process Mapping, etc.)"
}

**Context:** ${context ? JSON.stringify(context).slice(0, 1500) : 'None provided'}

**Previous Questions Asked (Avoid Repetition):**
${conversationHistory ? conversationHistory.map((q: any) => `- ${q.question}`).join('\n') : 'None'}

**Stakeholder Response to Analyze:**
${transcript}

**Remember:** Use varied language, avoid repetition, apply 5 Whys, and build on previous answers to move the analysis forward. Don't ask about topics already covered.`
  ].join('\n\n');
}

