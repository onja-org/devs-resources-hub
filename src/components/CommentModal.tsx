'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comment, Resource } from '@/types/resource';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
}

interface UserProfile {
  name: string;
  email: string;
}

export default function CommentModal({ isOpen, onClose, resourceId }: CommentModalProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [linkPreview, setLinkPreview] = useState<{title?: string; description?: string; image?: string} | null>(null);
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchResourceAndComments();
    }
  }, [isOpen, resourceId]);

  async function fetchResourceAndComments() {
    setIsFetching(true);
    try {
      // Fetch resource details
      const docRef = doc(db, 'resources', resourceId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const resourceData = {
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          link: data.link || '',
          type: data.type || '',
          techStack: data.techStack || [],
          source: data.source || '',
          createdAt: data.createdAt,
          favorites: data.favorites || [],
          comments: data.comments || [],
          approved: data.approved || false,
        } as Resource;
        setResource(resourceData);

        // Fetch link preview
        try {
          const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(data.link)}`);
          const previewData = await response.json();
          if (previewData.status === 'success') {
            setLinkPreview({
              title: previewData.data.title,
              description: previewData.data.description,
              image: previewData.data.image?.url,
            });
          }
        } catch (err) {
          console.error('Error fetching link preview:', err);
        }
      }

      // Fetch all comments
      const commentsRef = collection(db, 'resources', resourceId, 'comments');
      const querySnapshot = await getDocs(commentsRef);
      
      const allComments: Record<string, Comment> = {};
      const userIds = new Set<string>();
      
      // First pass: Create all comment objects
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        if (data.userId && data.text) {
          allComments[docSnap.id] = {
            id: docSnap.id,
            userId: data.userId,
            text: data.text,
            createdAt: data.createdAt,
            replies: [],
            parentId: data.parentId,
          };
          userIds.add(data.userId);
        }
      }

      // Second pass: Build the tree structure
      const topLevelComments: Comment[] = [];
      for (const comment of Object.values(allComments)) {
        if (!comment.parentId || comment.parentId === null) {
          topLevelComments.push(comment);
        } else if (allComments[comment.parentId]) {
          allComments[comment.parentId].replies.push(comment);
        }
      }
      
      // Sort by createdAt descending
      topLevelComments.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      setComments(topLevelComments);
      
      // Fetch user profiles
      const profiles: Record<string, UserProfile> = {};
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data() as UserProfile;
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error fetching resource and comments:', error);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setIsLoading(true);
    try {
      const commentsRef = collection(db, 'resources', resourceId, 'comments');
      const docRef = await addDoc(commentsRef, {
        userId: user.uid,
        text: comment.trim(),
        createdAt: Timestamp.now(),
        parentId: null,
      });

      // Add the new comment to state immediately
      const newComment: Comment = {
        id: docRef.id,
        userId: user.uid,
        text: comment.trim(),
        createdAt: Timestamp.now(),
        replies: [],
        parentId: null,
      };

      // Fetch user profile if not already loaded
      if (!userProfiles[user.uid]) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfiles(prev => ({
              ...prev,
              [user.uid]: userDoc.data() as UserProfile
            }));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }

      setComments(prev => [newComment, ...prev]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReply(parentId: string) {
    if (!user || !replyText.trim()) return;

    setIsLoading(true);
    try {
      const commentsRef = collection(db, 'resources', resourceId, 'comments');
      const docRef = await addDoc(commentsRef, {
        userId: user.uid,
        text: replyText.trim(),
        createdAt: Timestamp.now(),
        parentId: parentId,
      });

      // Create the new reply
      const newReply: Comment = {
        id: docRef.id,
        userId: user.uid,
        text: replyText.trim(),
        createdAt: Timestamp.now(),
        replies: [],
        parentId: parentId,
      };

      // Fetch user profile if not already loaded
      if (!userProfiles[user.uid]) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfiles(prev => ({
              ...prev,
              [user.uid]: userDoc.data() as UserProfile
            }));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }

      // Add reply to the appropriate parent comment
      setComments(prev => {
        const addReplyToComment = (comment: Comment): Comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply]
            };
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(addReplyToComment)
            };
          }
          return comment;
        };
        return prev.map(addReplyToComment);
      });

      setReplyText('');
      setShowReplyForm(null);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    } finally {
      setIsLoading(false);
    }
  }

  function renderComment(comment: Comment, depth: number): React.ReactNode {
    const profile = userProfiles[comment.userId];
    const canReply = depth < 2; // Allow replies up to 2 levels deep

    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 mt-3' : ''}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words mb-2">
                {comment.text}
              </p>
              {canReply && (
                <button
                  onClick={() => setShowReplyForm(showReplyForm === comment.id ? null : comment.id)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reply
                </button>
              )}
              
              {showReplyForm === comment.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyText.trim() || isLoading}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setShowReplyForm(null);
                        setReplyText('');
                      }}
                      className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {resource?.title || 'Loading...'}
            </h2>
            {resource && (
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  {resource.type}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {resource.source}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{resource.favorites.length}</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isFetching ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : resource ? (
            <>
              {/* Resource Details */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {resource.description}
                </p>

                {linkPreview && (
                  <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    {linkPreview.image && (
                      <img 
                        src={linkPreview.image} 
                        alt={linkPreview.title || 'Link preview'} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      {linkPreview.title && (
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {linkPreview.title}
                        </h4>
                      )}
                      {linkPreview.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {linkPreview.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {resource.techStack && resource.techStack.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Tech Stack:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Visit Resource
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Comments Section */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Comments ({comments.length})
                </h3>
                
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {comments.map((comment) => renderComment(comment, 0))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {user ? (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !comment.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to comment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
