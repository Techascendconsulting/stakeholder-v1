# Practice User Stories Persistence System

## Overview
The Practice + Coaching Layer now includes full persistence using Supabase, allowing learners to save their progress and resume where they left off across sessions.

## Features

### ✅ **Auto-Save Functionality**
- **Debounced Auto-Save**: Automatically saves progress 2 seconds after any changes
- **Step Completion Save**: Saves immediately when completing a step
- **Visual Feedback**: Shows save status with timestamp

### ✅ **Resume Previous Progress**
- **Automatic Loading**: Loads previous progress when starting a scenario
- **Cross-Session Persistence**: Works across browser sessions and device changes
- **User-Specific**: Tied to user account (if logged in) or browser (anonymous)

### ✅ **Data Stored**
- **Scenario ID**: Which scenario they were working on
- **User Story**: The complete user story text
- **Acceptance Criteria**: All 8 ACs written so far
- **Current Step**: Which step they're currently on (0-7)
- **Feedback Results**: AI validation results and coaching feedback
- **Status**: `in_progress`, `completed`, or `abandoned`
- **Timestamps**: Created and last updated times

## Database Schema

### Table: `practice_user_stories`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- scenario_id: TEXT (Scenario identifier)
- user_story: TEXT (User's story)
- acceptance_criteria: JSONB (Array of ACs)
- feedback_result: JSONB (Validation results)
- current_step: INTEGER (0-7)
- status: TEXT (in_progress/completed/abandoned)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## User Experience

### **For New Users**
1. Start writing user story and ACs
2. Progress is automatically saved every 2 seconds
3. Can close browser and return later
4. Will resume exactly where they left off

### **For Returning Users**
1. Open the same scenario
2. System automatically loads previous progress
3. See "Loading previous progress..." indicator
4. Continue from last step with all data intact

### **Visual Indicators**
- 💾 **Green banner**: "Progress saved [time]" - shows when last saved
- 🔄 **Blue banner**: "Loading previous progress..." - shows when loading
- **No indicators**: Working normally with auto-save in background

## Technical Implementation

### **Hooks Created**
- `useSavePracticeStory.ts`: Save/update practice stories
- `useLoadPracticeStory.ts`: Load previous attempts

### **Integration Points**
- **PracticeAndCoachingLayer.tsx**: Main integration with auto-save and resume
- **localStorage fallback**: Still works if Supabase is unavailable
- **Error handling**: Graceful degradation if server is down

### **Security**
- **Row Level Security**: Users can only access their own data
- **Anonymous support**: Works without login (tied to browser)
- **Data validation**: All inputs validated before saving

## Benefits

### **For Learners**
- ✅ Never lose progress
- ✅ Work across multiple devices
- ✅ Resume after breaks
- ✅ Track improvement over time

### **For Instructors**
- ✅ See completion rates
- ✅ Identify struggling areas
- ✅ Track engagement patterns
- ✅ Provide targeted help

## Next Steps

### **Potential Enhancements**
1. **"My Past Attempts" Dashboard**: View all previous practice sessions
2. **Progress Analytics**: Charts showing improvement over time
3. **Scenario Recommendations**: Suggest scenarios based on past performance
4. **Export Functionality**: Download practice history as PDF
5. **Collaborative Features**: Share practice sessions with instructors

### **Advanced Features**
1. **Smart Resume**: Detect if user wants to continue or start fresh
2. **Progress Notifications**: Email reminders for incomplete sessions
3. **Achievement System**: Badges for completing scenarios
4. **Peer Comparison**: Anonymous comparison with other learners

## Usage Examples

### **Scenario: User starts practice, gets interrupted**
1. User writes user story and 3 ACs
2. Auto-save triggers every 2 seconds
3. User closes browser
4. **Next day**: User opens same scenario
5. System loads: "Loading previous progress..."
6. User sees their story and 3 ACs exactly as they left them
7. Continues from step 4

### **Scenario: User completes a scenario**
1. User finishes all 8 steps
2. Status automatically changes to "completed"
3. All progress saved with completion timestamp
4. User can start new scenario or review completed work

This persistence system ensures learners never lose their work and can focus on learning rather than worrying about losing progress!











