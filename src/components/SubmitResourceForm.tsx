'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SubmitResourceForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    type: '',
    techStack: '',
    source: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to submit a resource');
      return;
    }

    setIsSubmitting(true);

    try {
      const techStackArray = formData.techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0);

      const newResource = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        type: formData.type,
        techStack: techStackArray,
        source: formData.source,
        approved: false, // Pending approval
        favorites: [],
        comments: [],
        createdAt: Timestamp.now(),
        submittedBy: user.uid,
      };

      await addDoc(collection(db, 'resources'), newResource);

      alert('Resource submitted successfully! It will be reviewed by an admin.');
      setFormData({
        title: '',
        description: '',
        link: '',
        type: '',
        techStack: '',
        source: '',
      });
      router.push('/');
    } catch (error) {
      console.error('Error submitting resource:', error);
      alert('Failed to submit resource. Please try again.');
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

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Sign In Required
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please sign in to submit a resource.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Submit a Resource
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Share a helpful resource with the developer community. Your submission will be
        reviewed by our team before being published.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a detailed description of the resource and why it's useful..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="">Select a type</option>
              <option value="Documentation">Documentation</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Tool">Tool</option>
              <option value="Blog">Blog</option>
              <option value="Community">Community</option>
              <option value="Course">Course</option>
              <option value="Video">Video</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="source"
              name="source"
              required
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Mozilla, Google, freeCodeCamp"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="techStack"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Tech Stack <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="techStack"
            name="techStack"
            required
            value={formData.techStack}
            onChange={handleChange}
            placeholder="React, TypeScript, Node.js (comma-separated)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Separate multiple technologies with commas
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Resource'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
