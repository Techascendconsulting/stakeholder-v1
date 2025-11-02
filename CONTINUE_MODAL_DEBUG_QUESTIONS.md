# Continue Modal Debug Workflow

## 🔧 Systematic Debugging Checklist

### 1️⃣ Check if resume state is being captured correctly

**Expected behavior:** Every time a user lands on a returnable page (core-learning, practice, project), the app saves `resume_state`.

**✅ Test:**
```javascript
JSON.parse(localStorage.getItem('resume_state'))
```

**✅ You should see:**
```json
{
  "userId": "abc123",
  "path": "core-learning",
  "pageType": "learning",
  "pageTitle": "Core Learning",
  "stepId": "topic-1",
  "isReturnable": true,
  "updatedAt": 1735693000000
}
```

**If null** → check that `saveResumeState()` actually fires on navigation (especially within `CoreLearning2View`).

---

### 2️⃣ Confirm saving works on topic selection

**Expected:** when clicking a topic like "Who is a Business Analyst", `CoreLearning2View` should log:
```
💾 CORE_LEARNING: Saved resume state for topic
```

**If you don't see this** → the `useEffect` or event handler for that topic page isn't firing.  
Add a quick `console.log('💾 CORE_LEARNING: useEffect fired')` to confirm lifecycle execution.

---

### 3️⃣ Confirm save on logout

When user clicks "Sign out":

**You should see:**
```
💾 RESUME: Saved resume state on logout
✅ RESUME: Verified saved state exists
```

Then re-login → you should still see that state in localStorage (until manually cleared).

**If not** → logout handler may be wiping localStorage or not calling `saveResumeState()` properly.

---

### 4️⃣ Check for unexpected clearing

Sometimes the modal won't show because the state is deleted elsewhere.

**✅ Search your repo:**
- `localStorage.removeItem('resume_state')`
- `clearResumeState()`

**If found:**
Verify it's not being triggered when navigating to dashboard/admin pages (it should only clear intentionally).

---

### 5️⃣ Verify the hook actually runs

The modal logic is inside `useContinuePrompt`.

**You should see in console:**
```
🔍 CONTINUE_PROMPT: ========== useEffect EXECUTING ==========
```

**If missing:**
- Check that the hook is imported and used inside the app shell after user context is available.
- Confirm dependencies: `[userId, isAdmin, onboardingCompleted]` are stable (not undefined or changing).

---

### 6️⃣ Check userId consistency

The modal will skip showing if it detects the saved state belongs to another user.

**Look for:**
```
📂 RESUME_STORE: Resume state for different user, clearing
```

**If that appears** → your auth `user.id` doesn't match `resume_state.userId`.  
Make sure the state is always saved with the currently logged-in user's ID.

---

### 7️⃣ Validate resume state fields

The modal only triggers if:
- `isReturnable: true`
- `pageType ∈ ["learning", "practice", "project"]`

**✅ Test:**
```javascript
const s = JSON.parse(localStorage.getItem('resume_state'));
console.log('Returnable?', s?.isReturnable, 'Type:', s?.pageType);
```

**If you see:**
```
Returnable? false Type: dashboard
```
→ The last page wasn't valid to resume, so the modal won't show (expected).

---

### 8️⃣ Check session flag logic

The modal only shows once per session.

**✅ Test:**
```javascript
sessionStorage.getItem('continuePromptShown')
```

**If this returns `'1'`**, the modal was already shown.  
Clear it to test again:
```javascript
sessionStorage.removeItem('continuePromptShown');
```

---

### 9️⃣ Check user preferences

**✅ Test:**
```javascript
JSON.parse(localStorage.getItem('resume_prefs') || '{"dontAskAgain":false}')
```

**If `dontAskAgain` is `true`** → modal is intentionally suppressed.

You can reset it with:
```javascript
localStorage.setItem('resume_prefs', JSON.stringify({ dontAskAgain: false }));
```

---

### 🔟 Sanity reload test

Once all of the above check out:

1. Go to `/core-learning`
2. Wait a few seconds → confirm `resume_state` saved
3. Log out (confirm save)
4. Log in again → modal should appear once, showing your last page title

---

## 🧩 Common Failure Scenarios & Fix Tips

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Modal never appears | `useContinuePrompt` not running or wrong conditions | Add debug logs inside hook; verify dependencies |
| Saved state missing | Route capture not firing | Wrap router listener correctly; ensure useEffect dependencies fire |
| Modal flashes then disappears | Page redirecting before modal loads | Move hook after dashboard render, not before |
| Wrong user's state loaded | Auth ID mismatch | Save userId on each save; clear old user's state on logout |
| Always resets on login | Auth flow clears localStorage | Exclude `resume_state` from full clear |
| "Continue" leads to 404 | Page moved or renamed | Add route validation/fallback logic |

---

## ⚡ Quick Reset (for retesting)

```javascript
localStorage.removeItem('resume_state');
localStorage.removeItem('resume_prefs');
sessionStorage.removeItem('continuePromptShown');
```

Then repeat login → you should get a clean modal test.

---

## 🛠️ Debug Helper Function

Run this in the browser console:
```javascript
// Available via window.debugResumeState() after page load
debugResumeState()
```

This will log:
- Current resume state
- User preferences
- Session flag status
