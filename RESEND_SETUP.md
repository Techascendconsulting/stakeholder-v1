# Resend + Supabase Edge Functions Setup

## Why This Approach?
- ✅ **No data loss** - Every submission is sent immediately
- ✅ **Professional** - Industry-standard email service
- ✅ **Reliable** - Works from the first request
- ✅ **Free tier** - 3,000 emails/month on free plan

## Setup Steps (30 minutes total)

### Step 1: Create Resend Account (5 min)
1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address

### Step 2: Get API Key (2 min)
1. In Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Copy the API key (starts with `re_...`)

### Step 3: Add API Key to Supabase (3 min)
```bash
cd /Users/joyoby/stakeholder-v1
supabase secrets set RESEND_API_KEY=your_api_key_here
```

### Step 4: Deploy Edge Function (5 min)
The function is already created at `supabase/functions/send-help-email/index.ts`

Deploy it:
```bash
supabase functions deploy send-help-email
```

### Step 5: Update Frontend Code (5 min)
The `emailService.ts` file needs to call the Edge Function instead of FormSubmit.

### Step 6: Domain Verification (Optional, 10 min)
For production, verify your domain:
1. In Resend, go to "Domains"
2. Add your domain
3. Add DNS records they provide
4. Wait for verification

**Note:** For testing, you can use `onboarding@resend.dev` as the sender.

## Testing
After setup, test by submitting a help request through Verity.

## Free Tier Limits
- 3,000 emails/month
- 100 emails/day
- Perfect for MVP!

