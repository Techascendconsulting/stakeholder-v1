/**
 * Resume Store Service
 * Handles saving and loading resume state for "Continue where you left off" feature
 */

import type { ResumeState, ResumePrefs, PageType } from '../types/resume';

const KEY_STATE = 'resume_state';
const KEY_PREFS = 'resume_prefs';

/**
 * Determine if a page type is returnable
 */
function isReturnablePageType(pageType: PageType): boolean {
  const returnableTypes: PageType[] = ['learning', 'practice', 'project'];
  return returnableTypes.includes(pageType);
}

/**
 * Determine if a route/path is returnable based on view name
 */
export function isReturnableRoute(view: string): boolean {
  // Exclude non-returnable routes
  const nonReturnableRoutes = [
    'dashboard',
    'welcome',
    'get-started',
    'admin',
    'admin-panel',
    'profile',
    'settings',
    'login',
    'signup',
    'contact-us',
    'faq',
    'support',
    'my-resources', // This might be debatable, but keeping it simple for Phase 1
  ];

  return !nonReturnableRoutes.includes(view);
}

/**
 * Load resume state from localStorage
 */
export function loadResumeState(userId?: string): ResumeState | null {
  try {
    const stored = localStorage.getItem(KEY_STATE);
    console.log('📂 RESUME_STORE: Loading resume state from localStorage', { stored: !!stored, userId });
    if (!stored) {
      console.log('📂 RESUME_STORE: No stored resume state found');
      return null;
    }

    const state: ResumeState = JSON.parse(stored);
    console.log('📂 RESUME_STORE: Parsed resume state', { path: state.path, pageType: state.pageType, savedUserId: state.userId, currentUserId: userId });

    // Validate the state structure
    if (!state.path || !state.pageType || !state.updatedAt) {
      console.warn('📂 RESUME_STORE: Invalid resume state structure, clearing', state);
      localStorage.removeItem(KEY_STATE);
      return null;
    }

    // If userId provided, validate it matches
    if (userId && state.userId !== userId) {
      console.log('📂 RESUME_STORE: Resume state for different user, clearing', { savedUserId: state.userId, currentUserId: userId });
      localStorage.removeItem(KEY_STATE);
      return null;
    }

    console.log('✅ RESUME_STORE: Resume state loaded successfully', { path: state.path, isReturnable: state.isReturnable });
    return state;
  } catch (error) {
    console.error('❌ RESUME_STORE: Error loading resume state:', error);
    localStorage.removeItem(KEY_STATE);
    return null;
  }
}

/**
 * Save resume state to localStorage
 */
export function saveResumeState(state: Partial<ResumeState> & { path: string; pageType: PageType; userId: string }): void {
  try {
    const resumeState: ResumeState = {
      userId: state.userId,
      path: state.path,
      pageType: state.pageType,
      pageTitle: state.pageTitle,
      moduleId: state.moduleId,
      stepId: state.stepId,
      tabId: state.tabId,
      practiceSessionId: state.practiceSessionId,
      projectId: state.projectId,
      scrollY: state.scrollY,
      updatedAt: Date.now(),
      isReturnable: isReturnablePageType(state.pageType) && isReturnableRoute(state.path),
      exitReason: state.exitReason,
    };

    console.log('💾 RESUME_STORE: Saving resume state', { 
      path: resumeState.path, 
      pageType: resumeState.pageType, 
      isReturnable: resumeState.isReturnable,
      userId: resumeState.userId 
    });
    
    localStorage.setItem(KEY_STATE, JSON.stringify(resumeState));
    console.log('✅ RESUME_STORE: Resume state saved successfully');
  } catch (error) {
    console.error('❌ RESUME_STORE: Error saving resume state:', error);
  }
}

/**
 * Clear resume state from localStorage
 */
export function clearResumeState(): void {
  localStorage.removeItem(KEY_STATE);
}

/**
 * Load resume preferences from localStorage
 */
export function loadResumePrefs(): ResumePrefs {
  try {
    const stored = localStorage.getItem(KEY_PREFS);
    if (!stored) {
      return { dontAskAgain: false };
    }

    const prefs: ResumePrefs = JSON.parse(stored);
    return {
      dontAskAgain: prefs.dontAskAgain ?? false,
      lastPromptAt: prefs.lastPromptAt,
    };
  } catch (error) {
    console.error('Error loading resume preferences:', error);
    return { dontAskAgain: false };
  }
}

/**
 * Save resume preferences to localStorage
 */
export function saveResumePrefs(prefs: ResumePrefs): void {
  try {
    localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving resume preferences:', error);
  }
}

/**
 * Get page title for a given view/path
 * This can be extended later with a mapping or lookup
 */
// Add window debug function for troubleshooting
if (typeof window !== 'undefined') {
  (window as any).debugResumeState = () => {
    const state = localStorage.getItem('resume_state');
    const prefs = localStorage.getItem('resume_prefs');
    const promptShown = sessionStorage.getItem('continuePromptShown');
    console.log('🔍 DEBUG RESUME STATE:', {
      resumeState: state ? JSON.parse(state) : null,
      prefs: prefs ? JSON.parse(prefs) : null,
      promptShownThisSession: promptShown
    });
    return {
      resumeState: state ? JSON.parse(state) : null,
      prefs: prefs ? JSON.parse(prefs) : null,
      promptShownThisSession: promptShown
    };
  };
}

export function getPageTitle(view: string): string {
  // Common page title mappings
  const titleMap: Record<string, string> = {
    'documentation': 'Requirements Specification',
    'requirements-engineering': 'Requirements Engineering',
    'stakeholder-mapping': 'Stakeholder Mapping',
    'project-initiation': 'Project Initiation',
    'solution-options': 'Solution Options',
    'design-hub': 'Design Hub',
    'mvp-hub': 'MVP Hub',
    'core-learning': 'Core Learning',
    'elicitation': 'Introduction to Elicitation',
    'process-mapper': 'Process Mapping',
    'scrum-essentials': 'Scrum Essentials',
    'training-practice': 'Training Practice',
    'meeting': 'Stakeholder Meeting',
    'voice-only-meeting': 'Voice Meeting',
    'ba-in-action-understanding-context': 'BA In Action • Understanding Context',
    'ba-in-action-stakeholder-communication': 'BA In Action • Stakeholder Communication',
    'ba-in-action-discovery-elicitation': 'BA In Action • Discovery & Elicitation',
    'ba-in-action-analysis-spotting-issues': 'BA In Action • Analysis & Spotting Issues',
    'ba-in-action-to-be-and-solution-shaping': 'BA In Action • To-Be & Solution Shaping',
    'ba-in-action-working-with-developers': 'BA In Action • Working with Developers',
    'ba-in-action-uat-validation': 'BA In Action • UAT & Validation',
    'ba-in-action-continuous-improvement': 'BA In Action • Continuous Improvement',
  };

  return titleMap[view] || view.charAt(0).toUpperCase() + view.slice(1).replace(/-/g, ' ');
}

