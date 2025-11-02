const OpenAI = require('openai');
const { validateRequest, verityChatSchema } = require('../validation/schemas');
const { verifyUserAuth } = require('../middleware/auth');

async function verityChatRoutes(fastify, options) {
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

  // SECURITY: Requires authentication
  fastify.post('/api/verity-chat', {
    preHandler: [verifyUserAuth, validateRequest(verityChatSchema)]
  }, async (request, reply) => {
    try {
      if (!openai) {
        return reply.code(503).send({ 
          error: 'OpenAI service unavailable',
          message: 'OpenAI API key not configured' 
        });
      }

      const { messages, context } = request.body;
      
      console.log('🤖 Verity chat request received:', {
        userId: request.user?.id,
        userEmail: request.user?.email,
        messageCount: messages.length,
        context: context?.pageTitle
      });

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      });

      const reply_text = completion.choices[0]?.message?.content || 
        "I'm having trouble right now. Let me notify Tech Ascend Consulting so they can help you directly.";

      console.log('✅ Verity response generated:', reply_text.substring(0, 50) + '...');

      return reply.send({ 
        reply: reply_text,
        escalate: false
      });

    } catch (error) {
      console.error('❌ Error in verity-chat:', error);
      return reply.code(500).send({ 
        error: 'Failed to get response from Verity',
        details: error.message 
      });
    }
  });
}

module.exports = verityChatRoutes;





