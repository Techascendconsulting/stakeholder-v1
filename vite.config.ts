import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Explicitly load .env.local for server-side API routes
// Vite automatically loads .env.local for client-side (VITE_ prefixed vars)
// But server-side routes need explicit loading
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log('✅ Loaded .env.local for server-side routes');
}

// Also check for env.local (without dot) for backwards compatibility
const envLocalNoDot = path.resolve(process.cwd(), 'env.local');
if (fs.existsSync(envLocalNoDot)) {
  config({ path: envLocalNoDot });
  console.log('✅ Loaded env.local for server-side routes');
}

// Debug: Log if OPENAI_API_KEY is loaded
if (process.env.OPENAI_API_KEY) {
  console.log('✅ OPENAI_API_KEY is loaded (length:', process.env.OPENAI_API_KEY.length, ')');
} else {
  console.warn('⚠️ OPENAI_API_KEY is NOT loaded from .env.local');
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    {
      name: 'dev-api',
      configureServer(vite) {
        const app = express();
        app.use(bodyParser.json({ limit: '1mb' }));

        app.post('/api/analyzeStakeholder', async (req, res) => {
          try {
            const { transcript, context } = req.body ?? {};
            if (!transcript) return res.status(400).json({ error: 'Missing transcript' });

            // Debug environment variables
            console.log('🔑 Environment check:', {
              hasOpenAIKey: !!process.env.OPENAI_API_KEY,
              hasViteOpenAIKey: !!process.env.VITE_OPENAI_API_KEY,
              keyLength: process.env.OPENAI_API_KEY?.length || 0,
              envKeys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
            });

            // Try to get API key from either source
            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

            // Optional: stub if no key set (lets you test wiring)
            if (!apiKey) {
              console.log('⚠️ No OpenAI API key found, returning stub response');
              return res.json({
                analysis: `STUB: concerns/risks/questions for: "${transcript.slice(0, 140)}..."`,
                model: 'stub',
                latencyMs: 3,
              });
            }

            const client = new OpenAI({ apiKey: apiKey });
            const completion = await client.chat.completions.create({
              model: 'gpt-4o-mini',
              temperature: 0.2,
              max_tokens: 800,
              messages: [
                { role: 'system', content: 'You analyze stakeholder responses for a Business Analyst coach.' },
                { role: 'user', content: buildPrompt(transcript, context) },
              ],
            });

            const text = completion.choices?.[0]?.message?.content?.trim();
            if (!text) return res.status(502).json({ error: 'Empty completion' });

            // Parse JSON response or fallback to simple question
            let parsed;
            try {
              parsed = JSON.parse(text);
            } catch {
              // Fallback if model returns prose instead of JSON
              parsed = {
                next_question: 'Could you walk me through a recent example where this issue showed up?',
                rationale: 'Grounds the discussion in a concrete scenario and reveals specific details.',
                technique: 'Probing'
              };
            }

            // Map server response to component expected format
            const mappedAnalysis = {
              nextQuestion: parsed.next_question || parsed.nextQuestion,
              reasoning: parsed.rationale || parsed.reasoning,
              technique: parsed.technique
            };

            res.json({ analysis: mappedAnalysis, model: completion.model, latencyMs: 0 });
          } catch (e: any) {
            res.status(e?.status ?? 500).json({
              error: e?.message ?? 'OpenAI call failed',
              code: e?.code,
              type: e?.type,
            });
          }
        });

        // Simple server transcription endpoint for iOS (expects base64 audio)
        app.post('/api/transcribe', async (req, res) => {
          try {
            const { audioBase64, mimeType } = req.body ?? {};
            if (!audioBase64) return res.status(400).json({ error: 'Missing audioBase64' });

            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
            if (!apiKey) return res.status(500).json({ error: 'No OpenAI API key configured' });

            const buffer = Buffer.from(audioBase64, 'base64');
            const file = new File([buffer], 'audio.webm', { type: mimeType || 'audio/webm' });

            const client = new OpenAI({ apiKey });
            const transcript = await client.audio.transcriptions.create({
              file,
              model: 'gpt-4o-transcribe',
            } as any);

            // Return plain text
            const text = (transcript as any).text || '';
            return res.json({ text });
          } catch (e: any) {
            console.error('Transcription error:', e?.message || e);
            res.status(e?.status ?? 500).json({ error: e?.message ?? 'Transcription failed' });
          }
        });

        // ============================================
        // NEW ELICITATION ENGINE API ROUTES
        // ============================================
        
        /**
         * Helper function to detect if a message is purely social/greeting
         * Returns true if the message contains only greetings, thanks, or social niceties
         */
        // Question Evaluation Endpoint
        app.post('/api/stakeholder/evaluate', async (req, res) => {
          try {
            const { userQuestion, currentStage, projectContext, conversationHistory } = req.body;
            
            if (!userQuestion || !currentStage) {
              return res.status(400).json({
                error: 'Missing required fields: userQuestion, currentStage'
              });
            }

            // Let OpenAI determine if it's a greeting/social message through the evaluation prompt
            const promptPath = path.join(process.cwd(), 'prompts', 'question-evaluation-system.txt');
            const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

            // Debug: Log environment variable status
            console.log('🔑 API Route - Environment check:', {
              hasOpenAIKey: !!process.env.OPENAI_API_KEY,
              hasViteOpenAIKey: !!process.env.VITE_OPENAI_API_KEY,
              keyLength: process.env.OPENAI_API_KEY?.length || 0,
              allOpenAIKeys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
            });

            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
              console.error('❌ OPENAI_API_KEY is missing in API route');
              return res.status(500).json({
                error: 'Server configuration error: OPENAI_API_KEY is missing',
                details: 'Please add OPENAI_API_KEY to your .env.local file and restart the dev server'
              });
            }

            const openai = new OpenAI({ apiKey });

            const contextualPrompt = `${systemPrompt}

CURRENT CONTEXT:
- Stage: ${currentStage}
- Project: ${projectContext?.name || 'Customer Onboarding Optimization'}
- User Question: "${userQuestion}"

${conversationHistory && conversationHistory.length > 0 ? `
RECENT CONVERSATION (last 3 exchanges):
${conversationHistory.slice(-6).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

Evaluate the user's question and return JSON with verdict, score, breakdown, reasons, and suggested_rewrite.`;

            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: contextualPrompt },
                { role: 'user', content: `Evaluate: "${userQuestion}"` }
              ],
              temperature: 0.3,
              response_format: { type: 'json_object' }
            });

            const response = completion.choices[0].message.content;
            let evaluation;

            try {
              evaluation = JSON.parse(response || '{}');
            } catch (parseError) {
              evaluation = {
                verdict: 'AMBER',
                overall_score: 50,
                breakdown: { stage_alignment: 15, question_type: 15, specificity: 10, neutrality: 10 },
                triggers: ['PARSE_ERROR'],
                reasons: ['Unable to parse evaluation response'],
                suggested_rewrite: userQuestion
              };
            }

            evaluation.verdict = evaluation.verdict?.toUpperCase() || 'AMBER';

            res.json({
              success: true,
              question_evaluation: evaluation,
              usage: completion.usage
            });
          } catch (error: any) {
            console.error('Question Evaluation API Error:', error);
            res.status(500).json({
              error: 'Failed to evaluate question',
              details: error.message
            });
          }
        });

        // Coaching Feedback Endpoint
        app.post('/api/stakeholder/coaching', async (req, res) => {
          try {
            const { userQuestion, evaluationResult, currentStage, projectContext } = req.body;

            if (!userQuestion || !evaluationResult) {
              return res.status(400).json({
                error: 'Missing required fields: userQuestion, evaluationResult'
              });
            }

            // Let OpenAI generate coaching for all verdicts, including greetings
            // This ensures users understand why greetings are appropriate in stakeholder meetings

            const promptPath = path.join(process.cwd(), 'prompts', 'coaching-system.txt');
            const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
              return res.status(500).json({
                error: 'Server configuration error: OPENAI_API_KEY is missing',
                details: 'Please add OPENAI_API_KEY to your .env.local file'
              });
            }

            const openai = new OpenAI({ apiKey });

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
              coaching = JSON.parse(response || '{}');
            } catch (parseError) {
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

            res.json({
              success: true,
              coaching_feedback: coaching,
              usage: completion.usage
            });
          } catch (error: any) {
            console.error('Coaching API Error:', error);
            res.status(500).json({
              error: 'Failed to generate coaching feedback',
              details: error.message
            });
          }
        });

        // Stakeholder Response Endpoint with Multi-Stakeholder Routing
        app.post('/api/stakeholder/respond', async (req, res) => {
          try {
            const { userQuestion, questionVerdict, currentStage, stakeholderProfile, allStakeholders, conversationHistory, projectContext } = req.body;

            console.log('🔍 [API] /api/stakeholder/respond called');
            console.log('🔍 [API] Question:', userQuestion);
            console.log('🔍 [API] All stakeholders received:', allStakeholders?.map((s: any) => `${s.name} (${s.role}, ${s.department})`).join(', ') || 'NONE');
            console.log('🔍 [API] Stakeholder profile:', stakeholderProfile?.name || 'NONE');

            if (!userQuestion || !currentStage) {
              return res.status(400).json({
                error: 'Missing required fields: userQuestion, currentStage'
              });
            }

            // Multi-stakeholder routing: Determine which stakeholder should respond based on question topic
            // OpenAI will determine if it's a greeting through the prompt and handle it appropriately
            let respondingStakeholder = stakeholderProfile || (allStakeholders && allStakeholders[0]);
            console.log('🔍 [API] Initial responding stakeholder:', respondingStakeholder?.name || 'NONE');
            
            // Route based on question topic - if no match, use fallback stakeholder (which is fine for greetings)
            if (allStakeholders && Array.isArray(allStakeholders) && allStakeholders.length > 1) {
              const questionLower = userQuestion.toLowerCase();
              
              // Topic detection for routing
              const customerExperienceKeywords = ['customer', 'journey', 'experience', 'satisfaction', 'churn', 'onboarding', 'retention', 'success'];
              const supportKeywords = ['support', 'ticket', 'service', 'help', 'issue', 'complaint', 'escalation', 'resolution'];
              const technicalKeywords = ['system', 'technical', 'integration', 'api', 'security', 'infrastructure', 'database', 'server', 'platform', 'software'];
              
              // Check which stakeholder type matches the question
              const isCustomerExperience = customerExperienceKeywords.some(kw => questionLower.includes(kw));
              const isSupport = supportKeywords.some(kw => questionLower.includes(kw));
              const isTechnical = technicalKeywords.some(kw => questionLower.includes(kw));
              
              console.log('🔍 [API] Topic detection - Customer Experience:', isCustomerExperience, 'Support:', isSupport, 'Technical:', isTechnical);
              
              // Find matching stakeholder by department/role
              if (isCustomerExperience) {
                const match = allStakeholders.find((s: any) => {
                  const deptMatch = s.department?.toLowerCase().includes('customer success');
                  const roleMatch = s.role?.toLowerCase().includes('customer success');
                  console.log(`🔍 [API] Checking ${s.name}: dept="${s.department}", role="${s.role}", deptMatch=${deptMatch}, roleMatch=${roleMatch}`);
                  return deptMatch || roleMatch;
                });
                if (match) {
                  console.log('✅ [API] Routed to Customer Success stakeholder:', match.name);
                  respondingStakeholder = match;
                }
              } else if (isSupport) {
                const match = allStakeholders.find((s: any) => {
                  const deptMatch = s.department?.toLowerCase().includes('service');
                  const roleMatch = s.role?.toLowerCase().includes('service') || s.role?.toLowerCase().includes('support');
                  console.log(`🔍 [API] Checking ${s.name}: dept="${s.department}", role="${s.role}", deptMatch=${deptMatch}, roleMatch=${roleMatch}`);
                  return deptMatch || roleMatch;
                });
                if (match) {
                  console.log('✅ [API] Routed to Support stakeholder:', match.name);
                  respondingStakeholder = match;
                }
              } else if (isTechnical) {
                const match = allStakeholders.find((s: any) => {
                  const deptLower = s.department?.toLowerCase() || '';
                  const roleLower = s.role?.toLowerCase() || '';
                  const deptMatch = deptLower.includes('it') || deptLower.includes('technology') || deptLower.includes('information technology') || deptLower === 'information technology';
                  const roleMatch = roleLower.includes('it') || roleLower.includes('systems') || roleLower.includes('technical');
                  console.log(`🔍 [API] Checking ${s.name}: dept="${s.department}", role="${s.role}", deptMatch=${deptMatch}, roleMatch=${roleMatch}`);
                  return deptMatch || roleMatch;
                });
                if (match) {
                  console.log('✅ [API] Routed to Technical stakeholder:', match.name);
                  respondingStakeholder = match;
                }
              } else {
                console.log('⚠️ [API] No topic match found, using fallback stakeholder');
              }
              // If no match, use the originally selected stakeholder (fallback)
            }
            
            console.log('🎯 [API] Final responding stakeholder:', respondingStakeholder?.name || 'NONE');

            if (!respondingStakeholder) {
              return res.status(400).json({
                error: 'No stakeholder available to respond'
              });
            }

            const promptPath = path.join(process.cwd(), 'prompts', 'stakeholder-response-system.txt');
            const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
              return res.status(500).json({
                error: 'Server configuration error: OPENAI_API_KEY is missing',
                details: 'Please add OPENAI_API_KEY to your .env.local file'
              });
            }

            const openai = new OpenAI({ apiKey });

            // Build stakeholder list for cross-referencing
            const stakeholdersList = allStakeholders && Array.isArray(allStakeholders) && allStakeholders.length > 1
              ? allStakeholders.map((s: any) => `${s.name} (${s.role}, ${s.department})`).join(', ')
              : `${respondingStakeholder.name} (${respondingStakeholder.role})`;

            const contextualPrompt = `${systemPrompt}

CURRENT SITUATION:
- Stage: ${currentStage}
- Question Quality: ${questionVerdict}
- Responding Stakeholder: ${respondingStakeholder.name} (${respondingStakeholder.role}, ${respondingStakeholder.department})
- All Available Stakeholders: ${stakeholdersList}
- Project: ${projectContext?.name || 'Customer Onboarding Optimization'}

${conversationHistory && conversationHistory.length > 0 ? `
RECENT CONVERSATION:
${conversationHistory.slice(-6).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

USER'S QUESTION: "${userQuestion}"

Generate the stakeholder's response. Follow response length rules based on question quality (${questionVerdict}).
The system prompt already includes instructions for handling greetings - follow those if this is a greeting.
${allStakeholders && Array.isArray(allStakeholders) && allStakeholders.length > 1 ? `
MULTI-STAKEHOLDER BEHAVIOR:
- You can naturally reference other stakeholders when relevant (e.g., "Jess's team handles most of the support tickets..." or "David would know more about the technical side...")
- If the question touches on another stakeholder's area, you can defer or cross-reference them naturally
- Occasionally show different priorities or perspectives to feel realistic
- Stay in character as ${respondingStakeholder.name}
` : ''}

Return ONLY the response text, no JSON, no metadata.`;

            const completion = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: contextualPrompt },
                { role: 'user', content: `Respond to: "${userQuestion}"` }
              ],
              temperature: 0.8,
              max_tokens: questionVerdict === 'GREEN' ? 300 : questionVerdict === 'AMBER' ? 150 : 100
            });

            const response = completion.choices[0].message.content.trim();

            res.json({
              success: true,
              stakeholder_response: {
                speaker_id: respondingStakeholder.id,
                speaker_name: respondingStakeholder.name,
                content: response,
                metadata: {
                  stage: currentStage,
                  emotion: 'neutral',
                  information_layer: 1,
                  keywords: [],
                  pain_points_revealed: []
                }
              },
              usage: completion.usage
            });
          } catch (error: any) {
            console.error('Stakeholder Response API Error:', error);
            res.status(500).json({
              error: 'Failed to generate stakeholder response',
              details: error.message
            });
          }
        });

        // Follow-up Questions Endpoint
        app.post('/api/stakeholder/followups', async (req, res) => {
          try {
            const { stakeholderResponse, currentStage, conversationHistory, projectContext } = req.body;

            if (!stakeholderResponse) {
              return res.status(400).json({
                error: 'Missing required field: stakeholderResponse'
              });
            }

            const promptPath = path.join(process.cwd(), 'prompts', 'followup-system.txt');
            const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
              return res.status(500).json({
                error: 'Server configuration error: OPENAI_API_KEY is missing',
                details: 'Please add OPENAI_API_KEY to your .env.local file'
              });
            }

            const openai = new OpenAI({ apiKey });

            const contextualPrompt = `${systemPrompt}

CURRENT CONTEXT:
- Stage: ${currentStage}
- Project: ${projectContext?.name || 'Customer Onboarding Optimization'}
- Stakeholder Response: "${stakeholderResponse}"

${conversationHistory && conversationHistory.length > 0 ? `
RECENT CONVERSATION:
${conversationHistory.slice(-4).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
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
              const parsed = JSON.parse(response || '{}');
              followUps = parsed.follow_ups || parsed.suggested_follow_ups || parsed;
              
              if (!Array.isArray(followUps)) {
                followUps = Object.values(followUps).filter((item: any) => item && typeof item === 'object');
              }
              
              if (followUps.length > 3) followUps = followUps.slice(0, 3);
              if (followUps.length < 3) {
                const fallbacks = [
                  { type: 'probe_deeper', question: 'Can you elaborate on that?', rationale: 'Digging deeper into the response' },
                  { type: 'clarify', question: 'What does that look like in practice?', rationale: 'Seeking concrete examples' },
                  { type: 'explore_impact', question: 'How does this impact your team?', rationale: 'Understanding broader implications' }
                ];
                followUps = [...followUps, ...fallbacks.slice(0, 3 - followUps.length)];
              }
            } catch (parseError) {
              followUps = [
                { type: 'probe_deeper', question: 'Can you give me a specific example?', rationale: 'Probing for concrete details' },
                { type: 'clarify', question: 'What does that look like in practice?', rationale: 'Seeking practical understanding' },
                { type: 'explore_impact', question: 'How does this affect your daily work?', rationale: 'Understanding impact' }
              ];
            }

            res.json({
              success: true,
              suggested_follow_ups: followUps,
              usage: completion.usage
            });
          } catch (error: any) {
            console.error('Follow-ups API Error:', error);
            res.status(500).json({
              error: 'Failed to generate follow-up questions',
              details: error.message
            });
          }
        });

        // Context Memory Update Endpoint
        app.post('/api/stakeholder/context', async (req, res) => {
          try {
            const { conversationHistory, currentStage, projectContext } = req.body;

            if (!conversationHistory || !currentStage) {
              return res.status(400).json({
                error: 'Missing required fields: conversationHistory, currentStage'
              });
            }

            const promptPath = path.join(process.cwd(), 'prompts', 'context-memory-system.txt');
            const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
              return res.status(500).json({
                error: 'Server configuration error: OPENAI_API_KEY is missing',
                details: 'Please add OPENAI_API_KEY to your .env.local file'
              });
            }

            const openai = new OpenAI({ apiKey });

            const contextualPrompt = `${systemPrompt}

CURRENT CONTEXT:
- Stage: ${currentStage}
- Project: ${projectContext?.name || 'Customer Onboarding Optimization'}

FULL CONVERSATION:
${conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

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
              contextUpdate = JSON.parse(response || '{}');
            } catch (parseError) {
              contextUpdate = {
                topics_covered: [],
                pain_points_identified: [],
                information_layers_unlocked: 1,
                stage_progress: {},
                should_transition: false,
                next_milestone: 'Continue gathering information'
              };
            }

            res.json({
              success: true,
              context_updates: contextUpdate,
              usage: completion.usage
            });
          } catch (error: any) {
            console.error('Context API Error:', error);
            res.status(500).json({
              error: 'Failed to update context',
              details: error.message
            });
          }
        });

        // Stakeholder reply endpoint
        app.post('/api/stakeholder-reply', async (req, res) => {
          try {
            const { storyId, chat, scenarioContext, currentStep, stepName, stepDescription, stakeholder } = req.body;

            // Extract scenario context from chat if not provided
            const extractedContext = scenarioContext || 
              chat.find((m: any) => m.content && m.content.includes('scenario:'))?.content ||
              'General user story discussion';

            // Build system prompt based on current step and scenario
            const stepContext = currentStep !== undefined ? 
              `Current step: ${stepName || `Step ${currentStep + 1}`} - ${stepDescription || 'user story development'}. ` : '';

            const stakeholderContext = stakeholder 
              ? `You are ${stakeholder.name}, a ${stakeholder.role}. Your focus is on ${stakeholder.focus}. ${stakeholder.responseStyle}`
              : 'You are a business stakeholder interacting with a Business Analyst during early discovery or story shaping.';

            const systemPrompt = `
${stakeholderContext}

You are not technical, and you're not here to write acceptance criteria or engineer solutions.

Your tone should feel like a thoughtful, busy professional — someone with real priorities and a natural way of speaking. Avoid robotic language, long bullet points, or perfectly structured replies. Think aloud if needed.

When the BA asks a question, respond as a real stakeholder would:
- Be clear about what matters to the business (intent, outcomes, non-negotiables)
- Be honest if something hasn't been decided yet
- Push decisions back to the BA if they haven't been confirmed
- If something *is* already known or agreed, it's okay to say it
- Avoid answering like ChatGPT or listing out requirements or acceptance criteria
- Don't phrase anything like "The system should..."
- Never speak like a product manager or developer — stay in your stakeholder lane

Instead, use natural phrases like:
- "From our side what matters most is…"
- "We've kind of agreed that…"
- "To be honest, we haven't really figured that part out yet…"
- "I'd want you to think through how that might work..."
- "I'm not sure what the rules should be there — what would make sense?"

Your goal is to create a realistic back-and-forth that gives useful business context but still requires the BA to think, clarify, and propose ideas.

Always end with a reflection or question that puts responsibility back on the BA to define or suggest something. You are not here to write stories or AC for them.

${stepContext}Scenario context: ${extractedContext}

Current step: ${stepName || 'user story development'}.
            `;

            // Map chat history into OpenAI format
            const messages = [
              { role: "system", content: systemPrompt },
              ...chat.map((m: any) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
              })),
            ];

            // Try to get API key from either source
            const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

            let stakeholderReply;

            if (apiKey) {
              // Call OpenAI if available
              const client = new OpenAI({ apiKey: apiKey });
              const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages,
                temperature: 0.6,
                max_tokens: 150, // Allow for more natural, conversational responses
              });

              stakeholderReply = completion.choices[0].message?.content || "I'm not sure, can you clarify?";
            } else {
              // Fallback responses when OpenAI is not available
              const fallbackResponses = [
                "From our side, what matters most is that this actually works for our users. Can you think through how that might look?",
                "We've kind of agreed on the main goal, but I'm not sure we've figured out all the details yet. What would make sense here?",
                "To be honest, we haven't really thought through that part. I'd want you to suggest what might work best.",
                "That's a good question. We definitely need to avoid any issues, but I'm not sure what the rules should be there.",
                "I'm not technical, so I'd lean on you to figure out how that should work from a user experience point of view.",
                "We've got some ideas about what we want, but we haven't locked down the specifics yet. Can you explore the options?",
                "That's something we'll need to figure out. What would feel fair and safe to the business?",
                "I hadn't even thought of that. Can you look into how other teams handle this and maybe propose something that works?"
              ];
              
              stakeholderReply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            }

            res.json({
              content: stakeholderReply,
              storyId,
              timestamp: new Date().toISOString()
            });

          } catch (error: any) {
            console.error("Stakeholder reply error:", error);
            res.status(500).json({ 
              error: error.message,
              fallback: "I'm here to help. What would you like to know about this scenario?"
            });
          }
        });

        vite.middlewares.use(app);
      }
    }
  ],
  server: {
    port: 3000,
    strictPort: false
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  esbuild: {
    target: 'es2022'
  }
});

