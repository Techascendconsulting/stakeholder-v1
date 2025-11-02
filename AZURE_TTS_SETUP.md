# Azure Text-to-Speech Setup Guide

## Why You're Getting Browser Voices Instead of Professional Azure Voices

The stakeholder AI app is designed to use professional Azure Cognitive Services Text-to-Speech voices for each stakeholder, but without proper configuration, it falls back to basic browser TTS.

## Current Voice Assignments

| Stakeholder | Role | Intended Azure Voice |
|-------------|------|---------------------|
| **James Walker** | Head of Operations | `en-GB-RyanNeural` (Professional British Male) |
| **Jess Morgan** | Customer Service Manager | `en-GB-SoniaNeural` (Professional British Female) |
| **David Thompson** | IT Systems Lead | `en-GB-ThomasNeural` (Authoritative British Male) |
| **Sarah Patel** | HR Business Partner | `en-GB-LibbyNeural` (Professional British Female) |
| **Emily Robinson** | Compliance Manager | `en-GB-AbbiNeural` (Professional British Female) |

## How to Enable Azure TTS

### Step 1: Create Azure Cognitive Services Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Cognitive Services** resource
3. Select **Speech** service
4. Choose your subscription and resource group
5. Select a pricing tier (F0 free tier available)
6. Note your **Key** and **Region**

### Step 2: Configure Environment Variables

1. Copy your Azure Speech service key and region
2. Update the `.env` file in your project root:

```env
# Replace with your actual Azure credentials
VITE_AZURE_TTS_KEY=your_actual_azure_key_here
VITE_AZURE_TTS_REGION=your_region_here

# Example:
# VITE_AZURE_TTS_KEY=abc123def456ghi789
# VITE_AZURE_TTS_REGION=uksouth
```

### Step 3: Restart Development Server

```bash
npm run dev
```

## Verification

Check your browser console during a meeting. You should see:

✅ **With Azure TTS configured:**
```
🎵 Using voice: en-GB-RyanNeural for stakeholder: James Walker
🔧 Azure TTS Available: true
✅ Using Azure TTS with voice: en-GB-RyanNeural
```

⚠️ **Without Azure TTS configured:**
```
🎵 Using voice: en-GB-RyanNeural for stakeholder: James Walker
🔧 Azure TTS Available: false
⚠️ Azure TTS not available (check environment variables), using browser TTS
```

## Benefits of Azure TTS

- **Professional Voices**: High-quality neural voices
- **Consistent Personalities**: Each stakeholder has their unique voice
- **Natural Speech**: Better pronunciation and intonation
- **British Accents**: Professional UK accents for all stakeholders
- **Voice Caching**: Faster playback with audio caching

## Troubleshooting

### Issue: Still getting browser TTS after setup
- Verify your Azure key is correct
- Ensure your region matches your Azure resource
- Check browser console for error messages
- Restart the development server

### Issue: Azure TTS quota exceeded
- Check your Azure usage in the portal
- Consider upgrading from free tier if needed
- Azure free tier includes 500,000 characters per month

### Issue: Audio not playing
- Check browser audio permissions
- Verify global audio is enabled in the app
- Try refreshing the page

## Cost Information

- **Free Tier**: 500,000 characters per month
- **Standard Tier**: ~$4 per 1 million characters
- **Neural Voices**: Higher quality, slightly higher cost
- Each stakeholder response typically uses 100-500 characters

## Security Note

Never commit your actual Azure keys to git. The `.env` file is gitignored to prevent accidental exposure.