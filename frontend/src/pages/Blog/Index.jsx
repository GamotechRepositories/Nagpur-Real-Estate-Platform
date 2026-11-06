import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    slug: 'top-10-localities-nagpur-property-investment-2025',
    title: 'Top 10 Localities in Nagpur for Property Investment in 2025',
    date: 'Jan 15, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    summary:
      'An in-depth analysis of emerging growth corridors, capital appreciation trends, and rental yields across Dharampeth, Manish Nagar, Wardha Road, and Besa.',
    tag: 'Investment Guide',
  },
  {
    id: 2,
    slug: 'nagpur-metro-phase-2-property-appreciation',
    title: 'How Nagpur Metro Phase 2 is Boosting Property Prices along Wardha Road',
    date: 'Jan 10, 2025',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    summary:
      'Connecting MIHAN, Butibori, and central hubs: how upcoming metro expansions are driving residential demand and commercial valuations.',
    tag: 'Infrastructure',
  },
  {
    id: 3,
    slug: 'nmrda-rera-compliance-guide-nagpur',
    title: 'Complete Guide to NMRDA Sanctioned Layouts and MahaRERA Verification',
    date: 'Dec 28, 2024',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    summary:
      'Crucial checklist for plot buyers in Nagpur: verifying RL (Release Letter), NMRDA sanction orders, and 7/12 extract details before investing.',
    tag: 'Legal Advisory',
  },
];

const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>Real Estate Insights & News | Nagpur Realty</title>
        <meta
          name="description"
          content="Latest real estate trends, locality reports, property investment guides, and MahaRERA updates in Nagpur."
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header matching Screen 14 */}
          <div className="space-y-1.5 border-b border-[#E9E4DA] pb-6">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#172C3B]">
              Real Estate Insights
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Expert commentary, market reports, and property investment intelligence in Nagpur.
            </p>
          </div>

          {/* Featured Article matching Screen 14 */}
          <div className="bg-white rounded-2xl border border-[#E9E4DA] overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 aspect-[16/10] overflow-hidden bg-gray-100">
              <img
                src={ARTICLES[0].image}
                alt={ARTICLES[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-4">
              <span className="bg-[#B89A65] text-white text-[10px] font-semibold uppercase px-2.5 py-1 rounded">
                {ARTICLES[0].tag}
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172C3B] hover:text-[#B89A65] transition-colors">
                <Link to={`/content/${ARTICLES[0].slug}`}>{ARTICLES[0].title}</Link>
              </h2>

              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{ARTICLES[0].date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ARTICLES[0].readTime}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {ARTICLES[0].summary}
              </p>

              <div className="pt-2">
                <Link
                  to={`/content/${ARTICLES[0].slug}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#B89A65] hover:text-[#9A7D4C]"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Grid of Other Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {ARTICLES.slice(1).map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl border border-[#E9E4DA] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-2.5">
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#172C3B] hover:text-[#B89A65] transition-colors">
                      <Link to={`/content/${article.slug}`}>{article.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">{article.tag}</span>
                  <Link
                    to={`/content/${article.slug}`}
                    className="font-semibold text-[#B89A65] hover:text-[#9A7D4C] flex items-center space-x-1"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;

