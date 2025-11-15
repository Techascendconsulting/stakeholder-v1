/**
 * Vercel Serverless Function: Stakeholder Response Generation
 * Uses GPT-4o for nuanced stakeholder personality and project context
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
      questionVerdict, // 'GREEN' | 'AMBER' | 'RED'
      currentStage, // 'kickoff' | 'problem_exploration' | 'as_is' | 'to_be' | 'wrap_up'
      stakeholderProfile, // { id, name, role, department, personality, priorities }
      conversationHistory, // Array of { role, content }
      projectContext // { name, challenges, currentState, etc. }
    } = req.body;

    if (!userQuestion || !currentStage || !stakeholderProfile) {
      return res.status(400).json({
        error: 'Missing required fields: userQuestion, currentStage, stakeholderProfile'
      });
    }

    // Load system prompt
    const promptPath = path.join(process.cwd(), 'prompts', 'stakeholder-response-system.txt');
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

    // Build context-aware prompt
    const contextualPrompt = `${systemPrompt}

CURRENT SITUATION:
- Stage: ${currentStage}
- Question Quality: ${questionVerdict}
- Stakeholder: ${stakeholderProfile.name} (${stakeholderProfile.role})
- Project: ${projectContext?.name || 'Customer Onboarding Optimization'}

${conversationHistory && conversationHistory.length > 0 ? `
RECENT CONVERSATION:
${conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

USER'S QUESTION: "${userQuestion}"

Generate the stakeholder's response. Follow response length rules based on question quality (${questionVerdict}).
Return ONLY the response text, no JSON, no metadata.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: contextualPrompt },
        { role: 'user', content: `Respond to: "${userQuestion}"` }
      ],
      temperature: 0.8, // More natural variation
      max_tokens: questionVerdict === 'GREEN' ? 300 : questionVerdict === 'AMBER' ? 150 : 100
    });

    const response = completion.choices[0].message.content.trim();

    // Determine which stakeholder should respond (multi-stakeholder routing)
    const speakerId = determineSpeaker(userQuestion, stakeholderProfile);

    return res.status(200).json({
      success: true,
      stakeholder_response: {
        speaker_id: speakerId,
        speaker_name: stakeholderProfile.name,
        content: response,
        metadata: {
          stage: currentStage,
          emotion: extractEmotion(response),
          information_layer: estimateInformationLayer(response),
          keywords: extractKeywords(response),
          pain_points_revealed: extractPainPoints(response)
        }
      },
      usage: completion.usage
    });

  } catch (error) {
    console.error('Stakeholder Response API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate stakeholder response',
      details: error.message
    });
  }
}

// Helper: Determine which stakeholder should respond
function determineSpeaker(question, selectedStakeholder) {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('customer experience') || lowerQuestion.includes('churn') || lowerQuestion.includes('satisfaction')) {
    return 'james-walker';
  }
  if (lowerQuestion.includes('support') || lowerQuestion.includes('ticket') || lowerQuestion.includes('service')) {
    return 'jess-morgan';
  }
  if (lowerQuestion.includes('system') || lowerQuestion.includes('integration') || lowerQuestion.includes('technical') || lowerQuestion.includes('api')) {
    return 'david-thompson';
  }
  
  // Default to selected stakeholder
  return selectedStakeholder.id || 'james-walker';
}

// Helper: Extract emotion from response
function extractEmotion(response) {
  const lower = response.toLowerCase();
  if (lower.includes('frustrat') || lower.includes('annoy') || lower.includes('difficult')) return 'frustrated';
  if (lower.includes('excit') || lower.includes('optimistic') || lower.includes('hope')) return 'optimistic';
  if (lower.includes('concern') || lower.includes('worr') || lower.includes('risk')) return 'concerned';
  return 'neutral';
}

// Helper: Estimate information layer (1-5)
function estimateInformationLayer(response) {
  const hasNumbers = /\d+/.test(response);
  const hasEmotion = /frustrat|excit|concern|difficult|challeng/.test(response.toLowerCase());
  const hasRootCause = /because|root|underlying|systemic/.test(response.toLowerCase());
  const hasSolutionHint = /could|might|should|try|attempt/.test(response.toLowerCase());
  
  if (hasSolutionHint) return 5;
  if (hasRootCause) return 4;
  if (hasEmotion && hasNumbers) return 3;
  if (hasNumbers) return 2;
  return 1;
}

// Helper: Extract keywords
function extractKeywords(response) {
  const keywords = [];
  const commonTerms = ['onboarding', 'customer', 'process', 'system', 'data', 'manual', 'time', 'challenge', 'frustration'];
  commonTerms.forEach(term => {
    if (response.toLowerCase().includes(term)) keywords.push(term);
  });
  return keywords;
}

// Helper: Extract pain points mentioned
function extractPainPoints(response) {
  const painPoints = [];
  const painIndicators = ['manual', 'disconnect', 'delay', 'frustrat', 'inefficient', 'time-consuming', 'error'];
  painIndicators.forEach(indicator => {
    if (response.toLowerCase().includes(indicator)) {
      painPoints.push(indicator);
    }
  });
  return painPoints;
}

