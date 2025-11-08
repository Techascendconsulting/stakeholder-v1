import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ asChild, children }) => {
  const { setIsOpen } = React.useContext(TooltipContext);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    });
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ side = 'top', className = '', children }) => {
  const { isOpen } = React.useContext(TooltipContext);

  if (!isOpen) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  };

  return (
    <div
      className={`absolute z-50 ${positionClasses[side]} px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg shadow-lg whitespace-normal border border-gray-200 dark:border-gray-600 ${className}`}
    >
      {children}
      <div className={`absolute w-2 h-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rotate-45 ${arrowClasses[side]}`} style={{
        borderWidth: side === 'right' ? '0 1px 1px 0' : side === 'left' ? '1px 0 0 1px' : side === 'bottom' ? '1px 1px 0 0' : '0 0 1px 1px'
      }} />
    </div>
  );
};


interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ asChild, children }) => {
  const { setIsOpen } = React.useContext(TooltipContext);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    });
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ side = 'top', className = '', children }) => {
  const { isOpen } = React.useContext(TooltipContext);

  if (!isOpen) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  };

  return (
    <div
      className={`absolute z-50 ${positionClasses[side]} px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg shadow-lg whitespace-normal border border-gray-200 dark:border-gray-600 ${className}`}
    >
      {children}
      <div className={`absolute w-2 h-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rotate-45 ${arrowClasses[side]}`} style={{
        borderWidth: side === 'right' ? '0 1px 1px 0' : side === 'left' ? '1px 0 0 1px' : side === 'bottom' ? '1px 1px 0 0' : '0 0 1px 1px'
      }} />
    </div>
  );
};


interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ asChild, children }) => {
  const { setIsOpen } = React.useContext(TooltipContext);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    });
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ side = 'top', className = '', children }) => {
  const { isOpen } = React.useContext(TooltipContext);

  if (!isOpen) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  };

  return (
    <div
      className={`absolute z-50 ${positionClasses[side]} px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg shadow-lg whitespace-normal border border-gray-200 dark:border-gray-600 ${className}`}
    >
      {children}
      <div className={`absolute w-2 h-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rotate-45 ${arrowClasses[side]}`} style={{
        borderWidth: side === 'right' ? '0 1px 1px 0' : side === 'left' ? '1px 0 0 1px' : side === 'bottom' ? '1px 1px 0 0' : '0 0 1px 1px'
      }} />
    </div>
  );
};


interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ asChild, children }) => {
  const { setIsOpen } = React.useContext(TooltipContext);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    });
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ side = 'top', className = '', children }) => {
  const { isOpen } = React.useContext(TooltipContext);

  if (!isOpen) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  };

  return (
    <div
      className={`absolute z-50 ${positionClasses[side]} px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg shadow-lg whitespace-normal border border-gray-200 dark:border-gray-600 ${className}`}
    >
      {children}
      <div className={`absolute w-2 h-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rotate-45 ${arrowClasses[side]}`} style={{
        borderWidth: side === 'right' ? '0 1px 1px 0' : side === 'left' ? '1px 0 0 1px' : side === 'bottom' ? '1px 1px 0 0' : '0 0 1px 1px'
      }} />
    </div>
  );
};

