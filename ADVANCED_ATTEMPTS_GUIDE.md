# Advanced User Story Attempts Persistence System

## Overview
The Advanced Training section now includes comprehensive persistence using Supabase, storing detailed attempt data including form fields, validation rules, integrations, and AI feedback history.

## Database Schema

### Table: `advanced_user_story_attempts`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- scenario_id: TEXT (Advanced scenario identifier)
- step: INTEGER (Current step 1-8)
- user_story: TEXT (User's story)
- acceptance_criteria: JSONB (Array of ACs)
- feedback_history: JSONB (AI feedback per step)
- advanced_metadata: JSONB (Form fields, validation rules, integrations)
- completed: BOOLEAN (Whether all steps completed)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Advanced Metadata Structure

### Form Fields
```json
{
  "form_fields": [
    {
      "label": "Date of Birth",
      "type": "date",
      "required": true
    },
    {
      "label": "NHS Number", 
      "type": "numeric",
      "required": false
    }
  ]
}
```

### Validation Rules
```json
{
  "validation_rules": [
    "Date of Birth must be in the past",
    "NHS number must be exactly 10 digits"
  ]
}
```

### Integrations
```json
{
  "integrations": [
    {
      "target": "EMIS",
      "type": "HL7", 
      "description": "Send booking confirmation"
    }
  ]
}
```

## Features

### Auto-Save Functionality
- **Debounced Auto-Save**: Saves every 2 seconds after changes
- **Step Completion Save**: Saves immediately when completing steps
- **Feedback Preservation**: Stores AI validation results to avoid re-calling API
- **Metadata Tracking**: Captures form fields, validation rules, and integrations

### Resume Previous Progress
- **Automatic Loading**: Loads previous attempt when starting advanced scenario
- **Step Restoration**: Resumes from exact step where user left off
- **Feedback History**: Restores all previous AI feedback and validation results
- **Cross-Session Persistence**: Works across browser sessions and devices

### Data Stored Per Attempt
- **Scenario Context**: Which advanced scenario (IDs 26-35)
- **Current Progress**: Which step (1-8) user is on
- **User Story**: Complete story text
- **Acceptance Criteria**: All ACs written so far
- **AI Feedback**: Results from each step's validation
- **Advanced Metadata**: Form fields, validation rules, integrations
- **Completion Status**: Whether all 8 steps completed

## User Experience

### For New Advanced Users
1. Start advanced scenario (IDs 26-35)
2. Write user story and ACs with advanced coaching
3. Progress automatically saved every 2 seconds
4. AI feedback preserved to avoid re-processing
5. Can close browser and return later
6. Resume exactly where left off with all feedback intact

### For Returning Advanced Users
1. Open same advanced scenario
2. System loads previous attempt automatically
3. See "Loading previous progress..." indicator
4. Continue from last step with all data and feedback restored
5. No need to re-run AI validation on completed steps

### Visual Indicators
- **Green banner**: "Progress saved [time]" - confirms work is safe
- **Blue banner**: "Loading previous progress..." - when resuming
- **No indicators**: Working normally with auto-save in background

## Technical Implementation

### Hooks Created
- `useAdvancedAttempts.ts`: Save/update/load advanced attempts
- Full CRUD operations with error handling
- User-specific data isolation with Row Level Security

### Integration Points
- **AdvancedLayer.tsx**: Main integration with auto-save and resume
- **localStorage fallback**: Still works if Supabase unavailable
- **Error handling**: Graceful degradation if server down

### Advanced Features
- **Feedback History**: Stores AI results per step to avoid re-calling API
- **Metadata Preservation**: Captures scenario-specific form fields and rules
- **Step Tracking**: Precise tracking of coaching progress (1-8)
- **Completion Detection**: Automatically marks attempts as completed

## Example Data Flow

### Starting New Advanced Scenario
```javascript
// User starts "Flu Jab Booking" scenario
const attemptData = {
  scenarioId: "flu_jab_booking",
  step: 1,
  userStory: "As a patient, I want to book my flu jab online...",
  acceptanceCriteria: [],
  feedbackHistory: {},
  advancedMetadata: {
    form_fields: [
      { label: "NHS Number", type: "numeric", required: true },
      { label: "Preferred Date", type: "date", required: true }
    ],
    validation_rules: [
      "NHS Number must be 10 digits",
      "Preferred Date must not be in the past"
    ],
    integrations: [
      { target: "EMIS", type: "API", description: "Send booking info" }
    ]
  },
  completed: false
}
```

### Resuming Previous Attempt
```javascript
// System loads previous attempt
const savedAttempt = {
  id: "abc123",
  step: 4,
  user_story: "As a patient, I want to book my flu jab online...",
  acceptance_criteria: [
    "Patient should be able to choose a date from a calendar",
    "Patient should receive a confirmation email after booking"
  ],
  feedback_history: {
    "step_1": "✅ Excellent user story structure",
    "step_2": "⚠️ Outcome was vague", 
    "step_3": "✅ Good trigger identification"
  },
  advanced_metadata: { /* form fields, rules, integrations */ },
  completed: false
}
```

## Benefits

### For Advanced Learners
- **Never lose complex work**: Advanced scenarios take longer, persistence crucial
- **Resume sophisticated progress**: Pick up complex form field analysis
- **Preserve AI insights**: Don't lose valuable coaching feedback
- **Track mastery**: See completion of advanced scenarios over time

### For Instructors
- **Advanced analytics**: Track which advanced concepts are challenging
- **Form field mastery**: See how well users identify complex form requirements
- **Integration understanding**: Monitor grasp of system integrations
- **Progress patterns**: Identify where advanced learners get stuck

### For System
- **API efficiency**: Avoid re-calling AI for completed steps
- **Data richness**: Capture detailed metadata for advanced scenarios
- **Scalable storage**: PostgreSQL handles complex JSONB data efficiently
- **Security**: Row Level Security ensures data isolation

## Next Steps

### Potential Enhancements
1. **Advanced Dashboard**: View all advanced attempts with completion rates
2. **Form Field Analytics**: Track which field types are most challenging
3. **Integration Mastery**: Monitor understanding of system connections
4. **Advanced Certificates**: Badges for completing advanced scenarios
5. **Portfolio Export**: Download advanced work for professional portfolios

### Advanced Features
1. **Smart Recommendations**: Suggest advanced scenarios based on completion patterns
2. **Peer Comparison**: Anonymous comparison with other advanced learners
3. **Instructor Insights**: Dashboard for tracking advanced learner progress
4. **Advanced Challenges**: Multi-scenario advanced practice sessions

This persistence system ensures advanced learners can tackle complex scenarios without losing their sophisticated work, while providing rich data for continuous improvement of the advanced training experience.








