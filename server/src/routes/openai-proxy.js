const OpenAI = require('openai');
const { validateRequest, openaiChatSchema } = require('../validation/schemas');

/**
 * OpenAI Proxy Route - Transparent proxy to avoid CORS issues
 * 
 * This allows the frontend OpenAI SDK to work as-is without code changes,
 * just by changing the baseURL to point here instead of OpenAI directly.
 */
async function openaiProxyRoutes(fastify, options) {
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

  // Proxy chat completions endpoint (without /v1/ because SDK doesn't append it when baseURL is set)
  fastify.post('/api/openai-proxy/chat/completions', {
    preHandler: validateRequest(openaiChatSchema)
  }, async (request, reply) => {
    try {
      if (!openai) {
        return reply.code(503).send({ 
          error: 'OpenAI service unavailable',
          message: 'OpenAI API key not configured' 
        });
      }

      const { model, messages, temperature, max_tokens, presence_penalty, frequency_penalty, stream } = request.body;
      
      console.log('🔄 OpenAI Proxy: chat.completions request', {
        model,
        messageCount: messages?.length,
        stream: stream || false
      });

      // Forward request to OpenAI with exact same parameters
      const response = await openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens,
        presence_penalty,
        frequency_penalty,
        stream: false // Don't support streaming through proxy for now
      });

      console.log('✅ OpenAI Proxy: Response received');

      return reply.send(response);

    } catch (error) {
      console.error('❌ OpenAI Proxy Error:', error);
      return reply.code(error.status || 500).send({ 
        error: {
          message: error.message,
          type: error.type || 'api_error'
        }
      });
    }
  });

  // Proxy models endpoint (for compatibility)
  fastify.get('/api/openai-proxy/models', async (request, reply) => {
    try {
      const response = await openai.models.list();
      return reply.send(response);
    } catch (error) {
      console.error('❌ OpenAI Proxy Error (models):', error);
      return reply.code(error.status || 500).send({ 
        error: {
          message: error.message
        }
      });
    }
  });
}

module.exports = openaiProxyRoutes;

