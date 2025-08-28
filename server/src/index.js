const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
require('dotenv').config();

// Import routes
const debriefRoutes = require('./routes/debrief');
const processCoachRoutes = require('./routes/process-coach');
const processDrafterRoutes = require('./routes/process-drafter');

// Register plugins
fastify.register(cors, {
  origin: true,
  credentials: true
});

// Health check route
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Training routes
fastify.get('/api/stage-packs', async (request, reply) => {
  // Mock data for now - will be replaced with database query
  const stagePacks = [
    {
      id: 'problem_exploration',
      name: 'Problem Exploration',
      objective: 'Understand the business problem, pain points, and stakeholder needs to establish a clear foundation for analysis.',
      must_cover: [
        'Top 3 pains & frequency/severity',
        'Affected personas/teams',
        'Business impact & metrics',
        'Current workarounds/root symptoms',
        'Constraints & non-negotiables'
      ]
    },
    {
      id: 'as_is',
      name: 'As-Is Process Analysis',
      objective: 'Document and analyze the current business process to identify inefficiencies and improvement opportunities.',
      must_cover: [
        'Start & end triggers',
        'Actors & hand-offs',
        'Systems & specific screens',
        'Data fields & IDs/ownership',
        'Exceptions, volumes & SLAs'
      ]
    },
    {
      id: 'to_be',
      name: 'To-Be Process Design',
      objective: 'Design the future state process that addresses identified problems and meets business objectives.',
      must_cover: [
        'Target outcomes & value',
        'Non-negotiables/constraints',
        'Success metrics & measurement',
        'Dependencies & impacts',
        'Change readiness/rollout signals'
      ]
    },
    {
      id: 'solution_design',
      name: 'Solution Design',
      objective: 'Design and evaluate solution options that support the future state process and business requirements.',
      must_cover: [
        '2–3 viable options',
        'Feasibility & constraints fit',
        'Trade-offs (cost, time, risk)',
        'Risks & mitigations',
        'Pilot/rollout & acceptance criteria'
      ]
    }
  ];
  
  return stagePacks;
});

fastify.post('/api/meetings/start', async (request, reply) => {
  const { stage_id, coach_mode = 'medium' } = request.body;
  
  // Mock session creation
  const session = {
    id: `session_${Date.now()}`,
    stage_id,
    coach_mode,
    minutes_cap: 10,
    turns_cap: 16,
    turns_used: 0,
    started_at: new Date().toISOString()
  };
  
  return session;
});

fastify.post('/api/meetings/:sessionId/reply', async (request, reply) => {
  const { sessionId } = request.params;
  const { user_text } = request.body;
  
  // Mock stakeholder response
  const response = {
    stakeholder_text: `Thank you for that question. As a stakeholder, I can tell you that we're currently facing some challenges with our process efficiency. The main issues we're seeing are related to manual handoffs between departments and lack of real-time visibility. We're looking to reduce our processing time from 6 to 8 weeks down to 3 to 4 weeks, and improve our customer satisfaction scores.`,
    updated_turns_used: 1
  };
  
  return response;
});

// Register debrief routes with coaching
debriefRoutes(fastify);

// Register process mapping routes
fastify.register(processCoachRoutes);
fastify.register(processDrafterRoutes);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
