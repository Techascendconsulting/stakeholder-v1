import React from 'react';

interface ProgressBarProps {
  percent: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percent, 
  className = '', 
  barClassName = '',
  showLabel = false 
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out ${barClassName}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {clampedPercent.toFixed(0)}%
        </p>
      )}
    </div>
  );
};


interface ProgressBarProps {
  percent: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percent, 
  className = '', 
  barClassName = '',
  showLabel = false 
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out ${barClassName}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {clampedPercent.toFixed(0)}%
        </p>
      )}
    </div>
  );
};


interface ProgressBarProps {
  percent: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percent, 
  className = '', 
  barClassName = '',
  showLabel = false 
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out ${barClassName}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {clampedPercent.toFixed(0)}%
        </p>
      )}
    </div>
  );
};


interface ProgressBarProps {
  percent: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percent, 
  className = '', 
  barClassName = '',
  showLabel = false 
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out ${barClassName}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {clampedPercent.toFixed(0)}%
        </p>
      )}
    </div>
  );
};













