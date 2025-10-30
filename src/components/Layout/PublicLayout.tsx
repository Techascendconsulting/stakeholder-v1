import React from 'react';
import { GraduationCap, HelpCircle, Mail } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
  active?: 'home' | 'faq' | 'contact';
  onHome?: () => void;
  onFAQClick?: () => void;
  onContactClick?: () => void;
}

export default function PublicLayout({ children, active, onHome, onFAQClick, onContactClick }: PublicLayoutProps) {
  const goHome = () => {
    if (onHome) onHome();
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRequestAccess = () => {
    try {
      window.dispatchEvent(new CustomEvent('openRequestAccess'));
      localStorage.setItem('openRequestAccess', '1');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg stable-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={goHome} className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">BA WorkXP</span>
            </button>

            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={goHome}
                className={"font-medium transition-all duration-300 hover:scale-105 " + (active==='home' ? 'text-purple-600 cursor-default' : 'text-gray-600 hover:text-purple-600')}
              >
                Home
              </button>
              <button 
                onClick={() => { if (onHome) onHome(); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Features
              </button>
              <button 
                onClick={() => { if (onHome) onHome(); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                How It Works
              </button>
              <button 
                onClick={() => { if (onHome) onHome(); setTimeout(() => document.getElementById('success')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105"
              >
                Success Stories
              </button>
              <button 
                onClick={() => { if (onFAQClick) onFAQClick(); }}
                className={"font-medium transition-all duration-300 hover:scale-105 " + (active==='faq' ? 'text-purple-600 cursor-default' : 'text-gray-600 hover:text-purple-600')}
              >
                FAQ
              </button>
              <button 
                onClick={() => { if (onContactClick) onContactClick(); }}
                className={"font-medium transition-all duration-300 hover:scale-105 " + (active==='contact' ? 'text-purple-600 cursor-default' : 'text-gray-600 hover:text-purple-600')}
              >
                Contact Us
              </button>
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={openRequestAccess}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-medium inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}


