# Chapter 14: Data for Business Analysts

For much of the history of Business Analysis, data was something left to specialists: data architects, database administrators, or business intelligence teams. Analysts were told their job was to "gather requirements" and "engage stakeholders," while others handled the numbers. That separation is no longer sustainable.

In today's organisations, data runs through every project. Customer interactions generate digital footprints. Operational systems create logs of every transaction. Regulators demand evidence in the form of metrics. Executives want dashboards that show progress in real time. Without an understanding of data, a BA risks being sidelined, unable to ask the right questions, validate assumptions, or ensure that solutions truly deliver value.

This does not mean Business Analysts must become data scientists. They are not expected to build predictive models or tune machine-learning algorithms. But they must be data fluent. They need to know how to ask for data, how to interpret it, and how to work with specialists to ensure that solutions are both functional and evidence-based. Data fluency is no longer optional — it is a core competency.

## Why Data Matters to the BA

Every requirement ultimately has a data component. A request to "allow customers to update their profile" involves storing and retrieving data. A complaint about "slow reporting" is rooted in data processing. Even non-functional requirements such as performance or compliance often boil down to how data is handled, secured, and exposed.

When a BA ignores data, they miss hidden complexities. For example, a stakeholder may request, "We need sales by region." On the surface, it seems simple. But a BA who understands data will ask: What defines a region? Is it based on customer billing address, shipping address, or sales team territory? How do we handle online-only sales? What happens when a customer moves mid-year? Suddenly, what looked trivial becomes a discussion about data sources, definitions, and rules. Without this questioning, the project risks delivering numbers that no one trusts.

Data also provides a reality check. Stakeholders often make claims: "Most of our customers churn after three months" or "We lose money on small transactions." Without data, these statements become project drivers, even if they are wrong. A BA with data fluency asks to see the evidence, analyses patterns, and grounds decisions in fact.

## Working with Data in Practice

A data-fluent BA does not need to know how to optimise a database engine, but they do need practical skills to explore, question, and validate information.

At the simplest level, this may mean understanding where data lives. Customer details may be stored in a CRM. Orders may sit in an ERP system. Website interactions may be logged in analytics platforms. Connecting these dots allows the BA to map end-to-end journeys and see how data flows across systems.

It also means being able to work with queries, even at a basic level. Knowing enough SQL to check whether a table contains the fields a requirement depends on, or to run a quick validation of sample data, can save weeks of wasted effort. Tools like Excel, Power BI, or Tableau can be used to prototype reports or test assumptions. The BA is not replacing the data team, but they are speaking the same language, building credibility, and avoiding surprises.

### Case Example: Telecommunications Billing
In a telecoms project, stakeholders insisted billing errors were caused by the invoicing system. Developers prepared to replace it. A BA asked to see the underlying data. With support from the BI team, they analysed a sample of bills and discovered that most errors originated upstream, where sales reps were mis-entering tariff codes. The billing engine was functioning as designed; the input data was flawed. Because the BA understood how to question data, millions in unnecessary re-engineering were avoided.

## Data Quality and Business Value

Data is not just about storage and access. Its quality determines whether it is usable. Business Analysts are often the first to notice when data quality issues undermine project goals. Missing values, duplicate records, inconsistent formats — these can derail even the best-designed systems.

The BA's role is to ask: Is the data good enough to support this requirement? If the project is meant to deliver customer segmentation, but half the customer records are missing demographic information, the BA must surface this gap and push for resolution.

Poor data quality erodes trust. Executives who receive conflicting numbers lose confidence in reports. Customers who see mistakes in their records lose faith in the business. Regulators who spot inconsistencies issue fines. By paying attention to data quality, the BA protects not only project outcomes but also organisational reputation.

### Case Example: Healthcare Reporting
A healthcare provider launched a dashboard to monitor patient wait times. At launch, executives were shocked: the dashboard showed impossible figures — negative wait times, patients waiting hundreds of days. The BA investigated and found that timestamps were being captured differently across systems, with some recording admission at triage and others at consultation. By harmonising data capture rules and cleaning historical records, the BA restored accuracy. More importantly, they rebuilt trust in the organisation's reporting.

## Collaboration with Data Specialists

BAs do not work in isolation. Data engineers, analysts, and scientists bring deep technical expertise. The BA's role is to bridge between them and the business.

This means translating stakeholder questions into data queries: "The sales director wants to know why revenue dipped last quarter — can we break this down by product line and region?" It also means helping business stakeholders interpret findings. When a data scientist presents a predictive churn model, the BA ensures the business understands its assumptions, limitations, and implications.

The BA also protects against misuse of data. Stakeholders may cherry-pick figures to support preconceived decisions. The BA asks, "Does this metric truly reflect what we care about? What are we not seeing in this view?" By doing so, they keep analysis honest.

## The Ethical Dimension of Data

As organisations collect more information, ethical questions become unavoidable. How is customer consent managed? Are employees aware of monitoring? How are biases in data identified and corrected?

Business Analysts may not write privacy policies, but they must raise these questions. They must ensure that requirements reflect not only legal obligations but ethical responsibilities. A BA who ignores data ethics risks delivering solutions that are technically sound but socially damaging.

### Case Example: Recruitment Platform
A recruitment platform wanted to automate candidate shortlisting. Data scientists trained a model on historical hiring data. The BA asked a simple question: "What patterns will the algorithm learn from?" The answer revealed that past hiring decisions were biased, favouring certain universities and genders. Left unchecked, the algorithm would have embedded and amplified these biases. Because the BA challenged the data, the project team redesigned the model with fairness controls.

## Conclusion

Data is no longer a specialist concern. It is the lifeblood of every project, and Business Analysts who cannot engage with it risk irrelevance. To be effective, a BA must be data fluent: able to ask for data, question its quality, interpret its meaning, and collaborate with those who manage it.

This does not mean becoming a data scientist. It means being the voice of clarity in a world awash with numbers. It means spotting hidden complexities, grounding decisions in evidence, and protecting the organisation from both error and misuse.

For the BA, data is not just another deliverable. It is a source of truth, a driver of trust, and a foundation for value. In the next chapter, we will explore how this fluency extends further into the technical realm, as BAs increasingly engage with APIs and integrations — the connective tissue of modern systems.