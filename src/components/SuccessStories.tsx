import React from 'react';
import { Star, Quote, ArrowRight, TrendingUp } from 'lucide-react';

const SuccessStories: React.FC = () => {
  const clientStories = [
    {
      company: "FinanceTech Solutions",
      industry: "Financial Services",
      challenge: "Legacy system modernization",
      solution: "Digital transformation strategy and agile implementation",
      result: "40% reduction in processing time, £2M cost savings annually",
      quote: "Tech Ascend transformed our approach to digital innovation. Their team's expertise in both technology and business process optimization delivered results beyond our expectations."
    },
    {
      company: "HealthCare Innovations",
      industry: "Healthcare",
      challenge: "Patient data management inefficiencies",
      solution: "Custom software development and workflow optimization",
      result: "60% improvement in data accuracy, enhanced patient care",
      quote: "The consultants from Tech Ascend understood our complex requirements and delivered a solution that revolutionized our patient care workflow."
    },
    {
      company: "RetailMax Group",
      industry: "Retail",
      challenge: "E-commerce platform scalability",
      solution: "Cloud migration and performance optimization",
      result: "300% increase in peak capacity, 99.9% uptime",
      quote: "Tech Ascend's technical expertise and project management capabilities enabled us to scale our platform seamlessly during peak shopping seasons."
    }
  ];

  const studentStories = [
    {
      name: "Alex Thompson",
      before: "Marketing Coordinator",
      after: "Senior Business Analyst",
      company: "Global Tech Corp",
      salary: "£52,000",
      quote: "The transition from marketing to business analysis seemed impossible until I joined Tech Ascend. The hands-on training and real project experience gave me the confidence to land my dream job.",
      program: "Business Analyst",
      timeToHire: "3 months"
    },
    {
      name: "Priya Patel",
      before: "Recent Graduate",
      after: "Product Owner",
      company: "Startup Innovations",
      salary: "£48,000",
      quote: "As a fresh graduate, I was worried about competing with experienced professionals. Tech Ascend's work experience program gave me the practical skills employers were looking for.",
      program: "Product Owner",
      timeToHire: "2 months"
    },
    {
      name: "James Wilson",
      before: "Operations Manager", 
      after: "Senior Project Manager",
      company: "Enterprise Solutions Ltd",
      salary: "£58,000",
      quote: "The career change at 35 felt risky, but Tech Ascend's comprehensive training and placement support made it seamless. I'm now leading digital transformation projects.",
      program: "Project Manager",
      timeToHire: "4 months"
    }
  ];

  return (
    <section id="success-stories" className="py-20 bg-gradient-to-br from-slate-50 to-lime-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover how we've helped businesses transform and individuals launch successful tech careers.
          </p>
        </div>

        {/* Overall Impact Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-100 text-lime-600 rounded-lg mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
            <div className="text-slate-600">Professionals Trained</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-600 rounded-lg mb-4">
              <Star className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">50+</div>
            <div className="text-slate-600">Client Projects Delivered</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-100 text-lime-600 rounded-lg mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">95%</div>
            <div className="text-slate-600">Job Placement Rate</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-600 rounded-lg mb-4">
              <Star className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">4.9/5</div>
            <div className="text-slate-600">Client Satisfaction</div>
          </div>
        </div>

        {/* Client Success Stories */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-slate-900 text-center mb-12">Client Success Stories</h3>
          <div className="space-y-8">
            {clientStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{story.company}</h4>
                    <p className="text-slate-600 mb-4">{story.industry}</p>
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-slate-700">Challenge:</span>
                      <p className="text-slate-600 text-sm mt-1">{story.challenge}</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-slate-700">Our Solution:</span>
                      <p className="text-slate-600 text-sm mt-1">{story.solution}</p>
                    </div>
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-lime-600">Results:</span>
                      <p className="text-lime-700 text-sm font-medium mt-1">{story.result}</p>
                    </div>
                  </div>
                  <div>
                    <Quote className="w-8 h-8 text-lime-500 mb-4" />
                    <blockquote className="text-slate-700 italic leading-relaxed text-sm">
                      "{story.quote}"
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Success Stories */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-slate-900 text-center mb-12">Graduate Career Transformations</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {studentStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-lime-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-lime-600">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{story.name}</h4>
                  <p className="text-slate-600">{story.after} at {story.company}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Before:</span>
                    <span className="text-sm font-medium text-slate-900">{story.before}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Program:</span>
                    <span className="text-sm font-medium text-slate-900">{story.program}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Time to Hire:</span>
                    <span className="text-sm font-medium text-lime-600">{story.timeToHire}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Starting Salary:</span>
                    <span className="text-sm font-bold text-slate-900">{story.salary}</span>
                  </div>
                </div>
                
                <blockquote className="text-slate-700 italic text-sm leading-relaxed">
                  "{story.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Write Your Success Story?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of professionals who have transformed their careers with Tech Ascend. 
            Your success story could be next.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center bg-lime-500 text-white px-8 py-4 rounded-lg hover:bg-lime-600 transition-colors font-semibold">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg hover:border-lime-500 hover:text-lime-600 transition-colors font-semibold">
              View More Stories
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;