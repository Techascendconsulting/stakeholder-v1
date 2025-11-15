# Stakeholder Meeting Intelligence Architecture
## BA WorkXP Elicitation Practice System

> **Purpose**: Transform stakeholder meetings from scripted Q&A into dynamic, realistic elicitation training that adapts to meeting stage, project context, and multiple stakeholders.

---

## 1. SYSTEM OVERVIEW

### Core Principles
1. **Stage-Driven Intelligence**: Stakeholder behavior changes based on meeting stage (kick

off, problem exploration, as-is, to-be, wrap-up)
2. **Project-Aware Responses**: All answers reference actual project data (e.g., Customer Onboarding Optimization)
3. **Multi-Stakeholder Dynamics**: Multiple stakeholders can be present, each with distinct perspectives
4. **Real-Time Coaching**: Evaluate questions instantly with Green/Amber/Red feedback
5. **Progressive Disclosure**: Stakeholders reveal information gradually based on question quality

---

## 2. MEETING STAGES & OBJECTIVES

### Stage Definitions
```typescript
type MeetingStage = 'kickoff' | 'problem_exploration' | 'as_is' | 'to_be' | 'wrap_up';

const STAGE_OBJECTIVES = {
  kickoff: {
    goal: "Establish rapport, understand project scope and success criteria",
    stakeholder_openness: "Guarded - assessing BA competence",
    information_depth: "High-level only",
    forbidden_topics: ["detailed processes", "pain points", "solutions"],
    redirect_message: "Let's focus on understanding the project scope first."
  },
  problem_exploration: {
    goal: "Identify 2-3 specific pain points with real examples",
    stakeholder_openness: "Cooperative - willing to share frustrations",
    information_depth: "Specific examples, emotions, impact",
    forbidden_topics: ["process steps", "solutions", "technical details"],
    redirect_message: "Before we discuss how things work, let's understand what's not working."
  },
  as_is: {
    goal: "Map current process step-by-step with handoffs and systems",
    stakeholder_openness: "Descriptive - explaining current reality",
    information_depth: "Step-by-step details, systems, handoffs",
    forbidden_topics: ["solutions", "improvements", "pain points"],
    redirect_message: "Let's stick to describing how it works today, step by step."
  },
  to_be: {
    goal: "Explore desired improvements and future state vision",
    stakeholder_openness: "Visionary - excited about possibilities",
    information_depth: "Ideal scenarios, improvements, priorities",
    forbidden_topics: ["current state", "past problems"],
    redirect_message: "Let's focus on how we want things to work in the future."
  },
  wrap_up: {
    goal: "Confirm understanding and establish next steps",
    stakeholder_openness: "Conclusive - wrapping up conversation",
    information_depth: "Summary confirmation only",
    forbidden_topics: ["new questions", "deep dives"],
    redirect_message: "Let's wrap up by confirming what we've discussed."
  }
};
```

---

## 3. PROJECT & STAKEHOLDER CONTEXT

### Project Structure
```typescript
interface ProjectContext {
  id: string;
  name: string; // "Customer Onboarding Optimization"
  industry: string; // "SaaS Technology"
  objective: string; // Brief goal statement
  complexity: 'low' | 'medium' | 'high';
  currentState: string; // 1-2 sentence summary
  challenges: string[]; // 3-5 key challenges
  expectedOutcomes: string[]; // 3-5 measurable outcomes
  constraints: string[]; // Budget, timeline, technical
  stakeholders: StakeholderProfile[];
}

interface StakeholderProfile {
  id: string;
  name: string; // "James Walker"
  role: string; // "Head of Customer Success"
  department: string;
  expertise: string[]; // What they know deeply
  personality: string; // "Collaborative, data-driven, solution-oriented"
  priorities: string[]; // What they care about most
  hidden_insights: string[]; // Information they reveal only with good questions
  frustrations: string[]; // Emotional drivers
  process_knowledge: Record<MeetingStage, string>; // Stage-specific responses
}
```

### Example: Customer Onboarding Project
```json
{
  "id": "customer-onboarding-optimization",
  "name": "Customer Onboarding Optimization",
  "industry": "SaaS Technology",
  "objective": "Reduce onboarding time from 2-3 weeks to 3-5 days while improving customer satisfaction",
  "complexity": "high",
  "currentState": "Manual onboarding across 3 disconnected systems, 25% first-month drop-off rate, 2-3 week completion time",
  "challenges": [
    "Manual data entry across multiple systems",
    "No visibility into customer progress",
    "Inconsistent communication touchpoints",
    "High support ticket volume during onboarding",
    "Lack of self-service options"
  ],
  "expectedOutcomes": [
    "Reduce onboarding time to 3-5 days",
    "Decrease first-month churn by 50%",
    "Increase CSAT scores to 4.5+",
    "Automate 70% of verification processes"
  ],
  "constraints": [
    "Budget: $150,000",
    "Timeline: 6 months",
    "Must integrate with existing Salesforce CRM",
    "GDPR/SOC2 compliance required"
  ]
}
```

