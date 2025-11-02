/**
 * Request Logging Middleware
 * 
 * Logs all incoming requests with IP, method, path, response time, and status codes
 * Also tracks rate limit events (429 responses)
 */

async function loggingMiddleware(fastify) {
  // Log all incoming requests
  fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
  });

  // Log successful requests
  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = Date.now() - request.startTime;
    const { method, url, ip } = request;
    const { statusCode } = reply;
    
    // Color-coded log levels
    let logLevel = 'info';
    let emoji = '✅';
    
    if (statusCode >= 500) {
      logLevel = 'error';
      emoji = '❌';
    } else if (statusCode >= 400) {
      logLevel = 'warn';
      emoji = '⚠️';
    } else if (statusCode === 429) {
      logLevel = 'warn';
      emoji = '🚫';
    } else if (statusCode >= 300) {
      logLevel = 'warn';
      emoji = '🔀';
    }
    
    // Log request details
    const message = `${emoji} ${method} ${url} - ${statusCode} (${responseTime}ms) - IP: ${ip}`;
    
    if (logLevel === 'error') {
      fastify.log.error(message);
    } else if (logLevel === 'warn') {
      fastify.log.warn(message);
    } else {
      fastify.log.info(message);
    }
    
    // Track rate limit events for monitoring
    if (statusCode === 429) {
      console.log('📊 RATE_LIMIT_EVENT:', {
        ip: ip,
        path: url,
        method: method,
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.log.info('✅ Request logging middleware registered');
}

module.exports = loggingMiddleware;

