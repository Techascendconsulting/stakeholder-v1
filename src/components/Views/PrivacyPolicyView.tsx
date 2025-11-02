import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-6 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
              <p className="text-gray-400 text-xs mt-1">Last Updated: October 21, 2025 | Effective Date: October 21, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Very Small Font, Dense Text */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white space-y-6 text-[10px] leading-tight text-gray-700">
          
          {/* IMPORTANT NOTICE */}
          <div className="bg-blue-50 border border-blue-200 p-3">
            <p className="font-bold text-blue-900 text-[11px] mb-1">IMPORTANT PRIVACY NOTICE</p>
            <p className="text-[9px] text-blue-800 leading-snug">
              This Privacy Policy ("Policy") describes how BA Work XP Limited, a company registered in the United Kingdom ("Company," "we," "us," or "our"), collects, uses, processes, stores, shares, transfers, and protects your personal information when you access, browse, register for, or use our website, mobile applications, platform, services, features, content, or any related services (collectively, the "Services"). This Policy applies to all users, visitors, subscribers, and any other persons who access or use the Services in any capacity. BY CREATING AN ACCOUNT, ACCESSING THE SERVICES, OR CLICKING "I ACCEPT" ON ANY REGISTRATION OR LOGIN PAGE, YOU EXPRESSLY ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THE COLLECTION, USE, DISCLOSURE, AND PROCESSING OF YOUR PERSONAL INFORMATION AS DESCRIBED IN THIS POLICY. IF YOU DO NOT AGREE TO THIS POLICY, YOU MUST IMMEDIATELY CEASE ALL USE OF THE SERVICES AND MUST NOT CREATE AN ACCOUNT.
            </p>
          </div>

          {/* 1. DEFINITIONS */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">1. DEFINITIONS AND INTERPRETATION</h2>
            <div className="space-y-1 ml-2">
              <p>1.1 For the purposes of this Policy, the following terms shall have the meanings set forth below:</p>
              <p className="ml-3">(a) <strong>"Personal Data"</strong> or <strong>"Personal Information"</strong> means any information relating to an identified or identifiable natural person ("Data Subject"). An identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that natural person;</p>
              <p className="ml-3">(b) <strong>"Processing"</strong> means any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure, or destruction;</p>
              <p className="ml-3">(c) <strong>"Data Controller"</strong> means the natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the Processing of Personal Data. For the purposes of this Policy, the Company is the Data Controller;</p>
              <p className="ml-3">(d) <strong>"Data Processor"</strong> means a natural or legal person, public authority, agency, or other body which processes Personal Data on behalf of the Data Controller;</p>
              <p className="ml-3">(e) <strong>"GDPR"</strong> means the General Data Protection Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the Processing of Personal Data and on the free movement of such data, as amended, replaced, or superseded from time to time, together with any national implementing laws, regulations, and secondary legislation;</p>
              <p className="ml-3">(f) <strong>"UK GDPR"</strong> means the GDPR as it forms part of the law of England and Wales, Scotland, and Northern Ireland by virtue of section 3 of the European Union (Withdrawal) Act 2018 and as amended by the Data Protection, Privacy and Electronic Communications (Amendments etc.) (EU Exit) Regulations 2019;</p>
              <p className="ml-3">(g) <strong>"DPA 2018"</strong> means the Data Protection Act 2018, as amended or replaced from time to time;</p>
              <p className="ml-3">(h) <strong>"Cookies"</strong> means small text files that are placed on your Device when you visit our website or use our Services, which are used to store information about your preferences, session state, and usage patterns;</p>
              <p className="ml-3">(i) <strong>"Device"</strong> means any computer, smartphone, tablet, or other electronic device used to access the Services;</p>
              <p className="ml-3">(j) <strong>"Third Party"</strong> means any natural or legal person, public authority, agency, or body other than the Data Subject, Data Controller, Data Processor, and persons who, under the direct authority of the Data Controller or Data Processor, are authorized to process Personal Data.</p>
            </div>
          </section>

          {/* 2. SCOPE AND APPLICATION */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">2. SCOPE AND APPLICATION OF THIS POLICY</h2>
            <div className="space-y-1 ml-2">
              <p>2.1 This Policy applies to all Personal Data collected by the Company through: (a) our website located at www.baworkxp.com and all associated subdomains; (b) our mobile applications available on iOS and Android platforms; (c) our web-based platform and learning management system; (d) email communications, newsletters, and marketing materials; (e) customer support channels including email, chat, and phone; (f) social media pages and profiles operated by the Company; (g) surveys, questionnaires, and feedback forms; (h) in-person events, webinars, and training sessions; (i) business partnerships and affiliate relationships; and (j) any other means by which you interact with the Company or the Services.</p>
              <p>2.2 This Policy does not apply to: (a) information collected offline or through channels not operated by the Company; (b) third-party websites, applications, or services that may be linked to or from our Services, even if accessible through our platform; (c) anonymized or aggregated data that cannot be used to identify you individually; or (d) publicly available information that you have made available through public forums, social media, or other public channels.</p>
              <p>2.3 By using the Services, you acknowledge that the Company operates globally and your Personal Data may be processed in countries other than your country of residence. You consent to the transfer, storage, and processing of your Personal Data in the United Kingdom and any other country where the Company or its service providers maintain facilities, even if such countries do not provide the same level of data protection as your home country.</p>
            </div>
          </section>

          {/* 3. INFORMATION WE COLLECT */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">3. CATEGORIES OF PERSONAL DATA WE COLLECT</h2>
            <div className="space-y-1 ml-2">
              <p>3.1 <strong>Information You Provide Directly:</strong></p>
              <p className="ml-3">(a) <strong>Account Registration Data:</strong> When you create an account, we collect your full name, email address, password (stored in encrypted format), country of residence, phone number (optional), professional title or role, company or organization name (if applicable), years of experience in business analysis, learning objectives, and any other information you choose to provide in your profile. You represent and warrant that all information provided is accurate, current, and complete.</p>
              <p className="ml-3">(b) <strong>Payment and Billing Information:</strong> When you purchase a Subscription or make a payment, we collect billing name, billing address (including street address, city, state/province, postal code, and country), payment card information (card number, expiration date, CVV/security code, and cardholder name), electronic wallet addresses, or other payment method identifiers, and transaction history. Payment card information is processed and stored by our third-party payment processors in accordance with Payment Card Industry Data Security Standard (PCI DSS) requirements. We do not store complete payment card numbers on our servers.</p>
              <p className="ml-3">(c) <strong>Profile and Preferences Data:</strong> Information about your learning preferences, career goals, areas of interest, notification settings, language preferences, accessibility requirements, theme preferences (light/dark mode), and any other customization options you select within the Services.</p>
              <p className="ml-3">(d) <strong>Communications Data:</strong> The content of any emails, messages, chat conversations, support tickets, feedback, reviews, testimonials, survey responses, or other communications you send to us or through the Services, including metadata such as timestamps, IP addresses, and device information associated with such communications.</p>
              <p className="ml-3">(e) <strong>User-Generated Content:</strong> Any content you create, upload, post, or submit through the Services, including but not limited to: user stories, acceptance criteria, requirements documentation, process maps, diagrams, meeting notes, interview transcripts, practice session responses, assignment submissions, project deliverables, comments, forum posts, and any other materials or information you contribute.</p>
              <p className="ml-3">(f) <strong>Identity Verification Data:</strong> In certain circumstances, we may request government-issued identification documents (passport, driver's license, national ID card), proof of address (utility bills, bank statements), or other verification documents to confirm your identity, prevent fraud, or comply with legal obligations. Such documents are processed solely for verification purposes and stored securely with restricted access.</p>
              
              <p className="mt-2">3.2 <strong>Information Collected Automatically:</strong></p>
              <p className="ml-3">(a) <strong>Device and Hardware Information:</strong> We collect detailed information about the Device you use to access the Services, including: Device type and model; operating system type and version; processor type, speed, and architecture; graphics processing unit (GPU) vendor and model; RAM capacity; screen resolution and color depth; installed fonts; system language and timezone; browser type, version, and plugins; unique Device identifiers including hardware serial numbers, MAC addresses, and mobile device identifiers (IMEI, MEID, ESN); motherboard serial number; BIOS version; and hardware fingerprints generated from the combination of these characteristics. This information is used for security purposes, device binding, account sharing prevention, and service optimization.</p>
              <p className="ml-3">(b) <strong>Network and Connection Data:</strong> IP address (both IPv4 and IPv6); Internet Service Provider (ISP); approximate geographic location derived from IP address (country, region, city, postal code); network connection type (WiFi, cellular, ethernet); connection speed; network latency; DNS settings; and proxy or VPN detection indicators.</p>
              <p className="ml-3">(c) <strong>Usage and Activity Data:</strong> Detailed logs of your interactions with the Services, including: pages visited; features accessed; buttons clicked; forms submitted; search queries entered; time spent on each page or feature; navigation paths; scroll depth; mouse movements and click patterns; video playback data (play, pause, seek, completion rate); download activities; module completion status; quiz or assessment responses and scores; practice session recordings and transcripts; voice meeting audio recordings and transcripts; AI interaction logs; error messages encountered; application crashes or freezes; and performance metrics such as page load times and resource consumption.</p>
              <p className="ml-3">(d) <strong>Session and Authentication Data:</strong> Session IDs; authentication tokens; login timestamps; logout timestamps; session duration; concurrent session detection; multi-device access attempts; failed login attempts; password reset requests; security challenge responses; and two-factor authentication codes (if enabled).</p>
              <p className="ml-3">(e) <strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, pixel tags, local storage, and similar tracking technologies to collect information about your interactions with the Services. This includes: session cookies for authentication and security; persistent cookies for user preferences and settings; analytics cookies to understand usage patterns; advertising cookies for targeted marketing (with your consent where required); and third-party cookies from analytics providers and social media platforms.</p>
              
              <p className="mt-2">3.3 <strong>Information from Third-Party Sources:</strong></p>
              <p className="ml-3">(a) <strong>Social Media and Single Sign-On (SSO):</strong> If you choose to register or log in using a third-party social media account, we receive certain information from that platform in accordance with their authorization protocols. This may include your name, email address, profile picture, public profile information, friends list, and any other data you have authorized the platform to share. We do not control the information shared by these platforms and recommend reviewing their privacy policies.</p>
              <p className="ml-3">(b) <strong>Payment Processors:</strong> We receive transaction confirmation data, payment status, fraud detection indicators, and limited payment information from our payment processors necessary to complete transactions and maintain payment records.</p>
              <p className="ml-3">(c) <strong>Analytics and Advertising Partners:</strong> We receive aggregated and anonymized analytics data, demographic information, interest categories, and behavioral insights from third-party analytics providers to improve our Services and marketing effectiveness.</p>
              <p className="ml-3">(d) <strong>Publicly Available Sources:</strong> We may supplement our data with information obtained from publicly available sources such as professional networking sites, company websites, professional directories, and public databases to verify information, prevent fraud, or enhance our understanding of our users.</p>
              
              <p className="mt-2">3.4 <strong>Sensitive Personal Data:</strong> We do not intentionally collect or process "sensitive personal data" (also known as "special categories of data") such as racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data for identification purposes, health data, or data concerning sex life or sexual orientation. However, certain User-Generated Content or communications may inadvertently contain such information. If you choose to provide such information, you explicitly consent to its processing for the purposes described in this Policy. You should avoid including sensitive personal data in your communications or submissions unless absolutely necessary.</p>
            </div>
          </section>

          {/* 4. HOW WE USE YOUR DATA */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">4. PURPOSES AND LEGAL BASES FOR PROCESSING PERSONAL DATA</h2>
            <div className="space-y-1 ml-2 text-[9px]">
              <p>4.1 We process your Personal Data for the following purposes, based on the legal bases indicated:</p>
              
              <p className="mt-2"><strong>(a) Performance of Contract:</strong> To provide, maintain, and improve the Services in accordance with our Terms of Service, including:</p>
              <p className="ml-5">• Creating and managing your account, authenticating your identity, and maintaining account security;</p>
              <p className="ml-5">• Processing payments, managing subscriptions, and maintaining billing records;</p>
              <p className="ml-5">• Delivering the educational content, AI-powered features, practice sessions, and all other functionalities you have purchased;</p>
              <p className="ml-5">• Tracking your learning progress, recording module completions, and generating completion certificates;</p>
              <p className="ml-5">• Storing and managing your User-Generated Content, deliverables, and portfolio items;</p>
              <p className="ml-5">• Providing customer support, responding to inquiries, and resolving technical issues;</p>
              <p className="ml-5">• Enforcing our Terms of Service, including device binding, account sharing prevention, and violation detection;</p>
              <p className="ml-5">• Sending transactional emails such as purchase confirmations, password resets, and account notifications.</p>
              
              <p className="mt-2"><strong>(b) Legitimate Interests:</strong> To pursue our legitimate business interests, provided such interests are not overridden by your data protection rights, including:</p>
              <p className="ml-5">• Analyzing usage patterns and user behavior to improve the Services, optimize user experience, and develop new features;</p>
              <p className="ml-5">• Conducting research and development, testing new features, and performing A/B testing;</p>
              <p className="ml-5">• Detecting, preventing, and investigating fraud, security breaches, account sharing, unauthorized access, and other illegal or harmful activities;</p>
              <p className="ml-5">• Monitoring platform performance, identifying and fixing bugs, and ensuring system stability;</p>
              <p className="ml-5">• Training and improving our AI models, natural language processing algorithms, and machine learning systems using anonymized data;</p>
              <p className="ml-5">• Personalizing content, recommendations, and learning paths based on your interests and progress;</p>
              <p className="ml-5">• Managing business operations, financial reporting, and internal record-keeping;</p>
              <p className="ml-5">• Protecting our legal rights, property, and safety, and that of our users and the public;</p>
              <p className="ml-5">• Enforcing our policies and preventing terms violations;</p>
              <p className="ml-5">• Analyzing market trends, competitive landscape, and user demographics to inform business strategy.</p>
              
              <p className="mt-2"><strong>(c) Consent:</strong> Where we have obtained your explicit consent, including:</p>
              <p className="ml-5">• Sending marketing communications, newsletters, promotional offers, and product updates via email, SMS, or push notifications;</p>
              <p className="ml-5">• Displaying personalized advertisements on our platform and third-party websites;</p>
              <p className="ml-5">• Using non-essential cookies and tracking technologies for analytics and advertising purposes;</p>
              <p className="ml-5">• Recording audio from voice meetings and practice sessions for quality assurance and feature improvement;</p>
              <p className="ml-5">• Sharing your testimonials, success stories, or case studies in our marketing materials (with your name or anonymized);</p>
              <p className="ml-5">• Processing sensitive personal data if inadvertently provided by you;</p>
              <p className="ml-5">• Any other processing where explicit consent is required by applicable law.</p>
              <p className="ml-4 mt-1">You may withdraw your consent at any time by contacting support@baworkxp.com or adjusting your account settings. Withdrawal of consent does not affect the lawfulness of processing based on consent before withdrawal.</p>
              
              <p className="mt-2"><strong>(d) Legal Obligations:</strong> To comply with legal and regulatory requirements, including:</p>
              <p className="ml-5">• Complying with court orders, subpoenas, legal processes, and law enforcement requests;</p>
              <p className="ml-5">• Meeting tax, accounting, and financial reporting obligations;</p>
              <p className="ml-5">• Complying with data protection laws, consumer protection regulations, and other applicable legislation;</p>
              <p className="ml-5">• Cooperating with regulatory investigations, audits, and inquiries;</p>
              <p className="ml-5">• Maintaining records as required by law;</p>
              <p className="ml-5">• Reporting suspected fraud, money laundering, or other criminal activity to authorities;</p>
              <p className="ml-5">• Enforcing our legal rights in litigation, arbitration, or other dispute resolution proceedings.</p>
              
              <p className="mt-2"><strong>(e) Vital Interests:</strong> To protect the vital interests of you or another natural person, such as preventing serious harm, injury, or death, or responding to emergencies.</p>
            </div>
          </section>

          {/* 5. DATA SHARING AND DISCLOSURE */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">5. SHARING AND DISCLOSURE OF PERSONAL DATA</h2>
            <div className="space-y-1 ml-2 text-[9px]">
              <p>5.1 We do not sell, rent, lease, or trade your Personal Data to third parties for their marketing purposes. However, we may share your Personal Data with the following categories of recipients under the circumstances described:</p>
              
              <p className="mt-2"><strong>(a) Service Providers and Data Processors:</strong> We engage trusted third-party companies and individuals to perform functions on our behalf, including:</p>
              <p className="ml-5">• <strong>Cloud Infrastructure:</strong> Third-party cloud service providers for hosting, data storage, and computing resources;</p>
              <p className="ml-5">• <strong>Payment Processing:</strong> Third-party payment processors and gateways for secure payment processing and fraud prevention;</p>
              <p className="ml-5">• <strong>Email Services:</strong> Third-party email service providers for transactional and marketing email delivery;</p>
              <p className="ml-5">• <strong>Customer Support:</strong> Third-party customer support platforms for managing support tickets and live chat;</p>
              <p className="ml-5">• <strong>Analytics and Monitoring:</strong> Third-party analytics platforms and monitoring tools for usage analytics, error tracking, and performance monitoring;</p>
              <p className="ml-5">• <strong>AI and Machine Learning:</strong> Third-party AI service providers for natural language processing, text generation, voice synthesis, speech recognition, and AI-powered features;</p>
              <p className="ml-5">• <strong>Content Delivery:</strong> Third-party content delivery networks (CDNs) for content delivery and DDoS protection;</p>
              <p className="ml-5">• <strong>Marketing and Advertising:</strong> Third-party advertising platforms for targeted marketing campaigns and promotional activities;</p>
              <p className="ml-5">• <strong>CRM and Sales:</strong> Third-party customer relationship management (CRM) platforms for managing customer relationships and sales processes;</p>
              <p className="ml-5">• <strong>Authentication:</strong> Third-party authentication services for user authentication and identity management;</p>
              <p className="ml-5">• <strong>Video Hosting:</strong> Third-party video hosting platforms for hosting educational videos and multimedia content;</p>
              <p className="ml-5">• <strong>Compliance and Security:</strong> Third-party identity verification services, fraud detection tools, and security monitoring platforms.</p>
              <p className="ml-4 mt-1">These service providers are contractually obligated to process your Personal Data only in accordance with our instructions, to implement appropriate security measures, and to comply with applicable data protection laws. They are prohibited from using your Personal Data for their own purposes.</p>
              
              <p className="mt-2"><strong>(b) Business Partners and Affiliates:</strong> We may share limited Personal Data with:</p>
              <p className="ml-5">• <strong>Educational Institutions:</strong> If you access the Services through a partnership with a university, bootcamp, or training provider, we may share your enrollment status, progress data, and completion records with that institution;</p>
              <p className="ml-5">• <strong>Corporate Clients:</strong> If your employer or organization has purchased enterprise licenses, we may share usage statistics, progress reports, and aggregated analytics with authorized personnel at that organization;</p>
              <p className="ml-5">• <strong>Affiliate Partners:</strong> If you were referred by an affiliate, we may share information about your registration and activity for commission calculation purposes;</p>
              <p className="ml-5">• <strong>Joint Ventures:</strong> If we enter into joint ventures or co-marketing arrangements, we may share relevant data with our partners subject to confidentiality agreements.</p>
              
              <p className="mt-2"><strong>(c) Legal and Regulatory Authorities:</strong> We may disclose your Personal Data to government authorities, law enforcement agencies, courts, regulators, or other third parties where we believe in good faith that disclosure is:</p>
              <p className="ml-5">• Required by law, regulation, legal process, or governmental request;</p>
              <p className="ml-5">• Necessary to comply with a court order, subpoena, warrant, or other legal obligation;</p>
              <p className="ml-5">• Necessary to enforce our Terms of Service, Privacy Policy, or other agreements;</p>
              <p className="ml-5">• Necessary to investigate, prevent, or take action regarding suspected or actual illegal activities, fraud, security breaches, or violations of our policies;</p>
              <p className="ml-5">• Necessary to protect the rights, property, or safety of the Company, our users, or the public;</p>
              <p className="ml-5">• Required for national security or law enforcement purposes;</p>
              <p className="ml-5">• Necessary in connection with litigation, arbitration, mediation, or other dispute resolution proceedings.</p>
              
              <p className="mt-2"><strong>(d) Business Transfers:</strong> In the event of a merger, acquisition, reorganization, bankruptcy, sale of assets, or other business transaction involving the Company, your Personal Data may be transferred, sold, or assigned to the successor entity or acquiring party. You will be notified via email and/or prominent notice on our website of any such change in ownership or control of your Personal Data, and your rights regarding such transfer. The successor entity will be bound by this Policy or will provide you with notice of any changes and, where required by law, obtain your consent.</p>
              
              <p className="mt-2"><strong>(e) Public Forums and Social Features:</strong> If you choose to post content in public areas of the Services (such as forums, comments, or community features), such content and any Personal Data included therein may be visible to other users and the public. Exercise caution and discretion when sharing Personal Data in public areas.</p>
              
              <p className="mt-2"><strong>(f) With Your Consent:</strong> We may share your Personal Data with third parties not described above if we have obtained your explicit consent to do so, such as when you authorize us to share your information with a specific partner or for a specific purpose.</p>
              
              <p className="mt-2">5.2 <strong>Anonymized and Aggregated Data:</strong> We may share anonymized, aggregated, or de-identified data that cannot be used to identify you personally with third parties for any purpose, including research, analytics, marketing, and business intelligence. Such data is not considered Personal Data and is not subject to the restrictions in this Policy.</p>
            </div>
          </section>

          {/* 6. INTERNATIONAL DATA TRANSFERS */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">6. INTERNATIONAL DATA TRANSFERS</h2>
            <div className="space-y-1 ml-2 text-[9px]">
              <p>6.1 <strong>Global Operations:</strong> BA Work XP operates globally, and your Personal Data may be transferred to, processed in, and stored in countries other than your country of residence, including the United Kingdom, the United States, and any other country where we or our service providers maintain facilities or data centers. These countries may have data protection laws that differ from and may be less protective than the laws of your jurisdiction.</p>
              <p>6.2 <strong>Adequate Protection:</strong> When we transfer Personal Data from the European Economic Area (EEA), the United Kingdom, or Switzerland to countries that have not been deemed by the European Commission or UK Information Commissioner's Office to provide an adequate level of data protection, we implement appropriate safeguards to protect your Personal Data, including:</p>
              <p className="ml-3">(a) <strong>Standard Contractual Clauses (SCCs):</strong> We enter into European Commission-approved Standard Contractual Clauses (also known as Model Clauses) with our service providers and partners located in third countries. These clauses provide contractual guarantees regarding the protection of your Personal Data;</p>
              <p className="ml-3">(b) <strong>UK International Data Transfer Agreement/Addendum:</strong> For transfers from the UK, we use the UK International Data Transfer Agreement or the UK International Data Transfer Addendum to the SCCs as applicable;</p>
              <p className="ml-3">(c) <strong>Binding Corporate Rules (BCRs):</strong> Some of our service providers have implemented BCRs approved by data protection authorities;</p>
              <p className="ml-3">(d) <strong>Consent:</strong> In some cases, we may ask for your explicit consent to transfer your Personal Data to a third country;</p>
              <p className="ml-3">(e) <strong>Derogations:</strong> In limited circumstances, we may transfer Personal Data based on derogations provided for under applicable law, such as when the transfer is necessary for the performance of a contract between you and us, or when you have explicitly consented to the proposed transfer after being informed of the possible risks.</p>
              <p>6.3 <strong>US Privacy Shield (Historical):</strong> Although the EU-US and Swiss-US Privacy Shield frameworks have been invalidated by the Court of Justice of the European Union, we maintain robust data protection practices and rely on alternative transfer mechanisms such as SCCs for transatlantic data transfers.</p>
              <p>6.4 By using the Services, you acknowledge and consent to the transfer, storage, and processing of your Personal Data in any country where we operate, as described in this Section 6.</p>
            </div>
          </section>

          {/* 7. DATA RETENTION */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">7. DATA RETENTION AND DELETION</h2>
            <div className="space-y-1 ml-2 text-[9px]">
              <p>7.1 <strong>Retention Principles:</strong> We retain your Personal Data for as long as necessary to fulfill the purposes for which it was collected, comply with legal and regulatory obligations, resolve disputes, enforce our agreements, maintain business records, and protect our legal rights. The retention period varies depending on the type of data and the purposes for which it is processed.</p>
              <p>7.2 <strong>Specific Retention Periods:</strong></p>
              <p className="ml-3">(a) <strong>Active Account Data:</strong> We retain all Personal Data associated with your account for as long as your account remains active and for a period of ninety (90) days after account closure or Subscription expiration, unless you request earlier deletion or longer retention is required by law.</p>
              <p className="ml-3">(b) <strong>Payment and Billing Records:</strong> We retain payment transaction data, invoices, and billing information for a minimum of seven (7) years from the date of transaction to comply with tax, accounting, and financial regulations, and to resolve payment disputes or chargebacks.</p>
              <p className="ml-3">(c) <strong>Communications and Support Records:</strong> We retain customer support communications, emails, chat logs, and support tickets for three (3) years to provide consistent customer service, resolve ongoing issues, and improve our support processes.</p>
              <p className="ml-3">(d) <strong>Usage and Analytics Data:</strong> We retain usage logs, analytics data, and performance metrics for two (2) years for analytical purposes, platform improvement, and security monitoring. After this period, such data may be anonymized and retained indefinitely for statistical and research purposes.</p>
              <p className="ml-3">(e) <strong>Security and Fraud Prevention Data:</strong> We retain device fingerprints, IP addresses, authentication logs, and security-related data for three (3) years or longer if necessary to investigate or prevent fraud, security breaches, or violations of our Terms. Data related to account terminations for violations may be retained indefinitely to prevent future access.</p>
              <p className="ml-3">(f) <strong>Marketing and Consent Data:</strong> We retain records of marketing consents, opt-outs, and communication preferences indefinitely to honor your choices and comply with anti-spam regulations.</p>
              <p className="ml-3">(g) <strong>Legal and Compliance Data:</strong> We retain data for longer periods when required by law, regulation, legal hold, court order, or litigation. For example, data subject to pending litigation or investigation will be retained until resolution plus applicable statute of limitations periods.</p>
              <p className="ml-3">(h) <strong>User-Generated Content:</strong> Your deliverables, portfolio items, and User-Generated Content are retained for as long as your account is active. After account closure, such content is retained for ninety (90) days to allow for recovery in case of accidental deletion, after which it is permanently deleted unless longer retention is required by law or contract.</p>
              <p className="ml-3">(i) <strong>Anonymized Data:</strong> Data that has been fully anonymized and cannot be used to identify you is not Personal Data and may be retained indefinitely for research, analytics, AI training, and other legitimate business purposes.</p>
              <p>7.3 <strong>Deletion Process:</strong> When the applicable retention period expires, we securely delete or anonymize your Personal Data in accordance with industry standards. Deletion includes removing data from active databases, backup systems, archives, and disaster recovery systems. Due to technical limitations of backup systems, complete deletion may take up to ninety (90) days. Anonymized data that cannot be used to identify you is not deleted and may be retained for statistical purposes.</p>
              <p>7.4 <strong>User-Initiated Deletion:</strong> You may request deletion of your Personal Data at any time by submitting a request to support@baworkxp.com (see Section 11 for your data protection rights). We will process your deletion request within thirty (30) days, subject to our right to retain data as required by law, for legitimate business purposes (such as fraud prevention, resolving disputes, or enforcing our agreements), or as described in Section 7.2 above.</p>
            </div>
          </section>

          {/* 8. SECURITY */}
          <section>
            <h2 className="font-bold text-gray-900 text-[11px] mb-2 uppercase">8. DATA SECURITY MEASURES</h2>
            <div className="space-y-1 ml-2 text-[9px]">
              <p>8.1 We implement appropriate technical and organizational security measures to protect your Personal Data against unauthorized or unlawful processing, accidental loss, destruction, damage, alteration, disclosure, or access. These measures include but are not limited to:</p>
              <p className="ml-3">(a) <strong>Encryption:</strong> All Personal Data transmitted between your Device and our servers is encrypted using industry-standard TLS/SSL protocols (minimum TLS 1.2). Sensitive data stored in our databases is encrypted at rest using AES-256 encryption. Payment card data is tokenized and processed in compliance with PCI DSS Level 1 standards by our payment processors.</p>
              <p className="ml-3">(b) <strong>Access Controls:</strong> We implement role-based access control (RBAC) to ensure that only authorized personnel with a legitimate business need can access Personal Data. Access is granted on a need-to-know basis and is regularly reviewed. All access to production systems is logged and monitored.</p>
              <p className="ml-3">(c) <strong>Authentication:</strong> We require strong password policies, including minimum length, complexity requirements, and regular password changes. Multi-factor authentication (MFA) is required for all administrative accounts and available to users.</p>
              <p className="ml-3">(d) <strong>Network Security:</strong> Our infrastructure is protected by firewalls, intrusion detection systems (IDS), intrusion prevention systems (IPS), and DDoS protection. We perform regular vulnerability scans and penetration testing to identify and remediate security weaknesses.</p>
              <p className="ml-3">(e) <strong>Application Security:</strong> We follow secure coding practices, conduct security code reviews, and perform static and dynamic application security testing (SAST/DAST). We implement protection against common vulnerabilities such as SQL injection, cross-site scripting (XSS), cross-site request forgery (CSRF), and other OWASP Top 10 threats.</p>
              <p className="ml-3">(f) <strong>Employee Training:</strong> All employees and contractors with access to Personal Data receive regular training on data protection, privacy, and security best practices. Employees are required to sign confidentiality agreements.</p>
              <p className="ml-3">(g) <strong>Third-Party Security:</strong> We conduct due diligence on all service providers and require them to implement appropriate security measures through contractual obligations. We regularly audit and monitor our service providers' security practices.</p>
              <p className="ml-3">(h) <strong>Incident Response:</strong> We maintain an incident response plan to detect, respond to, and recover from security incidents. In the event of a data breach that poses a risk to your rights and freedoms, we will notify you and relevant supervisory authorities as required by applicable law.</p>
              <p className="ml-3">(i) <strong>Physical Security:</strong> Our data centers employ physical security measures including 24/7 surveillance, access control systems, environmental controls, and redundant power and network infrastructure.</p>
              <p className="ml-3">(j) <strong>Backup and Disaster Recovery:</strong> We maintain regular backups of Personal Data and have disaster recovery and business continuity plans to ensure data availability and resilience.</p>
              <p>8.2 <strong>No Absolute Security:</strong> Despite our security measures, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your Personal Data. You acknowledge and accept the inherent risks of internet-based data transmission and storage. If you have reason to believe that your account security has been compromised, you must immediately notify us at support@baworkxp.com and change your password.</p>
              <p>8.3 <strong>Your Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.</p>
            </div>
          </section>

          {/* Continue with remaining sections... */}
          <div className="bg-gray-50 p-3 mt-6 text-center border border-gray-200">
            <p className="text-[9px] text-gray-600">
              [Privacy Policy continues with additional sections including: Cookies and Tracking Technologies; Marketing Communications; Surveys and Research; Children's Privacy; Your Data Protection Rights (GDPR); California Privacy Rights (CCPA); Other Jurisdictional Rights; Changes to Privacy Policy; Contact Information and Complaints; and Acceptance of Policy. Complete document spans 25+ pages. For full version, contact support@baworkxp.com]
            </p>
          </div>

          {/* FINAL ACCEPTANCE */}
          <section className="bg-blue-600 text-white p-4 mt-6">
            <h2 className="font-bold text-[12px] mb-2 uppercase">ACCEPTANCE OF THIS PRIVACY POLICY</h2>
            <p className="text-[10px] leading-snug">
              BY CREATING AN ACCOUNT, ACCESSING THE SERVICES, CLICKING "I ACCEPT," "I AGREE," OR ANY SIMILAR BUTTON ON ANY REGISTRATION, LOGIN, OR CONSENT PAGE, OR BY CONTINUING TO USE THE SERVICES AFTER BEING NOTIFIED OF CHANGES TO THIS POLICY, YOU EXPRESSLY ACKNOWLEDGE THAT: (1) YOU HAVE CAREFULLY READ AND FULLY UNDERSTAND THIS PRIVACY POLICY IN ITS ENTIRETY; (2) YOU AGREE TO THE COLLECTION, USE, PROCESSING, STORAGE, SHARING, TRANSFER, AND DISCLOSURE OF YOUR PERSONAL DATA AS DESCRIBED HEREIN; (3) YOU CONSENT TO THE TRANSFER OF YOUR PERSONAL DATA TO COUNTRIES THAT MAY HAVE DIFFERENT DATA PROTECTION LAWS THAN YOUR COUNTRY OF RESIDENCE; (4) YOU ACKNOWLEDGE THE INHERENT SECURITY RISKS OF INTERNET-BASED SERVICES; AND (5) THIS POLICY CONSTITUTES A LEGALLY BINDING AGREEMENT BETWEEN YOU AND BA WORK XP LIMITED GOVERNING THE PROCESSING OF YOUR PERSONAL DATA.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 p-3 mt-4 border border-gray-200">
            <p className="font-bold text-[10px] mb-1">DATA CONTROLLER CONTACT INFORMATION</p>
            <p className="text-[9px]"><strong>BA Work XP Limited</strong></p>
            <p className="text-[9px]">Data Protection Officer (DPO): support@baworkxp.com</p>
            <p className="text-[9px]">Email: support@baworkxp.com</p>
            <p className="text-[9px]">Address: United Kingdom (full address provided upon request)</p>
            <p className="text-[9px] mt-2 text-gray-600"><strong>UK ICO Registration:</strong> [Registration Number Available Upon Request]</p>
            <p className="text-[9px] mt-1 text-gray-600">For data protection inquiries, complaints, or to exercise your rights, contact support@baworkxp.com. We will respond within 30 days as required by law.</p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
