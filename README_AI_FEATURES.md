# AI-Powered Process Mapping Features

This document describes the new AI features added to the Process Mapper.

## 🚀 New Features

### 1. AI Coach
- **Purpose**: Provides real-time feedback on BPMN diagrams
- **Features**:
  - Local linting for immediate feedback
  - AI-powered analysis for comprehensive suggestions
  - Focus on elements and apply fixes
  - Grouped by severity (critical/warning/info)

### 2. Process Drafter
- **Purpose**: Convert text descriptions to BPMN diagrams
- **Features**:
  - Text-to-BPMN conversion
  - Step-by-step build guide
  - Industry-specific suggestions
  - As-is vs To-be process modes

## 🔧 Setup

### Environment Variables
Add the following to your `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### API Routes
The following API routes have been added:
- `/api/process-coach` - Analyzes BPMN XML and provides suggestions
- `/api/process-drafter` - Converts text descriptions to BPMN

## 🎯 Usage

### AI Coach
1. Toggle "AI Coach" ON in the toolbar
2. Click "Check My Map" to analyze your diagram
3. Review suggestions in the right sidebar
4. Click eye icon to focus on elements
5. Click edit icon to apply fixes

### Process Drafter
1. Click "Describe Process" in the toolbar
2. Enter your process description
3. Select process type (As-is/To-be)
4. Optionally specify industry
5. Click "Generate BPMN"
6. Follow the build guide in the left panel

## 📋 Local Linting Rules

The AI Coach includes local linting for:
- **Verb+Object Pattern**: Tasks must use clear action verbs
- **Vague Words**: Flags words like "check", "handle", "process"
- **Gerunds**: Warns against using "-ing" forms for actions
- **Missing Elements**: Checks for start/end events

## 🎨 UI Components

### New Components
- `AICoachSidebar.tsx` - Right sidebar for suggestions
- `ProcessDrafterModal.tsx` - Modal for text input
- `BuildGuidePanel.tsx` - Left panel for step-by-step guide

### Toolbar Buttons
- **AI Coach Toggle**: Enable/disable AI features
- **Check My Map**: Analyze current diagram
- **Describe Process**: Open text-to-BPMN modal

## 🔍 Technical Details

### Local Linting
- Uses regex-based XML parsing (server-side compatible)
- Checks for BPMN element patterns
- Validates naming conventions
- Provides instant feedback

### AI Integration
- Uses OpenAI GPT-4 for analysis
- Structured JSON responses
- Error handling and fallbacks
- Rate limiting considerations

### BPMN.js Integration
- Element focusing via canvas.scrollToElement
- Label updates via modeling.setLabel
- Selection management
- Event handling

## 🚨 Error Handling

- Graceful fallbacks when AI is unavailable
- Local linting continues to work
- User-friendly error messages
- Loading states for all operations

## 🔮 Future Enhancements

- Custom rule sets per organization
- Batch analysis for multiple diagrams
- Integration with process repositories
- Advanced fix suggestions
- Collaborative review features












