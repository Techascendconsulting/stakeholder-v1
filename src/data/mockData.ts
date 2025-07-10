import { Project, Stakeholder } from '../types'

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Customer Onboarding Process Optimization',
    description: 'Analyze and redesign the customer onboarding workflow to reduce time-to-value, improve customer satisfaction scores, and decrease early-stage churn rates through systematic process improvement.',
    businessContext: 'TechCorp is experiencing a 23% customer churn rate during the first 90 days, with new enterprise customers taking an average of 6-8 weeks to achieve initial value realization. This extended onboarding period is impacting customer lifetime value and creating competitive disadvantages.',
    problemStatement: 'The current onboarding process lacks standardization, involves 7 different departments without clear handoff protocols, and provides limited visibility into customer progress, resulting in delayed implementations and frustrated stakeholders.',
    asIsProcess: 'Contract signature → Sales handoff to Implementation → Manual scheduling of kickoff calls → Fragmented departmental involvement → Multiple tool usage without integration → Inconsistent customer communication → Extended go-live timelines',
    businessGoals: [
      'Reduce average onboarding time from 6-8 weeks to 3-4 weeks',
      'Increase customer satisfaction (CSAT) scores from 6.2 to 8.5+',
      'Decrease onboarding-related churn by 40%',
      'Improve internal process efficiency by 35%',
      'Establish standardized handoff protocols between departments'
    ],
    duration: '4-5 weeks',
    complexity: 'Intermediate'
  },
  {
    id: 'proj-2',
    name: 'Digital Expense Management System Implementation',
    description: 'Transform manual expense reporting processes through digital automation, implementing policy compliance controls, real-time approval workflows, and comprehensive audit trail capabilities.',
    businessContext: 'FinanceFirst Corp processes over 15,000 expense reports monthly through paper-based systems, resulting in 2-3 week processing delays, 12% error rates, and significant compliance risks during audits.',
    problemStatement: 'Manual expense processing creates bottlenecks in financial operations, lacks proper audit controls, generates frequent policy violations, and consumes excessive administrative resources across multiple departments.',
    asIsProcess: 'Paper receipt submission → Manual manager approval → Finance data entry → Accounting verification → Payment processing → Manual reconciliation → Quarterly audit preparation',
    businessGoals: [
      'Reduce expense processing time by 75% (from 2-3 weeks to 3-5 days)',
      'Eliminate manual data entry errors and improve accuracy to 99%+',
      'Ensure 100% compliance with corporate policies and audit requirements',
      'Decrease administrative processing costs by 50%',
      'Implement real-time policy violation detection and prevention'
    ],
    duration: '5-6 weeks',
    complexity: 'Advanced'
  },
  {
    id: 'proj-3',
    name: 'Multi-Location Inventory Management Enhancement',
    description: 'Optimize inventory levels across 15 warehouse locations through real-time visibility, demand forecasting integration, and automated reorder point management to minimize stockouts and excess inventory.',
    businessContext: 'RetailMax operates 15 distribution centers with $50M in inventory assets, experiencing 18% stockout rates and carrying 25% excess inventory due to poor visibility and manual forecasting processes.',
    problemStatement: 'Lack of real-time inventory visibility across locations leads to suboptimal stock allocation, missed sales opportunities, increased carrying costs, and inefficient supply chain operations.',
    asIsProcess: 'Weekly manual stock counts → Excel-based inventory tracking → Email-based reorder requests → Manual approval processes → Reactive purchasing decisions → Quarterly inventory reconciliation',
    businessGoals: [
      'Reduce stockout incidents by 65% across all locations',
      'Decrease excess inventory carrying costs by 30%',
      'Improve order fulfillment rate to 98% within 24 hours',
      'Enable real-time inventory visibility across all 15 locations',
      'Implement automated reorder point management system'
    ],
    duration: '3-4 weeks',
    complexity: 'Beginner'
  },
  {
    id: 'proj-4',
    name: 'Customer Support Ticket Management System',
    description: 'Redesign customer support operations through intelligent ticket routing, SLA management, knowledge base integration, and performance analytics to improve resolution times and customer satisfaction.',
    businessContext: 'ServicePro handles 8,000+ monthly support tickets with current average resolution time of 4.2 days, 68% first-contact resolution rate, and declining customer satisfaction scores due to inefficient case management.',
    problemStatement: 'Current support system lacks intelligent routing capabilities, provides limited visibility into case status, has no integrated knowledge management, and offers insufficient performance metrics for continuous improvement.',
    asIsProcess: 'Customer submits ticket → Manual assignment to available agent → Individual case research → Escalation through email → Manual status updates → Resolution without knowledge capture',
    businessGoals: [
      'Reduce average ticket resolution time from 4.2 days to 1.5 days',
      'Increase first-contact resolution rate from 68% to 85%',
      'Improve customer satisfaction scores by 40%',
      'Implement intelligent ticket routing and priority management',
      'Establish comprehensive knowledge base with search capabilities'
    ],
    duration: '4-5 weeks',
    complexity: 'Intermediate'
  },
  {
    id: 'proj-5',
    name: 'Employee Performance Management Platform',
    description: 'Modernize annual performance review processes through continuous feedback mechanisms, goal tracking integration, 360-degree review capabilities, and data-driven performance analytics.',
    businessContext: 'HRTech Corp conducts annual performance reviews for 2,500+ employees using manual processes, resulting in inconsistent evaluations, limited feedback quality, and poor alignment between individual goals and organizational objectives.',
    problemStatement: 'Current performance management relies on annual reviews with subjective evaluations, lacks continuous feedback mechanisms, provides limited goal visibility, and offers insufficient data for talent development decisions.',
    asIsProcess: 'Annual review cycle initiation → Manual form distribution → Individual self-assessments → Manager evaluations → HR compilation → Performance ratings assignment → Development plan creation',
    businessGoals: [
      'Transition from annual to continuous performance feedback model',
      'Increase employee engagement scores by 25%',
      'Improve goal achievement rates from 62% to 85%',
      'Implement 360-degree feedback capabilities',
      'Establish data-driven talent development and succession planning'
    ],
    duration: '5-7 weeks',
    complexity: 'Advanced'
  }
]

export const mockStakeholders: Stakeholder[] = [
  {
    id: 'stake-1',
    name: 'James Walker',
    role: 'Head of Operations',
    department: 'Operations',
    bio: 'James leads operational excellence initiatives across the organization with 15 years of experience in process optimization and operational strategy. He focuses on efficiency improvements and cross-functional coordination.',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Strategic, process-focused, results-driven leadership style',
    priorities: ['Operational efficiency', 'Process standardization', 'Resource optimization'],
    voice: 'en-GB-RyanNeural'
  },
  {
    id: 'stake-2',
    name: 'Aisha Ahmed',
    role: 'Customer Service Manager',
    department: 'Customer Service',
    bio: 'Aisha manages customer service operations with 10 years of experience in customer experience management and service delivery optimization. She specializes in customer satisfaction improvement and team performance.',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Customer-focused, empathetic, performance-oriented',
    priorities: ['Customer satisfaction', 'Service quality', 'Team efficiency'],
    voice: 'en-GB-SoniaNeural'
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
    voice: 'en-GB-ThomasNeural'
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
    voice: 'en-GB-LibbyNeural'
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
    voice: 'en-GB-AbbiNeural'
  }
]