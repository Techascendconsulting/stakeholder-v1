/**
 * This function checks if the trigger statement in the AC matches the correct scope from the user story
 * For example: if the user story mentions 'lesson', but the AC mentions 'course', flag it.
 */

const triggerKeywords = ["after", "when", "once", "upon", "on", "before"];
const scopeKeywords = ["lesson", "course", "module", "section", "task"];

export interface TriggerScopeValidationResult {
  passed: boolean;
  mismatchFound?: boolean;
  expectedScope?: string;
  detectedScope?: string;
  coachingMessage?: string;
}

export function validateTriggerScope(
  userStory: string,
  acceptanceCriterion: string
): TriggerScopeValidationResult {
  const lowerUserStory = (userStory || "").toLowerCase();
  const lowerAC = (acceptanceCriterion || "").toLowerCase();

  const storyScope = scopeKeywords.find((scope) => lowerUserStory.includes(scope));
  const acScope = scopeKeywords.find((scope) => lowerAC.includes(scope));

  const triggerPhraseUsed = triggerKeywords.some((keyword) => lowerAC.includes(keyword));

  if (storyScope && acScope && storyScope !== acScope) {
    return {
      passed: false,
      mismatchFound: true,
      expectedScope: storyScope,
      detectedScope: acScope,
      coachingMessage:
        `⚠️ You’re close, but the trigger focuses on the wrong level.\n\n` +
        `Your user story is about “${storyScope}”, but your acceptance criteria is triggered by “${acScope}”. ` +
        `That might seem subtle, but it makes a big difference.\n\n` +
        `✍️ Try rephrasing: \n“After the learner completes a ${storyScope}, they should see it marked as completed.”`,
    };
  }

  if (!triggerPhraseUsed) {
    return {
      passed: false,
      mismatchFound: false,
      coachingMessage:
        `❓ Tip: Mention when this should happen, like “After completing a ${storyScope || 'task'}”. ` +
        `Triggers help define when the action happens.`,
    };
  }

  return { passed: true };
}







