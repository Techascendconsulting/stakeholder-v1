/**
 * Debrief API routes with coaching integration
 */

// Import coaching functions (these will be available when we convert to TypeScript)
// For now, we'll use mock coaching data

const mockCoachingMeta = {
  pain_points: {
    key: 'pain_points',
    coaching_tip: 'Understanding pain points helps identify the root causes of issues. This information is crucial for designing effective solutions that address real problems rather than symptoms.',
    sample_questions: [
      'What are the biggest frustrations your team faces daily?',
      'What processes feel broken or inefficient?',
      'What complaints do you hear most often from stakeholders?'
    ]
  },
  blockers: {
    key: 'blockers',
    coaching_tip: 'Identifying blockers reveals what\'s preventing progress. This helps prioritize improvements and understand dependencies that could impact project success.',
    sample_questions: [
      'What typically slows down your work?',
      'What obstacles prevent you from meeting deadlines?',
      'What dependencies cause the most delays?'
    ]
  },
  handoffs: {
    key: 'handoffs',
    coaching_tip: 'Handoffs between teams are common failure points. Understanding these gaps helps design better integration and communication processes.',
    sample_questions: [
      'Where do things fall apart between teams?',
      'What information gets lost during handoffs?',
      'How do you ensure smooth transitions between departments?'
    ]
  },
  constraints: {
    key: 'constraints',
    coaching_tip: 'Constraints (technical, budget, time, people) significantly impact what solutions are feasible. Understanding these early prevents unrealistic expectations.',
    sample_questions: [
      'What limitations should we keep in mind?',
      'What resources or time constraints affect this?',
      'What technical or business constraints exist?'
    ]
  },
  customer_impact: {
    key: 'customer_impact',
    coaching_tip: 'Understanding how problems affect customers helps prioritize improvements and ensures solutions deliver real business value.',
    sample_questions: [
      'How do these issues affect your customers?',
      'What\'s the business impact of these problems?',
      'How do customers experience these challenges?'
    ]
  }
};

// Simple text analysis functions
function isClosedQuestion(text) {
  if (!text || typeof text !== 'string') return false;
  const closedPrefixes = /^(is|are|do|does|did|can|could|should|would|will|have|has|may|might)\b/i;
  return closedPrefixes.test(text.toLowerCase().trim());
}

function rewriteToOpen(text) {
  if (!text || typeof text !== 'string') return text;
  
  const original = text.trim();
  
  if (/^is\s+/i.test(original)) {
    return original.replace(/^is\s+(.+?)\s*\?*$/i, 'What makes $1 feel that way?');
  }
  if (/^are\s+/i.test(original)) {
    return original.replace(/^are\s+(.+?)\s*\?*$/i, 'How do $1 typically work?');
  }
  if (/^do\s+/i.test(original)) {
    return original.replace(/^do\s+(.+?)\s*\?*$/i, 'How do $1 usually happen?');
  }
  if (/^does\s+/i.test(original)) {
    return original.replace(/^does\s+(.+?)\s*\?*$/i, 'How does $1 typically work?');
  }
  if (/^can\s+/i.test(original)) {
    return original.replace(/^can\s+(.+?)\s*\?*$/i, 'How do $1 usually work, and what challenges do you face?');
  }
  if (/^will\s+/i.test(original)) {
    return original.replace(/^will\s+(.+?)\s*\?*$/i, 'What would success look like for $1?');
  }
  if (/^should\s+/i.test(original)) {
    return original.replace(/^should\s+(.+?)\s*\?*$/i, 'What options have you considered for $1, and what would success look like?');
  }
  
  return text;
}

function generateNextTimeScripts(weakKeys, maxScripts = 5) {
  const scripts = [];
  
  for (const key of weakKeys) {
    const meta = mockCoachingMeta[key];
    if (meta && meta.sample_questions.length > 0) {
      for (const question of meta.sample_questions) {
        if (scripts.length >= maxScripts) break;
        scripts.push(question);
      }
    }
    if (scripts.length >= maxScripts) break;
  }
  
  // Add generic tips if we have room
  if (scripts.length < maxScripts) {
    const genericTips = [
      'Ask open-ended questions that start with What, How, Why, or Tell me about...',
      'Use follow-up questions to dig deeper into stakeholder responses',
      'Focus on understanding the "why" behind problems, not just the "what"'
    ];
    
    for (const tip of genericTips) {
      if (scripts.length >= maxScripts) break;
      scripts.push(tip);
    }
  }
  
  return scripts;
}

