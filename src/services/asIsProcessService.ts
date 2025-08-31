import { singleAgentSystem } from './kb';

export interface AsIsProcessGuidance {
  title: string;
  description: string;
  why: string;
  how: string;
  examples: string[];
}

export interface AsIsProcessEvaluation {
  verdict: 'GOOD' | 'AMBER' | 'OOS';
  message: string;
  suggestedRewrite?: string;
  reasoning: string;
  technique: string;
}

class AsIsProcessService {
  private static instance: AsIsProcessService;

  private constructor() {}

  static getInstance(): AsIsProcessService {
    if (!AsIsProcessService.instance) {
      AsIsProcessService.instance = new AsIsProcessService();
    }
    return AsIsProcessService.instance;
  }

  async getAsIsProcessGuidance(): Promise<AsIsProcessGuidance> {
    return {
      title: "As-Is Process Mapping Guide",
      description: "Understanding the current process step-by-step",
      why: "This question is crucial because it helps you map out the existing process landscape, identify who does what, which systems are involved, and where the current bottlenecks or inefficiencies lie. It provides the foundation for understanding what needs to change.",
      how: "Ask open-ended questions that encourage stakeholders to walk through their current process chronologically. Focus on capturing the sequence of activities, roles and responsibilities, systems used, and decision points. Encourage them to describe real scenarios rather than ideal processes.",
      examples: [
        "Can you walk me through a typical day when this process happens?",
        "Who is involved at each step and what do they do?",
        "What systems or tools do you use during this process?",
        "Where do you typically encounter delays or issues?",
        "What happens if something goes wrong at any step?"
      ]
    };
  }

  async evaluateAsIsProcessQuestion(message: string): Promise<AsIsProcessEvaluation> {
    try {
      const response = await singleAgentSystem.invoke(`
        You are an expert Business Analyst evaluating a process mapping question for the "As-Is" stage of stakeholder interviews.

        The user's question: "${message}"

        Evaluate this question based on the following criteria:

        1. **GOOD**: The question effectively asks for a step-by-step walkthrough of the current process, including roles, systems, and sequence of activities. It's open-ended and encourages detailed process mapping.

        2. **AMBER**: The question is somewhat relevant but could be more specific about process mapping, roles, or systems. It might be too broad or too narrow.

        3. **OOS**: The question is not about process mapping or current state analysis. It might be about solutions, future state, or unrelated topics.

        Respond with a JSON object:
        {
          "verdict": "GOOD|AMBER|OOS",
          "message": "Brief evaluation message",
          "suggestedRewrite": "Improved question (only if AMBER)",
          "reasoning": "Detailed explanation of the evaluation",
          "technique": "Process Mapping technique used"
        }

        Focus on whether the question will effectively map out the current process, identify roles and responsibilities, and capture the systems and tools used.
      `);

      const evaluation = JSON.parse(response);
      return evaluation;
    } catch (error) {
      console.error('As-Is process evaluation failed:', error);
      
      // Fallback evaluation
      const isProcessMapping = /(walk.*through|step.*step|process.*work|how.*work|current.*process|who.*what|systems|tools)/i.test(message);
      const isAsIs = /(today|current|now|existing|present)/i.test(message);
      const isSolutioning = /(should|could|would|improve|better|fix|change|future)/i.test(message);
      
      if (isSolutioning) {
        return {
          verdict: 'OOS',
          message: "This question focuses on solutions rather than understanding the current process.",
          reasoning: "In the As-Is stage, we need to understand the current process before discussing improvements.",
          technique: "Process Mapping"
        };
      } else if (isProcessMapping && isAsIs) {
        return {
          verdict: 'GOOD',
          message: "Excellent process mapping question!",
          reasoning: "This question effectively asks for a step-by-step walkthrough of the current process.",
          technique: "Process Mapping"
        };
      } else {
        return {
          verdict: 'AMBER',
          message: "Let's refine this to focus more on the current process mapping.",
          suggestedRewrite: "From your perspective, can you walk me through how this process works today, from the moment it starts to the final outcome? Who does what, using which systems?",
          reasoning: "The question could be more specific about mapping the current process step-by-step.",
          technique: "Process Mapping"
        };
      }
    }
  }
}

export default AsIsProcessService;
