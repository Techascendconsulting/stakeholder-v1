export interface StakeholderInterviewState {
  title: string;
  goal: string;
  progressWeight: number;
  cards: {
    guide: {
      prompt: string;
      why: string;
      how: string;
      next_transition_hint: string;
    };
    dig_deeper: Array<{
      prompt: string;
      when?: string[];
    }>;
    interpret: {
      good_signs: string[];
      warning_signs: string[];
      what_to_listen_for: string[];
      map_to_artifacts: string[];
    };
    notes_template: string[];
    summary_template: string;
  };
  transitions: Array<{
    on: string;
    if?: string[];
    to: string;
  }>;
}

export interface StakeholderInterviewBlueprint {
  version: string;
  states: Record<string, StakeholderInterviewState>;
  initial: string;
  final: string;
}

export const stakeholderInterviewBlueprint: StakeholderInterviewBlueprint = {
  version: "1.0",
  initial: "warm_up",
  final: "wrap_up",
  states: {
    warm_up: {
      title: "Warm-up",
      goal: "Set tone, introduce yourself, establish rapport.",
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "Hi [Name], thanks for taking the time to meet today. I'm [Your Name] and I'm here to understand your challenges and help identify opportunities for improvement. I'll be taking some notes during our conversation to make sure I capture everything accurately.",
          why: "Builds rapport, establishes purpose, and sets expectations professionally.",
          how: "Warm greeting, clear introduction, explain purpose, mention note-taking as standard practice.",
          next_transition_hint: "Move to Problem Exploration once greeting/purpose is done."
        },
        dig_deeper: [
          { prompt: "What would make this 30 minutes most useful to you?" },
          { prompt: "Any specific concerns you'd like us to prioritise?" }
        ],
        interpret: {
          good_signs: ["Friendly tone", "Clarity of goals"],
          warning_signs: ["Rushed/dismissive"],
          what_to_listen_for: ["Stakeholder's top priority"],
          map_to_artifacts: ["session_goals"]
        },
        notes_template: ["Session goal:", "Constraints/house rules:"],
        summary_template: "Great to meet you [Name]. This is a practice session where I'll be taking notes to better understand your needs. I'm here to help identify improvement opportunities. Shall we start by exploring the key challenges you're facing?"
      },
      transitions: [
        { on: "USER_CLICK_NEXT", to: "problem_exploration" },
        { on: "USER_SENT_QUESTION", if: ["is_problem_question"], to: "problem_exploration" }
      ]
    },

    problem_exploration: {
      title: "Problem exploration",
      goal: "Elicit 2–3 pain points with examples.",
      progressWeight: 2,
      cards: {
        guide: {
          prompt: "Can you walk me through the top 2–3 challenges in a typical week?",
          why: "Surfaces As-Is pain points to define scope.",
          how: "Open, invite examples.",
          next_transition_hint: "Once 2–3 captured, move to Impact."
        },
        dig_deeper: [
          { prompt: "Which one happens most often?", when: ["has_multiple_pains"] },
          { prompt: "Can you give a recent example?", when: ["answer_general"] },
          { prompt: "Who else is affected when this occurs?", when: ["mentions_process"] }
        ],
        interpret: {
          good_signs: ["Specific examples", "Emotion/urgency", "Multiple stakeholders"],
          warning_signs: ["Vague", "No example", "Deflection"],
          what_to_listen_for: [
            "Delays → process inefficiency",
            "Admin burden → non-value work",
            "Turnover risk → business risk",
            "Annual-only feedback → long cycle",
            "Subjectivity → missing criteria"
          ],
          map_to_artifacts: ["pain_points"]
        },
        notes_template: ["Pain point:", "Who is affected:", "Example (date/event):"],
        summary_template: "So far I've heard challenges like {{pain_1}} and {{pain_2}}. Did I capture those correctly?"
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: [">=2_pain_points_captured"], to: "impact" },
        { on: "USER_CLICK_NEXT", to: "impact" }
      ]
    },

    impact: {
      title: "Impact",
      goal: "Quantify time, cost, and risk of pain points.",
      progressWeight: 2,
      cards: {
        guide: {
          prompt: "How often does this happen and roughly how much time is lost each time?",
          why: "Value evidence → prioritisation.",
          how: "Ballpark ranges, not forensic.",
          next_transition_hint: "Choose priority pain point."
        },
        dig_deeper: [
          { prompt: "Beyond time, what risks or costs does it create?", when: ["mentions_turnover", "mentions_quality"] },
          { prompt: "Who else is pulled in when it happens?", when: ["mentions_handoff", "mentions_people"] },
          { prompt: "What does it stop you from doing?", when: ["mentions_blockers"] }
        ],
        interpret: {
          good_signs: ["Mentions numbers", "Named metrics"],
          warning_signs: ["Hand-wavy", "It depends"],
          what_to_listen_for: ["Rework", "SLA misses", "Morale", "Attrition risk"],
          map_to_artifacts: ["impact_notes"]
        },
        notes_template: ["Frequency (per week):", "Time lost each time:", "Secondary risks:"],
        summary_template: "These issues occur around {{freq}}, costing about {{time_lost}}. This seems to have knock-on effects like {{risk}}. Is that accurate?"
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["has_prioritisation_signal", "captured_frequency_and_cost"], to: "prioritisation" },
        { on: "USER_CLICK_NEXT", to: "prioritisation" }
      ]
    },

    prioritisation: {
      title: "Prioritisation",
      goal: "Pick one pain point to focus on first.",
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "If we solved one first for quick wins, which would it be?",
          why: "Creates focus, stops scatter.",
          how: "If we solved one first for quick wins, which would it be?",
          next_transition_hint: "Drill into root cause."
        },
        dig_deeper: [
          { prompt: "What makes that the best lever?" },
          { prompt: "What would improve fastest if we solved this first?" }
        ],
        interpret: {
          good_signs: ["Clear ranking", "Rationale"],
          warning_signs: ["All equally bad", "No prioritisation"],
          what_to_listen_for: ["Impact × feasibility hints"],
          map_to_artifacts: ["priority_choice"]
        },
        notes_template: ["Priority pain:", "Rationale:"],
        summary_template: "It sounds like {{priority_pain}} would deliver the biggest immediate benefit. Shall we focus on that one?"
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["priority_selected"], to: "root_cause" },
        { on: "USER_CLICK_NEXT", to: "root_cause" }
      ]
    },

    root_cause: {
      title: "Root cause",
      goal: "Understand why the problem exists.",
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "What usually triggers this issue? What happens right before?",
          why: "Avoids treating symptoms.",
          how: "What usually triggers this issue? What happens right before?",
          next_transition_hint: "Define success criteria."
        },
        dig_deeper: [
          { prompt: "What workarounds do you use today?" },
          { prompt: "Which system/step in the process is the bottleneck?" }
        ],
        interpret: {
          good_signs: ["Mentions triggers", "Workflows", "System touchpoints"],
          warning_signs: ["Blame without detail", "It just happens"],
          what_to_listen_for: ["Policy", "Tool", "Handoff", "Unclear role"],
          map_to_artifacts: ["root_causes"]
        },
        notes_template: ["Trigger:", "System touched:", "Workaround:"],
        summary_template: "From what you've shared, {{priority_pain}} usually happens when {{trigger}} in {{system}}. Current workaround is {{workaround}}. Did I get that right?"
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["has_trigger_and_system"], to: "success_criteria" },
        { on: "USER_CLICK_NEXT", to: "success_criteria" }
      ]
    },

    success_criteria: {
      title: "Success criteria",
      goal: "Define what 'good' looks like.",
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "If this were fixed, what would we see in 30–60 days?",
          why: "Ensures measurable outcomes.",
          how: "If this were fixed, what would we see in 30–60 days?",
          next_transition_hint: "Explore success strategies."
        },
        dig_deeper: [
          { prompt: "Which metric would improve first?" },
          { prompt: "How would the team feel different?" }
        ],
        interpret: {
          good_signs: ["Quantifiable outcomes", "Emotional improvement"],
          warning_signs: ["Vague better", "No metric"],
          what_to_listen_for: ["Cycle time", "Throughput", "Quality", "Engagement"],
          map_to_artifacts: ["success_measures"]
        },
        notes_template: ["Desired outcome:", "Metric/indicator:"],
        summary_template: "Success here would look like {{desired_outcome}}, measured by {{metric}}. Is that aligned with what you want to achieve?"
      },
              transitions: [
          { on: "STAKEHOLDER_ANSWER", if: ["has_metric_or_indicator"], to: "success_strategies" },
          { on: "USER_CLICK_NEXT", to: "success_strategies" }
        ]
    },

    success_strategies: {
      title: "Success strategies",
      goal: "Identify what works well and how to leverage it.",
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "What's working well in your current process? What strategies or approaches have been successful?",
          why: "Identifies strengths to build upon and successful patterns to replicate.",
          how: "Ask about positive experiences and effective approaches.",
          next_transition_hint: "Capture constraints and then wrap up."
        },
        dig_deeper: [
          { prompt: "What made that approach successful?", when: ["mentions_success"] },
          { prompt: "How could we apply that strategy to other areas?", when: ["mentions_process"] },
          { prompt: "What resources or support made that work?", when: ["mentions_people"] }
        ],
        interpret: {
          good_signs: ["Specific examples", "Clear success factors", "Replicable patterns"],
          warning_signs: ["Vague responses", "No success examples", "Dismissive of current state"],
          what_to_listen_for: ["Effective processes", "Successful tools", "Good team dynamics", "Supportive leadership"],
          map_to_artifacts: ["success_strategies"]
        },
        notes_template: ["Successful strategy:", "Why it works:", "How to replicate:"],
        summary_template: "You've identified {{strategy}} as a successful approach because {{reason}}. We could apply this to {{application}}. Is that right?"
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["has_success_strategies"], to: "constraints" },
        { on: "USER_CLICK_NEXT", to: "constraints" }
      ]
    },

    constraints: {
      title: "Constraints",
      goal: "Capture non-negotiables.",
      progressWeight: 0.5,
      cards: {
        guide: {
          prompt: "Any policies, deadlines, or systems we must not break?",
          why: "Defines solution boundaries.",
          how: "Any policies, deadlines, or systems we must not break?",
          next_transition_hint: "Wrap-up."
        },
        dig_deeper: [
          { prompt: "Who must sign off before changes happen?" }
        ],
        interpret: {
          good_signs: ["Clear governance", "Deadlines"],
          warning_signs: ["Not sure", "Missing owners"],
          what_to_listen_for: ["Compliance", "Security", "Change control"],
          map_to_artifacts: ["constraints"]
        },
        notes_template: ["Constraint:", "Owner:"],
        summary_template: "Constraints include {{constraint}}. Key sign-off comes from {{owner}}. Is that correct?"
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["has_constraints"], to: "wrap_up" },
        { on: "USER_CLICK_NEXT", to: "wrap_up" }
      ]
    },

    wrap_up: {
      title: "Next steps / wrap-up",
      goal: "Close loop, agree follow-up.",
      progressWeight: 0.5,
      cards: {
        guide: {
          prompt: "Are you open to a follow-up session to map the process?",
          why: "Leaves stakeholder feeling progress.",
          how: "Are you open to a follow-up session to map the process?",
          next_transition_hint: "End session."
        },
        dig_deeper: [
          { prompt: "Who else should join the next conversation?" }
        ],
        interpret: {
          good_signs: ["Commitment", "Openness to continue"],
          warning_signs: ["Resistance", "Disengagement"],
          what_to_listen_for: ["Decision-makers", "System owners"],
          map_to_artifacts: ["next_steps"]
        },
        notes_template: ["Next step:", "Attendees:"],
        summary_template: "We've identified {{priority_pain}}, explored its impact and root causes, and agreed success looks like {{X}}. Next step is {{Y}} with {{stakeholders}}. Shall we schedule that?"
      },
      transitions: []
    }
  }
};

