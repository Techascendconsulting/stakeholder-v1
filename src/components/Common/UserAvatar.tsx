import React from 'react';
import { getUserProfilePhoto, getUserDisplayName } from '../../utils/profileUtils';

interface UserAvatarProps {
  userId: string;
  email?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  email, 
  size = 'md', 
  className = '',
  showBorder = false 
}) => {
  const profilePhoto = getUserProfilePhoto(userId);
  const displayName = getUserDisplayName(userId, email);
  const sizeClass = sizeClasses[size];
  const borderClass = showBorder ? 'border-2 border-white shadow-lg' : '';

  if (profilePhoto) {
    return (
      <img
        src={profilePhoto}
        alt={`${displayName}'s profile`}
        className={`${sizeClass} rounded-lg object-cover ${borderClass} ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ${borderClass} ${className}`}>
      {displayName?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
};

export default UserAvatar;