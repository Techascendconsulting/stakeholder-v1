import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import { Message } from '../../types'
import StakeholderMessageAudio from '../StakeholderMessageAudio'

const MeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, setCurrentView } = useApp()
  const { globalAudioEnabled, setGlobalAudioEnabled } = useVoice()
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null)
  const [responseHistory, setResponseHistory] = useState<Map<string, string[]>>(new Map())

  // Handle audio playback state - only one audio can play at a time
  const handleAudioPlayingChange = (messageId: string, isPlaying: boolean) => {
    if (isPlaying) {
      // Force stop all browser speech before starting new audio
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      
      // Stop all other audio when new audio starts
      setCurrentlyPlayingAudio(messageId)
    } else if (currentlyPlayingAudio === messageId) {
      setCurrentlyPlayingAudio(null)
    }
  }

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
      // Determine which stakeholder should respond based on the message content
      const respondingStakeholder = determineRespondingStakeholder(inputMessage, selectedStakeholders)
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        speaker: respondingStakeholder.id || 'stakeholder',
        content: generateContextualResponse(inputMessage, respondingStakeholder, messages),
        timestamp: new Date().toISOString(),
        stakeholderName: respondingStakeholder.name,
        stakeholderRole: respondingStakeholder.role
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)

    setInputMessage('')
  }

  const determineRespondingStakeholder = (message: string, stakeholders: any[]) => {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase()
    
    // Look for stakeholder names in the message
    for (const stakeholder of stakeholders) {
      const firstName = stakeholder.name.split(' ')[0].toLowerCase()
      const fullName = stakeholder.name.toLowerCase()
      
      if (lowerMessage.includes(firstName) || lowerMessage.includes(fullName)) {
        return stakeholder
      }
    }
    
    // Look for role-based addressing
    for (const stakeholder of stakeholders) {
      const role = stakeholder.role.toLowerCase()
      if (lowerMessage.includes(role) || 
          lowerMessage.includes('operations') && role.includes('operations') ||
          lowerMessage.includes('customer') && role.includes('customer') ||
          lowerMessage.includes('hr') && role.includes('hr') ||
          lowerMessage.includes('it') && role.includes('it')) {
        return stakeholder
      }
    }
    
    // Default: rotate through stakeholders based on message count
    const messageCount = messages.filter(m => m.speaker !== 'user' && m.speaker !== 'system').length
    return stakeholders[messageCount % stakeholders.length] || stakeholders[0]
  }

  const generateContextualResponse = (question: string, stakeholder: any, conversationHistory: Message[]) => {
    const lowerQuestion = question.toLowerCase()
    const stakeholderId = stakeholder.id || stakeholder.name
    
    // Get previous responses for this stakeholder
    const previousResponses = responseHistory.get(stakeholderId) || []
    
    // Get recent context from conversation
    const recentMessages = conversationHistory.slice(-6) // Last 6 messages for context
    const recentContext = recentMessages.map(m => m.content).join(' ').toLowerCase()
    
    // Generate response based on specific question analysis
    let response = ''
    
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
      response = getGreetingResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('full process') || lowerQuestion.includes('complete process') || lowerQuestion.includes('entire process')) {
      response = getFullProcessResponse(stakeholder, lowerQuestion, recentContext)
    } else if (lowerQuestion.includes('what kind of information') || lowerQuestion.includes('what information') || lowerQuestion.includes('how do they provide')) {
      response = getInformationRequirementsResponse(stakeholder, lowerQuestion, recentContext)
    } else if (lowerQuestion.includes('process') || lowerQuestion.includes('workflow')) {
      response = getProcessResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem')) {
      response = getChallengeResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('improve') || lowerQuestion.includes('better')) {
      response = getImprovementResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('time') || lowerQuestion.includes('duration')) {
      response = getTimeResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('why') || lowerQuestion.includes('how') || lowerQuestion.includes('what')) {
      response = getSpecificQuestionResponse(stakeholder, lowerQuestion, recentContext)
    } else {
      response = getDefaultResponse(stakeholder, lowerQuestion)
    }
    
    // Avoid duplicate responses
    let finalResponse = response
    let attempts = 0
    while (previousResponses.includes(finalResponse) && attempts < 3) {
      finalResponse = addVariation(response, attempts)
      attempts++
    }
    
    // Track this response
    const updatedHistory = new Map(responseHistory)
    updatedHistory.set(stakeholderId, [...previousResponses, finalResponse])
    setResponseHistory(updatedHistory)
    
    return finalResponse
  }

  const getGreetingResponse = (stakeholder: any, question: string) => {
    const greetings = {
      'Customer Service Manager': [
        'Hello! Great to be here discussing how we can improve our customer experience.',
        'Hi there! I\'m looking forward to sharing our customer service perspective.',
        'Hello! I\'m excited to discuss how we can make things better for our customers.'
      ],
      'Head of Operations': [
        'Hello! Ready to dive into our operational processes and improvements.',
        'Hi! I\'m here to discuss our current workflows and optimization opportunities.',
        'Hello! Looking forward to sharing operational insights with you.'
      ],
      'IT Systems Lead': [
        'Hello! Excited to discuss our technical infrastructure and possibilities.',
        'Hi! I\'m here to share our IT perspective on system improvements.',
        'Hello! Ready to talk about our technology challenges and solutions.'
      ],
      'HR Business Partner': [
        'Hello! I\'m here to discuss the people side of any changes we make.',
        'Hi! Looking forward to sharing HR insights on team impact and training.',
        'Hello! Ready to talk about change management and team support.'
      ]
    }
    
    const responses = greetings[stakeholder.role] || [
      `Hello! I'm ${stakeholder.name}, and I'm here to help with your questions about ${stakeholder.role.toLowerCase()}.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getProcessResponse = (stakeholder: any, question: string) => {
    const processResponses = {
      'Customer Service Manager': [
        'From a customer perspective, our current process has several touchpoints that could be streamlined. Customers often ask us for status updates because they don\'t have visibility.',
        'The customer-facing part of our process involves multiple handoffs. We receive inquiries, coordinate with different teams, and try to keep customers informed throughout.',
        'Our process currently requires customers to provide the same information multiple times to different departments, which creates frustration.'
      ],
      'Head of Operations': [
        'Our operational process involves 15 distinct steps, with manual handoffs between departments. We process approximately 200-300 cases daily.',
        'The current workflow requires multiple approvals and data entry points. Each case moves through 4 different systems before completion.',
        'Operationally, we see bottlenecks in the verification stage and final approval process. These create delays that ripple through the entire workflow.'
      ],
      'IT Systems Lead': [
        'From a technical standpoint, our process involves 3 separate systems that don\'t communicate well. Data has to be manually transferred between platforms.',
        'Our current process relies on legacy systems that require significant manual intervention. Integration between our CRM and processing systems is limited.',
        'The technical architecture behind our process involves point-to-point connections that are fragile and hard to maintain.'
      ],
      'HR Business Partner': [
        'From a people perspective, our current process requires extensive training because it\'s complex and has many manual steps.',
        'The process impacts our team\'s daily work significantly. Staff spend about 60% of their time on administrative tasks rather than value-add activities.',
        'Our current process requires different skill sets across departments, which creates dependencies and potential bottlenecks when people are unavailable.'
      ]
    }
    
    const responses = processResponses[stakeholder.role] || [
      `From my ${stakeholder.role} perspective, our process involves several key steps that could be optimized.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getChallengeResponse = (stakeholder: any, question: string) => {
    const challengeResponses = {
      'Customer Service Manager': [
        'Our biggest challenge is managing customer expectations when there are delays. They want transparency and timely updates.',
        'The main issue we face is customers having to repeat information to different departments. It creates a fragmented experience.',
        'Communication gaps between departments mean customers sometimes receive conflicting information, which damages trust.'
      ],
      'Head of Operations': [
        'Our primary challenge is the lack of real-time visibility into case status. Managers spend too much time on status updates instead of strategic work.',
        'The biggest operational challenge is managing peak volumes with our current manual processes. We often have to add temporary staff.',
        'Data quality issues cause rework and delays. Information gets lost or corrupted during handoffs between systems.'
      ],
      'IT Systems Lead': [
        'Our main technical challenge is system integration. Our platforms were built at different times and don\'t communicate effectively.',
        'Legacy system maintenance consumes significant IT resources. We spend more time keeping old systems running than building new capabilities.',
        'Data inconsistency across systems creates problems. The same customer information exists in multiple places with different formats.'
      ],
      'HR Business Partner': [
        'Change resistance is our biggest challenge. Staff are comfortable with current processes, even if they\'re inefficient.',
        'Skills gaps in our team mean we rely heavily on a few key people. When they\'re unavailable, processes slow down significantly.',
        'Training new staff takes 6-8 weeks because our processes are complex and not well-documented.'
      ]
    }
    
    const responses = challengeResponses[stakeholder.role] || [
      `The main challenge from my ${stakeholder.role} perspective is ensuring smooth operations while managing complexity.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getImprovementResponse = (stakeholder: any, question: string) => {
    const improvementResponses = {
      'Customer Service Manager': [
        'We need self-service options for customers to check status and update information. This would reduce inquiry volume and improve satisfaction.',
        'Automated notifications at key process milestones would help customers stay informed without having to contact us.',
        'A unified customer portal where they can see all their interactions and documents would significantly improve the experience.'
      ],
      'Head of Operations': [
        'Process automation would eliminate many manual handoffs and reduce errors. We could probably automate 70% of our current manual tasks.',
        'Real-time dashboards would give managers better visibility into bottlenecks and help with resource allocation.',
        'Standardized workflows with built-in quality checks would reduce variability and improve consistency.'
      ],
      'IT Systems Lead': [
        'A unified data platform would eliminate the need for manual data transfers and reduce errors significantly.',
        'API-based integrations would make our systems more flexible and easier to maintain than current point-to-point connections.',
        'Cloud-based solutions would give us better scalability and reduce the maintenance burden on our IT team.'
      ],
      'HR Business Partner': [
        'Simplified processes with better documentation would reduce training time and make staff more confident.',
        'Role-based dashboards would help staff focus on their specific responsibilities without getting overwhelmed.',
        'Better change management support would help the team adapt more quickly to new processes and technologies.'
      ]
    }
    
    const responses = improvementResponses[stakeholder.role] || [
      `From my ${stakeholder.role} perspective, we should focus on streamlining our most common workflows first.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getTimeResponse = (stakeholder: any, question: string) => {
    const timeResponses = {
      'Customer Service Manager': [
        'Customers currently wait 2-3 days for initial processing, and the entire process takes 1-2 weeks depending on complexity.',
        'Response times vary significantly. Simple cases might take 24 hours, but complex ones can take up to 10 business days.',
        'Our service level agreement is 5 business days, but we often struggle to meet that during peak periods.'
      ],
      'Head of Operations': [
        'Each case takes approximately 3-4 hours of actual work time, but calendar time is 7-10 days due to queuing and handoffs.',
        'Processing time breaks down to: initial review (30 minutes), verification (2 hours), approval (1 hour), but waiting time between steps adds days.',
        'During peak periods, processing times can double due to resource constraints and system performance issues.'
      ],
      'IT Systems Lead': [
        'System response times are generally good, but batch processing jobs that run overnight can cause morning delays.',
        'Data synchronization between systems happens every 4 hours, which can delay real-time updates.',
        'System downtime for maintenance occurs monthly for 2-3 hours, which impacts processing during those windows.'
      ],
      'HR Business Partner': [
        'Staff typically spend 15-20 minutes per case on administrative tasks, but complex cases can take up to an hour.',
        'Training new staff takes 6-8 weeks to reach full productivity due to process complexity.',
        'Our team spends about 30% of their time on status updates and coordination rather than core processing work.'
      ]
    }
    
    const responses = timeResponses[stakeholder.role] || [
      `From my ${stakeholder.role} perspective, timing is definitely an area where we can improve efficiency.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getDefaultResponse = (stakeholder: any, question: string) => {
    const defaultResponses = {
      'Customer Service Manager': [
        'From a customer experience standpoint, that\'s an important consideration. We always need to think about how changes affect our customers.',
        'I can share some insights from our customer feedback. This is definitely something that comes up in our customer conversations.',
        'That\'s a great question. From our customer-facing perspective, we see this impact our service quality regularly.'
      ],
      'Head of Operations': [
        'From an operational standpoint, that\'s definitely something we need to consider in our daily workflows.',
        'That\'s a good point. Operationally, we see this affecting our efficiency and resource allocation.',
        'I can provide some context from our operations experience. This touches on several areas of our work.'
      ],
      'IT Systems Lead': [
        'From a technical perspective, that\'s an interesting challenge. Our systems architecture plays a role in this.',
        'That\'s a valid concern. From an IT standpoint, we need to consider the technical implications and feasibility.',
        'I can share some insights from our technical infrastructure. This relates to several system components.'
      ],
      'HR Business Partner': [
        'From a people perspective, that\'s something we need to carefully consider in terms of team impact.',
        'That\'s an important consideration. From an HR standpoint, we need to think about training and change management.',
        'I can provide some context from our team experience. This affects how our staff work and collaborate.'
      ]
    }
    
    const responses = defaultResponses[stakeholder.role] || [
      `That's a thoughtful question. From my ${stakeholder.role} perspective, I can share some relevant insights.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getFullProcessResponse = (stakeholder: any, question: string, context: string) => {
    const fullProcessResponses = {
      'Customer Service Manager': [
        'Absolutely, let me walk you through our complete customer onboarding process from start to finish. First, customers submit their initial application through our online portal or by phone. We then conduct identity verification, which involves checking government-issued ID and proof of address. Next, we perform a comprehensive background check that includes credit history, employment verification, and reference checks. After that, we review their application against our eligibility criteria and make a decision. If approved, we send them a welcome package with account setup instructions, terms and conditions, and access credentials. The final step is account activation where we guide them through setting up their profile, preferences, and initial services. Throughout this process, we maintain communication with status updates, but currently this requires manual effort from our team.',
        'Sure, our full onboarding process has seven main phases. Phase one is application intake where customers provide basic information and documentation. Phase two involves document verification where we check all submitted materials for authenticity and completeness. Phase three is our assessment phase where we evaluate their eligibility based on our criteria. Phase four is the approval or rejection decision with detailed feedback. Phase five is welcome and setup where approved customers receive onboarding materials and account setup guidance. Phase six is service activation where we help them configure their initial services. Phase seven is the follow-up phase where we ensure they\'re comfortable with the system and address any initial questions. Each phase has specific touchpoints with our customer service team, and we track progress through our internal systems.'
      ],
      'Head of Operations': [
        'Let me outline our complete operational process flow. We start with application intake through multiple channels - online portal, phone, or in-person. The application then moves to our verification department where we have a three-tier verification process: document authenticity, identity confirmation, and eligibility assessment. Once verified, it goes to our approval committee which meets twice daily to review applications. Approved applications move to our fulfillment team who prepare welcome packages and account setup materials. The operations team then coordinates with IT to create accounts and configure initial services. We have quality assurance checkpoints at each stage to ensure accuracy. The entire process involves 15 distinct operational steps, touches 4 different departments, and requires coordination between 12 different team members. We process approximately 200-300 applications daily with peak periods reaching 500 applications.',
        'Our complete operational workflow is quite comprehensive. It begins with application receipt and logging into our case management system. We then conduct a completeness check to ensure all required documentation is present. The case moves to our verification team who perform identity checks, background verification, and eligibility assessment. Next, it goes through our approval workflow which includes automated pre-screening, manual review, and final approval decision. Once approved, we initiate our fulfillment process which includes account creation, welcome package preparation, and initial service setup. We then coordinate with our customer service team for onboarding calls and training. Finally, we conduct post-onboarding quality checks and customer satisfaction surveys. Each step has specific timelines, quality controls, and escalation procedures. The process typically takes 7-10 business days from start to finish.'
      ],
      'IT Systems Lead': [
        'From a technical perspective, our full process involves several integrated systems. The customer starts by submitting their application through our web portal, which is built on a React frontend with a Node.js backend. The application data is stored in our PostgreSQL database and triggers automated workflows in our case management system. We then use third-party APIs for identity verification, credit checks, and background screening. Our approval engine uses a rules-based system that evaluates applications against predefined criteria. Once approved, we automatically provision accounts in our customer management system, generate welcome emails through our notification service, and create entries in our billing system. The process also involves document management through our cloud storage solution, audit logging for compliance, and integration with our customer support platform. We have built-in error handling, retry mechanisms, and monitoring dashboards to ensure system reliability throughout the process.',
        'Let me explain our complete technical architecture for the onboarding process. We use a microservices architecture with separate services for application intake, verification, approval, and fulfillment. The application service handles form submissions and document uploads, storing data in our primary database. The verification service integrates with multiple third-party providers for identity verification, credit checks, and background screening. Our approval service uses a workflow engine that routes applications through different approval paths based on risk assessment. The fulfillment service handles account creation, welcome package generation, and initial service provisioning. We also have a notification service for customer communications and a reporting service for analytics. All services communicate through a message queue system for reliability and scalability. We maintain separate databases for different domains to ensure data isolation and security.'
      ],
      'HR Business Partner': [
        'From a people perspective, our complete process involves significant human touchpoints throughout the customer journey. Our customer service representatives handle initial inquiries and guide customers through application completion. Our verification specialists manually review documents and conduct identity checks. Our assessment team evaluates applications against our criteria and makes recommendations. Our approval committee, consisting of senior staff, makes final decisions on complex cases. Our fulfillment team prepares and sends welcome packages and coordinates account setup. Our onboarding specialists conduct welcome calls and provide initial training. Our support team handles ongoing questions and issues. Throughout the process, we have team leads who oversee quality and provide escalation support. We also have compliance officers who ensure we meet regulatory requirements. The entire process requires coordination between 25-30 staff members across 6 different departments. Each team member has specific training requirements and performance metrics.',
        'Our complete process from an HR standpoint involves extensive cross-departmental collaboration. We start with our intake team who receive and process initial applications. They work closely with our verification team who conduct thorough document and identity checks. Our assessment team then evaluates applications using our established criteria and procedures. The approval team, including senior decision makers, review and approve applications. Our fulfillment team coordinates with multiple departments to ensure smooth account setup and welcome package delivery. Throughout the process, our training and development team ensures all staff are equipped with the knowledge and skills needed for their roles. We have regular team meetings, performance reviews, and continuous improvement initiatives. The process also involves our compliance team who ensure we meet all regulatory requirements and our quality assurance team who monitor performance and identify improvement opportunities.'
      ]
    }
    
    const responses = fullProcessResponses[stakeholder.role] || [
      `Let me walk you through our complete process from start to finish. It begins with application intake where customers provide their information and documentation. We then conduct comprehensive verification checks including identity confirmation and eligibility assessment. Next, we review the application against our criteria and make a decision. If approved, we initiate account setup and send welcome materials. Finally, we provide onboarding support and initial training. Throughout the process, we maintain communication with customers and coordinate between multiple departments to ensure a smooth experience.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getInformationRequirementsResponse = (stakeholder: any, question: string, context: string) => {
    const informationResponses = {
      'Customer Service Manager': [
        'Great question about the information requirements. Customers need to provide several types of information during our onboarding process. First, they need basic personal information including full name, date of birth, social security number, and contact details. We also require proof of identity such as a government-issued photo ID like a driver\'s license or passport. For address verification, we need utility bills, bank statements, or lease agreements dated within the last 30 days. Employment information is crucial, so we ask for employment verification letters, recent pay stubs, or tax returns for self-employed individuals. We also need financial information including bank account details and income documentation. Customers can provide this information through our secure online portal where they can upload documents directly, or they can email encrypted files to our secure processing center. We also accept documents via mail or fax, though digital submission is preferred for faster processing. Our customer service team is available to guide customers through the document requirements and help with any submission issues.',
        'The information customers provide falls into several categories. Personal identification requires full legal name, date of birth, social security number, and current address. We need identity verification through government-issued photo ID and proof of address through recent utility bills or bank statements. Employment verification requires employment letters, pay stubs, or business registration for self-employed customers. Financial information includes bank account details, income documentation, and any existing debt obligations. We also collect contact preferences, service requirements, and any special accommodations needed. Customers can submit this information through multiple channels: our online portal allows secure document upload with real-time status updates, our mobile app provides photo capture for documents, they can email documents to our secure processing center, or send physical copies by mail. We provide detailed checklists and examples of acceptable documents to make the process as clear as possible for customers.'
      ],
      'Head of Operations': [
        'From an operational standpoint, we require comprehensive information to ensure proper onboarding. The information falls into five main categories: personal identification, financial verification, employment documentation, service requirements, and compliance information. Personal identification includes full legal name, date of birth, social security number, current and previous addresses, and contact information. Financial verification requires bank account information, income documentation, credit history authorization, and any existing financial obligations. Employment documentation includes employment verification letters, recent pay stubs, business registration for self-employed individuals, and references. Service requirements cover the specific services requested, usage expectations, and any special requirements. Compliance information includes regulatory disclosures, terms and conditions acceptance, and any industry-specific requirements. Customers can provide this information through our integrated submission system which includes online portal, mobile app, email processing, and physical mail handling. We have specific processing protocols for each submission method to ensure security and accuracy.',
        'Our information requirements are structured to support efficient processing while maintaining security and compliance. We collect information in three phases: initial application, verification, and setup. The initial application requires basic personal and contact information, service requests, and preliminary documentation. The verification phase requires detailed identity proofs, financial documents, employment verification, and reference checks. The setup phase involves service configuration preferences, communication preferences, and account management details. Customers can submit information through multiple operational channels. Our online portal handles about 60% of submissions with real-time validation and status tracking. Mobile submissions account for 25% through our app with photo capture capabilities. Email submissions represent 10% through our secure processing center. Physical mail handles 5% for customers who prefer traditional methods. Each channel has specific processing times and quality controls to ensure consistent service delivery.'
      ],
      'IT Systems Lead': [
        'From a technical perspective, our information collection system is designed for security and efficiency. We collect information through multiple secure channels integrated into our core processing system. The required information includes personal data (encrypted and stored in our secure database), identity verification documents (processed through our document management system), financial information (handled through PCI-compliant systems), employment verification (integrated with third-party verification services), and service configuration data (stored in our customer management system). Customers can provide information through our web portal which uses SSL encryption and secure file upload capabilities. Our mobile app provides secure document capture with automatic image processing and validation. Email submissions are handled through our secure processing gateway with encryption and virus scanning. Physical documents are digitized through our scanning system with automated data extraction. All information is validated through our automated verification system and stored in compliance with security and privacy regulations.',
        'Our information collection system uses a modern, secure architecture to handle customer data. We require structured data input through our API-driven platform which includes personal identification, financial verification, employment documentation, and service requirements. The system architecture includes a secure web portal built with React and Node.js, mobile applications for iOS and Android with secure document capture, email processing through our secure gateway, and physical document digitization through our scanning system. All data is encrypted in transit and at rest, with role-based access controls and audit logging. We use automated validation for data quality, third-party integrations for verification, and machine learning for document processing. The system supports multiple file formats, has built-in error handling, and provides real-time status updates. We maintain separate environments for development, testing, and production with comprehensive backup and disaster recovery procedures.'
      ],
      'HR Business Partner': [
        'From a people perspective, the information collection process involves significant customer interaction and support. Our team helps customers understand exactly what information is needed and why it\'s required. We collect personal information through guided interviews and form completion assistance. Identity verification involves our staff helping customers understand acceptable documents and how to submit them properly. Financial information collection includes explaining requirements and helping customers gather necessary documentation. Employment verification involves coordination with customer employers and assistance with documentation. Our staff provide multiple ways for customers to submit information: in-person appointments for personalized assistance, phone support for guidance through the process, online chat for real-time help, and email support for detailed questions. We also provide multilingual support for customers who need assistance in different languages. Our team is trained to handle sensitive information with care and to provide patient, helpful guidance throughout the collection process.',
        'Our information collection process is designed with customer support at its core. We require comprehensive information but provide extensive human support to make the process manageable. The information includes personal identification, financial verification, employment documentation, and service preferences. Our customer service team provides multiple support channels: dedicated phone lines for application assistance, online chat for immediate questions, email support for detailed inquiries, and in-person appointments for complex cases. We also offer specialized support for elderly customers, customers with disabilities, and those who need language assistance. Our staff are trained to explain requirements clearly, help customers understand what documents are acceptable, and provide guidance on submission methods. We maintain detailed FAQ resources, video tutorials, and step-by-step guides to support customers throughout the process. Our goal is to make information collection as smooth and stress-free as possible while ensuring we gather everything needed for proper onboarding.'
      ]
    }
    
    const responses = informationResponses[stakeholder.role] || [
      `Regarding the information requirements, customers need to provide several types of documentation. This includes personal identification, proof of address, employment verification, and financial information. They can submit this information through our online portal, mobile app, email, or physical mail. Our team provides guidance throughout the process to ensure customers understand what's needed and how to submit it properly.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getSpecificQuestionResponse = (stakeholder: any, question: string, context: string) => {
    const lowerQuestion = question.toLowerCase()
    const specificResponses = {
      'Customer Service Manager': [
        `That's an excellent question. From a customer service perspective, ${getDetailedCustomerServiceResponse(lowerQuestion, context)}`,
        `I'm glad you asked about that. In our customer service experience, ${getDetailedCustomerServiceResponse(lowerQuestion, context)}`,
        `That's definitely something we see regularly. From our customer-facing perspective, ${getDetailedCustomerServiceResponse(lowerQuestion, context)}`
      ],
      'Head of Operations': [
        `That's a great operational question. From our operations experience, ${getDetailedOperationsResponse(lowerQuestion, context)}`,
        `I can provide some operational context on that. In our daily operations, ${getDetailedOperationsResponse(lowerQuestion, context)}`,
        `That's definitely an important operational consideration. From our workflow perspective, ${getDetailedOperationsResponse(lowerQuestion, context)}`
      ],
      'IT Systems Lead': [
        `That's an interesting technical question. From our IT infrastructure perspective, ${getDetailedTechnicalResponse(lowerQuestion, context)}`,
        `I can share some technical insights on that. In our system architecture, ${getDetailedTechnicalResponse(lowerQuestion, context)}`,
        `That's definitely a technical consideration. From our technology standpoint, ${getDetailedTechnicalResponse(lowerQuestion, context)}`
      ],
      'HR Business Partner': [
        `That's an important people-related question. From our HR perspective, ${getDetailedHRResponse(lowerQuestion, context)}`,
        `I can provide some insights on the human aspects. In our team experience, ${getDetailedHRResponse(lowerQuestion, context)}`,
        `That's definitely something we consider from a people standpoint. In our organizational experience, ${getDetailedHRResponse(lowerQuestion, context)}`
      ]
    }
    
    const responses = specificResponses[stakeholder.role] || [
      `That's a thoughtful question. From my ${stakeholder.role} perspective, I can share some relevant insights about how this impacts our work and the specific considerations we deal with on a daily basis.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getDetailedCustomerServiceResponse = (question: string, context: string) => {
    if (question.includes('how') || question.includes('what')) {
      return 'we handle this through direct customer interaction and feedback collection. We maintain detailed records of customer preferences, track their journey through our process, and proactively reach out when we identify potential issues. Our team is trained to provide personalized support and to escalate complex cases to specialists when needed. We also use customer feedback to continuously improve our processes and training.'
    }
    if (question.includes('why')) {
      return 'this is driven by our commitment to customer satisfaction and retention. We\'ve found that proactive communication and personalized support significantly improve customer experience and reduce complaint rates. Our data shows that customers who receive dedicated support are 40% more likely to complete the onboarding process successfully and 60% more likely to recommend our services.'
    }
    return 'we focus on providing comprehensive support throughout the customer journey. This includes proactive communication, personalized assistance, and continuous follow-up to ensure customer satisfaction. We track key metrics like response times, resolution rates, and customer satisfaction scores to measure our effectiveness and identify improvement opportunities.'
  }

  const getDetailedOperationsResponse = (question: string, context: string) => {
    if (question.includes('how') || question.includes('what')) {
      return 'we manage this through structured workflows and quality control processes. We have specific procedures for each step, defined timelines, and escalation protocols. Our operations team coordinates between departments, monitors progress through our case management system, and ensures consistent service delivery. We also maintain detailed documentation and conduct regular process reviews to identify optimization opportunities.'
    }
    if (question.includes('why')) {
      return 'this is essential for maintaining operational efficiency and service quality. Our structured approach helps us process high volumes while maintaining accuracy and consistency. We\'ve implemented these processes based on industry best practices and our own experience managing complex workflows. This approach has reduced processing times by 30% and improved accuracy rates by 25%.'
    }
    return 'we maintain strict operational controls and continuous improvement processes. This includes regular workflow analysis, performance monitoring, and team coordination to ensure efficient processing. We use data-driven approaches to identify bottlenecks and implement solutions that improve both efficiency and quality.'
  }

  const getDetailedTechnicalResponse = (question: string, context: string) => {
    if (question.includes('how') || question.includes('what')) {
      return 'we handle this through our integrated technology stack and automated workflows. Our systems are designed for scalability, security, and reliability. We use modern development practices, comprehensive testing, and monitoring to ensure system performance. Our architecture supports real-time processing, automated validation, and seamless integration between different components.'
    }
    if (question.includes('why')) {
      return 'this is necessary to support our business requirements and ensure system reliability. Our technical architecture is designed to handle current and future needs while maintaining security and performance standards. We\'ve chosen technologies that provide flexibility, scalability, and maintainability. This approach has improved system uptime to 99.9% and reduced processing times by 50%.'
    }
    return 'we use modern technology solutions and best practices to ensure system reliability and performance. This includes comprehensive monitoring, automated testing, and regular updates to maintain security and functionality. Our technical team continuously evaluates new technologies and approaches to improve system capabilities.'
  }

  const getDetailedHRResponse = (question: string, context: string) => {
    if (question.includes('how') || question.includes('what')) {
      return 'we approach this through comprehensive training and support programs. Our team members receive initial training, ongoing education, and regular performance feedback. We provide resources, tools, and mentorship to help staff succeed in their roles. We also maintain open communication channels and encourage feedback to continuously improve our workplace culture and processes.'
    }
    if (question.includes('why')) {
      return 'this is crucial for maintaining team effectiveness and job satisfaction. Our approach to people management directly impacts service quality and organizational success. We\'ve found that well-trained, supported staff provide better customer service and are more likely to stay with the organization. Our investment in people development has resulted in 85% employee satisfaction and 20% lower turnover rates.'
    }
    return 'we focus on creating a supportive work environment that enables team success. This includes comprehensive training programs, regular feedback mechanisms, and opportunities for professional development. We believe that investing in our people directly translates to better service quality and organizational performance.'
  }

  const addVariation = (response: string, attempt: number) => {
    const variations = [
      response.replace('From a ', 'Looking at this from a '),
      response.replace('From my ', 'In my experience as '),
      response.replace('Our ', 'We see that our '),
      response.replace('The ', 'I\'d say the '),
      response.replace('We ', 'In our department, we ')
    ]
    
    return variations[attempt % variations.length] || response
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
          
          <div className="flex items-center space-x-3">
            {/* Global Audio Toggle */}
            <button
              onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
                globalAudioEnabled
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              title={globalAudioEnabled ? 'Disable Audio' : 'Enable Audio'}
            >
              {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span>{globalAudioEnabled ? 'Audio On' : 'Audio Off'}</span>
            </button>

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
              
                            {/* Audio Controls for Stakeholder Messages */}
              {message.speaker !== 'user' && message.speaker !== 'system' && (
                <StakeholderMessageAudio
                  message={message}
                  autoPlay={true}
                  shouldStop={currentlyPlayingAudio !== null && currentlyPlayingAudio !== message.id}
                  onPlayingChange={(isPlaying) => handleAudioPlayingChange(message.id, isPlaying)}
                />
              )}
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