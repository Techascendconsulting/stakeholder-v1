# OpenAI API Migration Guide

## Overview
This guide explains how to migrate from direct OpenAI calls in the frontend to secure backend serverless functions.

**Security Issue Fixed:** The OpenAI API key is NO LONGER exposed in the browser. All AI features now go through secure backend endpoints.

---

## Architecture

### Before (INSECURE)
```
Browser → OpenAI API (with exposed API key)
```

### After (SECURE)
```
Browser → Vercel Serverless Function → OpenAI API
```

---

## Available API Endpoints

All endpoints are located in `/api/` and handle POST requests:

### 1. `/api/chat.js` - General Chat Completion
```typescript
// Request
{
  messages: [{ role: 'user', content: 'Hello' }],
  model?: 'gpt-3.5-turbo',
  temperature?: 0.7,
  max_tokens?: 150
}

// Response
{
  success: true,
  message: "AI response here",
  usage: { ... }
}
```

### 2. `/api/assignments/review.js` - Assignment Grading
```typescript
// Request
{
  moduleTitle: "Module 1",
  assignmentDescription: "...",
  submission: "Student answer..."
}

// Response
{
  success: true,
  score: 85,
  feedback: "...",
  strengths: "...",
  improvements: "..."
}
```

### 3. `/api/transcribe.js` - Audio Transcription
```typescript
// Request
{
  audioData: "base64_encoded_audio",
  language?: "en"
}

// Response
{
  success: true,
  text: "Transcribed text..."
}
```

### 4. `/api/coaching/analyze.js` - Coaching Feedback
```typescript
// Request
{
  userMessage: "User's response...",
  context?: "Stakeholder meeting...",
  coachingType?: 'greeting' | 'questioning' | 'problem-exploration' | 'general'
}

// Response
{
  success: true,
  feedback: "Coaching feedback..."
}
```

### 5. `/api/validation/user-story.js` - User Story Validation
```typescript
// Request
{
  userStory: "As a user, I want..."
}

// Response
{
  success: true,
  isValid: true,
  score: 85,
  strengths: ["..."],
  improvements: ["..."],
  feedback: "..."
}
```

### 6. `/api/stakeholder/generate-response.js` - AI Stakeholder Responses
```typescript
// Request
{
  stakeholderProfile: {
    name: "Sarah Chen",
    role: "Product Manager",
    personality: "...",
    ...
  },
  conversationHistory?: [...],
  userQuestion: "What are your main concerns?",
  context?: "Initial discovery meeting"
}

// Response
{
  success: true,
  response: "Stakeholder's response..."
}
```

---

## Frontend API Client

Use the centralized API client instead of OpenAI:

```typescript
import { 
  chatCompletion,
  reviewAssignment,
  transcribeAudio,
  getCoachingFeedback,
  validateUserStory,
  generateStakeholderResponse
} from '../lib/apiClient';

// Example: Chat completion
const result = await chatCompletion({
  messages: [{ role: 'user', content: 'Hello' }],
  temperature: 0.7
});

// Example: Assignment review
const feedback = await reviewAssignment({
  moduleTitle: 'Module 1',
  assignmentDescription: 'Describe...',
  submission: 'My answer is...'
});
```

---

## Migration Pattern

### Step 1: Find OpenAI Usage
Files using OpenAI directly:
```bash
grep -r "import.*OpenAI\|VITE_OPENAI_API_KEY" src/
```

### Step 2: Replace Imports

**BEFORE:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
```

**AFTER:**
```typescript
import { chatCompletion } from '../lib/apiClient';
```

### Step 3: Replace API Calls

**BEFORE:**
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello' }],
  temperature: 0.7
});

const response = completion.choices[0].message.content;
```

**AFTER:**
```typescript
const result = await chatCompletion({
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'gpt-3.5-turbo',
  temperature: 0.7
});

const response = result.message;
```

---

## Files Already Migrated

✅ `/src/utils/assignments.ts` - Uses `/api/assignments/review`
✅ `/src/utils/validateUserStory.ts` - Uses `/api/validation/user-story`
✅ `/src/lib/apiClient.ts` - Frontend API client created