---

## 4. STAKEHOLDER BEHAVIOR MODEL

### Personality Matrix
```typescript
interface StakeholderBehavior {
  // Base traits
  openness: number; // 1-10: How willing to share information
  detail_level: number; // 1-10: How much detail they provide unprompted
  technical_depth: number; // 1-10: Technical vs. business language
  impatience_trigger: string[]; // Questions that annoy them
  
  // Stage-specific behavior
  stage_responses: {
    kickoff: {
      greeting_style: "formal" | "casual" | "neutral";
      information_guard: "high" | "medium" | "low";
      trust_threshold: number; // Questions before they open up
    };
    problem_exploration: {
      emotion_level: "high" | "medium" | "low";
      example_richness: "sparse" | "moderate" | "detailed";
      solution_jumping: "frequently" | "occasionally" | "rarely";
    };
    as_is: {
      process_clarity: "vague" | "moderate" | "precise";
      handoff_mentions: boolean; // Do they naturally mention handoffs?
      system_names: boolean; // Do they specify system names?
    };
    to_be: {
      visionary_level: "conservative" | "balanced" | "ambitious";
      priority_clarity: "unclear" | "some_priorities" | "clear_ranking";
    };
  };
}
```

### Response Generation Rules

#### Rule 1: Answer Length by Question Quality
```typescript
const RESPONSE_LENGTH = {
  GREEN_QUESTION: {
    sentences: [4, 7], // 4-7 sentences
    includes: ["specific example", "concrete data", "emotional context"]
  },
  AMBER_QUESTION: {
    sentences: [2, 3], // 2-3 sentences
    includes: ["partial answer", "hint for better question"]
  },
  RED_QUESTION: {
    sentences: [1, 2], // 1-2 sentences
    includes: ["redirect", "confusion signal"]
  }
};
```

#### Rule 2: Progressive Disclosure
```typescript
const INFORMATION_LAYERS = {
  layer_1_surface: "Obvious pain points anyone would mention",
  layer_2_specific: "Concrete examples with numbers/timeline",
  layer_3_emotional: "Personal frustrations and team impact",
  layer_4_hidden: "Root causes and systemic issues",
  layer_5_solution_hints: "What they've tried, what might work"
};

// Unlock criteria:
// - Layer 1: Any relevant question
// - Layer 2: Open-ended question mentioning specific area
// - Layer 3: Empathetic question acknowledging their challenge
// - Layer 4: Follow-up question digging into "why"
// - Layer 5: Question about their perspective on solutions
```

#### Rule 3: Off-Stage Redirects
```javascript
// If user asks about solutions during problem_exploration:
function generateRedirect(userQuestion, currentStage, forbiddenTopic) {
  return {
    response: [
      stakeholderAcknowledgement(), // "That's a good point about..."
      stageRealignment(), // "But before we get into solutions..."
      stageObjectiveReminder() // "I'd like to focus on understanding..."
    ].join(' '),
    coachingTrigger: {
      verdict: "AMBER",
      reason: `The learner jumped ahead to ${forbiddenTopic}, which is not appropriate for ${currentStage} stage.`,
      correction: `In ${currentStage}, BAs should focus on ${STAGE_OBJECTIVES[currentStage].goal}`
    }
  };
}
```

### Multi-Stakeholder Dynamics
```typescript
interface MultiStakeholderMeeting {
  participants: StakeholderProfile[];
  turn_taking_logic: {
    // Who answers based on question content
    question_routing: (question: string) => string; // stakeholder_id
    
    // Examples:
    routing_rules: {
      mentions_customer_experience: "james-walker", // Head of Customer Success
      mentions_support_tickets: "jess-morgan", // Customer Service Manager
      mentions_systems_integration: "david-thompson", // IT Systems Lead
      mentions_cost_or_budget: "james-walker", // Senior stakeholder
      generic_question: "most_relevant_or_random"
    };
    
    // Cross-references between stakeholders
    stakeholder_mentions: {
      james_mentions_jess: "Jess's team handles most of the support tickets during onboarding...",
      jess_mentions_david: "David would know more about the technical side...",
      david_mentions_james: "From James's perspective, the customer experience is..."
    };
  };
  
  // Disagreement scenarios (advanced)
  conflicts: {
    trigger: "When stakeholders have different priorities",
    example: {
      james: "We need to prioritize customer experience",
      david: "We need to prioritize security and compliance",
      ba_action: "Acknowledge both perspectives, probe for common ground"
    }
  };
}
```

---

## 5. QUESTION EVALUATION ENGINE (Green/Amber/Red)

