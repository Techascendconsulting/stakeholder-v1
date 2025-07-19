# Dynamic Phase-Aware Stakeholder System

## Overview
Implemented a sophisticated AI-driven system that dynamically aligns stakeholder responses with the current meeting phase through intelligent prompt conditioning, not hardcoded keyword filters.

## Business Analysis Phases

### 1. **Opening Phase**
- **Purpose**: Meeting initialization and introductions
- **Duration**: First 3 messages
- **Stakeholder Behavior**: Professional, warm, establishing meeting tone

### 2. **As-Is Phase** 
- **Purpose**: Understanding current state and existing processes
- **Detection**: AI analyzes conversation for current state questions
- **Key Indicators**: 
  - "how do you currently..."
  - "what's the current state"
  - "walk me through the process"
  - "how does this work now"

**Stakeholder Conditioning**:
```
- Focus ONLY on describing current state, existing processes, and how things work now
- Share your knowledge of current systems, workflows, and procedures
- Avoid proposing solutions, improvements, or changes
- Don't discuss what "should be" or "could be" - only what "is"
- Provide factual information about current operations
- If asked about solutions, redirect to understanding current state first
```

### 3. **Pain Points Phase**
- **Purpose**: Identifying problems and challenges with current state
- **Detection**: AI analyzes conversation for problem identification
- **Key Indicators**:
  - "what are the issues"
  - "what doesn't work"
  - "what are the challenges"
  - "what problems do you see"

**Stakeholder Conditioning**:
```
- Focus ONLY on identifying problems, challenges, and frustrations with current processes
- Share specific issues you've observed or experienced
- Discuss what doesn't work well in current systems
- Avoid proposing solutions or fixes - only identify problems
- Help surface inefficiencies, bottlenecks, and pain points
- If asked about solutions, acknowledge the problem but stay focused on problem identification
```

### 4. **Solutioning Phase**
- **Purpose**: Discussing potential solutions and implementation approaches
- **Detection**: AI analyzes conversation for solution-oriented discussion
- **Key Indicators**:
  - "what if we..."
  - "how about..."
  - "we could implement"
  - "what would you recommend"

**Stakeholder Conditioning**:
```
- Now you CAN discuss solutions, improvements, and implementation approaches
- Propose specific solutions based on your expertise
- Discuss implementation considerations and approaches
- Share recommendations for improvements
- Consider feasibility and implementation challenges
- Build on the current state and pain points already identified
```

### 5. **Deep Dive Phase**
- **Purpose**: Detailed analysis of any topic
- **Detection**: Extended conversation on specific topics
- **Stakeholder Behavior**: Comprehensive analysis while maintaining phase alignment

### 6. **Closing Phase**
- **Purpose**: Meeting wrap-up and next steps
- **Detection**: Message count > 25
- **Stakeholder Behavior**: Summary, key takeaways, next steps

## Dynamic Phase Detection System

### AI-Powered Analysis
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `You are analyzing a business stakeholder meeting to determine the current meeting phase.

PHASES:
- "as_is": Understanding current state, processes, how things work now
- "pain_points": Identifying problems, challenges, issues with current state
- "solutioning": Discussing solutions, proposals, implementation plans
- "deep_dive": Detailed analysis of any of the above phases

ANALYSIS CRITERIA:
- as_is: Questions about current processes, "how do you currently...", "what's the current state"
- pain_points: Discussing problems, challenges, frustrations, "what doesn't work"
- solutioning: Proposing solutions, "what if we...", "how about...", discussing implementation

Return ONLY the phase name.`
    }
  ],
  temperature: 0.1,
  max_tokens: 20
});
```

### Intelligent Context Analysis
- Analyzes last 10 messages for phase indicators
- Uses low temperature (0.1) for consistent detection
- Fallback to 'as_is' if detection fails
- Real-time phase transitions based on conversation flow

## Implementation Architecture

### 1. **Phase Detection Integration**
```typescript
// Called after each stakeholder response
await this.updateConversationPhase(context);

// Dynamic phase detection based on conversation content
private async updateConversationPhase(context: ConversationContext)
```

### 2. **System Prompt Conditioning**
```typescript
// Phase-specific behavioral guidelines
switch (conversationPhase) {
  case 'as_is':
    phaseGuidelines = `CRITICAL PHASE ALIGNMENT - AS-IS DISCOVERY:
    - Focus ONLY on describing current state, existing processes...`
    break;
  // ... other phases
}
```

### 3. **Contextual Response Guidance**
```typescript
// Added to buildContextualPrompt function
switch (currentPhase) {
  case 'as_is':
    prompt += `\nPHASE-SPECIFIC RESPONSE GUIDANCE:
    - Focus your response on CURRENT STATE and EXISTING PROCESSES only
    - Describe how things work now, not how they should work...`
    break;
  // ... other phases
}
```

## Key Features

### ✅ **No Hardcoded Keywords**
- No fragile phrase matching or static filters
- Dynamic AI-powered phase detection
- Contextual understanding of conversation flow

### ✅ **Intelligent Prompt Conditioning**
- Phase-aware system prompts
- Dynamic behavioral guidelines
- Context-sensitive response guidance

### ✅ **Natural Phase Transitions**
- Automatic phase detection based on conversation content
- Smooth transitions between phases
- Maintains conversational flow

### ✅ **Consistent Across All Personas**
- Same phase conditioning applied to all stakeholders
- Consistent behavioral alignment
- Maintains individual personality while respecting phases

### ✅ **Robust and Adaptive**
- Fallback mechanisms for failed detection
- Temperature-controlled for consistency
- Continuous real-time analysis

## Example Behavior Changes

### **As-Is Phase**
```
User: "How does our current expense process work?"
Stakeholder: "Well, right now employees fill out paper forms and submit them to their managers. The approval happens through email back-and-forth, and then finance manually enters the data into our system. It's pretty manual at each step."
```

### **Pain Points Phase**
```
User: "What are the main issues with this process?"
Stakeholder: "The biggest pain point is the back-and-forth during approval - managers often ask for receipts or clarifications, which creates delays. And honestly, the manual data entry leads to errors pretty frequently."
```

### **Solutioning Phase**
```
User: "What would you recommend to improve this?"
Stakeholder: "I think we could implement a digital workflow system that captures everything upfront and routes approvals automatically. That would eliminate the email back-and-forth and reduce manual data entry errors."
```

## Benefits

### 🎯 **Phase-Appropriate Responses**
- Stakeholders naturally restrict content to current phase
- No premature solution discussions in as-is/pain_points phases
- Proper progression through analysis phases

### 📊 **Dynamic Intelligence**
- Real-time phase detection based on conversation content
- Adaptive behavioral conditioning
- Context-aware response generation

### 🔄 **Natural Flow**
- Smooth phase transitions
- Maintains conversational authenticity
- Preserves stakeholder personalities

### 🛡️ **Robust System**
- No fragile keyword dependencies
- Intelligent fallback mechanisms
- Consistent across all stakeholder types

## Result

The system now provides dynamic, phase-aware stakeholder responses that naturally align with the meeting's current focus through intelligent prompt conditioning rather than rigid keyword filtering. Stakeholders automatically restrict their responses to phase-appropriate content while maintaining natural conversation flow and individual personalities.