function collectMiniLessons(weakKeys, max = 3) {
  const lessons = [];
  
  for (const key of weakKeys) {
    if (lessons.length >= max) break;
    
    const meta = mockCoachingMeta[key];
    if (meta && meta.coaching_tip) {
      lessons.push({
        key,
        tip: meta.coaching_tip
      });
    }
  }
  
  return lessons;
}

// Simple scoring function
function scoreMeeting(stage, cards, transcript) {
  const coverageScores = {};
  const technique = {
    openRatio: 0,
    followUp: 0,
    talkBalance: 0.5,
    earlySolutioning: false,
    closedCount: 0,
    totalLearnerQs: 0
  };
  
  // Initialize coverage scores
  stage.must_cover.forEach(key => {
    coverageScores[key] = 0;
  });
  
  let totalLearnerQs = 0;
  let openQuestions = 0;
  let closedCount = 0;
  
  // Analyze transcript
  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    
    if (turn.role === 'learner') {
      totalLearnerQs++;
      
      const isClosed = isClosedQuestion(turn.text);
      if (isClosed) {
        closedCount++;
      } else {
        openQuestions++;
      }
      
      // Simple coverage assignment based on keywords
      const text = turn.text.toLowerCase();
      if (text.includes('pain') || text.includes('problem') || text.includes('issue')) {
        coverageScores.pain_points = Math.max(coverageScores.pain_points || 0, 0.5);
      }
      if (text.includes('slow') || text.includes('delay') || text.includes('block')) {
        coverageScores.blockers = Math.max(coverageScores.blockers || 0, 0.5);
      }
      if (text.includes('handoff') || text.includes('team') || text.includes('department')) {
        coverageScores.handoffs = Math.max(coverageScores.handoffs || 0, 0.5);
      }
      if (text.includes('constraint') || text.includes('limit') || text.includes('budget')) {
        coverageScores.constraints = Math.max(coverageScores.constraints || 0, 0.5);
      }
      if (text.includes('customer') || text.includes('user') || text.includes('impact')) {
        coverageScores.customer_impact = Math.max(coverageScores.customer_impact || 0, 0.5);
      }
    }
  }
  
  technique.totalLearnerQs = totalLearnerQs;
  technique.closedCount = closedCount;
  technique.openRatio = totalLearnerQs > 0 ? openQuestions / totalLearnerQs : 0;
  
  const coveredAreas = Object.keys(coverageScores).filter(key => coverageScores[key] >= 0.5);
  const missedAreas = Object.keys(coverageScores).filter(key => coverageScores[key] < 0.5);
  
  const avgCoverage = Object.values(coverageScores).reduce((sum, score) => sum + score, 0) / Object.keys(coverageScores).length;
  const overall = avgCoverage * 0.7 + technique.openRatio * 0.3;
  
  // Generate coaching data
  const closedExamples = [];
  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    if (turn.role === 'learner' && isClosedQuestion(turn.text)) {
      closedExamples.push({
        turnIdx: i,
        original: turn.text,
        rewrite: rewriteToOpen(turn.text)
      });
      if (closedExamples.length >= 3) break;
      }
  }
  
  return {
    coverageScores,
    technique,
    independence: Object.fromEntries(Object.keys(coverageScores).map(key => [key, 1.0])),
    overall,
    passed: overall >= 0.65,
    coveredAreas,
    missedAreas,
    nextTimeScripts: generateNextTimeScripts(missedAreas),
    evidence: [],
    coaching: {
      closedExamples,
      nextTimeScripts: generateNextTimeScripts(missedAreas, 5),
      miniLessons: collectMiniLessons(missedAreas, 3)
    }
  };
}

