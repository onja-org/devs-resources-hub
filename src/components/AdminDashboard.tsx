'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/types/resource';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    type: '',
    techStack: '',
    source: '',
  });

  // Check if user is admin (you should implement proper admin checking)
  const isAdmin = user?.email?.includes('admin') || false;

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // Redirect if not logged in
    if (!user) {
      router.push('/');
      return;
    }
    
    // Redirect if not admin
    if (!isAdmin) {
      return; // Just show access denied message, don't redirect
    }
    
    // Fetch resources if admin
    fetchResources();
  }, [user, isAdmin, router, authLoading]);

  async function fetchResources() {
    try {
      const resourcesRef = collection(db, 'resources');
      const querySnapshot = await getDocs(resourcesRef);
      
      const fetchedResources = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Resource[];
      
      setResources(fetchedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(resourceId: string) {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, { approved: true });
      setResources(resources.map(r => 
        r.id === resourceId ? { ...r, approved: true } : r
      ));
    } catch (error) {
      console.error('Error approving resource:', error);
      alert('Failed to approve resource');
    }
  }

  async function handleReject(resourceId: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await deleteDoc(resourceRef);
      setResources(resources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Error rejecting resource:', error);
      alert('Failed to reject resource');
    }
  }

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const techStackArray = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      const newResource = {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        type: formData.type,
        techStack: techStackArray,
        source: formData.source,
        approved: true,
        favorites: [],
        comments: [],
        recommendations: [],
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'resources'), newResource);
      
      setResources([{ id: docRef.id, ...newResource } as Resource, ...resources]);
      setFormData({
        title: '',
        description: '',
        link: '',
        type: '',
        techStack: '',
        source: '',
      });
      setShowAddForm(false);
      alert('Resource added successfully!');
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource');
    }
  }

  const filteredResources = resources.filter(r => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            You do not have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Only users with &quot;admin&quot; in their email address can access the admin dashboard.
            Current user: {user?.email}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage developer resources
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Total Resources
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {resources.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Approved
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {resources.filter(r => r.approved).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Pending Approval
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {resources.filter(r => !r.approved).length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Approved
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {showAddForm ? 'Cancel' : 'Add Resource'}
          </button>
        </div>

        {/* Add Resource Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Resource
            </h2>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Documentation, Tutorial, Tool"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tech Stack (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., React, TypeScript, Node.js"
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mozilla, Google"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Resource
              </button>
            </form>
          </div>
        )}

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No resources found for this filter.
              </p>
            </div>
          ) : (
            filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {resource.title}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          resource.approved
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}
                      >
                        {resource.approved ? 'Approved' : 'Pending'}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {resource.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {resource.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Source: {resource.source}</span>
                      <span>•</span>
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Link
                      </a>
                      <span>•</span>
                      <span>{resource.favorites.length} favorites</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!resource.approved && (
                      <button
                        onClick={() => handleApprove(resource.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(resource.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
