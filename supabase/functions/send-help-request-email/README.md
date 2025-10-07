# Verity Email Notification Setup

This Edge Function sends email notifications to `techascendconsulting@gmail.com` whenever a new help request is submitted (from local or production).

## 🚀 Setup Steps

### 1. Deploy the Edge Function

```bash
# Login to Supabase CLI (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase functions deploy send-help-request-email
```

### 2. Set up Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (or use resend's test domain for now)
3. Get your API key from the dashboard
4. Add it to Supabase secrets:

```bash
npx supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### 3. Create Database Webhook

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Webhooks**
3. Click **Create a new hook**
4. Configure:
   - **Name**: `send-help-request-email`
   - **Table**: `help_requests`
   - **Events**: Check `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-help-request-email`
   - **HTTP Headers**:
     ```
     Authorization: Bearer YOUR_ANON_KEY
     Content-Type: application/json
     ```

5. Click **Create webhook**

### 4. Test It

1. Run your app locally: `npm run dev`
2. Open Verity
3. Switch to "Report Issue" tab
4. Submit a test issue
5. Check your email at `techascendconsulting@gmail.com`

## 📧 Email Format

You'll receive emails like:

```
Subject: 🆘 New Help Request: technical - Scrum Practice

User: student@example.com
Page: Scrum Practice (scrum-practice)
Issue Type: technical
Date: Oct 7, 2025 10:30 AM

Question/Issue:
The 'Save' button isn't working on the backlog page

[View in Supabase Dashboard] (button)
```

## 🔧 Troubleshooting

**No emails arriving?**
- Check Supabase Edge Function logs
- Verify RESEND_API_KEY is set correctly
- Check webhook is enabled and configured
- Test with Resend's test domain first

**Emails go to spam?**
- Verify your sending domain in Resend
- Add SPF/DKIM records to your domain
- Use a professional "from" address

## 🎯 Alternative: Use Gmail SMTP Directly

If you prefer not to use Resend, you can modify the Edge Function to use Gmail SMTP:

1. Enable "App Passwords" in your Gmail account
2. Update the Edge Function to use nodemailer or similar
3. Use SMTP credentials instead of Resend API

## 📊 Current Configuration

- **To:** techascendconsulting@gmail.com
- **From:** verity@baworkxp.com (change to your verified domain)
- **Service:** Resend API
- **Trigger:** On INSERT to help_requests table
- **Works with:** Local builds, staging, production

