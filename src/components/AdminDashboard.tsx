'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/types/resource';
import { useRouter } from 'next/navigation';
import { removeDuplicateResources } from '@/lib/cleanupDuplicates';
import { seedDefaultResources } from '@/lib/seed';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; email: string; name: string; isAdmin: boolean; createdAt: any }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [activeTab, setActiveTab] = useState<'resources' | 'users'>('resources');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [isSeedingResources, setIsSeedingResources] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-helpful' | 'least-helpful' | 'most-viewed' | 'most-completed'>('newest');

  // Calculate pending count for badge
  const pendingCount = resources.filter(r => !r.approved).length;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    type: '',
    techStack: '',
    source: '',
  });

  // Check if user is admin - admin@onja.org is default admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminCheckLoading(false);
      return;
    }

    try {
      // admin@onja.org is always admin
      if (user.email === 'admin@onja.org') {
        setIsAdmin(true);
        setAdminCheckLoading(false);
        return;
      }

      // Check if user has admin flag in database - use getDoc instead of getDocs
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setIsAdmin(userData?.isAdmin === true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setAdminCheckLoading(false);
    }
  }, [user]);

  const fetchResources = useCallback(async () => {
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
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || '',
        name: doc.data().name || 'Unknown',
        isAdmin: doc.data().isAdmin || false,
        createdAt: doc.data().createdAt,
      }));
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // Check admin status
    checkAdminStatus();
  }, [authLoading, checkAdminStatus]);

  useEffect(() => {
    // Only fetch data if user is admin
    if (adminCheckLoading) return;
    
    if (user && isAdmin) {
      fetchResources();
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin, adminCheckLoading, fetchResources, fetchUsers]);

  async function toggleAdminStatus(userId: string, currentStatus: boolean) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isAdmin: !currentStatus });
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isAdmin: !currentStatus } : u
      ));
      
      toast.success(!currentStatus ? 'User promoted to admin' : 'Admin privileges removed');
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  }

  async function handleApprove(resourceId: string) {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, { approved: true });
      
      // Create notification for the user who submitted the resource
      if (resource.submittedBy) {
        await addDoc(collection(db, 'notifications'), {
          userId: resource.submittedBy,
          type: 'resource_approved',
          resourceId: resourceId,
          resourceTitle: resource.title,
          message: `Your resource "${resource.title}" has been approved and is now live!`,
          read: false,
          createdAt: Timestamp.now(),
        });
      }
      
      setResources(resources.map(r => 
        r.id === resourceId ? { ...r, approved: true } : r
      ));
      
      toast.success('Resource approved and user notified!');
    } catch (error) {
      console.error('Error approving resource:', error);
      toast.error('Failed to approve resource');
    }
  }

  async function handleReject(resourceId: string) {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      // Create notification for the user who submitted the resource
      if (resource.submittedBy) {
        await addDoc(collection(db, 'notifications'), {
          userId: resource.submittedBy,
          type: 'resource_declined',
          resourceTitle: resource.title,
          message: `Your resource "${resource.title}" was not approved. Please ensure it meets our quality guidelines.`,
          read: false,
          createdAt: Timestamp.now(),
        });
      }

      const resourceRef = doc(db, 'resources', resourceId);
      await deleteDoc(resourceRef);
      setResources(resources.filter(r => r.id !== resourceId));
      
      toast.success('Resource deleted and user notified!');
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error rejecting resource:', error);
      toast.error('Failed to delete resource');
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
      toast.success('Resource added successfully!');
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    }
  }

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('This will remove all duplicate resources from the database. Are you sure?')) {
      return;
    }

    setIsCleaningDuplicates(true);
    try {
      const result = await removeDuplicateResources();
      
      if (result.success) {
        toast.success(`Removed ${result.removed} duplicates! ${result.remaining} unique resources remain.`);
        // Reload resources
        await fetchResources();
      } else {
        toast.error('Failed to remove duplicates');
      }
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast.error('Failed to remove duplicates');
    } finally {
      setIsCleaningDuplicates(false);
    }
  };

  const handleSeedResources = async () => {
    if (!window.confirm('This will add default resources to the database (skipping duplicates). Continue?')) {
      return;
    }

    setIsSeedingResources(true);
    try {
      const result = await seedDefaultResources();
      
      if (result.success) {
        toast.success(`Added ${result.count} new resources! Skipped ${result.skipped} duplicates.`);
        // Reload resources
        await fetchResources();
      } else {
        toast.error('Failed to seed resources');
      }
    } catch (error) {
      console.error('Error seeding resources:', error);
      toast.error('Failed to seed resources');
    } finally {
      setIsSeedingResources(false);
    }
  };

  const filteredResources = resources
    .filter(r => {
      if (filter === 'pending') return !r.approved;
      if (filter === 'approved') return r.approved;
      return true;
    })
    .sort((a, b) => {
      // In 'all' tab, show pending first
      if (filter === 'all') {
        // Pending resources first
        if (!a.approved && b.approved) return -1;
        if (a.approved && !b.approved) return 1;
      }
      
      // Then apply selected sort
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'approved') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
            {pendingCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center animate-pulse shadow-lg">
                {pendingCount}
              </div>
            )}
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Pending Approval
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {pendingCount}
            </p>
            {pendingCount > 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">
                ⚠️ Requires attention
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'resources'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Resources
              {pendingCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {pendingCount}
                </span>
              )}
              {activeTab === 'resources' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'users'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Users ({users.length})
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <>
        {/* Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('pending')}
              className={`px-4 py-2 rounded-lg transition-colors relative ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                  filter === 'pending'
                    ? 'bg-white text-blue-600'
                    : 'bg-orange-500 text-white'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleFilterChange('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Approved
            </button>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white shadow-sm transition-all cursor-pointer"
            >
              <option value="newest">🕒 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="most-helpful">👍 Most Helpful</option>
              <option value="least-helpful">👎 Least Helpful</option>
              <option value="most-viewed">👁️ Most Viewed</option>
              <option value="most-completed">✅ Most Completed</option>
            </select>
            <button
              onClick={handleCleanupDuplicates}
              disabled={isCleaningDuplicates}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isCleaningDuplicates ? 'Cleaning...' : '🗑️ Remove Duplicates'}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleSeedResources}
                disabled={isSeedingResources}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSeedingResources ? 'Seeding...' : '📦 Seed Resources'}
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {showAddForm ? 'Cancel' : 'Add Resource'}
            </button>
          </div>
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

        {/* Items Per Page Selector */}
        {filteredResources.length > 0 && (
          <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Items per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={30}>30</option>
                <option value={filteredResources.length}>All ({filteredResources.length})</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredResources.length)} of {filteredResources.length} resources
            </div>
          </div>
        )}

        {/* Resources Grid */}
        <div className="mb-8">
          {filteredResources.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No resources found for this filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {paginatedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
                >
                  {/* Card Header */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 min-h-[3.5rem]">
                        {resource.title}
                      </h3>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                          resource.approved
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}
                      >
                        {resource.approved ? '✓' : '⏳'}
                      </span>
                    </div>
                    
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-2 w-fit">
                      {resource.type}
                    </span>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3 min-h-[4rem]">
                      {resource.description}
                    </p>
                    
                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[2rem]">
                      {resource.techStack.slice(0, 4).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium h-fit"
                        >
                          {tech}
                        </span>
                      ))}
                      {resource.techStack.length > 4 && (
                        <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400 font-medium">
                          +{resource.techStack.length - 4}
                        </span>
                      )}
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        {resource.source}
                      </span>
                    </div>
                    
                    {/* Engagement Stats */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{resource.viewCount || 0}</span>
                        <span className="text-blue-600 dark:text-blue-400">views</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                        <span className="font-semibold text-red-700 dark:text-red-300">{resource.favorites.length}</span>
                        <span className="text-red-600 dark:text-red-400">saves</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className="font-semibold text-green-700 dark:text-green-300">{resource.helpfulCount || 0}</span>
                        <span className="text-green-600 dark:text-green-400">helpful</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                        <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-purple-700 dark:text-purple-300">{resource.completedCount || 0}</span>
                        <span className="text-purple-600 dark:text-purple-400">done</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Footer with Actions */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 rounded-b-xl">
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs font-medium text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        View
                      </a>
                      {!resource.approved ? (
                        <button
                          onClick={() => handleApprove(resource.id)}
                          className="px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                          title="Approve"
                        >
                          Approve
                        </button>
                      ) : (
                        <div className="px-3 py-2 text-xs font-medium text-center bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed">
                          Approved
                        </div>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(resource.id)}
                        className="px-3 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowDeleteConfirm(null)}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Delete Resource
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this resource? This action cannot be undone and the user will be notified.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(showDeleteConfirm)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pagination Controls - Bottom */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
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
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isAdmin ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Admin
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {user.email === 'admin@onja.org' ? (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Main Admin</span>
                          ) : (
                            <button
                              onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                user.isAdmin
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800'
                              }`}
                            >
                              {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
