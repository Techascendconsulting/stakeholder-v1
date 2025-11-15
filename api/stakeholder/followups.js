/**
 * Vercel Serverless Function: Follow-up Question Generation
 * Uses GPT-4o-mini for cost-effective follow-up suggestions
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      stakeholderResponse,
      currentStage,
      conversationHistory,
      projectContext
    } = req.body;

    if (!stakeholderResponse) {
      return res.status(400).json({
        error: 'Missing required field: stakeholderResponse'
      });
    }

    // Load system prompt
    const promptPath = path.join(process.cwd(), 'prompts', 'followup-system.txt');
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'Server configuration error: OPENAI_API_KEY is missing',
        details: 'Please add OPENAI_API_KEY to your .env.local file'
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const contextualPrompt = `${systemPrompt}

CURRENT CONTEXT:
- Stage: ${currentStage}
- Project: ${projectContext?.name || 'Customer Onboarding Optimization'}
- Stakeholder Response: "${stakeholderResponse}"

${conversationHistory && conversationHistory.length > 0 ? `
RECENT CONVERSATION:
${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

Generate exactly 3 follow-up questions. Return JSON array with type, question, and rationale.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: contextualPrompt },
        { role: 'user', content: `Generate follow-ups for: "${stakeholderResponse}"` }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    let followUps;

    try {
      const parsed = JSON.parse(response);
      // Handle both { follow_ups: [...] } and direct array
      followUps = parsed.follow_ups || parsed.suggested_follow_ups || parsed;
      
      // Ensure it's an array
      if (!Array.isArray(followUps)) {
        followUps = Object.values(followUps).filter(item => item && typeof item === 'object');
      }
      
      // Ensure exactly 3
      if (followUps.length > 3) followUps = followUps.slice(0, 3);
      if (followUps.length < 3) {
        // Generate fallback questions
        const fallbacks = [
          { type: 'probe_deeper', question: 'Can you elaborate on that?', rationale: 'Digging deeper into the response' },
          { type: 'clarify', question: 'What does that look like in practice?', rationale: 'Seeking concrete examples' },
          { type: 'explore_impact', question: 'How does this impact your team?', rationale: 'Understanding broader implications' }
        ];
        followUps = [...followUps, ...fallbacks.slice(0, 3 - followUps.length)];
      }
    } catch (parseError) {
      // Fallback follow-ups
      followUps = [
        { type: 'probe_deeper', question: 'Can you give me a specific example?', rationale: 'Probing for concrete details' },
        { type: 'clarify', question: 'What does that look like in practice?', rationale: 'Seeking practical understanding' },
        { type: 'explore_impact', question: 'How does this affect your daily work?', rationale: 'Understanding impact' }
      ];
    }

    return res.status(200).json({
      success: true,
      suggested_follow_ups: followUps,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Follow-ups API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate follow-up questions',
      details: error.message
    });
  }
}

