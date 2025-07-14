# Enhanced Stakeholder Meeting Setup Guide

## Overview

Your Business Analyst training app has been enhanced with intelligent stakeholder AI powered by OpenAI. The stakeholders now behave realistically, provide context-aware responses, introduce themselves appropriately, and support audio playback.

## Key Features Added

### 🤖 Intelligent Stakeholder AI
- **Context-Aware Responses**: Stakeholders respond based on project context, their role, and conversation history
- **Personality-Driven**: Each stakeholder maintains their unique personality and priorities
- **Multiple Stakeholder Support**: Different stakeholders can participate and respond based on question relevance

### 👥 Natural Meeting Flow
- **Smart Introductions**: Stakeholders introduce themselves on first meeting, skip introductions on subsequent meetings
- **Role-Based Responses**: Questions about specific departments/roles are answered by relevant stakeholders
- **Conversation Memory**: AI maintains context throughout the meeting

### 🔊 Audio Integration
- **Text-to-Speech**: Stakeholder responses can be played as audio
- **Voice Input**: Use speech recognition to ask questions (Chrome/Edge browsers)
- **Audio Controls**: Play, pause, and manage audio playback

### 📝 Enhanced Question Bank
- **Expanded Questions**: More BA-specific questions for current state and future state analysis
- **Smart Question Helper**: Organized questions to guide your interviews

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### 2. Required: OpenAI API Key

Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys):

```env
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Optional: Azure Text-to-Speech (for audio)

For voice functionality, set up Azure Cognitive Services:

```env
VITE_AZURE_TTS_ENDPOINT=https://your-region.tts.speech.microsoft.com/
VITE_AZURE_TTS_KEY=your-azure-key-here
```

### 4. Install and Run

```bash
npm install
npm run dev
```

## How to Use

### Starting a Meeting

1. **Select a Project**: Choose from predefined projects or create a custom one
2. **Choose Stakeholders**: Select one or more stakeholders for the meeting
3. **Navigate to Meeting**: Go to the Meeting view

### Meeting Features

#### Automatic Introductions
- Stakeholders automatically introduce themselves on first meeting
- Subsequent meetings skip introductions with friendly greetings

#### Intelligent Responses
- Ask questions naturally - stakeholders respond based on their expertise
- Questions about specific departments/roles are answered by relevant stakeholders
- Responses consider project context and conversation history

#### Question Helper
- Click "Question Helper" to access curated BA questions
- Toggle between "Current State" and "Future State" categories
- Click any question to use it directly

#### Audio Features
- **Enable/Disable Audio**: Click the volume icon to toggle text-to-speech
- **Voice Input**: Click the microphone icon to speak your questions (requires HTTPS)
- **Audio Controls**: Pause, resume, or manage playback

#### Voice Input Setup
Voice input requires HTTPS. For local development:
- Use `localhost` (works in Chrome/Edge)
- Or set up HTTPS for your local server

### Best Practices

#### Effective Questioning
- Start with open-ended questions about current processes
- Ask role-specific questions to get targeted responses
- Follow up on stakeholder responses for deeper insights

#### Managing Multiple Stakeholders
- Direct questions to specific roles/departments when needed
- Let the AI decide which stakeholder should respond
- Use the conversation flow to gather comprehensive requirements

#### Audio Management
- Enable audio for a more immersive experience
- Use pause/resume controls during note-taking
- Disable audio in quiet environments

## Fallback Behavior

### Without OpenAI API Key
- App uses intelligent fallback responses
- Still provides contextual interactions
- Includes introduction logic and personality

### Without Azure TTS
- Audio controls are hidden
- Text-based interaction only
- Full functionality otherwise maintained

## Troubleshooting

### Common Issues

**"Stakeholder is thinking..." appears indefinitely**
- Check your OpenAI API key in `.env.local`
- Verify API key has sufficient credits
- Check browser console for error messages

**Voice input not working**
- Ensure you're using Chrome or Edge browser
- Check microphone permissions
- Use HTTPS or localhost

**Audio not playing**
- Verify Azure TTS configuration
- Check browser audio permissions
- Try refreshing the page

**Stakeholders giving generic responses**
- Ensure OpenAI API key is correctly set
- Check that project and stakeholder data is loaded
- Verify network connectivity

### Browser Compatibility

**Recommended Browsers:**
- Chrome (best support for voice features)
- Edge (full voice support)
- Firefox (limited voice support)
- Safari (limited voice support)

## API Usage and Costs

### OpenAI Costs
- Uses GPT-3.5-turbo model (cost-effective)
- Typical conversation: $0.01-0.05 per meeting
- Includes conversation context for better responses

### Azure TTS Costs
- Pay-per-use speech synthesis
- Typical cost: $0.001-0.01 per stakeholder response
- Optional feature - can be disabled

## Support and Development

### File Structure
- `src/lib/stakeholderAI.ts` - Main AI logic
- `src/components/Views/MeetingView.tsx` - Meeting interface
- `src/lib/audioOrchestrator.ts` - Audio management
- `src/contexts/VoiceContext.tsx` - Voice configuration

### Customization
- Modify stakeholder personalities in mock data
- Adjust AI prompts in `stakeholderAI.ts`
- Customize question bank in `MeetingView.tsx`

### Contributing
- Test with different stakeholder combinations
- Report issues with specific browser/OS combinations
- Suggest improvements for more realistic interactions

## Next Steps

1. **Get OpenAI API Key**: Essential for intelligent responses
2. **Test with Different Projects**: Try various stakeholder combinations
3. **Practice BA Techniques**: Use the enhanced question bank
4. **Experiment with Audio**: Enable voice features for immersive experience
5. **Analyze Conversations**: Use the analysis view to review requirements gathered

Your Business Analyst training environment is now ready for realistic stakeholder interactions!