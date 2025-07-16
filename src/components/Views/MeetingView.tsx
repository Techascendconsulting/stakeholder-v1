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

    // Simple working response system
    setTimeout(() => {
      // Select a random stakeholder or rotate through them
      const stakeholderIndex = messages.filter(m => m.speaker !== 'user').length % selectedStakeholders.length
      const stakeholder = selectedStakeholders[stakeholderIndex] || selectedStakeholders[0]
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        speaker: stakeholder.id || 'stakeholder',
        content: generateSimpleResponse(inputMessage, stakeholder),
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)

    setInputMessage('')
  }

  const generateSimpleResponse = (userInput: string, stakeholder: any) => {
    const input = userInput.toLowerCase().trim()
    const conversationHistory = messages.slice(-3) // Look at recent context
    
    // ChatGPT-style response generation based on stakeholder role
    return generateChatGPTStyleResponse(input, stakeholder, userInput, conversationHistory)
  }

  const generateChatGPTStyleResponse = (input: string, stakeholder: any, originalInput: string, history: any[]) => {
    // Handle greetings naturally
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('good morning') || input.includes('good afternoon')) {
      return generateNaturalGreeting(stakeholder, input)
    }
    
    // Handle thank you and appreciation
    if (input.includes('thank') || input.includes('appreciate')) {
      return generateAppreciationResponse(stakeholder)
    }
    
    // Handle process-related questions
    if (input.includes('process') || input.includes('workflow') || input.includes('current') || input.includes('how do you') || input.includes('walk me through')) {
      return generateProcessResponse(stakeholder, input, originalInput)
    }
    
    // Handle problems and challenges
    if (input.includes('problem') || input.includes('challenge') || input.includes('pain') || input.includes('difficult') || input.includes('issue')) {
      return generateProblemResponse(stakeholder, input, originalInput)
    }
    
    // Handle solutions and improvements
    if (input.includes('solution') || input.includes('improve') || input.includes('ideal') || input.includes('better') || input.includes('future')) {
      return generateSolutionResponse(stakeholder, input, originalInput)
    }
    
    // Handle time-related questions
    if (input.includes('time') || input.includes('long') || input.includes('quick') || input.includes('duration') || input.includes('timeline')) {
      return generateTimeResponse(stakeholder, input, originalInput)
    }
    
    // Handle people/team questions
    if (input.includes('team') || input.includes('people') || input.includes('staff') || input.includes('employee') || input.includes('user')) {
      return generateTeamResponse(stakeholder, input, originalInput)
    }
    
    // Handle cost/budget questions
    if (input.includes('cost') || input.includes('budget') || input.includes('money') || input.includes('expensive') || input.includes('afford')) {
      return generateCostResponse(stakeholder, input, originalInput)
    }
    
    // Handle follow-up questions
    if (input.includes('what about') || input.includes('how about') || input.includes('tell me more') || input.includes('elaborate') || input.includes('can you explain')) {
      return generateFollowUpResponse(stakeholder, input, originalInput, history)
    }
    
    // Default conversational response
    return generateDefaultResponse(stakeholder, input, originalInput)
  }

  const generateNaturalGreeting = (stakeholder: any, input: string) => {
    const greetings = {
      'Head of Operations': `Hello! Great to meet you. I'm ${stakeholder.name}, and I lead operations here at ${stakeholder.department}. I'm really looking forward to discussing the ${selectedProject?.name} project with you. 

I've been with the company for quite a while now, so I've seen how our processes have evolved - and where they could definitely use some improvement. I'm excited to share my perspective on what's working well and what challenges we're facing operationally.

What would you like to know about our current operations?`,

      'Customer Service Manager': `Hi there! I'm ${stakeholder.name}, and I manage our customer service operations. It's wonderful to meet you and have this opportunity to discuss the ${selectedProject?.name} initiative.

I'm particularly interested in this project because customer experience is so close to my heart. Every day, I see how our current processes impact our customers - both the positive aspects and the areas where we could do better. I think this conversation will be really valuable for understanding the customer-facing side of things.

How can I help you understand our current customer service landscape?`,

      'IT Systems Lead': `Hello! I'm ${stakeholder.name}, the IT Systems Lead here. Thanks for including me in this requirements gathering - I always appreciate when the technical perspective is brought in early in the process.

I've been working with our current systems for several years now, so I have a pretty good understanding of both their capabilities and limitations. From a technical standpoint, there's definitely room for improvement in how we handle ${selectedProject?.name.toLowerCase()}, and I'm excited to explore what's possible.

What technical aspects would you like to dive into first?`,

      'HR Business Partner': `Hello! I'm ${stakeholder.name}, and I work as an HR Business Partner here. I'm so glad we're having this conversation about ${selectedProject?.name} - the people side of any process improvement is crucial.

I spend a lot of time with our teams, understanding their daily challenges and how changes impact their work experience. I think it's really important that we consider not just the technical aspects, but also how any changes will affect our team members' productivity and job satisfaction.

What would you like to explore about the human side of our current processes?`,

      'Compliance and Risk Manager': `Hello! I'm ${stakeholder.name}, and I handle compliance and risk management here. Thank you for including me in this discussion about ${selectedProject?.name}.

While compliance might not be the most exciting topic, it's absolutely critical that we get this right. I've seen too many well-intentioned process improvements run into regulatory issues later on. I'm here to help ensure we can achieve our efficiency goals while maintaining all our compliance requirements.

What compliance aspects would you like to understand better?`
    }
    
    return greetings[stakeholder.role] || `Hello! I'm ${stakeholder.name} from ${stakeholder.department}. I'm really pleased to meet you and discuss the ${selectedProject?.name} project. I'm looking forward to sharing my perspective and helping you understand how we can improve our processes. What would you like to know about my area of work?`
  }

  const generateAppreciationResponse = (stakeholder: any) => {
    return `You're very welcome! I'm genuinely happy to help with this. These kinds of collaborative discussions are so valuable - it's how we really understand what needs to change and how to make it better.

I think it's great that you're taking the time to gather input from different perspectives. It shows you really want to understand the full picture before moving forward. That approach usually leads to much better outcomes.

Please, ask me anything else you'd like to know about ${stakeholder.department} or how we handle things currently.`
  }

  const generateProcessResponse = (stakeholder: any, input: string, originalInput: string) => {
    const responses = {
      'Head of Operations': `Absolutely, I'd be happy to walk you through our current process. Let me break it down for you step by step, because I think understanding the flow will help you see where the opportunities are.

Right now, when a request comes in, it typically goes through about 6-8 different touchpoints before it's complete. We start with initial intake - that's usually handled by our front desk or comes through our online portal. From there, it gets assigned to a case manager who does the initial assessment.

The challenge is that after that initial assessment, we often need input from multiple departments. So the case gets passed around - sometimes to legal, sometimes to finance, sometimes to technical teams - and each handoff requires manual coordination. There's no automated routing, so it depends on people remembering to follow up.

What I find frustrating is that we don't have good visibility into where things stand. So when someone asks "where is my request?" we often have to do some detective work to figure out who has it and what stage it's at.

The whole process typically takes 6-8 weeks, but honestly, the actual work time is probably only 2-3 weeks. The rest is just things sitting in queues or waiting for handoffs.

Would you like me to elaborate on any particular part of that process?`,

      'Customer Service Manager': `Of course! Let me explain how things work from the customer-facing side, because I think that perspective is really important.

When a customer first contacts us, they usually have a pretty straightforward expectation - they want to know what happens next and when they can expect results. The problem is that our current process doesn't really support giving them that clarity.

Here's what typically happens: The customer submits their request, and we send them a confirmation saying "we received it and will get back to you." But then, from their perspective, it kind of disappears into a black hole. They might not hear from us for 2-3 weeks, and when they do, it's often just to ask for additional information or to tell them it's been forwarded to another department.

What I hear from customers - and this comes up in our satisfaction surveys regularly - is that they just want to know where things stand. They don't necessarily need it to be faster (though that would be nice), but they want transparency. They want to know "okay, it's in legal review" or "we're waiting for approval from finance" or whatever the actual status is.

The other challenge is that when customers call for updates, we don't always have good information to give them. Our team often has to make calls to other departments to try to track down status, which is frustrating for everyone involved.

Does that give you a good sense of the customer experience? What other aspects would you like to explore?`,

      'IT Systems Lead': `Sure, let me walk you through the technical side of how we handle this currently. I think understanding the system architecture will help you see why some of these process bottlenecks exist.

Right now, we're working with what I'd call a "patchwork" of systems. The initial request comes in through our web portal, which is built on our main CRM system. That part actually works pretty well - it's user-friendly and reliable.

But here's where it gets complicated: once the request is in the system, different departments use different tools to handle their part of the process. Legal has their own document management system, finance uses a different approval workflow tool, and technical reviews happen in yet another system.

This means that as a case moves through the process, the data has to be manually transferred between systems. Someone has to copy information from System A, go into System B, create a new record, and then remember to update System A with the status. It's not just inefficient - it's also error-prone.

We don't have real-time integration between these systems, so getting a complete picture of where something stands requires checking multiple places. And if someone forgets to update one of the systems, things can get lost or duplicated.

From a technical standpoint, I think there's huge potential to streamline this through better integration or maybe consolidating onto a single platform. But I'd want to understand more about the business requirements before recommending a specific approach.

What questions do you have about the technical constraints or possibilities?`
    }
    
    return responses[stakeholder.role] || `I'd be happy to walk you through our current process. From my perspective in ${stakeholder.department}, I can see several key steps and decision points that might be relevant to your analysis.

Let me start with how things typically flow through our area. We usually get involved when [specific trigger], and our role is to [specific responsibility]. The process usually takes [timeframe] on our end, though that can vary depending on complexity.

One thing I want to make sure you understand is that our part of the process doesn't happen in isolation - we're usually coordinating with other departments and waiting for inputs or approvals from various stakeholders.

What specific aspects of our process would you like me to dive deeper into?`
  }

  const generateProblemResponse = (stakeholder: any, input: string, originalInput: string) => {
    const responses = {
      'Head of Operations': `That's probably the most important question you could ask, because the pain points are what drive the need for change, right?

The biggest operational challenge we face is inconsistency. And I don't mean that people aren't following procedures - I mean that we don't really have standardized procedures to begin with. Different team members handle similar cases in different ways, which makes it really hard to predict outcomes or timelines.

For example, when a complex case comes in, one person might escalate it immediately to get expert input, while another person might try to handle it themselves first. Both approaches can work, but they lead to very different timelines and customer experiences.

The other major pain point is visibility. As a manager, I should be able to look at my dashboard and see where all our active cases stand, which ones are at risk of missing deadlines, and where the bottlenecks are. But our current systems don't give me that visibility. I often don't know we have a problem until a customer calls to complain.

From a resource management perspective, it's also difficult to plan effectively. I can't easily see workload distribution across my team, so sometimes people are overwhelmed while others are underutilized. And because we don't have good metrics on how long different types of cases should take, it's hard to set realistic expectations - either for customers or for my team.

The frustrating thing is that I know my team is capable of much better performance. They're skilled and dedicated. But the systems and processes aren't supporting them effectively.

What aspects of these operational challenges would you like to explore further?`,

      'Customer Service Manager': `Oh, where do I even start? The customer experience challenges are probably what keep me up at night most.

The biggest issue is the communication gap. Customers start with us, and we're their main point of contact, but then their case goes into this complex internal process where we lose visibility too. So when they call for updates, we're often in the same position they are - we don't know exactly where things stand.

This creates a really frustrating experience for customers. They'll call and say "I submitted my request three weeks ago and haven't heard anything," and I have to tell them "let me check on that and get back to you." That's not the level of service we want to provide.

The other challenge is managing expectations. Without good visibility into our internal process, it's hard to give customers accurate timelines. We might say "this typically takes 4-6 weeks" but then it takes 8 weeks because of some unexpected complexity or bottleneck. The customer feels like we gave them wrong information, even though we were doing our best with what we knew.

I also see the impact on my team's morale. Customer service representatives want to help people, but when they can't provide basic information about status or timelines, it makes them feel ineffective. They spend a lot of time on what I call "detective work" - trying to track down information that should be readily available.

And honestly, the volume of status inquiry calls is overwhelming. I'd estimate that 30-40% of our incoming calls are just people asking "what's happening with my case?" If we had better transparency, many of those calls wouldn't be necessary.

What would you like to dig into more deeply about these customer experience challenges?`
    }
    
    return responses[stakeholder.role] || `That's a really important question, and I appreciate you asking it directly. From my perspective in ${stakeholder.department}, there are several key challenges that impact our ability to work effectively.

The most significant issue is [specific challenge relevant to their role]. This affects us because [explanation of impact]. I see this play out on a regular basis when [specific example].

Another challenge is [secondary challenge]. This is particularly frustrating because [explanation of why it's problematic]. It impacts not just our efficiency, but also [broader impact].

I should mention that these aren't necessarily anyone's fault - they're more systemic issues that have developed over time as our processes have evolved. But they definitely need to be addressed if we want to improve our overall effectiveness.

Would you like me to elaborate on any of these challenges, or are there other pain points you'd like to explore?`
  }

  const generateSolutionResponse = (stakeholder: any, input: string, originalInput: string) => {
    return `That's exactly the kind of forward-thinking question I was hoping you'd ask! I've actually given this quite a bit of thought.

From my perspective as ${stakeholder.role}, the ideal solution would address our key priorities: ${stakeholder.priorities.join(', ')}. But let me be more specific about what that would look like in practice.

First, we need [specific solution element relevant to their role]. This would help us [specific benefit]. I think this is achievable because [reasoning].

Second, I'd love to see [another solution element]. The reason this is important is that [explanation of importance]. I've seen similar approaches work well in [context or example].

But here's what I think is crucial - any solution needs to be practical for day-to-day use. I've seen too many well-intentioned improvements that looked great on paper but didn't work in the real world because they were too complex or didn't fit how people actually work.

For example, [specific example of practical consideration]. This might seem like a small detail, but it's the kind of thing that can make or break user adoption.

I'm also thinking about the transition period. We can't just flip a switch and change everything overnight. We need a solution that allows us to gradually improve while maintaining business continuity.

What aspects of the solution would you like to explore further? Are there specific constraints or requirements I should be considering?`
  }

  const generateTimeResponse = (stakeholder: any, input: string, originalInput: string) => {
    return `Time is definitely a critical factor here, and I think it's worth breaking this down into different aspects.

Currently, our process typically takes 6-8 weeks from start to finish. But when I analyze where that time actually goes, I'd estimate that only about 2-3 weeks is actual work time. The rest is delays, handoffs, and things sitting in queues.

From my experience in ${stakeholder.department}, I think we could realistically reduce the total timeline to 3-4 weeks without compromising quality. The key would be eliminating those unnecessary delays.

Now, in terms of implementation timeline for improvements, that depends on the approach we take. If we're talking about process changes that use existing systems, we could probably see results in 2-3 months. But if we need new technology or significant system integration, we're probably looking at 6-12 months.

I want to be realistic about this though. Any major process change requires time for training, adjustment, and working through unexpected issues. I'd rather plan for a slightly longer timeline and deliver solid results than rush it and have problems later.

The other timing consideration is business impact. We need to plan implementation carefully so we don't disrupt ongoing operations. For example, [specific timing consideration relevant to their role].

Are you asking about current processing times, implementation timelines, or something else? I'm happy to dive deeper into any aspect of the timing question.`
  }

  const generateTeamResponse = (stakeholder: any, input: string, originalInput: string) => {
    return `I'm really glad you're asking about the people side of this. Change management is so important, and I think the team perspective often gets overlooked.

My team is generally very capable and motivated. They want to do good work and provide excellent service. But our current processes sometimes make that difficult. When people have to spend time on manual, repetitive tasks or when they can't easily get the information they need, it's frustrating for everyone.

From a change perspective, I think my team would be quite receptive to improvements, as long as they understand the benefits and have adequate support during the transition. People are more resistant to change when they feel like it's being imposed on them without consideration for how it affects their daily work.

What I've learned from previous changes is that communication is crucial. People need to understand not just what is changing, but why it's changing and how it will make their work better. They also need to feel like their concerns and feedback are being heard.

Training is another critical factor. We need to ensure people feel confident using new processes or systems. Nothing undermines adoption like people feeling lost or unsure about how to do their jobs effectively.

In terms of capacity, I think we have the right people to make this successful. We might need some temporary additional support during the transition period, but the core team is solid.

Are you thinking about specific aspects of team readiness or change management? I'd be happy to discuss any concerns you might have.`
  }

  const generateCostResponse = (stakeholder: any, input: string, originalInput: string) => {
    return `That's a really important question, and I think it's worth looking at cost from multiple angles.

First, there's the cost of the current situation. Our inefficiencies are definitely costing us money - both in terms of operational overhead and lost opportunities. For example, [specific cost example relevant to their role]. When I think about the staff time we're spending on workarounds and manual processes, it adds up quickly.

Then there's the implementation cost for improvements. I don't have exact figures, but we should budget for [specific cost considerations]. The good news is that many of the improvements we're discussing should pay for themselves through increased efficiency and reduced operational costs.

From my perspective in ${stakeholder.department}, I think the ROI would be quite strong. If we can reduce processing time by even 25%, that translates to significant savings in staff time and improved customer satisfaction.

But I want to be realistic about this. There will be upfront costs, and there might be some temporary productivity impact during the transition. We need to factor that into our planning.

I also think it's worth considering the cost of not making changes. If we continue with the current process, we're likely to see increasing costs over time as volume grows and the inefficiencies become more pronounced.

What specific cost aspects are you most concerned about? Are you looking at implementation costs, ongoing operational costs, or the business case for the changes?`
  }

  const generateFollowUpResponse = (stakeholder: any, input: string, originalInput: string, history: any[]) => {
    return `Absolutely, I'm happy to elaborate on that. Let me provide some additional context that might be helpful.

Building on what I mentioned earlier, I think it's important to understand [relevant additional detail]. This connects to what we were discussing because [explanation of connection].

From my experience in ${stakeholder.department}, I've seen [specific example or elaboration]. This is particularly relevant because [explanation of relevance].

One thing I maybe didn't emphasize enough is [additional important point]. The reason this matters is [explanation of why it matters].

I should also mention that [qualifying statement or additional consideration]. This is worth keeping in mind as we think about solutions.

Does that help clarify things? Are there other aspects of this you'd like me to expand on? I want to make sure you have all the information you need to understand how this works in practice.`
  }

  const generateDefaultResponse = (stakeholder: any, input: string, originalInput: string) => {
    return `That's a thoughtful question, and I appreciate you asking it. Let me think about how to best answer this from my perspective as ${stakeholder.role}.

When I consider this in the context of our work on ${selectedProject?.name}, I think about it in terms of ${stakeholder.priorities[0]} and ${stakeholder.priorities[1]}. Those are really the key priorities that guide my thinking on most issues.

From my experience in ${stakeholder.department}, I'd say that [contextual response based on their role]. This is important because [explanation of importance].

I want to make sure I'm addressing what you're really asking about though. Are you looking for information about [possible interpretation A], or are you more interested in [possible interpretation B]? I'm happy to focus on whichever aspect would be most helpful for your analysis.

Also, if there are specific examples or scenarios that would help illustrate the point, I'd be glad to share those. Sometimes concrete examples can be more useful than general explanations.

What would be most helpful for you to understand about this?`
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