import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Team', href: '#team' },
      { name: 'Careers', href: '#careers' },
      { name: 'News & Press', href: '#news' },
      { name: 'Partner Network', href: '#partners' }
    ],
    services: [
      { name: 'Consulting Services', href: '#consulting' },
      { name: 'Digital Transformation', href: '#digital-transformation' },
      { name: 'Agile Coaching', href: '#agile-coaching' },
      { name: 'Business Analysis', href: '#business-analysis' },
      { name: 'Project Management', href: '#project-management' }
    ],
    training: [
      { name: 'Business Analyst Program', href: '#ba-training' },
      { name: 'Project Manager Program', href: '#pm-training' },
      { name: 'Product Owner Program', href: '#po-training' },
      { name: 'Scrum Master Program', href: '#sm-training' },
      { name: 'Work Experience Program', href: '#work-experience' }
    ],
    resources: [
      { name: 'Blog & Articles', href: '#blog' },
      { name: 'Whitepapers', href: '#whitepapers' },
      { name: 'Case Studies', href: '#case-studies' },
      { name: 'Webinars', href: '#webinars' },
      { name: 'Downloads', href: '#downloads' }
    ],
    support: [
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Student Portal', href: '#student-portal' },
      { name: 'Client Portal', href: '#client-portal' },
      { name: 'Support Center', href: '#support' }
    ]
  };

  const socialLinks = [
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, href: '#linkedin' },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: '#twitter' },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: '#facebook' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: '#instagram' }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-slate-300 text-lg">
                Get the latest insights on digital transformation, career development, 
                and industry trends delivered to your inbox.
              </p>
            </div>
            <div className="mt-8 lg:mt-0">
              <form className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition-colors font-semibold flex items-center"
                >
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </form>
              <p className="text-slate-400 text-sm mt-3">
                No spam, unsubscribe at any time. See our <a href="#privacy" className="text-lime-400 hover:text-lime-300">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-lime-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-lime-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Training */}
          <div>
            <h4 className="font-semibold text-white mb-4">Training</h4>
            <ul className="space-y-3">
              {footerLinks.training.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-lime-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-lime-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-lime-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-lime-400 mr-2 mt-1 flex-shrink-0" />
                <div className="text-slate-300 text-sm">
                  <div>25 Canary Wharf</div>
                  <div>London E14 5AB</div>
                  <div>United Kingdom</div>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-lime-400 mr-2 flex-shrink-0" />
                <span className="text-slate-300 text-sm">+44 20 1234 5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-lime-400 mr-2 flex-shrink-0" />
                <span className="text-slate-300 text-sm">hello@techascend.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications & Partners */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="text-center mb-8">
            <h4 className="font-semibold text-white mb-6">Accredited & Trusted</h4>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="w-24 h-12 bg-slate-700 rounded flex items-center justify-center">
                <span className="text-slate-400 text-xs">ISO 9001</span>
              </div>
              <div className="w-24 h-12 bg-slate-700 rounded flex items-center justify-center">
                <span className="text-slate-400 text-xs">Agile</span>
              </div>
              <div className="w-24 h-12 bg-slate-700 rounded flex items-center justify-center">
                <span className="text-slate-400 text-xs">PRINCE2</span>
              </div>
              <div className="w-24 h-12 bg-slate-700 rounded flex items-center justify-center">
                <span className="text-slate-400 text-xs">Scrum.org</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <h1 className="text-xl font-bold text-white mr-8">
                Tech Ascend <span className="text-lime-400">Consultancy</span>
              </h1>
              <p className="text-slate-400 text-sm">
                © 2025 Tech Ascend Consultancy Limited. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-slate-400 hover:text-lime-400 transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              
              {/* Legal Links */}
              <div className="flex space-x-4 text-sm">
                <a href="#privacy" className="text-slate-400 hover:text-lime-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#terms" className="text-slate-400 hover:text-lime-400 transition-colors">
                  Terms of Service
                </a>
                <a href="#cookies" className="text-slate-400 hover:text-lime-400 transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;