/**
 * Vercel Serverless Function: OpenAI Chat Completion
 * Handles general chat/completion requests from frontend
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 150 } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    // Initialize OpenAI client with server-side API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    // Return the response
    return res.status(200).json({
      success: true,
      message: completion.choices[0].message.content,
      usage: completion.usage,
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
}


