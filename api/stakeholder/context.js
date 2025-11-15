/**
 * Vercel Serverless Function: Context Memory Update
 * Uses GPT-4o-mini to analyze conversation and update context
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
      conversationHistory,
      currentStage,
      projectContext
    } = req.body;

    if (!conversationHistory || !currentStage) {
      return res.status(400).json({
        error: 'Missing required fields: conversationHistory, currentStage'
      });
    }

    // Load system prompt
    const promptPath = path.join(process.cwd(), 'prompts', 'context-memory-system.txt');
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

FULL CONVERSATION:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Analyze the conversation and return JSON with topics_covered, pain_points_identified, information_layers_unlocked, stage_progress, should_transition, and next_milestone.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: contextualPrompt },
        { role: 'user', content: 'Analyze conversation and update context.' }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    let contextUpdate;

    try {
      contextUpdate = JSON.parse(response);
    } catch (parseError) {
      // Fallback context
      contextUpdate = {
        topics_covered: [],
        pain_points_identified: [],
        information_layers_unlocked: 1,
        stage_progress: {},
        should_transition: false,
        next_milestone: 'Continue gathering information'
      };
    }

    return res.status(200).json({
      success: true,
      context_updates: contextUpdate,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Context API Error:', error);
    return res.status(500).json({
      error: 'Failed to update context',
      details: error.message
    });
  }
}

