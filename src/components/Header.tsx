import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-800">
              Tech Ascend <span className="text-lime-500">Consultancy</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#home" className="text-slate-700 hover:text-lime-500 transition-colors font-medium">
              Home
            </a>
            
            <div className="relative">
              <button
                onClick={() => handleDropdown('consulting')}
                className="flex items-center text-slate-700 hover:text-lime-500 transition-colors font-medium"
              >
                Consulting Services
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === 'consulting' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg py-2 z-10">
                  <a href="#software-solutions" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Software Solutions
                  </a>
                  <a href="#digital-transformation" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Digital Transformation
                  </a>
                  <a href="#agile-coaching" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Agile Coaching
                  </a>
                  <a href="#business-analysis" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Business Analysis
                  </a>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => handleDropdown('talent')}
                className="flex items-center text-slate-700 hover:text-lime-500 transition-colors font-medium"
              >
                Talent Development
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === 'talent' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg py-2 z-10">
                  <a href="#ba-training" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Business Analyst Training
                  </a>
                  <a href="#pm-training" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Project Manager Training
                  </a>
                  <a href="#po-training" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Product Owner Training
                  </a>
                  <a href="#sm-training" className="block px-4 py-2 text-slate-700 hover:bg-lime-50 hover:text-lime-600">
                    Scrum Master Training
                  </a>
                </div>
              )}
            </div>

            <a href="#work-experience" className="text-slate-700 hover:text-lime-500 transition-colors font-medium">
              Work Experience
            </a>
            <a href="#success-stories" className="text-slate-700 hover:text-lime-500 transition-colors font-medium">
              Success Stories
            </a>
            <a href="#resources" className="text-slate-700 hover:text-lime-500 transition-colors font-medium">
              Resources
            </a>
            <a href="#contact" className="text-slate-700 hover:text-lime-500 transition-colors font-medium">
              Contact Us
            </a>
            
            <button className="bg-lime-500 text-white px-6 py-2 rounded-lg hover:bg-lime-600 transition-colors font-medium">
              Apply Now
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-slate-700 hover:text-lime-500 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              <a href="#home" className="block text-slate-700 hover:text-lime-500 transition-colors font-medium">
                Home
              </a>
              <a href="#consulting" className="block text-slate-700 hover:text-lime-500 transition-colors font-medium">
                Consulting Services
              </a>
              <a href="#talent" className="block text-slate-700 hover:text-lime-500 transition-colors font-medium">
                Talent Development
              </a>
              <a href="#work-experience" className="block text-slate-700 hover:text-lime-500 transition-colors font-medium">
                Work Experience
              </a>
              <a href="#success-stories" className="block text-slate-700 hover:text-lime-500 transition-colors font-medium">
                Success Stories
              </a>
              <a href="#resources" className="block text-slate-700 hover:text-lime-500 transition-colors font-medium">
                Resources
              </a>
              <a href="#contact" className="block text-slate-700 hover:text-lime-500 transition-colors font-medium">
                Contact Us
              </a>
              <button className="w-full bg-lime-500 text-white px-6 py-2 rounded-lg hover:bg-lime-600 transition-colors font-medium">
                Apply Now
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;