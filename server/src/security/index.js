/**
 * Security Middleware Configuration
 * 
 * Provides helmet security headers and rate limiting
 */

const helmet = require('@fastify/helmet');
const rateLimit = require('@fastify/rate-limit');

/**
 * Register security plugins with Fastify
 */
async function registerSecurity(fastify) {
  // Security headers (helmet)
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com", "https://*.supabase.co"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding (needed for some integrations)
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  });

  // Global rate limiting
  await fastify.register(rateLimit, {
    max: 100, // Maximum 100 requests
    timeWindow: '15 minutes', // Per 15 minutes
    errorResponseBuilder: function (request, context) {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${context.ttl} seconds`,
        retryAfter: Math.round(context.ttl / 1000)
      };
    },
    // Key generator - use IP address
    keyGenerator: function (request) {
      return request.ip;
    }
  });

  fastify.log.info('✅ Security middleware registered: Helmet + Rate Limiting');
}

/**
 * Create stricter rate limit configuration for sensitive routes
 */
function getStrictRateLimitConfig() {
  return {
    max: 50, // Stricter limit for sensitive endpoints
    timeWindow: '15 minutes',
    errorResponseBuilder: function (request, context) {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded for this endpoint, retry in ${context.ttl} seconds`,
        retryAfter: Math.round(context.ttl / 1000)
      };
    },
    keyGenerator: function (request) {
      return request.ip;
    }
  };
}

module.exports = {
  registerSecurity,
  getStrictRateLimitConfig
};


