#!/bin/bash

# Script to set ElevenLabs environment variables in Vercel production
# Usage: ./set-vercel-env.sh
# Note: You may be prompted to authenticate with Vercel if not already logged in

echo "🚀 Setting ElevenLabs environment variables in Vercel production..."
echo "📝 This will add/update environment variables. Press Enter for each prompt."
echo ""

# Set environment variables (will prompt for value if variable doesn't exist)
echo "Setting VITE_ELEVENLABS_API_KEY..."
echo "sk_de764b17f02ea405a979aec33ba58bd7a53cd16ad07e77bb" | vercel env add VITE_ELEVENLABS_API_KEY production

echo "Setting VITE_ELEVENLABS_VOICE_ID_JESS..."
echo "cgSgspJ2msm6clMCkdW9" | vercel env add VITE_ELEVENLABS_VOICE_ID_JESS production

echo "Setting VITE_ELEVENLABS_VOICE_ID_ROBERT..."
echo "CwhRBWXzGAHq8TQ4Fs17" | vercel env add VITE_ELEVENLABS_VOICE_ID_ROBERT production

echo "Setting VITE_ELEVENLABS_VOICE_ID_AISHA..."
echo "cgSgspJ2msm6clMCkdW9" | vercel env add VITE_ELEVENLABS_VOICE_ID_AISHA production

echo "Setting VITE_ELEVENLABS_VOICE_ID_DAVID..."
echo "L0Dsvb3SLTyegXwtm47J" | vercel env add VITE_ELEVENLABS_VOICE_ID_DAVID production

echo "Setting VITE_ELEVENLABS_VOICE_ID_JAMES..."
echo "pYDLV125o4CgqP8i49Lg" | vercel env add VITE_ELEVENLABS_VOICE_ID_JAMES production

echo "Setting VITE_ELEVENLABS_VOICE_ID_EMILY..."
echo "rfkTsdZrVWEVhDycUYn9" | vercel env add VITE_ELEVENLABS_VOICE_ID_EMILY production

echo "Setting VITE_ELEVENLABS_VOICE_ID_SRIKANTH..."
echo "wD6AxxDQzhi2E9kMbk9t" | vercel env add VITE_ELEVENLABS_VOICE_ID_SRIKANTH production

echo "Setting VITE_ELEVENLABS_VOICE_ID_BOLA..."
echo "xeBpkkuzgxa0IwKt7NTP" | vercel env add VITE_ELEVENLABS_VOICE_ID_BOLA production

echo "Setting VITE_ELEVENLABS_VOICE_ID_SARAH..."
echo "MzqUf1HbJ8UmQ0wUsx2p" | vercel env add VITE_ELEVENLABS_VOICE_ID_SARAH production

echo "Setting VITE_ELEVENLABS_VOICE_ID_LISA..."
echo "8N2ng9i2uiUWqstgmWlH" | vercel env add VITE_ELEVENLABS_VOICE_ID_LISA production

echo "Setting VITE_ELEVENLABS_VOICE_ID_MICHAEL..."
echo "h1i3CVVBUuF6s46cxUGG" | vercel env add VITE_ELEVENLABS_VOICE_ID_MICHAEL production

echo "Setting VITE_ELEVENLABS_VOICE_ID_TOM..."
echo "qqBeXuJvzxtQfbsW2f40" | vercel env add VITE_ELEVENLABS_VOICE_ID_TOM production

echo "Setting VITE_ELEVENLABS_VOICE_ID_FEMALEMOTIVATION..."
echo "eOHsvebhdtt0XFeHVMQY" | vercel env add VITE_ELEVENLABS_VOICE_ID_FEMALEMOTIVATION production

echo "Setting VITE_ELEVENLABS_VOICE_ID_VICTOR..."
echo "neMPCpWtBwWZhxEC8qpe" | vercel env add VITE_ELEVENLABS_VOICE_ID_VICTOR production

echo "Setting VITE_ENABLE_ELEVENLABS..."
echo "true" | vercel env add VITE_ENABLE_ELEVENLABS production

echo ""
echo "✅ All environment variables set!"
echo "🔄 To apply changes, trigger a new deployment in Vercel dashboard or run: vercel --prod"

