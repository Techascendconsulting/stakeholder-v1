import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { InlineWidget } from "react-calendly";

type Session = {
  id: string;
  title: string;
  duration: string;
  description: string;
  freeUrl: string;
  paidUrl: string;
};

const sessions: Session[] = [
  {
    id: "career",
    title: "Career Clarity Call",
    duration: "30 mins",
    description: "Get guidance on your career path and next steps.",
    freeUrl: "https://calendly.com/demo/30min",
    paidUrl: "https://calendly.com/demo/30min",
  },
  {
    id: "project",
    title: "Project Guidance",
    duration: "45 mins",
    description: "Work through your current BA project challenges with a mentor.",
    freeUrl: "https://calendly.com/demo/45min",
    paidUrl: "https://calendly.com/demo/45min",
  },
  {
    id: "interview",
    title: "Interview Preparation",
    duration: "1 hour",
    description: "Practice stakeholder-style interviews with feedback.",
    freeUrl: "https://calendly.com/demo/60min",
    paidUrl: "https://calendly.com/demo/60min",
  },
  {
    id: "cv",
    title: "CV / Portfolio Review",
    duration: "30 mins",
    description: "Receive detailed feedback on your CV, LinkedIn, or portfolio.",
    freeUrl: "https://calendly.com/demo/30min",
    paidUrl: "https://calendly.com/demo/30min",
  },
];

const BookSession: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Fetch logged-in user + profile
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role, mentorship_credits")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    getUser();
  }, []);

  // Detect theme changes
  useEffect(() => {
    // Get elements outside the function scope
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    const checkTheme = () => {
      // Check multiple possible theme indicators
      const isDark = 
        htmlElement.classList.contains('dark') ||
        bodyElement.classList.contains('dark') ||
        htmlElement.getAttribute('data-theme') === 'dark' ||
        bodyElement.getAttribute('data-theme') === 'dark' ||
        htmlElement.style.colorScheme === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      console.log('🔍 Theme detection:', {
        htmlClass: htmlElement.classList.contains('dark'),
        bodyClass: bodyElement.classList.contains('dark'),
        htmlDataTheme: htmlElement.getAttribute('data-theme'),
        bodyDataTheme: bodyElement.getAttribute('data-theme'),
        colorScheme: htmlElement.style.colorScheme,
        systemPrefers: window.matchMedia('(prefers-color-scheme: dark)').matches,
        result: isDark
      });
      
      setIsDarkMode(isDark);
    };
    
    // Check initial theme
    checkTheme();
    
    // Watch for theme changes on both html and body
    const observer = new MutationObserver(checkTheme);
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style']
    });
    observer.observe(bodyElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style']
    });
    
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  const handleBooking = (session: Session) => {
    console.log('🎯 Booking session:', session.title);
    console.log('🎯 Profile:', profile);
    console.log('🎯 Credits:', profile?.mentorship_credits);
    
    // Set the selected session to show the modal with Calendly
    setSelectedSession(session);
  };

  const handleBookingSuccess = async () => {
    if (!profile || !selectedSession) return;
    
    try {
      // Use free credit
      await supabase.from("profiles")
        .update({ mentorship_credits: profile.mentorship_credits - 1 })
        .eq("id", user.id);

      // Log booking
      await supabase.from("bookings").insert({
        user_id: user.id,
        session_type: selectedSession.title,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 30*60000).toISOString(),
      });

      alert(`Booked with free credit! Remaining credits: ${profile.mentorship_credits - 1}`);
      setSelectedSession(null);
    } catch (error) {
      console.error('❌ Error logging booking:', error);
    }
  };
  
  // Generate Calendly URL with theme parameters
  const getCalendlyUrl = (session: Session) => {
    // Determine which URL to use based on user status
    let baseUrl: string;
    if (!profile) {
      // Guests always use paid URL
      baseUrl = session.paidUrl;
    } else if (profile.mentorship_credits > 0) {
      // Users with credits use free URL
      baseUrl = session.freeUrl;
    } else {
      // Users without credits use paid URL
      baseUrl = session.paidUrl;
    }
    
    const themeParams = isDarkMode 
      ? '&background_color=1f2937&primary_color=7c3aed&text_color=f9fafb'
      : '&background_color=ffffff&primary_color=7c3aed&text_color=1f2937';
    
    return `${baseUrl}?embed_domain=${window.location.hostname}&embed_type=Inline&hide_landing_page_details=1&hide_gdpr_banner=1${themeParams}`;
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Book a Session
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose the session type that best supports your journey
            </p>
            {profile && (
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                You have <strong>{profile.mentorship_credits}</strong> free session credits remaining.
              </p>
            )}
            {!profile && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Guests can book paid sessions below.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Session Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col justify-between border border-gray-200 dark:border-gray-700"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {session.title}
                </h2>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-3">
                  ⏱️ {session.duration}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{session.description}</p>
              </div>
              <button
                onClick={() => handleBooking(session)}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition"
              >
                Select This Session
              </button>
            </div>
          ))}
        </div>

        {/* Calendly Modal */}
        {selectedSession && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedSession(null)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-3xl w-full p-6 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Book {selectedSession.title}
                </h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              {/* Show booking info */}
              {profile && profile.mentorship_credits > 0 && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    🎉 You have {profile.mentorship_credits} free credits! This session will use one credit.
                  </p>
                </div>
              )}
              
              {!profile && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💳 This is a paid session. You'll be redirected to complete payment.
                  </p>
                </div>
              )}
              
              <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900" style={{ height: '700px' }}>
                <InlineWidget 
                  url={profile && profile.mentorship_credits > 0 ? selectedSession.freeUrl : selectedSession.paidUrl}
                  pageSettings={{
                    backgroundColor: isDarkMode ? '1f2937' : 'ffffff',
                    primaryColor: '7c3aed',
                    textColor: isDarkMode ? 'f9fafb' : '1f2937',
                  }}
                  prefill={{
                    email: user?.email || '',
                    firstName: user?.user_metadata?.first_name || '',
                    lastName: user?.user_metadata?.last_name || '',
                  }}
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookSession;
