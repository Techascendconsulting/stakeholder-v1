/**
 * Vercel Serverless Function: Question Evaluation
 * Uses GPT-4o-mini for fast, cost-effective evaluation
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
      currentStage, // 'kickoff' | 'problem_exploration' | 'as_is' | 'to_be' | 'wrap_up'
      projectContext,
      conversationHistory
    } = req.body;

    if (!userQuestion || !currentStage) {
      return res.status(400).json({
        error: 'Missing required fields: userQuestion, currentStage'
      });
    }

    // Load system prompt
    const promptPath = path.join(process.cwd(), 'prompts', 'question-evaluation-system.txt');
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

${conversationHistory && conversationHistory.length > 0 ? `
RECENT CONVERSATION (last 3 exchanges):
${conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

Evaluate the user's question and return JSON with verdict, score, breakdown, reasons, and suggested_rewrite.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: contextualPrompt },
        { role: 'user', content: `Evaluate: "${userQuestion}"` }
      ],
      temperature: 0.3, // Lower temperature for consistent scoring
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    let evaluation;

    try {
      evaluation = JSON.parse(response);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      evaluation = {
        verdict: 'AMBER',
        overall_score: 50,
        breakdown: {
          stage_alignment: 15,
          question_type: 15,
          specificity: 10,
          neutrality: 10
        },
        triggers: ['PARSE_ERROR'],
        reasons: ['Unable to parse evaluation response'],
        suggested_rewrite: userQuestion
      };
    }

    // Ensure verdict is uppercase
    evaluation.verdict = evaluation.verdict?.toUpperCase() || 'AMBER';

    return res.status(200).json({
      success: true,
      question_evaluation: evaluation,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Question Evaluation API Error:', error);
    return res.status(500).json({
      error: 'Failed to evaluate question',
      details: error.message
    });
  }
}

