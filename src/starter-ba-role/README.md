# Start Your BA Role - Cinematic Journey Experience

## Overview

A full-screen, cinematic learning journey that simulates the first weeks of a Business Analyst role. No sidebar navigation - just clean, focused, progression through phases and steps.

## Architecture

### 3-Layer Navigation Structure

1. **Journey Map** - Full-screen overview showing horizontal phase progression
2. **Phase Hero** - Introduction screen for each phase with description and progress
3. **Step Layout** - Single-step viewing with centered card and navigation controls
4. **Phase Complete** - Celebration screen after completing all steps in a phase

### Technology Stack

- React + TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- In-memory state management (designed to be swappable with Supabase later)

## File Structure

```
src/starter-ba-role/
├── index.tsx                         # Main entry point with view routing
├── components/
│   ├── JourneyMap.tsx                # Main entry view with phase path
│   ├── PhaseHero.tsx                 # Phase introduction screen
│   ├── StepLayout.tsx                # Single-step viewing layout
│   ├── StepRenderer.tsx              # Content rendering for different step types
│   └── PhaseCompleteOverlay.tsx      # Celebration screen
├── services/
│   ├── mockData.ts                   # Phase, section, and step data
│   └── journeyService.ts             # Data access abstraction layer
├── types/
│   └── models.ts                     # TypeScript interfaces
└── phases/
    ├── phase0/ ... phase8/           # Phase-specific content (stubs)
```

## Key Features

### Journey Map
- Horizontal phase progression with dots
- Visual status indicators (completed, current, locked)
- Direct navigation to unlocked phases
- Large CTA button to "Start/Continue your journey"
- Mobile-friendly phase cards

### Phase Hero
- Full-screen introduction for each phase
- Phase-specific color schemes
- Progress tracking (X of Y steps completed)
- Clear CTA to begin/continue/review phase
- Section outline showing what learner will do

### Step Layout
- Clean, centered card design (max-width: 900px)
- Top bar with back navigation and progress
- Bottom navigation with Previous/Continue buttons
- Progress dots showing position in section
- Smooth transitions between steps

### Step Types Supported

1. **Text** - Reading content with "I've read this" checkbox
2. **Video** - Video player placeholder with context hints
3. **Checklist** - Interactive checklist items with "complete all first" logic
4. **Task** - Text input area with save functionality
5. **Reflection** - Larger text area for reflective writing
6. **Placeholder** - Generic fallback for other types

### Progress & Locking System

- **Sequential unlocking**: Steps unlock one at a time
- **Section gating**: Must complete all steps in a section before next section unlocks
- **Phase gating**: Must complete all sections in a phase before next phase unlocks
- **Automatic progression**: Completing a step auto-unlocks the next one
- **Read-only access**: Can review completed phases/steps

## Data Flow

### State Management

```typescript
interface FeatureState {
  phases: Phase[];
  sections: Section[];
  steps: Step[];
  progress: Record<string, ProgressStatus>; // stepId -> status
}

type ProgressStatus = 'locked' | 'unlocked' | 'completed';
```

### Service Layer (journeyService.ts)

Provides abstraction for all data access:
- `getPhases()` - Get all phases
- `getSectionsForPhase()` - Get sections in a phase
- `getStepsForSection()` - Get steps in a section
- `getNextUnlockedStep()` - Find next step to show learner
- `getPhaseProgress()` - Calculate completion percentage
- `getPhaseStatus()` - Determine phase status (locked/unlocked/current/completed)

**Design decision**: All methods take `state` as parameter, making it easy to swap in-memory state with Supabase queries later.

## Usage

### Feature Flag

The feature is controlled by environment variable:

```bash
VITE_FEATURE_STARTER_BA_ROLE=true
```

### Integration

The feature is registered in the main layout sidebar. When clicked, it opens the full-screen journey experience.

### Navigation Flow

```
Journey Map
  ↓ Click "Start/Continue journey"
  ↓
Step Layout (first unlocked step)
  ↓ Complete steps sequentially
  ↓
Phase Complete Overlay
  ↓ Click "Continue to next phase"
  ↓
Phase Hero (next phase)
  ↓ Click "Begin this phase"
  ↓
Step Layout (continues...)
```

### Completing Steps

When a step is marked complete:
1. Step status changes to 'completed'
2. Next step in section unlocks automatically
3. If section complete, first step of next section unlocks
4. If phase complete, first step of next phase unlocks
5. Phase Complete screen shown after last step

## Design Principles

### No Sidebar
- Full-screen, immersive experience
- Navigation through clear CTAs and back buttons
- Progress shown inline, not in persistent nav

### Generous Spacing
- 900px max-width for content cards
- Large padding (48px on cards)
- Breathing room between elements (24px spacing)

### Clear Visual Hierarchy
- Large headings (text-4xl/5xl)
- Readable body text (text-lg, 1.7 line-height)
- Color-coded phase themes