### Evaluation Criteria

#### GREEN (Strong Elicitation)
```typescript
interface GreenCriteria {
  characteristics: [
    "Open-ended (starts with what/how/why/tell me/describe/walk me through)",
    "Stage-appropriate (matches current meeting objective)",
    "Specific but not leading (asks about area without assuming answer)",
    "One focus at a time (not compound questions)",
    "Non-judgmental tone"
  ];
  
  examples_by_stage: {
    kickoff: [
      "Can you help me understand the main objective of this project from your perspective?",
      "What does success look like for you at the end of this initiative?",
      "Who are the key stakeholders I should be aware of?"
    ],
    problem_exploration: [
      "What are the biggest challenges your team faces with the current onboarding process?",
      "Can you walk me through a recent example where the process caused frustration?",
      "How does this impact your team's day-to-day work?"
    ],
    as_is: [
      "Can you describe the onboarding process step by step, starting from when a new customer signs up?",
      "What systems or tools are involved in each step?",
      "When you hand off to another team, how does that work?"
    ],
    to_be: [
      "If you could redesign this process, what would be different?",
      "What's the most important improvement from your perspective?",
      "How do you envision the customer experience in the improved process?"
    ]
  };
  
  scoring: {
    openness: 30, // Is it open-ended?
    stage_alignment: 30, // Matches stage objective?
    specificity: 20, // Asks about specific area?
    neutrality: 20 // Non-leading, non-judgmental?
  };
}
```

#### AMBER (Partially Effective)
```typescript
interface AmberCriteria {
  characteristics: [
    "Closed-ended but relevant (yes/no questions)",
    "Compound question (asks 2-3 things at once)",
    "Slightly off-stage but recoverable",
    "Too broad or too narrow",
    "Slightly leading language"
  ];
  
  examples: [
    "Is the onboarding process causing problems?", // Too closed
    "What are the challenges and how long does it take and who's responsible?", // Compound
    "Don't you think automation would help?", // Leading
    "Can you tell me about the entire customer journey from signup to renewal?" // Too broad for one question
  ];
  
  coaching_response: {
    acknowledge: "That's a relevant question, but let's refine it.",
    explain_issue: "Closed-ended questions often get yes/no answers. Open-ended questions get richer information.",
    show_better: "Instead, try: 'What challenges do you face with the current onboarding process?'",
    principle: "🎯 BA Principle: Ask one open-ended question at a time to encourage detailed responses."
  };
}
```

#### RED (Ineffective/Off-Track)
```typescript
interface RedCriteria {
  characteristics: [
    "Off-stage (asks about solutions during problem exploration)",
    "Multiple unrelated questions",
    "Judgmental or assumptive",
    "Too technical too early",
    "Irrelevant to project"
  ];
  
  examples: [
    "What technology stack should we use?", // During problem_exploration
    "Why haven't you fixed this already?", // Judgmental
    "Tennis anyone?", // Completely off-topic
    "Can you explain your entire IT infrastructure?", // Too broad and technical
  ];
  
  coaching_response: {
    interrupt: true,
    message: "Let's pause and re-align.",
    explain_issue: "That question doesn't fit the current stage of our conversation.",
    redirect: "Right now, we're focused on understanding current challenges. Solutions come later.",
    show_better: "Try asking: 'What specific challenges are you facing with the current process?'",
    principle: "🚨 BA Principle: Follow the meeting stage sequence. Problem before solution. Current before future."
  };
}
```

### Scoring Algorithm
```typescript
interface EvaluationResult {
  verdict: 'GREEN' | 'AMBER' | 'RED';
  overall_score: number; // 0-100
  breakdown: {
    stage_alignment: number; // 0-30
    question_type: number; // 0-30 (open vs closed)
    specificity: number; // 0-20
    neutrality: number; // 0-20
  };
  triggers: string[]; // What caused the score
  reasons: string[]; // Human-readable explanations
  fixes: string[]; // Specific improvements
  suggested_rewrite: string; // Better version of their question
}

async function evaluateQuestion(
  question: string,
  stage: MeetingStage,
  projectContext: ProjectContext,
  conversationHistory: Message[]
): Promise<EvaluationResult> {
  
  // Step 1: Check for off-topic
  if (isCompletelyOffTopic(question)) {
    return {
      verdict: 'RED',
      overall_score: 0,
      breakdown: { stage_alignment: 0, question_type: 0, specificity: 0, neutrality: 0 },
      triggers: ['OFF_TOPIC'],
      reasons: ["This question is not related to the project or meeting objective."],
      fixes: ["Refocus on the project scope.", "Ask about the stakeholder's role or challenges."],
      suggested_rewrite: `What challenges are you currently facing with the ${projectContext.name}?`
    };
  }
  
  // Step 2: Stage alignment
  const stageScore = evaluateStageAlignment(question, stage);
  
  // Step 3: Question type (open vs closed)
  const typeScore = evaluateQuestionType(question);
  
  // Step 4: Specificity
  const specificityScore = evaluateSpecificity(question, projectContext);
  
  // Step 5: Neutrality (non-leading)
  const neutralityScore = evaluateNeutrality(question);
  
  // Combine scores
  const overall = stageScore + typeScore + specificityScore + neutralityScore;
  
  // Determine verdict
  let verdict: 'GREEN' | 'AMBER' | 'RED';
  if (overall >= 70) verdict = 'GREEN';
  else if (overall >= 40) verdict = 'AMBER';
  else verdict = 'RED';
  
  return {
    verdict,
    overall_score: overall,
    breakdown: {
      stage_alignment: stageScore,
      question_type: typeScore,
      specificity: specificityScore,
      neutrality: neutralityScore
    },
    triggers: identifyTriggers(question, stage),
    reasons: generateReasons(verdict, stageScore, typeScore, specificityScore, neutralityScore),
    fixes: generateFixes(question, stage),
    suggested_rewrite: rewriteQuestion(question, stage, projectContext)
  };
}
```

