/**
 * Analytics Service for Continue Feature
 * Tracks user interactions with "Continue where you left off" modal
 */

import type { ResumeState } from '../types/resume';

type ContinueEvent = 
  | 'continue_prompt_shown'
  | 'continue_accept'
  | 'continue_decline_dashboard'
  | 'continue_dismiss'
  | 'continue_error_fallback'
  | 'continue_dont_ask_again_set';

interface AnalyticsEvent {
  event: ContinueEvent;
  page_type?: string;
  module_id?: string;
  step?: string;
  tab?: string;
  project_id?: string;
  reason?: string;
  dont_ask_again?: boolean;
}

/**
 * Track analytics event
 * In Phase 2, this logs to console. In Phase 3, integrate with actual analytics service
 */
export function trackContinueEvent(event: AnalyticsEvent): void {
  const timestamp = new Date().toISOString();
  
  // Log to console for now (replace with actual analytics in Phase 3)
  console.log(`📊 ANALYTICS [${timestamp}]:`, event);
  
  // In production, this would send to your analytics service:
  // analytics.track(event.event, {
  //   ...event,
  //   timestamp,
  //   userId: getCurrentUserId(),
  // });
  
  // For now, also store in localStorage for debugging/analysis
  try {
    const events = JSON.parse(localStorage.getItem('continue_analytics') || '[]');
    events.push({ ...event, timestamp });
    // Keep only last 100 events
    const recentEvents = events.slice(-100);
    localStorage.setItem('continue_analytics', JSON.stringify(recentEvents));
  } catch (error) {
    console.error('Error storing analytics event:', error);
  }
}

/**
 * Track when continue prompt is shown
 */
export function trackPromptShown(state: ResumeState): void {
  trackContinueEvent({
    event: 'continue_prompt_shown',
    page_type: state.pageType,
    module_id: state.moduleId,
    step: state.stepId,
    tab: state.tabId,
    project_id: state.projectId,
  });
}

/**
 * Track when user clicks Continue
 */
export function trackContinueAccept(state: ResumeState): void {
  trackContinueEvent({
    event: 'continue_accept',
    page_type: state.pageType,
    module_id: state.moduleId,
    step: state.stepId,
    tab: state.tabId,
    project_id: state.projectId,
  });
}

/**
 * Track when user clicks Go to Dashboard
 */
export function trackContinueDecline(state: ResumeState): void {
  trackContinueEvent({
    event: 'continue_decline_dashboard',
    page_type: state.pageType,
    module_id: state.moduleId,
    step: state.stepId,
    tab: state.tabId,
    project_id: state.projectId,
  });
}

/**
 * Track when user dismisses modal (X or Esc)
 */
export function trackContinueDismiss(state: ResumeState): void {
  trackContinueEvent({
    event: 'continue_dismiss',
    page_type: state.pageType,
    module_id: state.moduleId,
    step: state.stepId,
    tab: state.tabId,
    project_id: state.projectId,
  });
}

/**
 * Track when fallback is needed (invalid route, expired session, etc.)
 */
export function trackContinueErrorFallback(reason: string, state?: ResumeState): void {
  trackContinueEvent({
    event: 'continue_error_fallback',
    reason,
    page_type: state?.pageType,
    module_id: state?.moduleId,
    step: state?.stepId,
    tab: state?.tabId,
    project_id: state?.projectId,
  });
}

/**
 * Track when user sets "Don't ask again"
 */
export function trackDontAskAgain(dontAskAgain: boolean, state?: ResumeState): void {
  trackContinueEvent({
    event: 'continue_dont_ask_again_set',
    dont_ask_again: dontAskAgain,
    page_type: state?.pageType,
    module_id: state?.moduleId,
    step: state?.stepId,
    tab: state?.tabId,
    project_id: state?.projectId,
  });
}

