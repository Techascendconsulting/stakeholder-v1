import React, { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { Users, Grid, MessageCircle, Mic, Target, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { supabase } from "../../lib/supabase";
import AssignmentPlaceholder from "../../views/LearningFlow/AssignmentPlaceholder";
import { getModuleProgress, markModuleCompleted } from "../../utils/learningProgress";
import { getNextModuleId } from "../../views/LearningFlow/learningData";

const lessons = [
  { 
    id: "who-are-stakeholders", 
    title: "Who Are Stakeholders?",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    content: `After joining a project and reviewing the initial documents, you might think you're ready to start gathering requirements. But there's a critical step first: understanding who your stakeholders are.

## The £2 Million Mistake

Let me tell you about Sarah, a junior BA who learned this lesson the hard way. She was assigned to improve an online booking system for a hotel chain. The project sponsor told her the goal was simple: "make bookings faster." Sarah spent six weeks working with the IT team, designed a streamlined booking flow, and proudly presented it to management.

The response? Silence. Then the complaints started.

The customer service team was furious. Sarah's "streamlined" system had removed the ability to modify bookings—a feature they used hundreds of times daily to handle customer changes. The marketing team was equally upset. The new system no longer captured the booking data they needed for their campaigns. And the finance team? They discovered too late that the payment processing no longer integrated properly with their accounting software.

The project was scrapped. £2 million wasted. All because Sarah had only spoken to two groups of people: the project sponsor and the IT team. She had forgotten to identify all her stakeholders.

## What Is a Stakeholder?

A stakeholder is anyone who has a stake in what you're about to build. They're the people who will be affected by the changes, the decision-makers who can approve or block your work, and the experts who hold the information you desperately need to understand the problem. Think of them as the invisible architects of your project's success or failure.

Here's a better way to think about it. Imagine you're remodeling a house. The obvious stakeholders are the homeowners—they're paying for it and will live there. But what about the neighbors who'll endure months of noise? The planning authority who must approve the work? The utility companies whose pipes and cables run under the property? The future buyers who might value (or hate) your design choices?

Missing any of these stakeholders could derail your project. The planning authority could halt construction. The utility company could discover you've violated regulations. The neighbors could file noise complaints. Each stakeholder holds a piece of the puzzle, and as a Business Analyst, your first job is to find all the pieces.

## A Real Project: The Warehouse Management System

Let me walk you through a real example. You've been assigned to implement a new warehouse management system for a logistics company. On day one, the project sponsor tells you: "We need to track inventory better and reduce picking errors."

Your first instinct might be to start talking to the warehouse manager and the IT team. That's a start, but it's nowhere near enough.

Let's think about who else is involved in warehouse operations. When a product arrives at the warehouse, who actually receives it? The receiving team—they unload trucks, check quantities against purchase orders, and log items into the system. If your new system makes their job harder, they'll find workarounds or simply resist using it.

Who puts products away into storage locations? The put-away team. They need to know where everything goes, and they need the system to guide them efficiently. Miss them in your requirements gathering, and you'll design storage logic that doesn't match how they actually work.

Who picks items when customer orders come in? The picking team. They walk the warehouse with handheld scanners, and every second counts. If your system slows them down with extra clicks or confusing screens, picking errors will increase, not decrease.

But it doesn't stop there. Who handles discrepancies when the wrong items arrive or customers return products? The customer service team. They're not in the warehouse, but they depend entirely on accurate inventory data. Miss them, and your system won't support the edge cases they deal with daily.

Who approves the budget for this project? The CFO. Who signs off on technical architecture? The IT Director. Who ensures the system complies with health and safety regulations? The compliance officer. Who negotiates with the software vendor? The procurement team.

That's at least twelve different stakeholder groups, and we haven't even mentioned external stakeholders like suppliers who need to send advance shipping notifications, or delivery drivers who might need to access the system to confirm collections.

If you only speak to the warehouse manager, you'll build a system that works for management but frustrates the people who actually use it every day. If you ignore finance, you might design something they can't reconcile with accounting systems. If you skip IT operations, you'll deploy a system they can't support.

## Understanding the Project Sponsor: Your Most Important Stakeholder

Before we talk about finding all your stakeholders, you need to understand one role that matters more than any other: the project sponsor.

The sponsor is the person who holds the budget for the project. They're the senior leader who said "yes, we'll fund this" and whose name is on the business case approval. When things go wrong, it's their reputation on the line. When the project succeeds, it's their achievement. This makes them both powerful and deeply invested in the outcome.

**A Real Example: The Retail Operations Director**

On a point-of-sale system upgrade I worked on, the sponsor was Helen, the Retail Operations Director. She'd convinced the Board to approve £2.8 million for new tills across 150 stores. Why? Because the old tills were so slow that queues at peak times were driving customers to competitors. She'd calculated that faster checkouts would increase revenue by £5 million annually.

Helen wasn't just a name on a document. She was the person who'd staked her professional credibility on this project delivering results. If it failed, her judgment would be questioned. If it succeeded, she'd be promoted. This meant she cared—deeply—about every decision I made as the BA.

When I discovered the proposed till system couldn't integrate with the loyalty card program (a requirement Helen had explicitly mentioned in the business case), I didn't email her a status update. I called her immediately. Why? Because missing that requirement would have undermined the entire business case she'd sold to the Board.

**What Sponsors Actually Do**

The sponsor isn't the person doing the work. They don't build the solution or manage the day-to-day project tasks. Instead, they:

**Provide the budget**: They've secured funding and can authorize additional spend if needed. When I needed to add £50K for extra training, Helen was the person who approved it.

**Remove blockers**: When IT said they couldn't support real-time integration (a critical requirement), Helen escalated to the IT Director and got it prioritized. Sponsors have organizational authority you don't.

**Make strategic decisions**: When we had to choose between a faster rollout with fewer features or a slower rollout with everything, Helen made the call based on business priorities.

**Champion the project**: In leadership meetings, Helen defended the project's value and fought for resources. Without her advocacy, the project could have been delayed or cancelled.

**Hold you accountable**: Helen expected me to deliver what I'd promised. Our weekly calls weren't just friendly chats—she asked tough questions and expected honest answers.

Understanding your sponsor means understanding their motivations. Helen wasn't sponsoring this project out of kindness. She was doing it because she believed faster tills would drive revenue, reduce customer complaints, and advance her career. My job as a BA was to help her achieve those goals.

**Why This Matters to You**

Your relationship with the sponsor shapes everything. If they trust you, they'll give you access to other stakeholders, defend your decisions, and support you when challenges arise. If they don't trust you, they'll micromanage, second-guess your work, and potentially replace you.

In every project, one of your first tasks is to identify the sponsor and understand what success means to them personally. Not just what the business case says—what they actually care about. Talk to them directly. Ask: "What does success look like for you? What keeps you up at night about this project? How can I make your life easier?"

The sponsor is almost always your highest-priority stakeholder. They have the power to make or break your project, and they have the most to lose (or gain) from its outcome.

## How to Find Your Other Stakeholders

Now that you understand the sponsor's role, let's talk about finding everyone else.

When you first join a project, start by reviewing every document you've been given. The project brief, the business case, the org charts—they all contain clues. Every time you see a name, a role, or a department mentioned, write it down. That's your starting list.

Then speak to your project sponsor or manager. Ask them: "Who else should I be talking to?" This simple question often reveals stakeholders who weren't obvious from the documents. The sponsor might mention that Legal needs to approve data handling, or that an external vendor provides the current system.

But don't stop there. As you speak to each stakeholder, ask them the same question: "Who else is affected by this?" The warehouse manager might mention that the dispatch team relies on inventory data. The dispatch team might reveal that delivery drivers need real-time stock visibility. Each conversation reveals more stakeholders, like pulling a thread that unravels a hidden network of connections.

## What Happens When You Miss Stakeholders

I once worked with a BA named Marcus who was implementing a new expense management system. He spoke to Finance (who requested it), IT (who would build it), and a few managers (who would approve expenses). The system launched on schedule and under budget. Success, right?

Wrong.

Within days, complaints flooded in. Employees couldn't submit expenses from their phones—Marcus had only tested desktop workflows. International employees couldn't submit foreign currency expenses—Marcus had only considered UK operations. Contractors and freelancers couldn't access the system at all—Marcus had assumed only full-time employees would use it.

The system had to be rebuilt. The project timeline doubled. Employee satisfaction plummeted. All because Marcus had failed to identify three critical stakeholder groups: mobile users, international employees, and external contractors.

Missing a stakeholder doesn't just mean missing their requirements. It means missing their perspective, their constraints, and their ability to champion (or sabotage) your project. A Legal team member you didn't consult can halt your project at the last minute for compliance violations. End users you didn't involve can resist adoption and make your project fail despite being technically correct.

## Your Starting Point

At this stage of the project, your goal is to create a master list of everyone who has a stake in the outcome. Don't worry about how you'll engage them yet—that comes later. For now, focus on building the most complete picture possible of who matters to this project and why.

Start with the obvious stakeholders: the project sponsor, the people who requested the change, and the teams who will use the solution. Then expand outward. Who supports those teams? Who approves their budgets? Who relies on the data they produce? Who regulates their industry?

This detective work—asking questions, reading documents, mapping connections—is the foundation of successful stakeholder management. Get it right, and you'll gather requirements from all the right people. Get it wrong, and you'll build something nobody wanted, solving problems nobody had.

---

**Next**: Once you know who your stakeholders are, you need to understand how much attention each one deserves. That's where stakeholder analysis comes in.`
  },
  { 
    id: "power-interest-analysis", 
    title: "How to Prioritize Stakeholders",
    icon: Grid,
    color: "from-indigo-500 to-purple-500",
    bgColor: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
    content: `You've identified your stakeholders. You've got a list of twenty names across different departments. Now comes the uncomfortable truth: you can't give everyone the same level of attention. You have limited time, limited energy, and stakeholders who will demand more than you can give.

## The Monday Morning Dilemma

Picture this. It's Monday morning, 9 AM. Your email inbox has fifteen messages from stakeholders. The CFO wants a budget update. The warehouse manager needs to discuss process changes. Three end users have sent detailed feedback on your draft requirements. The IT Director wants to know your technical approach. The project sponsor expects a weekly catch-up. And five other people want "just 15 minutes of your time."

If you try to respond to everyone with the same level of detail and urgency, you'll burn out by Wednesday. Worse, you'll give detailed technical updates to executives who don't care about the details, while ignoring critical input from people who actually use the system every day.

This is where stakeholder analysis saves you. It's not about ignoring people—it's about being strategic with your time and attention so you can serve everyone appropriately.

## The Power/Interest Framework

The most practical way to prioritize stakeholders is to ask two simple questions about each person: "How much authority do they have over this project?" and "How much do they care about the outcome?"

Based on these answers, stakeholders fall into four categories. Let me show you what this looks like in practice, using a real project I worked on: implementing a new CRM system for a sales organization.

## Category 1: Manage Closely (High Power, High Interest)

These are your core partners. They have both the authority to make decisions and a burning personal interest in getting this right. Missing them means project failure.

**Example: The Sales Director**

On my CRM project, the Sales Director had approved the £300K budget, her entire sales team would use the system daily, and her annual bonus depended on improving sales efficiency by 20%. She had both the power to cancel the project and a personal stake in its success.

Here's how I actually managed this relationship:

**Weekly one-on-ones every Monday at 10 AM**. Not emails—actual conversations. I'd walk her through last week's progress, any roadblocks I'd hit, and what was coming next. She'd ask questions, raise concerns, and sometimes redirect priorities. These 30-minute conversations prevented weeks of wasted work because I caught issues early.

**Real-time escalation when problems emerged**. When I discovered the current CRM couldn't integrate with their email marketing tool, I didn't wait for Monday. I sent her a Slack message that afternoon: "We've hit a blocker. Can we talk tomorrow?" She appreciated the heads-up and helped me negotiate with IT to find a solution.

**Involvement in key decisions before they're final**. When designing the customer pipeline stages, I shared three draft options with her on Thursday, asking: "Which approach makes most sense for how your team actually works?" She chose option 2, suggested a modification, and felt ownership of the design. When it launched, she championed it to her team because it was partly her solution.

**Visibility into the details**. She received detailed requirements documents, wireframe mockups, and progress reports. Not because she asked for them, but because she needed to trust that I understood her team's needs. The detail built confidence.

This isn't about being at someone's beck and call. It's about recognizing that this person's support is critical, so you invest the time to build a genuine partnership. You don't just inform them—you collaborate with them.

## Category 2: Keep Satisfied (High Power, Low Interest)

These are senior people with authority but less interest in the day-to-day details. They care about outcomes, not how you get there.

**Example: The CFO**

On the same CRM project, the CFO had ultimate authority—she could cancel the project if costs spiraled. But her interest was minimal. She didn't care which CRM platform we chose or what fields the sales team needed. She cared about three things: staying within budget, delivering ROI, and avoiding surprises.

Here's how I kept her satisfied:

**Monthly one-page summaries via email**. Every first Friday of the month, she received a concise update: budget status (£275K spent of £300K), timeline (on track for Q4 launch), risks (integration complexity—being managed), and next month's focus. One page. No jargon. Skimmable in 90 seconds.

**Proactive communication on anything that affected budget or timeline**. When I realized we needed an additional integration that would cost £15K, I didn't bury it in a weekly report. I sent her a dedicated email: "Budget impact alert: Integration requirement will cost £15K. Here's why it's necessary and how I propose we cover it." She appreciated the direct communication and approved it immediately.

**No unnecessary meetings**. I didn't invite her to workshops or design reviews. Her calendar was too valuable, and she wouldn't have added value to those discussions. I respected her time by only engaging when she needed to make a decision or be informed of significant changes.

The result? She trusted me to manage the project without micromanaging, and when I needed her authority (like approving the extra £15K), she acted quickly because I'd built credibility by not wasting her time.

## Category 3: Keep Informed (Low Power, High Interest)

These are the people who care deeply but don't have decision-making authority. They're often your primary users—the people who will live with your solution every day.

**Example: The Sales Team**

The individual salespeople didn't control the project budget or timeline, but they cared intensely because the CRM would transform how they worked. If I ignored them, they'd resist the new system, and adoption would fail.

Here's how I kept them informed and involved:

**Monthly town halls**. I ran 30-minute lunch-and-learn sessions where I demo'd the new system, explained what was changing, and answered questions. "Will my existing customer data transfer?" "Can I still see my sales history?" "How long will training take?" These weren't requirements sessions—they were change management. I was building buy-in.

**Feedback surveys after each demo**. I sent a simple five-question survey: "What concerns do you have? What features are you most excited about? What would make this easier to learn?" I couldn't promise to implement every suggestion, but I showed them I was listening.

**Weekly email newsletter**. Every Friday, the sales team received a two-paragraph update: "This week we finalized the lead scoring feature. Next week we're testing the mobile app. Here's a screenshot of what you'll see." Visual, brief, and consistent.

**Beta testing group**. I recruited five salespeople to test the system before launch. They felt special (early access!), I got invaluable feedback, and they became advocates who helped train their colleagues.

The result? When the CRM launched, adoption was 85% in the first week because the sales team felt involved, not imposed upon.

## Category 4: Monitor (Low Power, Low Interest)

These are people peripherally connected to the project. They need awareness but not deep engagement.

**Example: The Facilities Team**

The facilities team needed to know we'd be running training sessions that required meeting rooms. They didn't care about CRM features or project timelines. They just needed a heads-up.

Here's how I monitored this relationship:

**Quarterly project newsletter**. They received the same email that went to the entire company: "The CRM project is progressing well. Launch scheduled for Q4." That was enough.

**Direct contact only when needed**. Two months before launch, I sent them one email: "We'll need the main conference room for three days in November for training sessions. Can you block those dates?" They confirmed, and that was our only direct interaction.

No meetings. No weekly updates. Just the minimal information they needed to support the project without distraction.

## Putting It All Together

Here's what this looked like in practice on my CRM project:

**Sales Director** (High Power, High Interest): Weekly one-on-ones, detailed involvement, real-time escalation = 3-4 hours per week

**CFO** (High Power, Low Interest): Monthly one-pagers, proactive alerts on budget/timeline issues = 30 minutes per month

**Sales Team** (Low Power, High Interest): Monthly town halls, newsletters, beta testing = 2 hours per month

**Facilities** (Low Power, Low Interest): One email when I needed meeting rooms = 5 minutes total

Same project. Four very different engagement approaches. Each stakeholder got exactly what they needed, and I didn't burn out trying to give everyone everything.

## How to Actually Do This

Step 1: List all your stakeholders. Don't filter yet—just write down every person or group you've identified.

Step 2: For each stakeholder, ask yourself: "Can they approve or block this project?" If yes, they have high power. If no, they have low power. Be honest. An end user might feel important, but if they can't actually stop the project, they have low power.

Step 3: For each stakeholder, ask: "How much do they care about this project?" If it's on their radar daily, they have high interest. If they'd barely notice if the project disappeared, they have low interest.

Step 4: Plot them into the four categories I've described above.

Step 5: For each category, decide on your engagement approach. Manage Closely gets weekly time. Keep Satisfied gets monthly summaries. Keep Informed gets newsletters and workshops. Monitor gets minimal contact.

This isn't a rigid formula. You'll adjust based on personalities, project phases, and emerging issues. But it's a starting point that prevents you from either overwhelming stakeholders with information they don't want or neglecting people who need your attention.

---

**Next**: You've categorized your stakeholders. Now you need to build an actual communication plan—who gets what information, when, and how.`
  },
  { 
    id: "communication-planning", 
    title: "Building Your Communication Plan",
    icon: MessageCircle,
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
    content: `You've identified your stakeholders. You've categorized them by power and interest. Now comes the practical question: what do you actually send to each group, and when?

## The Communication Breakdown

I once inherited a project from a BA who'd been "keeping everyone informed." He sent the same fifteen-page weekly report to forty stakeholders. Every single one. The CEO, the end users, the external vendors—everyone got the same dense document full of technical jargon and minute details.

The result? Nobody read it. The CEO's assistant filtered it straight to trash. End users complained it was incomprehensible. The project sponsor missed a critical risk buried on page 12 and was blindsided when it materialized.

The BA thought he was being thorough. In reality, he was creating noise, not communication.

Good communication isn't about sending lots of information. It's about sending the right information to the right people at the right time in a format they'll actually consume.

## What "Manage Closely" Really Means in Practice

Let's start with your highest-priority stakeholders. You've identified them as high power, high interest. But what does "manage closely" actually mean day to day?

**The Weekly Rhythm**

On my warehouse project, the Operations Director fell into this category. Here's what our weekly rhythm looked like:

**Monday morning**: 30-minute one-on-one call. I'd prepared a simple agenda: three things progressed last week, two blockers, one decision needed. She'd ask questions, give guidance, and we'd align on priorities for the week ahead.

**Mid-week**: I'd send a quick update if anything significant happened. Not a formal report—just a Slack message: "Good news—IT confirmed they can support real-time stock sync. Moving forward with that approach." Or: "Heads up—the vendor demo revealed a limitation with batch tracking. Can we discuss tomorrow?"

**Friday afternoon**: If I'd drafted new requirements or made significant design decisions, I'd share them: "Attached are the receiving process requirements. Does this match what you had in mind?" She'd review over the weekend or Monday morning, giving feedback before I finalized anything.

**Ad hoc**: When urgent issues emerged (like discovering the current system's database was incompatible with the new one), I'd call her immediately. Not in a week. Not tomorrow. Immediately. Because she had the authority to make decisions that could unblock me, and delays cost money.

Notice what I didn't do: I didn't schedule daily meetings. I didn't copy her on every email. I didn't demand hours of her time. But I ensured she was never surprised, always consulted on key decisions, and had the information she needed to support the project confidently.

## What "Keep Satisfied" Looks Like in Real Life

Now let's talk about those high-power, low-interest stakeholders. They can kill your project, but they don't want to be bothered with details.

**The Monthly One-Pager**

The CFO on my warehouse project fit this category. Here's the exact email I sent her on the first Friday of every month:

**Subject**: Warehouse Project - October Update

**Body**:

Hi Sarah,

Quick monthly update on the warehouse management project:

**Budget**: £410K spent of £500K (82%). On track for remaining spend.

**Timeline**: Go-live scheduled for January 15th. Currently on schedule.

**Progress**: Requirements completed. System build underway. User acceptance testing starts in 6 weeks.

**Risks**: One medium risk—integration with accounting software more complex than expected. IT is managing. No impact on timeline or budget anticipated.

**Next month**: Complete system build, begin testing with warehouse team.

Let me know if you need any additional details.

Best regards,  
[Your name]

That's it. One page. Skimmable in 60 seconds. No jargon. Clear status on the four things she cared about: budget, timeline, progress, risks.

She replied: "Thanks. Keep me posted if budget or timeline change."

That's a satisfied stakeholder. I'd given her exactly what she needed—confidence that the project was under control—without demanding time she didn't have.

**When to Escalate**

The only time I'd send an additional email to the CFO was if something threatened budget or timeline. When I discovered the accounting integration would require custom development adding £25K and two weeks, I sent an immediate alert:

**Subject**: Budget Increase Required - Accounting Integration

Explained the problem, the cost, the impact, and my recommendation in three short paragraphs. She appreciated the direct communication and approved it within an hour.

Keep Satisfied doesn't mean "only contact them once a month." It means "don't bother them with details, but give them visibility and involve them in decisions that require their authority."

## What "Keep Informed" Means with No Authority

Now we're talking about end users—the people who will use your solution daily but don't control the project.

On the warehouse project, this was the warehouse staff: receiving clerks, pickers, packers, and dispatchers. Twenty-three people who cared intensely because the system would change their entire workflow, but who had no authority to approve budget or designs.

**The Monthly Town Hall**

Every third Wednesday, I ran a 30-minute lunch session in the warehouse break room. I'd bring pizza (always a good investment) and show them progress.

**Month 1**: "Here's why we're doing this project. The current system is slow and error-prone. The new one will make your jobs easier. Here's what we're planning."

**Month 2**: "Here's what the new system will look like." I showed wireframes on a projector. "When you receive a delivery, you'll scan items like this. Then the system guides you to the right storage location. Sound like it'll work?"

**Month 3**: "We've built a test version. I need five volunteers to try it and tell me what's confusing." Five hands went up immediately.

**Month 4**: "Based on your feedback, we've changed how the picking screen works. See? We made the barcode bigger because you said it was hard to scan in dim warehouse lighting."

Notice what I did: I showed them progress regularly, I asked for their input, I demonstrated that their feedback mattered (by actually implementing their suggestions), and I made them feel like partners, not victims of change.

**The Weekly Newsletter**

Every Friday, all warehouse staff received a three-paragraph email:

**What we did this week**: Completed the receiving module testing  
**What you'll see**: In four weeks, the receiving team will start training  
**How this helps you**: No more manual data entry—scan and go  

Simple. Visual (I included screenshots). Consistent (same time every week). And brief (people actually read it).

**Beta Testing**

Six weeks before launch, I recruited ten warehouse staff to use the test system. They worked with it for two hours a week, gave feedback, and felt like insiders. When launch day came, these ten people helped train their colleagues and squashed resistance because they could say: "I've been using it for weeks. It's actually better."

## What "Monitor" Means (Minimal Effort)

Finally, there are stakeholders who need awareness but not engagement.

On the warehouse project, this included the HR team (they'd need to update job descriptions eventually), the marketing team (not affected by warehouse operations), and external logistics partners (they'd need a heads-up about system downtime during cutover).

**The Quarterly Newsletter**

These groups received one email every three months:

"The warehouse management project is progressing well. Go-live scheduled for January. No action required from your team at this stage."

That's it. No meetings. No detailed updates. Just enough information that they weren't blindsided if the topic came up in another context.

**Direct Contact Only When Needed**

Two weeks before launch, I sent one email to HR: "New warehouse system launches January 15th. You may want to update job descriptions to mention the new technology. Let me know if you need details."

They replied: "Thanks for the heads-up. We'll handle it after launch."

Total time invested in this stakeholder category? Maybe 30 minutes across the entire project.

## The Real Benefit

Here's what this approach gave me: I spent 70% of my time with the people who mattered most (Sales Director, warehouse management team, IT lead). I spent 20% keeping senior executives satisfied with minimal but timely information. I spent 10% on everyone else.

The project launched on time, under budget, with 85% user adoption in week one. Not because I worked 80-hour weeks, but because I was strategic about where I invested my energy.

Stakeholder analysis isn't about creating complicated frameworks. It's about answering a simple question every Monday morning: "Who needs my attention most this week, and what's the minimum I can give everyone else without dropping the ball?"

Get this right, and you'll be seen as organized, responsive, and strategic. Get it wrong, and you'll either burn out or miss critical stakeholders who could have helped you succeed.

---

**Next**: You know who to engage and how much attention they deserve. Now let's talk about actually running those stakeholder conversations—the interviews where requirements come from.`
  },
  { 
    id: "conducting-interviews", 
    title: "Conducting Stakeholder Interviews",
    icon: Mic,
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    content: `You've identified your stakeholders. You've analyzed their power and interest. You've planned your communication approach. Now it's time for the most important part: actually talking to them.

## The Interview That Changed Everything

Let me tell you about an interview I'll never forget. I was working on a patient management system for a hospital. I'd already spoken to the IT team, the hospital administrators, and the department heads. Everyone agreed: the current system was slow, and patients had to wait too long. The solution seemed obvious—faster processing, streamlined workflows, digital forms.

Then I interviewed Janet, a receptionist who'd worked at the hospital for seventeen years.

"Tell me about your day," I asked.

She described checking patients in, verifying insurance, updating medical records. Then she said something that stopped me cold: "The worst part? When patients are in pain and crying, I'm stuck typing into this slow system while they stand there suffering. Sometimes I skip entering data properly just to get them to a doctor faster. Then I stay late fixing my records."

Everything changed. The problem wasn't system speed—it was that the process forced painful trade-offs between patient care and administrative accuracy. The solution wasn't faster software. It was redesigning the workflow so receptionists could seat patients immediately and complete paperwork afterward.

One conversation. Seventeen minutes. Entire project direction shifted.

That's the power of stakeholder interviews. Documents tell you what people think the problem is. Interviews tell you what the problem actually is.

## What Makes an Interview Different from a Meeting

A lot of junior BAs treat stakeholder interviews like status meetings. They ask yes/no questions, take notes, and leave. That's not an interview—that's a waste of everyone's time.

A real stakeholder interview is a structured conversation designed to uncover truths that people don't realize they know. You're not just collecting facts. You're excavating insights.

Here's the difference:

**Bad interview**: "Do you want the system to process orders faster?"  
**Good interview**: "Walk me through what happens when an order comes in. At what point does the process slow down? What are you doing while you're waiting?"

The first question gets you a one-word answer. The second question gets you a story—and stories contain requirements.

## Before the Interview: Preparation That Matters

Never walk into an interview cold. Here's what I do 24 hours before meeting any stakeholder:

**Research the person**. I look them up on LinkedIn. I check the org chart to see who they report to and who reports to them. I ask colleagues: "What's Sarah like? What does she care about?" This isn't stalking—it's understanding context so I can ask relevant questions.

**Review relevant documents**. If I'm interviewing the finance manager about expense workflows, I read the current expense policy first. That way, I don't waste time asking questions Google could answer. I focus on what's not written down: the frustrations, the workarounds, the unspoken assumptions.

**Prepare open-ended questions**. I write down five to eight questions designed to make people tell stories. "How does this work today?" "What frustrates you most?" "Tell me about the last time this process failed." Questions that start with "How," "What," or "Tell me" force people to explain, not just confirm.

**Book the right amount of time**. I learned this the hard way. Thirty-minute interviews feel rushed. Stakeholders are just getting comfortable when time runs out. Now I book an hour for requirements interviews, forty-five minutes for validation sessions, and thirty minutes only for quick follow-ups.

**Send an agenda**. Two days before the meeting, I email the stakeholder:

"Hi Sarah, looking forward to our chat on Thursday. I'd like to understand how the current invoicing process works, where the bottlenecks are, and what you'd like to see improved. I'll ask questions and take notes—no PowerPoint, just conversation. See you at 2 PM."

This gives them time to think, sets expectations, and shows respect for their time.

## During the Interview: The First Five Minutes

How you start the interview matters more than you think. People are busy, often skeptical, and wondering: "Why am I here?"

Here's my standard opening for every interview:

"Thanks for making time, Sarah. I'm the Business Analyst on the invoicing project, and I'm here to learn from you. You work with this process every day, so you know where it's broken and what would make it better. Everything you share today will help us build something that actually works for you. There are no wrong answers—I'm here to listen and learn."

Then I shut up and let them respond.

This five-second script does three things: it clarifies my role (I'm here to learn, not judge), it elevates their expertise (you're the expert), and it sets expectations (this is a conversation, not an interrogation).

## The Power of Silence

Here's something that took me years to learn: the best interviews happen when I'm not talking.

Early in my career, I'd ask a question, get a partial answer, and immediately jump to my next question. I thought I was being efficient. I was actually cutting off valuable insights.

Now, when a stakeholder finishes answering, I pause for three seconds. Silence feels awkward at first, but here's what happens: people fill it. They add details they forgot to mention. They clarify points that didn't come out clearly. They reveal the real issue hiding beneath their polite answer.

**Example from my warehouse project**:

**Me**: "Tell me about what happens when a delivery arrives."

**Warehouse Manager**: "We check it against the purchase order and log it in the system."

**Me**: [Three seconds of silence]

**Warehouse Manager**: "Well, that's what we're supposed to do. What actually happens is we're so backed up that we just dump everything in the holding area and deal with it later. Sometimes 'later' is three days. Then we can't find things."

That second answer—the truth—only emerged because I didn't fill the silence with my next question.

## Real Example: The Interview That Revealed Hidden Requirements

Let me share an actual interview transcript (condensed) from my CRM project:

**Me**: "Sarah, thanks for meeting. Tell me about how you currently track customer interactions."

**Sales Manager**: "We use the old CRM, but honestly, most of us keep our own spreadsheets."

**Me**: "Why spreadsheets instead of the CRM?"

**Sales Manager**: "The CRM takes forever to update. I'm on a call with a client, they mention their kid is starting university, and I want to note that down so I can ask about it next time. But logging into the CRM, finding the right field, typing it in—it takes two minutes. By then, the conversation has moved on."

**Me**: [Silence]

**Sales Manager**: "So I jot it down in my spreadsheet during the call. Then later—if I remember—I might transfer it to the CRM. Usually I don't."

**Me**: "What happens to that information when you're on holiday and someone else covers your accounts?"

**Sales Manager**: "They don't have access to my spreadsheet. So they walk into client calls blind. It's embarrassing, and we've lost deals because of it."

**Me**: "If the new CRM could capture notes faster, how would that work in your ideal world?"

**Sales Manager**: "I'd love a mobile app. During or right after the call, I tap a button, speak a quick note—'Client's daughter starting uni'—and it's saved. No typing. No logging in on my laptop. Just captured."

That fifteen-minute conversation generated two major requirements: mobile-first design and voice-to-text note capture. Neither of those were in the original project brief. They only emerged because I asked open-ended questions and let the stakeholder tell me their truth.

## Handling Difficult Stakeholders

Not every interview goes smoothly. Sometimes stakeholders are hostile, vague, or convinced they know the solution before you've understood the problem.

**The Hostile Stakeholder**

On my hospital project, one department head was furious the new system was being imposed "without consulting us." (Spoiler: that's why I was interviewing him—to consult him.)

First five minutes, he ranted about IT projects that fail, money wasted, systems that make work harder. I didn't defend the project or argue. I listened. I said: "It sounds like you've had bad experiences with system changes before."

He softened. "Yeah. Last time, they built something that doubled our admin time."

"That's exactly why I'm here," I said. "To make sure that doesn't happen again. Tell me about your current process. What works? What doesn't?"

The rest of the interview was productive because I'd validated his frustration instead of dismissing it.

**The Vague Stakeholder**

Some people say things like "It just needs to be better" or "More user-friendly." That's not a requirement.

When this happens, I dig deeper: "When you say 'better,' can you give me an example of something that's not working well today?"

Or: "Help me understand what 'user-friendly' means to you. What would make your day easier?"

Vague answers usually mean the person hasn't thought deeply about the problem. Your job is to help them articulate what they're feeling but can't express.

**The "I Know the Solution" Stakeholder**

These stakeholders have decided what you should build before you've understood the problem.

"We need to automate the entire approval process."

Instead of arguing, I probe the problem beneath the solution: "Walk me through the current approval process. What makes it problematic?"

Often, they'll reveal that automation isn't the real answer. Maybe the problem is that approvals get stuck with one specific manager who's always traveling. The solution might be delegation rules, not full automation.

## After the Interview: The 24-Hour Rule

Here's a discipline I force myself to follow: write up interview notes within 24 hours. Not next week. Not when you have time. Tomorrow.

Why? Because memory fades fast. That brilliant insight the stakeholder shared? You'll forget the exact wording. The specific example they gave? Gone. The tone of concern when they described a particular issue? Lost.

I write notes in this format:

**Stakeholder**: Sarah Jenkins, Sales Manager  
**Date**: October 12, 2024  
**Key Themes**: Mobile access, voice notes, customer relationship tracking  
**Main Pain Points**: Current CRM too slow for real-time updates during calls  
**Requirements Identified**: Mobile app with voice-to-text note capture  
**Concerns**: Training time, data migration from spreadsheets  
**Follow-up**: Send her demo of mobile app when ready  

Then I send these notes to Sarah within 48 hours: "Here's what I captured from our conversation. Did I get it right? Anything I missed?"

This does two things: it validates I understood correctly, and it shows Sarah I was actually listening. People feel valued when you demonstrate you heard them.

## The Biggest Interview Mistake

The biggest mistake I see junior BAs make? They talk more than the stakeholder.

If you're doing 50% of the talking, you're doing it wrong. Aim for 80% stakeholder, 20% you. Your job is to listen, probe, and clarify—not to explain your ideas or jump to solutions.

I once sat in on an interview where a junior BA spent twenty minutes explaining the project's technical approach, then asked: "Does that work for you?" The stakeholder said: "Sure." The BA thought the interview was successful.

It was a disaster. The stakeholder didn't understand the technical jargon, didn't want to admit it, and gave a meaningless answer just to end the conversation. Zero useful requirements gathered.

Contrast that with this approach: "Tell me how this process works today. Where does it break down? What would make your job easier?"

Then shut up. Listen. Take notes. Probe when something's unclear: "Can you give me an example of that?" Let the stakeholder do the talking.

The quality of your requirements depends entirely on the quality of your interviews. Master this skill—asking great questions, listening deeply, probing gently—and you'll be a great Business Analyst. Treat interviews as a checklist to complete, and you'll build solutions nobody wants.

---

**Congratulations**! You've completed the Stakeholder Mapping module. You now understand who stakeholders are, how to prioritize them, and how to engage each group effectively. These skills form the foundation of every successful BA project—because great requirements don't come from documents. They come from great conversations with the right people.`
  }
];

const StakeholderMappingView: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState(lessons[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showAssignment, setShowAssignment] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const moduleId = 'module-3-stakeholder-mapping';

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user?.id) return;
    
    setLoadingProgress(true);
    try {
      const progress = await getModuleProgress(user.id, moduleId);
      setCompletedLessons(progress.completedLessons);
      setIsCompleted(progress.completed);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('completed_lessons')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      let currentLessons = data?.completed_lessons || [];
      if (!currentLessons.includes(lessonId)) {
        currentLessons = [...currentLessons, lessonId];
      }

      const { error: updateError } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed_lessons: currentLessons,
          updated_at: new Date().toISOString()
        });

      if (!updateError) {
        setCompletedLessons(currentLessons);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleModuleComplete = async () => {
    if (!user?.id) return;
    
    try {
      await markModuleCompleted(user.id, moduleId);
      setIsCompleted(true);
      
      // Navigate to next module
      const nextModuleId = getNextModuleId(moduleId);
      if (nextModuleId) {
        setTimeout(() => {
          setCurrentView(nextModuleId.replace('module-', '').replace(/-/g, '-') as any);
        }, 2000);
      }
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  const allLessonsCompleted = lessons.every(lesson => completedLessons.includes(lesson.id));
  const progressPercentage = (completedLessons.length / lessons.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Stakeholder Mapping</h1>
                <p className="text-purple-100 mt-1">Module 3: Identify, analyze, and plan engagement with key stakeholders</p>
              </div>
            </div>
            
            {isCompleted && (
              <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-300">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm font-semibold text-green-100">Module Completed</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-purple-100 mt-2">
            {completedLessons.length} of {lessons.length} lessons completed ({Math.round(progressPercentage)}%)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Lessons
                </h2>
              </div>
              
              <div className="p-4 space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      selectedLesson.id === lesson.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : completedLessons.includes(lesson.id)
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 hover:border-green-300'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${
                        selectedLesson.id === lesson.id ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                      }`}>
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <lesson.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold mb-1 ${
                          selectedLesson.id === lesson.id ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          Lesson {index + 1}
                        </div>
                        <div className={`text-sm font-semibold ${
                          selectedLesson.id === lesson.id ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {lesson.title}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Assignment Button */}
                <button
                  onClick={() => setShowAssignment(true)}
                  disabled={!allLessonsCompleted}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    showAssignment
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                      : allLessonsCompleted
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300'
                      : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${showAssignment ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold mb-1 ${
                        showAssignment ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Assignment
                      </div>
                      <div className={`text-sm font-semibold ${
                        showAssignment ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        Stakeholder Mapping Exercise
                      </div>
                      {!allLessonsCompleted && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Complete all lessons first
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {!showAssignment ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Lesson Header */}
                <div className={`bg-gradient-to-r ${selectedLesson.color} p-8 text-white`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <selectedLesson.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/80 mb-1">
                        Lesson {lessons.indexOf(selectedLesson) + 1} of {lessons.length}
                      </div>
                      <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                    </div>
                  </div>
                  
                  {completedLessons.includes(selectedLesson.id) && (
                    <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-300 inline-flex">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Completed</span>
                    </div>
                  )}
                </div>

                {/* Lesson Content */}
                <div className={`p-8 bg-gradient-to-br ${selectedLesson.bgColor}`}>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {selectedLesson.content.split('\n\n').map((section, index) => {
                      // Handle headers
                      if (section.startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0">
                            {section.replace('## ', '')}
                          </h2>
                        );
                      }
                      
                      // Handle bold markers (questions/emphasis)
                      if (section.startsWith('**') && section.endsWith('**')) {
                        const text = section.replace(/\*\*/g, '');
                        return (
                          <div key={index} className="bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500 p-4 rounded-r-lg my-4">
                            <p className="text-gray-900 dark:text-white font-semibold m-0">{text}</p>
                          </div>
                        );
                      }
                      
                      // Handle paragraphs with bold text
                      if (section.includes('**')) {
                        const parts = section.split('**');
                        return (
                          <p key={index} className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                            {parts.map((part, i) => (
                              i % 2 === 0 ? part : <strong key={i} className="font-bold text-gray-900 dark:text-white">{part}</strong>
                            ))}
                          </p>
                        );
                      }
                      
                      // Handle horizontal rules
                      if (section.trim() === '---') {
                        return <hr key={index} className="my-8 border-t-2 border-gray-200 dark:border-gray-700" />;
                      }
                      
                      // Regular paragraphs
                      if (section.trim()) {
                        return (
                          <p key={index} className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                            {section}
                          </p>
                        );
                      }
                      
                      return null;
                    })}
                  </div>

                  {/* Lesson Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const currentIndex = lessons.indexOf(selectedLesson);
                        if (currentIndex > 0) {
                          setSelectedLesson(lessons[currentIndex - 1]);
                        }
                      }}
                      disabled={lessons.indexOf(selectedLesson) === 0}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Lesson</span>
                    </button>

                    <div className="flex items-center space-x-4">
                      {!completedLessons.includes(selectedLesson.id) && (
                        <button
                          onClick={() => handleLessonComplete(selectedLesson.id)}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Mark Complete</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const currentIndex = lessons.indexOf(selectedLesson);
                          if (currentIndex < lessons.length - 1) {
                            setSelectedLesson(lessons[currentIndex + 1]);
                          } else {
                            setShowAssignment(true);
                          }
                        }}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors shadow-lg"
                      >
                        <span>{lessons.indexOf(selectedLesson) === lessons.length - 1 ? 'View Assignment' : 'Next Lesson'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AssignmentPlaceholder 
                moduleTitle="Stakeholder Mapping"
                assignmentTitle="Stakeholder Mapping Exercise"
                assignmentDescription="Create a comprehensive stakeholder analysis for a hypothetical project. Identify at least 8 stakeholders across different departments and external groups. Categorize each one by their power and interest level. Then write a detailed communication plan explaining HOW you would actually engage each group in real life—not just theory, but practical actions like 'weekly 30-minute one-on-ones' or 'monthly one-page summary emails.' Include specific examples of what information each group needs and when they need it."
                onBack={() => setShowAssignment(false)}
                onComplete={handleModuleComplete}
                moduleCompleted={isCompleted}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderMappingView;
