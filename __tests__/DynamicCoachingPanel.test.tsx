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

// Mock the ProblemExplorationService
vi.mock('../src/services/problemExplorationService', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getProblemExplorationGuidance: vi.fn().mockResolvedValue({
        title: "Problem Exploration Guide",
        description: "Brief overview of what makes a good problem exploration question:",
        why: "This question is crucial in project meetings because it helps ensure everyone is aligned on the core issue the project is meant to address.",
        how: "Ask open-ended questions that prompt stakeholders to reflect on pain points, not just proposed solutions. Encourage them to describe real situations and the impact.",
        examples: [
          "What challenges led to this project being initiated?",
          "Can you describe a recent issue that highlighted this need?",
          "What would success look like once this problem is solved?"
        ]
      }),
      evaluateProblemExplorationQuestion: vi.fn().mockImplementation((question) => {
        const isProblemFocused = /(problem|challenge|issue|pain|difficulty|struggle|concern)/i.test(question);
        const isOpenEnded = /(what|how|why|when|where|describe|explain|tell)/i.test(question);
        
        if (isProblemFocused && isOpenEnded) {
          return Promise.resolve({
            verdict: 'GOOD',
            message: "Great problem exploration question!",
            reasoning: "The question effectively focuses on problems and encourages open-ended exploration.",
            technique: "Problem Exploration"
          });
        } else {
          return Promise.resolve({
            verdict: 'AMBER',
            message: "This question could be more effective for problem exploration.",
            suggestedRewrite: "What specific challenges or pain points are you experiencing that led to this project being initiated?",
            reasoning: "The question could better focus on problems rather than solutions.",
            technique: "Problem Exploration"
          });
        }
      })
    }))
  }
}));

// Mock the StakeholderResponseAnalysisService
vi.mock('../src/services/stakeholderResponseAnalysisService', () => ({
  default: {
    getInstance: vi.fn(() => ({
      analyzeStakeholderResponse: vi.fn().mockResolvedValue({
        insights: ["Stakeholder mentioned manual processes being time-consuming"],
        painPoints: ["Manual processes", "Time-consuming workflows"],
        blockers: ["Lack of automation", "Inefficient processes"],
        nextQuestion: "Can you walk me through a typical day and show me where the bottlenecks occur?",
        reasoning: "This will help us understand the specific pain points in their daily workflow",
        technique: "Process Mapping"
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
      expect(screen.getByText('7%')).toBeInTheDocument();
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
      expect(screen.getByText('Consider using this improved question in your next interaction.')).toBeInTheDocument();
      expect(screen.getByText('7%')).toBeInTheDocument();
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

  it('should trigger stakeholder analysis when stakeholder responds after GOOD problem exploration question', async () => {
    const { rerender } = render(<DynamicCoachingPanel {...defaultProps} />);
    
    // First, complete greeting phase
    const propsWithGoodGreeting = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'Hello everyone, thank you for taking the time to meet today. I\'m the business analyst on this project.',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithGoodGreeting} />);
    
    // Wait for greeting to be evaluated and move to problem exploration
    // The setTimeout in evaluateGreeting takes 2 seconds, so we need to wait
    await new Promise(resolve => setTimeout(resolve, 2500));
    await waitFor(() => {
      expect(screen.getByText('Problem Exploration')).toBeInTheDocument();
    });

    // Now add a GOOD problem exploration question
    const propsWithGoodProblemQuestion = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'Hello everyone, thank you for taking the time to meet today. I\'m the business analyst on this project.',
          timestamp: new Date()
        },
        {
          id: '2',
          sender: 'user',
          content: 'What specific challenges or pain points are you experiencing that led to this project being initiated?',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithGoodProblemQuestion} />);
    
    // Wait for problem exploration to be evaluated as GOOD
    await waitFor(() => {
      expect(screen.getByText('Great problem exploration question!')).toBeInTheDocument();
    });

    // Now add stakeholder response
    const propsWithStakeholderResponse = {
      ...defaultProps,
      conversationHistory: [
        {
          id: '1',
          sender: 'user',
          content: 'Hello everyone, thank you for taking the time to meet today. I\'m the business analyst on this project.',
          timestamp: new Date()
        },
        {
          id: '2',
          sender: 'user',
          content: 'What specific challenges or pain points are you experiencing that led to this project being initiated?',
          timestamp: new Date()
        },
        {
          id: '3',
          sender: 'stakeholder',
          content: 'We\'re having issues with our current process being too manual and time-consuming.',
          timestamp: new Date()
        }
      ]
    };

    rerender(<DynamicCoachingPanel {...propsWithStakeholderResponse} />);
    
    // Wait for stakeholder analysis to be triggered
    await waitFor(() => {
      expect(screen.getByText('Stakeholder Analysis')).toBeInTheDocument();
    });
  });
});
