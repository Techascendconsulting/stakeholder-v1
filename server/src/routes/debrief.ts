/**
 * Debrief API routes with coaching integration
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { scoreMeeting, type ScoringInput } from '../lib/scoring';
import { getAllCoachingMeta } from '../lib/coaching';

interface DebriefRequest {
  sessionId: string;
  mode?: 'practice' | 'assess';
}

interface DebriefResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function debriefRoutes(fastify: FastifyInstance) {
  // POST /api/debrief - Generate debrief with coaching
  fastify.post<{ Body: DebriefRequest }>('/api/debrief', async (request, reply) => {
    try {
      const { sessionId, mode = 'practice' } = request.body;

      // TODO: Fetch session data from database
      // For now, use mock data
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
        },
        {
          id: '3',
          stage_id: 'problem_exploration',
          text: 'Where do handoffs break down?',
          cover_key: 'handoffs'
        },
        {
          id: '4',
          stage_id: 'problem_exploration',
          text: 'What constraints should we consider?',
          cover_key: 'constraints'
        },
        {
          id: '5',
          stage_id: 'problem_exploration',
          text: 'How does this affect customers?',
          cover_key: 'customer_impact'
        }
      ];

      // TODO: Fetch actual transcript from database
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

      // Get coaching metadata
      const metaByKey = getAllCoachingMeta();

      // Score the meeting with coaching
      const scoringInput: ScoringInput = {
        stage: mockStage,
        cards: mockCards,
        transcript: mockTranscript,
        passThreshold: 0.65,
        useEmbeddings: false,
        metaByKey
      };

      const result = scoreMeeting(scoringInput);

      // TODO: Save result to database
      console.log('📊 Scoring result:', {
        overall: result.overall,
        passed: result.passed,
        closedCount: result.technique.closedCount,
        coachingExamples: result.coaching?.closedExamples?.length || 0
      });

      const response: DebriefResponse = {
        success: true,
        data: result
      };

      return reply.send(response);

    } catch (error) {
      console.error('❌ Error generating debrief:', error);
      
      const response: DebriefResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate debrief'
      };

      return reply.status(500).send(response);
    }
  });

  // GET /api/debrief/:sessionId - Get existing debrief
  fastify.get<{ Params: { sessionId: string } }>('/api/debrief/:sessionId', async (request, reply) => {
    try {
      const { sessionId } = request.params;

      // TODO: Fetch from database
      // For now, return mock data
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

      const response: DebriefResponse = {
        success: true,
        data: mockResult
      };

      return reply.send(response);

    } catch (error) {
      console.error('❌ Error fetching debrief:', error);
      
      const response: DebriefResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch debrief'
      };

      return reply.status(500).send(response);
    }
  });

  // GET /api/coaching/meta - Get coaching metadata
  fastify.get('/api/coaching/meta', async (request, reply) => {
    try {
      const metaByKey = getAllCoachingMeta();
      
      const response = {
        success: true,
        data: metaByKey
      };

      return reply.send(response);

    } catch (error) {
      console.error('❌ Error fetching coaching metadata:', error);
      
      const response = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch coaching metadata'
      };

      return reply.status(500).send(response);
    }
  });
}































