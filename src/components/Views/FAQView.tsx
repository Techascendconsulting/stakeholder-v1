import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Lock, 
  Unlock, 
  Shield, 
  GraduationCap, 
  Target, 
  Briefcase, 
  MessageSquare, 
  Mail, 
  CreditCard, 
  Users, 
  Book, 
  Play,
  Award,
  ArrowLeft,
  Search,
  BookOpen
} from 'lucide-react';

interface FAQViewProps {
  onBack?: () => void;
  onContactClick?: () => void;
  onTabChange?: (tab: 'help' | 'faq') => void;
  showTabs?: boolean;
}

const FAQView: React.FC<FAQViewProps> = ({ onBack, onContactClick, onTabChange, showTabs = false }) => {
  const [openCategories, setOpenCategories] = useState<string[]>(['getting-started', 'account-security', 'learning']);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: GraduationCap,
      color: 'from-purple-500 to-indigo-600',
      questions: [
        {
          id: 'q1',
          question: 'How do I get started with the platform?',
          answer: 'We currently operate on an invite-only basis to ensure quality and personalized support for each student. Click "Request Access" on the landing page to submit your application. Once approved and invited, you\'ll receive access credentials and begin with an onboarding tour that introduces you to the platform features.'
        },
        {
          id: 'q2',
          question: 'What is the learning path structure?',
          answer: 'Our proprietary learning system guides you through a structured journey from foundational concepts to real-world application. The platform progressively unlocks content as you demonstrate mastery, ensuring you build skills in the right sequence.'
        },
        {
          id: 'q3',
          question: 'How long does it take to complete?',
          answer: 'The Learning Journey typically takes 6-8 weeks at a comfortable pace. Practice and Project phases are self-paced. You can progress faster or slower based on your schedule and commitment level.'
        },
        {
          id: 'q4',
          question: 'Do I need any prior experience?',
          answer: 'No prior Business Analysis experience is required. Our Learning Journey starts from the fundamentals and progressively builds your skills. Whether you\'re completely new or transitioning from another role, the platform adapts to your learning pace.'
        }
      ]
    },
    {
      id: 'account-security',
      title: 'Account & Security',
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      questions: [
        {
          id: 'q5',
          question: 'Why is account sharing not allowed?',
          answer: 'Each account is designed for individual use to maintain learning integrity and progress accuracy. Sharing login credentials violates our terms of service and compromises your personalized learning journey. Our security systems detect unauthorized access and will lock accounts to protect your progress.'
        },
        {
          id: 'q6',
          question: 'What happens if I try to login from multiple devices?',
          answer: 'Your account is locked to your registered device. If you attempt to login from an unauthorized device, your account will be temporarily locked for security. Contact an administrator to unlock your account if this happens. This protects your progress and ensures compliance with our single-user policy.'
        },
        {
          id: 'q7',
          question: 'How do I unlock my account if it gets locked?',
          answer: 'If your account is locked due to device mismatch, use the "Contact Us" page to reach out to our admin team. They can review your request and unlock your account. Provide your email address and explain the situation (e.g., new device, reset device, etc.).'
        },
        {
          id: 'q8',
          question: 'Can I access from multiple devices?',
          answer: 'Currently, accounts are bound to a single device for security. If you need to change devices (e.g., new laptop), contact support through the Contact Us page and we can help you migrate your account to the new device.'
        }
      ]
    },
    {
      id: 'learning',
      title: 'Learning & Progress',
      icon: Book,
      color: 'from-cyan-500 to-blue-600',
      questions: [
        {
          id: 'q9',
          question: 'How does the progressive unlock system work?',
          answer: 'Content unlocks progressively as you master each stage, ensuring you build a solid foundation before moving to advanced activities. This adaptive system keeps you challenged but not overwhelmed, optimizing your learning journey.'
        },
        {
          id: 'q10',
          question: 'What happens if I fail an assignment?',
          answer: 'Assignments are learning opportunities, not pass/fail tests. You receive AI feedback on your submissions and can revise and resubmit. The goal is to master the concepts, not to rush through. Take your time and use the feedback to improve.'
        },
        {
          id: 'q11',
          question: 'Can I skip modules or jump ahead?',
          answer: 'No, modules must be completed sequentially to ensure proper foundation building. Each module builds on concepts from previous ones. This structured approach ensures you don\'t miss critical fundamentals.'
        },
        {
          id: 'q12',
          question: 'What is Verity AI Assistant?',
          answer: 'Verity is your 24/7 AI learning companion available throughout the platform. She can answer questions about Business Analysis concepts, help you navigate, provide guidance, and assist when you\'re stuck. Daily interaction limits encourage focused, intentional learning.'
        }
      ]
    },
    {
      id: 'practice',
      title: 'Practice & Voice Features',
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
      questions: [
        {
          id: 'q13',
          question: 'What practice modes are available?',
          answer: 'We offer multiple practice modes designed to progressively build your confidence and skills. Our proprietary system ensures you\'re fully prepared at each stage before advancing to more challenging modes.'
        },
        {
          id: 'q14',
          question: 'How do advanced features unlock?',
          answer: 'Advanced practice features unlock automatically as you demonstrate competency. Our intelligent system tracks your progress and opens new capabilities when you\'re ready, ensuring optimal learning progression.'
        },
        {
          id: 'q15',
          question: 'Are there limits on practice sessions?',
          answer: 'Practice sessions are designed to be comprehensive while encouraging focused learning. The platform balances unlimited practice opportunities with smart pacing to maximize skill retention and prevent burnout.'
        },
        {
          id: 'q16',
          question: 'Do I get feedback during practice?',
          answer: 'Yes! Our AI coaching system provides real-time suggestions during conversations and detailed feedback reports after each session. You\'ll see what you did well, areas for improvement, and specific techniques to practice.'
        }
      ]
    },
    {
      id: 'projects',
      title: 'Projects & Deliverables',
      icon: Briefcase,
      color: 'from-orange-500 to-red-600',
      questions: [
        {
          id: 'q17',
          question: 'How many projects can I work on?',
          answer: 'Your subscription tier determines your project limit. Choose from multiple real-world industry scenarios including E-Commerce, Healthcare, Financial Services, Supply Chain, and more. Each project provides hands-on experience with different business contexts.'
        },
        {
          id: 'q18',
          question: 'What deliverables will I create?',
          answer: 'You\'ll create professional Business Analysis deliverables including: stakeholder interview summaries and notes, requirements documents, user stories with acceptance criteria, process maps and diagrams, MVP feature prioritization, and more. All deliverables are portfolio-ready and demonstrate real-world BA capabilities.'
        },
        {
          id: 'q19',
          question: 'Can I customize projects?',
          answer: 'Yes! In addition to the 5 pre-built scenarios, you can create custom projects with your own business context, objectives, and stakeholders. This is perfect if you want to practice with scenarios similar to your target industry.'
        },
        {
          id: 'q20',
          question: 'Are the AI stakeholders realistic?',
          answer: 'Absolutely! Our AI stakeholders have diverse personalities (skeptical, enthusiastic, technical, detail-oriented, etc.), realistic concerns based on their roles, and dynamic responses based on your questions. Many students report feeling genuinely nervous during their first sessions - that\'s how realistic they are!'
        }
      ]
    },
    {
      id: 'certificates',
      title: 'Certificates & Career',
      icon: Award,
      color: 'from-yellow-500 to-orange-600',
      questions: [
        {
          id: 'q21',
          question: 'Do I get a certificate?',
          answer: 'We focus on building real experience and a professional portfolio instead of certificates. While we recommend industry certifications like PSM 1 (Scrum Master) or BCS (Business Analysis), the truth is employers care far more about your practical experience than certificates. If you\'ve genuinely done the work, it will show in interviews - that\'s what gets you hired.'
        },
        {
          id: 'q22',
          question: 'What certifications do you recommend?',
          answer: 'For Scrum/Agile: PSM 1 (Professional Scrum Master) from Scrum.org. For Business Analysis: BCS certifications or IIBA CBAP/CCBA. However, real project experience often outweighs certifications. Focus on building demonstrable skills and a strong portfolio first.'
        },
        {
          id: 'q23',
          question: 'How does this help me get a job?',
          answer: 'Employers hire based on proven experience, not just theory. By completing our Learning Journey, Practice sessions, and hands-on projects, you\'ll have real artifacts to show: interview summaries, requirements docs, process maps, user stories - actual work product that demonstrates your capabilities. This portfolio speaks louder than certificates.'
        },
        {
          id: 'q24',
          question: 'What kind of salary can I expect?',
          answer: 'Business Analyst salaries vary by location, experience, and industry. In the UK, entry-level BAs typically earn £40-45k. With experience and proven performance, many professionals get promoted within their first year with significant salary increases. Mid-level BAs earn £45-65k, and senior BAs £65k-100k+. Your portfolio and interview performance matter most when securing roles.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Contact',
      icon: Mail,
      color: 'from-pink-500 to-purple-600',
      questions: [
        {
          id: 'q25',
          question: 'How do I contact support?',
          answer: 'Use the "Contact Us" page to send us a message. We respond within 24 hours. You can also use Verity AI Assistant (available 24/7) for immediate help with platform questions and navigation.'
        },
        {
          id: 'q26',
          question: 'Where is your office located?',
          answer: 'Our office is located at One Silk Street, Ancoats, Manchester M4 6LZ, United Kingdom. You can find us in the Colony co-working space in Manchester\'s vibrant Ancoats neighborhood.'
        },
        {
          id: 'q27',
          question: 'Do you offer live mentorship?',
          answer: 'Yes! You can request live mentorship support directly within the platform. Our mentors provide personalized feedback, career coaching, and guidance to complement your learning journey. These sessions offer human expertise when you need additional support beyond the AI-powered features.'
        },
        {
          id: 'q28',
          question: 'What if I encounter a bug or issue?',
          answer: 'Use Verity AI Assistant\'s "Report Issue" button (available on most pages) to submit bug reports or technical issues. Our team reviews all reports and responds quickly. You can also use the Contact Us page for urgent matters.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical & Access',
      icon: Play,
      color: 'from-indigo-500 to-purple-600',
      questions: [
        {
          id: 'q29',
          question: 'What browsers are supported?',
          answer: 'We recommend Chrome, Edge, Safari, or Firefox (latest versions). All features work best on Chrome and Edge. Make sure your browser has necessary permissions enabled (camera, microphone) for the full experience.'
        },
        {
          id: 'q30',
          question: 'Do I need a microphone for practice sessions?',
          answer: 'Some practice modes require a working microphone for the best experience. We recommend using quality headphones to optimize audio clarity. Our platform offers multiple interaction methods to accommodate different learning preferences and environments.'
        },
        {
          id: 'q31',
          question: 'Is my data secure?',
          answer: 'Yes! We use enterprise-grade security with advanced encryption and access control policies to protect your data. Your progress, submissions, and personal information are secure and only accessible to you and authorized admins. We never share your data with third parties.'
        },
        {
          id: 'q32',
          question: 'Can I access my work and deliverables?',
          answer: 'All your work, including meeting summaries, transcripts, requirements documents, and deliverables are accessible anytime within the platform. You have permanent access to review your portfolio of work, track your progress, and reference past projects as you continue your learning journey.'
        }
      ]
    },
    {
      id: 'subscription',
      title: 'Access & Subscription',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-600',
      questions: [
        {
          id: 'q33',
          question: 'How does private access work?',
          answer: 'Currently, we operate on a private access model where users are invited to join. This ensures quality and allows us to provide personalized support to each student. Request access via the "Get Started" button and we\'ll review your application.'
        },
        {
          id: 'q34',
          question: 'What subscription tiers are available?',
          answer: 'We offer multiple subscription tiers designed to match different learning needs and career goals. Your tier determines project access and additional features. All tiers include comprehensive learning content and practice capabilities. Contact us to discuss which tier is right for you.'
        },
        {
          id: 'q35',
          question: 'Can I upgrade or downgrade my subscription?',
          answer: 'Yes! Contact support through the Contact Us page to discuss changing your subscription tier. Upgrades take effect immediately. Your progress and completed work are never lost when changing tiers.'
        },
        {
          id: 'q36',
          question: 'Is there a refund policy?',
          answer: 'Contact our support team to discuss specific situations. We want every student to succeed and will work with you to ensure you get value from the platform.'
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap(cat => 
    cat.questions.map(q => ({ ...q, category: cat.title, categoryId: cat.id }))
  );

  const filteredQuestions = searchQuery 
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900" style={{ scrollbarGutter: 'stable' }}>
      {/* Header with Navigation - always render to keep layout stable */}
      {true && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button onClick={onBack} className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">BA WorkXP</span>
              </button>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={onBack}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    onBack && onBack();
                    setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    onBack && onBack();
                    setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => {
                    onBack && onBack();
                    setTimeout(() => document.getElementById('success')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Success Stories
                </button>
                <button className="font-semibold text-purple-600 cursor-default">FAQ</button>
                <button 
                  onClick={() => {
                    if (onContactClick) {
                      onContactClick();
                    }
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Contact Us
                </button>
              </nav>
              
              {/* CTA */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    try {
                      console.log('FAQView: Get Started clicked');
                      localStorage.setItem('openRequestAccess', '1');
                    } catch (e) {
                      console.warn('FAQView: failed to set openRequestAccess flag', e);
                    }
                    if (onBack) {
                      console.log('FAQView: navigating back to landing');
                      onBack();
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Add padding for fixed header */}
      <div className="pt-16">

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-full text-sm font-medium mb-6 text-white">
            <HelpCircle className="w-4 h-4 mr-2" />
            {showTabs ? 'Support Center' : 'Frequently Asked Questions'}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">How Can We Help You?</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Find answers to common questions about the platform, learning journey, and getting started
          </p>

          {/* Tab Navigation (only shown when embedded in Support Center) */}
          {showTabs && onTabChange && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => onTabChange('help')}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <BookOpen className="w-5 h-5" />
                Help Articles
              </button>
              <button
                onClick={() => onTabChange('faq')}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 bg-white text-purple-600 shadow-xl scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                FAQ
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/30 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md focus:border-white dark:focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-purple-500/50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            {/* Search Results */}
            {searchQuery && (
              <div className="mt-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl max-h-96 overflow-y-auto">
                {filteredQuestions.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {filteredQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setSearchQuery('');
                          setOpenCategories(prev => prev.includes(q.categoryId) ? prev : [...prev, q.categoryId]);
                          setOpenQuestion(q.id);
                        }}
                        className="w-full text-left p-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-600"
                      >
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">{q.category}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{q.question}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No results found. Try different keywords.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Categories Grid */}
      <section className="py-20 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {faqCategories.map((category) => (
              <div
                key={category.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 cursor-pointer ${
                  openCategories.includes(category.id) 
                    ? 'border-purple-500 dark:border-purple-600 shadow-2xl' 
                    : 'border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                {/* Category Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center`}>
                      <category.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className={`transition-transform duration-300 ${openCategories.includes(category.id) ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{category.questions.length} questions</p>
                </div>

                {/* Questions List */}
                {openCategories.includes(category.id) && (
                  <div className="p-6 space-y-4">
                    {category.questions.map((question) => (
                      <div key={question.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenQuestion(openQuestion === question.id ? null : question.id);
                          }}
                          className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 flex items-start justify-between"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white pr-4">{question.question}</span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-300 ${openQuestion === question.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {openQuestion === question.id && (
                          <div className="px-4 pb-4 pt-2">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{question.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (onContactClick) {
                    onContactClick();
                  } else if (onBack) {
                    onBack();
                    setTimeout(() => {
                      const contactBtn = document.querySelector('[aria-label="Contact Us"]') as HTMLElement;
                      contactBtn?.click();
                    }, 100);
                  }
                }}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2"
              >
                <Mail className="w-5 h-5" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      </div>
    </div>
  );
};

export default FAQView;

