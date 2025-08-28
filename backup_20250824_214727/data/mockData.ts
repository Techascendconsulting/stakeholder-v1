import { Project, Stakeholder } from '../types'

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Customer Onboarding Process Optimization',
    description: 'Analyze and redesign the customer onboarding workflow to reduce time-to-value, improve customer satisfaction scores, and decrease early-stage churn rates through systematic process improvement.',
    businessContext: `TechCorp Solutions has experienced significant growth over the past 18 months, acquiring 340 new enterprise customers. However, our customer success metrics reveal concerning trends: 23% of new customers churn within the first 90 days, and our Net Promoter Score (NPS) has declined from 8.2 to 6.4. Customer feedback consistently highlights frustration with our lengthy onboarding process, which currently averages 6 to 8 weeks for enterprise clients.

Our main competitors are achieving 3 to 4 week onboarding cycles, putting us at a competitive disadvantage. The extended onboarding period is directly impacting our Annual Recurring Revenue (ARR) growth targets and customer lifetime value projections. Additionally, our Customer Success team is overwhelmed, leading to inconsistent service delivery and internal staff turnover.

This project has been prioritized by the Executive Leadership Team as a critical initiative for Q2 to Q3 2024, with direct oversight from the Chief Customer Officer and VP of Operations.`,
    problemStatement: `The current customer onboarding process lacks standardization and clear ownership, resulting in extended implementation timelines, inconsistent customer experiences, and increased churn risk. The process involves handoffs between 7 different departments without established protocols, uses 4 disconnected systems, and provides limited visibility into customer progress for both internal teams and clients.

Key issues include: manual data entry across multiple systems, unclear escalation procedures, inconsistent communication cadence with customers, lack of milestone tracking, and no automated workflow management. These inefficiencies are costing an estimated $2.3M annually in lost revenue and operational overhead.`,
    asIsProcess: `Current State Process Flow:
1. Sales team closes deal and updates CRM (Salesforce)
2. Manual handoff email sent to Implementation team (24-48 hour delay)
3. Implementation Manager schedules kickoff call (3-5 business days)
4. Customer data manually entered into Project Management system (Monday.com)
5. Technical setup initiated in parallel streams across IT, Product, and Support
6. Multiple stakeholder calls scheduled independently (often conflicting)
7. Configuration performed in staging environment
8. User Acceptance Testing coordinated via email
9. Go-live scheduled and executed
10. Post-implementation support transitioned to Customer Success

Pain Points: No centralized tracking, manual status updates, customers often unaware of progress, internal teams working in silos, frequent delays due to resource conflicts, inconsistent documentation standards.`,
    businessGoals: [
      'Reduce average onboarding time from 6 to 8 weeks to 3 to 4 weeks by Q4 2024',
      'Increase customer satisfaction (CSAT) scores from 6.2 to 8.5+ within 6 months',
      'Decrease onboarding-related churn by 40% (from 23% to 14%) by end of fiscal year',
      'Improve internal process efficiency by 35% as measured by resource utilization',
      'Establish standardized handoff protocols between all 7 departments involved',
      'Implement automated progress tracking with customer-facing dashboard',
      'Achieve 95% on-time delivery rate for committed go-live dates'
    ],
    duration: '4 to 5 weeks',
    complexity: 'Intermediate',
    relevantStakeholders: ['stake-1', 'stake-2', 'stake-3', 'stake-8'], // Operations, Customer Service, IT, Customer Experience
    companyProducts: 'Enterprise software solutions designed for IT, Product Development, and Customer Support teams. These include workflow automation tools, customer engagement platforms, and system integration software.',
    companyServices: 'Implementation consulting, technical onboarding support, customer success management, and long-term enterprise support programs to help clients adopt and maximize TechCorp’s solutions.'
  },
  {
    id: 'proj-2',
    name: 'Digital Expense Management System Implementation',
    description: 'Transform manual expense reporting processes through digital automation, implementing policy compliance controls, real-time approval workflows, and comprehensive audit trail capabilities.',
    businessContext: `FinanceFirst Corp, a mid-market financial services firm with 850 employees across 12 locations, currently processes over 15,000 expense reports monthly through paper-based systems. Our recent internal audit revealed significant compliance gaps and operational inefficiencies that pose regulatory risks and impact our bottom line.

The current manual process requires 2 to 3 weeks for expense reimbursement, leading to employee dissatisfaction (evidenced by 67% negative feedback in our recent employee survey). Finance Operations spends 40% of their time on expense processing, preventing focus on strategic financial analysis. Additionally, we've identified $180K in policy violations over the past year that went undetected due to manual review limitations.

With upcoming SOX compliance requirements and planned expansion into two new markets, we must modernize our expense management to ensure scalability, compliance, and operational efficiency. The CFO has allocated $450K for this initiative with expected ROI within 18 months.`,
    problemStatement: `The current paper-based expense reporting system creates operational bottlenecks, compliance risks, and employee dissatisfaction. Manual processing results in 12% error rates, delayed reimbursements, and inability to enforce policy compliance in real-time. The system lacks proper audit controls, generates frequent policy violations, and consumes excessive administrative resources across Finance, HR, and Management teams.

Critical issues include: no real-time policy enforcement, manual receipt matching, paper-based approval chains, lack of spending analytics, inconsistent documentation standards, and no integration with existing ERP system (NetSuite). These inefficiencies cost approximately $320K annually in processing overhead and compliance risks.`,
    asIsProcess: `Current Expense Process:
1. Employee completes paper expense form and attaches physical receipts
2. Form submitted to direct manager for initial approval (2 to 3 days)
3. Manager reviews and signs form manually
4. Form forwarded to Finance Operations via internal mail
5. Finance team manually enters data into Excel spreadsheet
6. Accounting reviews for policy compliance and mathematical accuracy
7. Exceptions flagged and returned to employee via email (additional 3 to 5 days)
8. Approved expenses entered into NetSuite for payment processing
9. Physical check printed and mailed to employee
10. Monthly reconciliation performed manually against bank statements

Pain Points: High error rates, no real-time visibility, delayed reimbursements, manual data entry, paper storage requirements, difficulty tracking policy violations, limited reporting capabilities.`,
    businessGoals: [
      'Reduce expense processing time by 75% (from 2 to 3 weeks to 3 to 5 business days)',
      'Eliminate manual data entry errors and improve accuracy to 99%+',
      'Ensure 100% compliance with corporate expense policies and SOX requirements',
      'Decrease administrative processing costs by 50% ($160K annual savings)',
      'Implement real-time policy violation detection and prevention',
      'Provide real-time expense reporting and analytics for management',
      'Achieve 90%+ employee satisfaction with new expense process',
      'Enable mobile expense submission and approval capabilities'
    ],
    duration: '5 to 6 weeks',
    complexity: 'Advanced',
    relevantStakeholders: ['stake-1', 'stake-3', 'stake-5', 'stake-6'], // Operations, IT, Compliance, Finance
    companyProducts: 'Financial management software tools and reporting systems that help mid-market companies manage budgets, expenses, and compliance.',
    companyServices: 'Corporate financial services including expense policy consulting, compliance advisory (SOX, regulatory), employee reimbursement programs, and analytics-driven financial planning support.'
  },
  {
    id: 'proj-3',
    name: 'Multi-Location Inventory Management Enhancement',
    description: 'Optimize inventory levels across 15 warehouse locations through real-time visibility, demand forecasting integration, and automated reorder point management to minimize stockouts and excess inventory.',
    businessContext: `RetailMax Distribution operates 15 distribution centers across the Southeast region, managing $50M in inventory assets serving 2,400 retail locations. Our current inventory management approach has resulted in significant operational challenges: 18% stockout rate causing lost sales, 25% excess inventory tying up working capital, and customer complaints about product availability.

Market analysis shows our competitors maintain 8 to 12% stockout rates while carrying only 15% excess inventory. Our inefficient inventory management is estimated to cost $4.2M annually in lost sales and carrying costs. Additionally, our manual forecasting methods cannot keep pace with seasonal demand fluctuations and promotional activities.

The Operations Committee has mandated this project to improve inventory turnover, reduce carrying costs, and enhance customer service levels. Success is critical for maintaining our competitive position and supporting planned expansion into three new markets in 2025.`,
    problemStatement: `Lack of real-time inventory visibility across 15 distribution centers leads to suboptimal stock allocation, missed sales opportunities, increased carrying costs, and inefficient supply chain operations. The current system relies on weekly manual stock counts, Excel-based forecasting, and reactive purchasing decisions that cannot respond effectively to demand variability.

Core issues include: no centralized inventory visibility, manual reorder processes, inconsistent safety stock calculations, poor demand forecasting accuracy (currently 62%), lack of automated replenishment, and no integration between warehouse management and purchasing systems. These inefficiencies result in $4.2M annual impact to profitability.`,
    asIsProcess: `Current Inventory Management Process:
1. Weekly physical stock counts performed at each location
2. Inventory levels manually entered into Excel spreadsheets
3. Regional managers email weekly reports to corporate purchasing
4. Purchasing team consolidates data and identifies reorder needs
5. Manual purchase orders created based on historical usage patterns
6. Vendor orders placed via phone or email
7. Receiving processed independently at each location
8. Inventory adjustments made manually when discrepancies found
9. Monthly inventory reconciliation across all locations
10. Quarterly physical inventory audits

Pain Points: Week-old data for decision making, no demand forecasting, manual processes prone to errors, reactive rather than proactive ordering, no visibility into in-transit inventory, inconsistent safety stock levels.`,
    businessGoals: [
      'Reduce stockout incidents by 65% (from 18% to 6%) across all locations',
      'Decrease excess inventory carrying costs by 30% ($1.5M annual savings)',
      'Improve order fulfillment rate to 98% within 24 hours',
      'Enable real-time inventory visibility across all 15 locations',
      'Implement automated reorder point management system',
      'Achieve 85% demand forecasting accuracy (up from 62%)',
      'Reduce manual inventory processing time by 60%',
      'Establish centralized purchasing optimization'
    ],
    duration: '3 to 4 weeks',
    complexity: 'Beginner',
    relevantStakeholders: ['stake-1', 'stake-3', 'stake-6', 'stake-7'], // Operations, IT, Finance, Supply Chain
    companyProducts: 'Enterprise inventory management software solutions.',
    companyServices: 'Supply chain visibility dashboards, forecasting and demand analytics, and logistics consultancy for large-scale retail distribution.',
    companyOverview: 'We provide wholesale distribution services to over 2,400 retail locations. That includes managing inventory across 15 distribution centers, coordinating with vendors, ensuring timely fulfillment, and offering demand forecasting and stock visibility support. In short, our services help retailers keep shelves stocked efficiently while reducing supply chain costs.'
  },
  {
    id: 'proj-4',
    name: 'Customer Support Ticket Management System',
    description: 'Redesign customer support operations through intelligent ticket routing, SLA management, knowledge base integration, and performance analytics to improve resolution times and customer satisfaction.',
    businessContext: `ServicePro Technologies provides technical support for our SaaS platform serving 12,000+ active customers. Our support team handles 8,000+ monthly tickets with current average resolution time of 4.2 days and first-contact resolution rate of 68%. Customer satisfaction scores have declined from 8.1 to 7.2 over the past year, with specific complaints about response times and inconsistent service quality.

Industry benchmarks show leading companies achieve 1.5-day average resolution times with 85%+ first-contact resolution rates. Our current system limitations are impacting customer retention (3% increase in churn attributed to support issues) and preventing our support team from scaling effectively with business growth.

The Customer Experience team has identified support optimization as a top priority, with executive sponsorship from the Chief Customer Officer. This project aligns with our strategic goal of achieving industry-leading customer satisfaction scores and supporting our planned 40% customer base growth in 2024.`,
    problemStatement: `The current support system lacks intelligent routing capabilities, provides limited visibility into case status and resolution progress, has no integrated knowledge management system, and offers insufficient performance metrics for continuous improvement. Manual ticket assignment leads to uneven workload distribution, knowledge silos prevent efficient problem resolution, and customers lack visibility into support progress.

Key challenges include: manual ticket routing, no knowledge base integration, inconsistent case documentation, limited escalation procedures, no SLA tracking, poor reporting capabilities, and lack of customer self-service options. These limitations result in longer resolution times, lower customer satisfaction, and inefficient resource utilization.`,
    asIsProcess: `Current Support Process:
1. Customer submits ticket via email or web form
2. Tickets manually assigned to available support agent (first-come, first-served)
3. Agent researches issue independently using personal notes and experience
4. If escalation needed, agent emails senior team member
5. Resolution attempts documented in free-text fields
6. Customer updated via manual email responses
7. Ticket closed when customer stops responding or confirms resolution
8. No systematic knowledge capture or sharing
9. Monthly reporting compiled manually from ticket data
10. Performance reviews based on ticket volume rather than quality metrics

Pain Points: No intelligent routing, knowledge silos, manual status updates, inconsistent documentation, reactive escalation, limited customer visibility, poor performance metrics.`,
    businessGoals: [
      'Reduce average ticket resolution time from 4.2 days to 1.5 days',
      'Increase first-contact resolution rate from 68% to 85%',
      'Improve customer satisfaction scores by 40% (from 7.2 to 8.5+)',
      'Implement intelligent ticket routing based on agent expertise and workload',
      'Establish comprehensive knowledge base with search capabilities',
      'Achieve 95% SLA compliance for response and resolution times',
      'Reduce support team workload by 25% through self-service options',
      'Implement real-time performance dashboards and analytics'
    ],
    duration: '4 to 5 weeks',
    complexity: 'Intermediate',
    relevantStakeholders: ['stake-1', 'stake-2', 'stake-3', 'stake-8'], // Operations, Customer Service, IT, Customer Experience
    companyProducts: 'A SaaS platform that provides enterprise-grade business management tools, including workflow automation, reporting, and customer engagement modules.',
    companyServices: '24/7 technical support for enterprise customers; customer onboarding and training for the SaaS platform; premium support tiers (dedicated account manager, priority SLAs); knowledge sharing through webinars, documentation, and customer success programs.'
  },
  {
    id: 'proj-5',
    name: 'Employee Performance Management Platform',
    description: 'Internal focus: Performance Management System Modernization with continuous feedback, goal tracking, 360-degree reviews, and data-driven analytics.',
    businessContext: `HRTech Corp employs 2,500+ staff across 8 offices. They help clients stay compliant with health & safety regulations, but internally, their own employee performance reviews are outdated. 73% of employees find annual reviews ineffective, and managers spend more time on admin than meaningful discussions.`,
    problemStatement: `The internal performance review system is manual, annual-only, subjective, and disconnected from talent development.`,
    asIsProcess: `Current Performance Management Process:
1. Annual review cycle initiated by HR with email notifications
2. Manual distribution of performance review forms (Word documents)
3. Employees complete self-assessment forms independently
4. Managers complete evaluation forms based on memory and limited notes
5. HR compiles completed forms and schedules review meetings
6. One-on-one performance discussions held between manager and employee
7. Performance ratings assigned using 5-point scale
8. Development plans created during review meeting (often generic)
9. Forms filed in employee records with limited follow-up
10. Annual salary review process conducted separately by Compensation team

Pain Points: Annual-only feedback, subjective evaluations, no goal tracking, limited development planning, administrative burden, poor documentation, no performance analytics, disconnect between reviews and compensation decisions.`,
    businessGoals: [
      'Implement a continuous, data-driven performance management system to boost engagement, reduce turnover, and align staff performance with company objectives.',
      'Increase employee engagement scores by 25% within 12 months',
      'Improve goal achievement rates from 62% to 85% organization-wide',
      'Implement 360-degree feedback capabilities for all management levels',
      'Establish data-driven talent development and succession planning',
      'Reduce manager administrative time by 40% through automation',
      'Achieve 90%+ employee satisfaction with performance management process',
      'Enable real-time performance analytics and reporting for leadership'
    ],
    duration: '5 to 7 weeks',
    complexity: 'Advanced',
    relevantStakeholders: ['stake-1', 'stake-3', 'stake-4', 'stake-6'], // Operations, IT, HR, Finance
    companyProducts: 'Workplace safety compliance software; incident tracking and reporting tools.',
    companyServices: 'Health and safety audits; compliance training for employees and managers; risk assessment and hazard management consulting.'
  }
]

