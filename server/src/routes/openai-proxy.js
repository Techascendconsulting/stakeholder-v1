const OpenAI = require('openai');
const { validateRequest, openaiChatSchema } = require('../validation/schemas');
const { verifyUserAuth } = require('../middleware/auth');
const multipart = require('@fastify/multipart');

/**
 * OpenAI Proxy Route - Transparent proxy to avoid CORS issues
 * 
 * This allows the frontend OpenAI SDK to work as-is without code changes,
 * just by changing the baseURL to point here instead of OpenAI directly.
 */
async function openaiProxyRoutes(fastify, options) {
  // Register multipart for audio file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024 // 25MB max file size for audio
    }
  });

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
  // SECURITY: Requires authentication
  fastify.post('/api/openai-proxy/chat/completions', {
    preHandler: [verifyUserAuth, validateRequest(openaiChatSchema)]
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
        userId: request.user?.id,
        userEmail: request.user?.email,
        model,
        messageCount: messages?.length,
        stream: stream || false
      });

      // Forward request to OpenAI with exact same parameters
      // Note: Streaming is not supported through this proxy endpoint yet
      // For streaming, use /api/openai-stream endpoint
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
  // SECURITY: Requires authentication
  fastify.get('/api/openai-proxy/models', {
    preHandler: [verifyUserAuth]
  }, async (request, reply) => {
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

  // Proxy audio transcriptions endpoint
  // SECURITY: Requires authentication
  fastify.post('/api/openai-proxy/audio/transcriptions', {
    preHandler: [verifyUserAuth]
  }, async (request, reply) => {
    try {
      if (!openai) {
        return reply.code(503).send({ 
          error: 'OpenAI service unavailable',
          message: 'OpenAI API key not configured' 
        });
      }

      // Extract form data (multipart/form-data for audio files)
      const data = await request.file();
      
      if (!data) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Audio file is required'
        });
      }

      console.log('🔄 OpenAI Proxy: audio/transcriptions request', {
        userId: request.user?.id,
        userEmail: request.user?.email,
        filename: data.filename,
        mimetype: data.mimetype
      });

      // Read file buffer
      const buffer = await data.toBuffer();
      
      // Get model and other parameters from form fields
      // Fastify multipart: iterate parts to get form fields
      const parts = request.parts();
      let model = 'whisper-1';
      let language = undefined;
      let prompt = undefined;

      for await (const part of parts) {
        if (part.type === 'file') {
          // File already handled above
          continue;
        }
        if (part.fieldname === 'model') {
          model = part.value;
        } else if (part.fieldname === 'language') {
          language = part.value;
        } else if (part.fieldname === 'prompt') {
          prompt = part.value;
        }
      }

      // Create a File object for OpenAI SDK
      // OpenAI SDK accepts File, Blob, or streams
      // In Node.js, we need to use the buffer with proper File object
      let file;
      try {
        // Try Node.js 18+ File API
        const { File } = require('node:buffer');
        file = new File([buffer], data.filename || 'audio.webm', {
          type: data.mimetype || 'audio/webm'
        });
      } catch (e) {
        // Fallback for older Node.js: create a File-like object
        const { Readable } = require('stream');
        const stream = Readable.from(buffer);
        stream.name = data.filename || 'audio.webm';
        file = {
          name: data.filename || 'audio.webm',
          type: data.mimetype || 'audio/webm',
          stream: () => stream,
          arrayBuffer: async () => buffer,
          size: buffer.length
        };
      }

      // Call OpenAI transcription API
      const response = await openai.audio.transcriptions.create({
        file: file,
        model: model,
        language: language,
        prompt: prompt
      });

      console.log('✅ OpenAI Proxy: Transcription received');

      return reply.send(response);

    } catch (error) {
      console.error('❌ OpenAI Proxy Error (transcriptions):', error);
      return reply.code(error.status || 500).send({ 
        error: {
          message: error.message,
          type: error.type || 'api_error'
        }
      });
    }
  });

  // Proxy streaming chat completions endpoint
  // SECURITY: Requires authentication
  // This endpoint handles Server-Sent Events (SSE) for streaming responses
  fastify.post('/api/openai-stream', {
    preHandler: [verifyUserAuth]
  }, async (request, reply) => {
    try {
      if (!openai) {
        return reply.code(503).send({ 
          error: 'OpenAI service unavailable',
          message: 'OpenAI API key not configured' 
        });
      }

      const { model, messages, temperature, max_tokens, presence_penalty, frequency_penalty } = request.body;
      
      console.log('🔄 OpenAI Proxy: streaming chat.completions request', {
        userId: request.user?.id,
        userEmail: request.user?.email,
        model: model || 'gpt-4o-mini',
        messageCount: messages?.length
      });

      // Set up SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable buffering for nginx
      });

      // Create streaming response from OpenAI
      const stream = await openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens,
        presence_penalty,
        frequency_penalty,
        stream: true
      }, {
        responseType: 'stream'
      });

      // Pipe OpenAI stream to client
      for await (const chunk of stream) {
        const data = JSON.stringify(chunk);
        reply.raw.write(`data: ${data}\n\n`);
      }

      // Send end marker
      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();

    } catch (error) {
      console.error('❌ OpenAI Proxy Error (streaming):', error);
      
      if (!reply.sent) {
        reply.raw.write(`data: ${JSON.stringify({ error: { message: error.message } })}\n\n`);
        reply.raw.end();
      }
    }
  });
}

module.exports = openaiProxyRoutes;

