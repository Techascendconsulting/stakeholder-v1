# Stakeholder Interview Framework

A comprehensive, structured approach to conducting stakeholder interviews for business analysis, built with React and TypeScript.

## Overview

The Stakeholder Interview Framework provides a guided, 8-phase approach to conducting effective stakeholder discovery sessions. Each phase is designed to systematically gather information while building rapport and ensuring comprehensive coverage of business needs.

## Features

### 🎯 **8-Phase Structured Approach**
1. **Warm-up** (0-10%) - Set tone, introduce purpose, gain permission
2. **Problem Exploration** (10-30%) - Elicit 2-3 pain points with examples
3. **Impact** (30-50%) - Quantify time, cost, and risk of pain points
4. **Prioritisation** (50-60%) - Pick one pain point to focus on first
5. **Root Cause** (60-75%) - Understand why the problem exists
6. **Success Criteria** (75-85%) - Define what "good" looks like
7. **Constraints** (85-90%) - Capture non-negotiables
8. **Wrap-up** (90-100%) - Close loop, agree follow-up

### 🧭 **Guided Coaching Panel**
- **Guide Tab**: Primary questions, rationale, and next steps
- **Dig Deeper Tab**: Contextual follow-up questions
- **Interpret Tab**: What to look for (good signs, warning signs, listen for)
- **Notes Tab**: Structured note-taking templates
- **Artifacts Tab**: Progress tracking and captured information

### 📊 **Progress Tracking**
- Visual progress bar showing completion percentage
- Phase-by-phase checklist with completion status
- Real-time session data capture and display

### 💾 **Session Management**
- Export interview sessions as JSON
- Reset functionality for practice sessions
- Persistent session state management

## Architecture

### Core Components

#### `StakeholderInterviewBlueprint` (`src/data/stakeholderInterviewBlueprint.ts`)
- Defines the 8-phase interview structure
- Contains prompts, guidance, and transition logic
- Includes helper functions for entity extraction

#### `StakeholderInterviewPanel` (`src/components/StakeholderInterviewPanel.tsx`)
- Main coaching interface component
- Tabbed interface for different guidance types
- Real-time session data display

#### `StakeholderInterviewReducer` (`src/services/stakeholderInterviewReducer.ts`)
- State management for interview sessions
- Transition logic between phases
- Data capture and summary generation

#### `StakeholderInterviewView` (`src/components/Views/StakeholderInterviewView.tsx`)
- Demo and practice interface
- Session controls (reset, export, demo mode)
- Visual phase overview and progress tracking

### Data Flow

```
Blueprint Definition → Panel Component → Reducer Service → Session State
```

## Usage

### Basic Usage

```typescript
import { createInitialSession, transitionToNext } from '../services/stakeholderInterviewReducer';
import StakeholderInterviewPanel from '../components/StakeholderInterviewPanel';

const [session, setSession] = useState(createInitialSession());

const handleNext = () => {
  setSession(prevSession => transitionToNext(prevSession));
};

<StakeholderInterviewPanel
  session={session}
  onNext={handleNext}
  onSendSummary={handleSendSummary}
  onAddPainPoint={handleAddPainPoint}
  onAddSessionNote={handleAddSessionNote}
/>
```

### Session Data Structure

```typescript
interface StakeholderInterviewSession {
  state: string;                    // Current phase
  progress: number;                 // Completion percentage
  completedStates: string[];        // Completed phases
  data: {
    pain_points: Array<{            // Captured pain points
      text: string;
      who: string;
      example?: string;
    }>;
    session_notes: string[];        // General session notes
    impact_notes: string[];         // Impact quantification
    priority_choice: string;        // Selected priority
    root_causes: string[];          // Root cause analysis
    success_measures: string[];     // Success criteria
    constraints: string[];          // Identified constraints
    next_steps: string[];           // Agreed next steps
  };
}
```

## Key Features Explained

### 1. Contextual Guidance
Each phase provides:
- **Primary Question**: Main question to ask the stakeholder
- **Why This Matters**: Rationale for the phase
- **How to Ask**: Technique guidance
- **Next Step**: Transition guidance

### 2. Smart Follow-up Questions
The "Dig Deeper" tab provides contextual follow-up questions based on:
- Stakeholder responses
- Mentioned entities (people, processes, systems)
- Response patterns

### 3. Interpretation Guidance
The "Interpret" tab helps identify:
- **Good Signs**: Positive indicators of engagement
- **Warning Signs**: Red flags to watch for
- **Listen For**: Key information to capture

### 4. Structured Note-taking
Each phase includes specific note templates:
- Problem Exploration: Pain point, affected parties, examples
- Impact: Frequency, time lost, secondary risks
- Success Criteria: Desired outcomes, metrics
- Constraints: Policy constraints, approval requirements

### 5. Progress Visualization
- Visual progress bar with percentage
- Phase completion indicators
- Current phase highlighting
- Captured information display

## Best Practices

### 1. Phase Transitions
- Don't rush through phases
- Ensure sufficient information is captured before moving on
- Use the "Summarize So Far" feature to confirm understanding

### 2. Note-taking
- Use the structured templates provided
- Capture specific examples and metrics
- Note stakeholder emotions and engagement levels

### 3. Follow-up Questions
- Use contextual questions from the "Dig Deeper" tab
- Adapt questions based on stakeholder responses
- Focus on quantification when possible

### 4. Session Management
- Export sessions for future reference
- Use demo mode for practice
- Reset sessions to practice different scenarios

## Customization

### Adding New Phases
1. Update `stakeholderInterviewBlueprint.ts`
2. Add phase definition with cards and transitions
3. Update progress weight calculations
4. Add any new data fields to the session interface

### Modifying Questions
1. Edit the `cards.guide.prompt` for primary questions
2. Update `cards.dig_deeper` for follow-up questions
3. Modify `cards.interpret` for guidance changes
4. Update `cards.notes_template` for note structure

### Custom Entity Detection
1. Extend the `extractEntities` function
2. Add new keyword patterns
3. Update transition conditions as needed

## Integration

The framework is designed to integrate with existing business analysis workflows:

- **Meeting Systems**: Can be embedded in existing meeting interfaces
- **Documentation**: Export functionality for report generation
- **Training**: Demo mode for skill development
- **Collaboration**: Session sharing and review capabilities

## Future Enhancements

### Planned Features
- **AI Integration**: Smart question suggestions based on responses
- **Template Library**: Industry-specific interview templates
- **Analytics**: Session performance metrics and insights
- **Collaboration**: Multi-user interview sessions
- **Integration**: CRM and project management system connections

### Technical Improvements
- **Real-time Sync**: Cloud-based session persistence
- **Voice Integration**: Speech-to-text for hands-free operation
- **Mobile Support**: Responsive design for tablet/phone use
- **Offline Mode**: Local storage for connectivity issues

## Contributing

To contribute to the Stakeholder Interview Framework:

1. Follow the existing code structure and patterns
2. Add comprehensive TypeScript types
3. Include unit tests for new functionality
4. Update documentation for any changes
5. Ensure accessibility compliance

## License

This project is part of the larger stakeholder management system and follows the same licensing terms.






















