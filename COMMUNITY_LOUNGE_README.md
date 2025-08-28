# Community Lounge - Setup Guide

## 🎯 Overview

The Community Lounge is a modern, AI-powered community platform integrated into the BA Training Platform. It features:

- **Posts & Replies**: Threaded discussions with emoji reactions
- **AI Integration**: Smart replies and daily inspirational quotes
- **Categories**: Process Mapping, Requirements, Interview Prep, Agile, Stakeholders
- **Modern UI**: Silicon Valley-inspired design with Tailwind CSS
- **Moderation**: Content reporting and flagging system
- **Engagement Tracking**: User stats and activity metrics

## 🚀 Quick Setup

### 1. Database Setup

Run the migration to create all necessary tables:

```sql
-- Apply the migration
\i supabase/migrations/20250127000000_community_lounge.sql
```

This creates:
- `forum_posts` - Main posts with categories and engagement tracking
- `forum_replies` - Threaded replies with AI generation support
- `forum_reactions` - Emoji reactions system
- `forum_post_tags` - Tag system for better categorization
- `forum_reports` - Content moderation system
- `forum_user_stats` - User engagement tracking

### 2. Deploy Edge Functions

Deploy the AI functions to Supabase:

```bash
# Deploy forum-ai function
supabase functions deploy forum-ai

# Deploy daily-quote function
supabase functions deploy daily-quote
```

### 3. Configure Environment Variables

Add to your `.env` file:

```env
# Supabase Edge Functions
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for enhanced AI features)
OPENAI_API_KEY=your_openai_key
```

### 4. Schedule Daily Quotes

Set up a cron job to post daily inspirational quotes:

```bash
# Using Supabase Scheduler (recommended)
supabase db function create daily_quote_scheduler
```

Or manually trigger:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/daily-quote
```

## 📁 File Structure

```
src/
├── components/
│   ├── Views/
│   │   └── CommunityLoungeView.tsx          # Main community page
│   ├── lounge/
│   │   ├── PostComposer.tsx                 # Post creation form
│   │   ├── PostCard.tsx                     # Individual post display
│   │   ├── ReplyList.tsx                    # Threaded replies
│   │   ├── ReactionBar.tsx                  # Emoji reactions
│   │   └── Sidebar.tsx                      # Community sidebar
│   └── ui/
│       └── Avatar.tsx                       # User avatars
├── contexts/
│   └── AppContext.tsx                       # Updated with community-lounge route
└── types/
    └── index.ts                             # Updated AppView type

supabase/
├── migrations/
│   └── 20250127000000_community_lounge.sql  # Database schema
└── functions/
    ├── forum-ai/
    │   └── index.ts                         # AI reply generation
    └── daily-quote/
        └── index.ts                         # Daily inspirational quotes
```

## 🎨 Features

### Core Functionality

1. **Post Creation**
   - Rich text composer with category selection
   - Tag system (up to 5 tags per post)
   - Character limits and validation

2. **Threaded Discussions**
   - Nested replies with proper indentation
   - AI-generated replies with 🤖 badge
   - Inline reply composer

3. **Engagement System**
   - 5 default emoji reactions (👍 🎉 🤔 😂 ❤️)
   - Click-to-toggle functionality
   - Real-time reaction counts

4. **Content Moderation**
   - Report inappropriate content
   - Admin flagging system
   - Reason-based reporting

### AI Integration

1. **Smart Replies**
   - Context-aware responses based on post category
   - Process mapping tips and best practices
   - Requirements gathering guidance
   - Interview preparation advice

2. **Daily Quotes**
   - 20+ inspirational BA quotes
   - Automated daily posting
   - System-generated posts

### Categories

- **Process Mapping**: BPMN, workflows, diagrams
- **Requirements**: User stories, acceptance criteria
- **Interview Prep**: Job hunting, portfolio building
- **Agile**: Scrum, sprint planning, backlog management
- **Stakeholders**: Communication, meetings, workshops

## 🔧 Configuration

### Customization Options

1. **Categories**: Modify in `CommunityLoungeView.tsx`
2. **AI Responses**: Update logic in `forum-ai/index.ts`
3. **Daily Quotes**: Add quotes in `daily-quote/index.ts`
4. **Reactions**: Change default emojis in `ReactionBar.tsx`

### Styling

The UI uses modern Silicon Valley design principles:
- Rounded corners (`rounded-2xl`)
- Subtle shadows and hover effects
- Violet/purple gradient theme
- Responsive design for mobile/desktop

## 📊 Analytics

Track community engagement with:

```sql
-- Daily active users
SELECT COUNT(DISTINCT user_id) 
FROM forum_user_stats 
WHERE last_activity >= NOW() - INTERVAL '1 day';

-- Posts per category
SELECT category, COUNT(*) 
FROM forum_posts 
GROUP BY category;

-- Most engaged users
SELECT user_id, posts_count + replies_count as total_activity
FROM forum_user_stats 
ORDER BY total_activity DESC;
```

## 🚨 Troubleshooting

### Common Issues

1. **Edge Functions Not Working**
   - Check environment variables
   - Verify Supabase project settings
   - Check function logs in Supabase dashboard

2. **Database Permissions**
   - Ensure RLS policies are correct
   - Check user authentication
   - Verify table access permissions

3. **AI Replies Not Generating**
   - Check OpenAI API key
   - Verify function deployment
   - Check network connectivity

### Debug Mode

Enable debug logging:

```typescript
// In CommunityLoungeView.tsx
console.log('Loading posts:', posts);
console.log('User reactions:', reactions);
```

## 🎯 Next Steps

### Phase 2 Enhancements

1. **Advanced AI Features**
   - Post improvement suggestions
   - Weekly community summaries
   - Personalized recommendations

2. **Gamification**
   - User badges and achievements
   - Reputation system
   - Leaderboards

3. **Integration**
   - Share process diagrams from Process Mapper
   - Link to training content
   - Portfolio showcase integration

4. **Mobile App**
   - Push notifications
   - Offline reading
   - Native mobile experience

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase function logs
3. Test with minimal data first
4. Verify all environment variables

---

**Community Lounge** - Building connections, sharing knowledge, growing together! 🚀
