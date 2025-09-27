import React, { useState } from "react";
import { Search, ExternalLink } from 'lucide-react';

type Resource = {
  title: string;
  url: string;
  description: string;
};

type Section = {
  section: string;
  items: Resource[];
};

const referenceData: Section[] = [
  {
    section: "Business Analysis Core Books",
    items: [
      {
        title: "BABOK Guide (IIBA)",
        url: "https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/babok/",
        description: "The global reference standard for Business Analysis.",
      },
      {
        title: "Business Analysis (4th Edition), BCS",
        url: "https://www.bcs.org/books/business-analysis-4th-edition/",
        description: "Comprehensive handbook by Paul, Cadle, Eva, et al.",
      },
      {
        title: "Business Analysis Techniques: 72 Essential Tools, BCS",
        url: "https://www.bcs.org/books/business-analysis-techniques-72-essential-tools-for-success-2nd-edition/",
        description: "Toolkit covering 72 essential BA techniques.",
      },
      {
        title: "Handbook of Requirements and Business Analysis, Springer",
        url: "https://link.springer.com/book/10.1007/978-3-030-15577-3",
        description: "In-depth guide on requirements and BA practices.",
      },
      {
        title: "Seven Steps to Mastering Business Analysis, Barbara Carkenord",
        url: "https://www.amazon.co.uk/Seven-Steps-Mastering-Business-Analysis/dp/013708134X/",
        description: "Step-by-step practical BA guide.",
      },
      {
        title: "Business Analysis for Practitioners: A Practice Guide, PMI",
        url: "https://www.pmi.org/pmbok-guide-standards/foundational/business-analysis",
        description: "PMI's practice guide to business analysis.",
      },
      {
        title: "Business Analysis: Best Practices for Success, Steven Blais",
        url: "https://www.wiley.com/en-gb/Business+Analysis:+Best+Practices+for+Success-p-9781118161555",
        description: "Best practices reference for successful BA work.",
      },
    ],
  },
  {
    section: "Scrum & Agile Authoritative Sources",
    items: [
      {
        title: "The Scrum Guide (Official PDF)",
        url: "https://scrumguides.org/",
        description: "The official guide to Scrum by Schwaber & Sutherland.",
      },
      {
        title: "Agile Practice Guide, PMI & Agile Alliance",
        url: "https://www.pmi.org/pmbok-guide-standards/foundational/agile-practice-guide",
        description: "PMI and Agile Alliance's official Agile guide.",
      },
      {
        title: "Agile Estimating and Planning, Mike Cohn",
        url: "https://www.amazon.co.uk/Agile-Estimating-Planning-Mike-Cohn/dp/0131479415/",
        description: "How to plan and estimate in Agile projects.",
      },
      {
        title: "User Stories Applied, Mike Cohn",
        url: "https://www.pearson.com/en-us/subject-catalog/p/user-stories-applied/P200000003461/9780321205681",
        description: "Practical guide to writing and using user stories.",
      },
      {
        title: "Agile and Business Analysis, BCS",
        url: "https://www.bcs.org/books/agile-and-business-analysis-practical-guidance-for-it-and-business-teams/",
        description: "Guidance on BA practices in Agile contexts.",
      },
      {
        title: "Essential Scrum, Kenneth Rubin",
        url: "https://www.amazon.co.uk/Essential-Scrum-Practical-Popular-Process/dp/0137043295/",
        description: "Comprehensive guide to Scrum practices.",
      },
    ],
  },
  {
    section: "Cheat Sheets & Toolkits",
    items: [
      {
        title: "IIBA Template Library",
        url: "https://www.iiba.org/business-analysis-resources/templates/",
        description: "Official BA templates (requirements, stakeholders, traceability).",
      },
      {
        title: "Agile Business Consortium – MoSCoW Prioritisation",
        url: "https://www.agilebusiness.org/page/ProjectFramework_MoSCoWPrioritisation",
        description: "Guide to using MoSCoW prioritisation.",
      },
      {
        title: "Scrum Guide Quick Reference (Official PDF)",
        url: "https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf",
        description: "The official Scrum quick reference PDF.",
      },
      {
        title: "SMART Goals Framework – MindTools",
        url: "https://www.mindtools.com/a4wo118/smart-goals",
        description: "Framework for setting SMART goals.",
      },
    ],
  },
  {
    section: "Standards & Frameworks",
    items: [
      {
        title: "IIBA BABOK",
        url: "https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/babok/",
        description: "BABOK – official IIBA business analysis framework.",
      },
      {
        title: "PMI Guide to Business Analysis",
        url: "https://www.pmi.org/pmbok-guide-standards/foundational/business-analysis",
        description: "PMI's official business analysis guide.",
      },
      {
        title: "BCS Business Analysis Reading List",
        url: "https://www.bcs.org/articles-opinion-and-research/business-analysis-reading-list/",
        description: "Reading list and resources from the BCS.",
      },
      {
        title: "Agile Business Consortium Resources",
        url: "https://www.agilebusiness.org/",
        description: "Guides and resources from the Agile Business Consortium.",
      },
    ],
  },
];

const BAReferenceLibrary: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredData = referenceData.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">BA Reference Library</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive collection of business analysis resources, books, standards, and tools to support your BA journey.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Resource Sections */}
        <div className="space-y-10">
          {filteredData.map((section) => (
            <div key={section.section}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{section.section}</h2>
              <div className="space-y-4">
                {section.items.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No results match your search.
                    </p>
                  </div>
                )}
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center space-x-2"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredData.every(section => section.items.length === 0) && search && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BAReferenceLibrary;