### Beginner-Friendly
- Simple, human language (no jargon)
- No emojis in UI text
- Clear instructions at every step
- Low-stakes interactions (can go back)

### Premium Feel
- Smooth animations and transitions
- Shadow depth and elevation
- Gradient buttons and phase indicators
- Polished micro-interactions

## Content Management

### Current Content

- **Phase 0**: Orientation & HR Onboarding (6 steps across 2 sections)
- **Phase 1**: Your First 24 Hours (7 steps across 3 sections)
- **Phases 2-8**: Placeholder titles ("Coming soon")

### Adding Content

1. **Add steps** in `services/mockData.ts`:
   ```typescript
   steps.push({
     id: 'p2-s1-st1',
     sectionId: 'p2-s1',
     title: 'Step title',
     order: 0,
     stepType: 'text',
     payload: { /* content data */ }
   });
   ```

2. **Add sections** if needed:
   ```typescript
   sections.push({
     id: 'p2-s1',
     phaseId: 'phase-2',
     slug: 'section-slug',
     title: 'Section 2.1 — Title',
     order: 0
   });
   ```

3. **Update phase descriptions** in `PhaseHero.tsx`:
   ```typescript
   const PHASE_DESCRIPTIONS: Record<string, string> = {
     'phase-2': 'Your description here'
   };
   ```

### Content in Step Payloads

Currently steps use placeholder content. To add real content:

```typescript
{
  id: 'step-id',
  title: 'Welcome Email',
  stepType: 'text',
  payload: {
    content: 'Rich text content here...',
    hints: ['Hint 1', 'Hint 2'],
    checkboxLabel: 'I've read the email'
  }
}
```

Then update `StepRenderer.tsx` to read from `step.payload`.

## Future Enhancements

### Planned

1. **Supabase Integration**
   - Replace in-memory state with database tables
   - Persist progress across sessions
   - Multi-device sync

2. **Rich Content**
   - Embed actual videos (HeyGen)
   - Real email artifacts
   - Interactive documents

3. **Analytics**
   - Track time spent per step
   - Identify drop-off points
   - A/B test variations

4. **Animations**
   - Confetti on phase completion
   - Path drawing animation
   - Smooth page transitions

### Not Planned (By Design)

- ❌ Sidebar navigation (defeats immersive experience)
- ❌ Skip ahead (defeats sequential learning)
- ❌ Multiple paths (linear progression is intentional)
- ❌ Gamification badges (keep it professional)

## Testing

### Manual Test Flow

1. Enable feature flag: `VITE_FEATURE_STARTER_BA_ROLE=true`
2. Click "Start Your BA Role" in sidebar
3. Verify Journey Map appears with phase dots
4. Click "Start your journey"
5. Verify first step appears in Step Layout
6. Complete step (checkbox/button)
7. Verify next step unlocks and navigation works
8. Complete all steps in Phase 0
9. Verify Phase Complete screen appears
10. Verify Phase 1 unlocks on Journey Map
11. Test "Back" navigation at each level
12. Verify locked phases can't be accessed

### Edge Cases

- First load (no progress): Should show Phase 0, Step 1 unlocked
- Completing last step: Should show Phase Complete
- Completing last step of last phase: Should show completion (no "next phase" button)
- Back navigation: Should always work, even from first step
- Clicking locked phase: Should do nothing

## Maintenance

### Updating Styles

All styles use Tailwind classes. Key color schemes:
- Phase 0: Purple/Indigo
- Phase 1: Blue/Cyan
- Phase 2-3: Teal/Green
- Completed: Green
- Locked: Gray

### Updating Locking Logic

All locking logic is in `index.tsx` `handleCompleteStep()` function. It:
1. Marks current step complete
2. Finds next step/section/phase
3. Unlocks next item
4. Updates state

### Debugging

Add console logs in `journeyService.ts` methods to trace:
- Which steps are unlocked
- Progress calculations
- Phase status determinations

## Known Limitations

1. **No persistence**: Progress lost on page refresh (by design for MVP)
2. **Placeholder content**: Steps show generic content
3. **No video playback**: Video steps show placeholder
4. **No task integration**: Task steps don't connect to existing Tasks engine
5. **Phases 2-8 empty**: Only Phase 0-1 have content

## Success Criteria

✅ No sidebar visible in this feature  
✅ Journey Map shows horizontal phase progression  
✅ Clicking "Continue" goes to correct step  
✅ Steps unlock sequentially  
✅ Phase Complete screen appears after last step  
✅ Can navigate back to Journey Map from any view  
✅ Responsive on desktop and tablet  
✅ Clean, modern UI matches design vision  
✅ Other features (Learning, Practice, BA In Action) unaffected  

## Questions?

Contact the development team or refer to the main project documentation.