// Helper functions for state transitions
export const extractEntities = (message: string): string[] => {
  const entities: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Time-related keywords
  if (lowerMessage.includes('hour') || lowerMessage.includes('minute') || lowerMessage.includes('day') || 
      lowerMessage.includes('delay') || lowerMessage.includes('sla') || lowerMessage.includes('backlog') || 
      lowerMessage.includes('queue')) {
    entities.push('mentions_time');
  }

  // People-related keywords
  if (lowerMessage.includes('manager') || lowerMessage.includes('team') || lowerMessage.includes('hr') || 
      lowerMessage.includes('it') || lowerMessage.includes('approval') || lowerMessage.includes('handoff')) {
    entities.push('mentions_people');
  }

  // Turnover-related keywords
  if (lowerMessage.includes('engagement') || lowerMessage.includes('resign') || lowerMessage.includes('attrition') || 
      lowerMessage.includes('burnout')) {
    entities.push('mentions_turnover');
  }

  // Handoff-related keywords
  if (lowerMessage.includes('handoff') || lowerMessage.includes('hand off') || lowerMessage.includes('transfer')) {
    entities.push('mentions_handoff');
  }

  // Process-related keywords
  if (lowerMessage.includes('process') || lowerMessage.includes('workflow') || lowerMessage.includes('step')) {
    entities.push('mentions_process');
  }

  // Quality-related keywords
  if (lowerMessage.includes('quality') || lowerMessage.includes('error') || lowerMessage.includes('mistake')) {
    entities.push('mentions_quality');
  }

  // Priority-related keywords
  if (lowerMessage.includes('biggest') || lowerMessage.includes('first') || lowerMessage.includes('quick win') || 
      lowerMessage.includes('highest impact') || lowerMessage.includes('priority')) {
    entities.push('mentions_priority');
  }

  // Metrics-related keywords
  if (lowerMessage.includes('metric') || lowerMessage.includes('kpi') || lowerMessage.includes('measure')) {
    entities.push('mentions_metrics');
  }

  // Approval-related keywords
  if (lowerMessage.includes('approval') || lowerMessage.includes('sign off') || lowerMessage.includes('signoff')) {
    entities.push('mentions_approval');
  }

  // Deadline-related keywords
  if (lowerMessage.includes('deadline') || lowerMessage.includes('timeline') || lowerMessage.includes('due date')) {
    entities.push('mentions_deadline');
  }

  // Blocker-related keywords
  if (lowerMessage.includes('block') || lowerMessage.includes('stop') || lowerMessage.includes('prevent')) {
    entities.push('mentions_blockers');
  }

  // General answer detection (short responses)
  if (message.split(' ').length < 10) {
    entities.push('answer_general');
  }

  return entities;
};

export const isProblemQuestion = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  const problemKeywords = ['challenge', 'problem', 'issue', 'frustrat', 'difficult', 'pain', 'bottleneck'];
  return problemKeywords.some(keyword => lowerMessage.includes(keyword));
};
