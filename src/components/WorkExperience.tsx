import React from 'react';
import { Building, Users, CheckCircle, Award, ArrowRight, Briefcase } from 'lucide-react';

const WorkExperience: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Skills Assessment",
      description: "We evaluate your current skills and identify areas for development to create a personalized learning path."
    },
    {
      step: "02", 
      title: "Intensive Training",
      description: "4-8 weeks of comprehensive training covering theoretical knowledge and practical application."
    },
    {
      step: "03",
      title: "Live Project Assignment",
      description: "Work on real client projects with guidance from experienced mentors and industry professionals."
    },
    {
      step: "04",
      title: "Performance Review",
      description: "Regular feedback sessions to track progress and refine skills based on real-world application."
    },
    {
      step: "05",
      title: "Career Placement",
      description: "Job placement assistance with our extensive network of partner companies across various industries."
    }
  ];

  const features = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Real Client Projects",
      description: "Work on actual business challenges from day one, not just theoretical exercises."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Mentorship",
      description: "Learn from seasoned professionals who guide you through complex project scenarios."
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Industry Exposure",
      description: "Gain experience across multiple sectors including finance, healthcare, and technology."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Portfolio Building",
      description: "Build a compelling portfolio of real project work to showcase to potential employers."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Analyst at TechCorp",
      image: "/api/placeholder/64/64",
      quote: "The work experience program at Tech Ascend was invaluable. I worked on a real digital transformation project that directly prepared me for my current role."
    },
    {
      name: "Michael Chen", 
      role: "Project Manager at InnovateTech",
      image: "/api/placeholder/64/64",
      quote: "What sets Tech Ascend apart is the hands-on experience. I managed an actual project with real stakeholders, which gave me confidence for job interviews."
    },
    {
      name: "Emma Davis",
      role: "Product Owner at StartupXYZ", 
      image: "/api/placeholder/64/64",
      quote: "The mentorship and real-world projects helped me understand the nuances of product ownership that you can't learn from books alone."
    }
  ];

  return (
    <section id="work-experience" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Work Experience Program
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our unique work experience program sets us apart. Trainees work on live client projects, 
            gaining real-world experience that makes them job-ready from day one.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-slate-900 text-center mb-12">How It Works</h3>
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-200 via-lime-500 to-slate-300"></div>
            
            <div className="grid lg:grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500 text-white rounded-full font-bold text-lg mb-4 relative z-10">
                      {step.step}
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-3">{step.title}</h4>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gradient-to-r from-slate-50 to-lime-50 rounded-2xl p-8 lg:p-12 mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Why Our Work Experience Program Works
            </h3>
            <p className="text-xl text-slate-600">
              We bridge the gap between education and employment with hands-on, practical experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-100 text-lime-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-slate-900 text-center mb-12">Graduate Success Stories</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-slate-200 rounded-full mr-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="text-slate-700 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-lime-500 mb-2">95%</div>
            <div className="text-slate-600">Employment Rate</div>
            <div className="text-sm text-slate-500 mt-1">Within 6 months</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-600 mb-2">200+</div>
            <div className="text-slate-600">Live Projects</div>
            <div className="text-sm text-slate-500 mt-1">Completed by trainees</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-lime-500 mb-2">50+</div>
            <div className="text-slate-600">Partner Companies</div>
            <div className="text-sm text-slate-500 mt-1">Providing opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-600 mb-2">£45k</div>
            <div className="text-slate-600">Average Starting Salary</div>
            <div className="text-sm text-slate-500 mt-1">For our graduates</div>
          </div>
        </div>

        {/* Benefits for Companies */}
        <div className="bg-slate-900 rounded-2xl p-8 lg:p-12 text-white">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Partner with Us for Fresh Talent
              </h3>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Companies partnering with our work experience program get access to motivated, 
                well-trained professionals who bring fresh perspectives and proven skills.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3 flex-shrink-0" />
                  <span>Pre-screened and trained candidates</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3 flex-shrink-0" />
                  <span>Reduced hiring and onboarding costs</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3 flex-shrink-0" />
                  <span>Access to diverse talent pipeline</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-lime-400 mr-3 flex-shrink-0" />
                  <span>Ongoing support during placement</span>
                </div>
              </div>
              
              <button className="inline-flex items-center bg-lime-500 text-white px-8 py-4 rounded-lg hover:bg-lime-600 transition-colors font-semibold">
                Become a Partner
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-slate-800 rounded-xl p-8">
                <h4 className="font-semibold text-white mb-6">What Partners Say</h4>
                <blockquote className="text-slate-300 italic mb-4">
                  "Tech Ascend graduates come to us with practical experience and a deep understanding 
                  of real-world challenges. They're productive from day one."
                </blockquote>
                <cite className="text-sm text-slate-400">
                  — HR Director, Fortune 500 Technology Company
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkExperience;