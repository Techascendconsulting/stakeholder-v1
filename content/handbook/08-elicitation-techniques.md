# Chapter 8: Elicitation Techniques (Deep Dive)

If requirements are the backbone of Business Analysis, elicitation is the heartbeat. It is through elicitation that a BA uncovers what stakeholders truly need — often what they didn't even realise themselves. Yet elicitation is frequently misunderstood. Too many projects reduce it to "interviewing a few people and writing down what they say." In practice, elicitation is a broad discipline with a variety of techniques. Each has its strengths, weaknesses, and contexts where it shines.

The seasoned BA knows that no single technique is enough. Interviews may give depth but not scale. Surveys can give scale but lack nuance. Observation reveals truths stakeholders never articulate. Prototyping makes ideas tangible. Each is a different lens on the same problem space. Alone, the picture is partial. Combined, they provide vision.

This chapter explores the core elicitation techniques in detail, with practical stories showing how they work in the real world — the successes, the failures, and the lessons learned.

## Interviews: Digging Beneath the Surface

Interviews are the most widely used elicitation technique. They create space for stakeholders to speak freely, explore detail, and share personal perspectives. But the value of interviews lies in how they are conducted. A poorly run interview produces generic statements. A well-run interview uncovers insight that changes the course of a project.

### Case Study: University Admissions
When a university wanted to digitise its admissions process, administrators insisted they needed "more flexibility." At first glance, this sounded like a design principle rather than a requirement. The BA conducting interviews probed further: "Can you give me an example of when the system feels inflexible?" One admissions officer described the annual challenge of late applicants — the current system locked out anyone applying after the official deadline. "Flexibility" meant the ability to process late applications without breaking rules.

This nuance changed the requirements entirely. Instead of designing a "flexible system" in the abstract, the team focused on supporting late applications through a controlled exception process. Without interviews that probed "what do you mean by flexible?", the project might have delivered a system that was technically sound but operationally useless.

The lesson: interviews succeed when BAs listen actively, challenge vague terms, and invite stories rather than just answers.

## Workshops: The Power of Collective Dialogue

Workshops bring multiple stakeholders together to share perspectives, identify conflicts, and co-create solutions. They are especially powerful when requirements cut across departments or when alignment is as important as detail.

### Case Study: Retail Returns Process
A large retailer wanted to redesign its returns process. In early workshops, managers declared the process "smooth" and "efficient." But when frontline store staff were invited, a different story emerged. Customers regularly complained about waiting times at counters, confusing paperwork, and inconsistent policies. The workshop dynamic forced these voices into the open. Managers could no longer dismiss the issues because they heard them firsthand.

The BA facilitated a mapping exercise where both managers and staff traced the process step by step. The bottlenecks became visible. Together, they designed a simpler process with clearer instructions, standardised forms, and better queue management.

This was not just requirement gathering — it was culture change. The workshop gave staff a platform and gave managers a reality check. The project's credibility improved because those most affected by the process were part of shaping the solution.

## Observation and Shadowing: Seeing What's Unsaid

Stakeholders often cannot articulate their needs — not because they are hiding them, but because those needs have become invisible through routine. Observation (also called shadowing) uncovers truths stakeholders take for granted or never think to mention.

### Case Study: Hospital Medication System
In a hospital IT project, nurses described the existing medication system as "fine." Workshops and surveys confirmed this. But when the BA shadowed nurses on a morning shift, she noticed something curious. Each nurse carried a small notebook, scribbling drug names and dosages before entering them into the system hours later.

When asked why, nurses explained that the terminals were fixed at the end of each corridor, far from patient bedsides. Logging in was slow, so they wrote notes during rounds and entered data later. The workaround doubled their workload and introduced risks: handwriting could be misread, or doses forgotten.

This insight never appeared in interviews because nurses saw it as "just the way we work." Observation revealed it as a critical gap. The solution was not "a better database," but tablets that allowed bedside entry. Without shadowing, the workaround — and its risks — would have remained invisible.

## Document Analysis: Mining the Written Record

Organisations are full of written artefacts: policies, reports, manuals, contracts, and system guides. Analysing them often reveals constraints, regulatory requirements, or business rules that stakeholders forget to mention.

### Case Study: Compliance Surprise
On a financial compliance project, stakeholders focused on customer-facing features. During document analysis, the BA reviewed regulatory guidance and discovered a clause requiring customer data to be retained for seven years. No stakeholder had raised this. If missed, it would have led to a non-compliant system and a failed audit.

By surfacing it early, the BA protected the project and earned credibility with compliance teams.

The danger of document analysis is that it only shows what should happen, not what does happen. The BA must pair documents with real-world input.

