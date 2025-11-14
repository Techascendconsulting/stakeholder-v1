import React from 'react';

interface CompanyLogo {
  name: string;
  logoUrl?: string;
  alt?: string;
}

const companies: CompanyLogo[] = [
  { name: 'NHS', logoUrl: 'https://cdn.simpleicons.org/nhs/FFFFFF', alt: 'NHS' },
  { name: 'Uber', logoUrl: 'https://cdn.simpleicons.org/uber/FFFFFF', alt: 'Uber' },
  { name: 'Barclays', logoUrl: 'https://cdn.simpleicons.org/barclays/FFFFFF', alt: 'Barclays' },
  { name: 'Microsoft', logoUrl: 'https://cdn.simpleicons.org/microsoft/FFFFFF', alt: 'Microsoft' },
  { name: 'Saint Gobain', logoUrl: 'https://cdn.simpleicons.org/saintgobain/FFFFFF', alt: 'Saint Gobain' },
  { name: 'Volkswagen', logoUrl: 'https://cdn.simpleicons.org/volkswagen/FFFFFF', alt: 'Volkswagen' },
  { name: 'Land Rover', logoUrl: 'https://cdn.simpleicons.org/landrover/FFFFFF', alt: 'Land Rover' },
  { name: 'Amazon', logoUrl: 'https://cdn.simpleicons.org/amazon/FFFFFF', alt: 'Amazon' },
  { name: 'Cognizant', logoUrl: 'https://cdn.simpleicons.org/cognizant/FFFFFF', alt: 'Cognizant' },
  { name: 'Sky', logoUrl: 'https://cdn.simpleicons.org/sky/FFFFFF', alt: 'Sky' },
  { name: 'BT', logoUrl: 'https://cdn.simpleicons.org/bt/FFFFFF', alt: 'BT' },
  { name: 'Shopify', logoUrl: 'https://cdn.simpleicons.org/shopify/FFFFFF', alt: 'Shopify' },
  { name: 'Monzo', logoUrl: 'https://cdn.simpleicons.org/monzo/FFFFFF', alt: 'Monzo' },
  { name: 'Airbnb', logoUrl: 'https://cdn.simpleicons.org/airbnb/FFFFFF', alt: 'Airbnb' },
  { name: 'Deliveroo', logoUrl: 'https://cdn.simpleicons.org/deliveroo/FFFFFF', alt: 'Deliveroo' },
  { name: 'Coca-Cola', logoUrl: 'https://cdn.simpleicons.org/cocacola/FFFFFF', alt: 'Coca-Cola' },
  { name: 'NEC Housing', logoUrl: 'https://logo.clearbit.com/nec.co.uk', alt: 'NEC Housing' },
];

const CompanyLogos: React.FC = () => {
  // Split companies into two groups for two rows
  const firstRow = companies.slice(0, Math.ceil(companies.length / 2));
  const secondRow = companies.slice(Math.ceil(companies.length / 2));
  
  // Duplicate each row multiple times for seamless loop
  const duplicatedFirstRow = [...firstRow, ...firstRow, ...firstRow, ...firstRow];
  const duplicatedSecondRow = [...secondRow, ...secondRow, ...secondRow, ...secondRow];

  const renderCompany = (company: CompanyLogo, index: number) => (
    <div
      key={`${company.name}-${index}`}
      className="flex items-center justify-center mx-8 flex-shrink-0"
      style={{ minWidth: '120px' }}
    >
      {company.logoUrl ? (
        <img
          src={company.logoUrl}
          alt={company.alt || company.name}
          className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
          onError={(e) => {
            // Fallback to text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('span')) {
              const span = document.createElement('span');
              span.className = 'text-white font-bold text-lg';
              span.textContent = company.name;
              parent.appendChild(span);
            }
          }}
          loading="lazy"
        />
      ) : (
        <span className="text-white font-bold text-lg">{company.name}</span>
      )}
    </div>
  );

  return (
    <div className="mt-20 mb-16 py-16 px-6 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl">
      <div className="text-center mb-12">
        <p className="text-sm text-purple-200 uppercase tracking-wider mb-2">Where Our Graduates Work</p>
        <h3 className="text-2xl font-bold text-white">Trusted by leading organizations worldwide</h3>
      </div>
      
      {/* Two rows of scrolling marquees */}
      <div className="space-y-6">
        {/* First row - scrolling left */}
        <div className="relative overflow-hidden py-4">
          <div className="flex animate-scroll-left whitespace-nowrap">
            {duplicatedFirstRow.map((company, index) => renderCompany(company, index))}
          </div>
        </div>
        
        {/* Second row - scrolling right */}
        <div className="relative overflow-hidden py-4">
          <div className="flex animate-scroll-right whitespace-nowrap">
            {duplicatedSecondRow.map((company, index) => renderCompany(company, index))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }
        @keyframes scrollRight {
          0% {
            transform: translateX(-25%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-scroll-left {
          animation: scrollLeft 30s linear infinite;
        }
        .animate-scroll-right {
          animation: scrollRight 30s linear infinite;
        }
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default CompanyLogos;

