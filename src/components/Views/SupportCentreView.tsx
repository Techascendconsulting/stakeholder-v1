import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  Mic, 
  Save, 
  CreditCard, 
  Users, 
  RefreshCw,
  BookOpen,
  PlayCircle,
  Volume2,
  Coins,
  MessageSquare,
  Mail,
  ArrowRight,
  X,
  FileText,
  Zap,
  Brain,
  GraduationCap,
  Monitor,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Clock,
  Target,
  Lightbulb,
  TrendingUp,
  Star,
  Bookmark,
  ExternalLink,
  Filter,
  Grid,
  List,
  Sparkles,
  Award,
  Briefcase,
  Shield,
  Play,
  Book
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import FAQView from './FAQView';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  featured?: boolean;
  readTime: string;
}


const SupportCentreView: React.FC = () => {
  const { user } = useAuth();
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'help' | 'faq'>('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Helper function to parse inline markdown (bold, italic, code)
  const parseInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    let partIndex = 0;

    // Match **bold**, *italic*, and `code`
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      // Add the formatted text
      if (match[2]) {
        // Bold
        parts.push(<strong key={partIndex++} className="font-semibold text-gray-900 dark:text-white">{match[2]}</strong>);
      } else if (match[4]) {
        // Italic
        parts.push(<em key={partIndex++} className="italic text-gray-800 dark:text-gray-200">{match[4]}</em>);
      } else if (match[6]) {
        // Code
        parts.push(<code key={partIndex++} className="bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded text-sm font-mono text-purple-600 dark:text-purple-400">{match[6]}</code>);
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Comprehensive support articles based on codebase
  const supportArticles: Article[] = [
    // Getting Started - Featured
    {
      id: 'welcome-guide',
      title: 'Welcome to Your BA Training Platform',
      category: 'getting-started',
      content: `Welcome to the Business Analyst training platform! This comprehensive guide will help you get started with your learning journey.

## What You'll Learn
Our platform provides realistic work experience through AI-powered stakeholder conversations. You'll practice:
- **Stakeholder Elicitation**: Learn to ask the right questions
- **Process Analysis**: Understand current and future state processes
- **Solution Design**: Evaluate and design business solutions
- **Project Management**: Manage BA projects from start to finish

## Your Learning Path
1. **Training Hub**: Start with structured learning modules
2. **Practice Meetings**: Engage with AI stakeholders in realistic scenarios
3. **Real Projects**: Apply your skills to hands-on BA projects
4. **Portfolio Building**: Create deliverables for your professional portfolio

## Getting Started Steps
1. Navigate to the Training Hub from your dashboard
2. Choose your first learning module
3. Complete the pre-brief preparation
4. Start your first practice meeting
5. Review your feedback and improve

Remember: Practice makes perfect! Each session builds your confidence and skills.`,
      tags: ['beginner', 'onboarding', 'training'],
      lastUpdated: '2024-01-15',
      featured: true,
      readTime: '5 min read'
    },
    {
      id: 'dashboard-navigation',
      title: 'Understanding Your Dashboard',
      category: 'getting-started',
      content: `Your dashboard is your central hub for all learning activities. Here's how to navigate it effectively:

## Main Sections

### 🏠 Dashboard Overview
- **Learning Progress**: Track your completion across all modules
- **Recent Activity**: See your latest practice sessions and projects
- **Quick Actions**: Start new training or practice sessions

### 📚 Training Hub
- **Structured Learning**: Step-by-step BA fundamentals
- **Module Progression**: Unlock advanced topics as you complete basics
- **Assessment Gates**: Pass/fail criteria for advancement

### 🎯 Practice Mode
- **Stakeholder Meetings**: Practice with AI-powered stakeholders
- **Meeting Types**: Choose from voice, chat, or group sessions
- **Project Scenarios**: Work on realistic business problems

### 📁 Projects
- **Real BA Projects**: Apply skills to hands-on work
- **Deliverable Creation**: Build your professional portfolio
- **Process Documentation**: Create process maps and requirements

### 🤖 Verity AI Assistant
- **24/7 Help**: Get instant answers to BA questions
- **Guidance**: Receive coaching during practice sessions
- **Knowledge Base**: Access BA best practices and techniques

## Navigation Tips
- Use the left sidebar to quickly access different sections
- The "How to Navigate" button provides contextual help
- Your progress is automatically saved across all sessions`,
      tags: ['navigation', 'dashboard', 'interface'],
      lastUpdated: '2024-01-15',
      readTime: '8 min read'
    },

    // Meeting Types - Featured
    {
      id: 'voice-meetings',
      title: 'Voice Meetings with AI Stakeholders',
      category: 'meeting-types',
      content: `Voice meetings provide the most realistic stakeholder conversation experience using ElevenLabs AI voice synthesis.

## How Voice Meetings Work
- **Natural Speech**: AI stakeholders speak with human-like voices
- **Real-time Interaction**: Respond naturally to stakeholder questions
- **Audio Playback**: Listen to stakeholder responses through your speakers
- **Conversation Flow**: Natural turn-taking and realistic timing

## Getting Started with Voice
1. **Select a Project**: Choose from available business scenarios
2. **Pick Stakeholders**: Select relevant stakeholders for your meeting
3. **Choose Voice Mode**: Select "Voice Chat (ElevenLabs)" from meeting options
4. **Allow Microphone**: Grant browser permission for microphone access
5. **Start Speaking**: Begin your conversation naturally

## Best Practices
- **Speak Clearly**: Enunciate your words for better AI understanding
- **Natural Pacing**: Don't rush - speak at normal conversation speed
- **Context Setting**: Start by introducing yourself and the meeting purpose
- **Active Listening**: Pay attention to stakeholder responses before responding

## Troubleshooting Voice Issues
- **Microphone Not Working**: Check browser permissions and try refreshing
- **Audio Not Playing**: Ensure speakers are on and volume is up
- **Poor Audio Quality**: Try using Chrome or Edge for best compatibility
- **Connection Issues**: Check your internet connection stability

## Voice Meeting Features
- **Multiple Stakeholders**: Each stakeholder has a unique voice
- **Conversation History**: Full transcript is saved automatically
- **Meeting Controls**: Pause, resume, or stop audio as needed
- **Real-time Coaching**: Get AI nudges during your conversation`,
      tags: ['voice', 'meetings', 'elevenlabs', 'audio'],
      lastUpdated: '2024-01-15',
      featured: true,
      readTime: '6 min read'
    },
    {
      id: 'chat-meetings',
      title: 'Chat-Based Stakeholder Meetings',
      category: 'meeting-types',
      content: `Chat meetings offer text-based conversations with AI stakeholders, perfect for those who prefer typing or have audio restrictions.

## Chat Meeting Features
- **Text-Based Interaction**: Type your questions and responses
- **Real-time Responses**: Stakeholders respond instantly
- **Full Transcript**: Complete conversation history is maintained
- **Multi-Stakeholder Support**: Chat with multiple stakeholders simultaneously

## When to Use Chat Meetings
- **Audio Restrictions**: When you can't use voice (office environment, etc.)
- **Detailed Questions**: For complex questions requiring precise language
- **Documentation Focus**: When you need exact quotes and references
- **Accessibility**: Better for users with hearing difficulties

## Chat Meeting Tips
- **Be Specific**: Ask clear, focused questions
- **Use Follow-ups**: Build on previous responses with deeper questions
- **Take Notes**: Use the transcript to capture key information
- **Manage Multiple Stakeholders**: Address stakeholders by name when needed

## Chat vs Voice
| Feature | Chat | Voice |
|---------|------|-------|
| Interaction | Typing | Speaking |
| Speed | Instant | Natural pacing |
| Documentation | Built-in | Manual notes needed |
| Accessibility | High | Audio required |
| Realism | Good | Excellent |

## Getting the Most from Chat
- **Prepare Questions**: Have key questions ready before starting
- **Use Stakeholder Names**: Direct questions to specific people
- **Follow the Flow**: Let the conversation develop naturally
- **Review Transcript**: Use the saved conversation for reference`,
      tags: ['chat', 'text', 'meetings', 'accessibility'],
      lastUpdated: '2024-01-15',
      readTime: '5 min read'
    },

    // Training System - Featured
    {
      id: 'training-modules',
      title: 'Structured Training Modules',
      category: 'training-system',
      content: `Our structured training system guides you through essential BA skills with hands-on practice and real-time feedback.

## Training Module Structure

### 1. Problem Exploration
**Objective**: Learn to identify and analyze business problems
**Key Skills**:
- Pain point identification
- Impact assessment
- Stakeholder analysis
- Root cause analysis

**Must Cover Areas**:
- Top 3 business pains
- Affected teams and departments
- Business impact quantification
- Current workarounds
- Constraints and limitations

### 2. As-Is Process Analysis
**Objective**: Document and understand current business processes
**Key Skills**:
- Process mapping
- Actor identification
- System analysis
- Data flow documentation

**Must Cover Areas**:
- Process triggers and start points
- Key actors and their roles
- Systems and tools used
- Data fields and information flow
- Process exceptions and variations

### 3. To-Be Process Design
**Objective**: Design improved future state processes
**Key Skills**:
- Future state design
- Constraint analysis
- Change management planning
- Success metrics definition

**Must Cover Areas**:
- Desired outcomes and benefits
- Process constraints and limitations
- Success metrics and KPIs
- Dependencies and prerequisites
- Readiness assessment

### 4. Solution Design
**Objective**: Evaluate and design business solutions
**Key Skills**:
- Solution evaluation
- Risk assessment
- Implementation planning
- Cost-benefit analysis

**Must Cover Areas**:
- Solution options and alternatives
- Feasibility analysis
- Trade-offs and compromises
- Risk identification and mitigation
- Pilot planning and rollout strategy

## Training Session Format
- **Pre-Brief**: 5 minutes to review objectives and pin questions
- **Live Meeting**: 10 minutes of interactive practice
- **Post-Brief**: 5 minutes of feedback and improvement planning

## Assessment Criteria
- **Coverage**: Did you address all must-cover areas?
- **Technique**: Did you use proper BA questioning techniques?
- **Follow-ups**: Did you ask clarifying and probing questions?
- **Time Management**: Did you use time effectively?

## Progression System
- **Pass/Fail Gates**: Must demonstrate competency to advance
- **Skill Building**: Each module builds on previous learning
- **Real-world Application**: Practice with realistic scenarios
- **Portfolio Development**: Create deliverables for professional use`,
      tags: ['training', 'modules', 'assessment', 'progression'],
      lastUpdated: '2024-01-15',
      featured: true,
      readTime: '12 min read'
    },

    // Technical Issues
    {
      id: 'voice-troubleshooting',
      title: 'Voice Meeting Troubleshooting',
      category: 'technical-issues',
      content: `Voice meetings use advanced AI technology. Here are common issues and solutions:

## Microphone Issues
**Problem**: "Microphone not working" or "No audio input detected"

**Solutions**:
1. **Check Browser Permissions**: Click the lock icon in your address bar and allow microphone access
2. **Test Your Microphone**: Try speaking in another app to confirm it works
3. **Browser Compatibility**: Use Chrome, Edge, or Safari for best results
4. **Hardware Check**: Ensure microphone isn't muted or disconnected
5. **Refresh and Retry**: Sometimes a page refresh resolves permission issues

## Audio Playback Issues
**Problem**: Can't hear stakeholder responses

**Solutions**:
1. **Check Speaker Volume**: Ensure speakers are on and volume is adequate
2. **Audio Output**: Verify correct audio output device is selected
3. **Browser Audio**: Check browser audio settings and permissions
4. **Network Issues**: Ensure stable internet connection
5. **Try Different Browser**: Switch to Chrome or Edge if issues persist

## Poor Audio Quality
**Problem**: Choppy, delayed, or unclear audio

**Solutions**:
1. **Internet Connection**: Ensure stable, high-speed internet
2. **Close Other Applications**: Reduce bandwidth usage
3. **Browser Performance**: Close unnecessary tabs and extensions
4. **Hardware**: Use quality headphones or speakers
5. **Location**: Move to area with better internet connection

## Connection Timeouts
**Problem**: Meeting disconnects or times out

**Solutions**:
1. **Network Stability**: Check internet connection quality
2. **Firewall Settings**: Ensure platform isn't blocked
3. **Browser Cache**: Clear cache and cookies
4. **VPN Issues**: Try disconnecting VPN if in use
5. **Contact Support**: If issues persist, contact our support team

## Voice Recognition Issues
**Problem**: AI doesn't understand your speech

**Solutions**:
1. **Speak Clearly**: Enunciate words and speak at normal pace
2. **Reduce Background Noise**: Find quiet environment
3. **Microphone Quality**: Use good quality microphone
4. **Language Settings**: Ensure correct language is set
5. **Practice**: Voice recognition improves with consistent use

## Best Practices for Voice Meetings
- **Test Before Starting**: Always test microphone and speakers first
- **Quiet Environment**: Choose location with minimal background noise
- **Stable Connection**: Use reliable internet connection
- **Good Hardware**: Invest in quality microphone and speakers
- **Browser Choice**: Use Chrome or Edge for optimal performance`,
      tags: ['voice', 'troubleshooting', 'audio', 'microphone'],
      lastUpdated: '2024-01-15',
      readTime: '8 min read'
    },

    // Advanced Features
    {
      id: 'portfolio-building',
      title: 'Building Your BA Portfolio',
      category: 'advanced-features',
      content: `Use your practice sessions to build a professional portfolio that demonstrates your BA skills to employers.

## Portfolio Components

### 1. Process Documentation
**What to Include**:
- As-Is process maps from your practice sessions
- To-Be process designs
- Gap analysis documents
- Process improvement recommendations

**How to Create**:
- Use the process mapping tools during practice
- Export diagrams and documentation
- Add your analysis and recommendations
- Include stakeholder input and feedback

### 2. Requirements Documentation
**Types to Include**:
- Business requirements
- Functional requirements
- Non-functional requirements
- User stories and acceptance criteria

**Best Practices**:
- Use clear, unambiguous language
- Include traceability to business objectives
- Add stakeholder sign-off sections
- Include change management considerations

### 3. Stakeholder Analysis
**Documentation Types**:
- Stakeholder maps and matrices
- Communication plans
- Engagement strategies
- Influence/interest analysis

**Real Examples from Practice**:
- Customer Onboarding project stakeholder analysis
- Digital Expense Management communication plan
- Performance Management engagement strategy

### 4. Meeting Artifacts
**Valuable Documentation**:
- Meeting transcripts and summaries
- Action item lists
- Decision logs
- Follow-up communications

**Professional Presentation**:
- Clean, formatted transcripts
- Highlighted key decisions
- Clear action items with owners
- Professional summary sections

## Portfolio Organization

### Project-Based Structure
\`\`\`
Portfolio/
├── Customer Onboarding Optimization/
│   ├── Executive Summary
│   ├── Process Analysis
│   ├── Requirements Document
│   └── Implementation Plan
├── Digital Expense Management/
│   ├── Business Case
│   ├── Stakeholder Analysis
│   └── Solution Design
└── Support Ticket Management/
    ├── Current State Analysis
    ├── Future State Design
    └── Change Management Plan
\`\`\`

### Skill-Based Structure
\`\`\`
Portfolio/
├── Process Analysis/
├── Requirements Gathering/
├── Stakeholder Management/
├── Solution Design/
└── Change Management/
\`\`\`

## Portfolio Tips

### Quality Over Quantity
- Focus on 3-5 strong examples
- Choose diverse project types
- Demonstrate different BA skills
- Show progression and improvement

### Professional Presentation
- Use consistent formatting
- Include executive summaries
- Add visual elements (charts, diagrams)
- Proofread for errors

### Context and Results
- Explain the business problem
- Show your analysis process
- Include stakeholder feedback
- Highlight measurable outcomes

### Continuous Improvement
- Update portfolio regularly
- Add new projects and skills
- Incorporate feedback
- Stay current with BA practices

## Portfolio Showcase

### For Job Applications
- Tailor examples to job requirements
- Highlight relevant skills and experience
- Include quantifiable results
- Show problem-solving approach

### For Interviews
- Prepare to discuss each example
- Practice explaining your process
- Anticipate follow-up questions
- Demonstrate learning and growth

### Online Presence
- Create professional LinkedIn profile
- Share insights and learnings
- Engage with BA community
- Build professional network

## Portfolio Maintenance
- **Regular Updates**: Add new work monthly
- **Version Control**: Keep track of improvements
- **Backup Copies**: Store in multiple locations
- **Feedback Integration**: Incorporate suggestions
- **Skill Development**: Continuously improve examples`,
      tags: ['portfolio', 'career', 'documentation', 'professional'],
      lastUpdated: '2024-01-15',
      featured: true,
      readTime: '15 min read'
    },

    // Training System - Detailed
    {
      id: 'pre-brief-preparation',
      title: 'Pre-Brief: Preparing for Practice Sessions',
      category: 'training-system',
      content: `The Pre-Brief is your opportunity to prepare for structured practice sessions and set yourself up for success.

## What is Pre-Brief?

Pre-Brief is a preparation phase before live practice meetings where you:
- Review session objectives
- Understand must-cover items
- Pin key questions
- Set your coaching preferences

## Pre-Brief Components

### Session Objective
- **Clear Goal**: Understand what you need to achieve
- **Must-Cover Items**: Key topics you must address
- **Success Criteria**: What a successful session looks like
- **Time Limit**: Typically 10 minutes per session

### Question Pinning
- **Pin Up to 3 Questions**: Select your most important questions
- **Strategic Selection**: Choose questions that cover must-cover items
- **Visible During Session**: Pinned questions appear in your sidebar
- **Quick Reference**: Easy access during conversation

### Session Settings
- **Duration**: Usually 10-minute sessions
- **Turn Limit**: Maximum 16 turns for efficiency
- **Coach Mode**: Choose your AI coaching level
- **Stakeholder Selection**: Review who you'll meet with

## How to Use Pre-Brief Effectively

### 1. Read the Objective Carefully
- Understand the business context
- Note the stakeholder's perspective
- Identify key pain points or goals

### 2. Review Must-Cover Items
- Prioritize items by importance
- Plan your questioning approach
- Consider follow-up questions

### 3. Pin Strategic Questions
- **Opening Question**: Start the conversation well
- **Core Questions**: Address must-cover items
- **Closing Question**: Wrap up effectively

### 4. Set Your Coaching Preference
- **Full Coaching**: Maximum guidance and nudges
- **Minimal Coaching**: Only critical alerts
- **No Coaching**: Test yourself without help

## Pro Tips

### Question Crafting
- Use **open-ended questions** (How, What, Why)
- Avoid yes/no questions
- Focus on understanding, not solutions
- Ask about impact and context

### Time Management
- Plan to cover all must-items
- Don't spend too long on one topic
- Leave time for follow-ups
- Watch the turn counter

### Mental Preparation
- Take a deep breath
- Review stakeholder profile
- Think about their perspective
- Be ready to listen actively`,
      tags: ['training', 'preparation', 'practice', 'planning'],
      lastUpdated: '2024-01-15',
      readTime: '7 min read'
    },
    {
      id: 'post-brief-debrief',
      title: 'Post-Brief & Debrief Analysis',
      category: 'training-system',
      content: `After each practice session, you receive a comprehensive debrief with AI-powered analysis of your performance.

## What is Post-Brief?

Post-Brief is your detailed feedback session that includes:
- **Coverage Analysis**: What you covered vs. what you missed
- **Technique Assessment**: How well you used BA techniques
- **Pass/Fail Determination**: Whether you met the objectives
- **Next-Time Scripts**: Specific improvements for next session

## Debrief Components

### Coverage Heatmap
Visual representation of your coverage across must-cover items:
- **Green**: Fully covered (good depth and breadth)
- **Yellow**: Partially covered (mentioned but shallow)
- **Red**: Not covered (missed completely)

### Technique Assessment

**Open-Ended Questions**
- Percentage of questions that were open-ended
- Examples of good and poor questions
- Tips for improvement

**Follow-Up Questions**
- How well you probed deeper
- Quality of your follow-ups
- Opportunities you missed

**Active Listening**
- Evidence of listening to stakeholder
- Building on previous answers
- Acknowledging concerns

### Coverage Details

For each must-cover item:
- **What You Asked**: Your specific questions
- **What Was Said**: Stakeholder's responses
- **Depth Score**: How thoroughly you explored
- **Missing Elements**: What you didn't ask about

## Pass/Fail Criteria

### Passing Requirements
- **75%+ coverage** of must-cover items
- **50%+ open-ended questions**
- **Effective follow-ups** demonstrated
- **All critical items** addressed

### Common Failure Reasons
- Missed critical must-cover items
- Too many closed (yes/no) questions
- No follow-up questions asked
- Jumped to solutions too early
- Poor time management

## Next-Time Scripts

AI-generated improvement scripts including:

### What Worked Well
- Specific techniques you used effectively
- Good questions you asked
- Positive behaviors to repeat

### What to Improve
- Specific areas that need work
- Better questions you could have asked
- Techniques to practice

### Action Items
- **Practice**: Specific skills to work on
- **Prepare**: Better questions for next time
- **Review**: Concepts to study further

## How to Use Debrief Effectively

### 1. Review Coverage First
- Understand what you missed
- Note why you missed it
- Plan how to cover it next time

### 2. Analyze Your Technique
- Look at question quality
- Check follow-up patterns
- Assess listening skills

### 3. Read All Feedback
- Don't skip past failures
- Understand the "why"
- Internalize the lessons

### 4. Create an Action Plan
- Note top 3 improvements
- Write better questions
- Practice weak techniques

### 5. Retry if Needed
- Don't be afraid to retry
- Apply your learnings
- Track your improvement

## Improvement Strategies

### For Coverage Issues
- **Pin better questions** in pre-brief
- **Use checklist** of must-cover items
- **Track coverage** during conversation
- **Ask broader questions** initially

### For Technique Issues
- **Practice open-ended questions** beforehand
- **Always ask "why"** and "how"
- **Listen actively** to responses
- **Follow up on every answer**

### For Time Management
- **Start with most important items**
- **Don't get stuck on one topic**
- **Watch the turn counter**
- **Summarize and move on**

## Retrying Sessions

If you don't pass:
1. **Review your debrief thoroughly**
2. **Write new pinned questions**
3. **Practice the weak areas**
4. **Retry with fresh approach**
5. **Apply specific feedback**

Remember: **Failure is feedback, not final**. Each attempt builds your skills!`,
      tags: ['training', 'feedback', 'assessment', 'improvement'],
      lastUpdated: '2024-01-15',
      readTime: '10 min read'
    },
    {
      id: 'training-stages',
      title: 'Training Stages & Learning Path',
      category: 'training-system',
      content: `Our structured training system guides you through four core BA stages, each building on the last.

## Training Stage Overview

### Stage 1: Problem Exploration
**Focus**: Understanding business problems and stakeholder needs

**Must-Cover Items**:
- Top 3 pain points affecting the business
- Teams and people affected
- Business impact (cost, time, quality)
- Current workarounds
- Constraints and limitations

**Skills Developed**:
- Pain point identification
- Impact assessment
- Stakeholder analysis
- Root cause exploration
- Priority determination

### Stage 2: As-Is Process Analysis
**Focus**: Documenting current processes and inefficiencies

**Must-Cover Items**:
- Process triggers (what starts it)
- Actors involved (who does what)
- Systems used (technology involved)
- Data fields and information
- Exceptions and edge cases

**Skills Developed**:
- Process mapping
- Actor identification
- System analysis
- Exception handling
- Documentation skills

### Stage 3: To-Be Process Design
**Focus**: Designing future state processes

**Must-Cover Items**:
- Desired outcomes
- Design constraints
- Success metrics
- Dependencies on other systems
- Organizational readiness

**Skills Developed**:
- Future state design
- Constraint analysis
- Change management awareness
- Metric definition
- Feasibility assessment

### Stage 4: Solution Design
**Focus**: Evaluating and designing solution options

**Must-Cover Items**:
- Solution options available
- Feasibility of each option
- Trade-offs and compromises
- Implementation risks
- Pilot/rollout planning

**Skills Developed**:
- Solution evaluation
- Risk assessment
- Trade-off analysis
- Implementation planning
- Stakeholder buy-in

## Progression System

### Unlocking Stages
- **Start with Stage 1**: Everyone begins here
- **Pass to Progress**: Must pass current stage to unlock next
- **Build Foundation**: Each stage builds on previous skills
- **Retake Anytime**: Can retry stages for better scores

### Session Structure
Each stage follows the same flow:
1. **Pre-Brief**: Prepare and pin questions (3-5 min)
2. **Live Session**: Practice with AI stakeholder (10 min)
3. **Post-Brief**: Review debrief and feedback (5-10 min)

### Scoring & Assessment
- **Coverage Score**: 0-100% of must-cover items
- **Technique Score**: Quality of questions and techniques
- **Pass Threshold**: 75% overall to advance
- **Excellence Threshold**: 90%+ for mastery

## AI Coaching During Sessions

### Real-Time Nudges
The AI coach provides guidance during sessions:

**Silence Detection**
- Alerts when conversation stalls (>15 seconds)
- Suggests getting the conversation flowing
- Prevents awkward silence

**Closed Question Alerts**
- Flags yes/no questions
- Encourages open-ended questions
- Shows better alternatives

**Early Solutioning Detection**
- Warns when jumping to solutions
- Reminds to understand problem first
- Redirects to discovery questions

**Coverage Reminders**
- Tracks must-cover items
- Alerts about missed topics
- Suggests questions for coverage

### Coaching Levels
- **Full Coaching**: All nudges and suggestions
- **Minimal Coaching**: Only critical alerts
- **No Coaching**: Self-assessment mode

## Best Practices by Stage

### Problem Exploration Tips
- **Ask about pain first**: Understand what hurts
- **Quantify impact**: Get numbers (time, cost, people)
- **Explore workarounds**: Current coping mechanisms
- **Understand urgency**: Why now? Why important?

### As-Is Analysis Tips
- **Map the flow**: Understand sequence of steps
- **Identify actors**: Who does what, when
- **Note systems**: Technology involved
- **Find exceptions**: When does it break?

### To-Be Design Tips
- **Focus on outcomes**: What should happen?
- **Understand constraints**: What limits the design?
- **Define success**: How will we measure it?
- **Check readiness**: Is the org ready for change?

### Solution Design Tips
- **Explore options**: Multiple solutions
- **Assess feasibility**: What's realistic?
- **Identify trade-offs**: No perfect solution
- **Plan rollout**: How to implement safely?

## Tracking Your Progress

### Progress Dashboard
View your overall training progress:
- Stages completed
- Current scores
- Time spent practicing
- Skills mastered

### Skill Development
Track improvement in:
- Question quality
- Coverage thoroughness
- Follow-up technique
- Active listening

### Retry Strategy
- Review failed sessions carefully
- Focus on missed must-cover items
- Improve question quality
- Practice weak techniques`,
      tags: ['training', 'stages', 'progression', 'learning-path'],
      lastUpdated: '2024-01-15',
      featured: true,
      readTime: '12 min read'
    },

    // MVP Builder & Agile
    {
      id: 'mvp-builder-guide',
      title: 'MVP Builder: Creating Agile Projects',
      category: 'projects',
      content: `The MVP Builder helps you create and manage Agile projects with epics, user stories, sprints, and acceptance criteria.

## What is MVP Builder?

MVP Builder is a comprehensive Agile project management tool where you:
- Create product backlogs
- Write user stories with acceptance criteria
- Plan sprints
- Manage epics and features
- Track project progress

## Getting Started

### Creating Your First Project
1. Navigate to **MVP Builder** from Projects menu
2. Click **"Create New Project"**
3. Enter project details:
   - **Project Name**: Clear, descriptive name
   - **Description**: Project overview and goals
   - **Target Date**: Expected completion
   - **Team Size**: Number of team members

### Project Structure

**Epics**
- Large features or initiatives
- Contain multiple user stories
- Represent major functionality
- Track overall progress

**User Stories**
- Specific user requirements
- Written in user voice
- Contain acceptance criteria
- Estimable and testable

**Sprints**
- Time-boxed iterations (usually 2 weeks)
- Contain selected stories
- Have sprint goals
- Deliver working increments

## Writing User Stories

### Story Format
\`\`\`
As a [type of user]
I want [some goal]
So that [some reason/benefit]
\`\`\`

### Good Story Example
\`\`\`
As a customer
I want to filter products by price range
So that I can find items within my budget
\`\`\`

### Story Components
- **Title**: Brief description
- **User Type**: Who needs this?
- **Goal**: What do they want?
- **Benefit**: Why do they want it?
- **Acceptance Criteria**: How to test it?

## Acceptance Criteria

### GIVEN-WHEN-THEN Format
\`\`\`
GIVEN [initial context]
WHEN [event occurs]
THEN [expected outcome]
\`\`\`

### Example Criteria
\`\`\`
GIVEN I am on the product list page
WHEN I select price range \$50-\$100
THEN only products in that range are displayed
\`\`\`

### Quality Criteria
- **Specific**: Clear and unambiguous
- **Testable**: Can verify if met
- **Complete**: Covers all scenarios
- **Independent**: Standalone conditions

## Sprint Planning

### Creating a Sprint
1. Click **"New Sprint"** in MVP Builder
2. Set sprint details:
   - Sprint number/name
   - Start and end dates
   - Sprint goal
   - Capacity (story points)

### Adding Stories to Sprint
- Drag stories from backlog to sprint
- Estimate story points
- Ensure sprint isn't overloaded
- Prioritize must-have stories

### Sprint Management
- **Track Progress**: Monitor completed stories
- **Daily Standups**: Check blockers
- **Adjust Scope**: Remove if needed
- **Sprint Review**: Demo completed work

## Backlog Management

### Prioritization
- **Must Have**: Critical for release
- **Should Have**: Important but not critical
- **Could Have**: Nice to have
- **Won't Have**: Deferred to later

### Refinement
- Regular backlog grooming
- Clarify requirements
- Add acceptance criteria
- Estimate story points

### Story Sizing
- **Small (1-3 points)**: < 1 day work
- **Medium (5-8 points)**: 2-3 days work
- **Large (13+ points)**: > 1 week - break down!

## AI-Powered Features

### User Story Quality Check
AI analyzes your stories for:
- Proper format (As a... I want... So that...)
- Clear acceptance criteria
- Appropriate size
- Testability

### Story Suggestions
- Missing details highlighted
- Better phrasing recommended
- Acceptance criteria templates
- Similar story examples

### Sprint Health Check
- Overcommitment warnings
- Balance recommendations
- Dependency alerts
- Risk identification

## Best Practices

### Writing User Stories
- **Keep them small**: 1-3 days of work
- **User-focused**: Always from user perspective
- **Valuable**: Delivers user value
- **Testable**: Can verify completion

### Acceptance Criteria
- **3-5 criteria per story**: Not too few or many
- **Cover happy path**: Normal scenarios
- **Include edge cases**: Error conditions
- **Define "done"**: Clear completion

### Sprint Planning
- **Don't overcommit**: Leave buffer
- **Include bug fixes**: Allocate time
- **Balance work**: Mix of features/tech debt
- **Team capacity**: Account for vacations

## Deliverables Export

### What You Can Export
- Complete project backlog
- Sprint plans and summaries
- User story documents
- Acceptance criteria lists
- Epic overviews

### Export Formats
- **PDF**: Professional documents
- **Markdown**: Editable text
- **CSV**: Spreadsheet import
- **JSON**: Data interchange

### Portfolio Use
- Include in job applications
- Show project management skills
- Demonstrate Agile knowledge
- Prove hands-on experience`,
      tags: ['mvp', 'agile', 'projects', 'user-stories', 'sprints'],
      lastUpdated: '2024-01-15',
      featured: true,
      readTime: '14 min read'
    },
    {
      id: 'process-mapper-guide',
      title: 'Process Mapper: Creating BPMN Diagrams',
      category: 'advanced-features',
      content: `The Process Mapper is a powerful tool for creating professional BPMN (Business Process Model and Notation) diagrams with AI-powered assistance.

## What is Process Mapper?

A visual tool for documenting business processes using industry-standard BPMN notation, featuring:
- **Drag-and-drop editor**: Easy diagram creation
- **BPMN 2.0 compliant**: Industry standard
- **AI Coach**: Real-time feedback and suggestions
- **Process Drafter**: Convert text to diagrams
- **Export options**: Save as SVG, PNG, or XML

## Getting Started

### Accessing Process Mapper
1. Navigate to **Advanced Features** → **Process Mapper**
2. Choose to:
   - **Start Blank**: Create from scratch
   - **Use Template**: Pre-built process templates
   - **Describe Process**: Use AI Process Drafter

### BPMN Elements

**Start Event** (Circle)
- Triggers the process
- Only one per process
- Example: "Customer places order"

**Task/Activity** (Rectangle)
- Work to be done
- Use verb + object format
- Example: "Validate customer information"

**Gateway** (Diamond)
- Decision points
- Splits or merges flow
- Example: "Is credit approved?"

**End Event** (Thick circle)
- Process completion
- Can have multiple
- Example: "Order fulfilled"

**Sequence Flow** (Arrows)
- Order of activities
- Shows process flow
- Can be labeled

## Using AI Coach

### Local Linting
Real-time feedback as you build:

**Verb+Object Pattern**
- ✅ Good: "Validate customer data"
- ❌ Bad: "Validation"

**Avoid Vague Words**
- ✅ Good: "Calculate shipping cost"
- ❌ Bad: "Handle shipping"

**No Gerunds (-ing)**
- ✅ Good: "Review application"
- ❌ Bad: "Reviewing application"

**Missing Elements**
- Alerts if no start/end events
- Warns about disconnected elements
- Flags unfinished flows

### AI-Powered Analysis
Click **"Check My Map"** for comprehensive analysis:

**Critical Issues**
- Missing start or end events
- Disconnected elements
- Invalid BPMN structure
- Logic errors

**Warnings**
- Naming convention issues
- Complexity problems
- Best practice violations
- Unclear task names

**Suggestions**
- Process improvements
- Better naming
- Simplification opportunities
- Standard patterns

### Fixing Issues
For each suggestion:
- **View**: Click eye icon to focus on element
- **Fix**: Click edit icon to apply fix
- **Manual**: Edit element yourself
- **Dismiss**: If not applicable

## Process Drafter (Text-to-BPMN)

### How It Works
1. Click **"Describe Process"** button
2. Enter process description in plain text
3. Select process type:
   - **As-Is**: Current process (problems included)
   - **To-Be**: Improved process (solutions included)
4. Optionally specify industry
5. Click **"Generate BPMN"**

### Example Input
\`\`\`
When a customer places an order online, the system 
validates their payment information. If valid, the 
order is sent to the warehouse for fulfillment. The 
warehouse picks and packs the items, then ships them 
to the customer. The customer receives a tracking 
notification.
\`\`\`

### Generated Diagram
AI creates a structured BPMN diagram with:
- Proper start/end events
- Well-named tasks
- Decision gateways
- Sequence flow
- Swimlanes (if multiple actors)

### Build Guide
After generation, you see a step-by-step guide:
- **Step 1**: Create start event
- **Step 2**: Add first task
- **Step 3**: Add decision gateway
- And so on...

Follow the guide to learn BPMN structure!

## Best Practices

### Naming Tasks
- **Use verb + object**: "Approve invoice"
- **Be specific**: Not "Process request"
- **User action words**: Validate, Calculate, Review
- **Avoid technical jargon**: Unless necessary

### Process Flow
- **Left to right**: Standard direction
- **Top to bottom**: For complex processes
- **Minimize crossings**: Keep clean
- **Use pools/lanes**: For different actors

### Gateways
- **Label decisions**: "Is approved?"
- **Label paths**: "Yes" and "No"
- **One question per gateway**: Keep simple
- **XOR for decisions**: Most common type

### Complexity Management
- **Keep it simple**: One process per diagram
- **Sub-processes**: For complex sections
- **Max 15-20 elements**: For readability
- **Use swimlanes**: Separate actors

## Common Process Patterns

### Sequential Process
\`\`\`
Start → Task 1 → Task 2 → Task 3 → End
\`\`\`

### Decision Process
\`\`\`
Start → Task → Gateway → [Yes: Task A → End]
                        [No: Task B → End]
\`\`\`

### Parallel Process
\`\`\`
Start → Gateway+ → [Task A]  → Gateway+ → End
                   [Task B]
\`\`\`

### Loop Process
\`\`\`
Start → Task → Gateway → [Done: End]
                ↑         [Not Done: ↓]
                └──────────────────────┘
\`\`\`

## Exporting Your Diagrams

### Export Formats
- **SVG**: Scalable vector (best quality)
- **PNG**: Image file (for presentations)
- **XML**: BPMN 2.0 format (for other tools)

### Uses for Exports
- **Documentation**: Include in BRDs
- **Presentations**: Stakeholder meetings
- **Portfolio**: Job applications
- **Collaboration**: Share with team

## Process Improvement Tips

### As-Is Process Mapping
- **Document reality**: Not ideal state
- **Include pain points**: Show problems
- **Note exceptions**: Edge cases
- **Identify waste**: Inefficiencies

### To-Be Process Design
- **Solve pain points**: Remove problems
- **Streamline steps**: Reduce waste
- **Automate where possible**: Technology
- **Improve handoffs**: Between actors

### Validation
- **Walk through it**: Does it make sense?
- **Check completeness**: Any missing steps?
- **Verify with stakeholders**: Accurate?
- **Test edge cases**: All scenarios covered?`,
      tags: ['process-mapping', 'bpmn', 'diagrams', 'AI', 'documentation'],
      lastUpdated: '2024-01-15',
      featured: true,
      readTime: '16 min read'
    },

    // Meeting Features
    {
      id: 'meeting-preparation',
      title: 'Meeting Preparation & Setup',
      category: 'meeting-types',
      content: `Proper preparation is key to successful stakeholder meetings. Learn how to set up and prepare for different meeting types.

## Meeting Preparation Steps

### 1. Choose Your Project
Select from available scenarios:
- **E-Commerce**: Online shopping problems
- **Healthcare**: Patient management systems
- **Finance**: Banking and payment systems
- **Manufacturing**: Production processes
- **Custom**: Create your own project

### 2. Select Stakeholders
Choose who you'll meet with:
- **Individual**: One-on-one conversation
- **Multiple**: Group meeting (2-4 stakeholders)
- **By Role**: CEO, CTO, Operations Manager, etc.
- **By Department**: IT, Finance, HR, Operations

### 3. Choose Meeting Mode

**Voice Meeting (ElevenLabs)**
- Natural voice conversations
- Real-time audio responses
- Most realistic experience
- Requires microphone permission

**Chat Meeting**
- Text-based conversation
- Type your questions
- Read stakeholder responses
- Good for detailed analysis

**Practice Meeting**
- Structured training sessions
- AI coaching included
- Coverage tracking
- Pass/fail assessment

### 4. Review Project Brief
Before starting:
- Read project description
- Understand business context
- Note stakeholder backgrounds
- Identify potential questions

## Meeting Types Comparison

### Free Practice Meeting
**Best For**: Open exploration, skill practice
- **No time limit**: Take as long as needed
- **No structure**: Ask anything
- **No assessment**: Just practice
- **Full transcript**: Save conversation

**When to Use**:
- Exploring new project scenarios
- Practicing specific techniques
- Testing different approaches
- Building confidence

### Structured Training
**Best For**: Skill development, certification
- **10-minute limit**: Focused sessions
- **Must-cover items**: Specific objectives
- **AI coaching**: Real-time guidance
- **Pass/fail**: Clear success criteria

**When to Use**:
- Learning new BA skills
- Progressing through training stages
- Getting certified competency
- Receiving structured feedback

### Voice vs. Chat

**Voice Meetings**
- More realistic and immersive
- Practice verbal communication
- Develop conversational flow
- Build confidence speaking

**Chat Meetings**
- Easier to review and analyze
- More time to think
- Perfect for detailed questions
- Better for complex requirements

## Pre-Meeting Checklist

### Technical Setup
- [ ] Microphone working (for voice)
- [ ] Browser permissions granted
- [ ] Stable internet connection
- [ ] Quiet environment
- [ ] Headphones recommended

### Content Preparation
- [ ] Project brief reviewed
- [ ] Stakeholder profiles read
- [ ] Questions prepared
- [ ] Objectives understood
- [ ] Must-cover items noted

### Mental Preparation
- [ ] Clear on meeting goal
- [ ] Ready to listen actively
- [ ] Open to stakeholder perspective
- [ ] Focused and present

## During the Meeting

### Opening
- **Introduce yourself**: Name and role
- **State purpose**: Why you're meeting
- **Set expectations**: How long, what you'll cover
- **Build rapport**: Friendly, professional tone

### Active Listening
- **Don't interrupt**: Let stakeholder finish
- **Take mental notes**: Key points and concerns
- **Show engagement**: Acknowledge their points
- **Ask follow-ups**: Probe deeper on important topics

### Question Techniques
- **Open-ended**: How, What, Why questions
- **Follow-up**: "Can you tell me more about..."
- **Clarification**: "What did you mean by..."
- **Probing**: "Why is that important?"

### Time Management
- **Watch the clock**: Note remaining time
- **Prioritize**: Cover most important items first
- **Don't rush**: Quality over quantity
- **Leave time for closing**: Wrap up properly

### Closing
- **Summarize**: Recap key points
- **Confirm understanding**: "Did I get that right?"
- **Next steps**: What happens next
- **Thank them**: Appreciate their time

## Common Mistakes to Avoid

### Before Meeting
- ❌ Not reading project brief
- ❌ Skipping stakeholder profiles
- ❌ No prepared questions
- ❌ Technical issues unchecked

### During Meeting
- ❌ Asking only yes/no questions
- ❌ Jumping to solutions too quickly
- ❌ Not listening to answers
- ❌ Talking more than stakeholder
- ❌ Missing follow-up opportunities

### After Meeting
- ❌ Not reviewing transcript
- ❌ Ignoring feedback
- ❌ Skipping debrief analysis
- ❌ Not applying learnings

## Tips for Success

### For Voice Meetings
- Speak clearly and at normal pace
- Pause after asking questions
- Don't be afraid of silence
- Let AI stakeholder finish speaking
- Use natural conversational tone

### For Chat Meetings
- Write clear, complete questions
- Use proper grammar and punctuation
- Don't rush - think before typing
- Read responses carefully
- Take notes as you go

### For Training Sessions
- Review pre-brief thoroughly
- Pin your best 3 questions
- Watch coverage tracker
- Pay attention to AI coaching
- Review debrief carefully`,
      tags: ['meetings', 'preparation', 'setup', 'planning'],
      lastUpdated: '2024-01-15',
      readTime: '11 min read'
    },
    {
      id: 'meeting-history',
      title: 'Meeting History & Past Meetings',
      category: 'meeting-types',
      content: `All your practice meetings are saved, allowing you to review transcripts, summaries, and learn from past conversations.

## Accessing Meeting History

### From Dashboard
1. Click **"My Meetings"** in sidebar
2. View chronological list of all meetings
3. Filter by:
   - Project
   - Meeting type
   - Date range
   - Stakeholders involved

### Meeting List View
Each meeting shows:
- **Project name**: Which scenario
- **Date & time**: When it occurred
- **Duration**: How long it lasted
- **Stakeholders**: Who you met with
- **Status**: Pass/Fail (for training)
- **Quick actions**: View, Export, Delete

## Meeting Details

### Full Transcript
Complete conversation record:
- **Chronological**: Every message in order
- **Speaker labeled**: You vs. stakeholder
- **Timestamps**: When each message sent
- **Searchable**: Find specific topics

### Meeting Summary
AI-generated summary including:
- **Key topics discussed**: Main themes
- **Important findings**: What you learned
- **Action items**: Next steps identified
- **Coverage**: What was/wasn't addressed

### Meeting Notes
Structured notes with:
- **Business Problem**: Core issue identified
- **Stakeholder Concerns**: Key pain points
- **Requirements**: Needs expressed
- **Constraints**: Limitations mentioned
- **Next Steps**: Proposed actions

### Performance Metrics (Training Only)
For structured training sessions:
- **Coverage Score**: 0-100%
- **Question Quality**: Open vs. closed
- **Technique Score**: BA skills used
- **Pass/Fail**: Overall assessment
- **Improvement Areas**: What to work on

## Reviewing Transcripts

### Why Review?
- **Learn from mistakes**: See what you missed
- **Identify patterns**: Recurring issues
- **Extract requirements**: Document findings
- **Improve questions**: Better approaches
- **Build confidence**: See your progress

### What to Look For

**Your Questions**
- Were they open-ended?
- Did you follow up?
- Did you probe deep enough?
- Did you miss opportunities?

**Stakeholder Responses**
- What pain points mentioned?
- What requirements stated?
- What constraints noted?
- What priorities indicated?

**Conversation Flow**
- Logical progression?
- Good rapport building?
- Active listening evident?
- Natural transitions?

**Coverage Gaps**
- What you didn't ask about
- Topics avoided or missed
- Assumptions you made
- Areas needing more depth

## Exporting Meetings

### Export Options
- **PDF**: Professional document
- **Text**: Plain text transcript
- **CSV**: Data format
- **Markdown**: Formatted text

### What You Can Export
- Full transcript
- Meeting summary
- Analysis and notes
- Performance metrics
- Debrief feedback

### Uses for Exports

**Portfolio**
- Include in job applications
- Show interviewer your practice
- Demonstrate BA skills
- Prove hands-on experience

**Study**
- Review before next session
- Analyze your technique
- Learn from feedback
- Track improvement

**Documentation**
- Create requirement documents
- Extract user stories
- Document processes
- Build knowledge base

## Comparing Meetings

### Track Progress
Compare meetings over time:
- **Coverage improvement**: Getting better?
- **Question quality**: More open-ended?
- **Technique development**: Using BA skills?
- **Confidence growth**: More natural?

### Identify Patterns
- Questions you ask frequently
- Topics you explore well
- Areas you consistently miss
- Techniques you favor

### Learn from Variations
- Same project, different stakeholder
- Same stakeholder, different approach
- Similar problems, different solutions
- Various questioning techniques

## Meeting Analytics

### Personal Statistics
- Total meetings conducted
- Total practice hours
- Projects explored
- Stakeholders met with
- Success rate (training sessions)

### Skill Development
Track improvement in:
- Question quality score
- Coverage completeness
- Follow-up frequency
- Active listening
- Problem exploration

### Topic Analysis
- Most discussed topics
- Frequently missed areas
- Well-covered subjects
- Improvement opportunities

## Using Meeting History Effectively

### After Each Meeting
1. **Review immediately**: While fresh
2. **Read feedback**: Understand suggestions
3. **Note learnings**: Key takeaways
4. **Plan improvements**: What to do differently

### Weekly Review
1. **Compare meetings**: Spot trends
2. **Track progress**: Are you improving?
3. **Identify gaps**: Consistent weaknesses
4. **Celebrate wins**: Recognize growth

### Before Important Sessions
1. **Review similar meetings**: Past approaches
2. **Check what worked**: Successful techniques
3. **Note what failed**: Avoid same mistakes
4. **Prepare better questions**: Informed by history

### Portfolio Building
1. **Select best meetings**: Showcasing skills
2. **Export professionally**: Clean documents
3. **Add context**: Explain the scenario
4. **Highlight learnings**: Show growth
5. **Demonstrate skills**: Concrete examples`,
      tags: ['meetings', 'history', 'transcripts', 'review', 'analytics'],
      lastUpdated: '2024-01-15',
      readTime: '10 min read'
    },

    // Projects & Deliverables
    {
      id: 'custom-projects',
      title: 'Creating Custom Projects & Stakeholders',
      category: 'projects',
      content: `Go beyond pre-built scenarios by creating your own custom projects with AI-generated stakeholders tailored to your specific needs.

## Why Create Custom Projects?

### Benefits
- **Real-world practice**: Your actual work scenarios
- **Specific industries**: Healthcare, finance, retail, etc.
- **Unique challenges**: Your particular problems
- **Portfolio diversity**: Show range of experience
- **Interview preparation**: Practice your own case studies

## Creating a Custom Project

### Step 1: Project Details
Navigate to **Projects** → **Create Custom Project**

**Required Information**:
- **Project Name**: Clear, descriptive title
- **Industry**: Healthcare, Finance, Retail, etc.
- **Project Type**: New system, improvement, digital transformation
- **Company Size**: Startup, SMB, Enterprise
- **Project Goals**: What you want to achieve

**Example**:
\`\`\`
Name: Patient Appointment Scheduling System
Industry: Healthcare
Type: System Replacement
Size: Mid-size hospital (500 beds)
Goal: Reduce no-shows and improve patient experience
\`\`\`

### Step 2: Business Context
Provide background information:
- **Current Situation**: What exists today?
- **Pain Points**: What's not working?
- **Desired Outcome**: What should happen?
- **Constraints**: Budget, time, regulations
- **Success Criteria**: How to measure success?

### Step 3: Stakeholder Selection
Choose stakeholder types to include:
- **Executive**: CEO, CFO, CTO
- **Business**: Department heads, managers
- **Technical**: IT leads, developers
- **End Users**: Actual system users
- **External**: Customers, vendors, regulators

## AI-Generated Stakeholders

### How It Works
Based on your project details, AI creates realistic stakeholders with:
- **Relevant role**: Fits your industry and project
- **Specific concerns**: Related to their position
- **Realistic personality**: Professional, technical, skeptical, etc.
- **Domain knowledge**: Industry-appropriate expertise
- **Contextual responses**: Answers match your scenario

### Stakeholder Profiles Include
- **Name & Title**: Realistic for industry
- **Department**: Their area of responsibility
- **Background**: Experience and expertise
- **Priorities**: What they care about most
- **Concerns**: Potential objections
- **Communication Style**: How they interact

### Example AI-Generated Stakeholder
\`\`\`
Name: Dr. Sarah Chen
Title: Chief Medical Officer
Department: Clinical Operations
Background: 15 years in hospital administration
Priorities: Patient care quality, clinical workflow
Concerns: System adoption by doctors, patient safety
Style: Detail-oriented, evidence-based, direct
\`\`\`

## Customizing Stakeholders

### Manual Creation
If you prefer, create stakeholders manually:

1. **Basic Information**
   - Name and title
   - Department and role
   - Years of experience

2. **Personality & Style**
   - Communication preference
   - Level of technical knowledge
   - Attitude toward change
   - Decision-making style

3. **Domain Context**
   - Key responsibilities
   - Main priorities
   - Known pain points
   - Success criteria

4. **Meeting Behavior**
   - How responsive?
   - How detailed?
   - How challenging?
   - Collaboration level?

### Editing AI-Generated Stakeholders
You can modify any AI-generated stakeholder:
- Adjust personality
- Change priorities
- Add specific concerns
- Modify communication style
- Include particular requirements

## Project Scenarios

### System Replacement
**Context**: Replace outdated system
**Stakeholders**: IT, end users, executives
**Focus**: Requirements, migration, adoption

### Process Improvement
**Context**: Fix inefficient processes
**Stakeholders**: Process owners, managers, workers
**Focus**: Current pain, root causes, solutions

### Digital Transformation
**Context**: Modernize operations
**Stakeholders**: Executives, IT, change management
**Focus**: Vision, feasibility, change impact

### New Product/Feature
**Context**: Build something new
**Stakeholders**: Product, engineering, users
**Focus**: Market need, features, priorities

### Regulatory Compliance
**Context**: Meet new regulations
**Stakeholders**: Legal, compliance, operations
**Focus**: Requirements, risks, timeline

## Using Custom Projects

### Practice Meetings
Once created, use your custom project like any other:
1. Select the project
2. Choose stakeholders (AI or custom)
3. Pick meeting mode (voice/chat)
4. Start your conversation

### Iterative Refinement
After practice meetings:
- **Adjust project details**: Based on learnings
- **Modify stakeholders**: Make more realistic
- **Add requirements**: As discovered
- **Update context**: Incorporate feedback

## Best Practices

### Project Creation
- **Be specific**: Detailed context helps AI
- **Include numbers**: Budget, users, timeline
- **Note constraints**: Regulatory, technical, organizational
- **Set clear goals**: Measurable outcomes

### Stakeholder Design
- **Diverse perspectives**: Different viewpoints
- **Realistic concerns**: Actual objections
- **Varied seniority**: Junior to executive
- **Cross-functional**: Multiple departments

### Scenario Realism
- **Real problems**: Based on actual challenges
- **Industry-specific**: Use correct terminology
- **Appropriate scale**: Match company size
- **Current trends**: Relevant technologies

## Portfolio Value

### Demonstrating Skills
Custom projects show you can:
- **Understand diverse industries**
- **Handle various stakeholders**
- **Apply BA skills flexibly**
- **Work on realistic scenarios**

### Interview Preparation
Use custom projects to:
- **Practice company's industry**: Before interview
- **Simulate their problems**: Research and create
- **Prepare talking points**: Concrete examples
- **Show initiative**: Self-directed learning

### Case Study Development
Turn custom projects into case studies:
- **Problem Statement**: What was the challenge?
- **Approach**: How did you analyze it?
- **Stakeholders**: Who did you engage?
- **Outcome**: What requirements emerged?
- **Deliverables**: What did you create?`,
      tags: ['projects', 'custom', 'stakeholders', 'AI', 'scenarios'],
      lastUpdated: '2024-01-15',
      readTime: '13 min read'
    },
    {
      id: 'deliverables-export',
      title: 'Creating & Exporting Deliverables',
      category: 'projects',
      content: `Transform your practice work into professional BA deliverables that you can export for your portfolio or job applications.

## Available Deliverables

### Business Requirements Document (BRD)
Comprehensive project documentation including:
- Executive summary
- Business objectives
- Scope (in/out)
- Stakeholder analysis
- Current state analysis
- Requirements (functional & non-functional)
- Assumptions and constraints
- Success criteria
- Timeline and milestones

### User Stories
Agile requirements in user story format:
- Epic groupings
- User story format (As a... I want... So that...)
- Acceptance criteria
- Story points/estimates
- Priority levels
- Dependencies
- Notes and context

### Acceptance Criteria
Detailed test conditions:
- Scenario-based (Given-When-Then)
- Functional requirements checklist
- Non-functional requirements
- Edge cases and exceptions
- Performance criteria
- Security requirements
- Usability standards

### Business Goals & Objectives
Strategic documentation:
- Primary business goals
- Success criteria
- Key Performance Indicators (KPIs)
- Target metrics
- Timeline and milestones
- Strategic alignment

### Process Documentation
BPMN diagrams and process flows:
- As-Is process maps
- To-Be process designs
- Swimlane diagrams
- Process narratives
- Exception handling
- System interactions

## Creating Deliverables

### From Meeting Transcripts
1. Navigate to **My Meetings**
2. Select a completed meeting
3. Click **"Generate Deliverables"**
4. Choose deliverable type
5. AI extracts relevant content from transcript
6. Review and edit

### From MVP Builder
1. Open your MVP project
2. Click **"Export Deliverables"**
3. Select what to export:
   - All user stories
   - Specific epic
   - Sprint backlog
   - Acceptance criteria
4. Choose format
5. Download

### From Process Mapper
1. Complete your BPMN diagram
2. Click **"Export"**
3. Select format:
   - SVG (scalable vector)
   - PNG (image)
   - XML (BPMN 2.0)
   - PDF (with annotations)
4. Save to portfolio

### Manual Creation
1. Go to **Projects** → **Deliverables**
2. Click **"Create New"**
3. Choose deliverable type
4. Use provided template
5. Fill in your content
6. Save and export

## Using Templates

### Pre-Built Templates
Each deliverable type includes:
- **Professional structure**: Industry-standard format
- **Helpful prompts**: What to include in each section
- **Example content**: Placeholder text to guide you
- **Best practices**: Tips for each section

### Customizing Templates
- Add/remove sections as needed
- Adjust formatting
- Include company branding
- Modify for specific industries
- Add custom fields

## Editing Deliverables

### Rich Text Editor
- **Formatting**: Bold, italic, headers
- **Lists**: Bullets and numbering
- **Tables**: Structured data
- **Links**: Reference materials
- **Images**: Diagrams and screenshots

### Content Assistance
AI can help you:
- **Improve clarity**: Better wording
- **Add detail**: Expand sections
- **Fix grammar**: Professional writing
- **Format consistently**: Standardize style

### Version Control
- **Auto-save**: Never lose work
- **Version history**: See past versions
- **Compare versions**: Track changes
- **Restore**: Go back if needed

## Export Formats

### PDF
- **Professional appearance**: Print-ready
- **Preserve formatting**: Looks exactly right
- **Universal access**: Anyone can open
- **Portfolio-ready**: Job applications

**Best For**: Sharing with recruiters, interviews, formal documentation

### Markdown
- **Editable text**: Easy to modify
- **Version control**: Git-friendly
- **Platform independent**: Works anywhere
- **Lightweight**: Small file size

**Best For**: Documentation, wikis, GitHub repositories

### Word Document
- **Widely used**: Industry standard
- **Full editing**: Rich formatting
- **Comments**: Collaboration
- **Track changes**: Review process

**Best For**: Collaborative editing, formal business documents

### CSV/Excel
- **Data export**: Structured information
- **Analysis**: Spreadsheet manipulation
- **Bulk editing**: Multiple items
- **Import**: To other tools

**Best For**: User stories, requirements lists, tracking

## Portfolio Building

### Selecting Best Work
Choose deliverables that show:
- **Variety**: Different types and industries
- **Quality**: Your best work
- **Complexity**: Challenging projects
- **Results**: Successful outcomes

### Professional Presentation
- **Clean formatting**: Consistent style
- **Clear structure**: Easy to navigate
- **Error-free**: Proofread thoroughly
- **Context**: Explain the scenario

### Portfolio Organization
Create a portfolio with:
- **Cover page**: Your name and summary
- **Table of contents**: Easy navigation
- **Project summaries**: Brief context for each
- **Deliverables**: Your actual work
- **Reflection**: What you learned

## Quality Checklist

### Before Exporting
- [ ] All sections complete
- [ ] No placeholder text remaining
- [ ] Grammar and spelling checked
- [ ] Formatting consistent
- [ ] Tables and lists aligned
- [ ] Headers properly structured
- [ ] No broken links or references

### Professional Standards
- [ ] Industry-appropriate terminology
- [ ] Clear and concise language
- [ ] Specific and measurable items
- [ ] Realistic and achievable
- [ ] Properly attributed sources
- [ ] Confidentiality maintained

### Portfolio Ready
- [ ] Context explained
- [ ] Your role clear
- [ ] Results highlighted
- [ ] Skills demonstrated
- [ ] Professional appearance
- [ ] No sensitive information

## Using Deliverables

### Job Applications
- Include in portfolio
- Attach to resume
- Reference in cover letter
- Discuss in interviews
- Show hands-on experience

### Interview Preparation
- Review before interview
- Prepare talking points
- Demonstrate thought process
- Show problem-solving
- Explain decisions made

### Skill Development
- Compare to real examples
- Get feedback from mentors
- Identify improvement areas
- Practice different formats
- Build professional writing skills

### Networking
- Share on LinkedIn
- Include in case studies
- Demonstrate expertise
- Build credibility
- Attract opportunities`,
      tags: ['deliverables', 'export', 'portfolio', 'documentation', 'professional'],
      lastUpdated: '2024-01-15',
      readTime: '12 min read'
    }
  ];

  // Filter articles based on search and category
  const filteredArticles = supportArticles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });


  // Group articles by category
  const articlesByCategory = supportArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  const categoryNames: Record<string, string> = {
    'getting-started': 'Getting Started',
    'meeting-types': 'Meeting Types',
    'training-system': 'Training System',
    'projects-scenarios': 'Projects & Scenarios',
    'projects': 'Projects',
    'technical-issues': 'Technical Issues',
    'advanced-features': 'Advanced Features'
  };

  const categoryIcons: Record<string, React.ComponentType<any>> = {
    'getting-started': GraduationCap,
    'meeting-types': Users,
    'training-system': BookOpen,
    'projects-scenarios': FileText,
    'projects': Briefcase,
    'technical-issues': Settings,
    'advanced-features': TrendingUp
  };

  const categoryColors: Record<string, string> = {
    'getting-started': 'from-purple-500 to-indigo-600',
    'meeting-types': 'from-cyan-500 to-blue-600',
    'training-system': 'from-emerald-500 to-teal-600',
    'projects-scenarios': 'from-orange-500 to-red-600',
    'projects': 'from-indigo-500 to-purple-600',
    'technical-issues': 'from-red-500 to-pink-600',
    'advanced-features': 'from-yellow-500 to-orange-600'
  };

  const featuredArticles = supportArticles.filter(article => article.featured);

  // If FAQ tab is active, render the FAQ component
  if (activeTab === 'faq') {
    return (
      <FAQView 
        showTabs={true} 
        onTabChange={(tab) => setActiveTab(tab)}
        hideNavigation={true}
        onClose={() => setActiveTab('help')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900" style={{ scrollbarGutter: 'stable' }}>
      {/* Hero Section - Matching FAQ Design */}
      <section className="relative py-16 md:py-20 bg-gradient-to-r from-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-full text-sm font-medium mb-4 text-white">
            <HelpCircle className="w-4 h-4 mr-2" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">How Can We Help You?</h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-6">
            Everything you need to master Business Analysis and excel in your stakeholder conversations
          </p>

          {/* Tab Navigation */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab('help')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'help'
                  ? 'bg-white text-purple-600 shadow-xl scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Help Articles
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'faq'
                  ? 'bg-white text-purple-600 shadow-xl scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              FAQ
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search for help articles, guides, and tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/30 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md focus:border-white dark:focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-purple-500/50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Featured Articles */}
      {!searchQuery && !selectedCategory && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Featured Articles
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start Here</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Essential guides to get you started and help you succeed
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 text-left transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${categoryColors[article.category]} rounded-2xl flex items-center justify-center`}>
                      {React.createElement(categoryIcons[article.category], {
                        className: "w-7 h-7 text-white"
                      })}
                    </div>
                    <div className="flex items-center space-x-1 text-amber-500 dark:text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-medium">Featured</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.content.substring(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Browse */}
      {!searchQuery && !selectedCategory && (
        <section className="py-20 bg-white dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore help articles organized by topic and skill level
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(articlesByCategory).map(([category, articles]) => (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-r ${categoryColors[category]} rounded-2xl flex items-center justify-center`}>
                        {React.createElement(categoryIcons[category], {
                          className: "w-7 h-7 text-white"
                        })}
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{categoryNames[category]}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{articles.length} articles</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      {articles.slice(0, 3).map((article) => (
                        <div key={article.id} className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          • {article.title}
                        </div>
                      ))}
                      {articles.length > 3 && (
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          +{articles.length - 3} more articles
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search Results */}
      {searchQuery && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">{filteredArticles.length} articles found</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${categoryColors[article.category]} rounded-xl flex items-center justify-center`}>
                      {React.createElement(categoryIcons[article.category], {
                        className: "w-6 h-6 text-white"
                      })}
                    </div>
                    {article.featured && (
                      <div className="flex items-center space-x-1 text-amber-500 dark:text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {article.content.substring(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Results */}
      {selectedCategory && !searchQuery && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{categoryNames[selectedCategory]}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">{articlesByCategory[selectedCategory]?.length} articles</p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
              >
                ← Back to all categories
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articlesByCategory[selectedCategory]?.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${categoryColors[article.category]} rounded-xl flex items-center justify-center`}>
                      {React.createElement(categoryIcons[article.category], {
                        className: "w-6 h-6 text-white"
                      })}
                    </div>
                    {article.featured && (
                      <div className="flex items-center space-x-1 text-amber-500 dark:text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {article.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {searchQuery && filteredArticles.length === 0 && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No articles found</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Try adjusting your search terms or browse by category</p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-purple-600 dark:bg-purple-700 text-white px-8 py-4 rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-semibold"
            >
              Clear search
            </button>
          </div>
        </section>
      )}

      {/* Support CTA */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentView('contact-support')}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2"
              >
                <Mail className="w-5 h-5" />
                <span>Contact Support</span>
              </button>
            </div>
            <p className="text-purple-200 text-sm mt-6">
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${categoryColors[selectedArticle.category]} rounded-xl flex items-center justify-center`}>
                  {React.createElement(categoryIcons[selectedArticle.category], {
                    className: "w-6 h-6 text-white"
                  })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedArticle.title}</h2>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{categoryNames[selectedArticle.category]}</span>
                    <span>•</span>
                    <span>{selectedArticle.readTime}</span>
                    <span>•</span>
                    <span>Updated {selectedArticle.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                {selectedArticle.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {parseInlineMarkdown(paragraph.substring(3))}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={index} className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                        {parseInlineMarkdown(paragraph.substring(4))}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('- **') && paragraph.includes('**:')) {
                    const parts = paragraph.substring(2).split('**:');
                    const label = parts[0].replace(/\*\*/g, '');
                    const content = parts.slice(1).join('**:');
                    return (
                      <div key={index} className="flex mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <span className="font-semibold text-gray-900 dark:text-white min-w-0 flex-shrink-0 mr-3">
                          {label}:
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{parseInlineMarkdown(content)}</span>
                      </div>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <li key={index} className="text-gray-700 dark:text-gray-300 mb-2 ml-6 leading-relaxed">
                        {parseInlineMarkdown(paragraph.substring(2))}
                      </li>
                    );
                  }
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <div key={index} className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                        {paragraph.substring(2, paragraph.length - 2)}
                      </div>
                    );
                  }
                  if (paragraph.startsWith('```')) {
                    return null; // Skip code block markers
                  }
                  if (paragraph.trim() === '') {
                    return <div key={index} className="mb-4"></div>;
                  }
                  if (paragraph.trim()) {
                    return (
                      <p key={index} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {parseInlineMarkdown(paragraph)}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <span key={tag} className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Bookmark className="w-4 h-4" />
                      <span className="text-sm">Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportCentreView;