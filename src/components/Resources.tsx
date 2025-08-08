import React from 'react';
import { BookOpen, Download, Calendar, ArrowRight, FileText, Video, Headphones } from 'lucide-react';

const Resources: React.FC = () => {
  const featuredResources = [
    {
      type: "Ebook",
      icon: <BookOpen className="w-6 h-6" />,
      title: "Digital Transformation Playbook 2025",
      description: "A comprehensive guide to navigating digital transformation in the modern business landscape.",
      downloadCount: "2,500+",
      color: "lime"
    },
    {
      type: "Whitepaper",
      icon: <FileText className="w-6 h-6" />,
      title: "The Future of Agile Project Management",
      description: "Insights into emerging trends and best practices in agile methodologies for 2025 and beyond.",
      downloadCount: "1,800+",
      color: "slate"
    },
    {
      type: "Guide",
      icon: <Download className="w-6 h-6" />,
      title: "Career Transition Roadmap",
      description: "Step-by-step guide for professionals looking to transition into tech roles successfully.",
      downloadCount: "3,200+",
      color: "lime"
    }
  ];

  const blogPosts = [
    {
      category: "Digital Transformation",
      title: "5 Key Strategies for Successful Digital Transformation in 2025",
      excerpt: "Discover the essential strategies that forward-thinking organizations are using to drive successful digital transformation initiatives.",
      author: "Dr. Sarah Mitchell",
      date: "January 15, 2025",
      readTime: "8 min read",
      image: "/api/placeholder/400/250"
    },
    {
      category: "Career Development",
      title: "From Zero to Business Analyst: A Complete Career Guide",
      excerpt: "Everything you need to know about launching a career in business analysis, including skills, certifications, and job market insights.",
      author: "Michael Chen",
      date: "January 12, 2025",
      readTime: "12 min read",
      image: "/api/placeholder/400/250"
    },
    {
      category: "Agile & Scrum",
      title: "The Evolution of Scrum: What's New in 2025",
      excerpt: "Explore the latest developments in Scrum methodology and how modern teams are adapting these practices for better outcomes.",
      author: "Emma Rodriguez",
      date: "January 10, 2025", 
      readTime: "6 min read",
      image: "/api/placeholder/400/250"
    },
    {
      category: "Technology Trends",
      title: "AI-Powered Project Management: Tools and Techniques",
      excerpt: "How artificial intelligence is revolutionizing project management and what it means for project managers in 2025.",
      author: "David Park",
      date: "January 8, 2025",
      readTime: "10 min read",
      image: "/api/placeholder/400/250"
    }
  ];

  const webinars = [
    {
      title: "Building Your Tech Career in 2025",
      date: "February 15, 2025",
      time: "2:00 PM GMT",
      speaker: "Tech Ascend Career Team",
      type: "Live Webinar",
      spots: "150 spots remaining"
    },
    {
      title: "Digital Transformation Success Stories",
      date: "February 22, 2025", 
      time: "3:00 PM GMT",
      speaker: "Industry Expert Panel",
      type: "Panel Discussion",
      spots: "200 spots remaining"
    }
  ];

  return (
    <section id="resources" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Resources & Insights
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Access our comprehensive library of resources designed to help you stay ahead 
            in the rapidly evolving world of technology and business.
          </p>
        </div>

        {/* Featured Downloads */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-slate-900 text-center mb-12">Featured Downloads</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-6 ${
                  resource.color === 'lime' ? 'bg-lime-100 text-lime-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {resource.icon}
                </div>
                
                <div className="mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    resource.color === 'lime' ? 'bg-lime-100 text-lime-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {resource.type}
                  </span>
                </div>
                
                <h4 className="text-xl font-bold text-slate-900 mb-3">{resource.title}</h4>
                <p className="text-slate-600 mb-6 leading-relaxed">{resource.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{resource.downloadCount} downloads</span>
                  <button className={`inline-flex items-center font-semibold transition-colors ${
                    resource.color === 'lime' 
                      ? 'text-lime-600 hover:text-lime-700' 
                      : 'text-slate-600 hover:text-slate-700'
                  }`}>
                    Download Free
                    <Download className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blog Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-slate-900">Latest Articles</h3>
            <button className="inline-flex items-center text-lime-600 hover:text-lime-700 font-semibold transition-colors">
              View All Articles
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="h-48 bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-500">Article Image</span>
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-lime-600 bg-lime-100 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-900 mb-3 hover:text-lime-600 transition-colors cursor-pointer">
                    {post.title}
                  </h4>
                  <p className="text-slate-600 mb-4 leading-relaxed">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center space-x-4">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Upcoming Webinars */}
        <div className="bg-gradient-to-r from-slate-50 to-lime-50 rounded-2xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Upcoming Webinars</h3>
            <p className="text-xl text-slate-600">
              Join our expert-led sessions and stay updated with the latest industry trends.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {webinars.map((webinar, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-lime-600 mr-2" />
                    <span className="text-sm font-medium text-lime-600">{webinar.type}</span>
                  </div>
                  <span className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full">
                    {webinar.spots}
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-slate-900 mb-2">{webinar.title}</h4>
                <p className="text-slate-600 mb-4">Speaker: {webinar.speaker}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    <div>{webinar.date}</div>
                    <div>{webinar.time}</div>
                  </div>
                  <button className="bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600 transition-colors font-medium">
                    Register Free
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-100 text-lime-600 rounded-xl mb-4">
              <Video className="w-8 h-8" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Video Tutorials</h4>
            <p className="text-slate-600 text-sm mb-4">Step-by-step video guides covering essential skills and methodologies.</p>
            <button className="text-lime-600 hover:text-lime-700 font-medium transition-colors">
              Browse Videos →
            </button>
          </div>
          
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-600 rounded-xl mb-4">
              <Headphones className="w-8 h-8" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Podcasts</h4>
            <p className="text-slate-600 text-sm mb-4">Industry insights and expert interviews on the latest tech trends.</p>
            <button className="text-slate-600 hover:text-slate-700 font-medium transition-colors">
              Listen Now →
            </button>
          </div>
          
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-100 text-lime-600 rounded-xl mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Templates</h4>
            <p className="text-slate-600 text-sm mb-4">Ready-to-use templates for project management and business analysis.</p>
            <button className="text-lime-600 hover:text-lime-700 font-medium transition-colors">
              Download Templates →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;