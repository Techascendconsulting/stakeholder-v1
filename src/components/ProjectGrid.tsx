import React from 'react';
import ProjectCard, { type Project } from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onProjectSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onProjectSelect={onProjectSelect}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;