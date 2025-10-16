# Chapter 15: APIs and Integrations for Business Analysts

Modern organisations no longer operate within single, monolithic systems. A customer might place an order on a website, track it through a mobile app, pay through a third-party provider, and then call customer service if something goes wrong. Behind the scenes, each of these steps touches a different system — CRM, ERP, billing, analytics, logistics. The success of the customer's experience depends not on any one system, but on how well they all connect. This is the world of APIs and integrations.

For a Business Analyst, ignoring integrations is no longer an option. You do not need to design APIs, but you must understand their role, ask the right questions, and capture requirements that reflect the realities of interconnected systems. Increasingly, projects fail not because individual systems are weak, but because the handoffs between them are broken, undocumented, or misunderstood.

This chapter explores APIs and integrations from a BA's perspective. We will look at what APIs are in practice, why integrations matter, the kinds of questions analysts must raise, and the risks and opportunities that come with them.

## Understanding APIs: The Contract Between Systems

An API, or Application Programming Interface, is often mystified. Stripped of jargon, it is simply a contract that allows one system to talk to another. Instead of a human logging in, clicking buttons, and downloading files, an API allows systems to exchange information directly, in a standardised format.

Think of an online travel site. You enter your dates, and instantly you see flights from multiple airlines. The travel site does not own that data. It is calling airline APIs — asking, "What flights are available on this date?" and receiving structured responses. That is all an API is: a request and a response, machine to machine.

This simplicity hides enormous power. APIs make it possible for businesses to combine services quickly, for products to scale globally, and for customers to expect real-time information as standard. Without APIs, integrations collapse into manual re-entry, batch file uploads, or brittle workarounds that break under pressure.

For the BA, the key is not technical detail, but the principle: what data is exchanged, under what conditions, and with what guarantees of reliability.

## Why APIs and Integrations Matter to the BA

From the perspective of a Business Analyst, APIs are not just plumbing. They shape customer experiences, internal efficiency, and business risk. If integrations fail, the project fails, no matter how elegant the front-end screens are.

Consider a requirement such as "Customers should be able to view their recent orders in the portal." On paper, it sounds trivial. In practice, the orders might sit in an ERP that was never designed for external access. The BA must ask: Is there an API that exposes this information? Does it provide the right fields? How up-to-date is the data? What happens if the API is down? Without those questions, the requirement is an illusion.

Integrations also determine scalability. A company may plan to expand globally, but if its payment provider does not expose APIs for local currencies, the plan stalls. A marketing department may want real-time customer segmentation, but if the CRM only shares data through monthly batch files, "real-time" is impossible.

In other words, integrations are not technical details buried in the back-end. They are enablers and constraints that directly impact business outcomes. The BA's role is to surface those constraints early, so the organisation can design around them, rather than discover them too late.

## The BA's Work in API and Integration Projects

When a project depends on integrations, the BA's responsibilities expand. It begins with discovery: identifying which systems are involved, what data must flow between them, and what APIs or mechanisms exist to support that flow. The BA works closely with architects and developers but focuses on the business implications: what information needs to move, why, and with what level of reliability.

Then comes requirement definition. Integration requirements are rarely visible to end users, but they matter deeply. For example, a BA might need to specify that customer updates in the CRM must appear in the billing system within 15 minutes, or that payment confirmations must flow instantly to order fulfilment. These are business requirements expressed through data flow.

Finally, the BA contributes to validation. They work with testers to define scenarios that prove integrations are reliable. This means not only checking the "happy path," but also failures: what happens if the third-party API is down, if data is malformed, or if response times exceed thresholds? Each of these situations has business consequences that must be thought through.

### Extended Case Example: Retail Inventory Integration

A global retailer wanted to launch "click and collect" — customers would order online and pick up in store. At first glance, the requirement seemed simple: "Allow customers to select a store for collection." But the real challenge lay in inventory integration.

The retailer's e-commerce site was separate from its warehouse and store stock systems. The BA asked critical questions: How will the website know which items are available in each store? How often is stock updated? What happens if a customer reserves the last item online at the same time another customer buys it in store?

The answers revealed that existing integrations were batch-based, updating once every 24 hours. That was useless for same-day collection. The BA worked with the integration team to design new APIs that exposed real-time stock levels. They also captured business rules for conflict resolution, such as reserving stock for online customers immediately.

Without this analysis, the project might have launched with promises it could not keep. With it, the retailer delivered a seamless customer experience that became a competitive differentiator.

## Risks and Pitfalls in Integration Work

Integrations are often where projects stumble. They fail because of assumptions, lack of visibility, or hidden dependencies.

One common pitfall is assuming an API exists when it does not. Stakeholders may say, "We'll just connect to the billing system," only for the BA to discover weeks later that the vendor charges extra for API access, or that the API lacks critical fields. Another pitfall is underestimating performance. An API that works in testing may crumble under production load, leading to slow customer experiences or outages.

Data quality is another risk. If one system stores addresses differently than another, integration will propagate errors rather than fix them. Compliance risks also loom large: integrating personal data across systems without proper safeguards can breach privacy regulations and incur heavy penalties.

The BA's role is to anticipate these pitfalls by asking questions no one else is asking. Not "can we build a new feature?" but "can we trust the data behind it?" Not "does the system have an API?" but "is that API reliable, secure, and fit for purpose?"

## Conclusion

APIs and integrations are the connective tissue of modern business systems. They determine whether data flows smoothly or stalls in silos, whether customers see real-time updates or outdated information, whether a new initiative succeeds or collapses.

For Business Analysts, this means developing fluency in integrations. Not by coding, but by understanding what APIs do, how they enable value, and where they can fail. It means surfacing integration requirements early, validating them rigorously, and working with technical teams to ensure that the business impact of integrations is fully understood.

The BA who masters integrations stops being a translator of requirements only. They become a guardian of connected value, ensuring that systems not only work individually but also work together to deliver seamless business outcomes.





