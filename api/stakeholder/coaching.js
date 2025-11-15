/**
 * Vercel Serverless Function: Coaching Feedback Generation
 * Uses GPT-4o for pedagogical depth and examples
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
      userQuestion,
      evaluationResult, // From evaluate endpoint
      currentStage,
      projectContext
    } = req.body;

    if (!userQuestion || !evaluationResult) {
      return res.status(400).json({
        error: 'Missing required fields: userQuestion, evaluationResult'
      });
    }

    // Load system prompt
    const promptPath = path.join(process.cwd(), 'prompts', 'coaching-system.txt');
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
- User Question: "${userQuestion}"
- Evaluation Verdict: ${evaluationResult.verdict}
- Evaluation Score: ${evaluationResult.overall_score}/100
- Reasons: ${evaluationResult.reasons?.join(', ') || 'N/A'}

Generate coaching feedback based on the evaluation. Return JSON with all required fields.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: contextualPrompt },
        { role: 'user', content: `Generate coaching for: "${userQuestion}" (${evaluationResult.verdict})` }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    let coaching;

    try {
      coaching = JSON.parse(response);
    } catch (parseError) {
      // Fallback coaching
      coaching = {
        verdict_label: evaluationResult.verdict === 'GREEN' ? '✅ Strong Question' : evaluationResult.verdict === 'AMBER' ? '⚠️ Could Be Better' : '🚨 Needs Realignment',
        summary: `This question is ${evaluationResult.verdict === 'GREEN' ? 'effective' : evaluationResult.verdict === 'AMBER' ? 'partially effective' : 'ineffective'}.`,
        what_happened: `You asked: "${userQuestion}"`,
        why_it_matters: evaluationResult.reasons?.[0] || 'Question quality affects information gathering.',
        what_to_do: evaluationResult.suggested_rewrite ? `Try: "${evaluationResult.suggested_rewrite}"` : 'Refine your question.',
        suggested_rewrite: evaluationResult.suggested_rewrite || null,
        rewrite_explanation: null,
        principle: '🎯 BA Principle: Ask open-ended questions to elicit detailed responses.',
        action: evaluationResult.verdict === 'GREEN' ? 'CONTINUE' : evaluationResult.verdict === 'AMBER' ? 'ACKNOWLEDGE_AND_RETRY' : 'PAUSE_FOR_COACHING',
        acknowledgement_required: evaluationResult.verdict !== 'GREEN'
      };
    }

    return res.status(200).json({
      success: true,
      coaching_feedback: coaching,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Coaching API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate coaching feedback',
      details: error.message
    });
  }
}

