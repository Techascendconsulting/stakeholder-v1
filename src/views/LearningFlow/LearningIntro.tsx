import React, { useState, useEffect } from 'react';
import type { AppView } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowRight, ArrowLeft, BookOpen, CheckCircle, Target, TrendingUp } from 'lucide-react';

const LearningIntro: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');

  const handleContinue = () => {
    void setCurrentView('learning-flow');
  };

  const handleBack = () => {
    void setCurrentView('dashboard');
  };

  // Load user type
  useEffect(() => {
    const loadUserType = async () => {
      if (!user?.id) return;
      
      try {
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        
        if (userData) {
          setUserType(userData.user_type || 'existing');
        }
      } catch (error) {
        console.error('Error loading user type:', error);
        setUserType('existing'); // Default to existing on error
      }
    };

    void loadUserType();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-white/90 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Main Content Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Image Section */}
            <div className="relative h-full min-h-[500px] md:min-h-[600px]">
              <img 
                src="/images/home2.jpg" 
                alt="Learning and growth"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-800/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Structured Learning Path</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Build Your BA Foundation</h3>
                <p className="text-white/90 text-sm">Master the core concepts that every Business Analyst needs to know</p>
              </div>
            </div>

            {/* Right: Content Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full border border-blue-200 dark:border-blue-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Your Learning Journey</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Master Business Analysis Step by Step
                </h1>

                {/* Description */}
                <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    This learning journey takes you through 11 essential modules, from understanding what a BA does to mastering Agile delivery.
                  </p>
                  <p>
                    Each module builds on the last, giving you a complete foundation in Business Analysis. Learn at your own pace, track your progress, and unlock new modules as you complete each one.
                  </p>
                  {userType === 'new' && (
                    <p className="text-base font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                      Unlocks elicitation practice after completion of 3 modules
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">11 comprehensive modules</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">From BA fundamentals to Agile delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mt-0.5">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Progress tracking</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">See what you've completed and what's next</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mt-0.5">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Structured path</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Each module unlocks the next as you progress</p>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-6">
                  <button
                    onClick={handleContinue}
                    className="group w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all transform hover:-translate-y-0.5 hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <span>Start Learning Journey</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningIntro;

