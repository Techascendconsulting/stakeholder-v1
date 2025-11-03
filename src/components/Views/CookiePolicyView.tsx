import React from 'react';
import { Shield, Cookie, BarChart3, Target, Settings, ArrowLeft } from 'lucide-react';

interface CookiePolicyViewProps {
  onBack?: () => void;
}

const CookiePolicyView: React.FC<CookiePolicyViewProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Cookie className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
              <p className="text-purple-100 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BA WorkXP ("we," "us," or "our") uses cookies and similar tracking technologies on our website 
              to enhance your experience, analyze site traffic, and personalize content. This Cookie Policy 
              explains what cookies are, how we use them, and your choices regarding their use.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By continuing to use our website, you consent to our use of cookies in accordance with this policy, 
              unless you have disabled them in your browser settings.
            </p>
          </section>

          {/* What are Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">What Are Cookies?</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your device when you visit a website. They are 
              widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cookies can be "persistent" (remain on your device until deleted or expired) or "session" (deleted 
              when you close your browser).
            </p>
          </section>

          {/* Types of Cookies We Use */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Types of Cookies We Use</h2>
            </div>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>1. Essential Cookies</span>
                  <span className="text-sm font-normal bg-purple-600 text-white px-3 py-1 rounded-full">Always Active</span>
                </h3>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for the website to function and cannot be switched off. They are 
                  usually only set in response to actions made by you (such as setting your privacy preferences, 
                  logging in, or filling in forms).
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Examples include:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Authentication cookies to keep you logged in</li>
                    <li>Security cookies to protect against fraud</li>
                    <li>Session cookies to maintain your preferences</li>
                  </ul>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>2. Functional Cookies</span>
                  <span className="text-sm font-normal bg-indigo-600 text-white px-3 py-1 rounded-full">Optional</span>
                </h3>
                <p className="text-gray-700 mb-3">
                  These cookies enable the website to provide enhanced functionality and personalization. They 
                  may be set by us or by third-party providers whose services we have added to our pages.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Examples include:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Language preferences</li>
                    <li>Theme settings (dark/light mode)</li>
                    <li>Accessibility preferences</li>
                  </ul>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>3. Analytics & Performance Cookies</span>
                    <span className="text-sm font-normal bg-blue-600 text-white px-3 py-1 rounded-full">Optional</span>
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Examples include:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on pages</li>
                    <li>Error messages and loading issues</li>
                  </ul>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-pink-50 border-l-4 border-pink-600 p-6 rounded-r-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-pink-600" />
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>4. Marketing & Advertising Cookies</span>
                    <span className="text-sm font-normal bg-pink-600 text-white px-3 py-1 rounded-full">Optional</span>
                  </h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies may be set through our site by our advertising partners to build a profile of 
                  your interests and show you relevant content on other sites.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Examples include:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Personalized advertisements</li>
                    <li>Social media integrations</li>
                    <li>Retargeting campaigns</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We work with trusted third parties who may also set cookies on our website. These include:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Cloud Infrastructure</p>
                    <p className="text-gray-600">Hosting and performance optimization services</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Analytics Providers</p>
                    <p className="text-gray-600">Tools to help us understand site usage and user behavior</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Payment Processors</p>
                    <p className="text-gray-600">Secure payment processing for subscriptions</p>
                  </div>
                </li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              These third parties may use cookies to collect information about your online activities across 
              different websites. We recommend reviewing their privacy policies to understand their practices.
            </p>
          </section>

          {/* Managing Cookies */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to accept or reject cookies. You can exercise this right by modifying your 
                browser settings to refuse cookies or by using our cookie consent banner.
              </p>
              <div className="bg-white rounded-lg p-6">
                <p className="font-semibold text-gray-900 mb-3">Browser Settings:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
                </ul>
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Disabling certain cookies may impact your experience and prevent some 
                  features from working properly.
                </p>
              </div>
            </div>
          </section>

          {/* Legal Basis - GDPR */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Legal Basis for Processing (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under the General Data Protection Regulation (GDPR), we process cookies based on:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Legitimate Interest:</p>
                <p className="text-gray-700">For essential and performance cookies to provide and improve our services.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Consent:</p>
                <p className="text-gray-700">For non-essential cookies, we obtain your explicit consent before placing them.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Contractual Necessity:</p>
                <p className="text-gray-700">For cookies required to fulfill our contractual obligations to you.</p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under data protection laws, including GDPR and CCPA, you have the following rights:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Access</p>
                <p className="text-gray-600">Know what cookies are set on your device</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Control</p>
                <p className="text-gray-600">Accept or reject non-essential cookies</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Delete</p>
                <p className="text-gray-600">Remove cookies through browser settings</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Complain</p>
                <p className="text-gray-600">Lodge a complaint with a supervisory authority</p>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for 
              legal, operational, or regulatory reasons. We will notify you of any material changes by posting 
              the new policy on this page and updating the "Last updated" date.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-gray-700">
                <strong>Your continued use of our website after any changes constitutes your acceptance of 
                the updated Cookie Policy.</strong>
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-4">Questions About Cookies?</h2>
              <p className="text-purple-100 mb-6">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-3 text-purple-100">
                <p><strong>Email:</strong> support@baworkxp.com</p>
                <p><strong>Subject:</strong> Cookie Policy Inquiry</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CookiePolicyView;