export const mockStakeholders: Stakeholder[] = [
  {
    id: 'stake-1',
    name: 'James Walker',
    role: 'Head of Operations',
    department: 'Operations',
    bio: 'James leads operational excellence initiatives across the organization with 15 years of experience in process optimization and operational strategy. He focuses on efficiency improvements and cross-functional coordination.',
    photo: '/Screenshot 2025-07-22 at 17.29.25.png',
    personality: 'Strategic, process-focused, results-driven leadership style',
    priorities: ['Operational efficiency', 'Process standardization', 'Resource optimization'],
    expertise: ['Process optimization', 'Operational strategy', 'Cross-functional coordination', 'Efficiency improvements', 'Resource management'],
    voice: 'en-US-maverick',
    agentId: 'agent_5601k16eqj3sfznbe2eqnmf21nry' // ElevenLabs agent ID
  },
  {
    id: 'stake-2',
    name: 'Jess Morgan',
    role: 'Customer Service Manager',
    department: 'Customer Service',
    bio: 'Aisha manages customer service operations with 10 years of experience in customer experience management and service delivery optimization. She specializes in customer satisfaction improvement and team performance.',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Customer-focused, empathetic, performance-oriented',
    priorities: ['Customer satisfaction', 'Service quality', 'Team efficiency'],
    expertise: ['Customer experience management', 'Service delivery optimization', 'Customer satisfaction improvement', 'Team performance management', 'Service quality assurance'],
    voice: 'en-UK-hazel',
    agentId: 'agent_3601k16fe93ject9vy38wev45tym' // ElevenLabs agent ID
  },
  {
    id: 'stake-3',
    name: 'David Thompson',
    role: 'IT Systems Lead',
    department: 'Information Technology',
    bio: 'David leads IT systems architecture and implementation with 12 years of experience in enterprise technology solutions. He specializes in system integration, security, and technical feasibility assessment.',
    photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Technical, analytical, security-conscious',
    priorities: ['System security', 'Technical feasibility', 'Integration capabilities'],
    expertise: ['IT systems architecture', 'Enterprise technology solutions', 'System integration', 'Security implementation', 'Technical feasibility assessment'],
    voice: 'en-AU-leyton',
    agentId: 'agent_9601k1768hj9ehraajtbxg0h32sj' // ElevenLabs agent ID
  },
  {
    id: 'stake-4',
    name: 'Sarah Patel',
    role: 'HR Business Partner',
    department: 'Human Resources',
    bio: 'Sarah partners with business units to align HR strategy with organizational objectives. With 9 years in HR business partnering, she focuses on change management, employee engagement, and organizational development.',
    photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'People-focused, collaborative, change management expert',
    priorities: ['Employee engagement', 'Change management', 'Training effectiveness'],
    expertise: ['HR business partnering', 'HR strategy alignment', 'Change management', 'Employee engagement', 'Organizational development'],
    voice: 'en-UK-hazel',
    agentId: 'agent_5601k16eqj3sfznbe2eqnmf21nry' // ElevenLabs agent ID
  },
  {
    id: 'stake-5',
    name: 'Emily Robinson',
    role: 'Compliance and Risk Manager',
    department: 'Risk Management',
    bio: 'Emily oversees compliance and risk management initiatives with 11 years of experience in regulatory compliance and risk assessment. She ensures organizational adherence to policies and regulatory requirements.',
    photo: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Detail-oriented, risk-aware, compliance-focused',
    priorities: ['Regulatory compliance', 'Risk mitigation', 'Policy adherence'],
    expertise: ['Regulatory compliance', 'Risk assessment', 'Policy development', 'Compliance management', 'Risk mitigation strategies'],
    voice: 'en-UK-hazel',
    agentId: 'agent_5601k16eqj3sfznbe2eqnmf21nry' // ElevenLabs agent ID
  },
  {
    id: 'stake-6',
    name: 'Michael Chen',
    role: 'Finance Manager',
    department: 'Finance',
    bio: 'Michael manages financial operations and analysis with 13 years of experience in corporate finance, budgeting, and financial reporting. He specializes in cost analysis, financial planning, and ROI assessment for business initiatives.',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Analytical, cost-conscious, data-driven',
    priorities: ['Cost optimization', 'Financial accuracy', 'ROI analysis'],
    expertise: ['Financial analysis', 'Budget management', 'Cost-benefit analysis', 'Financial reporting', 'ROI assessment', 'Financial planning'],
    voice: 'en-US-maverick',
    agentId: 'agent_9601k1768hj9ehraajtbxg0h32sj' // ElevenLabs agent ID
  },
  {
    id: 'stake-7',
    name: 'Lisa Rodriguez',
    role: 'Supply Chain Manager',
    department: 'Supply Chain',
    bio: 'Lisa oversees supply chain operations and procurement with 14 years of experience in inventory management, vendor relations, and demand planning. She specializes in supply chain optimization, procurement strategies, and warehouse operations.',
    photo: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Detail-oriented, strategic, efficiency-focused',
    priorities: ['Supply chain efficiency', 'Inventory optimization', 'Vendor management'],
    expertise: ['Inventory management', 'Demand forecasting', 'Procurement strategies', 'Warehouse operations', 'Supply chain optimization', 'Vendor relations'],
    voice: 'en-UK-hazel',
    agentId: 'agent_3601k16fe93ject9vy38wev45tym' // ElevenLabs agent ID
  },
  {
    id: 'stake-8',
    name: 'Robert Kim',
    role: 'Customer Experience Manager',
    department: 'Customer Experience',
    bio: 'Robert leads customer experience initiatives with 11 years of experience in customer journey optimization, support operations, and service delivery. He specializes in customer satisfaction improvement, support process design, and customer success metrics.',
    photo: 'https://images.pexels.com/photos/2566581/pexels-photo-2566581.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Customer-centric, empathetic, results-driven',
    priorities: ['Customer satisfaction', 'Service excellence', 'Customer journey optimization'],
    expertise: ['Customer experience design', 'Support operations', 'Customer journey optimization', 'Service delivery', 'Customer satisfaction metrics', 'Support process improvement'],
    voice: 'en-AU-leyton',
    agentId: 'agent_9601k1768hj9ehraajtbxg0h32sj' // ElevenLabs agent ID
  }
]