import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from env.local
config({ path: path.resolve(process.cwd(), 'env.local') });

// https://vitejs.dev/config/
export default defineConfig({
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
    port: 5173,
    strictPort: true
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
