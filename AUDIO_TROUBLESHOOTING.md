# Audio Troubleshooting Guide

## Quick Check: Is Audio Working?

### Step 1: Check if Audio Controls Are Visible
1. **Start the development server**: `npm run dev`
2. **Go to a meeting**: Navigate to meeting view with stakeholders
3. **Enable audio**: Click the "Audio On" button in the meeting header (should be green)
4. **Send a message**: Type a message and send it
5. **Look for audio controls**: Below each stakeholder reply, you should see:
   - Play/Pause button (blue circle)
   - Stop button (gray circle)
   - Progress bar
   - Volume icon

### Step 2: Check Browser Console
1. **Open browser console**: F12 → Console tab
2. **Send a message**: Type a message and wait for stakeholder reply
3. **Look for debug logs**:
   ```
   Audio component rendering for message: [ID] speaker: [SPEAKER_ID]
   Global audio enabled: true
   Stakeholder voice enabled: true
   handlePlay called for message: [ID] speaker: [SPEAKER_ID]
   Using voice: [VOICE_NAME] for stakeholder: [SPEAKER_ID]
   ```

## Common Issues & Solutions

### Issue 1: No Audio Controls Visible
**Problem**: Audio controls don't appear below stakeholder messages
**Solution**: 
- Check if you're in a meeting with stakeholders
- Ensure you've sent a message and received a reply
- Audio controls only appear for stakeholder messages (not user or system messages)

### Issue 2: Audio Controls Are Gray/Disabled
**Problem**: Play button is gray and disabled
**Possible Causes**:
- Global audio is disabled → Click "Audio On" in meeting header
- Stakeholder voice is disabled → Should be enabled by default
- Browser doesn't support audio → Try a different browser

### Issue 3: Audio Plays But No Sound
**Problem**: Audio appears to play but no sound comes out
**Solutions**:
- Check system volume
- Check browser audio permissions
- Try clicking play button manually
- Check if other browser audio works

### Issue 4: API Key Error
**Problem**: Console shows "Azure TTS not configured"
**Solution**: 
- This is normal without API keys
- Should fall back to browser TTS automatically
- To use Azure TTS, add your API key to `.env` file

## Testing Steps

### Basic Test (No API Keys Required)
1. **Start server**: `npm run dev`
2. **Go to meeting**: Navigate to stakeholder meeting
3. **Enable audio**: Click "Audio On" button
4. **Send message**: "Hello, can you tell me about the current process?"
5. **Check console**: Should see debug logs
6. **Wait for reply**: Stakeholder should reply automatically
7. **Check audio**: Should see audio controls below the reply
8. **Click play**: Should hear browser TTS voice

### Advanced Test (With API Keys)
1. **Add API keys** to `.env`:
   ```
   VITE_AZURE_TTS_KEY=your_actual_azure_key
   VITE_AZURE_TTS_REGION=uksouth
   ```
2. **Restart server**: `npm run dev`
3. **Follow basic test steps**
4. **Check console**: Should see "Using Azure TTS"
5. **Audio quality**: Should be high-quality UK voice

## Debug Console Commands

Open browser console and run these commands:

```javascript
// Check if audio is globally enabled
console.log('Global audio enabled:', window.globalAudioEnabled)

// Check if speech synthesis is available
console.log('Speech synthesis available:', 'speechSynthesis' in window)

// Test browser TTS directly
if ('speechSynthesis' in window) {
  const utterance = new SpeechSynthesisUtterance('Hello, this is a test')
  utterance.lang = 'en-GB'
  speechSynthesis.speak(utterance)
}

// Check available voices
if ('speechSynthesis' in window) {
  speechSynthesis.getVoices().forEach(voice => {
    console.log(voice.name, voice.lang)
  })
}
```

## Expected Behavior

### With API Keys (Azure TTS)
- High-quality UK-accented voices
- Smooth audio playback
- Progress bar shows accurate timing
- Different voices for different stakeholder roles

### Without API Keys (Browser TTS)
- Browser's built-in TTS voice
- May vary by browser/OS
- Still functional but lower quality
- Progress bar shows estimated timing

## File Locations

- **Audio Component**: `src/components/StakeholderMessageAudio.tsx`
- **Meeting View**: `src/components/Views/MeetingView.tsx`
- **Voice Context**: `src/contexts/VoiceContext.tsx`
- **Azure TTS**: `src/lib/azureTTS.ts`
- **Environment**: `.env`

## Still Not Working?

1. **Check browser compatibility**: Try Chrome, Firefox, or Edge
2. **Check network**: Audio generation requires internet
3. **Check permissions**: Browser may block audio
4. **Try incognito**: Extensions might interfere
5. **Check console**: Look for error messages

## Quick Fix Commands

```bash
# Restart development server
npm run dev

# Clear browser cache
# Ctrl+Shift+R (hard refresh)

# Check if files exist
ls -la src/components/StakeholderMessageAudio.tsx
ls -la .env

# Check git status
git status
```

If none of these steps work, please share:
1. Browser console output
2. Network requests in browser dev tools
3. Any error messages
4. Browser type and version