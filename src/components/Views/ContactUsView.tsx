import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, Linkedin, Twitter, Facebook, Youtube, Instagram, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { submitContactForm } from '../../services/contactService';

interface ContactUsViewProps {
  onBack?: () => void;
  onFAQClick?: () => void;
}

const ContactUsView: React.FC<ContactUsViewProps> = ({ onBack, onFAQClick }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const result = await submitContactForm(formData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } else {
      setError(result.error || 'Failed to submit form. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const goHome = () => {
    if (onBack) {
      onBack();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 overflow-x-hidden">
      {console.log('ContactUsView: rendering fixed header and spacer')}
      {/* Header with Navigation - always rendered to keep layout stable */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg stable-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button onClick={goHome} className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">BA WorkXP</span>
              </button>
              
              {/* Navigation - keep items width stable; use active state instead of replacing element */}
              <nav className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={goHome}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    if (onBack) onBack();
                    setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    if (onBack) onBack();
                    setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => {
                    if (onBack) onBack();
                    setTimeout(() => document.getElementById('success')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  Success Stories
                </button>
                <button 
                  onClick={() => {
                    if (onFAQClick) {
                      onFAQClick();
                    }
                  }}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
                >
                  FAQ
                </button>
                <button
                  className="font-semibold text-purple-600 cursor-default"
                >
                  Contact Us
                </button>
              </nav>
              
              {/* Mobile Menu Toggle - Future Enhancement */}
              <div className="md:hidden">
                {/* Mobile menu button can go here */}
              </div>
            </div>
          </div>
        </header>
      
      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        {console.log('ContactUsView: applied pt-16 spacer under fixed header')}
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Get In Touch</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a message</h2>
              <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you within 24 hours</p>

              {isSubmitted && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">Message sent successfully!</h3>
                    <p className="text-sm text-green-700">We'll get back to you shortly.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information & Location */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Our Office</h4>
                      <p className="text-gray-600 leading-relaxed">
                        One Silk Street<br />
                        Ancoats,<br />
                        Manchester<br />
                        M4 6LZ
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Email Us</h4>
                      <a href="mailto:support@baworkxp.com" className="text-purple-600 hover:text-purple-700 transition-colors">
                        support@baworkxp.com
                      </a>
                      <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Call Us</h4>
                      <a href="tel:+441234567890" className="text-purple-600 hover:text-purple-700 transition-colors">
                        +44 (0) 123 456 7890
                      </a>
                      <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am-6pm GMT</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Connect With Us</h4>
                  <div className="flex space-x-3">
                    <a href="https://linkedin.com/company/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="LinkedIn">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="https://twitter.com/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="Twitter">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="https://facebook.com/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="Facebook">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="https://youtube.com/@baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="YouTube">
                      <Youtube className="w-5 h-5" />
                    </a>
                    <a href="https://instagram.com/baworkxp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 transform hover:scale-110" aria-label="Instagram">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Location Image - Colony Manchester */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="relative h-80">
                  <img
                    src="https://images.pexels.com/photos/1098982/pexels-photo-1098982.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Colony Manchester - One Silk Street"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Location Badge */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">Visit Our Office</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            One Silk Street<br />
                            Ancoats,<br />
                            Manchester M4 6LZ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Map Embed */}
                <div className="p-6">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=One+Silk+Street+Ancoats+Manchester+M4+6LZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-center py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Other Ways to Reach Us</h2>
            <p className="text-xl text-gray-600">Choose the method that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Support Portal */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Support Center</h3>
              <p className="text-gray-600 mb-6">
                Access our comprehensive help center with FAQs, tutorials, and guides.
              </p>
              <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center">
                Visit Support Center
                <Send className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Live Chat */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verity AI Assistant</h3>
              <p className="text-gray-600 mb-6">
                Get instant answers from our AI assistant. Available 24/7 for platform questions.
              </p>
              <button className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors flex items-center">
                Chat with Verity
                <Send className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Schedule Call */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Schedule a Call</h3>
              <p className="text-gray-600 mb-6">
                Book a time to speak with our team about your Business Analysis journey.
              </p>
              <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors flex items-center">
                Book a Call
                <Send className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-purple-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How do I get access to the platform?",
                answer: "Click 'Get Started' on the homepage and create your account. Access is currently by private invitation."
              },
              {
                question: "What's included in the learning journey?",
                answer: "You get comprehensive Business Analysis modules, AI-powered practice sessions, hands-on projects, and 24/7 support from Verity AI."
              },
              {
                question: "Can I practice with voice or just chat?",
                answer: "Both! Chat mode is available immediately. Voice mode unlocks after completing qualifying practice sessions."
              },
              {
                question: "How long does it take to complete?",
                answer: "The learning journey typically takes 6-8 weeks at a comfortable pace. You can progress faster or slower based on your schedule."
              },
              {
                question: "Do I get a certificate?",
                answer: "We focus on building real experience and a professional portfolio instead of certificates. While we recommend industry certifications like PSM 1 (Scrum Master) or BCS (Business Analysis), the truth is employers care far more about your practical experience than certificates. If you've genuinely done the work, it will show in interviews - that's what gets you hired."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-purple-200 transition-all duration-300">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      </div>
    </div>
  );
};

export default ContactUsView;

