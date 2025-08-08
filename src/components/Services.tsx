import React from 'react';
import { Code, Zap, Target, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Software Solutions",
      description: "Custom software development and technology consulting to accelerate your digital transformation journey.",
      features: [
        "Custom Application Development",
        "Legacy System Modernization",
        "Cloud Migration & Integration",
        "API Development & Management"
      ],
      color: "lime"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Digital Transformation",
      description: "Comprehensive digital transformation strategies that drive innovation and competitive advantage.",
      features: [
        "Digital Strategy Development",
        "Process Automation",
        "Technology Assessment",
        "Change Management"
      ],
      color: "slate"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Agile Coaching",
      description: "Expert agile coaching to help organizations adopt and scale agile methodologies effectively.",
      features: [
        "Agile Transformation",
        "Scrum Implementation",
        "Team Coaching",
        "Performance Optimization"
      ],
      color: "lime"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Business Analysis",
      description: "Strategic business analysis services to identify opportunities and optimize business processes.",
      features: [
        "Requirements Analysis",
        "Process Improvement",
        "Stakeholder Management",
        "Risk Assessment"
      ],
      color: "slate"
    }
  ];

  const industries = [
    { name: "Financial Services", projects: "15+" },
    { name: "Healthcare", projects: "12+" },
    { name: "Technology", projects: "20+" },
    { name: "Manufacturing", projects: "8+" },
    { name: "Retail & E-commerce", projects: "10+" },
    { name: "Government", projects: "6+" }
  ];

  return (
    <section id="consulting" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Consulting Services
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We help businesses accelerate innovation, enhance productivity, and drive growth through our 
            AI-enabled consulting expertise and proven methodologies.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${
                service.color === 'lime' ? 'bg-lime-100 text-lime-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {service.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>
              
              <ul className="space-y-3 mb-8">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-lime-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`inline-flex items-center text-sm font-semibold transition-colors ${
                service.color === 'lime' 
                  ? 'text-lime-600 hover:text-lime-700' 
                  : 'text-slate-600 hover:text-slate-700'
              }`}>
                Learn More
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Industries Served */}
        <div className="bg-gradient-to-r from-slate-50 to-lime-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Industries We Serve</h3>
            <p className="text-xl text-slate-600">
              Our expertise spans across multiple industries, delivering tailored solutions that drive results.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-slate-900 mb-2">{industry.name}</h4>
                <p className="text-sm text-slate-600">{industry.projects} Projects</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Let's discuss how our consulting services can help accelerate your digital transformation 
            and drive sustainable growth for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center bg-lime-500 text-white px-8 py-4 rounded-lg hover:bg-lime-600 transition-colors font-semibold">
              Schedule Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg hover:border-lime-500 hover:text-lime-600 transition-colors font-semibold">
              View Case Studies
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;