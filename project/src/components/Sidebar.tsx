import React from 'react';
import { 
  BarChart3, 
  BookOpen, 
  FolderOpen, 
  Zap, 
  Plus, 
  Target, 
  Users, 
  Moon 
} from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">BA Interview</h2>
            <p className="text-sm text-purple-200">Pro</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-purple-200">
          Professional Development
        </div>
        
        <div className="mt-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs">TEST MODE</span>
          <span className="text-xs text-purple-200">(85% cheaper)</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
          <Moon className="w-5 h-5" />
          <span className="text-sm">Dark Mode</span>
        </button>
        
        <div className="pt-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Dashboard</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">Core BA Concepts</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
            <FolderOpen className="w-5 h-5" />
            <span className="text-sm">Training Projects</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-purple-500/30 transition-colors">
            <Zap className="w-5 h-5" />
            <span className="text-sm">ElevenLabs Multi-Agent</span>
            <span className="bg-green-500 text-xs px-2 py-1 rounded-full">NEW</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Create Your Project</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
            <Target className="w-5 h-5" />
            <span className="text-sm">Agile Hub</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
            <Users className="w-5 h-5" />
            <span className="text-sm">My Meetings</span>
          </button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-purple-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">admin</p>
            <p className="text-xs text-purple-200">Business Analyst</p>
          </div>
        </div>
      </div>
    </div>
  );
}