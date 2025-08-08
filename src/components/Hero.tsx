import React from 'react';
import { ArrowRight, Users, Briefcase, TrendingUp, Award } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-slate-50 via-white to-lime-50 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-lime-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          {/* Content */}
          <div className="max-w-2xl">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-lime-100 text-lime-800 rounded-full text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                Leading Tech Talent Solutions
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Powering the people behind 
              <span className="text-lime-500"> tech innovation</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Tech Ascend Consultancy is a forward-thinking company blending cutting-edge software solutions 
              with transformative talent development. We're your consulting partner and talent incubator, 
              training the next generation of Business Analysts, Project Managers, Product Owners, and Scrum Masters.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="inline-flex items-center justify-center bg-lime-500 text-white px-8 py-4 rounded-lg hover:bg-lime-600 transition-colors font-semibold text-lg">
                Explore Our Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg hover:border-lime-500 hover:text-lime-600 transition-colors font-semibold text-lg">
                Apply for Training
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
                <div className="text-sm text-slate-600">Professionals Trained</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">50+</div>
                <div className="text-sm text-slate-600">Client Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">95%</div>
                <div className="text-sm text-slate-600">Job Placement Rate</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="mt-12 lg:mt-0">
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Our Impact</h3>
                  <div className="flex items-center text-lime-600">
                    <TrendingUp className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Growing</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-lime-100 rounded-lg mr-4">
                      <Briefcase className="w-6 h-6 text-lime-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Consulting Excellence</h4>
                      <p className="text-sm text-slate-600">Digital transformation & agile coaching</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg mr-4">
                      <Users className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Talent Development</h4>
                      <p className="text-sm text-slate-600">BA, PM, PO & SM training programs</p>
                    </div>
                  </div>
                </div>

                {/* Progress indicators */}
                <div className="mt-8 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">Training Success Rate</span>
                      <span className="text-slate-900 font-medium">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-lime-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">Client Satisfaction</span>
                      <span className="text-slate-900 font-medium">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Partners Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-10">
          <p className="text-slate-600 text-lg">Trusted by forward-thinking organizations</p>
        </div>
        
        <div className="flex justify-center items-center space-x-12 opacity-60">
          {/* Placeholder for partner logos */}
          <div className="w-32 h-12 bg-slate-200 rounded flex items-center justify-center">
            <span className="text-slate-500 font-medium">Partner 1</span>
          </div>
          <div className="w-32 h-12 bg-slate-200 rounded flex items-center justify-center">
            <span className="text-slate-500 font-medium">Partner 2</span>
          </div>
          <div className="w-32 h-12 bg-slate-200 rounded flex items-center justify-center">
            <span className="text-slate-500 font-medium">Partner 3</span>
          </div>
          <div className="w-32 h-12 bg-slate-200 rounded flex items-center justify-center">
            <span className="text-slate-500 font-medium">Partner 4</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;