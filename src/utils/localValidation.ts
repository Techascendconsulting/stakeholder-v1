// Local rule-based validation for BA Thinking Framework
// Provides instant keyword-based feedback without AI cost

interface ValidationCheck {
  pattern: RegExp;
  hint: string;
}

const VALIDATION_CHECKS: Record<string, ValidationCheck> = {
  "User Goal": {
    pattern: /user can|should be able|user is able|users can/i,
    hint: "Try rewriting from the user's perspective, e.g., 'The user can…' or 'The user should be able to…'"
  },
  "Trigger": {
    pattern: /when|after|once|if|whenever/i,
    hint: "Mention when or what event starts this action. Use words like 'when', 'after', or 'once'."
  },
  "Primary Flow": {
    pattern: /click|submit|see|navigate|complete|then|display|show/i,
    hint: "List clear visible steps of success. Include user actions and what they see at each step."
  },
  "Alternative Flow": {
    pattern: /instead|alternate|alternatively|or|option|can also|rather than/i,
    hint: "Describe a valid alternate path that still succeeds. Use words like 'instead', 'alternatively', or 'can also'."
  },
  "Rules & Validation": {
    pattern: /must|cannot|only if|require|should not|exceed|limit|maximum|minimum/i,
    hint: "Specify what must be true or limited. Use words like 'must', 'cannot', 'only if', or 'requires'."
  },
  "Roles & Permissions": {
    pattern: /admin|manager|officer|lead|team|only|authorized|permitted|restricted/i,
    hint: "Identify who can or cannot perform this action. Mention specific roles like 'admin', 'manager', 'team lead', etc."
  },
  "Feedback (Success)": {
    pattern: /message|confirmation|notice|success|alert|display|show|appear|see/i,
    hint: "Describe what success feedback appears. Mention visible confirmations like 'message', 'notice', or what the user sees."
  },
  "Error Handling": {
    pattern: /error|fail|retry|invalid|incorrect|wrong|unable|try again/i,
    hint: "Explain how the system helps recover from errors. Include what error appears and how users can fix it."
  },
  "Empty / Initial State": {
    pattern: /no|none|empty|before|yet|first time|initial|start|haven't/i,
    hint: "Describe what appears before data exists. Use words like 'no data yet', 'empty', or 'before'."
  },
  "Cancel / Undo": {
    pattern: /cancel|undo|reverse|revert|stop|discard|back to/i,
    hint: "Show how users can safely reverse or stop the action. Use words like 'cancel', 'undo', or 'reverse'."
  },
};

export interface LocalValidationResult {
  ok: boolean;
  hint?: string;
}

export function localValidation(ruleName: string, response: string): LocalValidationResult {
  if (!response || response.trim().length < 10) {
    return {
      ok: false,
      hint: "Please write at least a short sentence (10+ characters) to continue."
    };
  }

  const ruleCheck = VALIDATION_CHECKS[ruleName];
  
  if (!ruleCheck) {
    // No specific validation for this rule, allow it
    return { ok: true };
  }

  const valid = ruleCheck.pattern.test(response);
  
  return valid 
    ? { ok: true } 
    : { ok: false, hint: ruleCheck.hint };
}












