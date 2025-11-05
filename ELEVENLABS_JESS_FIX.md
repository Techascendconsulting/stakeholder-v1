# ElevenLabs Voice Fix for Jess - Undefined Voice ID

**Issue:** Jess Morgan's voice is returning `undefined` voice ID, causing 404 errors.

**Root Cause:** 
- The `resolveVoiceId` function correctly maps "Jess" → `VOICE_ID_JESS`
- But if `VITE_ELEVENLABS_VOICE_ID_JESS` environment variable is not set, it falls back to `VOICE_ID_AISHA`
- If that's also not set, it returns `undefined`
- The old code (in cached bundle) then tries to make API call with `undefined` → 404 error

**Fix Applied:**
1. ✅ Added stricter validation to prevent API calls with undefined voice IDs
2. ✅ Enhanced Jess voice resolution to try multiple fallbacks
3. ✅ Added better error messages showing which env vars are missing
4. ✅ Updated VoiceMeetingV2 to use the service properly

**Required Action:**
⚠️ **RESTART YOUR DEV SERVER** - The changes won't take effect until you rebuild:

```bash
# Stop current dev server (Ctrl+C)
npm run dev  # Restart
```

**Environment Variables Needed:**

Check your `.env` file and ensure at least ONE of these is set:

```env
# Option 1: Set Jess's voice ID directly
VITE_ELEVENLABS_VOICE_ID_JESS=your-jess-voice-id

# Option 2: Use Aisha's voice as fallback (if Jess not set)
VITE_ELEVENLABS_VOICE_ID_AISHA=your-aisha-voice-id

# Option 3: Set a default voice (used if no specific voice found)
VITE_ELEVENLABS_VOICE_ID=your-default-voice-id

# Required: API Key
VITE_ELEVENLABS_API_KEY=your-api-key
```

**Why David Works But Jess Doesn't:**

- David's voice ID is hardcoded in VoiceMeetingV2: `"David": "L0Dsvb3SLTyegXwtm47J"`
- Jess relies on environment variables: `VOICE_ID_JESS` or `VOICE_ID_AISHA`
- If these env vars aren't set, Jess gets `undefined`

**After Restart:**

1. Check console for: `🎤 VOICE RESOLUTION: Jess/Jessica -> ...`
2. Should show which voice ID was resolved
3. If still undefined, check which env vars are NOT SET in the warning message
4. Set at least one voice ID env var and restart again

**Quick Test:**

After restart, check browser console for:
- `🔊 ELEVENLABS DEBUG:` - Should show voice IDs
- `🎤 VOICE RESOLUTION:` - Should show Jess → voice ID
- Should NOT see: `POST .../text-to-speech/undefined`






