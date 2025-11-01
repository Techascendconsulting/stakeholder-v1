const OpenAI = require('openai');
const { validateRequest, stakeholderAISchema } = require('../validation/schemas');

async function stakeholderAIRoutes(fastify, options) {
  // Create OpenAI client with null check
  let openai = null;
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
    try {
      openai = new OpenAI({
        apiKey: apiKey.trim(),
      });
    } catch (error) {
      fastify.log.error('Failed to initialize OpenAI client:', error);
    }
  }

  // Stakeholder response generation endpoint
  fastify.post('/api/stakeholder-response', {
    preHandler: validateRequest(stakeholderAISchema)
  }, async (request, reply) => {
    try {
      if (!openai) {
        return reply.code(503).send({ 
          error: 'OpenAI service unavailable',
          message: 'OpenAI API key not configured' 
        });
      }

      const { systemPrompt, userMessage, model, maxTokens, temperature } = request.body;
      
      if (!userMessage) {
        return reply.code(400).send({ error: 'User message is required' });
      }
      
      console.log('🤖 Stakeholder AI request:', {
        model: model || 'gpt-4o-mini',
        messageLength: userMessage.length,
        maxTokens: maxTokens || 150
      });

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful stakeholder in a business meeting.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: maxTokens || 150,
        temperature: temperature || 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const generatedResponse = response.choices[0]?.message?.content;
      
      if (!generatedResponse?.trim()) {
        throw new Error('Empty response from OpenAI');
      }

      console.log('✅ Stakeholder response generated:', generatedResponse.substring(0, 50) + '...');

      return reply.send({ 
        response: generatedResponse,
        usage: response.usage
      });

    } catch (error) {
      console.error('❌ Error in stakeholder-ai:', error);
      return reply.code(500).send({ 
        error: 'Failed to generate stakeholder response',
        details: error.message 
      });
    }
  });
}

module.exports = stakeholderAIRoutes;





