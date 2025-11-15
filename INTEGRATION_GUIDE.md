# Integration Guide: New Elicitation Engine

## Files Created

### Backend APIs
- `/api/stakeholder/respond.js` - Generates stakeholder responses (GPT-4o)
- `/api/stakeholder/evaluate.js` - Evaluates user questions (GPT-4o-mini)
- `/api/stakeholder/coaching.js` - Generates coaching feedback (GPT-4o)
- `/api/stakeholder/followups.js` - Generates follow-up suggestions (GPT-4o-mini)
- `/api/stakeholder/context.js` - Updates conversation context (GPT-4o-mini)

### Frontend Components
- `/src/components/StakeholderChat.tsx` - Main chat interface
- `/src/components/NewCoachingPanel.tsx` - Coaching feedback display
- `/src/components/FollowUpSuggestions.tsx` - Follow-up question suggestions
- `/src/components/StageProgress.tsx` - Stage progress indicator
- `/src/components/ContextTracker.tsx` - Context tracking display

### Core Engine
- `/src/lib/meeting/meetingContext.ts` - Context memory engine

### Prompts
- `/prompts/stakeholder-response-system.txt`
- `/prompts/question-evaluation-system.txt`
- `/prompts/coaching-system.txt`
- `/prompts/followup-system.txt`
- `/prompts/context-memory-system.txt`

### Schema
- `/schemas/stakeholder-meeting-response.json`

## Integration Steps

### Step 1: Update TrainingPracticeView.tsx

Replace the `renderLiveMeeting` function (lines 960-1124) with:

```typescript
const renderLiveMeeting = () => {
  const [coaching, setCoaching] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [context, setContext] = useState<any>(null);
  const [isInputLocked, setIsInputLocked] = useState(false);

  // Get project context from ELEVENLABS_PROJECTS
  const project = ELEVENLABS_PROJECTS.find(p => p.id === selectedProject?.id || p.name === selectedProject?.name);
  const projectContext = project ? {
    name: project.name,
    challenges: project.context.challenges,
    currentState: project.context.currentState,
    expectedOutcomes: project.context.expectedOutcomes,
    constraints: project.context.constraints
  } : null;

  // Get stakeholder profile
  const stakeholder = selectedStakeholders[0];
  const stakeholderProfile = stakeholder ? {
    id: stakeholder.id,
    name: stakeholder.name,
    role: stakeholder.role,
    department: stakeholder.department,
    personality: stakeholder.personality || 'professional',
    priorities: stakeholder.priorities || []
  } : null;

  // Map session stage to MeetingStage
  const currentStage = (session?.stage || 'problem_exploration') as MeetingStage;

  return (
    <div className="content-root h-full flex flex-col">
      {/* Header - KEEP EXACTLY AS IS */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Practice Meeting</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {session?.stage.replace('_', ' ')} • {formatTime(meetingTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(meetingTime)}</span>
            </div>
            <button
              onClick={handleEndMeeting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area - REPLACED WITH NEW COMPONENT */}
        <div className="flex-1 flex flex-col">
          {projectContext && stakeholderProfile ? (
            <StakeholderChat
              currentStage={currentStage}
              stakeholderProfile={stakeholderProfile}
              projectContext={projectContext}
              onCoachingUpdate={setCoaching}
              onContextUpdate={setContext}
              onFollowUpsUpdate={setFollowUps}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading...</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - NEW COMPONENTS */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 space-y-4">
          {/* Stage Progress */}
          <StageProgress
            currentStage={currentStage}
            progress={context?.stage_progress?.[currentStage]?.percent_complete || 0}
            milestone={context?.next_milestone || 'Continue gathering information'}
          />

          {/* Coaching Panel */}
          {coaching && (
            <NewCoachingPanel
              coaching={coaching}
              onAcknowledge={() => {
                setIsInputLocked(false);
                setCoaching(null);
              }}
              onUseRewrite={(rewrite) => {
                // This will be handled by StakeholderChat
                setCoaching(null);
              }}
            />
          )}

          {/* Context Tracker */}
          {context && (
            <ContextTracker
              topicsCovered={context.topics_covered || []}
              painPoints={context.pain_points_identified || []}
              informationLayer={context.information_layers_unlocked || 1}
            />
          )}

          {/* Follow-up Suggestions */}
          {followUps.length > 0 && (
            <FollowUpSuggestions
              followUps={followUps}
              onSelect={(question) => {
                // This will be handled by StakeholderChat
                console.log('Selected follow-up:', question);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

### Step 2: Update Imports

Add to the imports at the top of TrainingPracticeView.tsx:

```typescript
import StakeholderChat from '../StakeholderChat';
import NewCoachingPanel from '../NewCoachingPanel';
import FollowUpSuggestions from '../FollowUpSuggestions';
import StageProgress from '../StageProgress';
import ContextTracker from '../ContextTracker';
import { MeetingStage } from '../../lib/meeting/meetingContext';
import { ELEVENLABS_PROJECTS } from '../../data/elevenLabsProjects';
```

### Step 3: Remove Old Code

Delete or comment out:
- `handleSendMessage` function (lines 342-500) - replaced by StakeholderChat
- `CoachingPanelWrapper` component (lines 1255-1297) - replaced by NewCoachingPanel
- `QuestionHelperBot` usage - replaced by FollowUpSuggestions
- `DynamicCoachingPanel` and `CompleteCoachingPanel` imports - no longer needed

### Step 4: Update State Management

Remove these state variables (no longer needed):
- `inputMessage` - handled by StakeholderChat
- `isTyping` - handled by StakeholderChat
- `awaitingAcknowledgement` - handled by StakeholderChat
- `dynamicPanelRef` - no longer needed

Add these new state variables:
```typescript
const [coaching, setCoaching] = useState<any>(null);
const [followUps, setFollowUps] = useState<any[]>([]);
const [context, setContext] = useState<any>(null);
```

## Testing Checklist

- [ ] User can send questions
- [ ] Questions are evaluated (GREEN/AMBER/RED)
- [ ] Coaching panel appears for AMBER/RED
- [ ] Stakeholder responds appropriately
- [ ] Follow-up suggestions appear
- [ ] Context tracker updates
- [ ] Stage progress updates
- [ ] Multi-stakeholder routing works
- [ ] Stage transitions work
- [ ] Project context is used correctly

## Notes

- All existing flows (project selection, stakeholder selection, meeting setup) remain UNCHANGED
- Only the chat/elicitation engine is replaced
- The new system uses the Customer Onboarding Optimization project from ELEVENLABS_PROJECTS
- All API endpoints are in `/api/stakeholder/`
- All prompts are in `/prompts/`

