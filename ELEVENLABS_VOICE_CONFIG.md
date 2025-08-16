# ElevenLabs Voice Configuration Guide

## Current Voice Issue

**Problem**: When using multi-voice mode, the AI agents are not switching to gender-appropriate voices. Specifically, Aisha (female stakeholder) is using the same voice as male stakeholders instead of a configured female voice.

## Root Cause

ElevenLabs Conversational AI agents have their voices configured **at the agent level** in the ElevenLabs dashboard, not through API calls. The "multi-voice support" feature mentioned in ElevenLabs documentation refers to a single agent being able to switch between multiple pre-configured voices during a conversation.

## Solutions

### Option 1: Configure Multi-Voice in ElevenLabs Dashboard (Recommended)

1. **For each agent in your ElevenLabs dashboard:**
   - Go to the agent's Voice settings
   - Enable "Multi-voice support" 
   - Add appropriate female voices for Aisha's agent
   - Add appropriate male voices for James and David's agents

2. **Suggested Voice Assignments:**
   - **Jess Morgan (Female)**: Use voices like "Alexandra", "Jessica Anne Bogart", or "Hope" (from ElevenLabs voice library)
   - **James Walker (Male)**: Use voices like "Archer", "Stuart", or "Mark"
   - **David Thompson (Male)**: Use voices like "Finn", "Stuart", or a professional male voice

### Option 2: Create Separate Gender-Specific Agents

Instead of using multi-voice, create separate agents for each gender:

1. **Female Agent**: Configure with female voice for Aisha
2. **Male Agent 1**: Configure with professional male voice for James  
3. **Male Agent 2**: Configure with technical male voice for David

### Option 3: Voice Design (Custom Voices)

Use ElevenLabs Voice Design to create custom voices:

1. **For Jess (Female Customer Service Manager)**:
   ```
   Prompt: "A professional female customer service manager in her early 30s with a warm, empathetic voice. She speaks clearly and confidently, with a slight American accent. Perfect audio quality."
   ```

2. **For James (Male Customer Success Head)**:
   ```
   Prompt: "A collaborative male business leader in his 40s with a deep, warm voice. He speaks with authority but remains approachable, with a neutral American accent. Perfect audio quality."
   ```

3. **For David (Male IT Systems Lead)**:
   ```
   Prompt: "A technical male specialist in his 40s with a clear, analytical voice. He speaks methodically and precisely, with a professional American accent. Perfect audio quality."
   ```

## Implementation Steps

### Step 1: Update Agent Configuration in ElevenLabs Dashboard

1. Log into your ElevenLabs dashboard
2. Go to Conversational AI → Agents
3. For each agent (Jess, James, David):
   - Click on the agent
   - Go to Voice tab
   - Configure appropriate gender voice
   - If using multi-voice, add additional voice options

### Step 2: Test Voice Configuration

1. Use the "Test AI agent" button in ElevenLabs dashboard
2. Verify each agent uses the correct gender voice
3. For multi-voice agents, test voice switching functionality

### Step 3: Update Multi-Voice Simulation Prompt

If using single-agent multi-voice simulation, update the prompt to include voice switching instructions:

```typescript
const multiPersonalityPrompt = `You are facilitating a professional business meeting with these stakeholders:

${stakeholderDetails}

VOICE SWITCHING:
- When speaking as Jess Morgan, use your female voice setting
- When speaking as James Walker or David Thompson, use your male voice setting
- Switch voices to match the gender of the speaking stakeholder

CORE BEHAVIOR:
- You ONLY respond when the user asks a question or makes a comment
- Give focused, intelligent responses based on each stakeholder's expertise
- Switch your voice to match the speaking stakeholder's gender
- Each stakeholder should contribute 1-2 sentences maximum per response
- Only include stakeholders whose expertise is relevant to the question
- Don't make small talk or filler conversation

...rest of prompt
`;
```

## Current Status

✅ **Fixed**: Aisha's role updated to "Customer Service Manager" (was incorrectly "UX/UI Designer")
✅ **Fixed**: Role-based color coding now includes "Service" for proper blue theme
⚠️ **Pending**: Voice gender configuration needs to be done in ElevenLabs dashboard
⚠️ **Pending**: Test voice switching functionality

## Next Steps

1. Configure voices in ElevenLabs dashboard for each agent
2. Test gender-appropriate voice switching
3. Update multi-voice simulation if needed
4. Verify voice consistency across different meeting modes

## Notes

- ElevenLabs charges for voice generation, so test voice configurations carefully
- Multi-voice switching may have slight delays during transitions
- Consider voice consistency for brand/character recognition
- Female voices recommended: Alexandra, Jessica Anne Bogart, Hope, Angela
- Male voices recommended: Archer, Stuart, Mark, Finn