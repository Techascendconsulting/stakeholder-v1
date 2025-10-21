import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Users, Database, Mail, Globe, FileText } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Last Updated: October 21, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              BA Work XP ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our AI-powered business analysis training services.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              By accessing or using BA Work XP, you agree to the terms outlined in this Privacy Policy. If you do not agree with these terms, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">1. Personal Information You Provide</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, password, and profile details</li>
                  <li><strong>Payment Information:</strong> Billing details processed securely through third-party payment processors</li>
                  <li><strong>Communication Data:</strong> Messages, feedback, and support requests you send to us</li>
                  <li><strong>Professional Information:</strong> Career goals, learning preferences, and profile customization</li>
                </ul>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">2. Information Automatically Collected</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform, and navigation patterns</li>
                  <li><strong>Device Information:</strong> Device type, operating system, browser type, and IP address for security purposes</li>
                  <li><strong>Learning Analytics:</strong> Progress tracking, module completions, practice session data, and performance metrics</li>
                  <li><strong>Cookies and Tracking:</strong> Session data, preferences, and analytics (see Cookie Policy below)</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">3. AI Training Data</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Voice Meeting Transcripts:</strong> Audio and text transcripts from AI stakeholder conversations</li>
                  <li><strong>Practice Submissions:</strong> Requirements documentation, user stories, and deliverables you create</li>
                  <li><strong>Interaction Data:</strong> Your questions, responses, and engagement with AI-powered features</li>
                </ul>
                <p className="text-gray-600 mt-3 text-sm italic">
                  Note: All AI interaction data is used solely to improve your learning experience and is never shared with third parties for marketing purposes.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Provide and Improve Services</h3>
                  <p className="text-gray-600">Deliver personalized learning experiences, track your progress, and continuously improve our AI-powered training modules.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Account Management</h3>
                  <p className="text-gray-600">Create and maintain your account, process payments, and provide customer support.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Communication</h3>
                  <p className="text-gray-600">Send important updates, course announcements, and respond to your inquiries.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Security and Fraud Prevention</h3>
                  <p className="text-gray-600">Monitor for suspicious activity, prevent unauthorized access, and enforce our device-binding security policy.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold text-sm">5</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Analytics and Research</h3>
                  <p className="text-gray-600">Analyze usage patterns to improve platform performance and develop new features (all data is anonymized).</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sharing and Disclosure */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Sharing and Disclosure</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do not sell, rent, or trade your personal information. We may share your data only in the following circumstances:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-bold text-gray-900">Service Providers</h3>
                <p className="text-gray-600">Trusted third-party vendors (e.g., payment processors, cloud hosting, email services) who assist in operating our platform under strict confidentiality agreements.</p>
              </div>
              <div className="border-l-4 border-indigo-600 pl-4">
                <h3 className="font-bold text-gray-900">Legal Requirements</h3>
                <p className="text-gray-600">When required by law, court order, or government regulation, or to protect our rights, property, or safety.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900">Business Transfers</h3>
                <p className="text-gray-600">In the event of a merger, acquisition, or sale of assets, your information may be transferred (you will be notified beforehand).</p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-bold text-gray-900">With Your Consent</h3>
                <p className="text-gray-600">When you explicitly authorize us to share your information for a specific purpose.</p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Encryption
                </h3>
                <p className="text-gray-600 text-sm">All data transmitted between your device and our servers is encrypted using SSL/TLS protocols.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-blue-600" />
                  Secure Storage
                </h3>
                <p className="text-gray-600 text-sm">Your data is stored on secure servers with restricted access and regular security audits.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Access Controls
                </h3>
                <p className="text-gray-600 text-sm">Only authorized personnel with legitimate business needs can access your personal information.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                  Device Binding
                </h3>
                <p className="text-gray-600 text-sm">Your account is bound to your registered device to prevent unauthorized account sharing.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4 italic">
              While we use commercially reasonable security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700"><strong>Access:</strong> Request a copy of the personal information we hold about you</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700"><strong>Correction:</strong> Request correction of inaccurate or incomplete information</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700"><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700"><strong>Portability:</strong> Request a copy of your data in a machine-readable format</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700"><strong>Objection:</strong> Object to certain processing activities (e.g., marketing communications)</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700"><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              To exercise these rights, please contact us at <a href="mailto:privacy@baworkxp.com" className="text-purple-600 hover:text-purple-700 font-semibold">privacy@baworkxp.com</a>
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600 text-sm">Required for basic platform functionality, authentication, and security (cannot be disabled).</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-600 text-sm">Help us understand how users interact with our platform to improve performance and user experience.</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Preference Cookies</h3>
                <p className="text-gray-600 text-sm">Remember your settings, theme preferences, and customization choices.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              You can manage cookie preferences in your browser settings, but disabling certain cookies may affect platform functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you close your account, we will delete or anonymize your data within 90 days, except where retention is required by law.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              BA Work XP is not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately at <a href="mailto:privacy@baworkxp.com" className="text-purple-600 hover:text-purple-700 font-semibold">privacy@baworkxp.com</a>.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">International Data Transfers</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Your information may be transferred to and maintained on servers located outside your country, where data protection laws may differ. By using BA Work XP, you consent to such transfers. We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Significant changes will be communicated via email or platform notification. Your continued use of BA Work XP after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Contact Us</h2>
            </div>
            <p className="text-purple-100 mb-6 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-3 text-white">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <a href="mailto:privacy@baworkxp.com" className="hover:text-purple-200 transition-colors font-semibold">
                  privacy@baworkxp.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5" />
                <a href="https://www.baworkxp.com" className="hover:text-purple-200 transition-colors font-semibold">
                  www.baworkxp.com
                </a>
              </div>
            </div>
            <p className="text-purple-100 mt-6 text-sm">
              We are committed to resolving privacy concerns promptly and transparently.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;

