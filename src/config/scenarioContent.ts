// Scenario-specific content for the Acceptance Criteria Thinking Framework
// Each scenario has its own unique user story for all 10 rules
// Designed to produce world-class Business Analysts with diverse, innovative scenarios

export interface ScenarioRuleLearn {
  referenceStory: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
  correct: 'A' | 'B' | 'C';
  feedback: {
    A: string;
    B: string;
    C: string;
  };
}

export interface ScenarioRuleApply {
  scenario: string;
  prompt: string;
  exampleAnswer: string;
}

export interface ScenarioRule {
  name: string;
  learn: ScenarioRuleLearn;
  apply: ScenarioRuleApply;
}

export const SCENARIO_CONTENT: Record<string, Record<string, ScenarioRule>> = {
  'childcare-voucher': {
    userGoal: {
      name: "User Goal",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement focuses on what the PARENT wants to achieve, not what the system does?",
        options: {
          A: "The application system stores form data in temporary tables with auto-save functionality.",
          B: "The parent can save their application progress midway, so they don't have to start over if they need to gather documents or take a break.",
          C: "Auto-save reduces server load and improves database performance by batching requests.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes technical system architecture, not what the parent experiences or wants. Parents don't care about temporary tables or auto-save functionality.",
          B: "Correct — Written from the parent's perspective. Focuses on what the parent CAN DO (save progress) and the BUSINESS BENEFIT (don't have to start over). This addresses their real pain point.",
          C: "Wrong — This describes technical performance metrics. Parents don't care about server load; they care about not losing their work and having to restart.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user goal that focuses on what the PARENT wants to achieve from their perspective. Think about their real-world situation: what outcome do they desperately need? What would solve their actual problem? Focus on their business need, not technical implementation. Consider the emotional and practical impact of their current pain point.",
        exampleAnswer: "The parent can pause their childcare voucher application at any point, so they can resume later without losing their progress or having to restart the entire process.",
      },
    },
    userRole: {
      name: "User Role",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement clearly identifies WHO is using the system?",
        options: {
          A: "The application system automatically saves user data.",
          B: "The parent applying for childcare vouchers can save their progress midway through the application.",
          C: "Users can save their application data when needed.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — 'The application system' is not a user role. We need to know the specific person using the system, not the system itself.",
          B: "Correct — 'Parent applying for childcare vouchers' is a specific, identifiable role. This tells us exactly who is using the system and their relationship to it.",
          C: "Wrong — 'Users' is too generic. We need to know the specific role, not just 'users'. This doesn't help us understand the stakeholder.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user role that is SPECIFIC and IDENTIFIABLE. Avoid generic terms like 'user' or 'person'. Think about WHO exactly is using this system. What is their specific role, relationship, or position? Be precise about their identity and context. Consider their life situation and why they need this system.",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userAction: {
      name: "User Action",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement describes what the parent is ACTUALLY DOING?",
        options: {
          A: "The parent wants to save their application progress.",
          B: "The parent is applying for childcare vouchers and saving their progress midway through the process.",
          C: "The parent needs help with their application form.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — 'Wants to save' is a desire, not an action. We need to know what the parent is actually doing, not what they want.",
          B: "Correct — 'Applying for childcare vouchers and saving their progress midway' describes the actual actions the parent is performing. This shows their behavior and workflow.",
          C: "Wrong — 'Needs help' is a problem statement, not an action. We need to know what the parent is doing, not what they need.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user action that describes what the parent is ACTUALLY DOING, not what they want or need. Focus on the specific actions they are performing. Use active verbs and be concrete about their behavior. Think about their workflow and what they're actively engaged in. Avoid vague desires or abstract needs.",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userBenefit: {
      name: "User Benefit",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement explains WHY the parent wants this feature?",
        options: {
          A: "The parent wants to save progress to improve system performance.",
          B: "The parent wants to save progress so they don't have to start over if they need to gather documents or take a break.",
          C: "The parent wants to save progress to help developers debug issues.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — System performance is a technical benefit, not a user benefit. Parents don't care about system performance; they care about their own experience.",
          B: "Correct — 'Don't have to start over if they need to gather documents or take a break' is a clear user benefit. It explains why the parent wants this feature and addresses their real pain point.",
          C: "Wrong — Helping developers is not a user benefit. Parents don't care about developer debugging; they care about their own convenience and peace of mind.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user benefit that explains WHY the parent wants this feature. Think about their real-world situation and what outcome they desperately need. What problem does this solve for them? What value does it provide? Focus on their emotional and practical needs, not technical benefits.",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userContext: {
      name: "User Context",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement provides context about WHEN or WHERE this happens?",
        options: {
          A: "The parent applies for childcare vouchers.",
          B: "The parent applies for childcare vouchers and saves progress midway.",
          C: "The parent applies for childcare vouchers and saves progress midway, especially when they need to gather documents or take a break.",
        },
        correct: "C",
        feedback: {
          A: "Wrong — This doesn't provide context about when or where the action happens. We need more detail about the situation.",
          B: "Wrong — This provides some context (midway) but not enough. We need more context about why this matters and when it's needed.",
          C: "Correct — This provides full context: when (midway through application) and why it matters (when they need to gather documents or take a break). This helps understand the urgency and real-world situation.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user context that includes WHEN or WHERE this happens. Think about the parent's real-world situation and what circumstances make this feature necessary. What triggers the need for this functionality? Include the specific conditions that make this feature valuable.",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userConstraint: {
      name: "User Constraint",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement identifies a LIMITATION or CONSTRAINT the parent faces?",
        options: {
          A: "The parent can apply for childcare vouchers.",
          B: "The parent must complete the application in one sitting or start over from the beginning.",
          C: "The parent wants to save their progress.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the parent can do, not a constraint or limitation they face.",
          B: "Correct — 'Must complete in one sitting or start over from the beginning' is a clear constraint. The parent has a time limitation they must work within, which creates their pain point.",
          C: "Wrong — This describes what the parent wants, not a constraint they face.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user constraint that identifies a LIMITATION or CONSTRAINT the parent faces. Think about what restrictions or limitations they're dealing with in their real-world situation. What barriers or obstacles do they face? What makes their current situation difficult?",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userException: {
      name: "User Exception",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement handles an EXCEPTION or EDGE CASE?",
        options: {
          A: "The parent completes their application successfully.",
          B: "The parent completes their application, but if they need to gather documents or take a break, they can save their progress.",
          C: "The parent wants to save their progress.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes the happy path, not an exception or edge case.",
          B: "Correct — 'If they need to gather documents or take a break' handles the exception case. This is what happens when things don't go as expected in real life.",
          C: "Wrong — This describes what the parent wants, not an exception they face.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user exception that handles an EXCEPTION or EDGE CASE. Think about what happens when things don't go as planned in the parent's real-world situation. What unexpected situations might arise? What edge cases could occur that would disrupt their normal workflow?",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userValidation: {
      name: "User Validation",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement describes HOW the parent knows the action was successful?",
        options: {
          A: "The parent applies for childcare vouchers.",
          B: "The parent sees confirmation that their progress has been saved and can return to where they left off.",
          C: "The parent wants to save their progress.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the parent does, not how they know it was successful.",
          B: "Correct — 'Sees confirmation that their progress has been saved and can return to where they left off' describes how the parent knows the system is working. This gives them confidence and peace of mind.",
          C: "Wrong — This describes what the parent wants, not how they know the action was successful.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user validation that describes HOW the parent knows the action was successful. Think about what feedback or confirmation they need to feel confident. What would give them peace of mind? What would make them trust that their progress is safe?",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userData: {
      name: "User Data",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement identifies WHAT DATA the parent needs?",
        options: {
          A: "The parent needs to apply for childcare vouchers.",
          B: "The parent needs to see their saved application data and progress status.",
          C: "The parent wants to save their progress.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the parent does, not what data they need.",
          B: "Correct — 'Saved application data and progress status' identifies the specific data the parent needs to continue their application. This is the information that matters to them.",
          C: "Wrong — This describes what the parent wants, not what data they need.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user data requirement that identifies WHAT DATA the parent needs. Think about what information they need to see to continue their application. What data would be most valuable to them? What would help them understand where they are in the process?",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
    userBusiness: {
      name: "User Business",
      learn: {
        referenceStory: "As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don't have to start over if I need to gather documents or take a break.",
        question: "Which statement connects to the BUSINESS VALUE or PURPOSE?",
        options: {
          A: "The parent applies for childcare vouchers.",
          B: "The parent needs to complete their childcare voucher application to receive financial support for their children's care.",
          C: "The parent wants to save their progress.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the parent does, not the business value or purpose.",
          B: "Correct — 'Complete their childcare voucher application to receive financial support for their children's care' connects to the business value (financial support) and purpose (supporting children's care). This shows the real-world impact.",
          C: "Wrong — This describes what the parent wants, not the business value or purpose.",
        },
      },
      apply: {
        scenario: "Childcare Voucher Application",
        prompt: "Write a user business requirement that connects to the BUSINESS VALUE or PURPOSE. Think about why this application matters to the parent's life and family. What's the bigger picture? What's the real-world impact of completing this application? What's at stake for them?",
        exampleAnswer: "As a working parent applying for childcare vouchers, I want to save my application progress midway, so that I can complete it during my lunch break without losing any information.",
      },
    },
  },
  'customer-service': {
    userGoal: {
      name: "User Goal",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement focuses on what the CUSTOMER SERVICE REP wants to achieve, not what the system does?",
        options: {
          A: "The CRM system integrates with multiple data sources to provide comprehensive customer profiles.",
          B: "The customer service rep can see the customer's complete interaction history, so they can provide personalized assistance without repetition.",
          C: "Data integration reduces system latency and improves database query performance.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes technical system integration, not what the rep experiences or wants. Reps don't care about data sources or system architecture.",
          B: "Correct — Written from the rep's perspective. Focuses on what the rep CAN DO (see complete history) and the BUSINESS BENEFIT (personalized assistance without repetition). This addresses their real customer service need.",
          C: "Wrong — This describes technical performance metrics. Reps don't care about system latency; they care about helping customers efficiently.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user goal that focuses on what the CUSTOMER SERVICE REP wants to achieve from their professional perspective. Think about their real-world situation: what outcome do they desperately need? What would solve their actual problem? Focus on their business need, not technical implementation. Consider the emotional and practical impact of their current pain point.",
        exampleAnswer: "The customer service rep can access the customer's complete interaction history when they call, so they can provide personalized assistance without asking them to repeat their story.",
      },
    },
    userRole: {
      name: "User Role",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement clearly identifies WHO is using the system?",
        options: {
          A: "The CRM system displays customer history automatically.",
          B: "The customer service representative handling support tickets sees the customer's complete interaction history when they call.",
          C: "Users can see customer interaction history when needed.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — 'The CRM system' is not a user role. We need to know the specific person using the system, not the system itself.",
          B: "Correct — 'Customer service representative handling support tickets' is a specific, identifiable role. This tells us exactly who is using the system and their professional context.",
          C: "Wrong — 'Users' is too generic. We need to know the specific role, not just 'users'. This doesn't help us understand the stakeholder.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user role that is SPECIFIC and IDENTIFIABLE. Avoid generic terms like 'user' or 'person'. Think about WHO exactly is using this system. What is their specific role, professional position, or relationship to the system? Be precise about their identity and context. Consider their professional situation and why they need this system.",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userAction: {
      name: "User Action",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement describes what the customer service rep is ACTUALLY DOING?",
        options: {
          A: "The rep wants to see customer history.",
          B: "The rep is handling support tickets and viewing customer interaction history when they call.",
          C: "The rep needs help with customer inquiries.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — 'Wants to see' is a desire, not an action. We need to know what the rep is actually doing, not what they want.",
          B: "Correct — 'Handling support tickets and viewing customer interaction history when they call' describes the actual actions the rep is performing. This shows their professional workflow and behavior.",
          C: "Wrong — 'Needs help' is a problem statement, not an action. We need to know what the rep is doing, not what they need.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user action that describes what the customer service rep is ACTUALLY DOING, not what they want or need. Focus on the specific actions they are performing. Use active verbs and be concrete about their behavior. Think about their professional workflow and what they're actively engaged in. Avoid vague desires or abstract needs.",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userBenefit: {
      name: "User Benefit",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement explains WHY the customer service rep wants this feature?",
        options: {
          A: "The rep wants to see customer history to improve system performance.",
          B: "The rep wants to see customer history so they can provide personalized assistance without asking customers to repeat their story.",
          C: "The rep wants to see customer history to help developers debug issues.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — System performance is a technical benefit, not a user benefit. Reps don't care about system performance; they care about their customer service effectiveness.",
          B: "Correct — 'Provide personalized assistance without asking customers to repeat their story' is a clear user benefit. It explains why the rep wants this feature and addresses their real customer service need.",
          C: "Wrong — Helping developers is not a user benefit. Reps don't care about developer debugging; they care about their own customer service efficiency and customer satisfaction.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user benefit that explains WHY the customer service rep wants this feature. Think about their real-world professional situation and what outcome they desperately need. What problem does this solve for them? What value does it provide? Focus on their professional and customer service needs, not technical benefits.",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userContext: {
      name: "User Context",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement provides context about WHEN or WHERE this happens?",
        options: {
          A: "The rep handles support tickets.",
          B: "The rep handles support tickets and views customer history when they call.",
          C: "The rep handles support tickets and views customer history when they call, especially when they need to provide personalized assistance.",
        },
        correct: "C",
        feedback: {
          A: "Wrong — This doesn't provide context about when or where the action happens. We need more detail about the situation.",
          B: "Wrong — This provides some context (when they call) but not enough. We need more context about why this matters.",
          C: "Correct — This provides full context: when (when they call) and why it matters (when they need to provide personalized assistance). This helps understand the urgency and professional pressure.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user context that includes WHEN or WHERE this happens. Think about the rep's real-world professional situation and what circumstances make this feature necessary. What triggers the need for this functionality? Include the specific conditions that make this feature valuable.",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userConstraint: {
      name: "User Constraint",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement identifies a LIMITATION or CONSTRAINT the customer service rep faces?",
        options: {
          A: "The rep can handle support tickets.",
          B: "The rep must provide efficient customer service within call time limits and maintain customer satisfaction.",
          C: "The rep wants to see customer history.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the rep can do, not a constraint or limitation they face.",
          B: "Correct — 'Must provide efficient customer service within call time limits and maintain customer satisfaction' is a clear constraint. The rep has professional limitations they must work within.",
          C: "Wrong — This describes what the rep wants, not a constraint they face.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user constraint that identifies a LIMITATION or CONSTRAINT the customer service rep faces. Think about what restrictions or limitations they're dealing with in their real-world professional situation. What barriers or obstacles do they face? What makes their current situation difficult?",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userException: {
      name: "User Exception",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement handles an EXCEPTION or EDGE CASE?",
        options: {
          A: "The rep completes their customer service call successfully.",
          B: "The rep completes their customer service call, but if they need to provide personalized assistance, they can see the customer's complete interaction history.",
          C: "The rep wants to see customer history.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes the happy path, not an exception or edge case.",
          B: "Correct — 'If they need to provide personalized assistance' handles the exception case. This is what happens when things don't go as expected in real customer service situations.",
          C: "Wrong — This describes what the rep wants, not an exception they face.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user exception that handles an EXCEPTION or EDGE CASE. Think about what happens when things don't go as planned in the rep's real-world professional situation. What unexpected situations might arise? What edge cases could occur that would disrupt their normal workflow?",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userValidation: {
      name: "User Validation",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement describes HOW the customer service rep knows the action was successful?",
        options: {
          A: "The rep handles support tickets.",
          B: "The rep sees the customer's complete interaction history and can provide personalized assistance without repetition.",
          C: "The rep wants to see customer history.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the rep does, not how they know it was successful.",
          B: "Correct — 'Sees the customer's complete interaction history and can provide personalized assistance without repetition' describes how the rep knows the system is working. This gives them confidence and professional satisfaction.",
          C: "Wrong — This describes what the rep wants, not how they know the action was successful.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user validation that describes HOW the customer service rep knows the action was successful. Think about what feedback or confirmation they need to feel confident. What would give them peace of mind? What would make them trust that they can provide excellent customer service?",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userData: {
      name: "User Data",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement identifies WHAT DATA the customer service rep needs?",
        options: {
          A: "The rep needs to handle support tickets.",
          B: "The rep needs to see the customer's complete interaction history and previous support ticket details.",
          C: "The rep wants to see customer history.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the rep does, not what data they need.",
          B: "Correct — 'Customer's complete interaction history and previous support ticket details' identifies the specific data the rep needs to provide personalized assistance. This is the information that matters to them.",
          C: "Wrong — This describes what the rep wants, not what data they need.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user data requirement that identifies WHAT DATA the customer service rep needs. Think about what information they need to see to provide personalized assistance. What data would be most valuable to them? What would help them understand the customer's situation?",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userBusiness: {
      name: "User Business",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement connects to the BUSINESS VALUE or PURPOSE?",
        options: {
          A: "The rep handles support tickets.",
          B: "The rep needs to provide excellent customer service to maintain customer satisfaction and reduce churn.",
          C: "The rep wants to see customer history.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the rep does, not the business value or purpose.",
          B: "Correct — 'Provide excellent customer service to maintain customer satisfaction and reduce churn' connects to the business value (customer satisfaction) and purpose (reducing churn). This shows the real-world business impact.",
          C: "Wrong — This describes what the rep wants, not the business value or purpose.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user business requirement that connects to the BUSINESS VALUE or PURPOSE. Think about why this customer service capability matters to the business and customer satisfaction. What's the bigger picture? What's the real-world impact of providing excellent customer service? What's at stake for the business?",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
  },
  'shopping-checkout': {
    userGoal: {
      name: "User Goal",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement focuses on what the TENANT OFFICER wants to achieve, not what the system does?",
        options: {
          A: "The property management system stores tenant move-out data in the database with automated triggers.",
          B: "The tenant officer can record when a tenant moves out, so they can trigger the inspection process.",
          C: "Automated triggers reduce manual work and improve system efficiency.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes technical system functionality, not what the tenant officer experiences or wants. Officers don't care about database storage or automated triggers.",
          B: "Correct — Written from the tenant officer's perspective. Focuses on what the officer CAN DO (record move-out) and the BUSINESS BENEFIT (trigger inspection). This addresses their real property management need.",
          C: "Wrong — This describes technical efficiency metrics. Officers don't care about system efficiency; they care about their property management workflow.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user goal that focuses on what the TENANT OFFICER wants to achieve from their professional perspective. Think about their real-world situation: what outcome do they desperately need? What would solve their actual problem? Focus on their business need, not technical implementation. Consider the practical impact of their current workflow.",
        exampleAnswer: "The tenant officer can record when a tenant moves out, so they can trigger the inspection process.",
      },
    },
    userRole: {
      name: "User Role",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement clearly identifies WHO is using the system?",
        options: {
          A: "The property management system records tenant move-outs automatically.",
          B: "The tenant officer records when a tenant moves out to trigger the inspection.",
          C: "Users can record tenant move-outs when needed.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — 'The property management system' is not a user role. We need to know the specific person using the system, not the system itself.",
          B: "Correct — 'Tenant officer' is a specific, identifiable role. This tells us exactly who is using the system and their professional context.",
          C: "Wrong — 'Users' is too generic. We need to know the specific role, not just 'users'. This doesn't help us understand the stakeholder.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user role that is SPECIFIC and IDENTIFIABLE. Avoid generic terms like 'user' or 'person'. Think about WHO exactly is using this system. What is their specific role, professional position, or relationship to the system? Be precise about their identity and context. Consider their professional situation and why they need this system.",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userAction: {
      name: "User Action",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement describes what the tenant officer is ACTUALLY DOING?",
        options: {
          A: "The officer wants to record tenant move-outs.",
          B: "The officer is recording when a tenant moves out and triggering the inspection process.",
          C: "The officer needs help with tenant management.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — 'Wants to record' is a desire, not an action. We need to know what the officer is actually doing, not what they want.",
          B: "Correct — 'Recording when a tenant moves out and triggering the inspection process' describes the actual actions the officer is performing. This shows their professional workflow and behavior.",
          C: "Wrong — 'Needs help' is a problem statement, not an action. We need to know what the officer is doing, not what they need.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user action that describes what the tenant officer is ACTUALLY DOING, not what they want or need. Focus on the specific actions they are performing. Use active verbs and be concrete about their behavior. Think about their professional workflow and what they're actively engaged in. Avoid vague desires or abstract needs.",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userBenefit: {
      name: "User Benefit",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement explains WHY the tenant officer wants this feature?",
        options: {
          A: "The officer wants to record move-outs to improve system performance.",
          B: "The officer wants to record move-outs so they can trigger the inspection process.",
          C: "The officer wants to record move-outs to help developers debug issues.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — System performance is a technical benefit, not a user benefit. Officers don't care about system performance; they care about their property management effectiveness.",
          B: "Correct — 'So they can trigger the inspection process' is a clear user benefit. It explains why the officer wants this feature and addresses their real property management need.",
          C: "Wrong — Helping developers is not a user benefit. Officers don't care about developer debugging; they care about their own property management efficiency.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user benefit that explains WHY the tenant officer wants this feature. Think about their real-world professional situation and what outcome they desperately need. What problem does this solve for them? What value does it provide? Focus on their professional and property management needs, not technical benefits.",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userContext: {
      name: "User Context",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement provides context about WHEN or WHERE this happens?",
        options: {
          A: "The officer records tenant move-outs.",
          B: "The officer records tenant move-outs and triggers inspections.",
          C: "The officer records tenant move-outs and triggers inspections, especially when they need to manage property transitions.",
        },
        correct: "C",
        feedback: {
          A: "Wrong — This doesn't provide context about when or where the action happens. We need more detail about the situation.",
          B: "Wrong — This provides some context (triggers inspections) but not enough. We need more context about why this matters.",
          C: "Correct — This provides full context: when (when they record move-outs) and why it matters (when they need to manage property transitions). This helps understand the urgency and professional pressure.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user context that includes WHEN or WHERE this happens. Think about the officer's real-world professional situation and what circumstances make this feature necessary. What triggers the need for this functionality? Include the specific conditions that make this feature valuable.",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userConstraint: {
      name: "User Constraint",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement identifies a LIMITATION or CONSTRAINT the tenant officer faces?",
        options: {
          A: "The officer can record tenant move-outs.",
          B: "The officer must complete property inspections within specific timeframes to maintain property standards and legal compliance.",
          C: "The officer wants to record move-outs.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the officer can do, not a constraint or limitation they face.",
          B: "Correct — 'Must complete property inspections within specific timeframes to maintain property standards and legal compliance' is a clear constraint. The officer has professional and legal limitations they must work within.",
          C: "Wrong — This describes what the officer wants, not a constraint they face.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user constraint that identifies a LIMITATION or CONSTRAINT the tenant officer faces. Think about what restrictions or limitations they're dealing with in their real-world professional situation. What barriers or obstacles do they face? What makes their current situation difficult?",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userException: {
      name: "User Exception",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement handles an EXCEPTION or EDGE CASE?",
        options: {
          A: "The officer completes their tenant move-out recording successfully.",
          B: "The officer completes their tenant move-out recording, but if there are issues with the move-out date, they can still trigger the inspection process.",
          C: "The officer wants to record move-outs.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes the happy path, not an exception or edge case.",
          B: "Correct — 'If there are issues with the move-out date' handles the exception case. This is what happens when things don't go as expected in real property management situations.",
          C: "Wrong — This describes what the officer wants, not an exception they face.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user exception that handles an EXCEPTION or EDGE CASE. Think about what happens when things don't go as planned in the officer's real-world professional situation. What unexpected situations might arise? What edge cases could occur that would disrupt their normal workflow?",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userValidation: {
      name: "User Validation",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement describes HOW the tenant officer knows the action was successful?",
        options: {
          A: "The officer records tenant move-outs.",
          B: "The officer sees confirmation that the move-out has been recorded and the inspection process has been triggered.",
          C: "The officer wants to record move-outs.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the officer does, not how they know it was successful.",
          B: "Correct — 'Sees confirmation that the move-out has been recorded and the inspection process has been triggered' describes how the officer knows the system is working. This gives them confidence and professional satisfaction.",
          C: "Wrong — This describes what the officer wants, not how they know the action was successful.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user validation that describes HOW the tenant officer knows the action was successful. Think about what feedback or confirmation they need to feel confident. What would give them peace of mind? What would make them trust that their property management workflow is working correctly?",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userData: {
      name: "User Data",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement identifies WHAT DATA the tenant officer needs?",
        options: {
          A: "The officer needs to record tenant move-outs.",
          B: "The officer needs to see the tenant's move-out date and inspection status details.",
          C: "The officer wants to record move-outs.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the officer does, not what data they need.",
          B: "Correct — 'Tenant's move-out date and inspection status details' identifies the specific data the officer needs to manage the property transition. This is the information that matters to them.",
          C: "Wrong — This describes what the officer wants, not what data they need.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user data requirement that identifies WHAT DATA the tenant officer needs. Think about what information they need to see to manage the property transition. What data would be most valuable to them? What would help them understand the property status?",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
    userBusiness: {
      name: "User Business",
      learn: {
        referenceStory: "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
        question: "Which statement connects to the BUSINESS VALUE or PURPOSE?",
        options: {
          A: "The officer records tenant move-outs.",
          B: "The officer needs to maintain property standards and ensure timely inspections to protect property value and tenant safety.",
          C: "The officer wants to record move-outs.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the officer does, not the business value or purpose.",
          B: "Correct — 'Maintain property standards and ensure timely inspections to protect property value and tenant safety' connects to the business value (property protection) and purpose (tenant safety). This shows the real-world business impact.",
          C: "Wrong — This describes what the officer wants, not the business value or purpose.",
        },
      },
      apply: {
        scenario: "Tenant Officer Recording Move-Out",
        prompt: "Write a user business requirement that connects to the BUSINESS VALUE or PURPOSE. Think about why this property management capability matters to the business and property value. What's the bigger picture? What's the real-world impact of maintaining property standards? What's at stake for the business?",
        exampleAnswer: "As a property manager, I want to record when a tenant moves out so I can trigger the inspection.",
      },
    },
  },
  'student-homework': {
    userGoal: {
      name: "User Goal",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement focuses on what the CUSTOMER SERVICE REP wants to achieve, not what the system does?",
        options: {
          A: "The CRM system integrates with multiple data sources to provide comprehensive customer profiles.",
          B: "The customer service rep can see the customer's complete interaction history, so they can provide personalized assistance without repetition.",
          C: "Data integration reduces system latency and improves database query performance.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes technical system integration, not what the rep experiences or wants. Reps don't care about data sources or system architecture.",
          B: "Correct — Written from the rep's perspective. Focuses on what the rep CAN DO (see complete history) and the BUSINESS BENEFIT (personalized assistance without repetition). This addresses their real customer service need.",
          C: "Wrong — This describes technical performance metrics. Reps don't care about system latency; they care about helping customers efficiently.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user goal that focuses on what the CUSTOMER SERVICE REP wants to achieve from their professional perspective. Think about their real-world situation: what outcome do they desperately need? What would solve their actual problem? Focus on their business need, not technical implementation. Consider the emotional and practical impact of their current pain point.",
        exampleAnswer: "The customer service rep can quickly access customer payment history and account details, so they can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userRole: {
      name: "User Role",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement clearly identifies WHO is using the system?",
        options: {
          A: "The CRM system displays customer history automatically.",
          B: "The customer service representative handling support tickets sees the customer's complete interaction history when they call.",
          C: "Users can see customer interaction history when needed.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — 'The CRM system' is not a user role. We need to know the specific person using the system, not the system itself.",
          B: "Correct — 'Customer service representative handling support tickets' is a specific, identifiable role. This tells us exactly who is using the system and their professional context.",
          C: "Wrong — 'Users' is too generic. We need to know the specific role, not just 'users'. This doesn't help us understand the stakeholder.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user role that is SPECIFIC and IDENTIFIABLE. Avoid generic terms like 'user' or 'person'. Think about WHO exactly is using this system. What is their specific role, professional position, or relationship to the system? Be precise about their identity and context. Consider their professional situation and why they need this system.",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    userAction: {
      name: "User Action",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement describes what the CUSTOMER SERVICE REP wants to DO?",
        options: {
          A: "The system automatically displays customer history when calls are received.",
          B: "The customer service rep can see the customer's complete interaction history when they call.",
          C: "Customer data is processed and stored in the database for future reference.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes what the system does automatically, not what the rep wants to do. The rep needs to be able to see the history, not have it automatically displayed.",
          B: "Correct — This describes what the rep wants to DO (see complete interaction history). It's action-oriented and focuses on the rep's capability.",
          C: "Wrong — This describes technical data processing, not what the rep wants to do. The rep needs to see the history, not process data.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user action that describes what the CUSTOMER SERVICE REP wants to DO. Focus on the ACTION aspect of the user story. What specific action do they want to take? What capability do they need? Be specific about the action, not the system behavior.",
        exampleAnswer: "The customer service rep can see the customer's complete interaction history when they call.",
      },
    },
    userBenefit: {
      name: "User Benefit",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement explains WHY the CUSTOMER SERVICE REP wants this capability?",
        options: {
          A: "So the system can track customer interactions for analytics.",
          B: "So the customer service rep can provide personalized assistance without asking them to repeat their story.",
          C: "So the database can store customer information efficiently.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes a system benefit, not a user benefit. The rep doesn't care about analytics; they care about helping customers.",
          B: "Correct — This explains the rep's real benefit: providing personalized assistance without repetition. This addresses their actual customer service need.",
          C: "Wrong — This describes a technical benefit, not a user benefit. The rep doesn't care about database efficiency; they care about customer service quality.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a user benefit that explains WHY the CUSTOMER SERVICE REP wants this capability. Think about their real-world benefit: what problem does this solve for them? What outcome do they need? Focus on their professional benefit, not technical benefits.",
        exampleAnswer: "So the customer service rep can provide personalized assistance without asking them to repeat their story.",
      },
    },
    userStory: {
      name: "User Story",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement follows the proper user story format?",
        options: {
          A: "The system should display customer history when calls are received.",
          B: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
          C: "Customer service reps need better tools to handle support tickets efficiently.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes system behavior, not a user story. User stories are written from the user's perspective, not the system's.",
          B: "Correct — This follows the proper format: As a [role], I want [action], so that [benefit]. It's written from the rep's perspective and includes all three elements.",
          C: "Wrong — This is a general statement, not a user story. User stories follow a specific format and are written from the user's perspective.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a complete user story following the format: As a [role], I want [action], so that [benefit]. Make sure all three elements are present and specific to the customer service context.",
        exampleAnswer: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
      },
    },
    acceptanceCriteria: {
      name: "Acceptance Criteria",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement provides clear, testable acceptance criteria?",
        options: {
          A: "The system should be user-friendly and efficient.",
          B: "Given a customer calls, when the rep answers, then they can see the customer's complete interaction history including previous calls, emails, and support tickets.",
          C: "Customer service reps need better tools to handle support tickets efficiently.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This is too vague and not testable. 'User-friendly' and 'efficient' are subjective terms that can't be measured.",
          B: "Correct — This follows the Given-When-Then format and is specific, measurable, and testable. It clearly defines the scenario and expected outcome.",
          C: "Wrong — This is a general statement, not acceptance criteria. Acceptance criteria should be specific and testable.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write clear, testable acceptance criteria using the Given-When-Then format. Be specific about what the rep can see and when they can see it.",
        exampleAnswer: "Given a customer calls, when the rep answers, then they can see the customer's complete interaction history including previous calls, emails, and support tickets.",
      },
    },
    businessValue: {
      name: "Business Value",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement describes the BUSINESS VALUE of this capability?",
        options: {
          A: "So the system can track customer interactions for analytics.",
          B: "So the customer service rep can provide personalized assistance without asking them to repeat their story.",
          C: "So the business can improve customer satisfaction and reduce call times, leading to higher customer retention and lower operational costs.",
        },
        correct: "C",
        feedback: {
          A: "Wrong — This describes a system benefit, not business value. Business value focuses on the impact to the business, not technical capabilities.",
          B: "Wrong — This describes the user benefit, not the business value. Business value focuses on the impact to the business, not the individual user.",
          C: "Correct — This describes the business value: improved customer satisfaction, reduced call times, higher retention, and lower costs. This shows the business impact.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a business value statement that describes the BUSINESS IMPACT of this capability. Think about how this helps the business: customer satisfaction, operational efficiency, costs, revenue, etc.",
        exampleAnswer: "So the business can improve customer satisfaction and reduce call times, leading to higher customer retention and lower operational costs.",
      },
    },
    userBusinessRequirement: {
      name: "User Business Requirement",
      learn: {
        referenceStory: "As a customer service representative handling support tickets, I want to see the customer's complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.",
        question: "Which statement describes the BUSINESS REQUIREMENT from the user's perspective?",
        options: {
          A: "The system must integrate with multiple data sources to provide comprehensive customer profiles.",
          B: "The customer service rep must be able to see the customer's complete interaction history when they call, so they can provide personalized assistance without repetition.",
          C: "The database must store customer interaction data efficiently for future reference.",
        },
        correct: "B",
        feedback: {
          A: "Wrong — This describes a technical requirement, not a business requirement. Business requirements focus on what the business needs, not how it's implemented.",
          B: "Correct — This describes the business requirement from the rep's perspective: they must be able to see complete history to provide personalized assistance. This addresses the business need.",
          C: "Wrong — This describes a technical requirement, not a business requirement. The rep doesn't care about database efficiency; they care about customer service quality.",
        },
      },
      apply: {
        scenario: "As a customer service representative handling billing inquiries, I want to quickly access customer payment history and account details, so that I can resolve billing disputes efficiently without transferring the call.",
        prompt: "Write a business requirement that describes what the BUSINESS NEEDS from the customer service rep's perspective. Focus on the business capability, not technical implementation.",
        exampleAnswer: "The customer service rep must be able to see the customer's complete interaction history when they call, so they can provide personalized assistance without repetition.",
      },
    },
  },
};