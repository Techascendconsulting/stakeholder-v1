# ElevenLabs Multi-Agent Meeting Setup

This guide will help you set up the ElevenLabs Conversational AI agents for the dynamic stakeholder meeting feature.

## Prerequisites

1. **ElevenLabs Account**: Sign up at [ElevenLabs](https://elevenlabs.io)
2. **ElevenLabs API Key**: Get your API key from your ElevenLabs account
3. **Conversational AI Agents**: Create 3 agents for the stakeholders

## Step 1: Environment Variables

Add your ElevenLabs API key to your environment file:

```bash
# .env.local
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Step 2: Create ElevenLabs Conversational AI Agents

Go to [ElevenLabs Conversational AI Agents](https://elevenlabs.io/app/conversational-ai/agents) and create 3 agents:

### Agent 1: James Walker (Head of Customer Success)
- **Name**: James Walker
- **Role**: Head of Customer Success  
- **Personality**: Collaborative, data-driven, customer-focused, solution-oriented
- **Knowledge Base**: Customer onboarding, retention strategies, success metrics
- **Voice**: Choose a professional male voice

### Agent 2: Aisha Ahmed (UX/UI Designer)
- **Name**: Aisha Ahmed
- **Role**: UX/UI Designer
- **Personality**: Creative, user-empathetic, detail-oriented, innovative  
- **Knowledge Base**: User experience design, onboarding flows, design systems
- **Voice**: Choose a friendly female voice

### Agent 3: David Thompson (IT Systems Lead)
- **Name**: David Thompson
- **Role**: IT Systems Lead
- **Personality**: Technical, analytical, security-conscious, systematic
- **Knowledge Base**: System integration, technical architecture, security
- **Voice**: Choose a professional technical male voice

## Step 3: Configure Agent IDs

After creating your agents, copy their Agent IDs and update the configuration:

1. Open `src/data/elevenLabsProjects.ts`
2. Replace the placeholder agent IDs:
   - `REPLACE_WITH_JAMES_WALKER_AGENT_ID` → Your James Walker agent ID
   - `REPLACE_WITH_AISHA_AHMED_AGENT_ID` → Your Aisha Ahmed agent ID  
   - `REPLACE_WITH_DAVID_THOMPSON_AGENT_ID` → Your David Thompson agent ID

Example:
```typescript
agentId: 'agent_1234567890abcdef', // Your actual agent ID from ElevenLabs
```

## Step 4: Test the Feature

1. Navigate to "ElevenLabs Multi-Agent" in the sidebar
2. Select "Customer Onboarding Optimization" project
3. Choose one or more stakeholders
4. Start the meeting and begin speaking!

## Features

- **Real-time voice conversations** with AI stakeholders
- **Multi-agent support** - speak with multiple stakeholders simultaneously  
- **Interruption capability** - agents can be interrupted naturally
- **Free-flow conversation** - no scripted responses, fully dynamic
- **Project-based context** - agents understand the specific project context

## Troubleshooting

### Agent not responding
- Check your ElevenLabs API key is correct
- Verify the agent IDs are properly configured
- Ensure your agents are published and active

### Audio issues  
- Check microphone permissions in your browser
- Ensure you're using a supported browser (Chrome, Firefox, Safari)
- Try refreshing the page if audio connections fail

### Connection issues
- Check your internet connection
- Verify ElevenLabs service status
- Try ending and restarting the meeting

## Customization

You can easily add more projects and stakeholders by:

1. Adding new projects to `ELEVENLABS_PROJECTS` array
2. Creating corresponding ElevenLabs agents
3. Configuring their personalities and knowledge bases

The system is fully dynamic and supports any number of projects and stakeholders!