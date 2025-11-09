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
  BookOpen,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface FAQViewProps {
  onClose: () => void;
  onStartNow?: () => void;
  onShowFeatures?: () => void;
  onShowPricing?: () => void;
  onShowContact?: () => void;
}

const FAQView: React.FC<FAQViewProps> = ({ onClose, onStartNow, onShowFeatures, onShowPricing, onShowContact }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>(['getting-started', 'experience-portfolio', 'career']);
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
          question: 'What is BA WorkXP?',
          answer: 'BA WorkXP is a practice platform where you build real Business Analyst work experience by interviewing AI stakeholders, completing projects, and creating professional deliverables. You\'ll practice stakeholder interviews, requirements gathering, process analysis, user stories, and Scrum ceremonies - building a portfolio that proves you can do the job.'
        },
        {
          id: 'q2',
          question: 'How do I get started?',
          answer: 'Click "Start Free" to create your account. You can start immediately with free access to practice projects, stakeholder conversations, and portfolio building. Upgrade to Pro when you\'re ready for unlimited practice and advanced features.'
        },
        {
          id: 'q3',
          question: 'Do I need any prior BA experience?',
          answer: 'No prior Business Analysis experience is required. Whether you\'re completely new to BA or transitioning from another role, the platform guides you from fundamentals through advanced practice. You can start learning BA basics or jump straight into practice if you\'re already trained.'
        },
        {
          id: 'q4',
          question: 'How long does it take to build a portfolio?',
          answer: 'Most people build an interview-ready portfolio in 4-8 weeks, practicing 5-10 hours per week. The platform is self-paced - you control how quickly you progress. Some complete multiple projects in a few weeks, while others take longer. Your portfolio grows with every conversation and project.'
        }
      ]
    },
    {
      id: 'experience-portfolio',
      title: 'Building Experience',
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600',
      questions: [
        {
          id: 'q5',
          question: 'What work experience will I get?',
          answer: 'You\'ll gain hands-on experience in: interviewing stakeholders with conflicting needs, documenting requirements and user stories, creating process maps (As-Is and To-Be), writing acceptance criteria, participating in Scrum ceremonies, and managing BA projects. Every activity creates portfolio-ready deliverables you can show employers.'
        },
        {
          id: 'q6',
          question: 'What deliverables will I create for my portfolio?',
          answer: 'You\'ll build a professional portfolio including: stakeholder interview transcripts (30+ conversations showing elicitation skills), requirements documents and business cases, user stories with acceptance criteria, process maps and flow diagrams, project deliverables from 5+ realistic scenarios. All downloadable and portfolio-ready.'
        },
        {
          id: 'q7',
          question: 'Are the AI stakeholders realistic?',
          answer: 'Yes! AI stakeholders have unique personalities (skeptical, enthusiastic, technical, detail-oriented), realistic concerns based on their roles, and dynamic responses based on your questions. Many users report feeling genuinely nervous during their first sessions - that\'s how realistic they are. You\'re practicing with stakeholders who push back, have conflicting priorities, and need proper elicitation techniques.'
        },
        {
          id: 'q8',
          question: 'Can I practice with my own industry scenarios?',
          answer: 'Absolutely! Beyond our 5+ pre-built scenarios (E-Commerce, Healthcare, Finance, etc.), you can create custom projects with your own business context, objectives, and AI-generated stakeholders. Perfect for practicing scenarios relevant to your target industry or upcoming interviews.'
        }
      ]
    },
    {
      id: 'career',
      title: 'Getting Hired',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      questions: [
        {
          id: 'q9',
          question: 'How does this help me get a BA job?',
          answer: 'Employers hire based on proven experience, not certificates. With BA WorkXP, you\'ll have real work artifacts to show: interview transcripts demonstrating elicitation skills, requirements documents, process maps, user stories - actual deliverables proving you can do the job. This portfolio + your ability to discuss real project experience in interviews is what gets you hired.'
        },
        {
          id: 'q10',
          question: 'Do employers care more about experience or certificates?',
          answer: 'Experience wins every time. Employers want to see that you\'ve actually done BA work - interviewed stakeholders, handled conflicts, documented requirements, worked in Agile teams. Certificates show you studied theory; a portfolio shows you can execute. BA WorkXP gives you the experience employers are looking for, not just another certificate.'
        },
        {
          id: 'q11',
          question: 'What salary can I expect as a Business Analyst?',
          answer: 'In the UK, entry-level BAs typically earn £40-45k. With proven experience and strong interview performance, many professionals get promoted within their first year with salary increases to £45-65k. Mid-level BAs earn £45-65k, and senior BAs £65k-100k+. Your portfolio quality and interview confidence matter most when negotiating offers.'
        },
        {
          id: 'q12',
          question: 'Will I be ready for BA interviews?',
          answer: 'Yes! You\'ll have practiced the exact situations interviewers ask about: "Tell me about a time you handled a difficult stakeholder," "How do you gather requirements?" "Describe a complex project you worked on." You\'ll have 30+ real examples from your practice sessions - concrete stories with context, actions, and results. This is what separates you from candidates who only have theory.'
        }
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing & Access',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      questions: [
        {
          id: 'q13',
          question: 'How much does it cost?',
          answer: 'Start completely free with 3 projects and 15 stakeholder conversations. Upgrade to Pro for £149/month for unlimited projects, unlimited conversations, all scenarios, Scrum ceremony practice, and priority support. No long-term contracts - cancel anytime.'
        },
        {
          id: 'q14',
          question: 'Is there really free access?',
          answer: 'Yes! Free access includes 3 complete projects, 15 stakeholder conversations, AI coaching, and the ability to download your work. This is enough to build an initial portfolio. Upgrade to Pro when you want unlimited practice and access to all features.'
        },
        {
          id: 'q15',
          question: 'Can I cancel anytime?',
          answer: 'Absolutely. Pro subscription is month-to-month with no long-term commitment. Cancel anytime and you keep access until the end of your billing period. Your portfolio and completed work remain accessible even after cancelling.'
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
          id: 'q16',
          question: 'How do I get help if I\'m stuck?',
          answer: 'Use the "Contact Us" page and we respond within 24 hours. For immediate help, Verity AI Assistant is available 24/7 for questions about BA concepts, platform navigation, and guidance. Pro members can also request live mentorship sessions for personalized coaching.'
        },
        {
          id: 'q17',
          question: 'Where is BA WorkXP located?',
          answer: 'We\'re based in Manchester, UK at One Silk Street, Ancoats, Manchester M4 6LZ. Our office is in the Colony co-working space in Manchester\'s Ancoats neighborhood. We serve aspiring Business Analysts worldwide through our online platform.'
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
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Navigation - Same as Landing Page */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={onClose}>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BA WorkXP</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={onClose}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={onShowFeatures}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={onShowPricing}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                className="text-white font-medium border-b-2 border-purple-500"
              >
                FAQ
              </button>
              <button 
                onClick={onShowContact}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={onStartNow}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Start Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={onClose}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={onShowFeatures}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={onShowPricing}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Pricing
                </button>
                <button 
                  className="text-left text-white font-medium"
                >
                  FAQ
                </button>
                <button 
                  onClick={onShowContact}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Contact
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={onStartNow}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-center"
                >
                  Start Free
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 bg-gradient-to-r from-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-full text-sm font-medium mb-6 text-white">
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">How Can We Help You?</h1>
          <p className="text-base md:text-lg lg:text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Find answers to common questions about the platform, learning journey, and getting started
          </p>

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
      <section className="py-12 md:py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-base md:text-lg lg:text-xl text-purple-100 mb-8">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onShowContact}
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