module.exports = function debriefRoutes(fastify) {
  // POST /api/debrief - Generate debrief with coaching
  fastify.post('/api/debrief', async (request, reply) => {
    try {
      const { sessionId, mode = 'practice' } = request.body;

      // Mock data
      const mockStage = {
        id: 'problem_exploration',
        name: 'Problem Exploration',
        must_cover: ['pain_points', 'blockers', 'handoffs', 'constraints', 'customer_impact']
      };

      const mockCards = [
        {
          id: '1',
          stage_id: 'problem_exploration',
          text: 'What are your biggest pain points?',
          cover_key: 'pain_points'
        },
        {
          id: '2',
          stage_id: 'problem_exploration',
          text: 'What slows down your process?',
          cover_key: 'blockers'
        }
      ];

      const mockTranscript = [
        { role: 'learner', text: 'What are your biggest pain points?' },
        { role: 'stakeholder', text: 'The onboarding process is too slow and confusing for customers.' },
        { role: 'learner', text: 'Is it really that bad?' },
        { role: 'stakeholder', text: 'Yes, customers often complain about delays and lack of clarity.' },
        { role: 'learner', text: 'What slows down the process?' },
        { role: 'stakeholder', text: 'Manual handoffs between teams cause delays and information gets lost.' },
        { role: 'learner', text: 'Do you think this will work?' },
        { role: 'stakeholder', text: 'I think we need to improve the integration between systems.' }
      ];

      const result = scoreMeeting(mockStage, mockCards, mockTranscript);

      console.log('📊 Scoring result:', {
        overall: result.overall,
        passed: result.passed,
        closedCount: result.technique.closedCount,
        coachingExamples: result.coaching?.closedExamples?.length || 0
      });

      return reply.send({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ Error generating debrief:', error);
      
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to generate debrief'
      });
    }
  });

  // GET /api/debrief/:sessionId - Get existing debrief
  fastify.get('/api/debrief/:sessionId', async (request, reply) => {
    try {
      const { sessionId } = request.params;

      // Mock result
      const mockResult = {
        coverageScores: {
          pain_points: 0.5,
          blockers: 0.3,
          handoffs: 0,
          constraints: 0.2,
          customer_impact: 0.6
        },
        technique: {
          openRatio: 0.6,
          followUp: 0.4,
          talkBalance: 0.5,
          earlySolutioning: false,
          closedCount: 2,
          totalLearnerQs: 8
        },
        independence: {
          pain_points: 1,
          blockers: 1,
          handoffs: 1,
          constraints: 1,
          customer_impact: 1
        },
        overall: 0.55,
        passed: false,
        coveredAreas: ['pain_points', 'customer_impact'],
        missedAreas: ['handoffs', 'constraints'],
        nextTimeScripts: [
          'For handoffs: "Where do things typically fall apart between teams?"',
          'For constraints: "What limitations should we keep in mind?"'
        ],
        evidence: [],
        coaching: {
          closedExamples: [
            {
              turnIdx: 3,
              original: 'Is it really that bad?',
              rewrite: 'What makes it feel that way for you?'
            },
            {
              turnIdx: 7,
              original: 'Do you think this will work?',
              rewrite: 'What would success look like for this solution?'
            }
          ],
          nextTimeScripts: [
            'Where do things typically fall apart between teams?',
            'What limitations should we keep in mind?',
            'Ask open-ended questions that start with What, How, Why, or Tell me about...',
            'Use follow-up questions to dig deeper into stakeholder responses'
          ],
          miniLessons: [
            {
              key: 'handoffs',
              tip: 'Handoffs between teams are common failure points. Understanding these gaps helps design better integration and communication processes.'
            },
            {
              key: 'constraints',
              tip: 'Constraints (technical, budget, time, people) significantly impact what solutions are feasible. Understanding these early prevents unrealistic expectations.'
            }
          ]
        }
      };

      return reply.send({
        success: true,
        data: mockResult
      });

    } catch (error) {
      console.error('❌ Error fetching debrief:', error);
      
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to fetch debrief'
      });
    }
  });

  // GET /api/coaching/meta - Get coaching metadata
  fastify.get('/api/coaching/meta', async (request, reply) => {
    try {
      return reply.send({
        success: true,
        data: mockCoachingMeta
      });

    } catch (error) {
      console.error('❌ Error fetching coaching metadata:', error);
      
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to fetch coaching metadata'
      });
    }
  });
};





























