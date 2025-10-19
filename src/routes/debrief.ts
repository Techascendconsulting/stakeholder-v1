import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ScoringEngine, ScoringInput, Turn } from '../lib/scoring';

interface DebriefRequest {
  sessionId: string;
  mode?: 'practice' | 'assess';
}

interface DebriefResponse {
  success: boolean;
  data?: {
    coverageScores: Record<string, number>;
    technique: {
      openRatio: number;
      followUp: number;
      talkBalance: number;
      earlySolutioning: boolean;
    };
    independence: Record<string, number>;
    overall: number;
    passed: boolean;
    coveredAreas: string[];
    missedAreas: string[];
    nextTimeScripts: string[];
    evidence: Array<{
      key: string;
      turnIdx: number;
      kind: 'direct_q' | 'follow_up' | 'stakeholder_prompted';
    }>;
  };
  error?: string;
}

export default async function debriefRoutes(fastify: FastifyInstance) {
  const scoringEngine = new ScoringEngine();

  fastify.post('/api/debrief', async (request: FastifyRequest<{ Body: DebriefRequest }>, reply: FastifyReply): Promise<DebriefResponse> => {
    try {
      const { sessionId, mode = 'practice' } = request.body;

      // Fetch session data from database
      const session = await fastify.db.query(
        'SELECT * FROM user_meetings WHERE id = $1',
        [sessionId]
      );

      if (!session.rows[0]) {
        return reply.status(404).send({
          success: false,
          error: 'Session not found'
        });
      }

      const meetingData = session.rows[0];
      const stageId = meetingData.stage_id;
      const transcript = meetingData.transcript || [];

      // Fetch stage data
      const stageResult = await fastify.db.query(
        'SELECT * FROM stage_packs WHERE id = $1',
        [stageId]
      );

      if (!stageResult.rows[0]) {
        return reply.status(404).send({
          success: false,
          error: 'Stage not found'
        });
      }

      const stage = stageResult.rows[0];

      // Fetch question cards for this stage
      const cardsResult = await fastify.db.query(
        'SELECT * FROM question_cards WHERE stage_id = $1',
        [stageId]
      );

      // Fetch hint events for this session
      const hintEventsResult = await fastify.db.query(
        'SELECT * FROM hint_events WHERE session_id = $1 ORDER BY created_at',
        [sessionId]
      );

      // Fetch scoring config
      const configResult = await fastify.db.query(
        'SELECT * FROM scoring_config WHERE stage_id = $1',
        [stageId]
      );

      const config = configResult.rows[0] || {
        pass_threshold: 0.65,
        practice_weights: { coverage: 0.6, independence: 0.2, technique: 0.2 },
        assess_weights: { coverage: 0.7, independence: 0.1, technique: 0.2 }
      };

      // Prepare scoring input
      const scoringInput: ScoringInput = {
        stage: {
          id: stage.id,
          must_cover: stage.must_cover
        },
        cards: cardsResult.rows,
        transcript: transcript as Turn[],
        hintEvents: hintEventsResult.rows.map(event => ({
          card_id: event.card_id,
          event_type: event.event_type,
          ts: event.created_at
        })),
        passThreshold: config.pass_threshold,
        useEmbeddings: false // For now, use BM25 fallback
      };

      // Run scoring
      const scoringOutput = await scoringEngine.scoreMeeting(scoringInput);

      // Save debrief results to database
      await fastify.db.query(
        `INSERT INTO debriefs (
          session_id, 
          stage_id, 
          coverage_scores, 
          technique_scores, 
          independence_scores, 
          overall_score, 
          passed, 
          covered_areas, 
          missed_areas, 
          next_time_scripts, 
          evidence,
          mode,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (session_id) DO UPDATE SET
          coverage_scores = EXCLUDED.coverage_scores,
          technique_scores = EXCLUDED.technique_scores,
          independence_scores = EXCLUDED.independence_scores,
          overall_score = EXCLUDED.overall_score,
          passed = EXCLUDED.passed,
          covered_areas = EXCLUDED.covered_areas,
          missed_areas = EXCLUDED.missed_areas,
          next_time_scripts = EXCLUDED.next_time_scripts,
          evidence = EXCLUDED.evidence,
          mode = EXCLUDED.mode,
          updated_at = NOW()`,
        [
          sessionId,
          stageId,
          JSON.stringify(scoringOutput.coverageScores),
          JSON.stringify(scoringOutput.technique),
          JSON.stringify(scoringOutput.independence),
          scoringOutput.overall,
          scoringOutput.passed,
          scoringOutput.coveredAreas,
          scoringOutput.missedAreas,
          scoringOutput.nextTimeScripts,
          JSON.stringify(scoringOutput.evidence),
          mode
        ]
      );

      return {
        success: true,
        data: scoringOutput
      };

    } catch (error) {
      console.error('Debrief error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get debrief results for a session
  fastify.get('/api/debrief/:sessionId', async (request: FastifyRequest<{ Params: { sessionId: string } }>, reply: FastifyReply) => {
    try {
      const { sessionId } = request.params;

      const result = await fastify.db.query(
        'SELECT * FROM debriefs WHERE session_id = $1',
        [sessionId]
      );

      if (!result.rows[0]) {
        return reply.status(404).send({
          success: false,
          error: 'Debrief not found'
        });
      }

      const debrief = result.rows[0];

      return {
        success: true,
        data: {
          coverageScores: debrief.coverage_scores,
          technique: debrief.technique_scores,
          independence: debrief.independence_scores,
          overall: debrief.overall_score,
          passed: debrief.passed,
          coveredAreas: debrief.covered_areas,
          missedAreas: debrief.missed_areas,
          nextTimeScripts: debrief.next_time_scripts,
          evidence: debrief.evidence,
          mode: debrief.mode
        }
      };

    } catch (error) {
      console.error('Get debrief error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
}




















