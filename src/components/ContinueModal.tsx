/**
 * ContinueModal Component
 * Modal for "Continue where you left off" feature
 * Phase 1: Basic implementation without scroll restore or advanced edge handling
 */

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ResumeState } from '../types/resume';
import { saveResumePrefs } from '../services/resumeStore';
import { trackContinueAccept, trackContinueDecline, trackContinueDismiss, trackDontAskAgain } from '../services/continueAnalytics';

interface ContinueModalProps {
  resumeState: ResumeState;
  userName?: string;
  onContinue: () => void;
  onGoToDashboard: () => void;
  onDismiss: () => void;
}

export function ContinueModal({
  resumeState,
  userName,
  onContinue,
  onGoToDashboard,
  onDismiss,
}: ContinueModalProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Generate context hint for the modal
  const getContextHint = (): string => {
    if (resumeState.pageType === 'learning' && resumeState.moduleId && resumeState.stepId) {
      return ` — Module ${resumeState.moduleId}, Step ${resumeState.stepId}`;
    } else if (resumeState.pageType === 'practice') {
      return ' — Stakeholder practice session';
    } else if (resumeState.pageType === 'project' && resumeState.projectId) {
      return ` — Project: ${resumeState.projectId}`;
    }
    return '';
  };

  const handleDontAskChange = (checked: boolean) => {
    setDontAskAgain(checked);
    if (checked) {
      saveResumePrefs({ dontAskAgain: true, lastPromptAt: Date.now() });
      trackDontAskAgain(true, resumeState);
    }
  };

  const handleDismiss = () => {
    trackContinueDismiss(resumeState);
    onDismiss();
    // Dismiss behaves same as "Go to Dashboard"
    onGoToDashboard();
  };

  const handleContinue = () => {
    trackContinueAccept(resumeState);
    onContinue();
  };

  const handleGoToDashboard = () => {
    trackContinueDecline(resumeState);
    onGoToDashboard();
  };

  // Animation: Fade in on mount
  useEffect(() => {
    setIsVisible(true);
    // Store previously focused element for restoration
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    // Focus continue button on mount
    setTimeout(() => {
      continueButtonRef.current?.focus();
    }, 100);
  }, []);

  // Focus trap: Keep focus within modal
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      window.removeEventListener('keydown', handleEscape);
      // Restore focus to previously focused element
      previouslyFocusedElement.current?.focus();
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const contextHint = getContextHint();
  const pageTitle = resumeState.pageTitle || resumeState.path;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="continue-modal-title"
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 
            id="continue-modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Welcome back{userName ? `, ${userName}` : ''}!
          </h2>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          You were last on{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {pageTitle}
          </span>
          {contextHint}. Continue where you left off?
        </p>

        {/* Don't ask again checkbox */}
        <div className="flex items-center gap-2 mb-6">
          <input
            id="dontAskAgain"
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => handleDontAskChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label 
            htmlFor="dontAskAgain" 
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Don't ask again
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            ref={continueButtonRef}
            onClick={handleContinue}
            className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Continue
          </button>
          <button
            onClick={handleGoToDashboard}
            className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

