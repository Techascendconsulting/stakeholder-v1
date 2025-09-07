---
id: 3
title: "Scrum Events (Ceremonies)"
estMinutes: 15
---

Scrum is built around a repeating cycle called the sprint. A sprint is a short, fixed period of time — usually two weeks, sometimes up to four — where the team takes a set of requirements, builds them, and delivers a working part of the product.

Why short cycles? Because the longer you wait to deliver something, the more risk builds up. If you spend six months building before showing anything, you could be completely wrong by the time stakeholders see it. In a sprint, you deliver small slices of value quickly, get feedback, and adjust. This creates a rhythm: plan → build → show → reflect → repeat. That rhythm is what keeps progress visible, reduces wasted effort, and builds trust with stakeholders.

To support this rhythm, Scrum defines a series of events — sometimes called ceremonies. These are not empty meetings. Each one has a clear purpose: to prepare, to plan, to synchronise, to demonstrate, and to improve. For you as a BA, these events are the key points where your requirements move from vague ideas to working product.

Let's go through each event in order.

## Backlog Refinement — Making Work Ready

Backlog refinement is the ongoing activity where requirements are sharpened before they enter a sprint. But here's the key: refinement is not where requirements are first written. By the time refinement takes place, you as the BA have already written the requirement from your stakeholder discussions.

Your role is to bring that written story into refinement and work with the team to review it. Developers will ask questions, the Product Owner will check priority, and if gaps are found, you update the requirement. Ownership of writing remains with you, but refinement ensures that the story is small, clear, and testable before it goes into a sprint.

**Example:** Stakeholders say, "Onboarding is too slow." You have already written the story:
"As a new customer, I want to upload my ID online so that I can complete onboarding quickly."

And you've added acceptance criteria, like:
"Given a valid ID, when uploaded, then the system stores it securely."

In refinement, Developers ask:

- "What happens if the ID photo is blurry?"
- "Do we allow only passports and driving licences, or also national ID cards?"

You capture these, resolve them with stakeholders if needed, and update the story. By the end of refinement, the requirement is ready for delivery.

## Sprint Planning — Committing to the Sprint

Sprint Planning happens at the start of the sprint. The team asks: "What can we deliver in the next two weeks?"

The Product Owner brings the backlog, already prioritised. Developers discuss their capacity and select the top items they believe they can complete. The Scrum Master facilitates to ensure the discussion stays on track.

Your role as BA is to make sure the requirements are truly ready. Many teams use a checklist called the Definition of Ready (DoR). This says that before an item enters a sprint, it must be clear, small enough to complete in one sprint, have acceptance criteria, and no major unknowns.

In our onboarding case, the PO presents "Online ID upload" as the top priority. You walk the team through the user story and acceptance criteria. Developers ask, "What happens if the file is too large?" You either answer immediately or commit to confirming it quickly. With your clarity, the team commits with confidence.

## Daily Scrum — Staying Aligned

The Daily Scrum, sometimes called the stand-up, is a short 15-minute meeting every day of the sprint. It is for Developers to synchronise. Each person typically answers three questions:

1. What did I do yesterday?
2. What will I do today?
3. Am I blocked by anything?

The Scrum Master listens for blockers, because their job is to remove them.

As a BA, you are not always required at the Daily Scrum. But if blockers arise that are requirements-related, you will be pulled in.

For example, a developer might say: "I'm blocked. I don't know what message we should show if the ID upload fails." This is where you come in. You either clarify immediately — "Show a message asking the customer to re-upload a clearer photo" — or you take it back to stakeholders and return quickly with the decision.

The Scrum Master may coordinate the resolution, but the answer itself comes from you.

## Sprint Review — Showing Progress

At the end of the sprint, the team holds a Sprint Review. This is when the increment — the working piece of the product — is demonstrated to stakeholders.

The goal is not just to show progress, but to collect feedback. Stakeholders see what has been built, confirm if it meets their needs, and often suggest adjustments.

In our onboarding case, the team demonstrates the ID upload feature. You check it against the acceptance criteria you wrote. Does it accept valid IDs? Are they stored securely? If yes, it meets the requirement.

But stakeholders may react: "This is good, but we also need an automatic notification once the ID is approved." You capture that feedback and add it to the backlog for refinement. The Review ensures the team and stakeholders stay aligned.

## Sprint Retrospective — Improving How the Team Works

After the Review, the team holds a Retrospective. This is a private session, just for the Scrum Team. It is about the process, not the product.

The team asks:

- What went well?
- What didn't go well?
- What should we change for next time?

As the BA, your contribution focuses on how requirements were handled. Did stories arrive too vague? Did stakeholders delay decisions? Did acceptance criteria prevent confusion, or were they too weak? You share these insights, and the team decides how to improve.

For example, you might say: "We lost two days because file format rules weren't confirmed until mid-sprint. Let's confirm such rules earlier in refinement next time." That small adjustment makes the next sprint smoother.

## Bringing the Events Together

Now you can see the rhythm clearly.

1. Refinement prepares the BA-written requirements.
2. Planning commits them into the sprint.
3. Daily Scrums keep the team aligned.
4. Reviews show progress and collect feedback.
5. Retrospectives improve the process.

As a BA, you are central in each event — not as a bystander, but as the person ensuring requirements are clear, alive, and always tied to solving the business problem.
