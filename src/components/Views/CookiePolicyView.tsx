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
              BA WorkXP ("we," "us," or "our") operated by Techascend Consulting Limited uses cookies and similar tracking technologies on our website 
              to enhance your experience, analyze site traffic, and personalize content. This Cookie Policy 
              explains what cookies are, how we use them, and your choices regarding their use.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This policy should be read in conjunction with our <a href="#" className="text-purple-600 underline">Privacy Policy</a> and 
              <a href="#" className="text-purple-600 underline"> Terms of Service</a>, which together govern your use of our platform.
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

          {/* Cookie Duration and Retention */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookie Duration and Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Different cookies have different lifespans:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Session Cookies</p>
                    <p className="text-gray-600">Temporary cookies that expire when you close your browser. We retain this data for up to 24 hours for security and fraud prevention.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Persistent Cookies</p>
                    <p className="text-gray-600">These cookies remain on your device for a set period (typically 30 days to 2 years) or until you delete them. We use these to remember your preferences and authentication status.</p>
                  </div>
                </li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              Data collected through cookies is retained in accordance with our data retention policy, which complies with applicable 
              data protection laws. We delete or anonymize personal data when it is no longer necessary for the purposes for which it was collected.
            </p>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Cookies and Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We work with trusted third parties who may also set cookies on our website. These include:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Cloud Infrastructure Providers</p>
                    <p className="text-gray-600">Vercel, Supabase, and other hosting/performance optimization services for secure data storage and delivery</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Analytics Providers</p>
                    <p className="text-gray-600">Tools to help us understand site usage and user behavior (may include Google Analytics, if implemented)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Payment Processors</p>
                    <p className="text-gray-600">Secure payment processing for subscriptions and transactions (Stripe, PayPal, or similar)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">AI and Voice Services</p>
                    <p className="text-gray-600">OpenAI and ElevenLabs for AI-powered features and text-to-speech functionality</p>
                  </div>
                </li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              These third parties may use cookies to collect information about your online activities across 
              different websites. We recommend reviewing their privacy policies to understand their practices. 
              We have data processing agreements in place with these providers to ensure your data is handled securely.
            </p>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We take the security of your data seriously:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Encryption</p>
                <p className="text-gray-700">All data transmitted through cookies is encrypted using industry-standard SSL/TLS protocols.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Storage Location</p>
                <p className="text-gray-700">Cookie data is stored securely on your device and on our encrypted servers. We use cloud infrastructure providers with GDPR-compliant data centers.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Access Controls</p>
                <p className="text-gray-700">Only authorized personnel with legitimate business needs can access cookie data, and all access is logged and monitored.</p>
              </div>
            </div>
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
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Note:</strong> Disabling certain cookies may impact your experience and prevent some 
                  features from working properly.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-4">
                  <p className="text-sm text-gray-700">
                    <strong>How to Withdraw Consent:</strong> You can withdraw your consent to non-essential cookies 
                    at any time by clearing your browser cookies for our website or contacting us at support@baworkxp.com
                  </p>
                </div>
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
              Under data protection laws, including GDPR, CCPA, and other applicable regulations, you have the following rights:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Right to Access</p>
                <p className="text-gray-600">Know what cookies are set on your device and what data they collect</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Right to Control</p>
                <p className="text-gray-600">Accept or reject non-essential cookies and withdraw consent at any time</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Right to Delete</p>
                <p className="text-gray-600">Remove cookies through browser settings or request deletion of your data</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Right to Rectification</p>
                <p className="text-gray-600">Correct any inaccurate personal data we hold about you</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Right to Data Portability</p>
                <p className="text-gray-600">Receive a copy of your data in a structured, commonly used format</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Right to Complain</p>
                <p className="text-gray-600">Lodge a complaint with a supervisory authority (GDPR) or attorney general (CCPA)</p>
              </div>
            </div>
          </section>

          {/* CCPA - Do Not Sell */}
          <section className="mb-12">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">California Consumer Privacy Act (CCPA)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are a California resident, you have additional rights under the CCPA:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Right to know what personal information is collected, used, and shared</li>
                <li>Right to delete personal information we have collected from you</li>
                <li>Right to opt-out of the "sale" of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                <strong>California consumers can exercise these rights by contacting us at support@baworkxp.com</strong>
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children without appropriate parental or guardian consent.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you are a parent or guardian and believe your child has provided personal information to us, 
                please contact us immediately at <strong>support@baworkxp.com</strong> so we can delete such 
                information and cancel any accounts created by the child.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data may be transferred to and processed in countries outside your country of residence, 
              including the United States and European Union member states. We ensure appropriate safeguards 
              are in place for such transfers, including:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700">Standard Contractual Clauses (SCCs) approved by the European Commission</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700">GDPR-compliant data processing agreements with all third-party providers</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700">Adequate protection measures as required by applicable data protection laws</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using our services, you consent to the transfer of your information to countries outside your 
              country of residence, subject to the safeguards described above.
            </p>
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
              <h2 className="text-3xl font-bold mb-4">Questions About Cookies or Your Privacy?</h2>
              <p className="text-purple-100 mb-6">
                If you have any questions, concerns, or wish to exercise your rights regarding our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-3 text-purple-100">
                <p><strong>Company:</strong> Techascend Consulting Limited</p>
                <p><strong>Email:</strong> support@baworkxp.com</p>
                <p><strong>Subject Line:</strong> Cookie Policy Inquiry / Privacy Request</p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-purple-100 text-sm">
                  <strong>Response Time:</strong> We aim to respond to all inquiries within 30 days as required by GDPR.
                </p>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Resources</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For more information about cookies and data protection, please refer to:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700">
                  <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                    All About Cookies
                  </a> - General information about cookies and how they work
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700">
                  <a href="https://gdpr-info.eu/" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                    GDPR Official Information Portal
                  </a> - European data protection regulation
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">•</span>
                <p className="text-gray-700">
                  <a href="https://oag.ca.gov/privacy/ccpa" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                    California Attorney General - CCPA
                  </a> - California consumer privacy rights
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CookiePolicyView;
