import React from 'react';

interface AvatarProps {
  userId: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  userId, 
  email, 
  size = 'md',
  className = '' 
}) => {
  const getInitials = (email?: string) => {
    if (!email) return '?';
    
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  const getBackgroundColor = (userId: string) => {
    // Generate consistent color based on user ID
    const colors = [
      'bg-violet-600',
      'bg-blue-600', 
      'bg-green-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-indigo-600',
      'bg-teal-600',
      'bg-orange-600',
      'bg-red-600',
      'bg-cyan-600'
    ];
    
    // Simple hash function for consistent color assignment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // For AI-generated content, use a special avatar
  if (userId === 'ai') {
    return (
      <div className={`${getSizeClasses()} ${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  // For system-generated content, use a different avatar
  if (userId === 'system') {
    return (
      <div className={`${getSizeClasses()} ${className} bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${getSizeClasses()} ${getBackgroundColor(userId)} ${className} rounded-full flex items-center justify-center text-white font-medium shadow-sm`}>
      {getInitials(email)}
    </div>
  );
};

export default Avatar;
