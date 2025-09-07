---
id: 7
title: "Delivery Flow (Putting It Together)"
estMinutes: 10
---

Once requirements are being written and refined, the focus shifts to delivering them — turning business needs into real, usable features. But delivery isn't just "developers doing their job." It's a structured flow where the Business Analyst plays a consistent, active role across multiple stages. You're not a bystander. You're guiding the requirement from idea to outcome.

Scrum makes this possible through short cycles and constant collaboration. But as a BA, you must understand how to contribute at each stage — and not fall into the trap of collecting everything upfront like in waterfall. Instead, you move in slices. Here's how the journey plays out, step by step.

## Problem Exploration – Understanding What Needs to Change

Every good solution starts with a clearly defined problem. As a BA, your job begins by speaking to stakeholders and asking: What's not working? Why now? Who is affected?

Let's stick with our running example: stakeholder feedback reveals that customer onboarding takes too long and is mostly manual.

You dig deeper and discover that ID verification is done via email. Customers scan their passport, email it in, and then wait for someone to approve it. That's your problem: "Manual ID verification delays customer onboarding and increases fraud risk."

You haven't jumped to a solution yet. You've just defined the problem.

## Current State (As-Is) – Mapping What Exists

Before suggesting improvements, you need to understand what currently happens. This is your As-Is stage.

You map out the process: Customer receives email → scans ID → sends it to support inbox → staff member opens it manually → checks format → sends confirmation.

You might use a process map here, like a swimlane diagram. It helps everyone — including the tech team — visualise the current state and spot where things go wrong.

## Process Mapping – Making Work Visible

As-Is process maps don't just clarify what's happening — they also highlight inefficiencies. You may spot bottlenecks (like inbox delays), duplication (manual checks already done by others), or risks (like sending sensitive IDs via email).

You present this visually and validate it with stakeholders: "Is this what really happens?" Once confirmed, you move on to shaping the future state.

## Future State (To-Be) – Defining the Desired Outcome

Now that everyone agrees on the current state, you help define the ideal future. This is the To-Be process.

In our example, stakeholders agree that customers should upload their ID through a secure online portal, where it can be automatically verified and flagged for manual review only if needed.

You map this future flow. Customer fills form → uploads ID → system auto-validates → sends success/failure message → staff only intervene if flagged.

You're still not writing requirements — you're designing what "better" looks like. This is critical: Without a clear To-Be vision, requirements will be scattered and vague.

## Solution Design (with UX/UI) – Bridging Process and Product

Once the future process is clear, you work with UX designers or Product Owners to design how the user will interact with the system.

What fields appear on the ID upload page? What does the confirmation screen look like? What messages should appear when something fails?

You might sketch wireframes, review mockups, or provide feedback on prototypes. Your role here is to make sure the solution matches the business needs and fits seamlessly into the new To-Be flow.

## Refinement – Making It Buildable

This is where Scrum kicks in.

You take slices of the To-Be process and bring them to refinement. You write user stories that capture one part of the solution: uploading the ID, showing an error if the format is wrong, storing it securely.

Refinement happens before the sprint. It's not about writing everything upfront. It's about preparing just enough, just in time.

You write the story: "As a new customer, I want to upload my ID online so that I can complete my registration faster."

You define the acceptance criteria. Developers ask questions. You clarify or go back to stakeholders. Once it's clear, it's ready for planning.

## End-to-End Journey of a Requirement

Now let's zoom out and walk through what really happens with a single requirement:

1. **Elicitation** — You speak to stakeholders and hear: "Onboarding takes too long."
2. **Draft** — You shape a story around secure online ID upload.
3. **Refinement** — You collaborate with the team to add criteria, confirm edge cases.
4. **Planning** — The team selects the item and commits to delivering it.
5. **Build/Test** — Developers build, testers validate, and you check against criteria.
6. **Review** — You demo the feature with the team and collect feedback from stakeholders.
7. **Feedback** — Stakeholders say, "Great — but can we notify customers once approved?"
8. **Next Sprint** — You capture that as a new item, and the cycle continues.

As a BA, your role spans every stage. You're not just gathering requirements. You're following them — nurturing them — from idea to implementation. That's what real delivery looks like. And it's why you matter.
