# Vercel Environment Variables Setup

All environment variables from `.env.local` that need to be set in Vercel production:

## Quick Setup in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each of the following variables for **Production** environment:

## Required Environment Variables

### ElevenLabs API Key
```
VITE_ELEVENLABS_API_KEY=sk_de764b17f02ea405a979aec33ba58bd7a53cd16ad07e77bb
```

### Voice IDs (Critical for Jess and Robert)
```
VITE_ELEVENLABS_VOICE_ID_JESS=cgSgspJ2msm6clMCkdW9
VITE_ELEVENLABS_VOICE_ID_ROBERT=CwhRBWXzGAHq8TQ4Fs17
```

### All Other Voice IDs
```
VITE_ELEVENLABS_VOICE_ID_AISHA=cgSgspJ2msm6clMCkdW9
VITE_ELEVENLABS_VOICE_ID_DAVID=L0Dsvb3SLTyegXwtm47J
VITE_ELEVENLABS_VOICE_ID_JAMES=pYDLV125o4CgqP8i49Lg
VITE_ELEVENLABS_VOICE_ID_EMILY=rfkTsdZrVWEVhDycUYn9
VITE_ELEVENLABS_VOICE_ID_SRIKANTH=wD6AxxDQzhi2E9kMbk9t
VITE_ELEVENLABS_VOICE_ID_BOLA=xeBpkkuzgxa0IwKt7NTP
VITE_ELEVENLABS_VOICE_ID_SARAH=MzqUf1HbJ8UmQ0wUsx2p
VITE_ELEVENLABS_VOICE_ID_LISA=8N2ng9i2uiUWqstgmWlH
VITE_ELEVENLABS_VOICE_ID_MICHAEL=h1i3CVVBUuF6s46cxUGG
VITE_ELEVENLABS_VOICE_ID_TOM=qqBeXuJvzxtQfbsW2f40
VITE_ELEVENLABS_VOICE_ID_FEMALEMOTIVATION=eOHsvebhdtt0XFeHVMQY
VITE_ELEVENLABS_VOICE_ID_VICTOR=neMPCpWtBwWZhxEC8qpe
```

### Feature Flag
```
VITE_ENABLE_ELEVENLABS=true
```

## After Setting Variables

1. **Redeploy** your production deployment in Vercel dashboard
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy** → **Use Existing Build Cache** (optional)

2. **Verify** the variables are set:
   - Check deployment logs to confirm variables are loaded
   - Test Jess and Robert voices in production

## Alternative: Use Vercel CLI

If you prefer using CLI:

1. Link your project: `vercel link`
2. Run the script: `./set-vercel-env.sh`

Note: The script will add all variables automatically if the project is linked.






