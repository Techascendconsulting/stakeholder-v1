# OpenAI Cleanup Migration Plan (Task 4)

**Last Updated:** November 2025  
**Status:** 25% Complete (4/16 files migrated)  
**Goal:** Remove `VITE_OPENAI_API_KEY` from frontend, use server-side proxy only

---

## 📊 Current Status

### ✅ Already Using Proxy (4 files)
1. `src/utils/assignments.ts` - ✅ Uses `baseURL: 'http://localhost:3001/api/openai-proxy'`
2. `src/utils/validateUserStory.ts` - ✅ Uses proxy
3. `src/utils/validateAcceptanceCriteria.ts` - ✅ Uses proxy
4. `src/lib/kb.ts` - ✅ Uses proxy (for KB search)

### ⚠️ Still Exposing API Key (12 files)

---

## 🔍 Detailed File Analysis

### **Category 1: Text-Only Services (Standard Migration)**

#### 1. `src/services/agileRefinementService.ts`
- **Usage Type:** Text responses
- **Call Type:** Non-streaming
- **Purpose:** Agile refinement coaching
- **Migration Strategy:** Replace client with `baseURL: 'http://localhost:3001/api/openai-proxy'`
- **Priority:** Medium

#### 2. `src/services/singleAgentSystem.ts`
- **Usage Type:** Text responses
- **Call Type:** Non-streaming
- **Purpose:** Core AI meeting agent (most important!)
- **Migration Strategy:** Replace client with proxy
- **Priority:** **HIGH** (critical service)

#### 3. `src/services/verityService.ts`
- **Usage Type:** Text responses
- **Call Type:** Non-streaming
- **Purpose:** Verity assistant chat
- **Current:** Already has backend fallback logic
- **Migration Strategy:** Remove direct OpenAI fallback, use proxy only
- **Priority:** **HIGH** (already partially migrated)

#### 4. `src/lib/whisper.ts`
- **Usage Type:** Audio transcription
- **Call Type:** `audio.transcriptions.create` (special endpoint)
- **Purpose:** Voice transcription from audio blobs
- **Migration Strategy:** Needs new backend route `/api/openai-proxy/audio/transcriptions`
- **Priority:** Medium

#### 5. `src/services/trainingService.ts`
- **Usage Type:** Text responses
- **Call Type:** Non-streaming
- **Purpose:** Conversation analysis/scoring
- **Migration Strategy:** Replace with proxy
- **Priority:** Medium

#### 6-11. Coaching Services (6 files)
All text-only, non-streaming. Standard proxy migration:
- `src/services/coachingAnalysisService.ts` - Priority: Low
- `src/services/coachingEvaluatorService.ts` - Priority: Low
- `src/services/stakeholderResponseAnalysisService.ts` - Priority: Low
- `src/services/stakeholderResponseAnalyzer.ts` - Priority: Low
- `src/services/greetingCoachingService.ts` - Priority: Low
- `src/services/problemExplorationService.ts` - Priority: Low

#### 12. `src/services/dynamicQuestionGenerator.ts`
- **Usage Type:** Text responses
- **Call Type:** Non-streaming
- **Purpose:** Generate dynamic questions
- **Migration Strategy:** Replace with proxy
- **Priority:** Low

#### 13. `src/services/lectureService.ts`
- **Usage Type:** Text responses
- **Call Type:** Non-streaming
- **Purpose:** Lecture generation
- **Migration Strategy:** Replace with proxy
- **Priority:** Low

### **Category 2: Streaming Services (Special Migration)**

#### 14. `src/components/Views/VoiceOnlyMeetingView.tsx` (Line 3680-3720)
- **Usage Type:** Streaming text → audio (voice meetings)
- **Call Type:** `stream: true` with `response.body?.getReader()`
- **Purpose:** Real-time voice meeting responses
- **Migration Strategy:** **Requires new SSE/WebSocket backend**
- **Priority:** **HIGH** (core feature)

#### 15. `src/components/Views/VoiceMeetingV2.tsx` (Line 340-390)
- **Usage Type:** Text responses
- **Call Type:** Non-streaming (despite being voice meeting)
- **Purpose:** Voice meeting agent replies
- **Migration Strategy:** Replace with proxy (easier than VoiceOnly)
- **Priority:** **HIGH** (core feature)

---

## 🎯 Migration Strategy by File Type

### **Strategy A: Standard Proxy Migration (11 files)**

For non-streaming services:
1. Change OpenAI client initialization from:
   ```typescript
   new OpenAI({
     apiKey: apiKey.trim(),
     dangerouslyAllowBrowser: true
   })
   ```
   To:
   ```typescript
   new OpenAI({
     apiKey: 'dummy', // Won't be used, proxy has real key
     dangerouslyAllowBrowser: true, // Still needed for SDK
     baseURL: 'http://localhost:3001/api/openai-proxy'
   })
   ```

**Files to migrate:**
- agileRefinementService.ts
- singleAgentSystem.ts
- verityService.ts (remove fallback)
- trainingService.ts
- coachingAnalysisService.ts
- coachingEvaluatorService.ts
- stakeholderResponseAnalysisService.ts
- stakeholderResponseAnalyzer.ts
- greetingCoachingService.ts
- problemExplorationService.ts
- dynamicQuestionGenerator.ts
- lectureService.ts
- VoiceMeetingV2.tsx

### **Strategy B: Audio Transcription Endpoint (1 file)**

For Whisper API:
1. Create new backend route: `POST /api/openai-proxy/audio/transcriptions`
2. Accept multipart/form-data with audio file
3. Forward to OpenAI's audio API
4. Return transcription