---

## Files Still Needing Migration (33 remaining)

These files still use direct OpenAI calls and need to be updated:

1. `src/services/singleAgentSystem.ts`
2. `src/components/Views/VoiceMeetingV2.tsx`
3. `src/lib/scoring.ts`
4. `src/components/Verity/useVerity.ts`
5. `src/lib/whisper.ts`
6. `src/components/Views/VoiceOnlyMeetingView.tsx`
7. `src/services/verityService.ts`
8. `src/lib/kb.ts`
9. `src/services/agileRefinementService.ts`
10. `src/services/stakeholderResponseAnalysisService.ts`
11. `src/services/stakeholderResponseAnalyzer.ts`
12. `src/services/greetingCoachingService.ts`
13. `src/services/problemExplorationService.ts`
14. `src/services/coachingEvaluatorService.ts`
15. `src/services/dynamicQuestionGenerator.ts`
16. `src/services/lectureService.ts`
17. `src/services/coachingAnalysisService.ts`
18. `src/utils/validateAcceptanceCriteria.ts`
19. `src/services/aiFeedbackService.ts`
20. `src/components/Views/RefinementMeetingView.tsx`
21. `src/components/training/PracticeAndCoachingLayer.tsx`
22. `src/services/trainingService.ts`
23. `src/components/Views/VoiceMeetingV2Rebuilt.tsx`
24. `src/services/stakeholderKnowledgeBase.ts`
25. `src/components/Views/SprintPlanningMeetingView.tsx.backup`
26. `src/components/Views/MeetingDetailsView.tsx`
27. ... (and more)

**Migration Priority:**
- HIGH: Voice/audio services (transcription)
- HIGH: Coaching services
- HIGH: Stakeholder response services
- MEDIUM: Validation services
- LOW: Backup/test files

---

## Environment Variables

### Development (.env)
```bash
# Backend API key (server-side only, NOT in browser)
OPENAI_API_KEY=sk-...

# Remove VITE_OPENAI_API_KEY (no longer needed)
# VITE_OPENAI_API_KEY=sk-... ❌ DELETE THIS
```

### Vercel Production
Set environment variable in Vercel dashboard:
```
OPENAI_API_KEY = sk-...
```

**DO NOT** set `VITE_OPENAI_API_KEY` in Vercel.

---

## Testing

### Local Testing
```bash
# Start dev server (includes API functions)
npm run dev

# Test API endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### Vercel Testing
Deploy to preview:
```bash
git push origin staging
# Vercel auto-deploys from staging branch
```

---

## Deployment Checklist

- [ ] All OpenAI imports removed from `src/` directory
- [ ] All `import.meta.env.VITE_OPENAI_API_KEY` references removed
- [ ] `OPENAI_API_KEY` set in Vercel environment variables
- [ ] `vercel.json` configured with API routes
- [ ] Test all AI features in production
- [ ] Remove `VITE_OPENAI_API_KEY` from `.env` files

---

## Troubleshooting

### "API key not configured"
- Check Vercel environment variable `OPENAI_API_KEY` is set
- Redeploy after setting env vars

### "Module not found: openai"
- Add `openai` to `package.json` if not present:
  ```bash
  npm install openai
  ```

### API timeout
- Increase timeout in `vercel.json`:
  ```json
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
  ```

### CORS errors
- Vercel handles CORS automatically
- If issues persist, check `vercel.json` rewrites

---

## Benefits

✅ **Security:** API key never exposed to browser
✅ **Compliance:** Client-side API calls removed
✅ **Rate Limiting:** Backend can implement rate limiting
✅ **Monitoring:** Centralized logging and error handling
✅ **Cost Control:** Track and limit API usage server-side
✅ **Scalability:** Vercel serverless auto-scales

---

## Next Steps

1. **Continue Migration:** Update remaining 33 files using the pattern above
2. **Test Thoroughly:** Test each feature after migration
3. **Remove Old Code:** Delete all `dangerouslyAllowBrowser` references
4. **Update Docs:** Update README with new API architecture
5. **Deploy:** Push to staging, test, then deploy to production



