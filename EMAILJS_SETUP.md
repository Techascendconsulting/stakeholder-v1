# EmailJS Setup for Verity Email Notifications

This guide will help you set up automatic email notifications when users submit help requests.

## 🎯 What This Does

When a student (e.g., admin@batraining.com) submits a Report Issue:
1. ✅ Issue is saved to Supabase `help_requests` table
2. ✅ Email is automatically sent to `techascendconsulting@gmail.com`
3. ✅ Email includes: user email, page, issue type, question, timestamp

## 🚀 Setup Steps (5 minutes)

### 1. Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **Sign Up** (it's free!)
3. Verify your email

### 2. Add Email Service

1. In EmailJS dashboard, click **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or any email provider)
4. Follow prompts to connect your `techascendconsulting@gmail.com` account
5. Copy the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template

1. In EmailJS dashboard, click **Email Templates**
2. Click **Create New Template**
3. Set **Template Name**: `Help Request Notification`
4. **Template Content:**

```
Subject: 🆘 {{issue_type}} Issue from BA WorkXP - {{page_title}}

From: {{from_name}} ({{from_email}})
Page: {{page_title}} ({{page_context}})
Issue Type: {{issue_type}}
Time: {{timestamp}}

Issue Description:
{{question}}

---
This was submitted via Verity Report Issue feature.
```

5. Click **Save**
6. Copy the **Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key

1. In EmailJS dashboard, go to **Account** → **General**
2. Find **Public Key** (e.g., `AbCdEfGh123456`)
3. Copy it

### 5. Add to .env.local

Add these three lines to your `.env.local` file:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=AbCdEfGh123456
```

Replace with your actual IDs from steps 2, 3, and 4.

### 6. Restart Dev Server

```bash
# Stop current server
pkill -f "vite"

# Start fresh
npm run dev
```

## ✅ Test It

1. Open your app (http://localhost:5173)
2. Click **Ask Verity** → Switch to **⚠️ Report Issue** tab
3. Type a test issue
4. Click **Submit Issue**
5. Check console for: `✅ Email notification sent to Tech Ascend Consulting`
6. Check your email at `techascendconsulting@gmail.com`

## 📧 Email You'll Receive

```
From: admin@batraining.com
Subject: 🆘 technical Issue from BA WorkXP - Scrum Practice

From: admin@batraining.com (admin@batraining.com)
Page: Scrum Practice (scrum-practice)
Issue Type: technical
Time: Oct 7, 2025, 10:30 PM

Issue Description:
The save button isn't working on the backlog page

---
This was submitted via Verity Report Issue feature.
```

## 🔧 Troubleshooting

**Console shows "EmailJS not configured"?**
- Check `.env.local` has all three variables
- Restart dev server after adding them
- Verify variable names match exactly

**Email not arriving?**
- Check EmailJS dashboard for send logs
- Verify Gmail service is connected properly
- Check spam folder
- Ensure EmailJS free tier limit not exceeded (200 emails/month)

## 💰 Cost

- **EmailJS Free Tier**: 200 emails/month (perfect for your use case)
- No credit card required
- Upgrade available if needed

## 🎯 Benefits

✅ Works from localhost immediately  
✅ No server-side deployment needed  
✅ Reliable delivery to Gmail  
✅ Simple 5-minute setup  
✅ Free for reasonable usage  

