/**
 * Vercel Serverless Function: Verity Chat
 * Handles Verity AI assistant chat requests
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for auth verification
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication token required' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase
    if (supabase) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        console.error('Auth verification failed:', authError);
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid authentication token' 
        });
      }
    }

    const { messages, context } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request: messages array required' 
      });
    }

    // Initialize OpenAI client
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(503).json({ 
        error: 'OpenAI service unavailable',
        message: 'OpenAI API key not configured' 
      });
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    console.log('🤖 Verity chat request received:', {
      messageCount: messages.length,
      context: context?.pageTitle
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300
    });

    const reply_text = completion.choices[0]?.message?.content || 
      "I'm having trouble right now. Let me notify Tech Ascend Consulting so they can help you directly.";

    console.log('✅ Verity response generated:', reply_text.substring(0, 50) + '...');

    // Return response in the format expected by frontend
    return res.status(200).json({
      reply: reply_text,
      escalate: false
    });

  } catch (error) {
    console.error('❌ Error in verity-chat:', error);
    return res.status(500).json({ 
      error: 'Failed to get response from Verity',
      details: error.message 
    });
  }
}

