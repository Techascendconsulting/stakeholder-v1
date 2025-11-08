import React, { useState } from 'react'
import { X, CheckCircle, ArrowRight, Award, BarChart3, GraduationCap, Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface PricingViewProps {
  onClose: () => void
  onStartNow?: () => void
  onShowFeatures?: () => void
  onShowFAQ?: () => void
  onShowContact?: () => void
}

const PricingView: React.FC<PricingViewProps> = ({ onClose, onStartNow, onShowFeatures, onShowFAQ, onShowContact }) => {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                className="text-white font-medium border-b-2 border-purple-500"
              >
                Pricing
              </button>
              <button 
                onClick={onShowFAQ}
                className="text-gray-300 hover:text-white font-medium transition-colors"
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
                  className="text-left text-white font-medium"
                >
                  Pricing
                </button>
                <button 
                  onClick={onShowFAQ}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
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
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Simple, Transparent Pricing
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Start free. Upgrade when you're ready for unlimited practice.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {/* Free Plan */}
            <div className={`rounded-2xl p-8 border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Free
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Get started with BA practice
              </p>
              <div className="mb-6">
                <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>£0</span>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>3 complete projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>15 stakeholder conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Basic AI coaching</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Download your work</span>
                </li>
              </ul>
              <button
                onClick={onStartNow}
                className={`w-full py-3 rounded-xl font-semibold ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl p-8 border-2 border-purple-500 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">RECOMMENDED</span>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Pro
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Unlimited practice & full features
              </p>
              <div className="mb-6">
                <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>£19</span>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Unlimited projects & conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Advanced AI coaching & feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>All 5+ project scenarios</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Scrum ceremony practice</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Priority support</span>
                </li>
              </ul>
              <button
                onClick={onStartNow}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className={`text-center text-sm mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Cancel anytime • No credit card required
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 backdrop-blur-sm rounded-full border border-yellow-500/30 mb-6">
                <BarChart3 className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Compare Options</span>
              </div>
              
              <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                How BA WorkXP Compares
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                The smarter, more affordable way to break into Business Analysis
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full border-collapse rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800/50' : 'bg-gray-50 border-2 border-gray-200'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-gray-700' : 'bg-gradient-to-r from-purple-100 to-indigo-100 border-gray-300'}`}>
                    <th className={`text-left p-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Feature</th>
                    <th className={`text-center p-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Traditional Courses</th>
                    <th className={`text-center p-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bootcamps</th>
                    <th className={`text-center p-6 border-l-2 border-purple-500 ${isDark ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/30' : 'bg-gradient-to-br from-purple-200 to-indigo-200'}`}>
                      <div className="flex items-center justify-center gap-2">
                        <span className={isDark ? 'text-white' : 'text-purple-900'}>BA WorkXP</span>
                        <Award className="w-5 h-5 text-emerald-500" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                    <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Cost</td>
                    <td className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>£500 - £2,000</td>
                    <td className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>£5,000 - £15,000</td>
                    <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">£19/mo</div>
                    </td>
                  </tr>
                  <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                    <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Real Stakeholder Practice</td>
                    <td className="p-6 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Limited</div>
                    </td>
                    <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</span>
                      </div>
                    </td>
                  </tr>
                  <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                    <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Portfolio of Work</td>
                    <td className="p-6 text-center">
                      <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Basic exercises</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">1-2 projects</div>
                    </td>
                    <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">5+ Projects</span>
                      </div>
                    </td>
                  </tr>
                  <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                    <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Start Immediately</td>
                    <td className="p-6 text-center">
                      <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Wait for cohort</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Fixed schedule</div>
                    </td>
                    <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className={`rounded-2xl p-12 ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200'}`}>
              <h3 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ready to start building experience?
              </h3>
              <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Join 2,500+ aspiring BAs getting interview-ready
              </p>
              <button
                onClick={onStartNow}
                className="px-12 py-5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2"
              >
                Start Free Today
                <ArrowRight className="w-6 h-6" />
              </button>
              <p className={`text-sm mt-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default PricingView

