'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/types/resource';
import ResourceCard from '@/components/ResourceCard';
import { useAuth } from '@/contexts/AuthContext';

export default function ResourceList() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const resourceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [highlightedResourceId, setHighlightedResourceId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-helpful' | 'least-helpful' | 'most-viewed' | 'most-completed'>('newest');

  // Get unique values for filters
  const types = [...new Set(resources.map(r => r.type))].sort();
  const techStacks = [...new Set(resources.flatMap(r => r.techStack))].sort();
  const sources = [...new Set(resources.map(r => r.source))].sort();

  // Fetch resources
  useEffect(() => {
    async function fetchResources() {
      try {
        const resourcesRef = collection(db, 'resources');
        // Fetch all resources to check if any exist
        const querySnapshot = await getDocs(resourcesRef);
        
        const fetchedResources = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];
        
        setResources(fetchedResources);
        setFilteredResources(fetchedResources);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching resources:', error);
        setError(error.message || 'Failed to fetch resources. Make sure Firebase is configured.');
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  // Handle resourceId from URL query parameter
  useEffect(() => {
    const resourceId = searchParams.get('resourceId');
    if (resourceId && resources.length > 0 && filteredResources.length > 0) {
      // Find the resource in filtered results
      const resourceIndex = filteredResources.findIndex(r => r.id === resourceId);
      if (resourceIndex !== -1) {
        // Calculate which page the resource is on
        const resourcePage = Math.floor(resourceIndex / itemsPerPage) + 1;
        setCurrentPage(resourcePage);
        
        // Highlight the resource
        setHighlightedResourceId(resourceId);
        
        // Wait for the component to render and scroll to it
        setTimeout(() => {
          const element = resourceRefs.current[resourceId];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedResourceId(null);
          }, 3000);
        }, 100);
      }
    }
  }, [searchParams, resources, filteredResources, itemsPerPage]);

  // Apply filters
  useEffect(() => {
    let filtered = resources;

    // Quick tab filters
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'documentation':
          filtered = filtered.filter(r => r.type === 'Documentation');
          break;
        case 'tutorials':
          filtered = filtered.filter(r => r.type === 'Tutorial');
          break;
        case 'tools':
          filtered = filtered.filter(r => r.type === 'Tool');
          break;
        case 'articles':
          filtered = filtered.filter(r => r.type === 'Blog' || r.type === 'Article');
          break;
        case 'community':
          filtered = filtered.filter(r => r.type === 'Community');
          break;
        case 'javascript':
          filtered = filtered.filter(r => r.techStack.some(tech => tech.toLowerCase().includes('javascript')));
          break;
        case 'react':
          filtered = filtered.filter(r => r.techStack.some(tech => tech.toLowerCase().includes('react')));
          break;
        case 'typescript':
          filtered = filtered.filter(r => r.techStack.some(tech => tech.toLowerCase().includes('typescript')));
          break;
        case 'python':
          filtered = filtered.filter(r => r.techStack.some(tech => tech.toLowerCase().includes('python')));
          break;
        case 'ai':
          filtered = filtered.filter(r => 
            r.title.toLowerCase().includes('ai') || 
            r.description.toLowerCase().includes('ai') ||
            r.title.toLowerCase().includes('artificial intelligence') || 
            r.description.toLowerCase().includes('artificial intelligence') ||
            r.title.toLowerCase().includes('machine learning') || 
            r.description.toLowerCase().includes('machine learning') ||
            r.techStack.some(tech => 
              tech.toLowerCase().includes('ai') || 
              tech.toLowerCase().includes('machine learning') ||
              tech.toLowerCase().includes('ml')
            )
          );
          break;
        case 'favorites':
          if (user) {
            filtered = filtered.filter(r => r.favorites.includes(user.uid));
          }
          break;
        case 'recommended':
          if (user) {
            filtered = filtered.filter(r => r.recommendations?.includes(user.uid));
          }
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(search) ||
          resource.description.toLowerCase().includes(search) ||
          resource.source.toLowerCase().includes(search) ||
          resource.techStack.some((tech) => tech.toLowerCase().includes(search))
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter((resource) => resource.type === selectedType);
    }

    // Tech stack filter
    if (selectedTech) {
      filtered = filtered.filter((resource) =>
        resource.techStack.includes(selectedTech)
      );
    }

    // Source filter
    if (selectedSource) {
      filtered = filtered.filter((resource) => resource.source === selectedSource);
    }

    // Recommendation filter
    if (selectedRecommendation && user) {
      if (selectedRecommendation === 'my-recommendations') {
        filtered = filtered.filter((resource) =>
          resource.recommendations?.includes(user.uid)
        );
      }
    }

    setFilteredResources(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedType, selectedTech, selectedSource, selectedRecommendation, activeTab, resources, user]);

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      case 'oldest':
        const aTimeOld = a.createdAt?.toMillis?.() || 0;
        const bTimeOld = b.createdAt?.toMillis?.() || 0;
        return aTimeOld - bTimeOld;
      case 'most-helpful':
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      case 'least-helpful':
        return (a.helpfulCount || 0) - (b.helpfulCount || 0);
      case 'most-viewed':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'most-completed':
        return (b.completedCount || 0) - (a.completedCount || 0);
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedTech('');
    setSelectedSource('');
    setSelectedRecommendation('');
    setActiveTab('all');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Clear other filters when switching tabs
    setSelectedType('');
    setSelectedTech('');
    setSelectedSource('');
    setSelectedRecommendation('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(sortedResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = sortedResources.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedType || selectedTech || selectedSource || selectedRecommendation || activeTab !== 'all';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg max-w-md">
          <p className="font-semibold mb-2">Error loading resources</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quick Filter Tabs - Compact */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🌐 All
          </button>
          <button
            onClick={() => handleTabChange('documentation')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'documentation'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📚 Docs
          </button>
          <button
            onClick={() => handleTabChange('tutorials')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'tutorials'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🎓 Tutorials
          </button>
          <button
            onClick={() => handleTabChange('tools')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🛠️ Tools
          </button>
          <button
            onClick={() => handleTabChange('articles')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📰 Articles
          </button>
          <button
            onClick={() => handleTabChange('community')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            👥 Community
          </button>
          <button
            onClick={() => handleTabChange('ai')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🤖 AI
          </button>
          <button
            onClick={() => handleTabChange('javascript')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'javascript'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ⚡ JS
          </button>
          <button
            onClick={() => handleTabChange('react')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'react'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ⚛️ React
          </button>
          <button
            onClick={() => handleTabChange('typescript')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'typescript'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📘 TS
          </button>
          <button
            onClick={() => handleTabChange('python')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'python'
                ? 'bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🐍 Python
          </button>
          {user && (
            <>
              <button
                onClick={() => handleTabChange('favorites')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ❤️ Favorites
              </button>
              <button
                onClick={() => handleTabChange('recommended')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'recommended'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⭐ Recommended
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters - Collapsible */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {/* Search Bar - Full Width First Row */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filter Dropdowns - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">

            {/* Type Filter */}
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="">📂 All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tech Stack
              </label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="">💻 All Tech</option>
                {techStacks.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="">🌐 All Sources</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="newest">🕒 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="most-helpful">👍 Most Helpful</option>
                <option value="least-helpful">👎 Least Helpful</option>
                <option value="most-viewed">👁️ Most Viewed</option>
                <option value="most-completed">✅ Most Completed</option>
              </select>
            </div>

            {user && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Recommendations
                </label>
                <select
                  value={selectedRecommendation}
                  onChange={(e) => setSelectedRecommendation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
                >
                  <option value="">⭐ All Resources</option>
                  <option value="my-recommendations">My Recommendations</option>
                </select>
              </div>
            )}
          </div>

          {/* Active Filters and Clear Button - Compact */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span><strong className="text-blue-600 dark:text-blue-400">{filteredResources.length}</strong> of {resources.length}</span>
              </div>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Items Per Page Selector - Compact */}
      {filteredResources.length > 0 && (
        <div className="flex items-center justify-between mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Per page:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={18}>18</option>
              <option value={24}>24</option>
              <option value={30}>30</option>
              <option value={filteredResources.length}>All ({filteredResources.length})</option>
            </select>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredResources.length)} of {filteredResources.length}
          </div>
        </div>
      )}

      {/* Results */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              {hasActiveFilters
                ? 'No resources match your filters. Try adjusting your search criteria.'
                : 'No resources available yet.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {paginatedResources.map((resource) => (
              <div
                key={resource.id}
                ref={(el) => { resourceRefs.current[resource.id] = el; }}
                className={`transition-all duration-500 h-full ${
                  highlightedResourceId === resource.id 
                    ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900 rounded-xl' 
                    : ''
                }`}
              >
                <ResourceCard resource={resource} />
              </div>
            ))}
          </div>

          {/* Pagination Controls - Bottom */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            currentPage === page
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredResources.length)} of {filteredResources.length}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
