import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  characterImage?: string;
  variant: "purple" | "green" | "orange" | "blue" | "red";
  acronym: string;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  title, 
  description, 
  characterImage, 
  variant, 
  acronym, 
  onClick 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "purple":
        return {
          gradient: "bg-gradient-to-br from-purplePrimary to-purpleSecondary",
          icon: "bg-gradient-to-br from-purplePrimary to-purpleSecondary",
          button: "from-purplePrimary to-purpleSecondary"
        };
      case "green":
        return {
          gradient: "bg-gradient-to-br from-greenPrimary to-greenSecondary",
          icon: "bg-gradient-to-br from-greenPrimary to-greenSecondary",
          button: "from-greenPrimary to-greenSecondary"
        };
      case "orange":
        return {
          gradient: "bg-gradient-to-br from-orangePrimary to-orangeSecondary", 
          icon: "bg-gradient-to-br from-orangePrimary to-orangeSecondary",
          button: "from-orangePrimary to-orangeSecondary"
        };
      case "blue":
        return {
          gradient: "bg-gradient-to-br from-bluePrimary to-blueSecondary",
          icon: "bg-gradient-to-br from-bluePrimary to-blueSecondary",
          button: "from-bluePrimary to-blueSecondary"
        };
      case "red":
        return {
          gradient: "bg-gradient-to-br from-redPrimary to-redSecondary",
          icon: "bg-gradient-to-br from-redPrimary to-redSecondary",
          button: "from-redPrimary to-redSecondary"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <article 
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      {/* Character Illustration */}
      <div className="relative mb-6 h-48 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
        {characterImage ? (
          <img 
            src={characterImage} 
            alt={`${title} illustration`}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-20 h-20 ${styles.gradient} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold text-2xl">{acronym}</span>
            </div>
          </div>
        )}
        
        {/* Acronym Badge */}
        <div className={`absolute top-4 right-4 w-12 h-12 ${styles.icon} rounded-xl flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-sm">{acronym}</span>
        </div>
      </div>

      {/* Content */}
      <header className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </header>

      {/* Action Button */}
      <button 
        className={`w-full bg-gradient-to-r ${styles.button} text-white border-0 hover:opacity-90 font-medium py-3 rounded-xl transition-all duration-300 group-hover:shadow-md flex items-center justify-center`}
      >
        <span>Select Project</span>
        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </article>
  );
};

export default ProjectCard;