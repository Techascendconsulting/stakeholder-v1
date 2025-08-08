import React from 'react';
import { Users, BookOpen, Trophy, Clock, ArrowRight, Star } from 'lucide-react';

const TalentDevelopment: React.FC = () => {
  const programs = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      role: "Business Analyst",
      abbreviation: "BA",
      duration: "12 weeks",
      description: "Master the art of bridging business needs with technical solutions. Learn requirements gathering, stakeholder management, and process improvement.",
      skills: [
        "Requirements Analysis",
        "Stakeholder Management", 
        "Process Mapping",
        "Data Analysis",
        "Documentation",
        "BPMN & UML"
      ],
      color: "lime"
    },
    {
      icon: <Users className="w-8 h-8" />,
      role: "Project Manager",
      abbreviation: "PM", 
      duration: "14 weeks",
      description: "Lead projects to success with proven methodologies. Develop skills in planning, execution, monitoring, and team leadership.",
      skills: [
        "Project Planning",
        "Risk Management",
        "Team Leadership",
        "Budget Management",
        "Agile & Waterfall",
        "Communication"
      ],
      color: "slate"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      role: "Product Owner",
      abbreviation: "PO",
      duration: "10 weeks", 
      description: "Shape product vision and strategy. Learn to prioritize features, manage backlogs, and work with development teams.",
      skills: [
        "Product Strategy",
        "Backlog Management",
        "User Story Writing",
        "Stakeholder Communication",
        "Market Analysis",
        "Agile Principles"
      ],
      color: "lime"
    },
    {
      icon: <Star className="w-8 h-8" />,
      role: "Scrum Master",
      abbreviation: "SM",
      duration: "8 weeks",
      description: "Facilitate agile teams to peak performance. Master Scrum framework, coaching techniques, and continuous improvement.",
      skills: [
        "Scrum Framework",
        "Team Coaching",
        "Facilitation",
        "Continuous Improvement",
        "Conflict Resolution",
        "Agile Metrics"
      ],
      color: "slate"
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Live Project Experience",
      description: "Work on real client projects during training"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Industry Mentorship",
      description: "Learn from experienced professionals"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Certification Included",
      description: "Industry-recognized certifications"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Career Support",
      description: "Job placement assistance & networking"
    }
  ];

  return (
    <section id="talent" className="py-20 bg-gradient-to-br from-slate-50 to-lime-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Talent Development Programs
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We support people from all backgrounds to build a tech career they are proud of with 
            industry-recognized training and live project experience at world-renowned businesses.
          </p>
        </div>

        {/* Training Programs Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {programs.map((program, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${
                  program.color === 'lime' ? 'bg-lime-100 text-lime-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {program.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{program.abbreviation}</div>
                  <div className="text-sm text-slate-600">{program.duration}</div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{program.role}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{program.description}</p>
              
              <div className="mb-8">
                <h4 className="font-semibold text-slate-900 mb-3">Key Skills You'll Learn:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {program.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        program.color === 'lime' ? 'bg-lime-500' : 'bg-slate-500'
                      }`}></div>
                      <span className="text-sm text-slate-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button className={`inline-flex items-center w-full justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                program.color === 'lime' 
                  ? 'bg-lime-500 text-white hover:bg-lime-600' 
                  : 'bg-slate-500 text-white hover:bg-slate-600'
              }`}>
                Apply for {program.abbreviation} Training
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* What Sets Us Apart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              What Sets Our Training Apart
            </h3>
            <p className="text-xl text-slate-600">
              We don't just teach theory – we provide real-world experience that makes you job-ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-100 text-lime-600 rounded-xl mb-4">
                  {benefit.icon}
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{benefit.title}</h4>
                <p className="text-slate-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-lime-500 mb-2">95%</div>
            <div className="text-slate-600">Job Placement Rate</div>
            <div className="text-sm text-slate-500 mt-2">Within 6 months of graduation</div>
          </div>
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-slate-600 mb-2">500+</div>
            <div className="text-slate-600">Graduates Placed</div>
            <div className="text-sm text-slate-500 mt-2">Across leading tech companies</div>
          </div>
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-lime-500 mb-2">4.9/5</div>
            <div className="text-slate-600">Student Satisfaction</div>
            <div className="text-sm text-slate-500 mt-2">Based on graduate feedback</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Launch Your Tech Career?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join our next cohort and gain the skills, experience, and confidence needed to succeed 
            in today's competitive tech landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center bg-lime-500 text-white px-8 py-4 rounded-lg hover:bg-lime-600 transition-colors font-semibold">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg hover:border-lime-500 hover:text-lime-600 transition-colors font-semibold">
              Download Brochure
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TalentDevelopment;