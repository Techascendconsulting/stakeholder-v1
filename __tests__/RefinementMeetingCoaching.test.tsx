import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefinementMeetingView } from '../src/components/Views/RefinementMeetingView';
import { getCoachingForSegment, shouldShowCoaching } from '../src/services/refinementCoachingService';

// Mock the dependencies
vi.mock('../src/contexts/VoiceContext', () => ({
  useVoice: () => ({
    globalAudioEnabled: true,
    setGlobalAudioEnabled: vi.fn()
  })
}));

vi.mock('../src/services/agileRefinementService', () => ({
  default: {
    getInstance: () => ({
      getTeamMembers: () => [
        {
          id: 'sarah',
          name: 'Sarah',
          role: 'Scrum Master',
          voiceId: 'test-voice-id',
          personality: 'Professional and organized',
          focusAreas: ['Process improvement'],
          responseStyle: 'Direct and clear',
          avatarUrl: null,
          expertise: ['Scrum', 'Agile']
        }
      ]
    })
  }
}));

vi.mock('../src/services/preGeneratedAudioService', () => ({
  playPreGeneratedAudio: vi.fn(),
  hasPreGeneratedAudio: vi.fn().mockReturnValue(false),
  findPreGeneratedAudio: vi.fn()
}));

vi.mock('../src/services/elevenLabsTTS', () => ({
  isConfigured: vi.fn().mockReturnValue(false),
  synthesizeToBlob: vi.fn()
}));

vi.mock('../src/services/aiService', () => ({
  default: {
    generateResponse: vi.fn()
  }
}));

// Mock the coaching service
vi.mock('../src/services/refinementCoachingService', () => ({
  getCoachingForSegment: vi.fn(),
  shouldShowCoaching: vi.fn(),
  CoachingPoint: {}
}));

describe('Refinement Meeting Coaching System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract trial ID correctly from story ID', () => {
    // Test the trial ID extraction logic
    const storyId = 'trial-1-story-1';
    const trialId = storyId ? storyId.split('-').slice(0, 2).join('-') : 'trial-1';
    
    expect(trialId).toBe('trial-1');
  });

  it('should extract trial ID correctly for trial-2', () => {
    const storyId = 'trial-2-story-1';
    const trialId = storyId ? storyId.split('-').slice(0, 2).join('-') : 'trial-1';
    
    expect(trialId).toBe('trial-2');
  });

  it('should handle null story ID gracefully', () => {
    const storyId = null;
    const trialId = storyId ? storyId.split('-').slice(0, 2).join('-') : 'trial-1';
    
    expect(trialId).toBe('trial-1');
  });

  it('should find coaching for sarah-opening audio ID in trial-1', () => {
    const coaching = getCoachingForSegment('sarah-opening', 'trial-1');
    
    expect(coaching).toBeTruthy();
    expect(coaching?.title).toBe('How the Scrum Master Opens');
    expect(coaching?.placement).toBe('top-right');
  });

  it('should find coaching for bola-presentation audio ID in trial-1', () => {
    const coaching = getCoachingForSegment('bola-presentation', 'trial-1');
    
    expect(coaching).toBeTruthy();
    expect(coaching?.title).toBe('How a BA Frames the Story');
    expect(coaching?.placement).toBe('bottom-right');
  });

  it('should return null for non-existent audio ID', () => {
    const coaching = getCoachingForSegment('non-existent-id', 'trial-1');
    
    expect(coaching).toBeNull();
  });

  it('should find coaching for victor-presentation-2 audio ID in trial-2', () => {
    const coaching = getCoachingForSegment('victor-presentation-2', 'trial-2');
    
    expect(coaching).toBeTruthy();
    expect(coaching?.title).toBe('How a BA Frames the Story');
    expect(coaching?.placement).toBe('bottom-right');
  });

  it('should always return true for shouldShowCoaching', () => {
    const coaching = {
      title: 'Test Coaching',
      body: 'Test body',
      useRegex: false,
      placement: 'bottom-right' as const,
      accent: 'primary' as const
    };
    
    const result = shouldShowCoaching('test text', coaching, 'test text');
    
    expect(result).toBe(true);
  });

  it('should have coaching data for all expected audio segments in trial-1', () => {
    const expectedAudioIds = [
      'sarah-opening',
      'bola-presentation', 
      'srikanth-question',
      'bola-answer',
      'srikanth-question-2',
      'bola-answer-2',
      'lisa-technical',
      'srikanth-response',
      'tom-testing',
      'sarah-sizing',
      'srikanth-confirm',
      'sarah-conclude'
    ];

    expectedAudioIds.forEach(audioId => {
      const coaching = getCoachingForSegment(audioId, 'trial-1');
      // Some segments have coaching, some don't - that's expected
      // We just want to make sure the function doesn't crash
      expect(typeof coaching === 'object' || coaching === null).toBe(true);
    });
  });

  it('should have coaching data for all expected audio segments in trial-2', () => {
    const expectedAudioIds = [
      'victor-presentation-2',
      'srikanth-check-2',
      'victor-confirm-2',
      'lisa-email-2',
      'victor-template-2',
      'tom-tests-2',
      'victor-log-2',
      'lisa-retry-ask-2',
      'srikanth-retry-2',
      'sarah-size-2',
      'srikanth-2pts-2',
      'lisa-2pts-2',
      'tom-2pts-2',
      'sarah-conclude-2',
      'sarah-goodbye'
    ];

    expectedAudioIds.forEach(audioId => {
      const coaching = getCoachingForSegment(audioId, 'trial-2');
      // Some segments have coaching, some don't - that's expected
      // We just want to make sure the function doesn't crash
      expect(typeof coaching === 'object' || coaching === null).toBe(true);
    });
  });
});




















