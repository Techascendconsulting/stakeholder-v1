/**
 * Learning Flow Data - Real Content from Existing Pages
 * 
 * Extracts actual teaching content from Core Learning, Elicitation, etc.
 * and structures it into sequential modules with lessons
 */

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration?: string;
  type: 'reading' | 'video' | 'interactive';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  lessons: Lesson[];
  assignmentTitle: string;
  assignmentDescription: string;
}

// Helper to convert concept to markdown lesson content
const conceptToMarkdown = (title: string, description: string, keyPoints: string[]): string => {
  return `# ${title}

${description}

## Key Points

${keyPoints.map(point => `- ${point}`).join('\n')}

## What This Means for You

Understanding this concept is foundational to your work as a Business Analyst. As you progress, you'll apply these principles in real project scenarios.`;
};

/**
 * 10 BA Learning Modules - Using Real App Content
 */
export const LEARNING_MODULES: Module[] = [
  // MODULE 1: Core Learning (BA Fundamentals) - ALL 14 CONCEPTS
  {
    id: 'module-1-core-learning',
    title: 'Core Learning',
    description: 'Foundation concepts every Business Analyst must know',
    icon: '📚',
    color: 'blue',
    order: 1,
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Who Is a Business Analyst?',
        type: 'reading',
        duration: '8 min',
        content: `# Who Is a Business Analyst?

Picture this: You're frustrated with your favorite food delivery app. Sometimes your order arrives cold, sometimes the wrong items show up, and tracking is confusing. You complain to customer service, but nothing changes. Why? Because somewhere in that company, there's a disconnect between what customers need and what the tech team is building.

**This is exactly where a Business Analyst steps in.**

## The Bridge Builder

A Business Analyst (BA) is like a translator between two worlds: the business side (people who know the problems) and the solution side (people who build fixes). Think of them as the person who:

- **Listens** to frustrated customers and employees
- **Asks** the right questions to understand the real problem (not just symptoms)
- **Documents** exactly what needs to change and why
- **Guides** the team to build the right solution

They don't write code. They don't design the app. They don't manage the project timeline. Instead, they make sure everyone is solving the **right problem** before anyone starts building.

## A Real-Life Example: Netflix Recommendations

When Netflix realized people were spending too long browsing without watching anything, they didn't just hire developers to "fix browsing." First, a BA would:

1. **Investigate**: Talk to users - "Why do you spend 20 minutes browsing?"
2. **Analyze**: Discover patterns - "People feel overwhelmed by too many choices"
3. **Define the need**: "We need personalized recommendations that feel curated, not random"
4. **Document requirements**: "Show 5-7 highly relevant picks, not 50 okay options"

Only then would developers build the recommendation algorithm. The BA ensured they built the right thing.

## Why Companies Hire BAs

Imagine your company wants to "improve the checkout process." Without a BA, the team might:
- Build features nobody asked for
- Miss critical security requirements
- Create a solution that works in the UK but fails in other markets
- Waste 6 months building something that doesn't solve the actual problem

**A BA prevents this.** They dig deeper:
- "What specifically is wrong with checkout?"
- "Is it speed? Payment options? Mobile usability?"
- "Who struggles most - new customers or returning ones?"
- "What does success actually look like?"

Their work saves time, money, and frustration.

## What BAs Do Every Day

Think of a BA working on a project to improve Uber's driver app:

- **Morning**: Meet with drivers to understand their biggest frustrations
- **Midday**: Document findings - "Drivers lose time because they can't see the next ride while dropping off a passenger"
- **Afternoon**: Work with designers and developers to clarify exactly what "see next ride" means (distance? fare estimate? pickup time?)
- **Evening**: Write clear requirements so the team knows what to build

They don't decide *how* the app will show this info (that's for designers/developers). They clarify *what* needs to happen and *why* it matters.

## What BAs Don't Do

Let's be clear - BAs are not:
- **Developers** - They don't write code (but they work closely with those who do)
- **Project Managers** - They don't manage timelines or budgets (but they help PMs understand scope)
- **Designers** - They don't create mockups (but they define what the design must achieve)
- **Testers** - They don't run tests (but they define what "working correctly" means)

Their superpower is **clarity**. They make sure everyone understands the problem and agrees on the solution *before* anyone starts building.

## Why This Role Exists

Think about the last time you used an app and thought, "Who designed this?! This makes no sense!" That usually happens when:
- Nobody asked users what they actually needed
- Teams assumed they understood the problem
- Requirements were vague or contradictory
- Different departments worked in silos

A good BA prevents all of this. They're the person who ensures that when Spotify adds a feature, it's because users actually want it - not because someone in a meeting thought it sounded cool.

## Your Journey as a BA

As you learn this role, you'll discover it's less about technical skills and more about:
- **Curiosity** - Always asking "why?"
- **Clarity** - Turning messy conversations into clear documents
- **Communication** - Helping technical and non-technical people understand each other
- **Critical thinking** - Spotting gaps, risks, and hidden assumptions

You're not just learning a job - you're learning to be the person who makes sure good ideas become great solutions.

---

**Next up**: We'll explore how organizations actually work, so you can understand the environment where BAs make their impact.
`
      },
      {
        id: 'lesson-1-2',
        title: 'How Organisations Work',
        type: 'reading',
        duration: '10 min',
        content: `# How Organisations Work

Think about the apps on your phone right now. Spotify sells you music streaming. Amazon sells products and delivery. WhatsApp is free but owned by Meta, who sells advertising. Every single organization exists to deliver value - and to make money doing it.

**Understanding how organizations work is critical for BAs** because you can't improve what you don't understand.

## The Simple Truth: Every Business Sells Something

At its core, every organization falls into one of three categories:

### 1. Product Companies
They make or sell physical or digital things you can own.

**Examples:**
- **Apple** - Sells iPhones, MacBooks, iPads
- **Amazon** - Sells products from books to groceries
- **PlayStation** - Sells gaming consoles and games

**What this means for BAs:** Product companies care about inventory, supply chains, manufacturing quality, and customer satisfaction. When you work on a project for a product company, you'll often hear about "reducing defects," "faster shipping," or "better product recommendations."

### 2. Service Companies
They sell expertise, time, or experiences - not physical products.

**Examples:**
- **Uber** - Sells transportation as a service
- **Netflix** - Sells entertainment streaming (access, not ownership)
- **Airbnb** - Sells temporary accommodation
- **Deliveroo** - Sells food delivery service

**What this means for BAs:** Service companies obsess over customer experience, speed, and reliability. Projects often focus on "reducing wait times," "improving driver ratings," or "better matching customers with providers."

### 3. Hybrid Companies
They sell both products and services.

**Examples:**
- **Apple** - Sells iPhones (product) + Apple Music & iCloud (services)
- **Amazon** - Sells products + Amazon Prime (service)
- **Tesla** - Sells cars (product) + charging network & software updates (service)

**What this means for BAs:** Hybrid companies are complex. You might work on projects that impact both sides - like Amazon Prime, which offers free shipping (service) and exclusive products (product).

## Why Organizations Exist: The Value Equation

Every organization exists to deliver **value**. But what does "value" actually mean?

### For Customers
- **Save time** - Uber gets you there faster than public transport
- **Save money** - Amazon often has lower prices than physical stores
- **Solve a problem** - Spotify solves "I want to listen to any song, anytime"
- **Feel good** - Instagram makes people feel connected

### For the Business
- **Make profit** - Revenue must exceed costs
- **Grow market share** - Beat competitors
- **Build brand loyalty** - Keep customers coming back
- **Comply with regulations** - Avoid fines and legal issues

## Real Example: Deliveroo's Business Model

Let's break down how Deliveroo works to see why understanding the business matters:

**What Deliveroo Sells:** Food delivery service

**Who Pays Them:**
1. **Customers** - Pay delivery fees + service charges
2. **Restaurants** - Pay commission (25-35% of order value)
3. **Advertisers** - Pay to appear higher in search results

**Their Costs:**
- Rider payments
- Technology (app development, servers)
- Customer support
- Marketing

**Their Goals:**
- Increase number of orders
- Reduce delivery time
- Increase average order value
- Keep riders and customers happy

**Why This Matters for a BA:**
Imagine your boss says, "We need to improve the app." That's too vague. But if you understand Deliveroo's business model, you'd ask:
- "Do we want customers to order more often?"
- "Do we want to increase the average order value?"
- "Do we want to reduce delivery time?"
- "Do we want to reduce rider cancellations?"

Each of these requires a **completely different solution**. The BA's job is to clarify **which business goal** the project serves.

## Departments: How Work Gets Done

Organizations divide work into departments. Each department has different priorities - and sometimes they conflict.

### Common Departments You'll Work With

**1. Sales**
- **Goal:** Bring in new customers and revenue
- **Pain Points:** "The website doesn't show product availability, so we promise things we can't deliver"
- **BA Impact:** Help build better customer data systems

**2. Marketing**
- **Goal:** Build brand awareness and attract leads
- **Pain Points:** "We run campaigns but can't track which ones actually work"
- **BA Impact:** Define requirements for analytics and tracking

**3. Finance**
- **Goal:** Manage money, reduce costs, ensure profitability
- **Pain Points:** "We can't get real-time revenue reports - everything is manual in Excel"
- **BA Impact:** Automate reporting and financial workflows

**4. Operations**
- **Goal:** Deliver products/services efficiently
- **Pain Points:** "Our warehouse system is so slow, orders take 3 days to process"
- **BA Impact:** Streamline processes and reduce bottlenecks

**5. Customer Service**
- **Goal:** Keep customers happy and resolve issues
- **Pain Points:** "Customers call about their order status because the app doesn't show tracking"
- **BA Impact:** Build self-service features to reduce call volume

**6. Compliance/Legal**
- **Goal:** Ensure the business follows laws and regulations
- **Pain Points:** "We're not GDPR compliant - customers can't delete their data"
- **BA Impact:** Define data privacy requirements

**7. IT/Technology**
- **Goal:** Build and maintain systems
- **Pain Points:** "Business teams keep asking for features without explaining why"
- **BA Impact:** You're the bridge - you translate business needs into clear requirements

## Why BAs Must Understand the Business

Here's a real scenario:

**Situation:** A clothing retailer wants to "improve the mobile app."

**Bad BA Approach:**
"Okay, we'll add more features and make it look nicer."

**Good BA Approach:**
- **Ask:** "What's the business goal? Increase sales? Reduce returns? Improve brand loyalty?"
- **Discover:** "Sales team says customers abandon carts because shipping costs are only shown at checkout."
- **Analyze:** "Customer service says 40% of calls are about delivery delays."
- **Define:** "We need to: (1) Show shipping costs earlier in the journey, (2) Provide real-time delivery tracking."

The good BA ties every feature back to a **business outcome**. That's why you need to understand:
- What the business sells
- How they make money
- Which departments are involved
- What success looks like

## Your Role: The Business Translator

As a BA, you're not just a "requirements writer." You're a **business translator** who:
- Understands the business model (how they make money)
- Knows each department's priorities
- Connects projects to business value
- Ensures solutions actually solve the right problem

When you start a new project, always ask:
1. What does this organization sell?
2. How do they make money?
3. Which departments are impacted?
4. What business goal does this project support?

Answer these, and you'll always deliver valuable work.

---

**Next up:** We'll explore why projects happen in the first place - and how BAs make sure they're worth doing.
`
      },
      {
        id: 'lesson-1-3',
        title: 'Departments in an Organisation',
        type: 'reading',
        duration: '9 min',
        content: `# Departments in an Organisation

You've probably noticed that when you call customer service at Amazon, the person you speak to can't just magically fix your billing issue or change your delivery address. They have to "transfer you to another department." Ever wondered why?

**Organizations divide work into specialized departments** - and as a BA, you'll constantly work across these invisible boundaries.

## Why Departments Exist

Imagine trying to run Spotify with one giant team of 5,000 people all reporting to one manager. Chaos, right? 

Instead, companies create departments - specialized teams focused on specific areas. Each department:
- Has its own goals and KPIs (key performance indicators)
- Uses different tools and systems
- Speaks different "languages" (marketing talks about "campaigns," IT talks about "APIs")
- Often competes for budget and resources

**Your job as a BA? Navigate these silos and get everyone aligned.**

## The Main Departments You'll Work With

### 1. Sales
**What They Do:** Bring in new customers and close deals

**Real Example - LinkedIn Sales Team:**
- Target: Sign up companies for LinkedIn Recruiter subscriptions
- Pain Point: "The CRM system doesn't sync with our email, so we lose track of leads"
- What They Care About: Lead conversion rates, deal size, sales cycle length

**BA Impact:** You might work on a project to integrate the CRM with email and calendar tools, reducing manual data entry.

### 2. Marketing
**What They Do:** Build brand awareness and attract potential customers

**Real Example - Spotify Marketing:**
- Target: Get more people to sign up for Spotify Premium
- Pain Point: "We run Facebook ads, Instagram campaigns, and influencer partnerships - but can't tell which actually drives sign-ups"
- What They Care About: Cost per acquisition, campaign ROI, brand sentiment

**BA Impact:** You might define requirements for a marketing analytics dashboard that tracks which channels bring in paying subscribers.

### 3. Finance
**What They Do:** Manage money - budgets, forecasting, reporting, compliance

**Real Example - Netflix Finance:**
- Target: Track revenue across 190+ countries with different currencies
- Pain Point: "Revenue reports are manual - it takes 2 weeks to close the books each month"
- What They Care About: Accurate numbers, cost control, compliance with accounting standards

**BA Impact:** You might help automate financial reporting or build a budgeting tool for department heads.

### 4. Operations
**What They Do:** Execute the core business - deliver products, fulfill orders, manage logistics

**Real Example - Amazon Warehouse Operations:**
- Target: Ship millions of packages daily with 1-2 day delivery
- Pain Point: "Our inventory system doesn't talk to the warehouse robots, causing delays"
- What They Care About: Fulfillment speed, error rates, cost per unit shipped

**BA Impact:** You might work on integrating warehouse management systems with delivery tracking to reduce delays.

### 5. Customer Service (Support)
**What They Do:** Help customers with issues, complaints, and questions

**Real Example - Uber Customer Support:**
- Target: Resolve rider and driver issues quickly
- Pain Point: "Riders call asking 'Where's my driver?' because real-time tracking breaks in the app"
- What They Care About: First-call resolution, average handle time, customer satisfaction scores

**BA Impact:** You might identify self-service features (like live driver tracking) that reduce call volume by 40%.

### 6. Product/Product Management
**What They Do:** Decide what features to build and prioritize the roadmap

**Real Example - Instagram Product Team:**
- Target: Increase user engagement (time spent in app)
- Pain Point: "We launch features based on gut feeling, not user data"
- What They Care About: User engagement metrics, feature adoption, competitive differentiation

**BA Impact:** You work closely with Product Managers to define requirements for new features based on user research and data.

### 7. IT/Technology/Engineering
**What They Do:** Build, maintain, and secure the systems that run the business

**Real Example - Banking IT Team:**
- Target: Keep online banking running 24/7 with zero downtime
- Pain Point: "Business teams request features without explaining the business case or priority"
- What They Care About: System uptime, security, technical debt, clear requirements

**BA Impact:** You're the bridge - translating business needs into technical requirements developers can actually build.

### 8. Compliance/Legal/Risk
**What They Do:** Ensure the company follows laws, regulations, and internal policies

**Real Example - TikTok Compliance:**
- Target: Comply with data protection laws in every country they operate
- Pain Point: "Our app collects user data, but we can't prove we're GDPR-compliant because data deletion isn't automated"
- What They Care About: Regulatory compliance, audit trails, risk mitigation

**BA Impact:** You might define requirements for a "right to be forgotten" feature that lets users delete all their data.

### 9. Human Resources (HR)
**What They Do:** Recruit, onboard, develop, and retain employees

**Real Example - Google HR:**
- Target: Hire 10,000 people per year while maintaining quality
- Pain Point: "Our applicant tracking system is slow - recruiters lose top candidates to competitors"
- What They Care About: Time to hire, employee retention, diversity metrics

**BA Impact:** You might help streamline the recruitment process or build a performance review system.

## The Problem: Departmental Silos

Here's what happens in most organizations:

**Marketing** creates a campaign promising "next-day delivery."
**Sales** sells it to customers.
**Operations** can't actually deliver next-day in half the country.
**Customer Service** gets flooded with angry calls.
**Finance** has to issue refunds.

Each department optimized for their own goals - but nobody looked at the whole picture. This is called **working in silos**.

## Your Role: The Cross-Functional Connector

As a BA, you break down silos. Here's a real scenario:

**Project:** Improve the checkout experience for an e-commerce site

**Bad Approach (Siloed):**
- Ask Marketing what they want: "Make it prettier and add trust badges"
- Ask IT: "Reduce page load time"
- Build both, deploy, done.

**Good BA Approach (Cross-Functional):**

1. **Talk to Customer Service:** "What do customers complain about?"
   - Answer: "Shipping costs surprise them at the last step"

2. **Talk to Finance:** "What's our cart abandonment rate costing us?"
   - Answer: "We lose £2M annually to abandoned carts"

3. **Talk to Operations:** "Can we accurately predict shipping costs earlier?"
   - Answer: "Yes, but we need the customer's postcode first"

4. **Talk to Marketing:** "Would showing shipping costs upfront reduce conversions?"
   - Answer: "Actually, transparency builds trust - conversions might increase"

5. **Talk to IT:** "How hard is it to calculate shipping earlier in the journey?"
   - Answer: "Easy if we ask for postcode on the first page"

**Your BA Solution:** Move postcode collection to the first page and show shipping costs upfront. Result:
- Reduces cart abandonment (Finance wins)
- Reduces angry calls (Customer Service wins)
- Improves trust and conversions (Marketing wins)
- Easy to build (IT wins)
- Doesn't overload logistics (Operations wins)

## How to Work Across Departments

### 1. Learn Their Language
- Finance talks about ROI, cost savings, revenue impact
- IT talks about APIs, databases, system architecture
- Operations talks about throughput, efficiency, error rates
- Marketing talks about conversion, engagement, brand awareness

**Pro Tip:** When talking to Finance, say "This will reduce manual processing costs by £50K/year." Don't say "This will be cool."

### 2. Understand Their Pain Points
Every department has recurring frustrations. Ask:
- "What takes up most of your time that shouldn't?"
- "What do you wish you could do but can't?"
- "Where do things regularly break or go wrong?"

### 3. Map the Handoffs
Most problems happen at **handoffs** between departments:
- Sales → Operations: "Sales promised custom delivery, but didn't tell us"
- Marketing → Customer Service: "They ran a promo without warning us - call volume doubled"
- Finance → IT: "They need a report but can't explain what data they actually need"

**Your job:** Document these handoffs and fix the gaps.

### 4. Get Everyone in the Same Room
When you run workshops or requirements sessions, invite representatives from ALL affected departments. Don't let Sales define requirements without talking to Operations.

## Real BA Scenario: The Departmental Minefield

**Project:** Build a new pricing tool for sales reps

**If you only talk to Sales:**
They'll ask for flexibility - "Let us set any price we want for each customer!"

**If you also talk to Finance:**
"No way - we need pricing controls to maintain profit margins."

**If you also talk to Compliance:**
"Some industries have regulations - we can't discriminate pricing."

**If you also talk to IT:**
"We can build it, but we need clear rules for what's allowed."

**Your BA solution:**
Define a pricing tool with:
- Predefined pricing tiers (Finance rule)
- Sales can offer discounts within a 15% range (Sales flexibility)
- Automated approval workflow for discounts >15% (Compliance check)
- Integration with CRM for audit trail (IT requirement)

Everyone compromises, but everyone gets value.

## Key Takeaway

As a BA, **you are a cross-functional translator**. You:
- Speak each department's language
- Understand their goals and constraints
- Connect the dots between silos
- Ensure solutions work for the whole business, not just one team

The best BAs don't just gather requirements - they build bridges between departments and create solutions that work for everyone.

---

**Next up:** Why do projects actually happen? Let's explore the triggers that kick off BA work.
`
      },
      {
        id: 'lesson-1-4',
        title: 'Why Projects Happen',
        type: 'reading',
        duration: '8 min',
        content: `# Why Projects Happen

Projects don't just appear out of thin air. Something triggers them - a crisis, an opportunity, a regulation, or a frustrated CEO who's tired of hearing complaints.

**Understanding WHY projects happen helps you shape better solutions** because the trigger tells you what success looks like.

## The 5 Main Triggers for Projects

### 1. A Problem That's Costing Money

**Real Example - WhatsApp Downtime:**
In 2021, WhatsApp went down for 7 hours. Facebook (Meta) lost an estimated $100M in ad revenue because people weren't using their apps.

**Project Triggered:** "Improve system resilience to prevent future outages"

**BA's Role:** Define requirements for backup systems, failover processes, and better monitoring. The project isn't about "making it work better" - it's about preventing million-dollar losses.

**Everyday Example:**
Imagine Uber drivers are complaining the app crashes during peak hours. Lost rides = lost revenue. A project is triggered to fix stability.

### 2. A New Regulation or Compliance Requirement

**Real Example - Cookie Consent:**
When GDPR became law in 2018, every website in the EU had to add cookie consent banners. Non-compliance = fines up to €20M or 4% of global revenue.

**Project Triggered:** "Implement GDPR-compliant cookie consent"

**BA's Role:** Define requirements for:
- What data we collect
- How users can opt out
- How we store and delete data
- Audit trails to prove compliance

**Everyday Example:**
Banking apps had to add two-factor authentication when regulators demanded stronger security. Not optional - legally required.

### 3. Growth Plans (We Want to Expand)

**Real Example - Spotify Entering India:**
When Spotify launched in India in 2019, they couldn't just copy-paste their UK app. They had to:
- Support local languages (Hindi, Tamil, etc.)
- Integrate local payment methods (UPI, Paytm)
- License different music (Bollywood, regional artists)
- Price subscriptions differently (₹119/month vs £9.99)

**Project Triggered:** "Localize Spotify for the Indian market"

**BA's Role:** Work with local teams to understand requirements, define what "localization" means, and ensure the app works for Indian users.

### 4. Customer Complaints or Poor Experience

**Real Example - Instagram's Chronological Feed:**
Users complained for years that Instagram's algorithm made them miss posts from friends. In 2022, Instagram brought back the chronological feed option.

**Project Triggered:** "Give users control over their feed sorting"

**BA's Role:** Define requirements for:
- How users switch between algorithmic and chronological
- What "chronological" actually means (by post time or by time you follow someone?)
- How to handle ads in a chronological feed

**Everyday Example:**
Amazon introduced "Subscribe & Save" because customers complained about re-ordering essentials (toilet paper, coffee) every month. The project addressed a real pain point.

### 5. Competitive Pressure (Our Competitors Are Beating Us)

**Real Example - Apple Pay:**
When Google launched Google Pay (Android Pay) in 2015, Apple was under pressure. They couldn't let Android have the only mobile wallet.

**Project Triggered:** "Build Apple Pay to compete with Google Pay"

**BA's Role:** Research what Google Pay offers, identify gaps, define requirements for a competitive alternative, and ensure it integrates with existing Apple services.

**Everyday Example:**
When TikTok exploded, Instagram rushed to build Reels. YouTube built Shorts. Everyone copied the feature to stay competitive.

## Projects vs. Business-as-Usual (BAU)

Not everything is a project. Here's the difference:

### Projects (Temporary, Goal-Driven)
- Have a start and end date
- Aim to create something new or change something
- Require a team dedicated to the outcome
- Have a defined budget

**Examples:**
- Build a new checkout system (6 months, then done)
- Migrate from old CRM to Salesforce (1 year, then done)
- Launch in a new country (9 months, then done)

### Business-as-Usual (Ongoing, Repetitive)
- Happens every day, week, or month
- No end date - it's part of normal operations
- Uses existing systems and processes

**Examples:**
- Process customer orders (happens daily forever)
- Respond to support tickets (ongoing)
- Run payroll (monthly, ongoing)

**Why This Matters for BAs:**
When someone asks you to "improve order processing," you need to ask: "Are we building something new (project)? Or fixing an ongoing process (process improvement)?"

## How BAs Prevent Wasted Projects

Here's the harsh truth: **30-50% of IT projects fail** (source: industry research). They either:
- Go over budget
- Miss deadlines
- Get cancelled halfway
- Deliver something nobody uses

**Why?** Usually because:
- The problem wasn't clear
- Requirements were vague
- Stakeholders didn't agree on the goal
- The solution didn't match the actual need

**Your job as a BA? Prevent this waste.**

## Real Scenario: A Project That Should Never Have Happened

**Company:** Online fashion retailer

**What They Said:** "We need a mobile app"

**What a Bad BA Does:**
"Okay, let's build an app!" (6 months and £500K later, nobody uses it)

**What a Good BA Does:**

1. **Ask Why:** "What problem are we solving with an app?"
   - Answer: "Our website doesn't work well on mobile"

2. **Dig Deeper:** "Why not just fix the mobile website?"
   - Answer: "Um... we assumed an app was better?"

3. **Analyze:** Check data - 80% of mobile users just browse, they buy on desktop later

4. **Define:** "We don't need an app. We need a responsive mobile website that lets users save favorites and get notifications when items go on sale."

**Result:** £50K to fix the website vs £500K to build an app nobody wanted. Project saved £450K.

## Your First Question as a BA

When someone says "We need to start a project," always ask:

**"What problem are we trying to solve, and how will we know if we've solved it?"**

If they can't answer clearly, the project isn't ready to start.

---

**Next up:** We'll explore exactly why companies hire Business Analysts - and what value you bring.
`
      },
      {
        id: 'lesson-1-5',
        title: 'Why BAs Are Hired',
        type: 'reading',
        duration: '7 min',
        content: `# Why BAs Are Hired

Imagine a company spends £2 million building a new feature. It launches. Nobody uses it. Months later, it's quietly removed. What went wrong?

**Someone built the wrong thing** - and that's exactly why companies hire Business Analysts.

## The Problem BAs Solve

Without a BA, this happens all the time:

### Scenario 1: The Feature Nobody Asked For

**Company:** A banking app

**What Happened:**
- Executive says: "Customers want cryptocurrency trading!"
- Developers spend 9 months building it
- Launch day: 0.3% of users try it
- Cost: £1.5M wasted

**Why it Failed:**
Nobody asked customers if they actually wanted crypto trading. Turns out, most users just wanted faster bank transfers.

**If a BA was involved:**
- Talk to customers: "What's frustrating about our app?"
- Discover: "Transfers take 3 days - that's the real pain"
- Define: "Build instant transfers, not crypto"
- Result: Feature people actually use

### Scenario 2: The Requirements Mess

**Company:** E-commerce site

**What Happened:**
- Marketing says: "We need personalized product recommendations"
- Developers build an algorithm
- Launch: It recommends men's shoes to women, cat food to dog owners
- Complaint tickets explode

**Why it Failed:**
Nobody defined what "personalized" means. Developers guessed.

**If a BA was involved:**
- Define "personalized": Based on browsing history, purchase history, and demographic data
- Specify business rules: Don't recommend products they just bought, filter by gender/pet type
- Test criteria: Recommendations must have 70%+ click-through rate
- Result: System that actually works

### Scenario 3: The Stakeholder War

**Company:** Healthcare provider

**What Happened:**
- Doctors want a fast, simple patient record system
- Compliance wants detailed audit trails and data controls
- IT wants to use existing infrastructure
- Finance wants the cheapest option
- Project stalls for 18 months, nobody agrees

**Why it Failed:**
No one balanced the competing needs. Everyone fought for their priorities.

**If a BA was involved:**
- Facilitate workshops to align stakeholders
- Define must-haves (compliance requirements) vs nice-to-haves (doctor preferences)
- Find compromises: Simple UI for doctors, detailed logging in the background for compliance
- Result: Solution that works for everyone

## What BAs Actually Provide

### 1. Clarity

BAs turn vague ideas into clear, actionable requirements.

**Bad (Without BA):** "Make the app faster"

**Good (With BA):** 
- Page load time must be under 2 seconds on 4G
- Search results must appear within 1 second
- Checkout process must complete in under 3 clicks

### 2. Alignment

BAs get everyone on the same page before building starts.

**Without BA:**
- Sales promises custom features to clients
- Operations has no idea these promises were made
- Developers build what they think is right
- Result: Chaos

**With BA:**
- Document what Sales is promising
- Check with Operations if it's feasible
- Define clear scope with developers
- Result: Everyone knows what's being built

### 3. Risk Reduction

BAs spot problems before they become expensive disasters.

**Example:**
A company wants to integrate with a third-party payment system.

**Without BA:**
- Developers build the integration
- Launch day: Discover the payment system doesn't support subscriptions
- Have to rebuild everything

**With BA:**
- Research the payment system first
- Discover the limitation early
- Choose a different provider or adjust the approach
- Result: Avoid expensive rework

### 4. Better Decisions

BAs provide data and analysis so leaders make informed choices.

**Without BA:**
"Let's build feature X because the CEO's friend suggested it."

**With BA:**
"Our user research shows feature Y would increase revenue by 15%. Feature X would cost £200K but only impact 2% of users. Recommendation: Build Y first."

## Real Example: Airbnb's Booking Flow

When Airbnb was growing, they noticed high drop-off rates during booking. Users would browse listings but abandon before paying.

**Without a BA:**
"Let's redesign the whole checkout to make it prettier!"

**What Airbnb's team (acting as BAs) actually did:**

1. **Analyzed data:** Where exactly do users drop off?
   - Answer: At the payment step

2. **Talked to users:** "Why did you stop booking?"
   - Answer: "I wasn't sure about the cancellation policy"

3. **Discovered the real problem:** Cancellation policies were buried in small print

4. **Defined the solution:** Show cancellation policy prominently before payment

5. **Result:** Booking completion rate increased by 12%

They didn't need a redesign. They needed clarity at the right moment.

## Why Companies Are Willing to Pay for BAs

A good BA prevents:
- £500K spent building the wrong feature
- 12 months wasted on a project that gets cancelled
- Teams working on conflicting priorities
- Products that launch but nobody uses

**ROI Example:**
- BA salary: £50K/year
- Projects saved from failure: 3
- Average cost per failed project: £300K
- Money saved: £900K
- Return on investment: 18x

## What Happens Without a BA?

### The "Telephone Game" Problem

**CEO** says: "We need to improve customer retention"
**Product Manager** hears: "Build a loyalty program"
**Developer** hears: "Add a points system"
**Result:** A points system nobody understands or uses

**With a BA:**
- Ask the CEO: "What does improved retention look like? What's the target?"
- Analyze data: Why are customers leaving?
- Discover: Customers leave because customer service is slow
- Define: Improve customer service response time (not a loyalty program)

### The "Build It and Hope" Problem

Teams build what they think users want, without actually asking.

**Example - Google Glass:**
Google spent years building smart glasses. Launched in 2014. Flopped. Why? Nobody wanted to wear a camera on their face in public.

**Better approach:**
- Test the idea with real users first (prototypes, interviews)
- Discover concerns early (privacy, social awkwardness)
- Pivot or cancel before investing millions

## Your Value as a BA

When someone asks, "Why do we need a BA?" the answer is:

**"To make sure we build the right thing, for the right people, at the right time - before we waste time and money building the wrong thing."**

---

**Next up:** We'll dive into what a BA actually does day-to-day - and what they don't do.
`
      },
      {
        id: 'lesson-1-6',
        title: 'What a BA Does (and Doesn\'t Do)',
        type: 'reading',
        duration: '8 min',
        content: `# What a BA Does (and Doesn't Do)

People often confuse Business Analysts with other roles. "You write code, right?" or "So you're a project manager?" Let's clear this up.

**A BA's job is to define the 'what' and 'why' - not the 'how'.**

## What BAs Actually Do

### 1. Ask Questions (A Lot of Them)

BAs are professional question-askers. They dig until they understand the real problem.

**Example - Uber Eats Order Delays:**

**Surface Level:**
- Complaint: "Food arrives cold"
- Bad response: "Tell drivers to drive faster"

**BA Questioning:**
- "How often does this happen?" → Data shows it's 23% of orders
- "Which restaurants have the most issues?" → Fast food chains
- "What's different about those orders?" → Multiple items, long prep time
- "When do delays happen?" → Dinner rush (6-8pm)
- **Root cause:** Drivers arrive before food is ready, then wait 15 minutes

**Solution:** Show drivers real-time prep status before they leave, and adjust pickup times during peak hours.

### 2. Gather Information from Many Sources

BAs don't just talk to one person - they connect the dots across the organization.

**Information Sources:**
- **Users/Customers:** What problems do they face?
- **Stakeholders:** What are business goals?
- **Data/Analytics:** What does usage data show?
- **Existing Systems:** What tools are already in place?
- **Competitors:** What are others doing?
- **Regulations:** What laws apply?

**Example - Banking App Security:**
A bank wants to "improve security." The BA gathers:
- Customer feedback: "Too many password resets, it's annoying"
- Security team: "We need multi-factor authentication"
- Compliance: "GDPR requires clear consent for biometric data"
- IT: "Our current system can integrate fingerprint and face ID"
- Data: 40% of users abandon registration if it's too complicated

**BA's synthesis:** Implement biometric login (fingerprint/face ID) as an option, not mandatory, with clear privacy consent.

### 3. Document Requirements Clearly

BAs turn messy conversations into precise, testable requirements.

**Bad Requirement (Vague):**
"Users should be able to search for products easily"

**Good Requirement (Clear):**
- Users can search by typing keywords (product name, category, brand)
- Search results appear within 1 second
- Results are ranked by relevance (exact matches first, then partial matches)
- Users can filter results by price, rating, and availability
- Search history is saved for logged-in users

**The difference?** A developer can build from the second one. The first one is just a wish.

### 4. Create Documentation

BAs produce different types of documents depending on what the team needs:

**Common BA Deliverables:**
- **User Stories:** "As a shopper, I want to save items to a wishlist so I can buy them later"
- **Process Maps:** Visual diagrams showing how work flows (e.g., "Order to Delivery" process)
- **Requirements Specifications:** Detailed docs listing what the system must do
- **Acceptance Criteria:** How to test if a feature works (e.g., "Given a user adds an item, when they refresh the page, then the item remains in the wishlist")
- **Data Models:** What information the system needs to store

### 5. Facilitate Workshops and Meetings

BAs run sessions to get stakeholders aligned.

**Example Workshop - E-Commerce Returns Process:**

**Attendees:** Customer Service, Warehouse Operations, Finance, IT

**BA Facilitates:**
- Present current return process (slow, manual, frustrating for customers)
- Identify pain points from each department
- Brainstorm solutions together
- Prioritize which changes have the biggest impact
- Define new return process that works for everyone

**Outcome:** Agreement on automated return labels, 7-day return window, and real-time refund processing.

### 6. Analyze Data and Identify Patterns

BAs look at usage data, customer feedback, and business metrics to spot trends.

**Example - Spotify Podcast Discovery:**

**Data Analysis:**
- 60% of users who try podcasts become regular listeners
- But only 15% of users discover the podcast feature
- Most users who find it do so by accident

**BA Insight:** The problem isn't the podcasts - it's discoverability

**Recommendation:** Add a "Podcasts for You" section on the homepage, not buried in settings

### 7. Bridge Technical and Non-Technical Worlds

BAs translate between business language and technical language.

**Business:** "We need better customer insights"

**BA translates to IT:** "We need a dashboard that shows:
- Customer acquisition cost by channel (Google Ads, Facebook, organic)
- Customer lifetime value by segment
- Churn rate by product category
- Real-time sales by region"

**IT can now build it** because the requirement is specific and technical.

## What BAs DON'T Do

### ❌ BAs Don't Write Code

You're not a developer. You don't build the software.

**Your job:** Define what it should do
**Developer's job:** Build it

### ❌ BAs Don't Design the UI

You're not a UX/UI designer. You don't create mockups or choose colors.

**Your job:** Define what users need to do (e.g., "Users must be able to filter products")
**Designer's job:** Make it beautiful and intuitive

### ❌ BAs Don't Manage the Project

You're not a project manager. You don't manage timelines, budgets, or resource allocation.

**Your job:** Define the scope and requirements
**Project Manager's job:** Ensure it's delivered on time and on budget

### ❌ BAs Don't Test the Software

You're not a QA tester. You don't run test scripts or find bugs.

**Your job:** Define what "working correctly" means (acceptance criteria)
**Tester's job:** Verify it actually works

### ❌ BAs Don't Make Final Decisions

You provide analysis and recommendations, but stakeholders decide.

**Your job:** "Based on user research, Option A will increase conversions by 15%, but costs £50K. Option B costs £20K but only improves conversions by 5%."

**Stakeholder's job:** Decide which to build based on budget and priorities.

## The BA's Superpower: Clarity

Your real skill isn't technical knowledge - it's **asking the right questions and making complex things simple**.

**Example - Tesla Autopilot Naming:**

When Tesla called their feature "Autopilot," people assumed it meant "self-driving." Accidents happened because drivers thought they didn't need to pay attention.

**A BA's role in this scenario:**
- Clarify: "What exactly does Autopilot do vs. full self-driving?"
- Define: "Autopilot = Lane keeping and adaptive cruise control. Driver must stay alert."
- Recommend: "We need clear messaging: 'Hands on wheel, eyes on road'"
- Document: User education requirements, warning messages, legal disclaimers

## A Day in the Life of a BA

**9:00 AM** - Review emails and Slack messages. Customer support flagged a recurring issue with checkout.

**9:30 AM** - Meet with Customer Service team to understand the checkout problem. Take notes.

**10:30 AM** - Pull data: How many users abandon checkout? At which step?

**11:00 AM** - Workshop with Marketing, IT, and Finance to discuss a new loyalty program. Facilitate discussion, capture requirements.

**12:30 PM** - Lunch (and catch up on Slack)

**1:30 PM** - Write user stories for the loyalty program based on the morning workshop.

**3:00 PM** - Review a developer's implementation of a previous feature. Check if it meets acceptance criteria.

**4:00 PM** - Call with a vendor to understand their API capabilities for a future integration.

**4:45 PM** - Update requirements document, send to stakeholders for review.

**5:30 PM** - Wrap up, plan tomorrow's workshops.

## Key Takeaway

**A BA defines the problem and the solution requirements. They don't build it, design it, manage it, or test it - but they make sure everyone knows what "it" is before anyone starts working.**

---

**Next up:** Let's dive into the specific business problems BAs are hired to solve.
`
      },
      {
        id: 'lesson-1-7',
        title: 'Business Problems BAs Solve',
        type: 'reading',
        duration: '9 min',
        content: `# Business Problems BAs Solve

Every company has problems. Processes that waste time. Systems that don't talk to each other. Features customers hate. **BAs exist to solve these problems - or prevent them from happening in the first place.**

## The 7 Most Common Problems BAs Tackle

### 1. "Nobody Knows What We're Actually Building"

**The Problem:**
A project starts with excitement, but 3 months in, everyone has a different idea of what they're building.

**Real Example - Slack Notifications:**

Imagine Slack is building a new notification system.

- **Product Manager** thinks: "Smart notifications that learn what's important"
- **Engineers** think: "Mute/unmute toggle for channels"
- **Customer Success** thinks: "Email summaries of missed messages"
- **Users** actually want: "Just don't ping me after 10pm!"

**Without a BA:** Everyone builds different parts that don't fit together.

**With a BA:**
- Run a workshop: Get everyone in the same room
- Define the scope: What is in/out of scope for this release?
- Write user stories: Clear requirements everyone agrees on
- Result: One cohesive feature that actually solves the problem

### 2. "Our Processes Are Inefficient and Manual"

**The Problem:**
Teams waste hours on repetitive tasks that could be automated or streamlined.

**Real Example - Expense Approvals:**

**Current State:**
1. Employee fills out PDF form
2. Emails it to their manager
3. Manager prints, signs, scans
4. Emails to Finance
5. Finance manually enters data into accounting system
6. Emails back approval or rejection
7. **Total time: 3-5 days per expense**

**BA's Process:**
- Map the current process (identify bottlenecks)
- Interview stakeholders: Where does it break?
- Find pain points: Manual data entry, email delays, no tracking
- Design future state: Online form → Auto-routing → Manager clicks approve → Finance sees it instantly
- Result: 3-5 days → 30 minutes

### 3. "Our Systems Don't Talk to Each Other"

**The Problem:**
Data lives in separate systems. People waste time copying information between tools.

**Real Example - E-Commerce Order Processing:**

**The Silos:**
- Orders come into Shopify
- Customer data lives in Salesforce
- Inventory is tracked in a warehouse system
- Shipping uses a different tool
- Finance uses QuickBooks

**Problem:** When an order comes in, someone has to manually copy data between all 5 systems.

**BA's Solution:**
- Map data flows: What information needs to go where?
- Define integration requirements: Connect Shopify to warehouse system, auto-update inventory
- Spec automation: When order placed → Create invoice in QuickBooks → Generate shipping label → Update customer record
- Result: 20 minutes of manual work → Automated

### 4. "We're Building Features Nobody Uses"

**The Problem:**
Teams build features based on assumptions, not user needs.

**Real Example - Microsoft Clippy:**

Remember Clippy, the annoying paperclip in Microsoft Word?

- **Microsoft's assumption:** "Users need help writing documents"
- **Reality:** "This interrupts my work and doesn't actually help"
- **Result:** Feature removed, became a joke

**BA's Prevention:**
- Conduct user research BEFORE building
- Define success criteria: "Feature must have 40%+ adoption within 3 months"
- Test with prototypes first
- Build MVPs (minimum viable products) to validate assumptions

### 5. "We Have Conflicting Business Requirements"

**The Problem:**
Different departments want different things, and they can't all win.

**Real Example - Amazon Prime Free Returns:**

**Customer Service wants:** Unlimited free returns (keeps customers happy)
**Finance wants:** Limit returns (costs £20 per return to process)
**Operations wants:** Reduce return fraud (people abuse free returns)
**Marketing wants:** Promote "easy returns" (competitive advantage)

**BA's Role:**
- Facilitate trade-off discussions
- Quantify impacts: What does each option cost vs. benefit?
- Find compromise: Free returns up to 30 days, then £5 fee. Flag suspicious patterns (same item returned 5 times).
- Document the decision and rationale

### 6. "We Can't Scale - Our System Breaks Under Load"

**The Problem:**
The business is growing, but the technology can't keep up.

**Real Example - Black Friday Sales:**

**The Issue:**
An e-commerce site crashes every Black Friday because too many people shop at once.

**BA's Approach:**
1. **Analyze the problem:** At what traffic level does it crash? (10,000 concurrent users)
2. **Define business need:** Handle 50,000 concurrent users by next Black Friday
3. **Gather requirements:**
   - Must process 500 orders/minute
   - Page load time must stay under 3 seconds
   - Payment system must handle peak load without downtime
4. **Work with IT:** Define scalability requirements
5. **Test:** Run load tests before launch

### 7. "Compliance Issues - We're Breaking the Law (Accidentally)"

**The Problem:**
Regulations change. Companies accidentally violate laws because their systems weren't built for compliance.

**Real Example - Age Verification for Social Media:**

New laws require social media apps to verify users are 13+. Many apps just had a checkbox saying "I am over 13" (easily bypassed).

**BA's Compliance Project:**
- Research regulations: What exactly does the law require?
- Define verification method: Upload ID, parent consent, or facial age estimation?
- Specify data handling: How to store verification data securely and compliantly?
- Document audit trails: Prove to regulators we're compliant
- Result: Compliant system that passes legal audits

## How BAs Solve These Problems

### Step 1: Understand the Current State

Map out how things work today. Talk to people who do the work daily. Identify pain points.

**Tools BAs Use:**
- Process maps (visual diagrams)
- Interviews with stakeholders
- Data analysis
- Observation (shadowing users)

### Step 2: Define the Desired Future State

What should it look like when the problem is solved?

**Good Future State:**
- Specific: "Reduce order processing time from 3 days to 4 hours"
- Measurable: "Increase customer satisfaction score from 3.2 to 4.5"
- Achievable: Based on realistic constraints
- Aligned: Supports business goals

### Step 3: Bridge the Gap

Identify what needs to change to get from current state to future state.

**Gap Analysis:**
- What processes need to change?
- What systems need to be built or updated?
- What data is needed?
- Who needs to be trained?

### Step 4: Define Requirements

Write clear, testable requirements for the solution.

**Example Requirements for Automated Expense Approvals:**
- Employees can submit expenses via web or mobile app
- Managers receive push notifications for approvals
- Auto-approval for expenses under £50
- Finance sees real-time expense dashboard
- Receipts are stored securely and retrievable for 7 years (tax requirement)

### Step 5: Support Implementation

Work with the team building the solution. Answer questions. Clarify requirements. Test that it works.

## Real BA Success Story: Domino's Pizza Tracker

**The Problem:**
Customers called Domino's constantly asking, "Where's my pizza?" Call centers were overwhelmed.

**BA's Analysis:**
- 40% of calls are just "Where is my order?"
- Customers feel anxious when they don't know status
- Call center costs £500K/year just for order status calls

**BA's Solution:**
Define requirements for a real-time order tracker:
- Show order status: Preparing → Baking → Quality Check → Out for Delivery
- Update in real-time
- SMS/app notification when driver is 5 minutes away
- Reduce "Where's my order?" calls by 80%

**Result:**
- Call volume dropped 70%
- Customer satisfaction increased
- Saved £350K/year in call center costs
- Became a competitive differentiator (copied by competitors)

## Key Takeaway

**BAs don't just document what people say they want. They dig deeper to find the real problem, then define a solution that actually works.**

---

**Next up:** We'll complete Part 1 by exploring essential BA skills you need to master.
`
      },
      {
        id: 'lesson-1-8',
        title: 'Agile and Waterfall',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Agile and Waterfall',
          'Waterfall means plan everything up front, then build. Agile means break the work into small chunks and adjust along the way. In Agile, BAs work closely with teams during each sprint. In Waterfall, BAs often define everything before development begins.',
          [
            'Waterfall means plan everything up front, then build.',
            'Agile means break the work into small chunks and adjust along the way.',
            'In Agile, BAs work closely with teams during each sprint.',
            'In Waterfall, BAs often define everything before development begins.'
          ]
        )
      },
      {
        id: 'lesson-1-9',
        title: 'Understanding the Problem',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'Understanding the Problem',
          'Most people focus on symptoms — BAs go deeper. Good BAs ask "What\'s really going wrong here?" You\'re not paid to guess — you\'re paid to confirm. The wrong solution to the wrong problem still fails.',
          [
            'Most people focus on symptoms — BAs go deeper.',
            'Good BAs ask "What\'s really going wrong here?"',
            'You\'re not paid to guess — you\'re paid to confirm.',
            'The wrong solution to the wrong problem still fails.'
          ]
        )
      },
      {
        id: 'lesson-1-10',
        title: 'Working With Stakeholders',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Working With Stakeholders',
          'BAs interview stakeholders to understand different perspectives. You\'ll deal with conflict, uncertainty, and unclear needs. Listening well builds trust — guessing loses it. Keep stakeholders involved and aligned.',
          [
            'BAs interview stakeholders to understand different perspectives.',
            'You\'ll deal with conflict, uncertainty, and unclear needs.',
            'Listening well builds trust — guessing loses it.',
            'Keep stakeholders involved and aligned.'
          ]
        )
      },
      {
        id: 'lesson-1-11',
        title: 'Working With Developers',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Working With Developers',
          'Developers rely on you to explain what needs to be built — clearly. You don\'t need to know code, but you must speak clearly and be available. You remove confusion and answer questions — fast. When you\'re clear, developers build better and faster.',
          [
            'Developers rely on you to explain what needs to be built — clearly.',
            'You don\'t need to know code, but you must speak clearly and be available.',
            'You remove confusion and answer questions — fast.',
            'When you\'re clear, developers build better and faster.'
          ]
        )
      },
      {
        id: 'lesson-1-12',
        title: 'Understanding Systems and Processes',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Understanding Systems and Processes',
          'Processes = what people do. Systems = the tools they use to do it. BAs map out both — especially when things aren\'t working. A great system can still fail if the process behind it is broken. Always check how people and tech interact — that\'s where the truth is.',
          [
            'Processes = what people do. Systems = the tools they use to do it.',
            'BAs map out both — especially when things aren\'t working.',
            'A great system can still fail if the process behind it is broken.',
            'Always check how people and tech interact — that\'s where the truth is.'
          ]
        )
      },
      {
        id: 'lesson-1-13',
        title: 'Spotting Inefficiencies',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'Spotting Inefficiencies',
          'Look for delays, double entry, unclear handoffs, and manual rework. You may hear: "It\'s just how we do it." That\'s your cue. Inefficiencies hide inside normal routines. Your job is to question what everyone else ignores.',
          [
            'Look for delays, double entry, unclear handoffs, and manual rework.',
            'You may hear: "It\'s just how we do it." That\'s your cue.',
            'Inefficiencies hide inside normal routines.',
            'Your job is to question what everyone else ignores.'
          ]
        )
      },
      {
        id: 'lesson-1-14',
        title: 'Tools Business Analysts Use',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Tools Business Analysts Use',
          'Common tools: Jira (requirements), Confluence (documentation), Excel (data), Miro (flows), Lucidchart (diagrams). You\'ll use CRM systems, ticketing platforms, and internal apps too. You don\'t need to master them all — just know how to use them for clarity. Good thinking always matters more than flashy tools.',
          [
            'Common tools: Jira (requirements), Confluence (documentation), Excel (data), Miro (flows), Lucidchart (diagrams).',
            'You\'ll use CRM systems, ticketing platforms, and internal apps too.',
            'You don\'t need to master them all — just know how to use them for clarity.',
            'Good thinking always matters more than flashy tools.'
          ]
        )
      }
    ],
    assignmentTitle: 'BA Role Understanding',
    assignmentDescription: 'In your own words, explain what a Business Analyst does and why organizations hire them. Include at least 3 specific responsibilities.'
  },

  // MODULE 2: Project Initiation
  {
    id: 'module-2-project-initiation',
    title: 'Project Initiation',
    description: 'Learn how projects start and the BA\'s role from day one',
    icon: '🚀',
    color: 'purple',
    order: 2,
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'What a BA Does (and Doesn\'t Do)',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'What a BA Does (and Doesn\'t Do)',
          'They ask questions, gather info, and document what the business really needs. They write clear requirements — not vague guesses. They don\'t code, design, or test directly — but support those who do. Their job is to define the \'what\' and \'why\' — not the \'how\'.',
          [
            'They ask questions, gather info, and document what the business really needs.',
            'They write clear requirements — not vague guesses.',
            'They don\'t code, design, or test directly — but support those who do.',
            'Their job is to define the \'what\' and \'why\' — not the \'how\'.'
          ]
        )
      },
      {
        id: 'lesson-2-2',
        title: 'How a BA Works',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'How a BA Works',
          'They speak with stakeholders to uncover goals, gaps, and conflicts. They map out current and future states. They write user stories, acceptance criteria, and sometimes process flows. They support delivery teams by keeping the focus on solving the right problem.',
          [
            'They speak with stakeholders to uncover goals, gaps, and conflicts.',
            'They map out current and future states.',
            'They write user stories, acceptance criteria, and sometimes process flows.',
            'They support delivery teams by keeping the focus on solving the right problem.'
          ]
        )
      }
    ],
    assignmentTitle: 'BA Workflow Analysis',
    assignmentDescription: 'Describe the key activities a BA performs during project initiation. What questions should they ask first?'
  },

  // MODULE 3: Requirements Elicitation
  {
    id: 'module-3-elicitation',
    title: 'Requirements Elicitation',
    description: 'Master the art of gathering requirements from stakeholders',
    icon: '🎯',
    color: 'green',
    order: 3,
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Working With Stakeholders',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Working With Stakeholders',
          'BAs interview stakeholders to understand different perspectives. You\'ll deal with conflict, uncertainty, and unclear needs. Listening well builds trust — guessing loses it. Keep stakeholders involved and aligned.',
          [
            'BAs interview stakeholders to understand different perspectives.',
            'You\'ll deal with conflict, uncertainty, and unclear needs.',
            'Listening well builds trust — guessing loses it.',
            'Keep stakeholders involved and aligned.'
          ]
        )
      },
      {
        id: 'lesson-3-2',
        title: 'Elicitation Techniques',
        type: 'reading',
        duration: '12 min',
        content: `# Elicitation Techniques

Different situations require different approaches to gathering requirements.

## Common Techniques

### 1. **Interviews** (One-on-One)
Best for deep dives with key stakeholders. Prepare open-ended questions and listen actively.

### 2. **Workshops** (Group Sessions)
Best for aligning multiple stakeholders and resolving conflicts. Use facilitation techniques.

### 3. **Observation**
Watch how people actually work vs. what they say they do. Identify workarounds and pain points.

### 4. **Document Analysis**
Review existing documentation, system manuals, and compliance requirements.

### 5. **Prototyping**
Build mockups to clarify unclear requirements and get visual feedback.

## Key Principle

Ask open-ended questions: "How does this work today?" not "Do you want feature X?"`
      }
    ],
    assignmentTitle: 'Elicitation Strategy',
    assignmentDescription: 'Choose an elicitation technique and explain when you would use it and why. Provide a specific scenario.'
  },

  // MODULE 4: Process Mapping
  {
    id: 'module-4-process-mapping',
    title: 'Process Mapping',
    description: 'Visualize and analyze business processes',
    icon: '🗺️',
    color: 'indigo',
    order: 4,
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Understanding Systems and Processes',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Understanding Systems and Processes',
          'Processes = what people do. Systems = the tools they use to do it. BAs map out both — especially when things aren\'t working. A great system can still fail if the process behind it is broken. Always check how people and tech interact — that\'s where the truth is.',
          [
            'Processes = what people do. Systems = the tools they use to do it.',
            'BAs map out both — especially when things aren\'t working.',
            'A great system can still fail if the process behind it is broken.',
            'Always check how people and tech interact — that\'s where the truth is.'
          ]
        )
      },
      {
        id: 'lesson-4-2',
        title: 'Spotting Inefficiencies',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'Spotting Inefficiencies',
          'Look for delays, double entry, unclear handoffs, and manual rework. You may hear: "It\'s just how we do it." That\'s your cue. Inefficiencies hide inside normal routines. Your job is to question what everyone else ignores.',
          [
            'Look for delays, double entry, unclear handoffs, and manual rework.',
            'You may hear: "It\'s just how we do it." That\'s your cue.',
            'Inefficiencies hide inside normal routines.',
            'Your job is to question what everyone else ignores.'
          ]
        )
      }
    ],
    assignmentTitle: 'Process Analysis',
    assignmentDescription: 'Map a simple "as-is" process (e.g., customer refund request) and identify 2-3 inefficiencies or bottlenecks.'
  },

  // MODULE 5: Requirements Engineering
  {
    id: 'module-5-requirements-engineering',
    title: 'Requirements Engineering',
    description: 'Document, validate, and manage requirements',
    icon: '⚙️',
    color: 'orange',
    order: 5,
    lessons: [
      {
        id: 'lesson-5-1',
        title: 'Types of Requirements',
        type: 'reading',
        duration: '10 min',
        content: `# Types of Requirements

Not all requirements are the same. Understanding types helps you organize and prioritize.

## Functional Requirements
What the system must DO:
- "System must allow photo upload"
- "System must send confirmation email"
- "System must validate email format"

## Non-Functional Requirements (NFRs)
How the system should PERFORM:
- Performance: "Page loads in < 2 seconds"
- Security: "Passwords must be encrypted"
- Usability: "Mobile responsive"

## Business Rules
Policies and logic:
- "Refunds only within 30 days"
- "Managers approve up to £5,000"
- "Students under 18 need parent consent"

## Constraints
Limitations you must work within:
- Budget caps
- Technology restrictions
- Compliance requirements`
      }
    ],
    assignmentTitle: 'Requirements Classification',
    assignmentDescription: 'Given a scenario, write 2 functional requirements, 2 non-functional requirements, and 1 business rule.'
  },

  // MODULE 6: Solution Options  
  {
    id: 'module-6-solution-options',
    order: 6,
    title: 'Solution Options',
    description: 'Evaluate and recommend solutions',
    icon: '💡',
    color: 'yellow',
    lessons: [
      {
        id: 'lesson-6-1',
        title: 'Evaluating Alternatives',
        type: 'reading',
        duration: '12 min',
        content: `# Evaluating Solution Alternatives

Rarely is there only one way to solve a problem.

## Common Solution Types

### 1. Build Custom
- Full control, exact fit
- High cost, high time

### 2. Buy Off-the-Shelf
- Fast deployment, proven
- Less flexibility

### 3. Configure Existing
- Leverage what you have
- Limited by current tech

### 4. SaaS/Outsource
- No maintenance
- Vendor dependency

## Decision Criteria
- Cost (initial + ongoing)
- Time to deploy
- Risk level
- Scalability
- Business fit

Use a decision matrix to score and compare options objectively.`
      }
    ],
    assignmentTitle: 'Solution Comparison',
    assignmentDescription: 'Evaluate 3 solution options for a business problem using a decision matrix. Recommend the best option and justify your choice.'
  },

  // MODULE 7: Documentation (User Stories & ACs)
  {
    id: 'module-7-documentation',
    title: 'Documentation',
    description: 'Write clear, testable user stories and acceptance criteria',
    icon: '✍️',
    color: 'teal',
    order: 7,
    lessons: [
      {
        id: 'lesson-7-1',
        title: 'User Story Format',
        type: 'reading',
        duration: '10 min',
        content: `# User Story Format

User stories are the building blocks of Agile development.

## The Standard Format

**As a** [role]  
**I want** [action]  
**So that** [benefit]

### Example
**As a** customer  
**I want** to reset my password  
**So that** I can regain access to my account

## INVEST Criteria
- **I**ndependent
- **N**egotiable  
- **V**aluable
- **E**stimable
- **S**mall
- **T**estable

Without "so that", you might build features nobody needs.`
      },
      {
        id: 'lesson-7-2',
        title: 'Acceptance Criteria',
        type: 'reading',
        duration: '12 min',
        content: `# Acceptance Criteria

ACs define when a story is "done."

## Given-When-Then Format

**Given** [context]  
**When** [action]  
**Then** [expected outcome]

### Example

**AC 1:**  
Given I am on the login page  
When I click "Forgot Password"  
Then I should see a password reset form

**AC 2:**  
Given I enter a valid email  
When I click "Send Reset Link"  
Then I receive an email within 5 minutes

Good ACs are specific, testable, and cover edge cases.`
      }
    ],
    assignmentTitle: 'User Story Writing',
    assignmentDescription: 'Write 2 user stories with 3 acceptance criteria each for a tenant repair request system. Follow INVEST principles.'
  },

  // MODULE 8: Design
  {
    id: 'module-8-design',
    title: 'Design',
    description: 'Understand design principles and collaborate with designers',
    icon: '🎨',
    color: 'pink',
    order: 8,
    lessons: [
      {
        id: 'lesson-8-1',
        title: 'BA Role in Design',
        type: 'reading',
        duration: '10 min',
        content: `# BA Role in Design

As a BA, you don't create pixel-perfect designs, but you must understand design principles.

## Your Responsibilities

### 1. Gather Design Requirements
- What must users be able to do?
- What information must be visible?
- What's the user's mental model?

### 2. Bridge Business and Design
- Translate business needs to design constraints
- Explain user workflows to designers
- Validate designs meet requirements

### 3. Review and Validate
- Do mockups support all user stories?
- Are acceptance criteria achievable?
- Is the flow intuitive?

## What You're NOT Doing
❌ Creating UI mockups  
❌ Choosing colors and fonts  
❌ Building prototypes

## What You ARE Doing
✅ Defining what must be included  
✅ Validating user flows  
✅ Ensuring business rules are reflected`
      }
    ],
    assignmentTitle: 'Design Requirements',
    assignmentDescription: 'Write design requirements for a user dashboard. What must be visible? What actions must users be able to take?'
  },

  // MODULE 9: MVP
  {
    id: 'module-9-mvp',
    title: 'MVP',
    description: 'Identify and prioritize minimum viable features',
    icon: '🎯',
    color: 'red',
    order: 9,
    lessons: [
      {
        id: 'lesson-9-1',
        title: 'What is an MVP?',
        type: 'reading',
        duration: '11 min',
        content: `# What is an MVP?

Minimum Viable Product - the smallest version that delivers value.

## MVP vs. Final Product

### ❌ Wrong Approach
"Build 10% of every feature"  
→ Result: Nothing works properly

### ✅ Correct Approach
"Build 100% of the most critical 10% of features"  
→ Result: Small but functional product

## MoSCoW Prioritization

- **Must Have**: Core functionality (MVP)
- **Should Have**: Important but not critical
- **Could Have**: Nice to have
- **Won't Have**: Out of scope

## The One-Feature Test

If you could only ship ONE feature, what would it be?
That's your starting point.

## Example

**Full Product**: Tenant repair system
- Submit request ✅ MVP
- Upload photos ✅ MVP
- Track status ✅ MVP
- Rate service ❌ Phase 2
- Schedule appointment ❌ Phase 2
- Live chat ❌ Future`
      }
    ],
    assignmentTitle: 'MVP Feature Prioritization',
    assignmentDescription: 'Given a full feature list for an app, identify the MVP using MoSCoW. Justify why you included/excluded each feature.'
  },

  // MODULE 10: Agile & Scrum
  {
    id: 'module-10-agile-scrum',
    title: 'Agile & Scrum Basics',
    description: 'Understand Agile methodologies and Scrum framework',
    icon: '🔄',
    color: 'cyan',
    order: 10,
    lessons: [
      {
        id: 'lesson-10-1',
        title: 'Agile and Waterfall',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Agile and Waterfall',
          'Waterfall means plan everything up front, then build. Agile means break the work into small chunks and adjust along the way. In Agile, BAs work closely with teams during each sprint. In Waterfall, BAs often define everything before development begins.',
          [
            'Waterfall means plan everything up front, then build.',
            'Agile means break the work into small chunks and adjust along the way.',
            'In Agile, BAs work closely with teams during each sprint.',
            'In Waterfall, BAs often define everything before development begins.'
          ]
        )
      },
      {
        id: 'lesson-10-2',
        title: 'Scrum Framework',
        type: 'reading',
        duration: '14 min',
        content: `# Scrum Framework

Scrum is the most popular Agile framework.

## The Scrum Team

**Product Owner**
- Defines what to build
- Prioritizes the backlog

**Scrum Master**
- Facilitates the process
- Removes impediments

**Development Team**
- Builds the product
- Self-organizing

## Scrum Events

**Sprint** (2 weeks)
Fixed-length iteration

**Sprint Planning**
What will we build? How?

**Daily Stand-up** (15 min)
What did I do? What will I do? Blockers?

**Sprint Review**
Demo completed work, get feedback

**Sprint Retrospective**
What went well? What can we improve?

## BA's Role
You might BE the Product Owner or work closely with them to refine the backlog and clarify requirements.`
      }
    ],
    assignmentTitle: 'Scrum Ceremony Analysis',
    assignmentDescription: 'Describe what happens in each Scrum ceremony and what a BA contributes to each one.'
  }
];

/**
 * Get module by ID
 */
export const getModuleById = (moduleId: string): Module | undefined => {
  return LEARNING_MODULES.find(m => m.id === moduleId);
};

/**
 * Get lesson by ID within a module
 */
export const getLessonById = (moduleId: string, lessonId: string): Lesson | undefined => {
  const module = getModuleById(moduleId);
  return module?.lessons.find(l => l.id === lessonId);
};

/**
 * Get next module ID
 */
export const getNextModuleId = (currentModuleId: string): string | undefined => {
  const currentIndex = LEARNING_MODULES.findIndex(m => m.id === currentModuleId);
  if (currentIndex === -1 || currentIndex === LEARNING_MODULES.length - 1) {
    return undefined;
  }
  return LEARNING_MODULES[currentIndex + 1].id;
};

