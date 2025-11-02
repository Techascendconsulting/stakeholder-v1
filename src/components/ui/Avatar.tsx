import React from 'react';

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
};

interface AvatarImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className = '' }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
    />
  );
};

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 ${className}`}>
      {children}
    </div>
  );
};