**File to migrate:**
- lib/whisper.ts

### **Strategy C: Streaming Endpoint (1 file)**

For streaming responses:
1. Create new backend route: `POST /api/openai-stream`
2. Use Server-Sent Events (SSE) or WebSocket
3. Stream OpenAI response chunks to client
4. Frontend reads stream and synthesizes audio in real-time

**File to migrate:**
- VoiceOnlyMeetingView.tsx (streaming only)

---

## 🏗️ Backend Implementation Requirements

### **New Route 1: Audio Transcriptions**

```javascript
// server/src/routes/openai-proxy.js
fastify.post('/api/openai-proxy/audio/transcriptions', {
  preHandler: validateRequest(audioTranscriptionSchema)
}, async (request, reply) => {
  // Handle multipart/form-data
  // Forward to OpenAI audio API
  // Return transcription text
});
```

### **New Route 2: Streaming Completions**

```javascript
// server/src/routes/openai-stream.js
fastify.post('/api/openai-stream', {
  preHandler: validateRequest(openaiChatSchema)
}, async (request, reply) => {
  // Enable streaming on OpenAI client
  // Set response headers for SSE
  // Stream chunks to client
});
```

**SSE Format:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"content": "chunk1"}\n\n
data: {"content": "chunk2"}\n\n
data: {"done": true}\n\n
```

---

## 📅 Recommended Migration Order

### **Phase 1: Critical Services** (Week 1)
1. ✅ **singleAgentSystem.ts** - Core AI meeting agent
2. ✅ **verityService.ts** - Remove fallback, use proxy only
3. ✅ **VoiceMeetingV2.tsx** - Standard proxy migration

**Why first:** These are core features. Test thoroughly before proceeding.

---

### **Phase 2: Supporting Services** (Week 1-2)
4. ✅ **trainingService.ts** - Conversation analysis
5. ✅ **agileRefinementService.ts** - Refinement coaching
6. ✅ **lib/whisper.ts** - Audio transcription (needs new endpoint)

**Why second:** Build transcription endpoint alongside migration.

---

### **Phase 3: Coaching Services** (Week 2)
7. ✅ coachingAnalysisService.ts
8. ✅ coachingEvaluatorService.ts
9. ✅ stakeholderResponseAnalysisService.ts
10. ✅ stakeholderResponseAnalyzer.ts
11. ✅ greetingCoachingService.ts
12. ✅ problemExplorationService.ts
13. ✅ dynamicQuestionGenerator.ts
14. ✅ lectureService.ts

**Why last:** Lower priority, bulk migration.

---

### **Phase 4: Streaming** (Week 3)
15. ✅ **VoiceOnlyMeetingView.tsx** - Build SSE endpoint first

**Why last:** Most complex. Only start after all others work.

---

## 🧪 Testing Checklist Per Phase

### After Phase 1:
- [ ] Start a voice meeting with stakeholders
- [ ] Verity chat assistant responds correctly
- [ ] AI meeting agent generates replies
- [ ] No API key visible in browser DevTools

### After Phase 2:
- [ ] Complete a training session
- [ ] Get post-meeting analysis score
- [ ] Audio transcription works
- [ ] All coaching features work

### After Phase 3:
- [ ] All coaching services respond
- [ ] No broken flows

### After Phase 4:
- [ ] Streaming voice meetings work
- [ ] Real-time audio synthesis

---

## 🚀 Final Steps After Migration

1. **Remove `VITE_OPENAI_API_KEY` from Vercel**
   - Go to Vercel dashboard → Environment Variables
   - Delete `VITE_OPENAI_API_KEY`
   - Redeploy

2. **Add `OPENAI_API_KEY` to Vercel** (backend only)
   - Same process
   - Link to server-side functions

3. **Update `.env.example`**
   - Remove `VITE_OPENAI_API_KEY`
   - Document `OPENAI_API_KEY` for backend

4. **Update CI security check**
   - Remove `VITE_OPENAI_API_KEY` from allowed env vars
   - Ensure only `OPENAI_API_KEY` is checked

5. **Search for hardcoded keys**
   ```bash
   grep -r "sk-proj-" src/ --exclude-dir=node_modules
   grep -r "VITE_OPENAI" src/
   ```

---

## 📝 Migration Template

For each file (except streaming):

### Before:
```typescript
import OpenAI from 'openai';

const createOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey: apiKey.trim(),
    dangerouslyAllowBrowser: true
  });
};
```

### After:
```typescript
import OpenAI from 'openai';

const createOpenAIClient = () => {
  // API key now on backend
  return new OpenAI({
    apiKey: 'dummy', // Not used
    dangerouslyAllowBrowser: true,
    baseURL: 'http://localhost:3001/api/openai-proxy'
  });
};
```

---

## 🎓 Key Learnings

1. **Standard services:** Just add `baseURL` → done
2. **Audio:** Needs special endpoint for Whisper API
3. **Streaming:** Needs SSE/WebSocket for real-time
4. **Verity:** Already has fallback logic, easy to remove
5. **Priority:** singleAgentSystem + verityService first

---

## ✅ Success Criteria

- [ ] Zero references to `VITE_OPENAI_API_KEY` in frontend code
- [ ] All 16 files migrated
- [ ] `VITE_OPENAI_API_KEY` removed from Vercel
- [ ] `OPENAI_API_KEY` added to Vercel (backend)
- [ ] All tests passing
- [ ] Voice meetings work end-to-end
- [ ] Security audit shows no exposed keys

---

**End of Migration Plan**









