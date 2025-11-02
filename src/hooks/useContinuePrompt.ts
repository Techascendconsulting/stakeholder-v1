/**
 * useContinuePrompt Hook
 * Determines when to show the "Continue where you left off" modal
 */

import { useState, useEffect } from 'react';
import { loadResumeState, loadResumePrefs } from '../services/resumeStore';
import { trackPromptShown } from '../services/continueAnalytics';
import type { ResumeState } from '../types/resume';

export function useContinuePrompt(
  userId: string | undefined,
  isAdmin: boolean,
  onboardingCompleted: boolean
) {
  // Log hook call to confirm it's being invoked
  console.log('🔍 CONTINUE_PROMPT: Hook function called', { userId: !!userId, isAdmin, onboardingCompleted });
  
  const [shouldShow, setShouldShow] = useState(false);
  const [resumeState, setResumeState] = useState<ResumeState | null>(null);

  useEffect(() => {
    // Always log at start to ensure hook is running
    console.log('🔍 CONTINUE_PROMPT: ========== useEffect EXECUTING ==========');
    console.log('🔍 CONTINUE_PROMPT: Hook triggered', { userId: !!userId, userIdValue: userId, isAdmin, onboardingCompleted });
    
    // Quick check: What's in localStorage?
    try {
      const storedState = localStorage.getItem('resume_state');
      console.log('🔍 CONTINUE_PROMPT: Raw localStorage resume_state:', storedState ? 'EXISTS' : 'MISSING');
      if (storedState) {
        const parsed = JSON.parse(storedState);
        console.log('🔍 CONTINUE_PROMPT: Parsed state preview:', { path: parsed.path, pageType: parsed.pageType, userId: parsed.userId, isReturnable: parsed.isReturnable });
      }
    } catch (e) {
      console.warn('🔍 CONTINUE_PROMPT: Error checking localStorage:', e);
    }
    
    // Don't show if no user
    if (!userId) {
      console.log('🔍 CONTINUE_PROMPT: No userId, not showing');
      setShouldShow(false);
      return;
    }

    // Don't show for admin users (they go to admin dashboard)
    if (isAdmin) {
      console.log('🔍 CONTINUE_PROMPT: Admin user, not showing');
      setShouldShow(false);
      return;
    }

    // Don't show if onboarding not completed
    if (!onboardingCompleted) {
      console.log('🔍 CONTINUE_PROMPT: Onboarding not completed, not showing');
      setShouldShow(false);
      return;
    }

    // Check if already shown this session
    if (sessionStorage.getItem('continuePromptShown') === '1') {
      console.log('🔍 CONTINUE_PROMPT: Already shown this session, not showing');
      setShouldShow(false);
      return;
    }

    // Load preferences
    const prefs = loadResumePrefs();
    console.log('🔍 CONTINUE_PROMPT: Preferences', prefs);
    if (prefs.dontAskAgain) {
      console.log('🔍 CONTINUE_PROMPT: User chose "Don\'t ask again", not showing');
      setShouldShow(false);
      return;
    }

    // Load resume state
    const state = loadResumeState(userId);
    console.log('🔍 CONTINUE_PROMPT: Loaded resume state', state);
    if (!state) {
      console.log('🔍 CONTINUE_PROMPT: No resume state found, not showing');
      setShouldShow(false);
      return;
    }

    // Only show if state is returnable
    if (!state.isReturnable) {
      console.log('🔍 CONTINUE_PROMPT: State is not returnable', state);
      setShouldShow(false);
      return;
    }

    // Don't show for admin/dashboard/settings pages
    if (state.pageType === 'admin' || state.pageType === 'dashboard' || state.pageType === 'settings') {
      console.log('🔍 CONTINUE_PROMPT: Page type is not returnable', state.pageType);
      setShouldShow(false);
      return;
    }

    // All checks passed - show the modal
    console.log('✅ CONTINUE_PROMPT: All checks passed, showing modal for', state.path);
    setResumeState(state);
    setShouldShow(true);
    sessionStorage.setItem('continuePromptShown', '1');
    
    // Track analytics
    trackPromptShown(state);
  }, [userId, isAdmin, onboardingCompleted]);

  return {
    shouldShow,
    resumeState,
    dismiss: () => setShouldShow(false),
  };
}

