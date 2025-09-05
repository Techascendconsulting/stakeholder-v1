// Feature flags for the application
// These can be toggled to enable/disable features without code changes

export const FEATURE_FLAGS = {
  // Foundation V1 - New guided Foundation experience
  FOUNDATION_V1: true,
  
  // New Welcome V1 - Simple 2-path welcome page
  NEW_WELCOME_V1: true,
  
  // Other feature flags can be added here
  // EXAMPLE_FEATURE: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag];
};
