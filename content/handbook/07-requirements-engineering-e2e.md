# Chapter 7: Requirements Engineering End-to-End

Of all the activities associated with Business Analysis, none is more central than requirements. For many years, organisations have described BAs as "the people who gather requirements." While that label is far too narrow — Business Analysis is about value, not just documents — it is true that requirements are at the heart of the role. They are the bridge between business needs and the solutions designed to meet them. Done well, requirements provide clarity and alignment. Done badly, they become the seeds of project failure.

The discipline of managing requirements is called requirements engineering. It is more than writing things down. It is a structured process that ensures requirements are elicited, analysed, specified, validated, and managed throughout the life of a project. Each stage matters. Together, they protect organisations from wasted effort and ensure that the final solution addresses the real problem.

## What Are Requirements, Really?

At its simplest, a requirement is a statement of need: something the system, product, or process must do, or a quality it must have. Requirements are often divided into two categories. Functional requirements describe what the system should do — "The system must allow users to reset their password via email." Non-functional requirements describe qualities or constraints — "The system must process the password reset within thirty seconds."

But in practice, requirements are rarely presented this neatly. Stakeholders often speak in desires or complaints. "We need better reporting." "The app takes too long to use." "Customers are frustrated." These are not requirements; they are signals. The BA's task is to turn these signals into clear, testable statements that everyone can agree on.

The danger of skipping this work is illustrated by a classic example from healthcare IT. A hospital requested a "mobile-friendly system" for nurses. Developers built an application that ran on tablets. On launch, nurses rejected it — not because it was poorly designed, but because "mobile-friendly" meant "usable with one hand while carrying equipment." The missed detail turned a seemingly successful project into a failure. Requirements work is about surfacing such details before it is too late.

## The Stages of Requirements Engineering

Although the stages overlap in practice, requirements engineering is often described in five interconnected activities: elicitation, analysis, specification, validation, and management. Each one plays a unique role in moving from vague ideas to actionable, traceable requirements that deliver value.

### Elicitation: Drawing Out What People Really Need

Elicitation is the starting point — the act of discovering requirements. The term comes from the Latin elicere, "to draw out," which is exactly what the BA must do. Requirements rarely arrive fully formed. They must be drawn out of stakeholders through conversation, observation, investigation, and experimentation.

Techniques range from one-to-one interviews and group workshops, to observing users in their daily work, to analysing existing documentation. Prototyping can be powerful here, because stakeholders often cannot articulate what they want until they see something tangible. Surveys, focus groups, and even data analysis can all play a role.

The BA's challenge is that stakeholders rarely state "requirements." Instead, they state solutions ("We need an app"), or frustrations ("The system is too slow"), or opinions ("Customers don't like this form"). The BA's job is to probe beneath the surface. Why an app? Why slow? Which customers? What would success look like?

Consider a project in retail banking. Executives declared, "We need a chatbot." A less rigorous BA might have dutifully written this down as a requirement. A stronger BA asked: Why? After several interviews, it emerged that the real issue was long call-centre wait times. The chatbot was one possible solution, but not the only one. By reframing the problem, the BA opened the door to alternative solutions that better balanced cost and customer satisfaction.

### Analysis: Making Sense of Conflicting Demands

Elicitation produces raw material, but analysis shapes it into something usable. Analysis is about resolving contradictions, filling gaps, and prioritising what matters most.

On a typical project, stakeholders want different — sometimes opposing — things. The marketing team may demand personalised customer experiences. IT may warn that this will slow down system performance. Compliance may insist on strict data controls that conflict with user convenience. Left unresolved, these differences explode later in development.

The BA facilitates analysis by comparing requirements, identifying conflicts, and guiding stakeholders toward trade-offs. Tools like process models, data dictionaries, and impact analysis charts help visualise issues. But analysis is as much art as science. It involves negotiation, diplomacy, and the courage to highlight uncomfortable truths.

