export const ADVANCED_TRIGGERS = [
  // User action
  "book", "booking", "request", "make a request", "schedule", "reschedule", "submit",
  "register", "apply", "application", "sign up", "update information",
  "upload", "attach", "fill a form", "complete a form", "provide details",
  "verify information", "enter ", "select ",

  // System interaction
  "receive confirmation", "confirmation message", "get notified", "notification",
  "download", "generate reference number", "match with existing record",
  "store information", "sync with system", "sync with database", "send email",
  "send message", "log the request", "validate eligibility", "restrict access",

  // Contextual
  "when submitting", "before confirmation", "on form submission", "after login",
  "after filling in", "once details are entered", "user should be prompted",
  "if criteria are met", "if x is selected"
];

export function shouldTriggerAdvancedMode(text: string): boolean {
  const lower = text.toLowerCase();
  return ADVANCED_TRIGGERS.some(trigger => lower.includes(trigger));
}

export function getAdvancedTriggersFound(text: string): string[] {
  const lower = text.toLowerCase();
  return ADVANCED_TRIGGERS.filter(trigger => lower.includes(trigger));
}



















