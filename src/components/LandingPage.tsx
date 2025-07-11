import React, { useState } from 'react'
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
  Zap
} from 'lucide-react'
import LoginSignup from './LoginSignup'

const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (showAuth) {
    return <LoginSignup />
  }

  const features = [
    {
      icon: Users,
      title: "AI-Powered Stakeholder Interviews",
      description: "Practice with realistic AI stakeholders that respond like real business professionals"
    },
    {
      icon: FileText,
      title: "Professional Documentation",
      description: "Create industry-standard BRDs, user stories, and acceptance criteria"
    },
    {
      icon: Target,
      title: "Real-World Scenarios",
      description: "Work on actual business cases from leading organizations"
    },
    {
      icon: Award,
      title: "Skill Certification",
      description: "Build a portfolio of completed projects to showcase your expertise"
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
      color: "border-gray-200"
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
      color: "border-blue-500"
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
      color: "border-purple-500"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Business Analyst",
      company: "TechCorp",
      content: "This platform transformed my BA skills. The AI stakeholders feel incredibly realistic.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "FinanceFirst",
      content: "The best investment I made in my career. Landed a senior BA role within 3 months.",
      rating: 5
    },
    {
      name: "Emma Williams",
      role: "Business Consultant",
      company: "Consulting Plus",
      content: "Comprehensive training that covers everything from stakeholder management to documentation.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BA Training Platform</h1>
                <p className="text-xs text-gray-600">Professional Development</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAuth(true)}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master Business Analysis with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI-Powered Training</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Practice stakeholder interviews, create professional deliverables, and build real-world BA skills 
              through immersive, AI-driven scenarios based on actual business cases.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Start Free Training</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">5</div>
              <div className="text-gray-600">Real-World Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
              <div className="text-gray-600">AI Stakeholders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">100+</div>
              <div className="text-gray-600">Hours of Content</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most comprehensive and realistic BA training available, designed by industry experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-200">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Path</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade as you advance in your BA career journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-sm border-2 ${plan.color} p-8 relative ${plan.popular ? 'scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
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
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.name === 'Free'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
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

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-xl text-gray-600">Join thousands of professionals who've advanced their BA careers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Become a Business Analysis Expert?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey today with our free training project and see why thousands of professionals trust our platform.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <span>Start Free Training Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BA Training Platform</span>
              </div>
              <p className="text-gray-400">
                Professional Business Analysis training for the modern workplace.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Training Projects</li>
                <li>AI Stakeholders</li>
                <li>Certification</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BA Training Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage