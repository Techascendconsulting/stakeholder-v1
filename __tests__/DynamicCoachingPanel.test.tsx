import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DynamicCoachingPanel from '../src/components/DynamicCoachingPanel';

// Mock the GreetingCoachingService
vi.mock('../src/services/greetingCoachingService', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getWarmUpGuidance: vi.fn().mockResolvedValue({
        title: "Professional Greeting Guide",
        description: "Start your stakeholder meeting with a professional, welcoming greeting.",
        why: "Professional greetings establish credibility and show respect.",
        how: "Use formal language, introduce yourself, acknowledge their time.",
        examples: [
          "Hello [Name], thank you for taking the time to meet today.",
          "Good morning everyone, I appreciate you joining us."
        ]
      }),
      evaluateGreeting: vi.fn().mockImplementation((greeting) => {
        const isCasual = /^(hi|hey|yo|what's up|hello\s*$)/i.test(greeting.trim());
        const hasProfessionalElements = /(thank|appreciate|business analyst|meet|understand|challenge|welcome|aim|discuss)/i.test(greeting);
        
        if (isCasual && !hasProfessionalElements) {
          return Promise.resolve({
            verdict: 'AMBER',
            message: "The greeting could be more professional by using a formal tone and addressing the stakeholders more respectfully.",
            suggestedRewrite: "Good morning everyone, thank you for taking the time to meet today. I'm the business analyst on this project, and I'm here to understand the current pain points and challenges in your process so we can work together to identify improvement opportunities.",
            reasoning: "The greeting is too casual for a professional stakeholder meeting.",
            technique: "Professional Communication"
          });
        } else {
          return Promise.resolve({
            verdict: 'GOOD',
            message: "Great professional greeting!",
            reasoning: "The greeting demonstrates appropriate professional tone and structure.",
            technique: "Professional Communication"
          });
        }
      })
    }))
  }
}));

const mockOnAcknowledgementStateChange = vi.fn();
const mockOnSuggestedRewrite = vi.fn();
const mockOnSubmitMessage = vi.fn();

const defaultProps = {
  projectName: 'Test Project',
  conversationHistory: [],
  onAcknowledgementStateChange: mockOnAcknowledgementStateChange,
  onSuggestedRewrite: mockOnSuggestedRewrite,
  onSubmitMessage: mockOnSubmitMessage,
};

describe('DynamicCoachingPanel - Phase 1: Greeting Only', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render greeting phase initially with warm-up guidance', async () => {
    render(<DynamicCoachingPanel {...defaultProps} />);
    
    expect(screen.getByText('Greeting')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    // Should show warm-up guidance initially
    await waitFor(() => {
      expect(screen.getByText('Professional Greeting Guide')).toBeInTheDocument();
      expect(screen.getByText('Why?')).toBeInTheDocument();
      expect(screen.getByText('How?')).toBeInTheDocument();
      expect(screen.getByText('Examples:')).toBeInTheDocument();
    });
  });

  it('should show AMBER feedback for casual greeting and hide warm-up guidance', async () => {
    const { rerender } = render(<DynamicCoachingPanel {...defaultProps} />);
    
    // Initially should show warm-up guidance
    await waitFor(() => {
      expect(screen.getByText('Professional Greeting Guide')).toBeInTheDocument();
    });
    
    // Add casual greeting to conversation history
    const propsWithCasualGreeting = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'hey',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithCasualGreeting} />);
    
    await waitFor(() => {
      // Warm-up guidance should disappear
      expect(screen.queryByText('Professional Greeting Guide')).not.toBeInTheDocument();
      
      // AMBER feedback should appear
      expect(screen.getByText(/The greeting could be more professional/i)).toBeInTheDocument();
      expect(screen.getByText(/Good morning everyone, thank you for taking the time/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Use This Greeting/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Okay, I understand/i })).toBeInTheDocument();
    });
  });

  it('should show GOOD feedback for professional greeting', async () => {
    const { rerender } = render(<DynamicCoachingPanel {...defaultProps} />);
    
    // Add professional greeting to conversation history
    const propsWithProfessionalGreeting = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'Hello John, thanks for taking the time to meet today. I\'m the business analyst on this project, and I\'d like to understand your current challenges.',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithProfessionalGreeting} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Great professional greeting!/i)).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('should handle "Use This Greeting" button click', async () => {
    const { rerender } = render(<DynamicCoachingPanel {...defaultProps} />);
    
    // Add casual greeting
    const propsWithCasualGreeting = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'hi',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithCasualGreeting} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Use This Greeting/i })).toBeInTheDocument();
    });

    // Click "Use This Greeting" button
    const useGreetingButton = screen.getByRole('button', { name: /Use This Greeting/i });
    fireEvent.click(useGreetingButton);

    // Should call onSuggestedRewrite with suggested greeting
    expect(mockOnSuggestedRewrite).toHaveBeenCalledWith('Good morning everyone, thank you for taking the time to meet today. I\'m the business analyst on this project, and I\'m here to understand the current pain points and challenges in your process so we can work together to identify improvement opportunities.');
  });

  it('should handle "Okay, I understand" button click', async () => {
    const { rerender } = render(<DynamicCoachingPanel {...defaultProps} />);
    
    // Add casual greeting
    const propsWithCasualGreeting = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'yo',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithCasualGreeting} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Okay, I understand/i })).toBeInTheDocument();
    });

    // Click "Okay, I understand" button
    const acknowledgeButton = screen.getByRole('button', { name: /Okay, I understand/i });
    fireEvent.click(acknowledgeButton);

    // Should show problem exploration feedback
    await waitFor(() => {
      expect(screen.getByText('Let\'s refine this')).toBeInTheDocument();
      expect(screen.getByText('Use This Question')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  it('should call onAcknowledgementStateChange when awaiting acknowledgement', async () => {
    const { rerender } = render(<DynamicCoachingPanel {...defaultProps} />);
    
    // Add casual greeting
    const propsWithCasualGreeting = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'what\'s up',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithCasualGreeting} />);
    
    await waitFor(() => {
      expect(mockOnAcknowledgementStateChange).toHaveBeenCalledWith(true);
    });
  });
});
