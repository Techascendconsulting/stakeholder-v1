export type ValidationResult =
  | { type: 'success' }
  | { type: 'missingRoleActionOutcome'; message: string }
  | { type: 'gibberish'; message: string }
  | { type: 'incomplete'; message: string }
  | { type: 'unrelated'; message: string };

export function validateAcceptanceCriterion(
  input: string,
  scenarioKeywords: string[],
  userStory: string
): ValidationResult {
  const cleaned = input.trim().toLowerCase();

  // Check for gibberish or test inputs
  if (!cleaned || /^(e{3,}|[a-z]{1,2} ?)+$/i.test(cleaned) || cleaned.includes('test')) {
    return {
      type: 'gibberish',
      message: "Hmm, this doesn't look like a real input. Want to try writing it properly?",
    };
  }

  // Check for incomplete inputs
  if (
    cleaned.split(' ').length < 4 ||
    /^[a-z]*ing$/.test(cleaned) ||
    /^(because|and|but|if)\b/i.test(cleaned) ||
    /if.*(no then|nothing happens)?$/i.test(cleaned)
  ) {
    return {
      type: 'incomplete',
      message: 'Looks like this might be missing key details. Try explaining the condition and the outcome.',
    };
  }

  // Check for relevance to context
  const contextKeywords = extractKeywords(userStory).concat(scenarioKeywords);
  const hasRelevantKeyword = contextKeywords.some((kw) => cleaned.includes(kw));

  if (!hasRelevantKeyword) {
    return {
      type: 'unrelated',
      message: 'This doesn't seem related to the user story or scenario. Want to review the context?',
    };
  }

  // Check user story structure: role, action, outcome
  const roleMatch = /as a[n]?\s+\w+/i.test(userStory);
  const actionMatch = /i want to\s+[a-z ]+/i.test(userStory);
  const outcomeMatch = /so that\s+[a-z ]+/i.test(userStory);

  if (!roleMatch || !actionMatch || !outcomeMatch) {
    return {
      type: 'missingRoleActionOutcome',
      message: 'The user story seems incomplete — check if it includes a role, what they want, and why.',
    };
  }

  return { type: 'success' };
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter((word) => word.length > 3);
}