function buildPrompt(transcript: string, context?: any) {
  const projectName = context?.projectName || 'the current project';
  
  return [
    `You are a Business Analyst coach helping someone conduct a Problem Exploration interview for: ${projectName}. Given the stakeholder's response, provide ONE best follow-up question.

Respond ONLY with minified JSON:
{"next_question":"string","rationale":"string","technique":"string"}

Guidelines:
- ACKNOWLEDGE what they just said before asking your question
- Make questions conversational and natural, not robotic
- Focus specifically on PROBLEM EXPLORATION (uncovering pain points, root causes, impact)
- Build on their specific response - reference what they mentioned
- Ask questions that help understand the PROBLEM better, not solutions
- CRITICAL: Use DIFFERENT acknowledgment phrases each time. DO NOT repeat the same phrase. AVOID overusing any single phrase. Choose RANDOMLY from these options:
  * "That sounds frustrating..." (for pain points)
  * "I see what you mean..." (for understanding)
  * "That's a good point about..." (for insights)
  * "This is concerning because..." (for serious issues)
  * "What you're describing suggests..." (for analysis)
  * "You've highlighted..." (for important issues - use sparingly)
  * "Given that..." (for facts/data - use sparingly)
  * "Since you mentioned..." (for specific points - use sparingly)
- If the stakeholder response is off-topic (sports, hobbies, personal life), redirect back to the ${projectName} project

Examples of good acknowledgment + question:
- "Given that managers spend 3 hours per review, what specific challenges do they face during that time?"
- "Since you mentioned employees feel undervalued, can you tell me more about when this feeling typically arises?"
- "I understand you enjoy tennis, but let's focus on the ${projectName} challenges. What specific issues are you experiencing with the current process?"
- "That's interesting about the manual process. What specific pain points does that create for your team?"
- "You've highlighted some real challenges there. Can you walk me through a typical day when these issues surface?"
- "That sounds frustrating. What impact does this have on your team's productivity?"
- "I see what you mean about the time-consuming nature. What would you say is the biggest bottleneck?"
- "That's a good point about the lack of structure. How does this affect decision-making?"

Technique options: Probing, Process Mapping, Priority Framing, Root Cause Analysis

Remember: This is Problem Exploration stage for ${projectName} - focus on understanding the problem, not designing solutions. If the stakeholder goes off-topic, gently redirect them back to the ${projectName} project.`,
    'Stakeholder Response:\n' + transcript,
  ].filter(Boolean).join('\n\n');
}
