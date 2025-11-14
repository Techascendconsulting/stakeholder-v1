/**
 * Vercel Serverless Function: AI Stakeholder Response Generation
 * Generates realistic stakeholder responses for practice sessions
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      stakeholderProfile, 
      conversationHistory, 
      userQuestion,
      context 
    } = req.body;

    if (!stakeholderProfile || !userQuestion) {
      return res.status(400).json({ 
        error: 'Missing required fields: stakeholderProfile, userQuestion' 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are roleplaying as ${stakeholderProfile.name}, a ${stakeholderProfile.role} at ${stakeholderProfile.company || 'the organization'}.

Personality: ${stakeholderProfile.personality || 'Professional and helpful'}
Communication Style: ${stakeholderProfile.communicationStyle || 'Clear and direct'}
Goals: ${stakeholderProfile.goals || 'Support the project'}
Concerns: ${stakeholderProfile.concerns || 'None specified'}

Context: ${context || 'Initial stakeholder interview'}

Respond naturally as this character would, staying in role. Be realistic - sometimes be vague, sometimes have conflicting priorities, sometimes need clarification.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: userQuestion }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.8,
      max_tokens: 250,
    });

    return res.status(200).json({
      success: true,
      response: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error('Stakeholder Response Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate stakeholder response',
      details: error.message 
    });
  }
}