---

## 6. COACHING ENGINE

### Coaching Response Structure
```typescript
interface CoachingFeedback {
  verdict: 'GREEN' | 'AMBER' | 'RED';
  
  // Header
  verdict_label: string; // "✅ Strong Question" | "⚠️ Could Be Better" | "🚨 Needs Improvement"
  verdict_color: string; // "green" | "amber" | "red"
  
  // Quick summary
  summary: string; // 1 sentence: "This is a closed question that limits the response."
  
  // Detailed breakdown
  what_happened: string; // "You asked a yes/no question..."
  why_it_matters: string; // "Closed questions typically get short answers..."
  what_to_do: string; // "Rephrase as an open-ended question starting with what/how/why..."
  
  // Suggested improvement
  suggested_rewrite: string; // Better version of their question
  rewrite_explanation: string; // Why the rewrite is better
  
  // Learning principle
  principle: string; // "🎯 BA Principle: Open-ended questions elicit richer information."
  principle_category: 'elicitation' | 'stage_management' | 'neutrality' | 'specificity';
  
  // Next action
  action: 'CONTINUE' | 'ACKNOWLEDGE_AND_RETRY' | 'PAUSE_FOR_COACHING';
  acknowledgement_required: boolean; // Does user need to click "Got it" before continuing?
}
```

### Coaching Templates

#### GREEN Feedback
```typescript
const GREEN_FEEDBACK = {
  summary: "Great question — this will elicit useful information.",
  what_happened: `You asked an open-ended question focused on ${stage_objective}.`,
  why_it_matters: "This type of question encourages detailed responses and shows you're listening.",
  what_to_do: "Continue with follow-up questions to dig deeper into what they share.",
  principle: "🎯 BA Principle: Open-ended questions starting with 'what', 'how', or 'why' unlock richer insights.",
  action: 'CONTINUE',
  acknowledgement_required: false
};
```

#### AMBER Feedback
```typescript
const AMBER_FEEDBACK = {
  summary: "This question is relevant but could be more effective.",
  what_happened: "You asked a closed question, which may get a brief yes/no answer.",
  why_it_matters: "Closed questions limit the depth of information you receive. In BA work, we want stakeholders to elaborate.",
  what_to_do: "Rephrase as an open-ended question to encourage a fuller response.",
  suggested_rewrite: "What challenges are you facing with the current onboarding process?",
  rewrite_explanation: "This version invites a detailed answer instead of just yes/no.",
  principle: "💡 BA Principle: Open-ended questions = richer information. Save closed questions for confirmation.",
  action: 'ACKNOWLEDGE_AND_RETRY',
  acknowledgement_required: true,
  options: [
    { label: "Use Suggested Question", action: "USE_REWRITE" },
    { label: "Try My Own Version", action: "RETRY" },
    { label: "Learn More", action: "EXPAND_COACHING" }
  ]
};
```

