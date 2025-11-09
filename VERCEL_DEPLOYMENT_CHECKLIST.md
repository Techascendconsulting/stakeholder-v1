# Vercel Deployment Checklist

## Issue: "I don't see anything in Vercel"

Your code is pushed to staging (`7fa5dcd2`), but Vercel needs configuration.

---

## Step 1: Check Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Find your project: **stakeholder-v1**
3. Check if staging branch is deployed

---

## Step 2: Set Environment Variable (CRITICAL)

The API functions won't work without this:

### In Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-your-actual-key` (your OpenAI API key)
   - **Environment:** Check all boxes (Production, Preview, Development)
3. Click **Save**

**IMPORTANT:** The `vercel.json` references `@openai-api-key` which needs to be set in Vercel's dashboard.

---

## Step 3: Check Branch Deployment Settings

### In Vercel Dashboard:
1. Go to **Settings** → **Git**
2. Check **Production Branch:** Should be `main`
3. Check if **staging** branch auto-deploys as Preview
4. If staging isn't deploying:
   - Go to **Settings** → **Git** → **Deploy Hooks**
   - Or manually trigger: **Deployments** → **Redeploy**

---

## Step 4: Trigger Deployment

### Option A: Via Dashboard
1. Go to **Deployments** tab
2. Find staging deployment (or create one)
3. Click **Redeploy**

### Option B: Via CLI (if installed)
```bash
vercel --prod  # For production (main branch)
vercel         # For preview (staging branch)
```

### Option C: Push again to trigger
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin staging
```

---

## Step 5: Check Deployment Logs

After deploying:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check **Build Logs** for errors
4. Look for:
   - ✅ "Build completed"
   - ✅ "Deployment ready"
   - ❌ Any errors about missing dependencies or environment variables

---

## Common Issues

### Issue: "Build failed"
**Solution:** Check build logs for specific error
- Missing dependencies? Run `npm install`
- TypeScript errors? Check `npm run typecheck`

### Issue: "API functions not working"
**Solution:** 
- Verify `OPENAI_API_KEY` is set in environment variables
- Check Functions tab in Vercel to see if `/api/*` routes deployed
- Check function logs for runtime errors

### Issue: "Module not found: openai"
**Solution:** Make sure `openai` is in `package.json` dependencies (it is)

### Issue: "Staging branch not deploying"
**Solution:**
- Go to Settings → Git
- Enable automatic deployments for all branches
- Or manually deploy from dashboard

---

## Verification

After deployment succeeds, test:

1. **Check URL:** Your Vercel URL (e.g., `stakeholder-v1-*.vercel.app`)
2. **Test API endpoint:**
   ```bash
   curl -X POST https://your-url.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"test"}]}'
   ```
3. **Should return:** JSON response (not 500 error)

---

## Quick Fix Commands

If you need to redeploy:
```bash
# Make sure you're on staging
git branch --show-current

# Push empty commit to trigger deployment
git commit --allow-empty -m "Trigger deployment"
git push origin staging
```

---

## Current Status

✅ Code pushed to staging: `7fa5dcd2`
✅ Vercel config present: `vercel.json`
⚠️ Need to verify: OPENAI_API_KEY in Vercel dashboard
⚠️ Need to check: Staging branch deployment settings

---

## Next Action

**Go to Vercel Dashboard NOW:**
1. Set `OPENAI_API_KEY` environment variable
2. Check if staging deployed automatically
3. If not, manually trigger deployment
4. Check build logs for any errors


