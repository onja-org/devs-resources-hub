'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_SOURCES = [
  'Mozilla MDN',
  'Google',
  'Microsoft',
  'freeCodeCamp',
  'GitHub',
  'Stack Overflow',
  'Dev.to',
  'Medium',
  'YouTube',
  'Udemy',
  'Coursera',
  'Frontend Masters',
  'Pluralsight',
  'Egghead.io',
  'CSS-Tricks',
  'Smashing Magazine',
  'A List Apart',
  'Official Documentation',
  'Other',
];

const AVAILABLE_TECH = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue',
  'Angular',
  'Node.js',
  'Express',
  'Next.js',
  'Nuxt',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'Ruby',
  'Rails',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Flutter',
  'React Native',
  'HTML',
  'CSS',
  'Sass',
  'Tailwind CSS',
  'Bootstrap',
  'Material UI',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'GraphQL',
  'REST API',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Firebase',
  'Git',
  'Testing',
  'Jest',
  'Cypress',
  'Webpack',
  'Vite',
  'Other',
];

export default function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const { user } = useAuth();
  const toast = useToast();
  const { trackActivity } = useUserProgress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    type: '',
  });
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [techSearchTerm, setTechSearchTerm] = useState('');
  const [sourceSearchTerm, setSourceSearchTerm] = useState('');
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [techDropdownDirection, setTechDropdownDirection] = useState<'down' | 'up'>('down');
  const [sourceDropdownDirection, setSourceDropdownDirection] = useState<'down' | 'up'>('down');

  const techInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const techDropdownRef = useRef<HTMLDivElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const techContainerRef = useRef<HTMLDivElement>(null);
  const sourceContainerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useLockBodyScroll(isOpen);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        techDropdownRef.current &&
        !techDropdownRef.current.contains(event.target as Node) &&
        !techInputRef.current?.contains(event.target as Node)
      ) {
        setShowTechDropdown(false);
      }
      if (
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(event.target as Node) &&
        !sourceInputRef.current?.contains(event.target as Node)
      ) {
        setShowSourceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown direction based on available space
  const calculateDropdownDirection = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    setDirection: (direction: 'down' | 'up') => void
  ) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 400; // Updated to match new max height

    // Default to down, only show up if not enough space below and more space above
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDirection('up');
    } else {
      setDirection('down');
    }
  };

  const handleTechFocus = () => {
    calculateDropdownDirection(techContainerRef, setTechDropdownDirection);
    setShowTechDropdown(true);
  };

  const handleSourceFocus = () => {
    calculateDropdownDirection(sourceContainerRef, setSourceDropdownDirection);
    setShowSourceDropdown(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.warning('Please sign in to submit a resource');
      return;
    }

    if (selectedTechStack.length === 0) {
      toast.warning('Please select at least one technology');
      return;
    }

    if (selectedSources.length === 0) {
      toast.warning('Please select at least one source');
      return;
    }

    setIsSubmitting(true);

    try {
      const newResource = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        type: formData.type,
        techStack: selectedTechStack,
        source: selectedSources.join(', '),
        approved: false,
        favorites: [],
        comments: [],
        recommendations: [],
        viewCount: 0,
        helpfulCount: 0,
        completedCount: 0,
        createdAt: Timestamp.now(),
        submittedBy: user.uid,
      };

      const docRef = await addDoc(collection(db, 'resources'), newResource);

      // Track submission activity for XP
      await trackActivity('submitted', docRef.id);

      toast.success('Resource submitted successfully! +50 XP awarded 🎉');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        link: '',
        type: '',
      });
      setSelectedTechStack([]);
      setSelectedSources([]);
      setTechSearchTerm('');
      setSourceSearchTerm('');
      
      onClose();
    } catch (error) {
      console.error('Error submitting resource:', error);
      toast.error('Failed to submit resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleTechStack = (tech: string) => {
    setSelectedTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
    setTechSearchTerm('');
    techInputRef.current?.focus();
    setTimeout(() => calculateDropdownDirection(techContainerRef, setTechDropdownDirection), 0);
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
    setSourceSearchTerm('');
    sourceInputRef.current?.focus();
    setTimeout(() => calculateDropdownDirection(sourceContainerRef, setSourceDropdownDirection), 0);
  };

  const removeTech = (tech: string) => {
    setSelectedTechStack((prev) => prev.filter((t) => t !== tech));
  };

  const removeSource = (source: string) => {
    setSelectedSources((prev) => prev.filter((s) => s !== source));
  };

  const filteredTech = AVAILABLE_TECH.filter(
    (tech) =>
      tech.toLowerCase().includes(techSearchTerm.toLowerCase()) &&
      !selectedTechStack.includes(tech)
  );

  const filteredSources = AVAILABLE_SOURCES.filter(
    (source) =>
      source.toLowerCase().includes(sourceSearchTerm.toLowerCase()) &&
      !selectedSources.includes(source)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Submit a Resource
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Share helpful content with the developer community •{' '}
              <a
                href="/guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                View Guidelines
              </a>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please sign in to submit a resource.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., React Documentation"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the resource..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="link"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  required
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                >
                  <option value="">Select a type</option>
                  <option value="Documentation">📚 Documentation</option>
                  <option value="Tutorial">🎓 Tutorial</option>
                  <option value="Tool">🛠️ Tool</option>
                  <option value="Library">📦 Library</option>
                  <option value="Framework">🏗️ Framework</option>
                  <option value="Blog">📝 Blog</option>
                  <option value="Article">📰 Article</option>
                  <option value="News">📢 News</option>
                  <option value="Community">👥 Community</option>
                  <option value="Forum">💬 Forum</option>
                  <option value="Course">🎯 Course</option>
                  <option value="Video">🎥 Video</option>
                  <option value="Podcast">🎙️ Podcast</option>
                  <option value="Book">📖 Book</option>
                  <option value="Cheat Sheet">📋 Cheat Sheet</option>
                  <option value="Reference">🔖 Reference</option>
                  <option value="API">🔌 API</option>
                  <option value="Playground">🎮 Playground</option>
                  <option value="Template">📄 Template</option>
                  <option value="Boilerplate">🚀 Boilerplate</option>
                  <option value="Repository">💾 Repository</option>
                  <option value="Challenge">🏆 Challenge</option>
                  <option value="Newsletter">📬 Newsletter</option>
                  <option value="Roadmap">🗺️ Roadmap</option>
                  <option value="Guide">📘 Guide</option>
                  <option value="Other">📌 Other</option>
                </select>
              </div>

              {/* Tech Stack Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tech Stack <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={techContainerRef}>
                  <div className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-700 flex flex-wrap gap-2 items-center">
                    {selectedTechStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs font-medium"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(tech)}
                          className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      ref={techInputRef}
                      type="text"
                      value={techSearchTerm}
                      onChange={(e) => {
                        setTechSearchTerm(e.target.value);
                        if (!showTechDropdown) {
                          handleTechFocus();
                        }
                      }}
                      onFocus={handleTechFocus}
                      placeholder={selectedTechStack.length === 0 ? 'Search and select technologies...' : ''}
                      className="flex-1 min-w-[150px] outline-none bg-transparent text-sm dark:text-white"
                      disabled={isSubmitting}
                    />
                  </div>
                  {showTechDropdown && filteredTech.length > 0 && (
                    <div
                      ref={techDropdownRef}
                      className={`absolute z-50 w-full ${
                        techDropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
                      } bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-y-auto`}
                      style={{ maxHeight: '400px' }}
                    >
                      {filteredTech.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTechStack(tech)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white transition-colors"
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selected: {selectedTechStack.length} {selectedTechStack.length === 1 ? 'technology' : 'technologies'}
                </p>
              </div>

              {/* Source Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={sourceContainerRef}>
                  <div className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-700 flex flex-wrap gap-2 items-center">
                    {selectedSources.map((source) => (
                      <span
                        key={source}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded text-xs font-medium"
                      >
                        {source}
                        <button
                          type="button"
                          onClick={() => removeSource(source)}
                          className="hover:text-green-900 dark:hover:text-green-100 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      ref={sourceInputRef}
                      type="text"
                      value={sourceSearchTerm}
                      onChange={(e) => {
                        setSourceSearchTerm(e.target.value);
                        if (!showSourceDropdown) {
                          handleSourceFocus();
                        }
                      }}
                      onFocus={handleSourceFocus}
                      placeholder={selectedSources.length === 0 ? 'Search and select sources...' : ''}
                      className="flex-1 min-w-[150px] outline-none bg-transparent text-sm dark:text-white"
                      disabled={isSubmitting}
                    />
                  </div>
                  {showSourceDropdown && filteredSources.length > 0 && (
                    <div
                      ref={sourceDropdownRef}
                      className={`absolute z-50 w-full ${
                        sourceDropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
                      } bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-y-auto`}
                      style={{ maxHeight: '400px' }}
                    >
                      {filteredSources.map((source) => (
                        <button
                          key={source}
                          type="button"
                          onClick={() => toggleSource(source)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white transition-colors"
                        >
                          {source}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selected: {selectedSources.length} {selectedSources.length === 1 ? 'source' : 'sources'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Resource'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
