# BA In Action: Page Design Pattern

## Core Principle
**Show the BA doing real work on the CI&F project, not just explaining concepts.**

## Required Elements for Every Page

### 1. **Hero Section**
- Local image (`/images/collaborate1.jpg`)
- Page title without "Day X" (except Day 1)
- Subtitle explaining what the BA is doing
- Purple/indigo gradient badge

### 2. **Context Box** (Purple/Blue gradient)
- Why this matters in interviews
- How it fits in Agile workflow
- Tools used

### 3. **Artifacts** (Show, don't tell)
Examples:
- **Emails** (styled like Outlook/Gmail with headers)
- **Teams/Slack messages** (with timestamps, avatars)
- **Meeting transcripts** (conversational, realistic)
- **Jira tickets** (full UI mockup with description, AC, comments)
- **Documents** (Confluence pages, requirements docs)
- **Diagrams** (process maps, stakeholder maps)

### 4. **The BA Doing Work** (Step-by-step)
- Reading artifacts
- Analyzing information
- Making notes
- Asking questions
- Making decisions
- Creating outputs

### 5. **Coaching Hints** (Expandable purple boxes)
- "What to look for" (blue gradient)
- "Why this matters" (amber boxes)
- "Pro tips" (purple gradient)
- "Interview tips" (emerald boxes)

### 6. **Tasks for User** (With text areas)
- Analyze this artifact
- Write your own version
- Answer these questions
- Create this deliverable

### 7. **Examples** (Expandable)
- "How a BA would do it"
- Before/After comparisons
- Good vs Bad examples

### 8. **Slack/Teams Update** (Copy & Adapt section)
- Realistic update message
- Why it works explanation

## Typography Standards (Match Day 1)
- **Body text**: `text-base` (16px) - `text-slate-800`
- **Tables/Labels**: `text-sm` (14px) - `text-slate-700`
- **Metadata**: `text-xs` (12px) - `text-slate-600`
- **Hero headline**: `text-3xl` (30px)
- **Section titles**: `text-base font-semibold`

## Color Scheme
- **Main gradients**: Purple-to-indigo (`from-purple-600 to-indigo-600`)
- **Secondary**: Blue-to-cyan (`from-blue-600 to-cyan-600`)
- **Success**: Emerald (`emerald-50`, `emerald-800`)
- **Warning**: Amber (`amber-50`, `amber-800`)
- **Error**: Rose (`rose-50`, `rose-900`)

## Project Continuity (CI&F Project)
Each page must reference and build on previous pages:

### Day 1: Join & Orientation
- **Artifacts**: Welcome email, Teams invite, Project brief, Stakeholder list
- **BA Does**: Reads onboarding materials, notes questions, prepares for first call

### Day 2: Understand the Problem
- **Artifacts**: Meeting transcript, meeting notes, problem evidence
- **BA Does**: Extracts problem statement, identifies success metrics, plans engagement
- **References**: Uses stakeholder list from Day 1

### Day 3: Who's Involved & Why It Matters
- **Artifacts**: Stakeholder landscape table, Power-Interest Grid, communication scripts
- **BA Does**: Maps stakeholders, plans communication approach, writes stakeholder narrative
- **References**: Uses stakeholders from Day 1, problem from Day 2

### Day 4: As-Is → Gap → To-Be
- **Artifacts**: Process observation notes, gap analysis table, As-Is/To-Be comparison
- **BA Does**: Maps current process, identifies gaps, defines future direction
- **References**: Uses problem from Day 2, stakeholder concerns from Day 3

### Day 5: Requirements & Documentation
- **Artifacts**: Requirements doc, User story (Jira format), Acceptance criteria, Traceability matrix
- **BA Does**: Writes requirements, creates user stories, links to outcomes
- **References**: Uses To-Be direction from Day 4, stakeholder needs from Day 3

### Day 6: Agile Delivery
- **Artifacts**: Jira tickets (US-142, US-145), Sprint planning transcript, Standup notes, Refinement meeting script
- **BA Does**: Presents stories in planning, clarifies AC, unblocks devs, validates in review
- **References**: Uses requirements from Day 5, presents stories to stakeholders from Day 3

### Day 7: UAT & Validation
- **Artifacts**: UAT test scenarios, Stakeholder feedback emails, Issue log, Handover checklist
- **BA Does**: Coordinates testing, documents feedback, validates against original AC, hands over to BAU
- **References**: Uses AC from Day 5, validates outcomes from Day 2

## Anti-Patterns (Don't Do This)
❌ Just explaining concepts without showing work
❌ Generic examples not tied to CI&F project
❌ Abstract tables without realistic content
❌ No artifacts (emails, transcripts, documents)
❌ No tasks for the user to complete
❌ Black backgrounds (use white with colored borders)
❌ Unsplash images (use local `/images/collaborate1.jpg`)
❌ Text colors that are hard to read
❌ Missing coaching hints and "why this matters"

## Good Examples to Follow
✅ Day 1: Join & Orientation (complete artifacts, coaching, tasks)
✅ Day 2: Understand the Problem (meeting transcript, analysis, tasks)
✅ Day 3: Who's Involved (Power-Interest Grid, scripts, narrative writing)

## Current Status
- ✅ Day 1: Join & Orientation - GOOD
- ✅ Day 2: Understand the Problem - GOOD  
- ✅ Day 3: Who's Involved - GOOD
- ⚠️ Day 4: As-Is → Gap → To-Be - Has expandable questions but needs more artifacts
- ⚠️ Day 5: Requirements - Has good example but needs more realistic artifacts
- ❌ Day 6: Agile Delivery - Needs complete redesign with Jira UI, transcripts
- ❌ Day 7: UAT & Validation - Needs artifacts and tasks

