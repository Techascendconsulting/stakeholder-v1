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
  Briefcase
} from 'lucide-react'
import LoginSignup from './LoginSignup'

const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (showAuth) {
    return <LoginSignup />
  }

  const features = [
    {
      icon: Users,
      title: "AI-Powered Stakeholder Interviews",
      description: "Practice with realistic AI stakeholders that respond like real business professionals",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      icon: FileText,
      title: "Professional Documentation",
      description: "Create industry-standard BRDs, user stories, and acceptance criteria",
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      icon: Target,
      title: "Real-World Scenarios",
      description: "Work on actual business cases from leading organizations",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      icon: Award,
      title: "Skill Certification",
      description: "Build a portfolio of completed projects to showcase your expertise",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "£0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "1 training project",
        "2 stakeholder meetings",
        "Basic project brief access",
        "Community support"
      ],
      limitations: [
        "Cannot save meeting notes",
        "Cannot change selected project",
        "Limited to 2 meetings total"
      ],
      buttonText: "Get Started Free",
      popular: false,
      color: "border-gray-200",
      gradient: "from-gray-50 to-gray-100"
    },
    {
      name: "Premium",
      price: "£99",
      period: "one-time",
      description: "For serious BA professionals",
      features: [
        "2 comprehensive projects",
        "Unlimited stakeholder meetings",
        "Full note-taking capabilities",
        "Professional deliverable templates",
        "Email support",
        "Progress tracking"
      ],
      limitations: [],
      buttonText: "Coming Soon",
      popular: true,
      color: "border-blue-500",
      gradient: "from-blue-50 to-purple-50"
    },
    {
      name: "Enterprise",
      price: "£399",
      period: "one-time",
      description: "Complete BA mastery program",
      features: [
        "All 5 training projects",
        "Unlimited everything",
        "Advanced analytics",
        "Priority support",
        "Custom scenarios",
        "Team collaboration tools",
        "Certification pathway"
      ],
      limitations: [],
      buttonText: "Coming Soon",
      popular: false,
      color: "border-purple-500",
      gradient: "from-purple-50 to-pink-50"
    }
  ]

  const testimonials = [
    {
      name: "Adunni Okafor",
      role: "Senior Business Analyst",
      company: "TechCorp",
      content: "This platform transformed my BA skills. The AI stakeholders feel incredibly realistic and helped me land my dream role.",
      rating: 5,
      image: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Chukwuemeka Nwosu",
      role: "Product Manager",
      company: "FinanceFirst",
      content: "The best investment I made in my career. The realistic scenarios prepared me perfectly for senior BA interviews.",
      rating: 5,
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Folake Adebayo",
      role: "Business Consultant",
      company: "Consulting Plus",
      content: "Comprehensive training that covers everything from stakeholder management to professional documentation. Highly recommended!",
      rating: 5,
      image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ]

  const stats = [
    { number: "5", label: "Real-World Projects", icon: Briefcase },
    { number: "25+", label: "AI Stakeholders", icon: Users },
    { number: "100+", label: "Hours of Content", icon: Clock },
    { number: "95%", label: "Success Rate", icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header - Kajabi Style */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BA Training Platform</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium">Reviews</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAuth(true)}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Kajabi Inspired */}
      <section className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                Trusted by 1000+ Business Analysts
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Master Business Analysis with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI-Powered Training</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                Practice stakeholder interviews, create professional deliverables, and build real-world BA skills through immersive scenarios based on actual business cases.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Start Free Training</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Professional business meeting"
                  className="rounded-2xl shadow-2xl w-full"
                />
                {/* Floating Cards */}
                <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Interview Complete</div>
                      <div className="text-sm text-gray-600">Stakeholder: James Walker</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">BRD Generated</div>
                      <div className="text-sm text-gray-600">Ready for review</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl transform rotate-3 scale-105 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Kajabi Style */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 font-medium">Trusted by professionals at leading companies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Microsoft</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Deloitte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">PwC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Accenture</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Kajabi Style */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to master Business Analysis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides hands-on experience with real-world scenarios and AI-powered feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "AI Stakeholder Interviews",
                description: "Practice with realistic AI stakeholders that respond like real business professionals with unique personalities and priorities."
              },
              {
                icon: FileText,
                title: "Professional Documentation",
                description: "Create industry-standard BRDs, user stories, and acceptance criteria using proven templates and methodologies."
              },
              {
                icon: Target,
                title: "Real-World Projects",
                description: "Work on actual business cases from leading organizations across different industries and complexity levels."
              },
              {
                icon: BarChart3,
                title: "Progress Tracking",
                description: "Monitor your skill development with detailed analytics and personalized feedback on your performance."
              },
              {
                icon: Award,
                title: "Skill Certification",
                description: "Build a portfolio of completed projects to showcase your expertise to potential employers."
              },
              {
                icon: MessageSquare,
                title: "Expert Support",
                description: "Get guidance from experienced Business Analysts and access to our community of professionals."
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Kajabi Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600">Master Business Analysis in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Choose Your Project",
                description: "Select from 5 real-world business scenarios across different industries and complexity levels.",
                image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                step: "02",
                title: "Interview Stakeholders",
                description: "Conduct realistic interviews with AI-powered stakeholders who respond like real business professionals.",
                image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                step: "03",
                title: "Create Deliverables",
                description: "Document requirements and create professional BRDs, user stories, and acceptance criteria.",
                image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Kajabi Style */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your career goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl border-2 p-8 relative ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => plan.name === 'Free' ? setShowAuth(true) : undefined}
                  disabled={plan.name !== 'Free'}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : plan.name === 'Free'
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Kajabi Style */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What our students say</h2>
            <p className="text-xl text-gray-600">Join thousands of professionals who've advanced their careers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Kajabi Style */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to advance your BA career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've mastered Business Analysis with our AI-powered training platform.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg inline-flex items-center space-x-2 shadow-lg"
          >
            <span>Start Free Training</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-blue-100 text-sm mt-4">No credit card required • Start in 30 seconds</p>
        </div>
      </section>

      {/* Footer - Clean Kajabi Style */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">BA Training Platform</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                The most comprehensive Business Analysis training platform. Master real-world skills with AI-powered scenarios.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer">
                  <span className="text-gray-600 font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer">
                  <span className="text-gray-600 font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer">
                  <span className="text-gray-600 font-bold">in</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="hover:text-gray-900 cursor-pointer">Features</li>
                <li className="hover:text-gray-900 cursor-pointer">Pricing</li>
                <li className="hover:text-gray-900 cursor-pointer">Projects</li>
                <li className="hover:text-gray-900 cursor-pointer">Certification</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="hover:text-gray-900 cursor-pointer">Help Center</li>
                <li className="hover:text-gray-900 cursor-pointer">Contact Us</li>
                <li className="hover:text-gray-900 cursor-pointer">Privacy Policy</li>
                <li className="hover:text-gray-900 cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2024 BA Training Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage