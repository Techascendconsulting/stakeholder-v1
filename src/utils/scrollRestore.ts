/**
 * Scroll Restoration Utility
 * Handles restoring scroll position and tab/step state after navigation
 */

import type { ResumeState } from '../types/resume';

/**
 * Restore scroll position after navigation
 * Uses requestAnimationFrame to ensure DOM is ready
 */
export function restoreScrollPosition(scrollY?: number): void {
  if (!scrollY || scrollY <= 0) return;

  // Wait for next frame to ensure content is rendered
  requestAnimationFrame(() => {
    // Double RAF for more reliable restoration
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollY,
        behavior: 'auto', // Instant scroll, not smooth (feels more natural for restoration)
      });
      console.log('📜 Scroll restored to:', scrollY);
    });
  });
}

/**
 * Restore tab/step state if available
 * This is a generic implementation - individual views can override with specific logic
 */
export function restoreTabState(tabId?: string, stepId?: string): void {
  if (!tabId && !stepId) return;

  // Wait for content to be rendered
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (tabId) {
        // Try multiple methods to activate tab
        const tabElement = 
          document.querySelector(`[data-tab-id="${tabId}"]`) ||
          document.querySelector(`#${tabId}`) ||
          document.querySelector(`[aria-controls="${tabId}"]`) ||
          Array.from(document.querySelectorAll('[role="tab"]')).find(
            el => el.textContent?.trim().toLowerCase().replace(/\s+/g, '-') === tabId
          );

        if (tabElement) {
          (tabElement as HTMLElement).click();
          console.log('📑 Tab restored:', tabId);
        }
      }

      if (stepId) {
        // Try to restore step/lesson selection
        const stepElement =
          document.querySelector(`[data-step-id="${stepId}"]`) ||
          document.querySelector(`#${stepId}`) ||
          document.querySelector(`[data-active-step="${stepId}"]`);

        if (stepElement) {
          (stepElement as HTMLElement).click();
          console.log('📝 Step restored:', stepId);
        }
      }
    });
  });
}

/**
 * Main restoration function - restores both scroll and tab/step state
 */
export function restoreResumeState(state: ResumeState): void {
  restoreTabState(state.tabId, state.stepId);
  restoreScrollPosition(state.scrollY);
}











