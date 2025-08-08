import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'consulting' | 'training'>('consulting');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    program: '',
    experience: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: ["hello@techascendconsultancy.com", "careers@techascendconsultancy.com"],
      action: "Send Email"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: ["+44 20 1234 5678", "+44 20 1234 5679"],
      action: "Call Now"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: ["25 Canary Wharf", "London E14 5AB", "United Kingdom"],
      action: "Get Directions"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Office Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 4:00 PM"],
      action: "Schedule Meeting"
    }
  ];

  const trainingPrograms = [
    "Business Analyst (BA)",
    "Project Manager (PM)", 
    "Product Owner (PO)",
    "Scrum Master (SM)"
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 to-lime-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Ready to transform your business or launch your tech career? We're here to help you take the next step.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Contact Form */}
          <div className="mb-12 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Tab Selection */}
              <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('consulting')}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
                    activeTab === 'consulting'
                      ? 'bg-lime-500 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Consulting Inquiry
                </button>
                <button
                  onClick={() => setActiveTab('training')}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
                    activeTab === 'training'
                      ? 'bg-lime-500 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Training Application
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {activeTab === 'consulting' ? (
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="program" className="block text-sm font-semibold text-slate-700 mb-2">
                        Program of Interest *
                      </label>
                      <select
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select a program</option>
                        {trainingPrograms.map((program, index) => (
                          <option key={index} value={program}>{program}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {activeTab === 'training' && (
                  <div>
                    <label htmlFor="experience" className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Background/Experience
                    </label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., Marketing professional, Recent graduate, Career changer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                    {activeTab === 'consulting' ? 'Project Details' : 'Tell us about your goals'} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-colors resize-none"
                    placeholder={
                      activeTab === 'consulting' 
                        ? "Describe your project requirements, challenges, and timeline..."
                        : "Share your career goals and what you hope to achieve through our training program..."
                    }
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-lime-500 text-white py-4 px-6 rounded-lg hover:bg-lime-600 transition-colors font-semibold flex items-center justify-center"
                >
                  {activeTab === 'consulting' ? 'Submit Inquiry' : 'Apply Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-lime-500 mr-2" />
                  <span>We'll respond within 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-12 h-12 bg-lime-100 text-lime-600 rounded-lg mr-4 flex-shrink-0">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{info.title}</h3>
                      <div className="space-y-1 mb-4">
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-slate-600 text-sm">{detail}</p>
                        ))}
                      </div>
                      <button className="text-lime-600 hover:text-lime-700 font-medium text-sm transition-colors">
                        {info.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-slate-900 rounded-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Why Choose Tech Ascend?</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3" />
                  <span>95% graduate job placement rate</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3" />
                  <span>500+ professionals successfully trained</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3" />
                  <span>50+ successful client projects delivered</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3" />
                  <span>Industry-recognized certifications included</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h3>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-2">How long are the training programs?</h4>
                <p className="text-slate-600 text-sm">Our programs range from 8-14 weeks depending on the role. This includes both theoretical training and hands-on project work.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-2">Do you offer part-time training options?</h4>
                <p className="text-slate-600 text-sm">Yes, we offer both full-time and part-time options to accommodate working professionals looking to transition careers.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-2">What's included in the consulting services?</h4>
                <p className="text-slate-600 text-sm">Our consulting services include strategy development, implementation support, training, and ongoing guidance tailored to your specific needs.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-2">Is job placement guaranteed?</h4>
                <p className="text-slate-600 text-sm">While we can't guarantee placement, we have a 95% success rate and provide comprehensive career support including interview preparation and networking opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;