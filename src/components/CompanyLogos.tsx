import React from 'react';

interface CompanyLogo {
  name: string;
  logoUrl?: string;
  alt?: string;
}

const companies: CompanyLogo[] = [
  { name: 'NHS', logoUrl: '/logos/nhs.svg', alt: 'NHS' },
  { name: 'Uber', logoUrl: '/logos/uber.svg', alt: 'Uber' },
  { name: 'Barclays', logoUrl: '/logos/barclays.svg', alt: 'Barclays' },
  { name: 'Microsoft', logoUrl: '/logos/microsoft.svg', alt: 'Microsoft' },
  { name: 'Saint Gobain', logoUrl: '/logos/saint-gobain.svg', alt: 'Saint Gobain' },
  { name: 'Volkswagen', logoUrl: '/logos/volkswagen.svg', alt: 'Volkswagen' },
  { name: 'Land Rover', logoUrl: '/logos/land-rover.svg', alt: 'Land Rover' },
  { name: 'Amazon', logoUrl: '/logos/amazon.svg', alt: 'Amazon' },
  { name: 'Cognizant', logoUrl: '/logos/cognizant.svg', alt: 'Cognizant' },
  { name: 'Sky', logoUrl: '/logos/sky.svg', alt: 'Sky' },
  { name: 'BT', logoUrl: '/logos/bt.svg', alt: 'BT' },
];

const CompanyLogos: React.FC = () => {
  // Duplicate companies array for seamless loop
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <div className="mt-20 mb-16">
      <div className="text-center mb-12">
        <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Where Our Graduates Work</p>
        <h3 className="text-2xl font-bold text-white">Trusted by leading organizations worldwide</h3>
      </div>
      
      {/* Scrolling marquee container */}
      <div className="relative overflow-hidden py-8">
        <div className="flex animate-scroll whitespace-nowrap">
          {duplicatedCompanies.map((company, index) => (
            <div
              key={`${company.name}-${index}`}
              className="flex items-center justify-center mx-8 flex-shrink-0"
              style={{ minWidth: '120px' }}
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.alt || company.name}
                  className="h-12 w-auto object-contain filter brightness-0"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('span')) {
                      const span = document.createElement('span');
                      span.className = 'text-black dark:text-white font-bold text-lg';
                      span.textContent = company.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="text-black dark:text-white font-bold text-lg">{company.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default CompanyLogos;

