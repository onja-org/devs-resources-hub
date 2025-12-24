'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface RecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
}

interface UserProfile {
  name: string;
  email: string;
}

export default function RecommendModal({ isOpen, onClose, resourceId, resourceTitle }: RecommendModalProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Lock body scroll when modal is open
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  async function fetchUsers() {
    if (!user) return;
    
    setIsFetching(true);
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      console.log('Total users in database:', querySnapshot.docs.length);
      
      const fetchedUsers: Array<{ id: string; name: string; email: string }> = [];
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as UserProfile;
        console.log('User found:', { id: docSnap.id, name: data.name, email: data.email });
        
        // Don't include the current user
        if (docSnap.id !== user.uid) {
          fetchedUsers.push({
            id: docSnap.id,
            name: data.name,
            email: data.email,
          });
        }
      }
      
      console.log('Filtered users (excluding current user):', fetchedUsers.length);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleRecommend() {
    if (!user || !selectedUser) return;

    setIsLoading(true);
    try {
      // Get current user's name
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log('Current user document exists:', userDoc.exists());
      console.log('Current user data:', userDoc.exists() ? userDoc.data() : null);
      
      const userData = userDoc.exists() ? userDoc.data() as UserProfile : null;
      const userName = userData?.name || user.displayName || user.email?.split('@')[0] || 'Someone';
      
      console.log('Using userName:', userName);

      // Create notification for the selected user
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: selectedUser,
        type: 'recommendation',
        resourceId,
        resourceTitle,
        fromUserId: user.uid,
        fromUserName: userName,
        message: `${userName} recommended "${resourceTitle}" to you`,
        read: false,
        createdAt: Timestamp.now(),
      });

      alert('Resource recommended successfully!');
      setSelectedUser(null);
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error recommending resource:', error);
      alert('Failed to recommend resource');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recommend to a Friend
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {resourceTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Users List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isFetching ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                    selectedUser === u.id
                      ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{u.email}</p>
                  </div>
                  {selectedUser === u.id && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleRecommend}
            disabled={!selectedUser || isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
          >
            {isLoading ? 'Recommending...' : 'Recommend'}
          </button>
        </div>
      </div>
    </div>
  );
}
