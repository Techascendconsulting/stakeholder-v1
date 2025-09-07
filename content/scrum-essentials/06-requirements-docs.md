---
id: 6
title: "Requirements Documentation in Scrum"
estMinutes: 12
---

When people hear "Agile" or "Scrum," they often assume that documentation goes out the window — that it's all sticky notes and whiteboards. That's a myth. Documentation still matters — a lot. The difference is that in Scrum, documentation is lean, living, and just enough to help the team build the right thing without slowing them down.

For Business Analysts, this is good news. You're still responsible for making requirements clear — but now, you need to know which details to capture, when to write them, and how to evolve them as the work progresses. Let's break it down.

## What "Just Enough" Documentation Means

In Scrum, we don't write 50-page requirement specs upfront. Why? Because too much can create waste — especially when things are likely to change. Instead, Scrum teams document requirements progressively:

1. **Early on**, you capture high-level needs: "Customers can't upload ID documents online."
2. **As the team prepares to build it**, you break that down into user stories, acceptance criteria, and supporting details.
3. **After it's built**, documentation may be updated to reflect decisions made during development.

So the rule isn't "don't document" — it's "write what the team needs, when they need it."

## Key Artifacts You'll Own as a BA

### 1. User Stories

This is the primary format used to describe functionality in Scrum.

You'll write stories like:

"As a new customer, I want to upload my ID online so that I can complete onboarding quickly."

This tells the team who wants it, what they want, and why. You don't need to explain how — that's the Developers' job.

### 2. Acceptance Criteria

Each story needs clear, testable conditions that define "done." These are your safeguards.

**Example:**

- Given a valid ID file
- When the customer uploads it
- Then the system stores it securely and shows a success message

If you skip this step, Developers will build based on assumptions. Good acceptance criteria reduce rework.

### 3. Edge Cases and Business Rules

Some teams miss this part — but you shouldn't. Real systems don't run on happy paths.

You'll need to document things like:

- What if the file is too large?
- What file types are allowed?
- Should the upload trigger an email notification?

This info can live within the story or in a separate supporting doc linked to it.

### 4. Process Maps & Visuals

Scrum doesn't forbid diagrams. A single process map can make a complex workflow crystal clear — and save you from writing five paragraphs. Use them to explain before-and-after scenarios or handoffs between systems.

## Where Does This Documentation Live?

There's no single rule. Teams use tools like Jira, Confluence, Azure DevOps, or even Google Docs. The key is that it's accessible, current, and connected to the backlog. If you use Jira, each story might have:

- The description (your story)
- Acceptance criteria
- Attachments (e.g., screenshots, diagrams)
- Comments with decisions

You don't need to replicate every detail in five tools. Choose one place, and keep it up to date.

## How Requirements Evolve

Scrum is iterative. You might write a story and refine it over several sessions. Once it's built, the acceptance criteria might need updating based on what was actually delivered. That's normal. Agile documentation is a conversation — not a contract.

Stakeholders might change their minds. New risks might surface mid-sprint. Your job is to update the documentation so it always reflects the current truth.

## How Much Is Enough?

Here's a rule of thumb: Write just enough so the team can confidently start building — and so future you (or a new team member) can understand the decision trail.

- **If Developers are frequently blocked**, asking for clarification, or making wrong assumptions — your documentation is too light.
- **If you're spending days polishing diagrams** no one reads — it's too heavy.

## The BA's Real Job in Documentation

Your value isn't in writing pretty documents — it's in removing ambiguity. You give the team clarity. That clarity comes from:

1. **Writing simple, unambiguous stories**
2. **Asking tough questions** to uncover edge cases
3. **Documenting decisions** before they're forgotten
4. **Keeping business needs** front and centre

In Scrum, requirements documentation isn't a formality. It's a living tool to support collaboration and delivery. And the Business Analyst? You're the one who makes sure that tool is sharp, relevant, and always ready when the team needs it.
