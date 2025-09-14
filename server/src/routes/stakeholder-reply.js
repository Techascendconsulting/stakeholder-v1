const OpenAI = require('openai');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

module.exports = async function (fastify, opts) {
  // Stakeholder reply endpoint
  fastify.post('/api/stakeholder-reply', async (request, reply) => {
    try {
      const { storyId, chat, scenarioContext, currentStep } = request.body;

      // Extract scenario context from chat if not provided
      const extractedContext = scenarioContext || 
        chat.find((m) => m.content && m.content.includes('scenario:'))?.content ||
        'General user story discussion';

      // Build system prompt based on current step and scenario
      const stepContext = currentStep !== undefined ? 
        `Current step: ${currentStep + 1} of user story development. ` : '';

      const systemPrompt = `
You are a knowledgeable stakeholder being asked about a project or user story. 
Answer naturally, briefly, and only with what a real stakeholder would know.
Do not invent technical details. Stay in character as someone who understands the business context.
If something is unclear, push back and say "I'll need more detail" instead of making things up.
Keep responses conversational and helpful, but realistic.

${stepContext}Scenario context: ${extractedContext}

Remember: You're a stakeholder, not a developer. Focus on business needs, user experience, and practical concerns.
      `;

      // Map chat history into OpenAI format
      const messages = [
        { role: "system", content: systemPrompt },
        ...chat.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ];

      let stakeholderReply;

      if (openai) {
        // Call OpenAI if available
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.6,
          max_tokens: 150, // Keep responses concise
        });

        stakeholderReply = completion.choices[0].message?.content || "I'm not sure, can you clarify?";
      } else {
        // Fallback responses when OpenAI is not available
        const fallbackResponses = [
          "That's a good question. From my perspective as a stakeholder, I'd need to understand the specific requirements better.",
          "I can see the value in that approach. Let me think about the business implications.",
          "That's an interesting point. We should consider how this affects our current process.",
          "I understand your concern. From a stakeholder perspective, we need to ensure this meets our business needs.",
          "That makes sense. We should validate this with the business requirements.",
          "Good question. I'd like to understand more about the expected outcomes.",
          "I see what you're getting at. We need to consider the user experience implications.",
          "That's worth exploring further. How does this align with our business objectives?"
        ];
        
        stakeholderReply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

      return {
        content: stakeholderReply,
        storyId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error("Stakeholder reply error:", error);
      return reply.status(500).send({ 
        error: error.message,
        fallback: "I'm here to help. What would you like to know about this scenario?"
      });
    }
  });
};