#### RED Feedback
```typescript
const RED_FEEDBACK = {
  summary: "This question doesn't fit our current meeting stage.",
  what_happened: `You asked about ${forbidden_topic}, but we're currently in the ${stage} stage where the focus is on ${stage_objective}.`,
  why_it_matters: "Jumping ahead disrupts the natural flow of discovery. In BA work, we follow a logical sequence: understand problems before discussing solutions.",
  what_to_do: `Refocus on ${stage_objective}. Save solution discussions for the '${next_appropriate_stage}' stage.`,
  suggested_rewrite: generateStageAppropriateQuestion(stage, projectContext),
  rewrite_explanation: "This question aligns with our current objective.",
  principle: "🚨 BA Principle: Sequence matters. Problem → Process → Solution. Don't skip steps.",
  action: 'PAUSE_FOR_COACHING',
  acknowledgement_required: true,
  options: [
    { label: "Use Suggested Question", action: "USE_REWRITE" },
    { label: "Back to Meeting", action: "CLOSE" }
  ]
};
```

### Coaching Delivery Rules
1. **GREEN**: Show brief success message (2 seconds), no interruption
2. **AMBER**: Show coaching panel, lock input until acknowledged
3. **RED**: Full-screen coaching overlay, must acknowledge before continuing

---

## 7. FOLLOW-UP QUESTION GENERATOR

### Dynamic Next Question Logic
```typescript
interface FollowUpGenerator {
  // Inputs
  userQuestion: string;
  stakeholderResponse: string;
  currentStage: MeetingStage;
  projectContext: ProjectContext;
  conversationHistory: Message[];
  
  // Output
  suggestedFollowUps: {
    type: 'probe_deeper' | 'clarify' | 'explore_impact' | 'check_scope' | 'transition';
    question: string;
    rationale: string; // Why this follow-up makes sense
  }[];
}

// Generation rules:
const FOLLOWUP_RULES = {
  // If stakeholder mentions a pain point, probe deeper
  pain_point_mentioned: {
    detect: /challenge|problem|issue|difficult|frustrating|inefficient/i,
    generate: [
      "Can you give me a specific example of when this happened?",
      "How often does this occur?",
      "What impact does this have on your team?"
    ]
  },
  
  // If stakeholder mentions a system, explore handoffs
  system_mentioned: {
    detect: /system|platform|tool|CRM|database/i,
    generate: [
      "What happens after you complete that step in [system]?",
      "Who receives the information from [system]?",
      "Are there any issues with [system] integration?"
    ]
  },
  
  // If stakeholder gives vague answer, ask for specifics
  vague_answer: {
    detect: (response) => response.split(' ').length < 15,
    generate: [
      "Can you elaborate on that?",
      "What does that look like in practice?",
      "Can you walk me through an example?"
    ]
  },
  
  // If stakeholder mentions metrics, probe for baseline
  metric_mentioned: {
    detect: /percent|rate|time|hours|days|cost|\$/i,
    generate: [
      "What's the current baseline for that metric?",
      "How is that measured today?",
      "What would an acceptable target be?"
    ]
  },
  
  // If stakeholder mentions another person, explore their role
  person_mentioned: {
    detect: /team|department|[A-Z][a-z]+ (handles|does|manages|oversees)/,
    generate: [
      "How does [person/team] fit into this process?",
      "What's the handoff process between your team and theirs?",
      "Do they face similar challenges?"
    ]
  }
};
```

### Conversation Memory Rules
```typescript
interface ConversationMemory {
  // What we track
  topics_covered: string[]; // ["onboarding timeline", "system integration"]
  pain_points_identified: string[]; // Pain points mentioned
  follow_ups_needed: string[]; // Questions we should ask later
  stakeholder_emotion: 'frustrated' | 'neutral' | 'optimistic';
  information_layers_unlocked: number; // 1-5 (see progressive disclosure)
  
  // When to move to next stage
  stage_completion_criteria: {
    problem_exploration: {
      required: ["Identified 2-3 specific pain points", "Got concrete examples", "Understood impact"],
      actual: ["Pain point 1: Manual data entry", "Pain point 2: System disconnect"],
      complete: boolean;
    };
    as_is: {
      required: ["Mapped end-to-end process", "Identified systems used", "Documented handoffs"],
      actual: ["Step 1: Customer signup", "Step 2: CRM entry", ...],
      complete: boolean;
    };
  };
}

// When to suggest stage transition:
function shouldTransitionStage(memory: ConversationMemory, currentStage: MeetingStage): boolean {
  const criteria = memory.stage_completion_criteria[currentStage];
  if (!criteria) return false;
  
  return criteria.required.every(requirement => 
    criteria.actual.some(item => item.includes(requirement))
  );
}

