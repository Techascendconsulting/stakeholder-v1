import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Project } from '../types/meeting';

interface ProjectSelectionProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

export default function ProjectSelection({ projects, onProjectSelect }: ProjectSelectionProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Stakeholder Conversations</h1>
            <p className="text-lg text-indigo-600 mb-4">The Core Skill for Business Analysts</p>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">
              Business Analysts solve problems by working with people — not just writing documents. To do this well, you 
              need to confidently ask the right questions, guide conversations, and uncover the real issues hiding beneath the surface.
            </p>
            <p className="text-gray-600 max-w-3xl mx-auto">
              This practice space helps you develop exactly that. You'll choose realistic projects, meet with stakeholders, and 
              improve your confidence by doing — not memorising.
            </p>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Skip to Projects →
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white px-6 py-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Realistic scenarios</h3>
              <p className="text-sm text-gray-600">Practice with real-world business challenges</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-powered stakeholders</h3>
              <p className="text-sm text-gray-600">Interact with intelligent stakeholder personas</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe practice environment</h3>
              <p className="text-sm text-gray-600">Learn without real-world consequences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Challenge Level</h2>
            <p className="text-gray-600">Choose the complexity that matches your experience and goals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all cursor-pointer ${
                project.status === 'active' ? 'border-indigo-500' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                {project.status === 'active' && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full mb-4 inline-block">
                    ACTIVE
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-500">
                      {project.id === '1' ? '📊 Intermediate' : project.id === '2' ? '📈 Advanced' : '🎯 Beginner'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">💰 Business Impact</span>
                    <span className="font-medium">{project.businessImpact}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">📊 ROI Potential</span>
                    <span className="font-medium">{project.roiPotential}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.priority === 'High Priority' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {project.priority}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {project.tier}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onProjectSelect(project)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    project.status === 'active'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <span>{project.status === 'active' ? 'Continue Journey' : 'Start Project'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}