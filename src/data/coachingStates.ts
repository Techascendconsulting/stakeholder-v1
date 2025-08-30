export interface CoachingState {
  title: string;
  goal: string;
  entry: { min_examples: number };
  exit: { conditions: string[] };
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
      when: string[];
    }>;
    interpret: {
      good_signs: string[];
      warning_signs: string[];
      what_to_listen_for: string[];
      map_to_artifacts: string[];
    };
    notes_template: string[];
  };
  transitions: Array<{
    on: string;
    if?: string[];
    to: string;
  }>;
}

export interface CoachingStateMachine {
  version: string;
  states: Record<string, CoachingState>;
  initial: string;
  final: string;
}

export const coachingStateMachine: CoachingStateMachine = {
  version: "1.0",
  initial: "warm_up",
  final: "wrap_up",
  states: {
    warm_up: {
      title: "Warm-up",
      goal: "Set tone and purpose; gain permission.",
      entry: { min_examples: 0 },
      exit: { conditions: ["user_clicked_next", "user_asked_problem_question"] },
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "Thanks for meeting. Are you okay if I capture notes while we talk?",
          why: "Establishes consent and professionalism; reduces friction later.",
          how: "Warm, brief, confident.",
          next_transition_hint: "Move to Problem Exploration once greeting/purpose is done."
        },
        dig_deeper: [
          { prompt: "What would make this 30 minutes most useful to you?", when: ["answer_thin"] }
        ],
        interpret: {
          good_signs: ["Friendly tone", "Clear goals for the session"],
          warning_signs: ["Rushed, defensive, unclear expectations"],
          what_to_listen_for: ["Their top-of-mind concern"],
          map_to_artifacts: ["session_goals"]
        },
        notes_template: ["Session goal:", "Constraints/house rules:"]
      },
      transitions: [
        { on: "USER_CLICK_NEXT", to: "problem_exploration" },
        { on: "USER_SENT_QUESTION", if: ["is_problem_question"], to: "problem_exploration" }
      ]
    },

    problem_exploration: {
      title: "Problem exploration",
      goal: "Elicit 2–3 pain points with examples.",
      entry: { min_examples: 0 },
      exit: { conditions: ["min_items_captured", "user_clicked_next"] },
      progressWeight: 2,
      cards: {
        guide: {
          prompt: "Can you walk me through the top 2–3 challenges in a typical week?",
          why: "Surfaces As-Is pain points and scope.",
          how: "Open, non-leading, invite examples.",
          next_transition_hint: "Once you have a few, quantify impact next."
        },
        dig_deeper: [
          { prompt: "Which one happens most often?", when: ["has_multiple_pains"] },
          { prompt: "Can you share a recent example where this slowed you down?", when: ["answer_general"] },
          { prompt: "Who else is affected when this occurs?", when: ["mentions_process"] }
        ],
        interpret: {
          good_signs: [
            "Specific examples and details",
            "Emotion/engagement (frustration, urgency)",
            "Multiple stakeholders affected"
          ],
          warning_signs: [
            "Vague or general responses",
            "No recent example",
            "Deflection"
          ],
          what_to_listen_for: [
            "Delays/handoffs → process inefficiency",
            "Admin burden → non-value work",
            "Turnover risk → business risk",
            "Annual-only feedback → cycle too long",
            "Subjectivity → missing criteria"
          ],
          map_to_artifacts: ["pain_points"]
        },
        notes_template: [
          "Pain point:",
          "Who is affected:",
          "Where in process:",
          "Example (date/event):"
        ]
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: [">=2_pain_points_captured"], to: "impact" },
        { on: "USER_CLICK_NEXT", to: "impact" }
      ]
    },

    impact: {
      title: "Impact",
      goal: "Quantify frequency and cost/time/risk for each key pain.",
      entry: { min_examples: 1 },
      exit: { conditions: ["captured_frequency_and_cost", "user_clicked_next"] },
      progressWeight: 2,
      cards: {
        guide: {
          prompt: "How often does this happen and roughly how much time is lost each time?",
          why: "Creates value evidence for prioritisation.",
          how: "Ask for ballparks; avoid interrogating.",
          next_transition_hint: "Use impact to choose a priority pain."
        },
        dig_deeper: [
          { prompt: "Beyond time, what risks or costs does it create?", when: ["mentions_turnover", "mentions_quality"] },
          { prompt: "Who gets pulled in when it happens?", when: ["mentions_handoff", "mentions_people"] }
        ],
        interpret: {
          good_signs: ["Numbers (frequency, minutes/hours)", "Named metrics affected"],
          warning_signs: ["'It depends' with no range", "Hand-wavy impact"],
          what_to_listen_for: ["Rework, blockages, SLA misses, morale"],
          map_to_artifacts: ["impact_notes"]
        },
        notes_template: [
          "Frequency (per week):",
          "Time lost each time:",
          "Affected metric:",
          "Secondary risks:"
        ]
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["has_prioritisation_signal"], to: "prioritisation" },
        { on: "USER_CLICK_NEXT", to: "prioritisation" }
      ]
    },

    prioritisation: {
      title: "Prioritisation",
      goal: "Choose one pain point to focus on first.",
      entry: { min_examples: 2 },
      exit: { conditions: ["priority_chosen", "user_clicked_next"] },
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "If we solved one first for a quick win, which would it be, and why?",
          why: "Focuses effort and creates momentum.",
          how: "Present options clearly; ask for reasoning.",
          next_transition_hint: "Once priority is clear, explore root causes."
        },
        dig_deeper: [
          { prompt: "What makes this the highest priority?", when: ["answer_general"] },
          { prompt: "What would success look like for this issue?", when: ["mentions_priority"] }
        ],
        interpret: {
          good_signs: ["Clear reasoning", "Specific success criteria", "Urgency indicators"],
          warning_signs: ["Indecision", "No clear rationale", "Avoiding choice"],
          what_to_listen_for: ["Impact magnitude", "Ease of solution", "Stakeholder urgency"],
          map_to_artifacts: ["priority_pain_point"]
        },
        notes_template: [
          "Chosen priority:",
          "Reasoning:",
          "Success criteria:",
          "Urgency level:"
        ]
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["priority_chosen"], to: "root_cause" },
        { on: "USER_CLICK_NEXT", to: "root_cause" }
      ]
    },

    root_cause: {
      title: "Root cause",
      goal: "Understand what triggers the priority pain point.",
      entry: { min_examples: 1 },
      exit: { conditions: ["root_cause_identified", "user_clicked_next"] },
      progressWeight: 2,
      cards: {
        guide: {
          prompt: "What usually triggers this issue? What happens immediately before it?",
          why: "Understanding root cause enables targeted solutions.",
          how: "Ask for process walkthrough; look for patterns.",
          next_transition_hint: "Once root cause is clear, define success criteria."
        },
        dig_deeper: [
          { prompt: "Show me the handoff where it slows down", when: ["mentions_handoff"] },
          { prompt: "What's different when it doesn't happen?", when: ["answer_general"] }
        ],
        interpret: {
          good_signs: ["Process details", "Specific triggers", "Pattern recognition"],
          warning_signs: ["Blame assignment", "No clear trigger", "External factors only"],
          what_to_listen_for: ["Process gaps", "System limitations", "Role confusion"],
          map_to_artifacts: ["root_cause_analysis"]
        },
        notes_template: [
          "Root cause:",
          "Trigger:",
          "Process step:",
          "System/tool involved:"
        ]
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["root_cause_identified"], to: "success_criteria" },
        { on: "USER_CLICK_NEXT", to: "success_criteria" }
      ]
    },

    success_criteria: {
      title: "Success criteria",
      goal: "Define what 'better' looks like for the priority pain point.",
      entry: { min_examples: 1 },
      exit: { conditions: ["success_criteria_defined", "user_clicked_next"] },
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "If this were fixed, what would we see in 30–60 days?",
          why: "Clear success criteria guide solution design and measurement.",
          how: "Ask for measurable outcomes; avoid vague improvements.",
          next_transition_hint: "Once success is clear, check for constraints."
        },
        dig_deeper: [
          { prompt: "Which metric would move first?", when: ["mentions_metrics"] },
          { prompt: "What would be different for your team?", when: ["answer_general"] }
        ],
        interpret: {
          good_signs: ["Specific metrics", "Timeframes", "Measurable outcomes"],
          warning_signs: ["Vague improvements", "No metrics", "Unrealistic expectations"],
          what_to_listen_for: ["KPIs", "Time savings", "Quality improvements"],
          map_to_artifacts: ["success_criteria"]
        },
        notes_template: [
          "Success metric:",
          "Target value:",
          "Timeframe:",
          "How to measure:"
        ]
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["success_criteria_defined"], to: "constraints" },
        { on: "USER_CLICK_NEXT", to: "constraints" }
      ]
    },

    constraints: {
      title: "Constraints",
      goal: "Identify any policies, deadlines, or systems that must be considered.",
      entry: { min_examples: 1 },
      exit: { conditions: ["constraints_identified", "user_clicked_next"] },
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "Any policies, deadlines, or systems we must not break?",
          why: "Understanding constraints ensures feasible solutions.",
          how: "Ask broadly; don't assume no constraints exist.",
          next_transition_hint: "Once constraints are clear, plan next steps."
        },
        dig_deeper: [
          { prompt: "Who must sign off on changes?", when: ["mentions_approval"] },
          { prompt: "What's the timeline for implementation?", when: ["mentions_deadline"] }
        ],
        interpret: {
          good_signs: ["Specific constraints", "Stakeholder names", "Clear timelines"],
          warning_signs: ["No constraints mentioned", "Overly restrictive", "Unclear requirements"],
          what_to_listen_for: ["Compliance requirements", "Approval processes", "Implementation timelines"],
          map_to_artifacts: ["constraints_list"]
        },
        notes_template: [
          "Policy constraints:",
          "Approval required:",
          "Timeline:",
          "Systems affected:"
        ]
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["constraints_identified"], to: "next_steps" },
        { on: "USER_CLICK_NEXT", to: "next_steps" }
      ]
    },

    next_steps: {
      title: "Next steps",
      goal: "Agree on follow-up actions and commitments.",
      entry: { min_examples: 1 },
      exit: { conditions: ["next_steps_agreed", "user_clicked_next"] },
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "Are you open to a follow-up session where we map the current process and quantify one week of impact?",
          why: "Secures commitment and sets clear next actions.",
          how: "Be specific about what's next; ask for commitment.",
          next_transition_hint: "Once next steps are agreed, wrap up the session."
        },
        dig_deeper: [
          { prompt: "Who else should join the next session?", when: ["mentions_people"] },
          { prompt: "What would be most useful to prepare?", when: ["answer_general"] }
        ],
        interpret: {
          good_signs: ["Clear commitment", "Specific next actions", "Stakeholder engagement"],
          warning_signs: ["Hesitation", "Vague commitments", "No clear ownership"],
          what_to_listen_for: ["Follow-up timing", "Additional stakeholders", "Preparation needs"],
          map_to_artifacts: ["next_steps_plan"]
        },
        notes_template: [
          "Next session:",
          "Participants:",
          "Preparation needed:",
          "Timeline:"
        ]
      },
      transitions: [
        { on: "STAKEHOLDER_ANSWER", if: ["next_steps_agreed"], to: "wrap_up" },
        { on: "USER_CLICK_NEXT", to: "wrap_up" }
      ]
    },

    wrap_up: {
      title: "Wrap up",
      goal: "Summarize key findings and confirm next steps.",
      entry: { min_examples: 1 },
      exit: { conditions: ["session_complete"] },
      progressWeight: 1,
      cards: {
        guide: {
          prompt: "Let me summarize what we've covered and confirm our next steps.",
          why: "Ensures alignment and provides clear closure.",
          how: "Be concise; confirm understanding; thank them.",
          next_transition_hint: "Session complete - thank the stakeholder."
        },
        dig_deeper: [
          { prompt: "Did I capture everything correctly?", when: ["summary_given"] }
        ],
        interpret: {
          good_signs: ["Clear summary", "Confirmed understanding", "Positive closure"],
          warning_signs: ["Rushed ending", "Unclear next steps", "Misalignment"],
          what_to_listen_for: ["Confirmation", "Additional points", "Gratitude"],
          map_to_artifacts: ["session_summary"]
        },
        notes_template: [
          "Key findings:",
          "Priority pain point:",
          "Success criteria:",
          "Next steps:"
        ]
      },
      transitions: [
        { on: "USER_CLICK_NEXT", to: "session_complete" }
      ]
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
