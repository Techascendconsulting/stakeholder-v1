import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Types for onboarding data
export type OnboardingExperienceLevel = 'new' | 'trained_but_no_job' | 'trained_want_practice' | 'starting_project' | 'working_ba';
export type OnboardingIntent = 'learn_basics' | 'practice_skills' | 'start_real_project' | 'get_project_help';

export interface OnboardingData {
  experience_level: OnboardingExperienceLevel | null;
  intent: OnboardingIntent | null;
  onboarding_stage: 'in_progress' | 'completed';
  completed_at: string | null;
}

export interface OnboardingContextType {
  // Current step state
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // User selections
  experienceLevel: OnboardingExperienceLevel | null;
  setExperienceLevel: (level: OnboardingExperienceLevel) => void;
  intent: OnboardingIntent | null;
  setIntent: (intent: OnboardingIntent) => void;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Data
  onboardingData: OnboardingData | null;
  
  // Actions
  saveOnboardingData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  
  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  
  // Validation
  canProceedToNext: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState<OnboardingExperienceLevel | null>(null);
  const [intent, setIntent] = useState<OnboardingIntent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  // Load existing onboarding data when user changes
  useEffect(() => {
    if (user) {
      loadOnboardingData();
    }
  }, [user]);

  const loadOnboardingData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Try to get data from user_onboarding table first
      // Load from user_onboarding table
      let onboardingData = null;
      try {
        const { data, error: onboardingError } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (onboardingError) {
          if (onboardingError.code === 'PGRST116') {
            // No data found, this is expected
            console.log('No onboarding data found for user');
          } else if (onboardingError.code === '406' || onboardingError.message?.includes('406')) {
            // Table doesn't exist or has issues, skip silently
            console.log('user_onboarding table not available, skipping');
          } else {
            console.error('Error loading onboarding data:', onboardingError);
          }
        } else {
          onboardingData = data;
        }
      } catch (error) {
        // Suppress 406 errors completely
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (errorMessage && errorMessage.includes('406')) {
            console.log('user_onboarding table not available, using fallback');
          } else {
            console.warn('user_onboarding table not available, using fallback:', error);
          }
        } else {
          console.warn('user_onboarding table not available, using fallback:', error);
        }
      }

      // Also check user_profiles for backward compatibility
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('has_completed_onboarding, onboarding_experience_level, onboarding_starting_intent, onboarding_completed_at')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile data:', profileError);
      }

      // Combine data
      const combinedData: OnboardingData = {
        experience_level: onboardingData?.experience_level || profileData?.onboarding_experience_level || null,
        intent: onboardingData?.intent || profileData?.onboarding_starting_intent || null,
        onboarding_stage: onboardingData?.onboarding_stage || (profileData?.has_completed_onboarding ? 'completed' : 'in_progress'),
        completed_at: onboardingData?.completed_at || profileData?.onboarding_completed_at
      };

      setOnboardingData(combinedData);
      
      // If onboarding is completed, set the data
      if (combinedData.experience_level) {
        setExperienceLevel(combinedData.experience_level);
      }
      if (combinedData.intent) {
        setIntent(combinedData.intent);
      }

    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingData = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Try to save to user_onboarding table
      try {
        // First, delete any existing onboarding record for this user
        await supabase
          .from('user_onboarding')
          .delete()
          .eq('user_id', user.id);
        
        // Then insert the new onboarding data
        const { error: onboardingError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: user.id,
            experience_level: experienceLevel,
            intent: intent,
            onboarding_stage: 'in_progress'
          });

        if (onboardingError) {
          if (onboardingError.code === '406' || onboardingError.message?.includes('406')) {
            console.log('user_onboarding table not available, skipping save');
          } else {
            console.error('Error saving to user_onboarding:', onboardingError);
          }
        }
      } catch (error) {
        // Suppress 406 errors completely
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (errorMessage && errorMessage.includes('406')) {
            console.log('user_onboarding table not available, skipping save');
          } else {
            console.warn('user_onboarding table not available, skipping save:', error);
          }
        } else {
          console.warn('user_onboarding table not available, skipping save:', error);
        }
      }

      // Also save to user_profiles for backward compatibility
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_experience_level: experienceLevel,
          onboarding_starting_intent: intent,
          has_completed_onboarding: false
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error saving to user_profiles:', profileError);
      }

    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      const completedAt = new Date().toISOString();
      
      // Try to save to user_onboarding table
      try {
        // First, delete any existing onboarding record for this user
        await supabase
          .from('user_onboarding')
          .delete()
          .eq('user_id', user.id);
        
        // Then insert the completed onboarding data
        const { error: onboardingError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: user.id,
            experience_level: experienceLevel,
            intent: intent,
            onboarding_stage: 'completed',
            completed_at: completedAt
          });

        if (onboardingError) {
          if (onboardingError.code === '406' || onboardingError.message?.includes('406')) {
            console.log('user_onboarding table not available, skipping save');
          } else {
            console.error('Error completing onboarding:', onboardingError);
          }
        }
      } catch (error) {
        // Suppress 406 errors completely
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (errorMessage && errorMessage.includes('406')) {
            console.log('user_onboarding table not available, skipping save');
          } else {
            console.warn('user_onboarding table not available, skipping save:', error);
          }
        } else {
          console.warn('user_onboarding table not available, skipping save:', error);
        }
      }

      // Complete in user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_experience_level: experienceLevel,
          onboarding_starting_intent: intent,
          has_completed_onboarding: true,
          onboarding_completed_at: completedAt
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Update local state
      setOnboardingData(prev => prev ? {
        ...prev,
        onboarding_stage: 'completed',
        completed_at: completedAt
      } : null);

    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetOnboarding = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Reset in user_onboarding table
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .delete()
        .eq('user_id', user.id);

      if (onboardingError) {
        console.error('Error resetting onboarding:', onboardingError);
      }

      // Reset in user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          has_completed_onboarding: false,
          onboarding_experience_level: null,
          onboarding_starting_intent: null,
          onboarding_completed_at: null
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error resetting profile:', profileError);
      }

      // Reset local state
      setCurrentStep(1);
      setExperienceLevel(null);
      setIntent(null);
      setOnboardingData(null);

    } catch (error) {
      console.error('Error resetting onboarding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  // Validation logic
  const canProceedToNext = (() => {
    switch (currentStep) {
      case 1: return true; // Welcome screen
      case 2: return experienceLevel !== null;
      case 3: return intent !== null;
      case 4: return true; // Summary screen
      default: return false;
    }
  })();

  const value: OnboardingContextType = {
    currentStep,
    setCurrentStep,
    experienceLevel,
    setExperienceLevel,
    intent,
    setIntent,
    isLoading,
    isSaving,
    onboardingData,
    saveOnboardingData,
    completeOnboarding,
    resetOnboarding,
    nextStep,
    previousStep,
    goToStep,
    canProceedToNext
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
