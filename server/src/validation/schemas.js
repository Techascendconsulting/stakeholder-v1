/**
 * Input Validation Schemas using Zod
 * 
 * Provides validation schemas for all API endpoints
 */

const { z } = require('zod');

/**
 * OpenAI Chat Completions Request Schema
 */
const openaiChatSchema = z.object({
  model: z.string().min(1).max(100).default('gpt-4o-mini'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(50000) // Max ~50k chars per message
  })).min(1).max(100), // Max 100 messages
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).max(4000).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  stream: z.boolean().optional()
});

/**
 * Verity Chat Request Schema
 */
const verityChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000)
  })).min(1).max(50),
  context: z.object({
    context: z.string().max(500).optional(),
    pageTitle: z.string().max(200).optional(),
    userRole: z.string().max(100).optional()
  }).optional()
});

/**
 * Stakeholder AI Request Schema
 */
const stakeholderAISchema = z.object({
  transcript: z.string().min(1).max(50000),
  context: z.any().optional(), // Allow any context object
  conversationHistory: z.array(z.any()).optional()
});

/**
 * Meeting Start Schema
 */
const meetingStartSchema = z.object({
  stage_id: z.string().min(1).max(100),
  coach_mode: z.enum(['low', 'medium', 'high']).default('medium')
});

/**
 * Meeting Reply Schema
 */
const meetingReplySchema = z.object({
  user_text: z.string().min(1).max(5000)
});

/**
 * Process Coach Schema
 */
const processCoachSchema = z.object({
  process: z.string().min(1).max(50000),
  question: z.string().min(1).max(1000).optional()
});

/**
 * Process Drafter Schema
 */
const processDrafterSchema = z.object({
  description: z.string().min(1).max(10000),
  steps: z.array(z.string()).optional()
});

/**
 * Generic ID Parameter Schema
 */
const idParamSchema = z.object({
  id: z.string().min(1).max(100),
  sessionId: z.string().min(1).max(100).optional()
});

/**
 * Validation middleware factory
 */
function validateRequest(schema) {
  return async (request, reply) => {
    try {
      // Validate body
      if (request.body) {
        request.body = schema.parse(request.body);
      }
      // Validate params if provided
      if (request.params) {
        request.params = idParamSchema.partial().parse(request.params);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation Error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      throw error;
    }
  };
}

module.exports = {
  openaiChatSchema,
  verityChatSchema,
  stakeholderAISchema,
  meetingStartSchema,
  meetingReplySchema,
  processCoachSchema,
  processDrafterSchema,
  idParamSchema,
  validateRequest
};