## Prototyping: Making the Invisible Visible

Prototypes — sketches, wireframes, clickable demos — make ideas tangible. Stakeholders often struggle to articulate needs until they see something in front of them. Prototypes allow them to react, critique, and refine.

### Case Study: Airline Booking Flow
In an airline booking redesign, executives kept insisting they wanted "a simple flow." But "simple" meant different things to different people. Some thought fewer screens. Others thought fewer fields. Developers were stuck.

The BA worked with designers to create low-fidelity prototypes of three different booking flows. When executives saw them side by side, the debate shifted. Instead of vague talk about "simplicity," they could point and say, "this version feels right." Prototyping saved weeks of circular conversation.

The risk of prototyping is false expectations. Stakeholders may mistake a prototype for the final product. The BA must frame it as an exploratory tool.

## Surveys and Questionnaires: Gathering Scale

Surveys are useful when many stakeholders are involved, or when the BA needs to test assumptions across a wide base. They provide breadth but little depth.

### Case Study: Employee Portal Redesign
A BA working on an employee portal ran a survey asking staff which features they valued most. The top response, by a large margin, was mobile access — something not raised in workshops dominated by managers. This evidence reshaped the project roadmap.

The risk is superficiality. Poorly designed surveys produce misleading results. Surveys should complement, not replace, richer techniques.

## Focus Groups: Exploring Perceptions

Focus groups bring together small groups of users or customers to explore experiences and attitudes. Unlike workshops, they are not about alignment but about exploring perceptions.

### Case Study: Loyalty App
In designing a retail loyalty app, a focus group with frequent shoppers revealed surprising insights. Customers didn't just want discounts; they wanted to "feel special." Words like "recognition" and "rewarded" dominated the discussion. This shaped features like personalised offers and birthday rewards, which drove adoption more than discounts alone.

Focus groups must be handled carefully. A vocal participant can skew the conversation. The BA must facilitate to balance voices and avoid overgeneralising from a small sample.

## Brainstorming and Ideation: Unlocking Creativity

Sometimes the goal is not to document existing needs but to explore new possibilities. Brainstorming sessions encourage stakeholders to think beyond constraints.

### Case Study: Logistics Innovation
In a logistics project, a brainstorming session with staff led to the idea of using QR codes for package tracking. The suggestion came not from management but from a junior warehouse worker. Prototyped quickly, it became a cornerstone of the solution.

Brainstorming can unleash creativity, but without structure it drifts into chaos. The BA must guide the group from wild ideas to feasible options.

## Interface and System Analysis: Understanding What Exists

When replacing or integrating systems, analysing current interfaces provides insight into what users actually rely on. Reviewing forms, screens, and workflows highlights critical features.

### Case Study: CRM Replacement
In a CRM replacement project, the BA reviewed existing screens and noticed a small "notes" field used by sales staff. At first, developers dismissed it as trivial. But further analysis revealed it was vital for recording informal customer details that shaped sales conversations. Without recognising this, the new system would have alienated the sales team.

Interface analysis prevents "accidental losses" when migrating systems.

## Data Analysis: Letting the Numbers Speak

Modern BAs increasingly use data analysis to complement qualitative techniques. System logs, analytics, and transaction records reveal behaviours that stakeholders may not notice.

### Case Study: E-commerce Checkout
In an e-commerce project, stakeholders speculated about why customers abandoned shopping carts. Some blamed pricing, others blamed design. The BA analysed transaction data and discovered 40% of drop-offs occurred at the payment screen. This evidence focused the team on fixing payment issues rather than guessing at causes.

The pitfall is over-interpretation. Data shows what is happening, not why. It must be combined with interviews or observation to understand context.

## Putting It All Together

No single technique tells the whole story. A skilled BA layers techniques to build a robust picture. They may start with interviews to gather perspectives, observe users to test those claims, run a workshop to align stakeholders, prototype to refine ideas, and survey to validate at scale. Each technique adds a piece to the puzzle.

Projects fail when elicitation is reduced to a single method, like "just interview the sponsor." They succeed when elicitation is treated as an investigation — a process of discovery using multiple lenses.

## Conclusion

Elicitation is the heartbeat of Business Analysis. It is not about collecting wish lists. It is about discovery — drawing out needs, testing assumptions, surfacing hidden truths, and shaping requirements that deliver value. Each technique — interviews, workshops, observation, document analysis, prototyping, surveys, focus groups, brainstorming, interface reviews, data analysis — is a tool. Alone, each is limited. Together, they give the BA vision.

The BA who masters this toolkit is not just a recorder of requirements. They are an investigator of value. They are the person who ensures that projects solve the right problems, for the right people, in the right way.


















