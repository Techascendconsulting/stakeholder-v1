# Stable Progress Tracking System

This implementation provides a robust, version-aware progress tracking system that prevents progress resets when content is updated.

## Key Concepts

### Stable Keys
- **Never change once published** - These are permanent identifiers for content units
- Format: `{PREFIX}_{SLUG}` (e.g., `MOD_BA_FOUNDATIONS`, `LES_REQUIREMENTS_INTRO`, `TOP_USER_STORIES_BASICS`)
- Automatically generated from titles during backfill

### Content Versions
- Start at 1, increment only for breaking changes
- Users see "stale" status when version bumps (unless completed and `carryForwardOnVersionBump` is true)
- Allows content updates without resetting user progress

### Unit Types
- **Module**: Top-level organizational unit
- **Lesson**: Mid-level unit (belongs to a module)
- **Topic**: Leaf-level unit (belongs to a lesson)

## Setup

### 1. Run the Database Migration

Apply the SQL migration in Supabase Dashboard or CLI:

```bash
# The migration file is in:
supabase/migrations/2025-11-07_stable_keys.sql
```

This creates:
- `modules`, `lessons`, `topics` tables with stable_key fields
- `user_progress` table (generic for all unit types)
- RLS policies for security
- Triggers for auto-updating timestamps

### 2. Install Dependencies

```bash
npm install
```

The `tsx` package is already added to devDependencies for running TypeScript scripts.

### 3. Set Environment Variables

Ensure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Only for backfill script
```

**Warning**: Never commit the service role key or use it in client code!

### 4. Backfill Existing Data (If Applicable)

If you have existing modules/lessons/topics without stable_key values:

```bash
npm run backfill:stable
```

This script will:
- Generate stable_key for any unit missing one
- Use title to create a stable slug
- Update database records

## Usage

### Basic Example - Topic View

```tsx
import { useProgress } from '../hooks/useProgress';

function MyTopicPage() {
  const unit = {
    unitType: 'topic' as const,
    stableKey: 'TOP_USER_STORIES_BASICS',
    contentVersion: 1
  };
  
  const { loading, progress, setPercent, complete } = useProgress(unit);
  
  // Update progress as user scrolls/interacts
  const handleScroll = () => {
    const percentScrolled = calculateScrollPercent();
    setPercent(percentScrolled);
  };
  
  // Mark complete when done
  const handleComplete = () => {
    complete();
  };
  
  return (
    <div>
      {progress?.status === 'stale' && (
        <div className="alert">
          Content updated - please review
        </div>
      )}
      <div>Progress: {progress?.percent ?? 0}%</div>
      {/* Your content here */}
    </div>
  );
}
```

### Computing Lesson/Module Completion

```tsx
import { getLessonCompletion, getModuleCompletion } from '../services/rollup';

// In your component
const lessonProgress = await getLessonCompletion(userId, 'LES_REQUIREMENTS_INTRO');
// Returns: { percent: 75, completed: false }

const moduleProgress = await getModuleCompletion(userId, 'MOD_BA_FOUNDATIONS');
// Returns: { percent: 100, completed: true }
```

### Saving Specific Position (e.g., Video Time)

```tsx
// Save video position every 10 seconds
setPercent(50, { time: 123.4, page: 'intro' });

// Later, resume from saved position
const lastPos = progress?.last_position;
if (lastPos?.time) {
  videoPlayer.seekTo(lastPos.time);
}
```

## Content Authoring Rules

### ✅ Safe Changes (No Progress Reset)
- Edit title
- Update content text/HTML
- Change position/ordering
- Toggle is_published

### ⚠️ Breaking Changes (Requires Version Bump)
- Major content restructure
- Completely different learning objectives
- New assessment format

When making breaking changes:

```sql
UPDATE topics 
SET content_version = content_version + 1 
WHERE stable_key = 'TOP_USER_STORIES_BASICS';
```

Users who previously completed will see "stale" status and can review (or will auto-keep completion if `carryForwardOnVersionBump` is enabled).

## API Reference

### `useProgress(unit: ContentUnitRef)`

**Returns:**
- `loading: boolean` - Loading state
- `userId: string | null` - Current authenticated user
- `progress: UserProgress | null` - User's progress for this unit
- `setPercent: (percent: number, lastPosition?: any) => Promise<void>` - Update progress
- `complete: () => Promise<void>` - Mark unit as 100% complete

### `upsertProgress(opts)`

**Options:**
- `userId: string` - User ID (required)
- `unit: ContentUnitRef` - Unit reference (required)
- `percent?: number` - Progress percentage 0-100
- `lastPosition?: any` - JSON object with custom position data
- `forceComplete?: boolean` - Force completion regardless of percent
- `carryForwardOnVersionBump?: boolean` - Keep completion on version bump (default: true)

### `getUnitProgress(userId, unit)`

Fetches progress for a single unit.

### `markCompleted(userId, unit)`

Shorthand for setting progress to 100%.

### `getLessonCompletion(userId, lessonStableKey)`

Computes rollup completion across all topics in a lesson.

### `getModuleCompletion(userId, moduleStableKey)`

Computes rollup completion across all lessons in a module.

## Database Schema

### `modules`
- `id` (uuid, PK)
- `stable_key` (text, unique, never change!)
- `title` (text)
- `content` (jsonb)
- `content_version` (int, default 1)
- `position` (int, for ordering)
- `is_published` (boolean)

### `lessons`
- `id` (uuid, PK)
- `module_id` (uuid, FK → modules)
- `stable_key` (text, unique)
- `title`, `content`, `content_version`, `position`, `is_published`

### `topics`
- `id` (uuid, PK)
- `lesson_id` (uuid, FK → lessons)
- `stable_key` (text, unique)
- `title`, `content`, `content_version`, `position`, `is_published`

### `user_progress`
- `user_id` (uuid)
- `unit_type` (enum: module, lesson, topic)
- `stable_key` (text, points to module/lesson/topic)
- `content_version` (int, version user last engaged)
- `status` (enum: not_started, in_progress, completed, stale)
- `percent` (numeric, 0-100)
- `last_position` (jsonb, custom data)
- `completed_at` (timestamp)
- **Unique constraint**: (user_id, unit_type, stable_key)

## Troubleshooting

### Progress keeps resetting
- Verify `stable_key` is not changing between renders
- Check that `content_version` matches database
- Ensure RLS policies allow user to read/write their progress

### "Stale" status appearing unexpectedly
- Check if `content_version` was bumped in database
- If intentional, users should re-review content
- If not, revert version or use `carryForwardOnVersionBump: true`

### Backfill script fails
- Ensure `VITE_SUPABASE_SERVICE_ROLE_KEY` is set
- Check that tables exist (run migration first)
- Verify stable_key column is nullable initially

## Next Steps

1. **Apply this to existing views**: Replace any hardcoded progress tracking with `useProgress` hook
2. **Seed content**: Add your actual modules/lessons/topics with proper stable_keys
3. **Test version bumps**: Increment a content_version and verify user sees "stale" banner
4. **Add UI indicators**: Show progress bars, completion badges, etc.
5. **Implement resume**: Use `last_position` to let users resume where they left off

















