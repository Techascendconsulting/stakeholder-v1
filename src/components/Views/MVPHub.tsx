import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Rocket, Target, Zap, CheckCircle, ArrowRight, BookOpen, Lightbulb, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import MvpBuilder from './MvpBuilder';

const MVPHub: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showMvpBuilder, setShowMvpBuilder] = useState(false);

  // If MVP Builder is shown, render it instead of the hub
  if (showMvpBuilder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <button
              onClick={() => setShowMvpBuilder(false)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to MVP Hub</span>
            </button>
          </div>
          <MvpBuilder mode="training" />
        </div>
      </div>
    );
  }

  const lessons = [
    {
      id: 'what-is-mvp',
      title: 'What is an MVP?',
      icon: <Rocket className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-700'
    },
    {
      id: 'why-mvp-matters',
      title: 'Why MVP Matters',
      icon: <Target className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      id: 'mvp-vs-non-mvp',
      title: 'MVP vs Non-MVP',
      icon: <Zap className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700'
    },
    {
      id: 'prioritisation-moscow',
      title: 'Prioritisation & MoSCoW',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700'
    },
    {
      id: 'ba-thinks-mvp',
      title: 'How a BA Thinks About MVP',
      icon: <Users className="w-6 h-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-700'
    },
    {
      id: 'mvp-to-iterations',
      title: 'From MVP to Iterations',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-700'
    }
  ];

  const renderLessonContent = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;

    const getLessonContent = (id: string) => {
      if (id === 'what-is-mvp') {
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                When a project starts, you will quickly notice that stakeholders usually bring a long list of requirements. Some are improvements to an existing system, while others may be part of building a completely new solution. At first glance, everything might feel urgent, and many stakeholders will argue that every requirement is equally important. But as a Business Analyst, you need to help the team see that delivering everything at once is not realistic and, more importantly, not the right way to deliver value.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This is where the concept of Minimum Viable Product (MVP) comes in.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What is an MVP?</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                An MVP is the smallest possible version of a product that delivers actual value to the user and allows the business to learn something important. It is not a draft, and it is not half-complete functionality. It is not just a demo or a prototype. Instead, it is a product that truly works, but with only the essential features needed to solve the problem at hand.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Think of MVP as a thin vertical slice of functionality that goes all the way through the system, from the user's action to the business outcome. This slice is small, but it is complete. A customer can use it, the system can process it, and the business can see results.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Example 1: Customer Identity Verification</h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4">
                Imagine you are working on an Epic called Verify Customer Identity. Stakeholders say:
              </p>
              <ul className="text-blue-800 dark:text-blue-300 mb-4 space-y-2">
                <li>• Customers should be able to upload their ID.</li>
                <li>• The system should validate that ID.</li>
                <li>• A confirmation should be shown to the customer.</li>
                <li>• Customers should be able to re-send the confirmation email.</li>
                <li>• The system should support multiple languages.</li>
              </ul>
              <p className="text-blue-800 dark:text-blue-300 mb-4 font-semibold">Now, which of these is MVP?</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-blue-900 dark:text-blue-200 font-semibold mb-2">The MVP flow is:</p>
                <ul className="text-blue-800 dark:text-blue-300 space-y-1">
                  <li>1. Upload ID.</li>
                  <li>2. Validate ID.</li>
                  <li>3. Show confirmation.</li>
                </ul>
                <p className="text-blue-800 dark:text-blue-300 mt-3">
                  That's it. With those three pieces, the product works. Customers can prove their identity, the system validates it, and the customer gets a result.
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-4">Example 2: Repair Appointment Booking</h3>
              <p className="text-green-800 dark:text-green-300 mb-4">
                Now imagine a requirement in the housing sector: Tenants should be able to book repairs.
              </p>
              <p className="text-green-800 dark:text-green-300 mb-4">Stakeholders request:</p>
              <ul className="text-green-800 dark:text-green-300 mb-4 space-y-2">
                <li>• Tenants should choose their preferred appointment slot.</li>
                <li>• The system should confirm the chosen slot.</li>
                <li>• Engineers should see the confirmed schedule.</li>
                <li>• Tenants should receive SMS reminders.</li>
                <li>• Tenants should be able to reschedule appointments.</li>
                <li>• Tenants should be able to upload photos of the issue.</li>
              </ul>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <p className="text-green-900 dark:text-green-200 font-semibold mb-2">Again, the MVP flow is clear:</p>
                <ul className="text-green-800 dark:text-green-300 space-y-1">
                  <li>1. Tenant books a slot.</li>
                  <li>2. System confirms the slot.</li>
                  <li>3. Engineer receives the schedule.</li>
                </ul>
                <p className="text-green-800 dark:text-green-300 mt-3">
                  That solves the core problem: engineers showing up randomly and missing tenants.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How to Recognise MVP as a BA</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                The easiest way to think about MVP is to ask yourself this question:
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700 mb-4">
                <p className="text-yellow-800 dark:text-yellow-300 font-semibold">
                  "If we only built this part, could the customer actually complete the process from start to finish and get value from it?"
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If the answer is yes, then you have identified the MVP. If the answer is no, then it's just part of the puzzle and needs more pieces to make a complete flow.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Why MVP is not a Prototype</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A common mistake is confusing MVP with a prototype. A prototype might look like the product, but it isn't fully functional. It's often used to test ideas or gather feedback. An MVP, on the other hand, works. It might be small, and it might lack polish, but it is usable in the real world. Customers can rely on it, and the business can learn from it.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-4">Key Takeaway</h3>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                An MVP is the smallest set of features that create a complete, working flow and solve a real problem. It is not half-baked. It is not everything at once. It is the right minimum that delivers value end-to-end.
              </p>
            </div>
          </div>
        );
      }
      
      if (id === 'why-mvp-matters') {
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                When you are in a project environment, it is very easy to get pulled in different directions by stakeholders. Everyone believes their requirement is important, and everyone wants their feature delivered first. Without a strong framework for focus, the team can lose sight of what really matters.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This is why MVP thinking is critical for Business Analysts. It helps you protect the team and the stakeholders from wasting effort and ensures that value is delivered quickly and visibly.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-700">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4">The Risk Without MVP Thinking</h3>
              <p className="text-red-800 dark:text-red-300 mb-4">
                Projects that don't use MVP thinking usually fall into two traps:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Too much, too soon</h4>
                  <p className="text-red-800 dark:text-red-300 mb-3">
                    Teams try to deliver everything at once. The backlog becomes a giant wish list, the delivery team is stretched thin, and deadlines keep slipping. Months pass, and nothing is released to customers. By the time the system finally goes live, it is often over budget, late, and misaligned with what the business truly needs.
                  </p>
                  <div className="bg-red-100 dark:bg-red-800/30 rounded-lg p-3 border border-red-300 dark:border-red-600">
                    <p className="text-red-900 dark:text-red-200 font-semibold mb-1">Example:</p>
                    <p className="text-red-800 dark:text-red-300 text-sm">
                      A healthcare team decides to build a new patient portal. Instead of starting with the basics (book appointment, view confirmation), they try to deliver every feature — prescription tracking, video consultations, test results, messaging, and reminders — all in the first release. The project drags on for two years, and patients still can't do the simplest thing: book an appointment online.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Incomplete flows</h4>
                  <p className="text-red-800 dark:text-red-300 mb-3">
                    Sometimes teams deliver parts of functionality that don't connect to form a usable flow. On the surface, it looks like progress: "We've built the login page! We've built the upload screen!" But when stakeholders try to use it, nothing works end-to-end. The frustration quickly builds: "You've built pieces, but when will this actually work?"
                  </p>
                  <div className="bg-red-100 dark:bg-red-800/30 rounded-lg p-3 border border-red-300 dark:border-red-600">
                    <p className="text-red-900 dark:text-red-200 font-semibold mb-1">Example:</p>
                    <p className="text-red-800 dark:text-red-300 text-sm">
                      A housing repair system goes live with an appointment booking page but no confirmation step. Tenants can choose a time, but the system doesn't record it properly, and engineers still show up randomly. Stakeholders are left wondering what was achieved.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-4">What MVP Delivers Instead</h3>
              <p className="text-green-800 dark:text-green-300 mb-4">
                MVP thinking forces the team to ask: "What is the minimum set of stories that create a usable flow?"
              </p>
              
              <ul className="text-green-800 dark:text-green-300 mb-4 space-y-2">
                <li>• It focuses the conversation on value rather than on quantity of features.</li>
                <li>• It ensures the team delivers something usable early, even if it's small.</li>
                <li>• It creates a sense of progress for stakeholders, because they can see and use something real.</li>
                <li>• It reduces risk, because the business gets feedback quickly and can adjust before spending more money.</li>
              </ul>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3">Example: Online Course Platform</h4>
                <p className="text-green-800 dark:text-green-300 mb-3">
                  Imagine the business wants to build an online learning portal. They list dozens of requirements:
                </p>
                <ul className="text-green-800 dark:text-green-300 mb-4 space-y-1 text-sm">
                  <li>• Students should register.</li>
                  <li>• Students should pay online.</li>
                  <li>• Students should view courses.</li>
                  <li>• Students should track progress.</li>
                  <li>• Students should take quizzes.</li>
                  <li>• Students should receive certificates.</li>
                  <li>• Students should connect with other learners in a community forum.</li>
                </ul>
                <p className="text-green-800 dark:text-green-300 mb-3">
                  Without MVP thinking, the project could try to deliver all of these in one massive release. This would take months (or years), and by the time it is done, the market may have shifted.
                </p>
                <div className="bg-green-100 dark:bg-green-800/30 rounded-lg p-3 border border-green-300 dark:border-green-600">
                  <p className="text-green-900 dark:text-green-200 font-semibold mb-2">With MVP thinking, the BA asks: What is the smallest usable product that allows a student to learn?</p>
                  <ul className="text-green-800 dark:text-green-300 space-y-1">
                    <li>1. Register.</li>
                    <li>2. Pay.</li>
                    <li>3. View course videos.</li>
                  </ul>
                  <p className="text-green-800 dark:text-green-300 mt-3 text-sm">
                    That's the MVP. A student can register, pay, and start learning. Everything else (progress tracking, quizzes, certificates, forums) can be added later as iterations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">The BA's Role</h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4">
                As a BA, you must guide discussions toward MVP. Stakeholders may resist — they often want everything. But your role is to ask the right questions:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 mb-4">
                <ul className="text-blue-800 dark:text-blue-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>"If we only built this part, could a customer still get value?"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>"What is the smallest flow we can release that would solve the core problem?"</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-blue-800 dark:text-blue-300">
                MVP matters because it makes delivery realistic and value-driven. It protects the project from being lost in endless scope and gives the business confidence through visible progress.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-4">Key Takeaway</h3>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                MVP matters because it ensures the team delivers a working product early, avoids wasted effort, and allows the business to start learning from real usage immediately. Without it, projects either drown in scope or deliver incomplete pieces that provide no value.
              </p>
            </div>
          </div>
        );
      }
      
      if (id === 'mvp-vs-non-mvp') {
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                By now you know that an MVP is the smallest usable flow that delivers value. But in practice, teams often confuse "delivering features" with "delivering MVP." As a BA, you need to be able to spot the difference and guide others to see it clearly.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Let's explore this distinction with practical examples.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-4">The Danger of Isolated Features</h3>
              <p className="text-orange-800 dark:text-orange-300 mb-4">
                Teams sometimes celebrate progress because individual features have been developed. You might hear:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700 mb-4">
                <ul className="text-orange-800 dark:text-orange-300 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">•</span>
                    <span>"We've built the upload screen!"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">•</span>
                    <span>"We've completed the notification service!"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">•</span>
                    <span>"We've set up the reporting module!"</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-orange-800 dark:text-orange-300">
                But if these features don't connect to form a complete flow, they are not MVP. They are just pieces of the puzzle. Until the features come together into a usable journey, they don't solve the customer's problem.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Example 1: Housing Repairs</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 mb-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Epic: Repair Appointment Booking</h4>
                <p className="text-blue-800 dark:text-blue-300 mb-3">Stakeholder requests:</p>
                <ul className="text-blue-800 dark:text-blue-300 space-y-1 text-sm mb-4">
                  <li>• Tenants can choose an appointment slot.</li>
                  <li>• The system confirms the chosen slot.</li>
                  <li>• Engineers see the confirmed schedule.</li>
                  <li>• Tenants receive SMS reminders.</li>
                  <li>• Tenants can upload photos of the issue.</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">✅</span>
                    <h4 className="font-semibold text-green-900 dark:text-green-200">MVP Flow:</h4>
                  </div>
                  <ol className="text-green-800 dark:text-green-300 space-y-1 text-sm">
                    <li>1. Tenant books a slot.</li>
                    <li>2. System confirms the slot.</li>
                    <li>3. Engineer receives the schedule.</li>
                  </ol>
                  <p className="text-green-800 dark:text-green-300 text-sm mt-3">
                    This flow is end-to-end. Tenants know when someone will come, and engineers know where to go. The core problem — random, missed appointments — is solved.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">❌</span>
                    <h4 className="font-semibold text-red-900 dark:text-red-200">Non-MVP Flow:</h4>
                  </div>
                  <ul className="text-red-800 dark:text-red-300 space-y-1 text-sm">
                    <li>• Tenant books a slot, but there's no confirmation.</li>
                    <li>• Engineer doesn't see the schedule.</li>
                  </ul>
                  <p className="text-red-800 dark:text-red-300 text-sm mt-3">
                    Even though one feature (booking) exists, the flow is incomplete. The tenant still faces the same frustration, and the business problem is unsolved.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-4">Example 2: Online Learning Platform</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700 mb-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">Epic: Deliver Online Courses</h4>
                <p className="text-purple-800 dark:text-purple-300 mb-3">Stakeholder requests:</p>
                <ul className="text-purple-800 dark:text-purple-300 space-y-1 text-sm">
                  <li>• Students can register.</li>
                  <li>• Students can pay online.</li>
                  <li>• Students can view course videos.</li>
                  <li>• Students can track progress.</li>
                  <li>• Students can take quizzes.</li>
                  <li>• Students can receive certificates.</li>
                  <li>• Students can join discussion forums.</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">✅</span>
                    <h4 className="font-semibold text-green-900 dark:text-green-200">MVP Flow:</h4>
                  </div>
                  <ol className="text-green-800 dark:text-green-300 space-y-1 text-sm">
                    <li>1. Register</li>
                    <li>2. Pay</li>
                    <li>3. View course videos</li>
                  </ol>
                  <p className="text-green-800 dark:text-green-300 text-sm mt-3">
                    That's enough for a student to start learning. The core business problem (delivering education online) is solved.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">❌</span>
                    <h4 className="font-semibold text-red-900 dark:text-red-200">Non-MVP Flow:</h4>
                  </div>
                  <ul className="text-red-800 dark:text-red-300 space-y-1 text-sm">
                    <li>• Students can register and pay, but courses are not yet viewable.</li>
                    <li>• Or students can view videos but can't register or pay.</li>
                  </ul>
                  <p className="text-red-800 dark:text-red-300 text-sm mt-3">
                    Neither flow is usable. In both cases, work has been done, but no real value is delivered.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-4">The BA's Lens on MVP vs Non-MVP</h3>
              <p className="text-indigo-800 dark:text-indigo-300 mb-4">
                Always ask:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700 mb-4">
                <ul className="text-indigo-800 dark:text-indigo-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <span>Does this flow start with the user and end with the business outcome?</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <span>Can a customer actually use it as it is today?</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-indigo-800 dark:text-indigo-300 mb-4">
                If not, then it's not MVP, no matter how many features are "done."
              </p>
              
              <p className="text-indigo-800 dark:text-indigo-300">
                This is a mindset shift for teams. Developers and even Product Owners sometimes celebrate partial delivery. As the BA, you must bring focus back to end-to-end value delivery.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-4">Key Takeaway</h3>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                MVP = complete usable flow. Non-MVP = isolated or incomplete features. As a BA, you need to keep everyone focused on the difference so that progress means real value, not just ticking boxes.
              </p>
            </div>
          </div>
        );
      }
      
      if (id === 'prioritisation-moscow') {
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                By now you understand that MVP is the smallest usable version of a product that delivers value. But how do we decide what belongs inside that MVP and what gets left for later? This is where prioritisation becomes one of the most important skills for a Business Analyst.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Stakeholders rarely say, "We only need these three things." Instead, they often argue that everything is critical. If you are not careful, every requirement ends up labelled urgent, and your team is set up to fail. To avoid this, you need a simple, structured way of separating what truly matters from what can wait. One of the most widely used techniques in Agile projects is called MoSCoW prioritisation.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">What is MoSCoW?</h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4">
                MoSCoW is a technique that helps stakeholders and teams agree on priorities by placing each requirement into one of four categories:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Must-Haves</h4>
                  <p className="text-red-800 dark:text-red-300 text-sm">
                    These are the absolute essentials. If they are not delivered, the product fails.
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Should-Haves</h4>
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    Important, but not vital for the first release. If they are delayed, the product still works.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Could-Haves</h4>
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    Nice extras. They add value but are not necessary in the early stages.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Won't-Haves (for now)</h4>
                  <p className="text-gray-800 dark:text-gray-300 text-sm">
                    Items that stakeholders may want, but the team agrees to leave out of scope for this release.
                  </p>
                </div>
              </div>
              
              <p className="text-blue-800 dark:text-blue-300 mt-4">
                This technique is simple enough to explain to any stakeholder, but powerful enough to drive clear decisions.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-4">How MoSCoW Helps Define MVP</h3>
              <p className="text-purple-800 dark:text-purple-300 mb-4">
                The MVP is built entirely from the Must-Haves. If you try to include Should-Haves and Could-Haves, you risk bloating the scope. If you skip a Must-Have, the flow breaks and you no longer have a usable product.
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <p className="text-purple-800 dark:text-purple-300 font-semibold">
                  In other words, MVP = Must-Haves that together form a complete flow.
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-4">Example 1: Housing Transfer Requests</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700 mb-4">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">Epic: Apply for Housing Transfer</h4>
                <p className="text-indigo-800 dark:text-indigo-300 mb-3">Stakeholder wants:</p>
                <ul className="text-indigo-800 dark:text-indigo-300 space-y-1 text-sm">
                  <li>• Tenants can submit a transfer form.</li>
                  <li>• Tenants must upload supporting documents (e.g., medical letter).</li>
                  <li>• The system should send a confirmation email.</li>
                  <li>• Tenants should be able to edit their request after submission.</li>
                  <li>• Tenants could track the request status online.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Must-Haves</h4>
                  <ul className="text-red-800 dark:text-red-300 space-y-1 text-sm">
                    <li>• Submit form</li>
                    <li>• Upload documents</li>
                    <li>• Confirmation sent</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Should-Have</h4>
                  <ul className="text-yellow-800 dark:text-yellow-300 space-y-1 text-sm">
                    <li>• Edit request after submission</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Could-Have</h4>
                  <ul className="text-green-800 dark:text-green-300 space-y-1 text-sm">
                    <li>• Track request status online</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Won't-Have (for now)</h4>
                  <ul className="text-gray-800 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Advanced integration with internal case management system</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-indigo-100 dark:bg-indigo-800/30 rounded-lg p-3 border border-indigo-300 dark:border-indigo-600 mt-4">
                <p className="text-indigo-900 dark:text-indigo-200 font-semibold text-sm">
                  Here, the MVP is clear: submit → upload → confirmation. That's the usable flow. Everything else can come later.
                </p>
              </div>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-700">
              <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-200 mb-4">Example 2: Event Ticketing</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-teal-200 dark:border-teal-700 mb-4">
                <h4 className="font-semibold text-teal-900 dark:text-teal-200 mb-3">Epic: Download Event Ticket</h4>
                <p className="text-teal-800 dark:text-teal-300 mb-3">Stakeholder wants:</p>
                <ul className="text-teal-800 dark:text-teal-300 space-y-1 text-sm">
                  <li>• Attendees can download their e-ticket after purchase.</li>
                  <li>• Attendees should be able to resend the ticket to their email.</li>
                  <li>• Attendees could store tickets in a digital wallet app.</li>
                  <li>• Attendees want a social sharing feature.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Must-Have</h4>
                  <ul className="text-red-800 dark:text-red-300 space-y-1 text-sm">
                    <li>• Download e-ticket</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Should-Have</h4>
                  <ul className="text-yellow-800 dark:text-yellow-300 space-y-1 text-sm">
                    <li>• Resend ticket</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Could-Have</h4>
                  <ul className="text-green-800 dark:text-green-300 space-y-1 text-sm">
                    <li>• Digital wallet storage</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Won't-Have</h4>
                  <ul className="text-gray-800 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Social sharing</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-teal-100 dark:bg-teal-800/30 rounded-lg p-3 border border-teal-300 dark:border-teal-600 mt-4">
                <p className="text-teal-900 dark:text-teal-200 font-semibold text-sm">
                  The MVP here is simple: if attendees can't download their ticket, the event fails. Everything else adds convenience but is not essential.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-4">The BA's Role in MoSCoW Sessions</h3>
              <p className="text-amber-800 dark:text-amber-300 mb-4">
                As a BA, you often facilitate MoSCoW sessions with stakeholders. This involves:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700 mb-4">
                <ul className="text-amber-800 dark:text-amber-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>Explaining the categories clearly.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>Asking probing questions when stakeholders insist something is a Must-Have.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>Challenging assumptions by linking requirements back to business outcomes.</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-amber-100 dark:bg-amber-800/30 rounded-lg p-4 border border-amber-300 dark:border-amber-600">
                <p className="text-amber-900 dark:text-amber-200 font-semibold mb-2">For example, if a stakeholder says "SMS reminders are a Must-Have", you might ask:</p>
                <p className="text-amber-800 dark:text-amber-300 mb-3">"If we went live without SMS, would the booking system still work?"</p>
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  If the answer is yes, then SMS is a Should-Have, not a Must-Have.
                </p>
              </div>
              
              <p className="text-amber-800 dark:text-amber-300 mt-4">
                This is how you protect the scope of MVP and ensure the team can deliver something usable quickly.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-4">Key Takeaway</h3>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                MoSCoW gives you the structure to separate essentials from enhancements. MVP is made of Must-Haves. As a BA, your job is to guide stakeholders to accept this reality and build discipline around it.
              </p>
            </div>
          </div>
        );
      }
      
      if (id === 'ba-thinks-mvp') {
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Up to this point, we've explored what an MVP is, why it matters, how to recognise it, and how prioritisation through MoSCoW helps you define it. But let's now step into the mindset of a Business Analyst. MVP isn't just a definition on paper — it's a way of thinking that shapes how you analyse requirements, engage stakeholders, and guide the Scrum team.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">The BA's Responsibility in MVP Discussions</h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4">
                As a BA, you sit at the centre of conversations between stakeholders and the delivery team. Stakeholders often push for more. Delivery teams sometimes get caught up in the technical details. Your role is to bring everyone back to this simple truth:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 mb-4">
                <p className="text-blue-800 dark:text-blue-300 font-semibold text-lg">
                  👉 The goal is to deliver the smallest usable product that solves the core problem.
                </p>
              </div>
              
              <p className="text-blue-800 dark:text-blue-300 mb-4">That means you need to:</p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <ul className="text-blue-800 dark:text-blue-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Look beyond individual user stories.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Ask which stories must connect to form a complete flow.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Challenge "nice-to-haves" that distract from delivering value early.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-4">Thinking in Flows, Not Features</h3>
              <p className="text-green-800 dark:text-green-300 mb-4">
                One of the most common mistakes in projects is thinking in terms of features rather than flows.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Features are building blocks.</h4>
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    Individual components that can be developed independently.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Flows are the customer journeys that deliver outcomes.</h4>
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    Connected steps that solve the user's problem end-to-end.
                  </p>
                </div>
              </div>
              
              <p className="text-green-800 dark:text-green-300 mb-4">
                MVP requires you to connect the features into a working flow.
              </p>
              
              <div className="bg-green-100 dark:bg-green-800/30 rounded-lg p-4 border border-green-300 dark:border-green-600">
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Example – Banking Loan Application</h4>
                <div className="space-y-2">
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    <strong>Features:</strong> Upload documents, Enter income details, Calculate affordability, Show decision.
                  </p>
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    <strong>Flow (MVP):</strong> Customer enters details → Uploads documents → System calculates → Decision displayed.
                  </p>
                  <p className="text-green-800 dark:text-green-300 text-sm font-semibold">
                    If even one step in that flow is missing, it's not MVP. It's just isolated features.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-4">Asking the Right Questions</h3>
              <p className="text-purple-800 dark:text-purple-300 mb-4">
                To think like a BA about MVP, you need to ask probing questions during refinement sessions and stakeholder workshops. Examples include:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700 mb-4">
                <ul className="text-purple-800 dark:text-purple-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <span>"If we didn't build this, could the product still work?"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <span>"Does this requirement complete the flow, or is it an enhancement?"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <span>"What is the first point at which a customer could actually use this product?"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <span>"If we stopped after this release, would the business problem be solved at least at a basic level?"</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-purple-800 dark:text-purple-300">
                These questions cut through assumptions and force clarity.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-4">Example – Online Learning Portal</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700 mb-4">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">Epic: Deliver Online Courses</h4>
                <p className="text-indigo-800 dark:text-indigo-300 mb-3">Stakeholder requests:</p>
                <ul className="text-indigo-800 dark:text-indigo-300 space-y-1 text-sm">
                  <li>• Students should register.</li>
                  <li>• Students should pay online.</li>
                  <li>• Students should view courses.</li>
                  <li>• Students should track progress.</li>
                  <li>• Students should take quizzes.</li>
                  <li>• Students should join forums.</li>
                </ul>
              </div>

              <div className="bg-indigo-100 dark:bg-indigo-800/30 rounded-lg p-4 border border-indigo-300 dark:border-indigo-600 mb-4">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">BA thinking process:</h4>
                <ul className="text-indigo-800 dark:text-indigo-300 space-y-2 text-sm">
                  <li>• If students can't register, nothing works → <strong>Must-Have</strong>.</li>
                  <li>• If students can't pay, the business model fails → <strong>Must-Have</strong>.</li>
                  <li>• If students can't view courses, the entire system fails → <strong>Must-Have</strong>.</li>
                  <li>• Progress tracking, quizzes, and forums are enhancements.</li>
                </ul>
                <p className="text-indigo-800 dark:text-indigo-300 text-sm mt-3 font-semibold">
                  So the MVP flow is Register → Pay → View courses.
                </p>
              </div>
              
              <p className="text-indigo-800 dark:text-indigo-300">
                The BA identifies this by focusing on the problem to be solved (delivering courses online) and then working backward to see the essential flow.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-4">Why BA Thinking Protects the Team</h3>
              <p className="text-amber-800 dark:text-amber-300 mb-4">
                Without MVP discipline, the backlog becomes bloated, and the Scrum team risks building in circles. MVP thinking ensures:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700 mb-4">
                <ul className="text-amber-800 dark:text-amber-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>Developers focus on essentials first.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>Stakeholders see early wins.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>The business gets feedback before investing more.</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-amber-800 dark:text-amber-300">
                This mindset is what sets apart an average BA from a strong one. It's not just about documenting requirements. It's about framing the problem in a way that drives value early and often.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-4">Key Takeaway</h3>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                To think like a BA about MVP, always look for the smallest complete flow that solves the problem, ask tough prioritisation questions, and guide the team away from features toward outcomes. MVP thinking protects delivery and ensures progress is real, not just activity.
              </p>
            </div>
          </div>
        );
      }
      
      if (id === 'mvp-to-iterations') {
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                By now you understand that MVP is not about building "less." It is about building the right minimum — the smallest complete flow that delivers value. But it's equally important to recognise that MVP is not the end of the journey. MVP is the beginning. It is the foundation upon which future iterations are built.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Why MVP is Only the First Step</h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4">
                The purpose of MVP is to prove value early and give the business something usable as quickly as possible. Once that is in place, the team doesn't stop. Instead, they continue to build on top of the MVP through iterative delivery.
              </p>
              
              <p className="text-blue-800 dark:text-blue-300 mb-4">This iterative approach allows the team to:</p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <ul className="text-blue-800 dark:text-blue-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Release value early.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Collect feedback from real users.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Adjust priorities based on evidence, not assumptions.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Improve the product step by step, without waiting for a "big bang" release.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-4">Example 1: Repair Appointment Booking</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700 mb-4">
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3">Epic: Repair Request Scheduling</h4>
                <div className="bg-green-100 dark:bg-green-800/30 rounded-lg p-3 border border-green-300 dark:border-green-600 mb-4">
                  <p className="text-green-900 dark:text-green-200 font-semibold mb-2">MVP Flow:</p>
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    Tenant books appointment → System confirms slot → Engineer sees schedule.
                  </p>
                  <p className="text-green-800 dark:text-green-300 text-sm mt-2">
                    This is enough to stop random visits and missed appointments.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <h5 className="font-semibold text-green-900 dark:text-green-200 mb-1">Iteration 1:</h5>
                    <p className="text-green-800 dark:text-green-300 text-sm">Add SMS reminders to reduce no-shows.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <h5 className="font-semibold text-green-900 dark:text-green-200 mb-1">Iteration 2:</h5>
                    <p className="text-green-800 dark:text-green-300 text-sm">Allow tenants to reschedule their appointment.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <h5 className="font-semibold text-green-900 dark:text-green-200 mb-1">Iteration 3:</h5>
                    <p className="text-green-800 dark:text-green-300 text-sm">Enable tenants to upload photos of the repair issue.</p>
                  </div>
                </div>
                
                <p className="text-green-800 dark:text-green-300 text-sm mt-4 font-semibold">
                  Each iteration adds value, but the MVP alone already solved the main problem.
                </p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-4">Example 2: Online Learning Portal</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700 mb-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">Epic: Deliver Online Courses</h4>
                <div className="bg-purple-100 dark:bg-purple-800/30 rounded-lg p-3 border border-purple-300 dark:border-purple-600 mb-4">
                  <p className="text-purple-900 dark:text-purple-200 font-semibold mb-2">MVP Flow:</p>
                  <p className="text-purple-800 dark:text-purple-300 text-sm">
                    Register → Pay → View courses.
                  </p>
                  <p className="text-purple-800 dark:text-purple-300 text-sm mt-2">
                    This is enough for a student to start learning online.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                    <h5 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">Iteration 1:</h5>
                    <p className="text-purple-800 dark:text-purple-300 text-sm">Add progress tracking.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                    <h5 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">Iteration 2:</h5>
                    <p className="text-purple-800 dark:text-purple-300 text-sm">Introduce quizzes for self-assessment.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                    <h5 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">Iteration 3:</h5>
                    <p className="text-purple-800 dark:text-purple-300 text-sm">Provide certificates of completion.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                    <h5 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">Iteration 4:</h5>
                    <p className="text-purple-800 dark:text-purple-300 text-sm">Add community forums for learners.</p>
                  </div>
                </div>
                
                <p className="text-purple-800 dark:text-purple-300 text-sm mt-4 font-semibold">
                  The MVP solved the immediate problem — enabling students to learn online. The iterations improve the experience, but the foundation was laid with the MVP.
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-4">How a BA Frames Iterations</h3>
              <p className="text-indigo-800 dark:text-indigo-300 mb-4">
                As a BA, your role is to help stakeholders see the product as an evolving journey. Many stakeholders believe everything must be delivered upfront, but your job is to show them how an MVP gets them value early, and iterations refine that value over time.
              </p>
              
              <p className="text-indigo-800 dark:text-indigo-300 mb-4">You should explain:</p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700 mb-4">
                <ul className="text-indigo-800 dark:text-indigo-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <span>"MVP gives us the first working solution. Iterations are how we make it better, based on what we learn."</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <span>"If we wait to build everything before going live, we risk wasting effort. By iterating, we can respond to real customer behaviour."</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-indigo-800 dark:text-indigo-300">
                This framing reassures stakeholders that MVP is not about cutting corners. It is about sequencing delivery to maximise value.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-700">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4">What Happens Without Iterations</h3>
              <p className="text-red-800 dark:text-red-300 mb-4">
                If the project delivers MVP but does not plan for iterations, the product risks being seen as incomplete or disappointing. MVP is not a final destination — it's a milestone.
              </p>
              
              <p className="text-red-800 dark:text-red-300 mb-4">Without iterations:</p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                <ul className="text-red-800 dark:text-red-300 space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <span>Customers may quickly notice gaps.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <span>The business may miss opportunities to improve.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <span>The product may stagnate while competitors move forward.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-4">Key Takeaway</h3>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                MVP is the starting point. Iterations build on top of it. As a BA, you must help stakeholders understand that MVP delivers the first slice of value, and iterative delivery ensures the product grows stronger with each release.
              </p>
            </div>
          </div>
        );
      }
      
      // Placeholder for other lessons
      return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lesson content will be available soon
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-300">
                This lesson is currently under development. The content will be available soon.
              </p>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${lesson.bgColor} ${lesson.borderColor} border rounded-xl flex items-center justify-center`}>
                <span className={lesson.color}>{lesson.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">Lesson Content</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentLesson(null)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Lessons</span>
            </button>
          </div>

          {getLessonContent(lessonId)}
        </div>
      </div>
    );
  };

  if (currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-gray-900 dark:via-green-900/30 dark:to-emerald-900/20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {renderLessonContent(currentLesson)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-gray-900 dark:via-green-900/30 dark:to-emerald-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5 dark:from-green-400/10 dark:to-emerald-400/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1"></div>
            <button
              onClick={() => setShowMvpBuilder(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <Rocket className="w-5 h-5" />
              <span>Skip to MVP Builder</span>
            </button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Minimum Viable Product (MVP)</h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Learn how to take your complete design and slice it into the smallest, most valuable release that delivers real business value.
            </p>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLesson(lesson.id)}
              className={`group relative ${lesson.bgColor} ${lesson.borderColor} border-2 rounded-3xl p-8 text-left hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-violet-50/30 to-indigo-50/50 dark:from-purple-900/20 dark:via-violet-900/10 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-indigo-400/20" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header with icon and lesson number */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-16 h-16 ${lesson.bgColor} ${lesson.borderColor} border-2 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}>
                        <span className={`${lesson.color} transition-transform duration-500`}>{lesson.icon}</span>
                      </div>
                      {/* Glow effect */}
                      <div className={`absolute inset-0 ${lesson.bgColor} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
                          Lesson {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300 leading-tight mb-4">
                  {lesson.title}
                </h3>
                
                {/* Description based on lesson */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {index === 0 && "Learn the fundamentals of MVP and why it's essential for successful product delivery."}
                  {index === 1 && "Understand the risks of scope creep and how MVP thinking protects your team."}
                  {index === 2 && "Distinguish between complete flows and isolated features that don't deliver value."}
                  {index === 3 && "Master MoSCoW prioritisation to separate essentials from enhancements."}
                  {index === 4 && "Develop the BA mindset for thinking in flows and asking the right questions."}
                  {index === 5 && "Learn how MVP becomes the foundation for continuous iterative improvement."}
                </p>
                
                {/* Footer with CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Start learning
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
              
              {/* Hover border effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-200 dark:group-hover:border-purple-700 transition-colors duration-500" />
            </button>
          ))}
        </div>

        {/* Try MVP Engine Button */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Practice?</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Put your MVP knowledge into practice with our interactive MVP Builder tool.
              </p>
              <button
                onClick={() => setShowMvpBuilder(true)}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Rocket className="w-5 h-5" />
                <span>Try the MVP Builder</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MVPHub;