// Transition coaching:
const STAGE_TRANSITION_COACHING = {
  message: `Great work! You've successfully gathered ${criteria.actual.length} key insights about ${stage}. 
  
  Would you like to:
  - Continue exploring this area
  - Move to the next stage (${next_stage})
  - Wrap up the meeting`,
  options: ['CONTINUE', 'NEXT_STAGE', 'WRAP_UP']
};
```

---

## 8. JSON OUTPUT BLUEPRINT

### Core Response Schema
```json
{
  "stakeholder_response": {
    "speaker_id": "james-walker",
    "speaker_name": "James Walker",
    "content": "That's a great question. The biggest challenge we face is the manual data entry across three different systems — our CRM, billing platform, and support portal. For each new customer, I personally spend about 45 minutes copying information between these systems. Last week alone, I onboarded 8 customers, which meant over 6 hours just on data entry. This delays our ability to schedule kickoff calls and frustrates customers who are waiting to get started.",
    "metadata": {
      "stage": "problem_exploration",
      "emotion": "frustrated",
      "information_layer": 2,
      "keywords": ["manual data entry", "three systems", "45 minutes", "delays"],
      "pain_points_revealed": ["manual data entry", "time consumption", "customer frustration"]
    }
  },
  
  "question_evaluation": {
    "verdict": "GREEN",
    "overall_score": 85,
    "breakdown": {
      "stage_alignment": 28,
      "question_type": 30,
      "specificity": 18,
      "neutrality": 19
    },
    "triggers": ["OPEN_ENDED", "STAGE_APPROPRIATE", "SPECIFIC_AREA"],
    "reasons": [
      "This is an open-ended question that encourages detailed responses.",
      "It focuses on challenges, which is appropriate for the problem_exploration stage.",
      "It's specific enough to guide the conversation without being leading."
    ]
  },
  
  "coaching_feedback": {
    "verdict_label": "✅ Strong Question",
    "summary": "Excellent — this open-ended question will elicit detailed information about pain points.",
    "principle": "🎯 BA Principle: Open-ended questions starting with 'what' or 'how' unlock richer insights.",
    "action": "CONTINUE",
    "acknowledgement_required": false,
    "display_duration_ms": 2000
  },
  
  "suggested_follow_ups": [
    {
      "type": "probe_deeper",
      "question": "Can you walk me through exactly what happens during that 45-minute data entry process?",
      "rationale": "Stakeholder mentioned a specific time metric. Digging into the steps will reveal inefficiencies."
    },
    {
      "type": "explore_impact",
      "question": "How does this delay impact the customer experience and your team's workflow?",
      "rationale": "Understanding impact helps prioritize improvements and builds the business case."
    },
    {
      "type": "check_scope",
      "question": "Are there other challenges beyond data entry that affect the onboarding process?",
      "rationale": "Ensures we don't miss other pain points before moving to the next stage."
    }
  ],
  
  "context_updates": {
    "topics_covered": ["manual data entry", "system fragmentation", "time consumption"],
    "pain_points_identified": [
      {
        "area": "Data Entry",
        "impact": "45 minutes per customer, 6 hours per week",
        "emotion": "frustrated",
        "layer": 2
      }
    ],
    "information_layers_unlocked": 2,
    "stage_progress": {
      "problem_exploration": {
        "pain_points_found": 1,
        "target": 3,
        "percent_complete": 33
      }
    },
    "should_transition": false,
    "next_milestone": "Identify 2 more pain points to complete problem exploration"
  },
  
  "system_actions": {
    "update_conversation_history": true,
    "show_coaching_panel": false,
    "lock_user_input": false,
    "trigger_stage_transition": false,
    "log_analytics": {
      "question_quality": "GREEN",
      "stage": "problem_exploration",
      "time_in_stage_seconds": 180,
      "information_revealed": "pain_point_with_metrics"
    }
  }
}
```

### Error Cases Schema
```json
{
  "error_type": "OFF_STAGE_QUESTION",
  "stakeholder_response": {
    "content": "That's an interesting point about automation, but I think we're getting ahead of ourselves. I'd like to first make sure you understand what we're dealing with today before we jump into solutions.",
    "metadata": {
      "redirect": true,
      "stage_reminder": "problem_exploration"
    }
  },
  "question_evaluation": {
    "verdict": "RED",
    "overall_score": 25,
    "triggers": ["OFF_STAGE", "SOLUTION_JUMPING"],
    "reasons": [
      "You asked about solutions during the problem exploration stage.",
      "This disrupts the natural discovery flow."
    ],
    "fixes": [
      "Refocus on understanding current challenges first.",
      "Save solution discussions for the to_be stage."
    ],
    "suggested_rewrite": "What specific challenges are you facing with the current onboarding process?"
  },
  "coaching_feedback": {
    "verdict_label": "🚨 Needs Realignment",
    "summary": "This question doesn't fit our current meeting stage.",
    "what_happened": "You asked about automation and solutions, but we're currently in problem_exploration where the focus is on understanding what's broken.",
    "why_it_matters": "Jumping to solutions too early can lead to building the wrong thing. We need to deeply understand problems first.",
    "what_to_do": "Refocus on uncovering pain points and their impact. Solutions come in the to_be stage.",
    "suggested_rewrite": "What are the biggest challenges your team faces with the current process?",
    "principle": "🚨 BA Principle: Problem → Process → Solution. Don't skip the understanding phase.",
    "action": "PAUSE_FOR_COACHING",
    "acknowledgement_required": true
  },
  "system_actions": {
    "show_coaching_panel": true,
    "lock_user_input": true,
    "play_error_sound": false,
    "highlight_stage_indicator": true
  }
}
```

---

## 9. COST-OPTIMIZED IMPLEMENTATION

### Model Selection Strategy

| Component | Model | Rationale | Est. Cost per Call |
|-----------|-------|-----------|-------------------|
| Stakeholder Response Generation | GPT-4o | Needs nuanced personality, project context | $0.02-0.04 |
| Question Evaluation (Initial) | GPT-4o-mini | Fast classification, pattern matching | $0.001-0.002 |
| Coaching Generation (Detailed) | GPT-4o | Needs pedagogical depth, examples | $0.02-0.03 |
| Follow-up Suggestions | GPT-4o-mini | Template-based with light reasoning | $0.002-0.003 |
| Context Summarization | GPT-4o-mini | Extract key points from history | $0.001-0.002 |

**Total per user question: ~$0.05-0.08**

### Optimization Techniques

#### 1. Context Compression
```typescript
// Instead of sending full conversation history:
function compressContext(conversationHistory: Message[]): string {
  // Only include: (1) Last 3 exchanges, (2) Key pain points identified, (3) Current stage
  const recentMessages = conversationHistory.slice(-6); // 3 exchanges
  const painPoints = extractPainPoints(conversationHistory);
  
  return `
  Recent conversation:
  ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}
  
  Pain points identified: ${painPoints.join(', ')}
  Current stage: ${currentStage}
  `;
}
// Token savings: ~70% (3,000 tokens → 900 tokens)
```

#### 2. Template-Based Fallbacks
```typescript
// For common question patterns, use templates instead of LLM:
const TEMPLATE_RESPONSES = {
  greeting: {
    pattern: /^(hi|hello|hey|good morning)/i,
    response: (stakeholder: StakeholderProfile, stage: MeetingStage) =>
      `Hello! Thanks for taking the time to meet today. I'm [Your Name], the Business Analyst working on the ${projectContext.name}. ${getStageIntroduction(stage)}`
  },
  clarification: {
    pattern: /^(can you (repeat|clarify|explain)|what did you mean)/i,
    response: (lastStakeholderMessage: string) =>
      rephraseLastMessage(lastStakeholderMessage)
  }
};

