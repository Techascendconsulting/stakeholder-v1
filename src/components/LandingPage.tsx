import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Target, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Award,
  TrendingUp,
  Building,
  Clock,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  Globe,
  ChevronRight,
  Sparkles,
  Brain,
  Lightbulb,
  Rocket,
  Trophy,
  BookOpen,
  Video,
  Headphones,
  Monitor,
  Smartphone,
  Map,
  Bot,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  Instagram,
  Mail,
  MapPin,
  AlertCircle,
  Briefcase,
  Compass,
  Layers
} from 'lucide-react'
import LoginSignup from './LoginSignup'
import ContactUsView from './Views/ContactUsView'
import FAQView from './Views/FAQView'
import RequestAccessModal from './RequestAccessModal'

const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showRequestAccess, setShowRequestAccess] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    // Check if we should show login form due to device lock error
    const showLoginForm = localStorage.getItem('showLoginForm')
    if (showLoginForm === 'true') {
      setShowAuth(true)
      localStorage.removeItem('showLoginForm')
    }
    
    // Testimonials auto-rotation removed (using dual-scroll instead)

    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp')
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    })

    document.querySelectorAll('.observe-animation').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isVisible])

  if (showAuth) {
    return <LoginSignup onBack={() => setShowAuth(false)} />
  }

  if (showContact) {
    return <ContactUsView 
      onBack={() => setShowContact(false)} 
      onFAQClick={() => {
        setShowContact(false);
        setShowFAQ(true);
      }}
    />
  }

  if (showFAQ) {
    return <FAQView 
      onBack={() => setShowFAQ(false)} 
      onContactClick={() => {
        setShowFAQ(false);
        setShowContact(true);
      }} 
    />
  }
  
  if (showRequestAccess) {
    return <RequestAccessModal 
      onClose={() => setShowRequestAccess(false)} 
      onBackToHome={() => setShowRequestAccess(false)}
      onSignIn={() => {
        setShowRequestAccess(false);
        setShowAuth(true);
      }}
    />
  }

  // Updated features to match actual app with detailed modal content
  const features = [
    {
      icon: Map,
      title: "Learning Journey",
      description: "Master Business Analysis through comprehensive sequential modules. Core concepts, project initiation, elicitation, documentation, and more - all with interactive assignments and AI feedback.",
      image: "https://images.pexels.com/photos/2566581/pexels-photo-2566581.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "Full Curriculum",
      color: "from-purple-500 to-indigo-600",
      detailedContent: {
        overview: "A structured, progressive learning path that takes you from Business Analysis fundamentals to advanced techniques. Each module builds on the previous one, ensuring you develop a solid foundation.",
        features: [
          "Core Business Analysis Concepts - Role, value, and competencies",
          "Project Initiation - Stakeholder analysis and project scoping",
          "Requirements Elicitation - Interview techniques and facilitation",
          "Process Mapping - Visualize and optimize business processes",
          "Requirements Engineering - Documentation and validation",
          "Solution Design - Design thinking and option analysis",
          "Documentation Standards - User stories, acceptance criteria",
          "MVP Strategy - Prioritization and value delivery",
          "Agile & Scrum - BA role in ceremonies and frameworks",
          "Interactive assignments with AI feedback after each module"
        ],
        outcomes: "By completing the Learning Journey, you'll have mastered the core competencies needed for Business Analysis roles and be ready to practice with realistic scenarios."
      }
    },
    {
      icon: Target,
      title: "AI-Powered Practice",
      description: "Practice elicitation, documentation, MVP building, and Scrum with realistic AI stakeholders. Get instant feedback and improve your skills with every session.",
      image: "https://images.pexels.com/photos/7688339/pexels-photo-7688339.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "Unlimited Practice",
      color: "from-cyan-500 to-blue-600",
      detailedContent: {
        overview: "Practice makes perfect. Our AI-powered practice modules let you conduct realistic stakeholder conversations in both chat and voice modes, with instant coaching and feedback.",
        features: [
          "Elicitation Practice - Chat mode unlocked first, voice mode after mastery",
          "User Story Documentation - Build perfect user stories with INVEST principles",
          "MVP Building - Prioritize features using MoSCoW and value analysis",
          "Agile Ceremonies - Practice backlog refinement and sprint planning",
          "Realistic AI stakeholders with diverse personalities and communication styles",
          "Real-time coaching suggestions during conversations",
          "Detailed feedback reports after each session",
          "Progress tracking across all practice modules",
          "Unlimited sessions to refine your skills"
        ],
        outcomes: "Practice sessions prepare you for real-world stakeholder interactions and help you build confidence before working on actual projects."
      }
    },
    {
      icon: Briefcase,
      title: "Hands-On Projects",
      description: "Work on real-world business scenarios. Apply your learning to actual Business Analysis projects with tools for requirements, process mapping, and stakeholder management.",
      image: "https://images.pexels.com/photos/15543115/pexels-photo-15543115.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "Real Scenarios",
      color: "from-emerald-500 to-teal-600",
      detailedContent: {
        overview: "Apply everything you've learned to hands-on projects based on real-world business scenarios. Create a professional portfolio of deliverables.",
        features: [
          "Multiple industry project scenarios to choose from",
          "Comprehensive project briefs with business context",
          "Full stakeholder roster with diverse roles and concerns",
          "Conduct complete stakeholder interview sessions",
          "Generate professional meeting summaries and transcripts",
          "Create requirements documentation",
          "Build process maps and diagrams",
          "Develop user stories and acceptance criteria",
          "Portfolio-ready deliverables you can show to employers"
        ],
        outcomes: "Complete hands-on projects that demonstrate your Business Analysis skills and build a professional portfolio for job applications."
      }
    },
    {
      icon: Bot,
      title: "Verity AI Assistant",
      description: "Your 24/7 learning companion. Get instant answers to Business Analysis questions, navigate the platform, and receive personalized guidance throughout your journey.",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "Always Available",
      color: "from-pink-500 to-purple-600",
      detailedContent: {
        overview: "Verity is your intelligent AI assistant, available 24/7 to help you throughout your learning journey. Get instant answers, guidance, and support whenever you need it.",
        features: [
          "Answer questions about Business Analysis concepts and techniques",
          "Explain complex topics in simple, understandable terms",
          "Help navigate the platform and find resources",
          "Provide personalized learning recommendations",
          "Suggest next steps based on your progress",
          "Context-aware assistance on current page/module",
          "Daily question limit to encourage focused learning",
          "Report issues or request help from mentors"
        ],
        outcomes: "Never feel stuck or lost. Verity ensures you always have support and guidance, accelerating your learning and keeping you on track."
      }
    }
  ]

  const testimonials = [
    // Row 1 (scrolls left)
    {
      name: "Adunni Okafor",
      role: "Senior Business Analyst",
      company: "Microsoft",
      content: "This platform transformed my stakeholder management approach. The AI interviews felt incredibly real!",
      rating: 5,
      image: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£85k → £120k",
      location: "London, UK"
    },
    {
      name: "Chukwuemeka Nwosu",
      role: "Lead Product Analyst",
      company: "Deloitte",
      content: "The real-world scenarios prepared me perfectly for my role at Deloitte. Incredibly realistic practice.",
      rating: 5,
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£65k → £95k",
      location: "Manchester, UK"
    },
    {
      name: "Folake Adebayo",
      role: "Business Transformation Consultant",
      company: "PwC",
      content: "From junior analyst to consultant in 8 months. The techniques I learned are exactly what we use at PwC.",
      rating: 5,
      image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£45k → £78k",
      location: "Birmingham, UK"
    },
    {
      name: "Oluwaseun Adeleke",
      role: "Business Analyst",
      company: "Accenture",
      content: "The progressive learning system kept me engaged. Verity AI helped me whenever I got stuck.",
      rating: 5,
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£52k → £82k",
      location: "Leeds, UK"
    },
    {
      name: "Chiamaka Okonkwo",
      role: "Requirements Analyst",
      company: "KPMG",
      content: "The documentation practice was invaluable. I now write user stories that developers actually love.",
      rating: 5,
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£48k → £72k",
      location: "London, UK"
    },
    {
      name: "Emeka Obi",
      role: "Senior BA",
      company: "Barclays",
      content: "The MVP prioritization module changed how I approach feature planning. Landed my dream role!",
      rating: 5,
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£58k → £88k",
      location: "London, UK"
    },
    // Row 2 (scrolls right - different people)
    {
      name: "Ngozi Eze",
      role: "Product Analyst",
      company: "Google",
      content: "The AI stakeholder practice gave me confidence I never had before. Now interviewing feels natural.",
      rating: 5,
      image: "https://images.pexels.com/photos/3752834/pexels-photo-3752834.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£72k → £110k",
      location: "Dublin, Ireland"
    },
    {
      name: "Babatunde Akinola",
      role: "Business Systems Analyst",
      company: "IBM",
      content: "Process mapping was my weakness. Now it's my strength. Got promoted within 4 months of completing.",
      rating: 5,
      image: "https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£55k → £75k",
      location: "Edinburgh, UK"
    },
    {
      name: "Zainab Mohammed",
      role: "Senior Consultant",
      company: "EY",
      content: "The Agile & Scrum module was exceptional. I now run refinement sessions with confidence.",
      rating: 5,
      image: "https://images.pexels.com/photos/3796810/pexels-photo-3796810.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£62k → £95k",
      location: "London, UK"
    },
    {
      name: "Kelechi Udeh",
      role: "Lead Business Analyst",
      company: "Amazon",
      content: "Best investment in my career. The hands-on projects gave me a portfolio that got me into Amazon.",
      rating: 5,
      image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£68k → £105k",
      location: "London, UK"
    },
    {
      name: "Amara Nwankwo",
      role: "Requirements Lead",
      company: "Santander",
      content: "The elicitation techniques I learned helped me uncover requirements others missed. Career game-changer!",
      rating: 5,
      image: "https://images.pexels.com/photos/3785084/pexels-photo-3785084.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£50k → £78k",
      location: "Milton Keynes, UK"
    },
    {
      name: "Chidera Okoro",
      role: "Digital BA",
      company: "Lloyds Banking",
      content: "Voice practice mode was brilliant. I felt prepared for every stakeholder meeting in my new role.",
      rating: 5,
      image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=faces",
      salary: "£54k → £80k",
      location: "Bristol, UK"
    }
  ]
  
  // Split testimonials for dual-direction scroll
  const row1Testimonials = testimonials.slice(0, 6)
  const row2Testimonials = testimonials.slice(6, 12)

  const stats = [
    { number: "2,847", label: "Professionals Trained", icon: Users, change: "+127% this year" },
    { number: "£47k", label: "Average Salary Increase", icon: TrendingUp, change: "Within 6 months" },
    { number: "94%", label: "Job Placement Rate", icon: Target, change: "Within 3 months" },
    { number: "4.9/5", label: "Student Rating", icon: Star, change: "From 1,200+ reviews" }
  ]

  const companies = [
    { name: "Microsoft", logo: "https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { name: "Deloitte", logo: "https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { name: "PwC", logo: "https://images.pexels.com/photos/4348407/pexels-photo-4348407.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { name: "Accenture", logo: "https://images.pexels.com/photos/4348410/pexels-photo-4348410.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { name: "KPMG", logo: "https://images.pexels.com/photos/4348413/pexels-photo-4348413.jpeg?auto=compress&cs=tinysrgb&w=200" },
    { name: "EY", logo: "https://images.pexels.com/photos/4348416/pexels-photo-4348416.jpeg?auto=compress&cs=tinysrgb&w=200" }
  ]

  const howItWorksSteps = [
    {
      number: "01",
      title: "Learn",
      description: "Complete comprehensive interactive modules covering all Business Analysis fundamentals. From core concepts to advanced techniques, build a solid foundation.",
      icon: GraduationCap,
      color: "from-purple-500 to-indigo-600"
    },
    {
      number: "02",
      title: "Practice",
      description: "Apply your knowledge with AI-powered simulations. Practice elicitation, documentation, MVP building, and Scrum in realistic scenarios.",
      icon: Target,
      color: "from-cyan-500 to-blue-600"
    },
    {
      number: "03",
      title: "Build",
      description: "Work on hands-on projects that mirror real-world BA work. Create requirements, map processes, and manage stakeholders.",
      icon: Rocket,
      color: "from-emerald-500 to-teal-600"
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ scrollbarGutter: 'stable' }}>
      {/* Floating Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">BA WorkXP</span>
            </button>
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Features
              </button>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                How It Works
              </button>
              <button 
                onClick={() => document.getElementById('success')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Success Stories
              </button>
              <button 
                onClick={() => setShowFAQ(true)}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                FAQ
              </button>
              <button 
                onClick={() => setShowContact(true)}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </button>
            </nav>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAuth(true)}
                className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                <span>Request Access</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 2025 Silicon Valley Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-700">
        {/* Animated Background with Parallax */}
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-white/10 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-400/15 to-purple-300/15 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 animate-bounce shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Join 2,847+ Successful Business Analysts
              </div>
            
              <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Master Business Analysis
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-200 animate-gradient"> with AI </span>
              </h1>
              
              <p className="text-xl text-purple-100 mb-10 leading-relaxed max-w-2xl">
                Learn through comprehensive interactive modules, practice with AI stakeholders, and build real projects. 
                <span className="font-semibold text-white"> Begin your Business Analysis career transformation today.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <button
                  onClick={() => setShowAuth(true)}
                  className="group bg-white text-purple-600 px-10 py-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3 shadow-2xl transform hover:scale-105"
                >
                  <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                  <span>Start Learning Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3 transform hover:scale-105"
                >
                  <Target className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Explore Platform</span>
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-white mb-1">Complete</div>
                  <div className="text-sm text-purple-200">Learning Journey</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-white mb-1">AI</div>
                  <div className="text-sm text-purple-200">Powered Practice</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-purple-200">AI Support</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Product Demo */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative">
                {/* Main Product Screenshot */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 group backdrop-blur-sm bg-white/30 border border-white/50">
                  <img
                    src="https://images.pexels.com/photos/7698715/pexels-photo-7698715.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="AI-Powered Business Analysis Training Platform"
                    className="w-full h-[600px] object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  
                  {/* Floating UI Elements - Glassmorphism */}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-float border border-white/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-900">Learning Journey</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Module 3: Requirements Elicitation</div>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-float delay-500 border border-white/50">
                    <div className="flex items-center space-x-3">
                      <Bot className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Verity AI</div>
                        <div className="text-xs text-gray-600">Ready to help</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background Decoration with 3D effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-indigo-200/30 rounded-3xl transform rotate-3 scale-105 -z-10 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-3xl transform -rotate-2 scale-110 -z-20 blur-md"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos - Animated Carousel */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our graduates work at leading companies worldwide</h2>
            <p className="text-gray-600 font-medium">Trusted by top organizations across the globe</p>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-12 items-center">
              {[...companies, ...companies].map((company, index) => (
                <div key={index} className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110">
                  <div className="text-2xl font-bold text-gray-400 hover:text-gray-700 transition-colors px-8">
                    {company.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3-Step Journey */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-50 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 observe-animation">
            <div className="inline-flex items-center bg-purple-50 text-purple-700 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-purple-200">
              <Map className="w-4 h-4 mr-2" />
              Your Learning Path
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured, progressive journey from foundational concepts to real-world application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksSteps.map((step, index) => (
              <div 
                key={index} 
                className="relative group observe-animation"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connection Line (except last item) */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent -translate-x-1/2 z-0"></div>
                )}
                
                <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 hover:border-purple-200">
                  {/* Step Number */}
                  <div className="absolute -top-6 left-8">
                    <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-xl`}>
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-6 mt-8">
                    <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-center">{step.description}</p>
                  
                  {/* Decorative gradient line */}
                  <div className={`mt-6 h-1 bg-gradient-to-r ${step.color} rounded-full mx-auto w-16 group-hover:w-full transition-all duration-500`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16 observe-animation">
            <button
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-10 py-4 rounded-2xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-semibold text-lg shadow-xl transform hover:scale-105 inline-flex items-center space-x-3"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section - Animated Counters */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200')] opacity-10 bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 observe-animation">
            <h2 className="text-4xl font-bold text-white mb-4">Transforming Careers Worldwide</h2>
            <p className="text-xl text-purple-100">Real results from real professionals</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group transform hover:scale-110 transition-all duration-300 observe-animation" style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 border border-white/30">
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-purple-100 font-medium mb-1">{stat.label}</div>
                <div className="text-purple-200 text-sm">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Why Choose BA WorkXP */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-purple-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 observe-animation">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Why BA WorkXP?
              </span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              From Learning to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Employment</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Bridge the gap between training and getting hired with real digital work experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1: Practical Work Experience */}
            <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-purple-100 hover:border-purple-300 observe-animation group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Practical Work Experience</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Gain real, hands-on digital work experience without needing a corporate placement. Work on structured projects that mirror actual business problems.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                  <div className="flex items-center text-purple-600 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Real-world confidence</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Benefit 2: Become Job-Ready */}
            <div className="relative bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-indigo-100 hover:border-indigo-300 observe-animation group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">Become Job-Ready</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Learn to speak and think like a real Business Analyst. Master interview-level skills and understand what hiring managers actually want.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                  <div className="flex items-center text-indigo-600 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Interview-ready skills</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Benefit 3: End-to-End Project Exposure */}
            <div className="relative bg-gradient-to-br from-pink-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-pink-100 hover:border-pink-300 observe-animation group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors">Full Project Lifecycle</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Experience the complete journey from problem identification to solution delivery. Interact with simulated stakeholders across departments.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-pink-100">
                  <div className="flex items-center text-pink-600 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Real BA activities</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Benefit 4: Guided Learning */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-blue-100 hover:border-blue-300 observe-animation group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">AI-Powered Guidance</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Receive step-by-step coaching just like in a real BA role. Get instant feedback to correct mistakes and improve your delivery depth.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                  <div className="flex items-center text-blue-600 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Learn why, not just what</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Benefit 5: Build Your Portfolio */}
            <div className="relative bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-green-100 hover:border-green-300 observe-animation group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">Build Your Portfolio</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Export real deliverables as portfolio samples. Showcase tangible project experience to recruiters and hiring managers.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-green-100">
                  <div className="flex items-center text-green-600 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Proof of experience</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Benefit 6: Confidence Through Practice */}
            <div className="relative bg-gradient-to-br from-orange-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-orange-100 hover:border-orange-300 observe-animation group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">Confidence Through Practice</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Rehearse stakeholder meetings with instant feedback. Develop the fluency and composure that separate trained candidates from hired ones.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                  <div className="flex items-center text-orange-600 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Interview composure</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats/CTA */}
          <div className="mt-16 text-center observe-animation">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">100%</div>
                  <div className="text-purple-100">Digital Work Experience</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">Real</div>
                  <div className="text-purple-100">Portfolio Projects</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">Job-Ready</div>
                  <div className="text-purple-100">Skills & Confidence</div>
                </div>
              </div>
              <p className="text-xl text-white font-semibold mb-6">
                Close the gap between "I've trained" and "I've got the job"
              </p>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <span>Start Building Experience</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Rich Visual Cards */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 observe-animation">
            <div className="inline-flex items-center bg-purple-50 text-purple-700 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-purple-200">
              <Lightbulb className="w-4 h-4 mr-2" />
              Platform Features
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Everything You Need to Master BA</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines learning, practice, and real-world application
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 hover:border-purple-200 observe-animation"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent`}></div>
                  
                  {/* Feature Icon - Glassmorphism */}
                  <div className="absolute top-6 left-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Stats Badge - Glassmorphism */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-white/50">
                    <div className="text-sm font-bold text-gray-900">{feature.stats}</div>
                  </div>
                  
                  {/* Feature Title Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">{feature.title}</h3>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">{feature.description}</p>
                  <button 
                    onClick={() => setShowRequestAccess(true)}
                    className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Request Access
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - Dual-Direction Infinite Scroll */}
      <section id="success" className="py-24 bg-gradient-to-br from-slate-50 to-purple-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center observe-animation">
            <div className="inline-flex items-center bg-white border border-purple-200 text-purple-700 px-6 py-3 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Success Stories
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Career Transformations from Our Community</h2>
            <p className="text-xl text-gray-600">Real professionals, real results, real impact</p>
          </div>
        </div>

        {/* Row 1: Scrolling Left */}
        <div className="relative mb-8 overflow-hidden">
          <div className="flex animate-scroll-left space-x-6">
            {[...row1Testimonials, ...row1Testimonials, ...row1Testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-purple-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{testimonial.location}</span>
                  <span className="text-sm font-bold text-green-600">{testimonial.salary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-right space-x-6">
            {[...row2Testimonials, ...row2Testimonials, ...row2Testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-purple-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{testimonial.location}</span>
                  <span className="text-sm font-bold text-green-600">{testimonial.salary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Access Section - Invite Only */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 observe-animation">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Invite-Only Platform</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Join BA WorkXP</h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Request access for yourself or explore partnership opportunities for your training platform.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 observe-animation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Complete Learning Journey</h3>
                  <p className="text-purple-100 text-sm">Master Business Analysis fundamentals with assignments and AI feedback</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">AI Practice Sessions</h3>
                  <p className="text-purple-100 text-sm">Unlock practice modules as you progress through learning</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">1 Hands-On Project</h3>
                  <p className="text-purple-100 text-sm">Work on a real-world BA project with all tools included</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Verity AI Assistant</h3>
                  <p className="text-purple-100 text-sm">24/7 support with 20 questions per day</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h3>
                <p className="text-purple-100 text-lg">
                  Request access for individual learning or explore partnership opportunities for your training platform.
                </p>
              </div>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="bg-white text-purple-600 px-12 py-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-xl inline-flex items-center space-x-3 shadow-2xl transform hover:scale-105 hover:shadow-white/25"
              >
                <Mail className="w-6 h-6" />
                <span>Request Access</span>
                <ArrowRight className="w-6 h-6" />
              </button>
              <p className="text-purple-100 text-sm mt-6">
                Exclusive access for training platform partners • We respond within 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-gradient-to-r from-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Professional success"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/95 to-indigo-700/95"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 observe-animation">
          <h2 className="text-5xl font-bold text-white mb-8">
            Your BA Career Transformation Starts Today
          </h2>
          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals accelerating their BA careers with AI-powered training. Request access today.
          </p>
          <button
            onClick={() => setShowRequestAccess(true)}
            className="bg-white text-purple-600 px-12 py-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-xl inline-flex items-center space-x-3 shadow-2xl transform hover:scale-105 hover:shadow-white/25"
          >
            <Mail className="w-6 h-6" />
            <span>Request Access</span>
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-purple-100 text-sm mt-6">For individuals and training platforms • We respond within 24 hours</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">BA WorkXP Platform</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                The world's most advanced Business Analysis training platform. Transform your career with AI-powered learning, practice, and real-world projects.
              </p>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Connect With Us</h3>
                <div className="flex space-x-3">
                  <a href="https://linkedin.com/company/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:scale-110" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                  <a href="https://twitter.com/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-all duration-300 transform hover:scale-110" aria-label="Twitter">
                    <Twitter className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                  <a href="https://facebook.com/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-all duration-300 transform hover:scale-110" aria-label="Facebook">
                    <Facebook className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                  <a href="https://youtube.com/@baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all duration-300 transform hover:scale-110" aria-label="YouTube">
                    <Youtube className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                  <a href="https://instagram.com/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110" aria-label="Instagram">
                    <Instagram className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                  <button 
                    onClick={() => setShowContact(true)}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-all duration-300 transform hover:scale-110" 
                    aria-label="Contact Us"
                  >
                    <Mail className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                {['Learning Journey', 'Practice Sessions', 'Projects', 'Success Stories'].map((item) => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors transform hover:translate-x-2 duration-300">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <button
                    onClick={() => setShowFAQ(true)}
                    className="hover:text-white transition-colors transform hover:translate-x-2 duration-300 block"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowContact(true)}
                    className="hover:text-white transition-colors transform hover:translate-x-2 duration-300 block"
                  >
                    Contact Us
                  </button>
                </li>
                <li className="hover:text-white cursor-pointer transition-colors transform hover:translate-x-2 duration-300">
                  Privacy Policy
                </li>
                <li className="hover:text-white cursor-pointer transition-colors transform hover:translate-x-2 duration-300">
                  Terms of Service
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BA WorkXP Platform. All rights reserved. Transforming careers worldwide.</p>
          </div>
        </div>
      </footer>

      {/* Custom Animations + 2025 Enhancements */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        
        @keyframes scroll-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
        
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        /* Reduced motion support for accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #4f46e5);
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #4338ca);
        }
      `}</style>
    </div>
  )
}

export default LandingPage
