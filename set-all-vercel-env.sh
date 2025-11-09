#!/bin/bash

# Script to set ALL environment variables in Vercel production
# Usage: chmod +x set-all-vercel-env.sh && ./set-all-vercel-env.sh

echo "🚀 Setting ALL environment variables in Vercel production..."
echo "📝 Make sure you're logged in to Vercel CLI: vercel login"
echo ""

# Load environment variables from env.local
if [ ! -f "env.local" ]; then
    echo "❌ Error: env.local file not found!"
    exit 1
fi

echo "✅ Found env.local file"
echo ""

# Function to set a Vercel environment variable
set_vercel_env() {
    local key=$1
    local value=$2
    
    echo "Setting $key..."
    echo "$value" | vercel env add "$key" production --yes 2>/dev/null || \
    vercel env rm "$key" production --yes 2>/dev/null && echo "$value" | vercel env add "$key" production --yes
}

# Read and set all VITE_ variables
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    
    # Only process VITE_ variables
    if [[ "$key" == VITE_* ]]; then
        set_vercel_env "$key" "$value"
    fi
done < env.local

echo ""
echo "✅ All environment variables set in Vercel production!"
echo ""
echo "🔄 Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Click 'Deployments' → 'Redeploy' on the latest deployment"
echo "   OR run: vercel --prod"
echo ""
echo "The site should work after redeployment completes (2-3 minutes)"




