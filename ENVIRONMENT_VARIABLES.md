# Environment Variables Configuration

## Backend Variables (Vercel/Server)

### Required for API Functions
```bash
# OpenAI API Key (server-side ONLY)
OPENAI_API_KEY=sk-...
```

**IMPORTANT:** This must be set in Vercel dashboard under Settings > Environment Variables

## Frontend Variables (React + Vite)

### Supabase Configuration
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Other Services
```bash
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
# Add other VITE_ prefixed variables as needed
```

## Migration Notes

### ❌ REMOVED (No longer needed)
```bash
# DO NOT USE - Security risk
# VITE_OPENAI_API_KEY=sk-...  ❌ DELETE THIS
```

The `VITE_OPENAI_API_KEY` variable has been removed for security. All OpenAI API calls now go through secure backend endpoints at `/api/*`.

### ✅ UPDATED (New secure approach)
```bash
# In Vercel dashboard only
OPENAI_API_KEY=sk-...
```

## Local Development

1. Create a `.env` file in the project root
2. Add backend variables (no VITE_ prefix):
   ```bash
   OPENAI_API_KEY=sk-...
   ```
3. Add frontend variables (with VITE_ prefix):
   ```bash
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Restart dev server after changes

## Vercel Deployment

1. Go to Vercel dashboard > Your Project > Settings > Environment Variables
2. Add:
   - `OPENAI_API_KEY` = `sk-...`
   - `VITE_SUPABASE_URL` = `https://...`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`
3. Set scope: Production, Preview, Development
4. Redeploy to apply changes

## Security Checklist

- [ ] `OPENAI_API_KEY` is NOT prefixed with `VITE_`
- [ ] `OPENAI_API_KEY` is set in Vercel (not in frontend code)
- [ ] No `import.meta.env.VITE_OPENAI_API_KEY` references in code
- [ ] No `dangerouslyAllowBrowser: true` in OpenAI client
- [ ] All AI features use `/api/*` endpoints
- [ ] `.env` file is in `.gitignore`


