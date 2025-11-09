import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BAInActionProject = 'cif' | 'voids';

interface BAInActionProjectContextType {
  selectedProject: BAInActionProject;
  setSelectedProject: (project: BAInActionProject) => void;
  hasSelectedProject: boolean;
}

const BAInActionProjectContext = createContext<BAInActionProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'ba_in_action_selected_project';

export const BAInActionProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProject, setSelectedProjectState] = useState<BAInActionProject>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as BAInActionProject) || 'voids'; // Default to beginner-friendly Voids
  });

  const [hasSelectedProject, setHasSelectedProject] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  });

  const setSelectedProject = (project: BAInActionProject) => {
    setSelectedProjectState(project);
    localStorage.setItem(STORAGE_KEY, project);
    setHasSelectedProject(true);
  };

  return (
    <BAInActionProjectContext.Provider value={{ selectedProject, setSelectedProject, hasSelectedProject }}>
      {children}
    </BAInActionProjectContext.Provider>
  );
};

export const useBAInActionProject = () => {
  const context = useContext(BAInActionProjectContext);
  if (!context) {
    throw new Error('useBAInActionProject must be used within BAInActionProjectProvider');
  }
  return context;
};

