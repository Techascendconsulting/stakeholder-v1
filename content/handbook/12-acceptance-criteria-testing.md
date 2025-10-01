# Chapter 12: Acceptance Criteria and Test Collaboration

When a developer declares, “It’s done,” what do they really mean? Often, they mean the code runs without errors on their machine. A tester might disagree: the feature still fails against certain scenarios. A stakeholder might go further and say, “This isn’t what I asked for.” These disagreements can derail entire projects, not because people are lazy or incompetent, but because no one ever agreed on what “done” truly looks like.

This is where acceptance criteria come in. Acceptance criteria are the conditions that define, with precision, when a requirement or user story is complete. They remove ambiguity. They create alignment. They transform “done” from a matter of opinion into an objective standard. And when combined with test collaboration, they ensure that those standards are not just written, but proven in practice.

For a Business Analyst, mastering acceptance criteria is not clerical work. It is an act of leadership. It is how we translate business intent into outcomes that developers can build, testers can verify, and stakeholders can trust.

## The Nature of Acceptance Criteria

Acceptance criteria are not mini-specifications or extra documentation bolted onto requirements. They are the definition of success. They describe the circumstances under which a feature or requirement is considered delivered.

Take the example of “Password reset.” Written as a requirement alone, it sounds simple. But the moment you ask questions, complexity emerges. Does the customer receive a reset link by email? How long should the link remain valid? What happens if they click it twice? What if the email address is wrong? What if the system is under maintenance? Each of these questions can be answered in acceptance criteria. Together, they provide a full picture of how the feature should behave in real life, not just in theory.

In this way, acceptance criteria are the bridge between intent and execution. They provide developers with concrete boundaries, give testers measurable outcomes, and reassure stakeholders that their needs are not lost in translation.

## Writing Acceptance Criteria in Practice

There are many ways to write acceptance criteria, but the goal is always the same: clarity and testability. One of the most common formats is the Given–When–Then style, popularised in Behaviour-Driven Development (BDD).

For example:

Given a registered customer has forgotten their password,

When they request a password reset,

Then the system sends an email containing a unique link valid for 15 minutes.

This format forces writers to think in scenarios, not vague aspirations. It specifies the context, the action, and the expected outcome. Developers can implement to it. Testers can build test cases around it. Stakeholders can confirm it reflects the business rule.

But the format itself is not magic. The skill lies in the BA’s ability to probe assumptions. For every user story, the BA asks: what about the edge cases? What if the system fails mid-transaction? What if the user enters invalid data? What if multiple users act at the same time? Each scenario becomes an acceptance criterion. Each criterion makes the requirement more complete.

In Agile teams, these criteria live alongside user stories. In more traditional projects, they may be part of requirement specifications. Either way, they serve the same purpose: turning “we want this” into “this is how we know we have it.”

## Test Collaboration: Beyond Writing

Writing acceptance criteria is only half the job. They must also be validated, challenged, and tested. This is where collaboration with QA and development teams becomes essential.

In Agile practice, the Three Amigos session is a powerful ritual. A BA, a developer, and a tester meet to discuss each story before development begins. The BA explains the business intent, the developer explains feasibility, and the tester explores possible failure paths. Together, they agree on acceptance criteria. This small conversation prevents countless misunderstandings later.

In more formal environments, the BA may work closely with testing teams to ensure every requirement in the catalogue has corresponding test cases. Here the BA becomes the guardian of intent: ensuring that the tests measure not just what was coded, but what was actually needed.

The collaboration also extends to stakeholders. A BA should validate criteria with business representatives: “If the system behaves like this, is that what you expect?” This step turns acceptance criteria into a shared contract between business and IT.

### Extended Case Example: Online Banking Transfers

A retail bank wanted to introduce instant money transfers between customer accounts. The requirement was written as: “Customers can transfer money between accounts.”

Developers interpreted this as a simple transaction screen. Testers assumed it included error handling for insufficient funds. Business stakeholders expected instant confirmation, daily limits, fraud detection, and audit logging. Each group was right in its own way, but none had written these expectations down.

When the BA facilitated an acceptance criteria workshop, the gaps became obvious. Together, the group wrote criteria such as:

- Customers can only transfer amounts within their available balance.
- Transfers above £1,000 must trigger two-factor authentication.
- Transfers must be visible in both accounts within 5 seconds.
- An email confirmation must be sent immediately to the customer.
- All transactions must be logged with timestamp and IP address.

These criteria transformed a vague requirement into a detailed, testable feature. The result was a system that met security standards, matched customer expectations, and avoided disputes between teams.

## The Consequences of Weak Criteria

Without strong acceptance criteria, teams drift. Developers build according to their interpretation. Testers test according to theirs. Stakeholders discover discrepancies only when it is too late. This leads to rework, frustration, and loss of trust.

In one public-sector project, the absence of clear acceptance criteria led to months of wasted development. A “case management” system was delivered that technically allowed cases to be opened and closed, but it lacked the ability to generate reports — something stakeholders had assumed was obvious. Developers argued that reporting was never specified. Testers agreed. Stakeholders accused the team of incompetence. The real failure was the absence of acceptance criteria that made expectations explicit.

Contrast this with a healthcare project where every requirement was accompanied by acceptance criteria agreed in joint BA–QA workshops. Developers built features confidently, testers validated them quickly, and stakeholders saw their needs reflected in working software. Delivery was smoother, because “done” meant the same thing to everyone.

## Acceptance Criteria as Living Agreements

It is tempting to treat acceptance criteria as fixed artefacts. In reality, they are living agreements. As understanding evolves, as edge cases are discovered, as priorities shift, criteria may need refinement. The BA must balance discipline with adaptability: criteria should be firm enough to guide development but flexible enough to evolve with learning.

In Agile teams, criteria are revisited in backlog refinement and sprint reviews. In traditional teams, they may be revisited during change control. Either way, the BA’s role is to ensure criteria remain aligned with intent and value.

## Conclusion

Acceptance criteria are more than checkboxes at the end of a requirement. They are the shared definition of success. They protect teams from the danger of assumption. They align developers, testers, and stakeholders around a single vision of “done.”

For the Business Analyst, writing good acceptance criteria is an act of precision, but collaborating around them is an act of leadership. By engaging testers, developers, and business representatives in shaping and validating criteria, the BA ensures that requirements are not just written, but delivered and proven.

Projects that treat acceptance criteria as an afterthought stumble into disputes and rework. Projects that use them as contracts of clarity move forward with confidence. In the end, acceptance criteria are not about documentation — they are about trust. Trust that what was promised will be delivered, and delivered in a way that everyone can recognise as success.
