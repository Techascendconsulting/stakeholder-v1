/**
 * Resume State Types
 * Used for "Continue where you left off" feature
 */

export type PageType = "learning" | "practice" | "project" | "admin" | "dashboard" | "settings" | "auth";

export type ResumeState = {
  userId: string;                // Server-truth user ID
  path: string;                  // e.g., 'documentation', 'requirements-engineering'
  pageType: PageType;
  pageTitle?: string;            // Human-readable title for modal text
  moduleId?: string;
  stepId?: string;
  tabId?: string;
  practiceSessionId?: string;    // Might be non-resumable after TTL
  projectId?: string;
  scrollY?: number;              // Pixel scroll position (optional)
  updatedAt: number;             // Epoch milliseconds
  isReturnable: boolean;         // Business rule filter
  exitReason?: "closed" | "timeout" | "nav-away" | "logout";
};

export type ResumePrefs = {
  dontAskAgain: boolean;         // Default false
  lastPromptAt?: number;         // For analysis/back-offs later
};