One BA working on an e-commerce platform faced exactly this tension: marketing wanted unlimited customer personalisation, while IT argued for simplicity. Through careful analysis, she helped the teams agree on phased personalisation: start with simple "most popular" recommendations, then build toward more complex features as infrastructure matured. The compromise satisfied immediate business goals while protecting long-term feasibility.

### Specification: Writing Requirements That Actually Work

Once analysed, requirements must be documented clearly enough to guide design, development, and testing. This is specification. The format varies depending on context. In Agile environments, requirements are often written as user stories: "As a customer, I want to filter products by price so that I can find affordable options." In more traditional projects, they may take the form of detailed requirement catalogues, use cases, or even structured models.

The key is clarity. Requirements must be precise, unambiguous, and testable. A vague statement like "The system must be user-friendly" is meaningless until defined. User-friendly how? Fewer clicks? Accessibility standards? Faster load times? Without specificity, developers guess, testers struggle, and business stakeholders are disappointed.

The dangers of poor specification are well documented. In one government IT project, the phrase "real-time data" was included in requirements without definition. Developers interpreted it as "instant updates." The business had meant "daily refreshes." Millions were wasted building an unnecessarily complex system before the misunderstanding was discovered.

Good specification avoids this by insisting on precision. Requirements should be framed so that someone unfamiliar with the project can read them and understand exactly what is expected.

### Validation: Are These the Right Requirements?

Even well-written requirements can be wrong. Validation ensures that what has been specified is actually what stakeholders need, that it aligns with business goals, and that it is feasible to deliver.

Validation happens through reviews, walkthroughs, prototypes, and stakeholder sign-offs. It involves asking: Did we capture the need correctly? Does this requirement support the business case? Can it be built and tested within our constraints?

In practice, validation often prevents costly missteps. On a project to digitise university admissions, a BA organised validation workshops with student services. Initial requirements suggested online applications should include a complex multi-step identity check. In review, stakeholders admitted this was unnecessary for most applicants and would deter enrolments. By validating early, the team simplified the process and avoided unnecessary development.

Validation is not about ticking boxes. It is about creating confidence that the requirements are not just well-documented, but right.

### Management: Keeping Requirements Alive

Requirements do not stay fixed. Stakeholders change their minds, regulations evolve, new opportunities emerge. Requirements management is about tracking these changes, ensuring traceability, and making sure the project adapts without losing control.

Management involves maintaining a living repository of requirements, often supported by tools like JIRA, Confluence, or specialised requirements management software. It means version control, impact analysis, and communication of changes. Without this, projects descend into chaos: undocumented requirements creep in, context is lost, and teams argue about what was agreed.

In one telecom transformation programme, a BA introduced a simple traceability matrix linking requirements to business objectives, test cases, and user stories. When a stakeholder demanded a mid-project change, the matrix showed immediately which objectives it supported and what the cost of implementation would be. Instead of emotional debate, the team could make an informed decision.

Requirements management does not prevent change. It makes change transparent, controlled, and aligned.

## Requirements in Different Delivery Approaches

Requirements engineering looks different depending on methodology. In Waterfall, requirements are often heavily front-loaded, with detailed documents produced before development begins. In Agile, requirements evolve iteratively, captured in lightweight formats and refined continuously. In Hybrid, both approaches may coexist — with high-level requirements documented up front for governance, then broken into user stories for iterative delivery.

The BA must adapt accordingly. In Waterfall, precision and completeness up front are critical. In Agile, flexibility and ongoing collaboration are key. In Hybrid, the BA must balance structure with adaptability.

## Conclusion

Requirements engineering is not clerical work. It is the discipline that prevents projects from chasing the wrong goals, building the wrong things, or delivering solutions that nobody wants. Each stage — elicitation, analysis, specification, validation, and management — builds on the others. Together, they ensure that requirements are not just written, but engineered for clarity, alignment, and value.

For the BA, mastering this end-to-end discipline is what transforms you from a passive note-taker into an active architect of solutions. Projects succeed or fail not on how many requirements are written, but on whether those requirements are right. And whether they are right depends on the skill, judgement, and persistence of the Business Analyst.






