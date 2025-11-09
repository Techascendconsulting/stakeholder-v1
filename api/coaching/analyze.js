/**
 * Vercel Serverless Function: Coaching Analysis
 * Analyzes user responses and provides coaching feedback
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage, context, coachingType = 'general' } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'Missing userMessage' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let systemPrompt = '';
    
    switch (coachingType) {
      case 'greeting':
        systemPrompt = 'You are a Business Analyst coach helping users improve their stakeholder greeting skills. Provide constructive feedback on professionalism, clarity, and relationship building.';
        break;
      case 'questioning':
        systemPrompt = 'You are a Business Analyst coach helping users improve their elicitation questioning techniques. Evaluate if questions are open-ended, focused, and effective.';
        break;
      case 'problem-exploration':
        systemPrompt = 'You are a Business Analyst coach helping users explore business problems systematically. Guide them to dig deeper and uncover root causes.';
        break;
      default:
        systemPrompt = 'You are an expert Business Analyst coach providing constructive feedback to help learners improve their BA skills.';
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${context || 'None'}\n\nUser input: ${userMessage}\n\nProvide brief, actionable coaching feedback.` }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 200,
    });

    return res.status(200).json({
      success: true,
      feedback: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error('Coaching Analysis Error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze for coaching',
      details: error.message 
    });
  }
}