// Use template if pattern matches, otherwise call LLM
// Cost savings: 40% of questions match templates = $0.02 saved per question
```

#### 3. Caching Strategy
```typescript
interface CacheStrategy {
  // Cache stakeholder personalities (they don't change)
  stakeholder_prompts: {
    key: `stakeholder:${stakeholder_id}`,
    ttl: '7 days',
    size: '~2KB per stakeholder'
  };
  
  // Cache project context (changes rarely)
  project_context: {
    key: `project:${project_id}`,
    ttl: '7 days',
    size: '~5KB per project'
  };
  
  // Cache common evaluations (same questions get same scores)
  evaluation_cache: {
    key: `eval:${hash(question)}:${stage}`,
    ttl: '24 hours',
    size: '~1KB per evaluation'
  };
}
// Cost savings: 25% cache hit rate = $0.01 saved per question
```

#### 4. Batch Processing
```typescript
// If user types slowly, batch evaluations:
const BATCH_WINDOW_MS = 1000; // Wait 1 second after typing stops

async function handleUserMessage(message: string) {
  // Cancel any pending evaluation
  clearTimeout(evaluationTimeout);
  
  // Start new evaluation timer
  evaluationTimeout = setTimeout(async () => {
    const [evaluation, stakeholderResponse, followUps] = await Promise.all([
      evaluateQuestion(message),
      generateStakeholderResponse(message),
      generateFollowUps(message)
    ]);
    // Process all in parallel
  }, BATCH_WINDOW_MS);
}
// Cost savings: Reduces redundant calls if user is still typing
```

#### 5. Rate Limiting & Abuse Prevention
```typescript
const RATE_LIMITS = {
  questions_per_session: 100, // Max 100 questions per meeting
  sessions_per_day: 10, // Max 10 practice sessions per day per user
  concurrent_sessions: 2, // Max 2 active sessions at once
  typing_debounce: 500 // Wait 500ms after typing stops before evaluating
};

// Throttle expensive operations:
const throttledEvaluation = throttle(evaluateQuestion, 2000); // Max 1 evaluation per 2 seconds

