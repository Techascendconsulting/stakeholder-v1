# MVP Builder Debug Guide

## 🔍 Debugging Steps

### 1. Check Browser Console
Open Developer Tools (F12) and look for these logs:
- `🔍 MVP Builder - Testing connection...`
- `🔍 Connection test result:`
- `🔄 MVP Builder - Loading epics for project:`
- `✅ MVP Builder - Epics loaded:`

### 2. Run SQL Diagnostics
Copy and run these SQL scripts in Supabase SQL Editor:

#### Quick Check:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('epics', 'stories', 'acceptance_criteria', 'mvp_flows');
```

#### Detailed Check:
Run the content from `CHECK_MVP_DETAILED.sql` for comprehensive diagnostics.

### 3. Common Issues & Solutions

#### Issue: "No Project Selected" (Most Common)
**Solution**: Select a project first
1. Go back to the main dashboard
2. Select or create a project
3. Return to MVP Builder
4. The MVP Builder requires a project to work

#### Issue: "Tables don't exist"
**Solution**: Run the migration
1. Copy content from `MVP_BUILDER_MIGRATION_FIXED.sql`
2. Run in Supabase SQL Editor
3. Refresh the page

#### Issue: "No projects found"
**Solution**: Create a project first
1. Go to the main app
2. Create a new project
3. Return to MVP Builder

#### Issue: "RLS policies missing"
**Solution**: Re-run the migration
1. The migration includes RLS policies
2. Make sure you run the complete migration

#### Issue: "Authentication failed"
**Solution**: Check user login
1. Make sure you're logged in
2. Check if user has proper permissions

### 4. Debug Information

The MVP Builder now shows debug info in the setup message:
- Project ID
- Loading status
- Number of epics found

### 5. Console Logs to Look For

**Success logs:**
```
🔍 MVP Builder - Testing connection...
🔍 Connection test result: {success: true, message: "MVP Builder connection successful"}
🔄 MVP Builder - Loading epics for project: [project-id]
✅ MVP Builder - Epics loaded: [array of epics]
```

**Error logs:**
```
❌ MVP Builder - Connection failed: [error message]
❌ MVP Builder - Database tables not found. Migration may not have run successfully.
```

### 6. Next Steps

1. **Check console logs** - Look for the specific error message
2. **Run SQL diagnostics** - Use the provided SQL scripts
3. **Verify migration** - Make sure all tables were created
4. **Check projects** - Ensure you have at least one project
5. **Test connection** - The new connection test will show exactly what's wrong

## Files to Check

- `CHECK_MVP_DETAILED.sql` - Comprehensive diagnostic
- `MVP_BUILDER_MIGRATION_FIXED.sql` - Migration script
- Browser console - For detailed error messages
- Supabase dashboard - For table existence

## Support

If issues persist, check:
1. Browser console for specific error messages
2. Supabase logs for database errors
3. Network tab for failed requests
4. Authentication status
