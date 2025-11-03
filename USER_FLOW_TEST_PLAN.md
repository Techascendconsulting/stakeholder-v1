# User Flow Safety Checklist & Automated Test Routine

**Purpose:** Ensure core user experiences remain functional after each migration/deployment  
**Approach:** Lightweight automated checks without heavy frameworks  
**Trigger:** After OpenAI migration phases

---

## 🎯 Core User Flows to Protect

### **Flow 1: Dashboard Launch**
**Priority:** Critical  
**Purpose:** Verify app starts and user can access main features

**Test Steps:**
1. ✅ App loads without console errors
2. ✅ Navigation menu is accessible
3. ✅ User can see their projects
4. ✅ "Start Meeting" button is clickable

**Automation:** URL health check + console error detection

---

### **Flow 2: Verity Chat Assistant**
**Priority:** Critical  
**Purpose:** Verify AI assistant responds correctly

**Test Steps:**
1. ✅ Open Verity chat interface
2. ✅ Send a test message
3. ✅ Receive AI response within 5 seconds
4. ✅ Response is non-empty and relevant
5. ✅ No API errors in console

**Automation:** API endpoint check + response validation

---

### **Flow 3: Stakeholder Meeting - Text Mode**
**Priority:** Critical  
**Purpose:** Verify core meeting functionality

**Test Steps:**
1. ✅ Start a meeting with 1 stakeholder
2. ✅ Send a user message
3. ✅ Receive stakeholder response
4. ✅ Response has proper speaker attribution
5. ✅ Conversation history updates
6. ✅ End meeting successfully

**Automation:** Meeting API calls + response format validation

---

### **Flow 4: Stakeholder Meeting - Voice Mode**
**Priority:** High  
**Purpose:** Verify voice meeting features (after Phase 4 migration)

**Test Steps:**
1. ✅ Start voice meeting
2. ✅ Enable microphone
3. ✅ Transcribe user speech
4. ✅ Get AI audio response
5. ✅ Play audio successfully

**Automation:** Audio transcription endpoint + audio generation check

---

### **Flow 5: Meeting Analysis & Scoring**
**Priority:** Medium  
**Purpose:** Verify post-meeting feedback

**Test Steps:**
1. ✅ Complete a short meeting (5 messages)
2. ✅ Get analysis score
3. ✅ Score is between 0-100
4. ✅ Feedback sections populate
5. ✅ No timeout errors

**Automation:** Analysis API call + score range validation

---

### **Flow 6: Continue Where You Left Off Modal**
**Priority:** Medium  
**Purpose:** Verify session persistence

**Test Steps:**
1. ✅ Start a meeting
2. ✅ Send 2-3 messages
3. ✅ Navigate away from meeting
4. ✅ Return to dashboard
5. ✅ Modal appears with "Continue" option
6. ✅ Clicking Continue resumes meeting

**Automation:** Session storage check + modal display logic

---

### **Flow 7: Knowledge Base Search**
**Priority:** Low  
**Purpose:** Verify KB integration for AI responses

**Test Steps:**
1. ✅ Trigger KB search from meeting context
2. ✅ Receive relevant KB results
3. ✅ AI response incorporates KB content
4. ✅ No search timeout errors

**Automation:** KB endpoint call + result validation

---

## 🛠️ Automated Test Implementation

### **Strategy: Lightweight Backend Health Checks**

Since we can't easily run browser E2E tests in CI without heavy frameworks, we'll:

1. **Test backend API endpoints directly** (curl/fetch)
2. **Validate response formats** (JSON schema)
3. **Check response times** (latency thresholds)
4. **Verify error handling** (503 → fallback behavior)

### **Test Script Architecture**

Create a simple Node.js test script that:
- Makes HTTP requests to key endpoints
- Validates JSON responses
- Checks response times
- Reports failures clearly

**No browsers, no headless Chromium, no Playwright/Cypress**  
**Just API contract validation**

---

## 📝 Test Implementation Files

### **File 1: `test-user-flows.js`**

Main test runner that checks:
- Backend availability
- OpenAI proxy functionality
- Required endpoints responding
- Response times under threshold

### **File 2: `.github/workflows/security-check.yml` (updated)**

Add new job after security checks:
- Run `test-user-flows.js`
- Fail build if any flow breaks
- Report which flow(s) failed

---

## 🚦 Pass/Fail Criteria

### **✅ PASS if:**
- All 7 flows complete successfully
- Response times < 5 seconds per request
- No 500/503 errors
- JSON responses valid
- Required fields present

### **❌ FAIL if:**
- Any flow returns error status
- Response time > 10 seconds
- Missing required fields in response
- OpenAI proxy unavailable
- Console errors detected

---

## 📊 Test Coverage Matrix

| Flow | Endpoint(s) Tested | Migration Phase |
|------|-------------------|-----------------|
| Dashboard Launch | `/health`, `/api/stage-packs` | All phases |
| Verity Chat | `/api/verity-chat` | Phase 1 |
| Meeting - Text | `/api/stakeholder-ai/*` | Phase 1 |
| Meeting - Voice | `/api/openai-stream` | Phase 4 |
| Analysis | Mocked (check format) | Phase 2 |
| Continue Modal | Frontend-only (skip) | All phases |
| KB Search | `/api/kb/search` | Phase 2 |

---

## 🔄 Test Execution Order

1. **Smoke Test:** Backend health check
2. **API Tests:** Critical endpoints respond
3. **Integration Tests:** Full flow simulations
4. **Performance Tests:** Response times acceptable

---

## 📋 Test Results Template

```
═══════════════════════════════════════
  USER FLOW TEST RESULTS
═══════════════════════════════════════

Backend Health: ✅ PASS
  - /health: 200 OK (45ms)
  - OpenAI proxy: 200 OK (123ms)

Flow 1: Dashboard Launch ✅ PASS
  - Navigation accessible
  - Projects loaded

Flow 2: Verity Chat ✅ PASS
  - Response received (2.1s)
  - Valid JSON format

Flow 3: Meeting Text ✅ PASS
  - Stakeholder replied
  - Correct speaker attribution

Flow 4: Meeting Voice ⏭️ SKIP (Phase 4 only)

Flow 5: Analysis ✅ PASS
  - Score: 78/100
  - Sections populated

Flow 6: Continue Modal ⏭️ SKIP (frontend-only)

Flow 7: KB Search ✅ PASS
  - Results returned
  - AI used KB context

═══════════════════════════════════════
  RESULT: 5/5 tests passed (2 skipped)
═══════════════════════════════════════
```

---

## 🎯 Future Enhancements

### **Phase 2 (Optional):**
- Browser-based E2E with Playwright
- Visual regression testing
- Load testing for voice endpoints

### **For Now:**
- Keep it simple and fast
- Focus on API contract validation
- Catch breaking changes early

---

## 📌 Integration Checklist

After adding tests:

- [x] Create `test-user-flows.js`
- [ ] Add test script to `package.json`
- [ ] Update `.github/workflows/security-check.yml`
- [ ] Test locally: `npm run test:flows`
- [ ] Verify CI runs tests
- [ ] Document how to add new flows

---

**End of Test Plan**