// Prevent spam:
if (consecutiveSameQuestions > 3) {
  return {
    error: "You've asked very similar questions multiple times. Try a different approach."
  };
}
```

### Infrastructure Recommendations
```typescript
const INFRASTRUCTURE = {
  database: {
    session_storage: "PostgreSQL with JSON columns for conversation_history",
    caching: "Redis for stakeholder/project context",
    analytics: "ClickHouse for usage metrics (optional)"
  },
  
  api_architecture: {
    primary: "Next.js API routes (serverless)",
    llm_gateway: "LangChain or custom OpenAI client",
    response_streaming: "Enable streaming for stakeholder responses (better UX)"
  },
  
  monitoring: {
    costs: "Track OpenAI API costs per user, per session",
    performance: "Monitor response latency (target: <2s for stakeholder response)",
    quality: "Track question verdicts distribution (aim for 60% GREEN, 30% AMBER, 10% RED)"
  }
};
```

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Core Intelligence (Week 1-2)
```typescript
const PHASE_1_DELIVERABLES = [
  // Backend
  "Stage-aware stakeholder response generator",
  "Green/Amber/Red evaluation engine",
  "Basic coaching feedback system",
  "Conversation memory tracking",
  
  // Frontend
  "Updated meeting UI with stage indicator",
  "Coaching panel with verdict colors",
  "Suggested follow-up questions display",
  
  // Testing
  "Unit tests for evaluation logic",
  "Test all 5 stages with sample questions"
];
```

### Phase 2: Multi-Stakeholder & Polish (Week 3)
```typescript
const PHASE_2_DELIVERABLES = [
  "Multi-stakeholder turn-taking logic",
  "Stakeholder cross-references",
  "Progressive disclosure implementation",
  "Enhanced coaching templates",
  "Analytics dashboard (coach view)"
];
```

### Phase 3: Optimization & Scale (Week 4)
```typescript
const PHASE_3_DELIVERABLES = [
  "Implement caching strategy",
  "Add template-based responses",
  "Batch processing for parallel calls",
  "Rate limiting and abuse prevention",
  "Performance monitoring dashboards"
];
```

---

## 11. APPENDIX: QUICK REFERENCE

### Stage Cheat Sheet
| Stage | Goal | Green Question Example | Red Question Example |
|-------|------|----------------------|---------------------|
| **Kickoff** | Establish rapport, understand scope | "What are your main objectives for this project?" | "What technology should we use?" |
| **Problem Exploration** | Identify 2-3 pain points | "What challenges do you face with the current process?" | "How should we fix the onboarding flow?" |
| **As-Is** | Map current process step-by-step | "Can you walk me through the process from start to finish?" | "What improvements would you suggest?" |
| **To-Be** | Explore desired future state | "If you could redesign this, what would be different?" | "Why didn't you fix this already?" |
| **Wrap-Up** | Confirm understanding, next steps | "Let me summarize what I heard. Does this sound right?" | "Can we start discussing requirements now?" |

### Stakeholder Response Lengths
| Verdict | Sentences | Content |
|---------|-----------|---------|
| **GREEN** | 4-7 | Detailed answer with examples, numbers, emotions |
| **AMBER** | 2-3 | Partial answer with hint for better question |
| **RED** | 1-2 | Brief redirect or confusion signal |

### Coaching Action Matrix
| Verdict | Action | User Input | Display |
|---------|--------|------------|---------|
| **GREEN** | Continue | Unlocked | Brief success (2s) |
| **AMBER** | Acknowledge & Retry | Locked until acknowledged | Coaching panel (right side) |
| **RED** | Pause for Coaching | Locked until acknowledged | Full coaching overlay |

---

## 12. EXAMPLE: COMPLETE INTERACTION FLOW

```
[USER'S SCREEN]
📍 Stage: Problem Exploration
💬 Meeting with: James Walker (Head of Customer Success)
⏱️ Meeting time: 8:32

[USER TYPES]
"What are the biggest challenges you face with the current onboarding process?"

[SYSTEM EVALUATION - Silent, 300ms]
{
  verdict: "GREEN",
  score: 88,
  reasoning: "Open-ended, stage-appropriate, specific area"
}

[STAKEHOLDER RESPONSE - 2s delay]
James: "That's a great question. The biggest challenge we face is the manual data entry across three different systems — our CRM, billing platform, and support portal. For each new customer, I personally spend about 45 minutes copying information between these systems. Last week alone, I onboarded 8 customers, which meant over 6 hours just on data entry. It's incredibly frustrating because I know this is time I could spend actually helping customers understand the platform instead of wrestling with admin work."

[COACHING FEEDBACK - Brief green banner, 2s]
✅ Strong Question | Open-ended questions unlock detailed responses

[SUGGESTED FOLLOW-UPS - Right panel]
💡 Try asking:
• "Can you walk me through what happens during that 45-minute data entry process?"
• "How does this delay impact your customers?"
• "Are there other challenges beyond data entry?"

[CONTEXT TRACKER - Bottom status]
🎯 Stage Progress: Problem Exploration (1/3 pain points identified)
```

---

**END OF ARCHITECTURE**

This document provides everything needed to build a production-ready stakeholder meeting intelligence system. Each section can be implemented independently, tested, and scaled. The system is designed to feel like a real stakeholder conversation while coaching learners to become better Business Analysts.
