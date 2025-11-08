/**
 * Authentication Middleware for Fastify
 * 
 * Verifies Supabase JWT tokens to ensure only authenticated users
 * can access protected routes (especially OpenAI-powered endpoints).
 * 
 * Usage:
 *   fastify.post('/api/protected', {
 *     preHandler: [verifyUserAuth]
 *   }, async (request, reply) => { ... });
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for token verification
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Auth middleware: Supabase client initialized for token verification');
  } catch (error) {
    console.error('❌ Auth middleware: Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('⚠️ Auth middleware: Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

/**
 * Verify user authentication from request
 * Extracts and validates Supabase JWT token from Authorization header
 * 
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<void>}
 */
async function verifyUserAuth(request, reply) {
  // Extract token from Authorization header
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Log unauthorized access attempt
    logUnauthorizedAccess(request, 'Missing or invalid Authorization header');
    
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Authentication required. Please provide a valid Bearer token in the Authorization header.'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token || token.trim().length === 0) {
    logUnauthorizedAccess(request, 'Empty token');
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid token format.'
    });
  }

  // Verify token with Supabase
  if (!supabase) {
    console.error('❌ Auth middleware: Supabase client not initialized');
    return reply.code(503).send({
      error: 'Service Unavailable',
      message: 'Authentication service not configured.'
    });
  }

  try {
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logUnauthorizedAccess(request, `Token verification failed: ${error?.message || 'User not found'}`);
      
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Token is valid - attach user info to request for use in route handlers
    request.user = {
      id: user.id,
      email: user.email,
      aud: user.aud,
      role: user.role
    };

    // Log successful authentication (for monitoring)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Auth middleware: Authenticated user ${user.email} (${user.id})`);
    }

    // Continue to next handler
    return;

  } catch (error) {
    console.error('❌ Auth middleware: Error verifying token:', error);
    logUnauthorizedAccess(request, `Exception during verification: ${error.message}`);
    
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Token verification failed.'
    });
  }
}

/**
 * Log unauthorized access attempts for security monitoring
 * 
 * @param {Object} request - Fastify request object
 * @param {string} reason - Reason for unauthorized access
 */
function logUnauthorizedAccess(request, reason) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    method: request.method,
    url: request.url,
    path: request.routerPath || request.url,
    reason: reason,
    headers: {
      // Only log safe headers, not sensitive ones
      'content-type': request.headers['content-type'],
      'origin': request.headers['origin'],
      'referer': request.headers['referer']
    }
  };

  // Log to console (in production, this should go to a secure log system)
  console.warn('🚨 UNAUTHORIZED ACCESS ATTEMPT:', JSON.stringify(logEntry, null, 2));

  // TODO: In production, send to secure logging service (e.g., Sentry, CloudWatch, etc.)
  // Example:
  // if (process.env.SECURITY_LOG_ENDPOINT) {
  //   fetch(process.env.SECURITY_LOG_ENDPOINT, {
  //     method: 'POST',
  //     body: JSON.stringify(logEntry)
  //   }).catch(err => console.error('Failed to log security event:', err));
  // }
}

module.exports = {
  verifyUserAuth,
  logUnauthorizedAccess
};







