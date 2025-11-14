#!/bin/bash

# Run SQL Fix Script using Supabase CLI
# This script executes FIX_CAREER_JOURNEY_TABLES.sql against your Supabase database

echo "🚀 Running SQL fix script..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Install it with: npm install -g supabase"
    echo ""
    echo "💡 Alternative: Run the SQL manually in Supabase Dashboard:"
    echo "1. Go to https://supabase.com/dashboard/project/ckppwcsnkbrgekxtwccq/sql/new"
    echo "2. Copy and paste the contents of FIX_CAREER_JOURNEY_TABLES.sql"
    echo "3. Click 'Run'"
    exit 1
fi

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Supabase project not linked locally."
    echo "🔗 Linking project..."
    supabase link --project-ref ckppwcsnkbrgekxtwccq
fi

# Execute the SQL
echo "📝 Executing SQL..."
supabase db execute --file FIX_CAREER_JOURNEY_TABLES.sql

if [ $? -eq 0 ]; then
    echo "✅ SQL executed successfully!"
    echo "📊 Tables should now be created. Check your Supabase dashboard to verify."
else
    echo "❌ Error executing SQL."
    echo ""
    echo "💡 Alternative: Run the SQL manually in Supabase Dashboard:"
    echo "1. Go to https://supabase.com/dashboard/project/ckppwcsnkbrgekxtwccq/sql/new"
    echo "2. Copy and paste the contents of FIX_CAREER_JOURNEY_TABLES.sql"
    echo "3. Click 'Run'"
    exit 1
fi

