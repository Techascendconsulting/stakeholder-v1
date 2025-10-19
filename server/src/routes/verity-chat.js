const OpenAI = require('openai');

async function verityChatRoutes(fastify, options) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  fastify.post('/api/verity-chat', async (request, reply) => {
    try {
      const { messages, context } = request.body;
      
      if (!messages || !Array.isArray(messages)) {
        return reply.code(400).send({ error: 'Messages array is required' });
      }
      
      console.log('🤖 Verity chat request received:', {
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




