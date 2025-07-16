import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus, Star, Tag } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { Message } from '../../types'

const MeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, user, setCurrentView } = useApp()
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')

  // Mock questions for demonstration
  const mockQuestions = {
    'as-is': [
      'Can you walk me through the current process from start to finish?',
      'What are the main pain points in the existing system?',
      'How much time does the current process typically take?',
      'What manual steps are involved in the current workflow?',
      'Where do you see the biggest bottlenecks occurring?'
    ],
    'to-be': [
      'What would an ideal solution look like for your team?',
      'What specific improvements would you like to see?',
      'How would you measure success for this project?',
      'What features are most important to you?',
      'How should the new process differ from the current one?'
    ]
  }

  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your meeting for ${selectedProject.name}. The following stakeholders are present: ${selectedStakeholders.map(s => s.name).join(', ')}.`,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [selectedProject, selectedStakeholders])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Simulate AI response
    setTimeout(() => {
      const stakeholder = selectedStakeholders[0] || { name: 'Stakeholder', role: 'Team Member' }
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        speaker: stakeholder.id || 'stakeholder',
        content: generateMockResponse(inputMessage, stakeholder),
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)

    setInputMessage('')
  }

  const generateMockResponse = (question: string, stakeholder: any) => {
    // Analyze question type and context
    const questionType = analyzeQuestionType(question)
    const questionContext = analyzeQuestionContext(question)
    
    // Generate contextual response based on stakeholder profile
    return generateContextualResponse(question, stakeholder, questionType, questionContext)
  }

  const analyzeQuestionType = (question: string) => {
    const lowerQ = question.toLowerCase()
    
    if (lowerQ.includes('walk me through') || lowerQ.includes('describe') || lowerQ.includes('explain')) {
      return 'process_explanation'
    }
    if (lowerQ.includes('pain point') || lowerQ.includes('problem') || lowerQ.includes('challenge') || lowerQ.includes('issue')) {
      return 'pain_points'
    }
    if (lowerQ.includes('ideal') || lowerQ.includes('solution') || lowerQ.includes('improve') || lowerQ.includes('want')) {
      return 'solution_vision'
    }
    if (lowerQ.includes('time') || lowerQ.includes('long') || lowerQ.includes('duration')) {
      return 'timing'
    }
    if (lowerQ.includes('measure') || lowerQ.includes('success') || lowerQ.includes('kpi') || lowerQ.includes('metric')) {
      return 'success_metrics'
    }
    if (lowerQ.includes('budget') || lowerQ.includes('cost') || lowerQ.includes('resource')) {
      return 'resources'
    }
    if (lowerQ.includes('user') || lowerQ.includes('people') || lowerQ.includes('team') || lowerQ.includes('staff')) {
      return 'user_impact'
    }
    if (lowerQ.includes('technical') || lowerQ.includes('system') || lowerQ.includes('technology')) {
      return 'technical'
    }
    if (lowerQ.includes('risk') || lowerQ.includes('concern') || lowerQ.includes('worry')) {
      return 'risks_concerns'
    }
    
    return 'general'
  }

  const analyzeQuestionContext = (question: string) => {
    const lowerQ = question.toLowerCase()
    
    if (lowerQ.includes('current') || lowerQ.includes('existing') || lowerQ.includes('as-is') || lowerQ.includes('today')) {
      return 'current_state'
    }
    if (lowerQ.includes('new') || lowerQ.includes('future') || lowerQ.includes('to-be') || lowerQ.includes('after')) {
      return 'future_state'
    }
    
    return 'general'
  }

  const generateContextualResponse = (question: string, stakeholder: any, questionType: string, questionContext: string) => {
    const projectContext = selectedProject
    const role = stakeholder.role
    const department = stakeholder.department
    const personality = stakeholder.personality
    const priorities = stakeholder.priorities
    
    // Generate response based on question type and stakeholder profile
    switch (questionType) {
      case 'process_explanation':
        return generateProcessExplanation(stakeholder, projectContext, questionContext)
      
      case 'pain_points':
        return generatePainPointsResponse(stakeholder, projectContext)
      
      case 'solution_vision':
        return generateSolutionVisionResponse(stakeholder, projectContext)
      
      case 'timing':
        return generateTimingResponse(stakeholder, projectContext)
      
      case 'success_metrics':
        return generateSuccessMetricsResponse(stakeholder, projectContext)
      
      case 'resources':
        return generateResourcesResponse(stakeholder, projectContext)
      
      case 'user_impact':
        return generateUserImpactResponse(stakeholder, projectContext)
      
      case 'technical':
        return generateTechnicalResponse(stakeholder, projectContext)
      
      case 'risks_concerns':
        return generateRisksResponse(stakeholder, projectContext)
      
      default:
        return generateGeneralResponse(stakeholder, question, projectContext)
    }
  }

  const generateProcessExplanation = (stakeholder: any, project: any, context: string) => {
    const responses = {
      'Head of Operations': [
        `Let me walk you through our current process from an operational perspective. Right now, we have a multi-step workflow that involves several handoffs between departments. The process typically starts when a request comes in through our current system, then it gets routed manually to the appropriate team member. From there, we have to coordinate with multiple stakeholders to ensure everything is properly documented and approved. The challenge is that each step requires manual verification, which creates bottlenecks and delays. We're looking at an average processing time of about 6-8 weeks, which is honestly too long for today's business environment.`,
        `From my operational standpoint, I can break down the current process into several key phases. First, we have the intake phase where requests are received and initially categorized. Then we move to the assessment phase where we evaluate requirements and assign resources. The coordination phase involves multiple touchpoints between teams - this is where we see most of our delays. Finally, we have the execution and closure phases. The real issue is that we lack standardized procedures and automated workflows, which means too much depends on individual knowledge and manual processes.`
      ],
      'Customer Service Manager': [
        `From a customer service perspective, let me explain how this process currently impacts our customers. When a customer submits a request, they first interact with our front-line support team. We log their request in our system and provide an initial response, but then the customer often experiences a communication gap while we work through our internal processes. We try to provide status updates, but honestly, our current system doesn't give us great visibility into where things stand. Customers frequently call back asking for updates, which creates additional work for our team and frustration for them. The entire customer journey feels disconnected right now.`,
        `I can walk you through the customer-facing side of our current process. Initially, customers reach out through multiple channels - phone, email, or our web portal. We capture their information and create a case, but from that point, the customer experience becomes fragmented. They might receive updates from different team members, and the messaging isn't always consistent. We're seeing customer satisfaction scores decline because of this lack of transparency and the extended timelines. Our team spends a lot of time fielding status inquiries that could be eliminated with better process automation.`
      ],
      'IT Systems Lead': [
        `From a technical systems perspective, let me explain our current architecture and data flow. We're working with several legacy systems that weren't designed to integrate with each other. When a request comes in, it gets entered into our primary system, but then data needs to be manually transferred to other systems for different processing steps. We have API limitations that prevent real-time synchronization, so we're dealing with batch processing and data inconsistencies. The technical debt is significant - we're spending more time on workarounds than on actual solution development.`,
        `Our current technical process involves multiple systems that create complexity rather than efficiency. We start with data entry in System A, then manual export to System B for processing, followed by another manual step to update System C for reporting. Each system has its own user interface and data structure, which means our team needs to be trained on multiple platforms. The integration points are fragile, and we frequently deal with data synchronization issues. We need a unified architecture that can handle the entire process flow.`
      ],
      'HR Business Partner': [
        `From an HR perspective, let me explain how our current process impacts our people and organizational effectiveness. Right now, our team members are spending significant time on manual tasks that could be automated. This creates fatigue and reduces job satisfaction because people feel like they're doing busy work rather than meaningful contributions. We also have training challenges because the current process is complex and varies depending on who's handling the case. New team members need extensive training, and even experienced staff sometimes struggle with the lack of standardization.`,
        `Looking at this from a people and change management perspective, our current process creates several challenges. First, we have unclear role definitions - people aren't sure who's responsible for what, which leads to either duplication of effort or things falling through the cracks. Second, the manual nature of the work means we're not leveraging our team's skills effectively. Our talented professionals are spending time on administrative tasks instead of strategic work. Finally, the process frustrations are contributing to turnover in key roles.`
      ],
      'Compliance and Risk Manager': [
        `From a compliance and risk perspective, let me outline our current process and the challenges we face. Our existing workflow has several control points, but they're not consistently applied across all cases. We rely heavily on manual reviews and approvals, which introduces human error risk. Documentation standards vary depending on who's handling the case, which creates audit concerns. We're also dealing with regulatory requirements that our current system doesn't fully support, so we're maintaining parallel processes for compliance tracking.`,
        `Our current compliance process involves multiple checkpoints and approvals, but the manual nature creates both efficiency and risk issues. We have policy requirements that need to be validated at each step, but our current system doesn't provide automated controls or audit trails. This means we're dependent on individual knowledge and manual verification, which isn't sustainable as we scale. We also face challenges with regulatory reporting because data isn't captured consistently across all touchpoints.`
      ],
      'default': [
        `Let me walk you through how we currently handle this process. From my perspective in ${stakeholder.department}, I can see that we have several sequential steps that require coordination between different teams. The process starts with initial intake and moves through various approval and review stages. However, one of the main challenges is that each step requires manual handoffs and verification, which creates delays and potential for errors. We're looking at ways to streamline this while maintaining quality standards.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generatePainPointsResponse = (stakeholder: any, project: any) => {
    const responses = {
      'Head of Operations': [
        `The biggest pain point from an operational standpoint is the lack of process standardization. Each team member handles things slightly differently, which creates inconsistencies and makes it difficult to predict timelines or outcomes. We're also dealing with resource allocation challenges - we never have clear visibility into workload distribution across teams. Another major issue is the manual handoffs between departments. Information gets lost, there are delays while people wait for responses, and we frequently have to chase down status updates. It's frustrating because we know we could be much more efficient with the right systems in place.`,
        `From my operational perspective, the pain points are significant. First, we have no real-time visibility into process bottlenecks, so problems aren't identified until they become critical. Second, the manual nature of our current process means we're constantly dealing with human error - missed steps, incorrect data entry, lost documents. Third, we're spending way too much time on administrative tasks that add no value. Our team should be focused on strategic initiatives, not chasing paperwork. Finally, the lack of standardization makes it impossible to accurately forecast delivery times or resource requirements.`
      ],
      'Customer Service Manager': [
        `The main pain point from a customer service perspective is the lack of transparency we can provide to our customers. When they ask for status updates, we often don't have current information because the process involves so many different systems and people. This leads to frustrated customers and puts our team in a difficult position. We're also seeing increased call volume because customers feel they need to check in regularly rather than trusting that we'll proactively communicate with them. The inconsistent experience is damaging our customer relationships and impacting our team's morale.`,
        `From a customer experience standpoint, the pain points are really impacting our reputation. Customers are frustrated with the long timelines and lack of communication. They often feel like their case is stuck somewhere in the process with no visibility. Our team is spending too much time on administrative follow-ups instead of actually solving customer problems. We're also dealing with escalations that could be prevented with better process transparency. The manual nature of our current approach means we can't provide the level of service our customers expect in today's digital environment.`
      ],
      'IT Systems Lead': [
        `The technical pain points are substantial. We're dealing with legacy systems that weren't designed to work together, which creates integration challenges and data inconsistencies. Performance is suffering because we're running multiple systems that should be consolidated. We have security concerns because data is being transferred manually between systems, increasing the risk of breaches. Maintenance is also becoming a problem - we're spending more time keeping the current systems running than we are on innovation. The technical debt is growing, and we need to address it before it becomes unmanageable.`,
        `From a technical perspective, the biggest pain points are system fragmentation and data integrity issues. We're maintaining multiple databases that should be unified, which creates synchronization problems and reporting challenges. The manual data entry processes are error-prone and time-consuming. We also have scalability concerns - our current architecture won't support the growth we're expecting. Security and compliance are ongoing challenges because we can't implement consistent controls across all systems. The development team is frustrated because they're constantly fixing integration issues instead of building new capabilities.`
      ],
      'HR Business Partner': [
        `The people-related pain points are significant. Our team members are experiencing burnout from the manual, repetitive tasks that could be automated. Job satisfaction is declining because people feel like they're not able to focus on meaningful work. We're also seeing training challenges - new hires need extensive orientation to understand our complex processes, and even experienced staff struggle with the lack of standardization. The unclear role definitions are creating confusion and conflict between teams. We need to address these issues to maintain engagement and retention.`,
        `From a people perspective, the current process is creating several challenges. First, we have role ambiguity - people aren't clear on their responsibilities, which leads to either duplication or gaps in coverage. Second, the manual nature of the work isn't leveraging our team's skills effectively. Our professionals want to contribute strategically, but they're stuck doing administrative tasks. Third, the process frustrations are contributing to turnover, and we're losing institutional knowledge. Finally, the lack of standardization makes it difficult to provide consistent training and development opportunities.`
      ],
      'Compliance and Risk Manager': [
        `The compliance and risk pain points are concerning. Our manual processes create audit trail gaps and inconsistent documentation. We're relying on individual knowledge rather than systematic controls, which introduces compliance risk. The lack of standardization means we can't ensure consistent application of policies and procedures. We're also dealing with regulatory reporting challenges because data isn't captured uniformly across all touchpoints. The manual nature of our current approach makes it difficult to demonstrate compliance during audits or regulatory reviews.`,
        `From a risk management perspective, the current process has several vulnerabilities. We have inadequate controls and audit trails, which creates compliance exposure. The manual handoffs increase the risk of errors and omissions. We're also dealing with data security concerns because information is being transferred through multiple systems and processes. The lack of standardization makes it difficult to ensure consistent risk mitigation across all cases. We need automated controls and better documentation to meet our regulatory obligations and reduce operational risk.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, the main pain points center around ${stakeholder.priorities[0].toLowerCase()} and ${stakeholder.priorities[1].toLowerCase()}. We're dealing with inefficiencies in our current process that prevent us from delivering the quality of service our stakeholders expect. The manual nature of many steps creates bottlenecks and increases the risk of errors. We need better systems and processes that align with our priorities of ${stakeholder.priorities.join(', ').toLowerCase()}.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateSolutionVisionResponse = (stakeholder: any, project: any) => {
    const responses = {
      'Head of Operations': [
        `From an operational perspective, the ideal solution would provide end-to-end process automation with clear visibility into every step. I envision a system where requests are automatically routed based on predefined criteria, with real-time tracking and automated notifications. We need standardized workflows that eliminate manual handoffs and reduce processing time significantly. The solution should include performance analytics so we can identify bottlenecks and continuously improve. Most importantly, it should integrate seamlessly with our existing systems while providing the flexibility to adapt to changing business requirements.`,
        `My vision for the ideal solution focuses on operational excellence and efficiency. We need a unified platform that can handle the entire process flow with minimal manual intervention. The system should provide predictive analytics to help us forecast workload and allocate resources effectively. I'd like to see automated escalation procedures and exception handling that reduce the need for manual oversight. The solution should also include comprehensive reporting capabilities so we can measure performance against our operational KPIs and demonstrate continuous improvement.`
      ],
      'Customer Service Manager': [
        `From a customer service perspective, the ideal solution would prioritize transparency and communication. I envision a system where customers can track their case status in real-time, similar to package tracking. They should receive automated updates at key milestones, and we should have the ability to proactively communicate any delays or issues. The solution should also include customer self-service options so they can find answers to common questions without contacting our team. Most importantly, it should provide our agents with a complete view of the customer's history and case details so we can provide personalized, efficient service.`,
        `My ideal solution would transform the customer experience completely. Customers should have a single portal where they can submit requests, track progress, and access relevant information. The system should include intelligent routing so cases get to the right specialist immediately, reducing resolution time. I'd like to see integration with our knowledge base so customers can find answers independently when possible. The solution should also provide our team with better tools for case management and customer communication, enabling us to deliver more proactive and personalized service.`
      ],
      'IT Systems Lead': [
        `From a technical perspective, the ideal solution would be a modern, cloud-based platform with robust API capabilities for seamless integration. I envision a microservices architecture that provides scalability and flexibility while maintaining security and performance standards. The system should include automated data validation and real-time synchronization across all touchpoints. We need comprehensive security controls, audit logging, and compliance features built into the platform. The solution should also provide development tools and frameworks that enable rapid customization and future enhancements.`,
        `My vision for the technical solution focuses on a unified, scalable architecture that eliminates our current system fragmentation. We need a platform that can handle our current volume while scaling to support future growth. The solution should include advanced analytics and machine learning capabilities to provide insights and automation opportunities. I'd like to see robust integration capabilities that can connect with our existing systems and future tools. Security and compliance should be built-in rather than bolt-on, with automated controls and comprehensive audit trails.`
      ],
      'HR Business Partner': [
        `From a people perspective, the ideal solution would automate routine tasks and enable our team to focus on strategic, value-added work. I envision a system that provides clear role definitions and responsibilities, eliminating confusion and overlap. The solution should include training and knowledge management capabilities so team members can quickly access information and procedures. We need user-friendly interfaces that require minimal training and support intuitive workflows. The solution should also provide performance metrics and feedback mechanisms that help with professional development and recognition.`,
        `My ideal solution would address the people and change management aspects of our current challenges. The system should be intuitive and user-friendly, requiring minimal training for adoption. I'd like to see features that support collaboration and knowledge sharing across teams. The solution should provide clear accountability and performance metrics that help with goal setting and professional development. We need change management tools that help with communication and training during implementation. Most importantly, the solution should make our team members' work more meaningful and engaging.`
      ],
      'Compliance and Risk Manager': [
        `From a compliance perspective, the ideal solution would have built-in controls and automated audit trails that ensure consistent policy application. I envision a system with configurable approval workflows that enforce our governance requirements. The solution should include comprehensive documentation capabilities and automated compliance reporting. We need risk management features that can identify potential issues before they become problems. The system should also provide regular compliance monitoring and alerting capabilities that help us maintain regulatory adherence.`,
        `My vision for the ideal solution prioritizes risk mitigation and compliance automation. The system should include automated controls that prevent errors and ensure consistent policy application. I'd like to see comprehensive audit logging that creates defensible documentation for regulatory reviews. The solution should provide risk assessment capabilities and automated monitoring for compliance violations. We need configurable workflows that can adapt to changing regulatory requirements while maintaining consistent controls. The system should also include reporting capabilities that support our regulatory obligations and internal governance requirements.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, the ideal solution would address our key priorities of ${stakeholder.priorities.join(', ').toLowerCase()}. We need a system that streamlines our current processes while maintaining the quality and control standards we require. The solution should be user-friendly and integrate well with our existing workflows. Most importantly, it should provide the capabilities we need to deliver better results for our stakeholders while reducing the manual effort required from our team.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateTimingResponse = (stakeholder: any, project: any) => {
    const responses = {
      'Head of Operations': [
        `From an operational timing perspective, our current process averages 6-8 weeks, which is honestly too long for today's business environment. I'd like to see us reduce that to 3-4 weeks through process optimization and automation. The key time-consuming elements are the manual handoffs between departments and the approval processes. If we can automate the routing and provide real-time visibility, we should be able to eliminate most of the delays. We need to set realistic expectations while also pushing for continuous improvement in our cycle times.`,
        `Looking at timing from an operational standpoint, we're dealing with unpredictable timelines right now because so much depends on individual availability and manual processes. In an ideal state, we should be able to provide accurate time estimates upfront and meet those commitments consistently. I think we can reduce our processing time by at least 50% through better workflow design and automation. The challenge is balancing speed with quality - we can't compromise on thoroughness, but we can definitely eliminate inefficiencies.`
      ],
      'Customer Service Manager': [
        `From a customer service timing perspective, our customers are telling us that our current timelines are too long. They're comparing us to other service providers who can deliver similar results in half the time. We need to be more competitive while still maintaining quality. I think we can significantly reduce timelines by improving our initial intake process and providing better status communication. Even if we can't speed up every step, we can at least keep customers informed so they don't feel like their case is stuck somewhere in the process.`,
        `Timing is a critical customer satisfaction factor. Right now, customers are frustrated because they don't know what to expect or when they'll hear back from us. We need to establish clear timelines and meet them consistently. I believe we can reduce our overall processing time while also providing better predictability. The key is improving our initial assessment and routing processes so cases get to the right resource immediately. We should also implement milestone-based communication so customers know exactly where they stand.`
      ],
      'IT Systems Lead': [
        `From a technical timing perspective, our current system limitations are definitely contributing to delays. Database queries are slow, integration processes are batch-based rather than real-time, and we have performance issues during peak usage. With a modern architecture, we could significantly reduce processing time and provide near real-time updates. The technical components shouldn't be the bottleneck - we need systems that support efficient workflows rather than hindering them.`,
        `Looking at timing from a technical standpoint, we have opportunities to dramatically improve performance through better system design. Our current architecture creates unnecessary delays through batch processing and manual data transfers. With proper automation and integration, we could reduce technical processing time by 70-80%. The key is implementing real-time data synchronization and automated workflow triggers that eliminate the waiting time between process steps.`
      ],
      'HR Business Partner': [
        `From a people and timing perspective, our current process requires too much manual coordination between team members, which creates delays and dependencies. We need to redesign workflows so that people can work more independently and efficiently. Training time is also a factor - new team members need extensive orientation to understand our complex processes. With better systems and standardization, we could reduce both processing time and training requirements.`,
        `Timing from an HR perspective involves both process efficiency and people productivity. Our team members are spending too much time on administrative tasks that could be automated. We need to free up their time for more strategic work while also reducing the overall cycle time. Change management will be important - we need to ensure that process improvements are adopted effectively and that people are comfortable with new timelines and expectations.`
      ],
      'Compliance and Risk Manager': [
        `From a compliance timing perspective, we need to balance speed with thoroughness. We can't compromise on required reviews and approvals, but we can streamline the process through better automation and controls. Many of our current delays come from manual verification steps that could be automated. We need to maintain audit trails and documentation standards while reducing the time required for compliance checking.`,
        `Timing from a risk management perspective requires careful consideration of control requirements. We have mandatory review and approval steps that can't be eliminated, but we can make them more efficient through automation and better workflow design. The key is implementing automated controls that can perform routine checks instantly while flagging exceptions for human review. This would maintain our risk standards while significantly reducing processing time.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, timing is important for ${stakeholder.priorities[0].toLowerCase()}. Our current process takes longer than it should, primarily due to manual steps and coordination challenges. I believe we can reduce the timeline significantly through better automation and process design while maintaining the quality standards that are important to us.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateSuccessMetricsResponse = (stakeholder: any, project: any) => {
    const responses = {
      'Head of Operations': [
        `From an operational success perspective, I'd measure success through several key metrics. First, cycle time reduction - we should see at least a 50% decrease in average processing time. Second, process consistency - we need 95%+ adherence to standardized procedures. Third, resource utilization - we should be able to handle 30% more volume with the same team size. Fourth, error reduction - we should see fewer than 2% of cases requiring rework. Finally, customer satisfaction - we should maintain or improve our current satisfaction scores while delivering faster results.`,
        `Success metrics from an operational standpoint should focus on efficiency and quality. I'd track processing time, throughput, error rates, and resource utilization. We should see measurable improvements in cycle time, consistency, and predictability. I'd also want to measure employee productivity and satisfaction since they're the ones executing the improved processes. ROI is important too - we should be able to demonstrate clear cost savings through reduced manual effort and improved efficiency.`
      ],
      'Customer Service Manager': [
        `From a customer service success perspective, the primary metrics should be customer satisfaction scores and response times. I'd want to see our CSAT scores improve from their current level to at least 8.5 out of 10. First contact resolution should increase significantly - we should be able to resolve more cases without multiple touchpoints. We should also track customer effort scores and Net Promoter Scores to ensure we're delivering an experience that customers would recommend. Communication metrics are important too - we should see reduced inquiry volume about case status.`,
        `Success from a customer service perspective means better experiences and outcomes for our customers. I'd measure customer satisfaction, response times, resolution rates, and proactive communication effectiveness. We should see reduced escalations and complaints about process delays. Customer retention and loyalty metrics are also important - satisfied customers are more likely to continue working with us and recommend our services. The ultimate goal is to exceed customer expectations while reducing the effort required from our team.`
      ],
      'IT Systems Lead': [
        `From a technical success perspective, I'd measure system performance, reliability, and user adoption. We should see significant improvements in processing speed, system availability, and integration effectiveness. Security metrics are important - we should have zero security incidents and improved compliance with our security standards. I'd also track user satisfaction with the new systems and monitor adoption rates. Technical debt reduction is another key metric - we should see decreased maintenance requirements and increased development velocity.`,
        `Success from a technical standpoint means improved system performance and user experience. I'd measure system uptime, response times, error rates, and integration effectiveness. We should see reduced technical support tickets and faster resolution of any issues that do arise. Data quality and consistency metrics are important too - we should have a single source of truth with accurate, real-time information. The system should also provide the scalability and flexibility we need for future growth.`
      ],
      'HR Business Partner': [
        `From a people success perspective, I'd measure employee engagement, productivity, and retention. We should see improved job satisfaction scores as people are able to focus on more meaningful work. Training time for new employees should decrease significantly with better systems and processes. We should also see improved collaboration and communication between teams. Change management success is important - we need high adoption rates and positive feedback about the new processes.`,
        `Success from an HR perspective means better outcomes for our people and organization. I'd track employee satisfaction, engagement levels, and retention rates. We should see reduced time spent on administrative tasks and increased focus on strategic work. Training effectiveness and time-to-productivity for new hires should improve. We should also see better role clarity and reduced conflict between teams. The ultimate goal is to create a more positive and productive work environment.`
      ],
      'Compliance and Risk Manager': [
        `From a compliance success perspective, I'd measure adherence to policies, audit trail completeness, and regulatory compliance. We should see 100% compliance with required procedures and improved documentation standards. Risk metrics are important - we should see reduced operational risk and fewer compliance violations. Audit preparation time should decrease significantly with better automated controls and documentation. We should also see improved reporting capabilities that support our regulatory obligations.`,
        `Success from a risk management perspective means better controls and compliance outcomes. I'd track compliance violations, audit findings, and risk incidents. We should see improved consistency in policy application and better documentation standards. The system should provide automated monitoring and alerting that helps prevent compliance issues. We should also see improved regulatory reporting capabilities and reduced time required for audit preparation and response.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, success would be measured through improvements in ${stakeholder.priorities.join(', ').toLowerCase()}. We should see measurable progress in our key performance indicators while maintaining the quality standards that are important to our stakeholders. The specific metrics would depend on our priorities, but overall success means delivering better results more efficiently.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateResourcesResponse = (stakeholder: any, project: any) => {
    const responses = {
      'Head of Operations': [
        `From a resource perspective, we need to consider both human and financial resources. We'll need dedicated project management support during implementation, and our team members will need time for training and transition activities. Budget-wise, we should plan for software licensing, implementation services, and potential system integration costs. We should also consider the opportunity cost of team members' time during the transition period. However, I expect we'll see ROI within 12-18 months through improved efficiency and reduced operational costs.`,
        `Resource requirements from an operational standpoint include project management, technical resources, and change management support. We'll need subject matter experts from each department to help with requirements gathering and process design. Training resources will be important for user adoption. From a budget perspective, we should plan for software costs, implementation services, and potential infrastructure upgrades. We should also consider ongoing maintenance and support costs in our financial planning.`
      ],
      'Customer Service Manager': [
        `From a customer service resource perspective, we'll need to consider the impact on our daily operations during implementation. We'll need coverage for team members who are involved in training and testing activities. We should also plan for additional communication resources to keep customers informed about any changes that might affect them. Budget considerations include potential customer communication costs and any tools or systems we need to support the improved customer experience.`,
        `Resource requirements from a customer service standpoint include training time for our team and potential temporary staffing during the transition. We'll need resources for customer communication about process changes and improvements. We should also consider the need for updated customer-facing materials and potentially enhanced support capabilities. The investment should pay off through improved customer satisfaction and reduced support volume for status inquiries.`
      ],
      'IT Systems Lead': [
        `From a technical resource perspective, we'll need development and implementation resources, both internal and external. We'll need infrastructure for the new system, including servers, storage, and network capacity. We should plan for integration costs and potential data migration resources. Security and compliance resources will be important for ensuring the new system meets our standards. We'll also need ongoing support and maintenance resources. The budget should include software licensing, implementation services, and infrastructure costs.`,
        `Resource requirements from a technical standpoint include development resources, infrastructure, and integration capabilities. We'll need skilled professionals for implementation, testing, and deployment. We should plan for potential hardware upgrades and infrastructure improvements. Security and compliance resources will be critical for ensuring the new system meets our standards. Ongoing support and maintenance resources are also important for long-term success.`
      ],
      'HR Business Partner': [
        `From an HR resource perspective, we'll need change management and training resources. We'll need to plan for the time our team members will spend learning new processes and systems. We should consider potential temporary staffing needs during the transition period. Communication resources will be important for keeping everyone informed about changes and progress. We should also plan for ongoing training and development resources to ensure sustained adoption and continuous improvement.`,
        `Resource requirements from an HR perspective include change management support, training development, and communication resources. We'll need to plan for employee time during training and transition activities. We should consider the need for additional support during the learning curve period. We'll also need resources for ongoing performance monitoring and feedback collection to ensure the changes are having the desired effect on employee satisfaction and productivity.`
      ],
      'Compliance and Risk Manager': [
        `From a compliance resource perspective, we'll need resources for risk assessment, policy development, and audit preparation. We'll need legal and compliance expertise to ensure the new system meets all regulatory requirements. We should plan for documentation and training resources to ensure everyone understands their compliance obligations. We'll also need resources for ongoing monitoring and reporting to maintain compliance standards.`,
        `Resource requirements from a risk management standpoint include compliance assessment, policy development, and audit preparation resources. We'll need expertise in regulatory requirements and risk management. We should plan for documentation and training resources to ensure consistent compliance. We'll also need resources for ongoing monitoring and reporting to maintain our risk management standards and regulatory compliance.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, resource requirements include both human and financial resources. We'll need dedicated time from our team members for planning, training, and implementation activities. Budget considerations include software costs, implementation services, and ongoing maintenance. We should also consider the resources needed to maintain our focus on ${stakeholder.priorities.join(', ').toLowerCase()} during the transition period.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateUserImpactResponse = (stakeholder: any, project: any) => {
    const responses = {
      'Head of Operations': [
        `From a user impact perspective, our operations team will see significant changes in their daily workflows. They'll need to adapt to new systems and processes, which will require training and adjustment time. However, the long-term benefits should include reduced manual work, better visibility into process status, and more time for strategic activities. We need to manage this transition carefully to maintain productivity while people learn new ways of working. The key is ensuring that the new processes are intuitive and provide clear value to the users.`,
        `User impact from an operational standpoint will be substantial but positive. Our team members will need to learn new systems and processes, which always creates some initial disruption. However, the improved efficiency and reduced manual work should make their jobs more satisfying and productive. We need to provide adequate training and support during the transition. The goal is to make everyone's work easier and more effective while maintaining our operational standards.`
      ],
      'Customer Service Manager': [
        `From a customer service user impact perspective, our team will need to adapt to new tools and processes for case management and customer communication. The learning curve will be significant initially, but the improved capabilities should make their jobs easier and more rewarding. They'll have better information at their fingertips and more efficient ways to help customers. We need to provide comprehensive training and ongoing support to ensure successful adoption. The ultimate goal is to enable our team to provide better service while reducing frustration and administrative burden.`,
        `User impact from a customer service standpoint will affect both our team and our customers. Our staff will need to learn new systems and processes, which will require time and training. However, the improved capabilities should make their work more efficient and satisfying. Customers will also experience changes in how they interact with us, but these should be positive improvements in transparency and responsiveness. We need to manage both internal and external change management carefully.`
      ],
      'IT Systems Lead': [
        `From a technical user impact perspective, our IT team will need to adapt to new systems and technologies. They'll need training on new platforms and potentially new programming languages or frameworks. The transition will require careful planning to ensure system reliability and performance during the changeover. However, the modern technology should make maintenance easier and enable more innovation. We need to ensure our team has the skills and support they need to be successful with the new systems.`,
        `User impact from a technical standpoint will primarily affect our IT team and end users. Our technical staff will need to learn new systems and processes, which will require training and adjustment time. End users will experience changes in user interfaces and workflows, which will require training and support. However, the improved systems should provide better performance and user experience. We need to plan for adequate training and support during the transition period.`
      ],
      'HR Business Partner': [
        `From an HR user impact perspective, this change will affect everyone in the organization to some degree. We need to consider change management, training requirements, and potential resistance to new processes. People will need time to adapt to new ways of working, and we need to provide adequate support during the transition. The key is communicating the benefits clearly and providing the training and resources people need to be successful. We should also plan for feedback collection and continuous improvement based on user experiences.`,
        `User impact from an HR perspective is significant and needs careful management. All affected team members will need training and support to adapt to new processes and systems. We need to consider individual learning styles and provide multiple training options. Change management will be critical for ensuring successful adoption. We should also plan for ongoing support and feedback collection to ensure the changes are having the desired impact on employee satisfaction and productivity.`
      ],
      'Compliance and Risk Manager': [
        `From a compliance user impact perspective, all users will need to understand new procedures and compliance requirements. Training will be critical to ensure everyone understands their responsibilities under the new system. We need to ensure that compliance controls are built into the user experience so that doing the right thing is the easy thing. Documentation and reference materials will be important for ongoing compliance. We should also plan for monitoring and feedback to ensure compliance standards are being met.`,
        `User impact from a risk management standpoint includes training requirements and new compliance procedures. All users will need to understand their responsibilities under the new system and how to maintain compliance standards. We need to ensure that risk controls are intuitive and built into the user experience. We should plan for ongoing monitoring and feedback to ensure that risk management standards are being maintained while users adapt to new processes.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, user impact will be significant but manageable with proper planning. Our team will need training and support to adapt to new processes and systems. The key is ensuring that the changes align with our priorities of ${stakeholder.priorities.join(', ').toLowerCase()} and that users can see the benefits clearly. We need to provide adequate training and ongoing support to ensure successful adoption.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateTechnicalResponse = (stakeholder: any, project: any) => {
    const responses = {
      'IT Systems Lead': [
        `From a technical perspective, we need to consider architecture, integration, and scalability requirements. Our current systems are fragmented and need to be unified or replaced with a modern platform. We should consider cloud-based solutions that provide better scalability and reduced maintenance overhead. Security is a critical concern - we need to ensure data protection and compliance with our security standards. Integration with existing systems will be important for data continuity and user adoption. We should also consider API capabilities for future integrations and customizations.`,
        `Technical requirements from my perspective include modern architecture, robust integration capabilities, and strong security controls. We need a solution that can scale with our business growth while maintaining performance and reliability. The platform should provide comprehensive APIs for integration with existing systems and future tools. Security and compliance features should be built-in rather than bolt-on. We should also consider the technical skills required for implementation and ongoing maintenance.`
      ],
      'Head of Operations': [
        `From an operational technical perspective, we need systems that support our efficiency and quality goals. The technology should enable process automation and provide real-time visibility into operations. We need reliable systems that minimize downtime and support our productivity requirements. Integration with existing tools and systems is important for maintaining operational continuity. The solution should also provide the reporting and analytics capabilities we need for performance monitoring and continuous improvement.`,
        `Technical considerations from an operational standpoint include reliability, performance, and integration capabilities. We need systems that support our operational processes without creating new bottlenecks or dependencies. The technology should enable automation and provide better visibility into our operations. We need solutions that are easy to maintain and don't require extensive technical expertise from our operational team. The focus should be on enabling operational excellence rather than creating technical complexity.`
      ],
      'Customer Service Manager': [
        `From a customer service technical perspective, we need systems that support excellent customer experiences. The technology should be intuitive and easy to use for our team members. We need integration with customer communication channels and comprehensive case management capabilities. The system should provide real-time information and enable proactive customer communication. Mobile access might be important for field support activities. The focus should be on enabling better customer service rather than adding technical complexity.`,
        `Technical requirements from a customer service standpoint include user-friendly interfaces, integration capabilities, and reliable performance. We need systems that support our customer service processes without creating barriers or complications. The technology should enable better customer communication and case tracking. We need solutions that are easy to learn and use so our team can focus on customer service rather than technical issues. Integration with existing customer communication tools is important for maintaining service continuity.`
      ],
      'HR Business Partner': [
        `From an HR technical perspective, we need systems that support our people processes and are easy for everyone to use. The technology should be intuitive and require minimal training for adoption. We need solutions that integrate with our existing HR systems and provide the reporting capabilities we need for people analytics. The system should support our change management and training requirements. User experience is critical - if people find the system difficult to use, adoption will be poor.`,
        `Technical considerations from an HR perspective include user experience, integration capabilities, and training requirements. We need systems that are easy to learn and use so we can minimize training time and maximize adoption. The technology should support our people processes and provide the analytics we need for workforce planning and development. We need solutions that integrate with existing HR tools and provide the reporting capabilities we need for people management.`
      ],
      'Compliance and Risk Manager': [
        `From a compliance technical perspective, we need systems with robust security controls and comprehensive audit capabilities. The technology should provide automated compliance monitoring and reporting. We need solutions that maintain detailed audit trails and support our regulatory requirements. Data protection and privacy controls are critical. The system should provide configurable workflows that can enforce our compliance procedures. We also need backup and recovery capabilities to ensure data integrity and availability.`,
        `Technical requirements from a risk management standpoint include security controls, audit capabilities, and compliance features. We need systems that provide automated monitoring and alerting for compliance violations. The technology should maintain comprehensive audit trails and support our regulatory reporting requirements. We need solutions that provide strong data protection and privacy controls. The system should also provide the flexibility to adapt to changing regulatory requirements while maintaining consistent compliance standards.`
      ],
      'default': [
        `From a technical perspective in ${stakeholder.department}, we need systems that support our priorities of ${stakeholder.priorities.join(', ').toLowerCase()}. The technology should be reliable, user-friendly, and integrate well with our existing tools and processes. We need solutions that provide the capabilities we need without creating unnecessary complexity or maintenance overhead. The focus should be on enabling better outcomes rather than adding technical challenges.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateRisksResponse = (stakeholder: any, project: any) => {
    const responses = {
      'Compliance and Risk Manager': [
        `From a risk management perspective, I have several concerns about this project. First, we need to ensure that any new system maintains our current compliance standards and doesn't introduce new regulatory risks. Data security is a major concern - we need to ensure that information is protected throughout the transition and in the new system. There's also operational risk during the implementation period where we might have reduced efficiency or potential system outages. We need comprehensive risk assessment and mitigation planning before proceeding.`,
        `Risk concerns from my perspective include compliance, security, and operational risks. We need to ensure that the new system meets all regulatory requirements and provides adequate controls for our risk management needs. There's also the risk of data loss or corruption during migration. User adoption risk is significant - if people don't embrace the new system, we won't achieve the expected benefits. We need robust testing, training, and change management to mitigate these risks.`
      ],
      'Head of Operations': [
        `From an operational risk perspective, my main concerns are around implementation timing and business continuity. We can't afford significant disruptions to our current operations during the transition. There's also the risk that the new system might not deliver the expected efficiency gains, which would impact our operational performance. Resource allocation is a concern - we need to ensure we have adequate support during implementation without compromising our day-to-day operations. We need careful planning and phased implementation to minimize operational risks.`,
        `Operational risks I'm concerned about include implementation disruption, resource allocation, and performance impact. We need to ensure that the new system actually improves our operational efficiency rather than creating new bottlenecks. There's also the risk that training and adoption will take longer than expected, which could impact our productivity. We need contingency planning and careful change management to mitigate these operational risks.`
      ],
      'Customer Service Manager': [
        `From a customer service risk perspective, I'm concerned about the impact on customer experience during the transition. There's a risk that service quality could decline while our team learns new systems and processes. Customer communication is critical - we need to ensure that customers are informed about any changes that might affect them. There's also the risk that the new system might not provide the customer service improvements we expect, which could impact customer satisfaction and retention.`,
        `Customer service risks include service disruption during implementation and potential customer dissatisfaction with changes. We need to ensure that the new system actually improves customer experience rather than creating new problems. There's also the risk that our team might struggle with adoption, which could impact service quality. We need comprehensive training, customer communication planning, and contingency procedures to mitigate these customer service risks.`
      ],
      'IT Systems Lead': [
        `From a technical risk perspective, I'm concerned about integration challenges, data migration risks, and system reliability. There's always the risk that new systems won't integrate as seamlessly as expected with our existing infrastructure. Data security and integrity during migration are critical concerns. Performance and reliability risks need to be addressed through comprehensive testing. We also need to consider the risk of vendor dependency and ensure we have adequate support and maintenance capabilities.`,
        `Technical risks include integration failures, data migration issues, and system performance problems. We need to ensure that the new system is reliable and secure before going live. There's also the risk that the technical requirements might be more complex than anticipated, which could impact timeline and budget. We need thorough testing, backup procedures, and technical expertise to mitigate these risks.`
      ],
      'HR Business Partner': [
        `From an HR risk perspective, I'm concerned about change management and user adoption risks. There's a significant risk that people might resist the new processes or struggle with adoption, which could impact the success of the entire project. We need to address concerns about job security or role changes that might arise from process improvements. Training effectiveness is also a risk - if people don't receive adequate training, adoption will be poor and we won't achieve the expected benefits.`,
        `HR risks include change resistance, adoption challenges, and potential impact on employee satisfaction. We need to ensure that the changes are communicated effectively and that people understand the benefits. There's also the risk that the transition period might be stressful for employees, which could impact productivity and morale. We need comprehensive change management, communication planning, and support resources to mitigate these people-related risks.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, the main risks relate to our key priorities of ${stakeholder.priorities.join(', ').toLowerCase()}. We need to ensure that the project doesn't negatively impact these areas during implementation. There's also the risk that the new system might not deliver the expected improvements in our focus areas. We need careful planning and risk mitigation strategies to ensure successful outcomes.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateGeneralResponse = (stakeholder: any, question: string, project: any) => {
    const responses = [
      `That's an interesting question. From my perspective as ${stakeholder.role} in ${stakeholder.department}, I think about this in terms of ${stakeholder.priorities[0].toLowerCase()} and ${stakeholder.priorities[1].toLowerCase()}. Based on my experience, I'd say that ${question.toLowerCase().includes('how') ? 'the approach we take needs to consider both immediate needs and long-term strategic goals' : 'this is definitely something we need to address as part of our overall improvement strategy'}.`,
      
      `Good question. As ${stakeholder.role}, I see this from the ${stakeholder.department} perspective. My main concerns are around ${stakeholder.priorities[0].toLowerCase()} and ${stakeholder.priorities[2].toLowerCase()}. In my experience, ${question.toLowerCase().includes('what') ? 'the key factors to consider are alignment with our current capabilities and the impact on our stakeholders' : 'we need to balance effectiveness with feasibility when considering any changes'}.`,
      
      `I appreciate you asking about this. From my role in ${stakeholder.department}, I'm particularly focused on ${stakeholder.priorities[1].toLowerCase()} and ${stakeholder.priorities[2].toLowerCase()}. ${stakeholder.personality.includes('Strategic') ? 'I think strategically about these issues and consider both short-term and long-term implications' : stakeholder.personality.includes('focused') ? 'I tend to focus on practical solutions that address real business needs' : 'I approach this from a collaborative perspective, considering input from all stakeholders'}. What you're asking about is definitely relevant to our goals for this project.`,
      
      `That's a thoughtful question. As ${stakeholder.role}, I bring a ${stakeholder.personality.toLowerCase()} approach to this issue. My priorities are ${stakeholder.priorities.join(', ').toLowerCase()}, so I'm thinking about how this relates to those areas. ${question.toLowerCase().includes('why') ? 'The reasoning behind this is important because it affects how we approach the broader project objectives' : 'This connects to our overall project goals and the outcomes we\'re trying to achieve'}.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleQuestionClick = (question: string) => {
    setInputMessage(question)
    setShowQuestionHelper(false)
  }

  const handleSaveNotes = () => {
    alert('Meeting notes saved successfully!')
  }

  const handleAnalyzeAnswers = () => {
    if (messages.length <= 1) {
      alert('Please conduct the interview first before analyzing answers.')
      return
    }

    // Store analysis data
    const analysisData = {
      project: selectedProject,
      stakeholders: selectedStakeholders,
      messages: messages,
      meetingId: `meeting-${Date.now()}`
    }

    sessionStorage.setItem('meetingAnalysis', JSON.stringify(analysisData))
    setCurrentView('analysis')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Active</h3>
          <p className="text-gray-600 mb-4">Select a project and stakeholders to start a meeting.</p>
          <button
            onClick={() => setCurrentView('stakeholders')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Stakeholder Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting: {selectedProject.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Participants: {selectedStakeholders.map(s => s.name).join(', ')}
            </p>
          </div>
          
          {/* Question Helper Toggle */}
          <button
            onClick={() => setShowQuestionHelper(!showQuestionHelper)}
            className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Question Helper</span>
            {showQuestionHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Question Helper Panel */}
        {showQuestionHelper && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-900">
                Question Bank for {selectedStakeholders[0]?.role || 'Stakeholder'}
              </h3>
              <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                <button
                  onClick={() => setSelectedQuestionCategory('as-is')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'as-is'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  As-Is Process ({mockQuestions['as-is'].length})
                </button>
                <button
                  onClick={() => setSelectedQuestionCategory('to-be')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'to-be'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  To-Be Vision ({mockQuestions['to-be'].length})
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockQuestions[selectedQuestionCategory].map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                >
                  <p className="text-sm text-gray-900 group-hover:text-blue-900 font-medium">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.speaker === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.speaker === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.speaker === 'system'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.speaker !== 'user' && message.speaker !== 'system' && (
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {message.stakeholderName || 'Stakeholder'}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-1 opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Stakeholder is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to the stakeholders..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        
        {/* Action Buttons */}
        {messages.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveNotes}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Save Notes</span>
              </button>
              <button
                onClick={handleAnalyzeAnswers}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analyze Answers</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeetingView