'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/types/resource';
import ResourceCard from '@/components/ResourceCard';
import { useAuth } from '@/contexts/AuthContext';

export default function ResourceList() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Apply filters
  useEffect(() => {
    let filtered = resources;

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
  }, [searchTerm, selectedType, selectedTech, selectedSource, selectedRecommendation, resources, user]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedTech('');
    setSelectedSource('');
    setSelectedRecommendation('');
  };

  const hasActiveFilters = searchTerm || selectedType || selectedTech || selectedSource || selectedRecommendation;

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
      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources by title, description, tech stack, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-4 pl-14 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all"
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
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

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📂 Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                💻 Tech Stack
              </label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="">All Technologies</option>
                {techStacks.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                🌐 Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="">All Sources</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            {user && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ⭐ Recommendations
                </label>
                <select
                  value={selectedRecommendation}
                  onChange={(e) => setSelectedRecommendation(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
                >
                  <option value="">All Resources</option>
                  <option value="my-recommendations">My Recommendations</option>
                </select>
              </div>
            )}
          </div>

          {/* Active Filters and Clear Button */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Showing <strong className="text-blue-600 dark:text-blue-400">{filteredResources.length}</strong> of {resources.length} resources</span>
              </div>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </>
  );
}
