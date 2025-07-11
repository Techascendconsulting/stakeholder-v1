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
  Briefcase,
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
  Smartphone
} from 'lucide-react'
import LoginSignup from './LoginSignup'

const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  if (showAuth) {
    return <LoginSignup />
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Stakeholder Simulation",
      description: "Practice with hyper-realistic AI stakeholders that adapt to your questions and provide authentic business responses",
      image: "https://images.pexels.com/photos/2566581/pexels-photo-2566581.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "25+ Stakeholders",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Professional Documentation Suite",
      description: "Generate industry-standard BRDs, user stories, and acceptance criteria with AI-assisted templates",
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "15+ Templates",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Real Enterprise Scenarios",
      description: "Work on actual business cases from Fortune 500 companies across multiple industries",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "5 Industries",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Trophy,
      title: "Skill Certification Program",
      description: "Earn recognized certifications and build a portfolio that showcases your BA expertise",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200",
      stats: "Industry Recognized",
      color: "from-orange-500 to-red-500"
    }
  ]

  const testimonials = [
    {
      name: "Adunni Okafor",
      role: "Senior Business Analyst",
      company: "Microsoft",
      content: "This platform completely transformed my approach to stakeholder management. The AI interviews felt so real, I was genuinely nervous during my first session! Within 3 months, I landed a senior BA role at Microsoft.",
      rating: 5,
      image: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400",
      salary: "£85k → £120k",
      location: "London, UK"
    },
   {
  name: "Chukwuemeka Nwosu",
  role: "Lead Product Analyst",
  company: "Deloitte",
  content: "The real-world scenarios are incredible. I practiced on the exact type of digital transformation project I later worked on at Deloitte. The stakeholder personalities are so diverse and realistic.",
  rating: 5,
  image: "https://ckppwcsnkbrgekxtwccq.supabase.co/storage/v1/object/public/images//ChatGPT%20Image%20Jul%2011,%202025,%2007_55_26%20PM.png",
  salary: "£65k → £95k",
  location: "Manchester, UK"
},

    {
      name: "Folake Adebayo",
      role: "Business Transformation Consultant",
      company: "PwC",
      content: "I went from junior analyst to consultant in 8 months. The documentation templates and interview techniques I learned here are exactly what we use at PwC. Absolutely game-changing.",
      rating: 5,
      image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400",
      salary: "£45k → £78k",
      location: "Birmingham, UK"
    }
  ]

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Floating Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">BA Mastery</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105">Pricing</a>
            <a href="#success" className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105">Success Stories</a>
          </nav>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAuth(true)}
              className="text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Ultra Rich */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 animate-bounce shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Join 2,847+ Successful Business Analysts
              </div>
            
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Master
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient"> Business Analysis </span>
                <br />with AI-Powered Requirement Gathering
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                Practice with hyper-realistic AI stakeholders, work on real Fortune 500 scenarios, and build a portfolio that lands you your dream BA role. 
                <span className="font-semibold text-gray-900"> Average salary increase: £47k within 6 months.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <button
                  onClick={() => setShowAuth(true)}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3 shadow-2xl transform hover:scale-105 hover:shadow-blue-500/25"
                >
                  <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                  <span>Start Free Training</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3 transform hover:scale-105">
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Watch Success Stories</span>
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-gray-900 mb-1">94%</div>
                  <div className="text-sm text-gray-600">Job Placement</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-gray-900 mb-1">£47k</div>
                  <div className="text-sm text-gray-600">Avg. Increase</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-all duration-300">
                  <div className="text-3xl font-bold text-gray-900 mb-1">4.9★</div>
                  <div className="text-sm text-gray-600">Student Rating</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Product Demo */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative">
                {/* Main Product Screenshot */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 group">
                  <img
                    src="https://images.pexels.com/photos/7698715/pexels-photo-7698715.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="AI-Powered Business Analysis Training Platform"
                    className="w-full h-[600px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  
                  {/* Floating UI Elements */}
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-900">Live AI Interview</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Stakeholder: Sarah Chen, Head of Operations</div>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float delay-500">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">5 Stakeholders</div>
                        <div className="text-xs text-gray-600">Ready for interview</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-3xl transform rotate-3 scale-105 -z-10 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-3xl transform -rotate-2 scale-110 -z-20 blur-md"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos - Animated Carousel */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 font-medium text-lg">Our graduates work at leading companies worldwide</p>
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

      {/* Stats Section - Animated Counters */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200')] opacity-10 bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Transforming Careers Worldwide</h2>
            <p className="text-xl text-blue-100">Real results from real professionals</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group transform hover:scale-110 transition-all duration-300">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300">
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-blue-100 font-medium mb-1">{stat.label}</div>
                <div className="text-blue-200 text-sm">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Rich Visual Cards */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              Revolutionary Training Technology
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Everything you need to become a BA expert</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides the most realistic business analysis training experience available anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent`}></div>
                  
                  {/* Feature Icon */}
                  <div className="absolute top-6 left-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Stats Badge */}
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                    <div className="text-sm font-bold text-gray-900">{feature.stats}</div>
                  </div>
                  
                  {/* Feature Title Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{feature.title}</h3>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">{feature.description}</p>
                  <button className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors group-hover:translate-x-2 transform transition-transform duration-300">
                    Learn More
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - Interactive Testimonials */}
      <section id="success" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Success Stories That Inspire</h2>
            <p className="text-xl text-gray-600">Real professionals, real results, real career transformations</p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{testimonials[currentTestimonial].salary}</div>
                      <div className="text-sm text-gray-600">Salary Increase</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-2xl text-gray-700 leading-relaxed mb-8 italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="text-xl font-bold text-gray-900">{testimonials[currentTestimonial].name}</div>
                    <div className="text-blue-600 font-semibold">{testimonials[currentTestimonial].role}</div>
                    <div className="text-gray-600">{testimonials[currentTestimonial].company} • {testimonials[currentTestimonial].location}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Premium Cards */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Invest in Your Future</h2>
            <p className="text-xl text-gray-600">Choose the plan that accelerates your BA career</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 relative transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">£0</span>
                  <span className="text-gray-600 ml-2">/forever</span>
                </div>
                <p className="text-gray-600">Perfect for exploring BA fundamentals</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">1 comprehensive project</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">2 AI stakeholder interviews</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Basic project brief access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Community support</span>
                </div>
              </div>

              <button
                onClick={() => setShowAuth(true)}
                className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
              >
                Start Free Training
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-3xl border-2 border-blue-500 p-8 relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-sm font-semibold animate-pulse shadow-lg">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">£99</span>
                  <span className="text-gray-600 ml-2">/one-time</span>
                </div>
                <p className="text-gray-600">For serious BA professionals</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">2 comprehensive projects</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited AI interviews</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Full note-taking capabilities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Professional templates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Progress tracking</span>
                </div>
              </div>

              <button className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-3xl border-2 border-purple-500 p-8 relative transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">£399</span>
                  <span className="text-gray-600 ml-2">/one-time</span>
                </div>
                <p className="text-gray-600">Complete BA mastery program</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">All 5 training projects</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited everything</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Certification pathway</span>
                </div>
              </div>

              <button className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Rich Background */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Professional success"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-purple-600/95"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-8">
            Your BA Career Transformation Starts Today
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 2,847+ professionals who've accelerated their careers with our AI-powered training. 
            Average salary increase: £47k within 6 months.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-white text-blue-600 px-12 py-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-xl inline-flex items-center space-x-3 shadow-2xl transform hover:scale-105 hover:shadow-white/25"
          >
            <Rocket className="w-6 h-6" />
            <span>Start Free Training Now</span>
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-blue-100 text-sm mt-6">No credit card required • Start in 30 seconds • 94% job placement rate</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">BA Mastery Platform</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                The world's most advanced Business Analysis training platform. Transform your career with AI-powered scenarios and real-world projects.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'LinkedIn', 'YouTube'].map((social) => (
                  <div key={social} className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-110">
                    <span className="text-gray-400 font-bold text-sm">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                {['Features', 'Pricing', 'Projects', 'Certification', 'Success Stories'].map((item) => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors transform hover:translate-x-2 duration-300">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-4 text-gray-400">
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'Careers'].map((item) => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors transform hover:translate-x-2 duration-300">{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BA Mastery Platform. All rights reserved. Transforming careers worldwide.</p>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default LandingPage