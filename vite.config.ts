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

        vite.middlewares.use(app);
      }
    }
  ],
  server: {
    port: 3001
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
  return [
    `You are a Business Analyst coach helping someone conduct a Problem Exploration interview. Given the stakeholder's response, provide ONE best follow-up question.

Respond ONLY with minified JSON:
{"next_question":"string","rationale":"string","technique":"string"}

Guidelines:
- ACKNOWLEDGE what they just said before asking your question
- Make questions conversational and natural, not robotic
- Focus specifically on PROBLEM EXPLORATION (uncovering pain points, root causes, impact)
- Build on their specific response - reference what they mentioned
- Ask questions that help understand the PROBLEM better, not solutions
- CRITICAL: Use DIFFERENT acknowledgment phrases each time. DO NOT repeat "That's interesting about..." Choose from:
  * "Given that..." (for facts/data)
  * "Since you mentioned..." (for specific points)
  * "You've highlighted..." (for important issues)
  * "That sounds frustrating..." (for pain points)
  * "I see what you mean..." (for understanding)
  * "That's a good point about..." (for insights)
  * "This is concerning because..." (for serious issues)
  * "What you're describing suggests..." (for analysis)
- If the stakeholder response is off-topic (sports, hobbies, personal life), redirect back to the business problem

Examples of good acknowledgment + question:
- "Given that managers spend 3 hours per review, what specific challenges do they face during that time?"
- "Since you mentioned employees feel undervalued, can you tell me more about when this feeling typically arises?"
- "I understand you enjoy tennis, but let's focus on the performance management challenges. What specific issues are you experiencing with the current review process?"
- "That's interesting about the manual process. What specific pain points does that create for your team?"
- "You've highlighted some real challenges there. Can you walk me through a typical day when these issues surface?"
- "That sounds frustrating. What impact does this have on your team's productivity?"
- "I see what you mean about the time-consuming nature. What would you say is the biggest bottleneck?"
- "That's a good point about the lack of structure. How does this affect decision-making?"

Technique options: Probing, Process Mapping, Priority Framing, Root Cause Analysis

Remember: This is Problem Exploration stage - focus on understanding the problem, not designing solutions. If the stakeholder goes off-topic, gently redirect them back to the business problem.`,
    'Stakeholder Response:\n' + transcript,
  ].filter(Boolean).join('\n\n');
}
