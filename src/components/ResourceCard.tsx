'use client';

import { Resource } from '@/types/resource';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc, addDoc, collection, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import CommentModal from './CommentModal';
import RecommendModal from './RecommendModal';
import { useToast } from '@/contexts/ToastContext';
import SubmitModal from './SubmitModal';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { user } = useAuth();
  const { trackActivity } = useUserProgress();
  const toast = useToast();
  const [isFavorited, setIsFavorited] = useState(
    user ? resource.favorites.includes(user.uid) : false
  );
  const [favCount, setFavCount] = useState(resource.favorites.length);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecommended, setIsRecommended] = useState(
    user && resource.recommendations ? resource.recommendations.includes(user.uid) : false
  );
  const [recommendCount, setRecommendCount] = useState(resource.recommendations?.length || 0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(resource.helpfulCount || 0);
  const [viewCount, setViewCount] = useState(resource.viewCount || 0);
  const [hasViewed, setHasViewed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load user's activity status (including if they've already viewed this)
  useEffect(() => {
    if (user) {
      loadUserActivity();
    }
  }, [user, resource.id]);

  const loadUserActivity = async () => {
    if (!user) return;
    
    try {
      const activityDoc = await getDoc(doc(db, 'userActivity', `${user.uid}_${resource.id}`));
      if (activityDoc.exists()) {
        const data = activityDoc.data();
        if (data.completed) {
          setIsCompleted(true);
        }
        if (data.helpful !== undefined) {
          setIsHelpful(data.helpful);
        }
        if (data.viewed) {
          setHasViewed(true);
        }
      }
      
      // If user hasn't viewed this before, track it now
      if (!activityDoc.exists() || !activityDoc.data().viewed) {
        await trackView();
      }
    } catch (error) {
      console.error('Error loading user activity:', error);
    }
  };

  const trackView = async () => {
    if (!user || hasViewed) return;

    try {
      // Mark as viewed in user activity
      const activityRef = doc(db, 'userActivity', `${user.uid}_${resource.id}`);
      await setDoc(activityRef, {
        userId: user.uid,
        resourceId: resource.id,
        viewed: true,
        viewedAt: Timestamp.now()
      }, { merge: true });
      
      // Increment resource view count
      const resourceRef = doc(db, 'resources', resource.id);
      await updateDoc(resourceRef, {
        viewCount: increment(1)
      });
      setViewCount(prev => prev + 1);
      setHasViewed(true);
      
      // Track in gamification system
      await trackActivity('viewed', resource.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning('Please sign in to favorite resources');
      return;
    }

    try {
      const resourceRef = doc(db, 'resources', resource.id);
      
      if (isFavorited) {
        await updateDoc(resourceRef, {
          favorites: arrayRemove(user.uid),
        });
        setIsFavorited(false);
        setFavCount(favCount - 1);
        toast.info('Removed from favorites');
      } else {
        await updateDoc(resourceRef, {
          favorites: arrayUnion(user.uid),
        });
        setIsFavorited(true);
        setFavCount(favCount + 1);
        
        // Mark as bookmarked in user activity and track for XP
        const activityRef = doc(db, 'userActivity', `${user.uid}_${resource.id}`);
        await setDoc(activityRef, {
          userId: user.uid,
          resourceId: resource.id,
          bookmarked: true,
          bookmarkedAt: Timestamp.now()
        }, { merge: true });
        
        // Track bookmark activity (will check if already tracked)
        await trackActivity('bookmarked', resource.id);
        toast.success('Added to favorites! ❤️');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning('Please sign in to mark resources as complete');
      return;
    }

    if (isCompleted) return;

    try {
      setIsCompleted(true);
      
      // Save to userActivity collection with composite key
      const activityRef = doc(db, 'userActivity', `${user.uid}_${resource.id}`);
      await setDoc(activityRef, {
        userId: user.uid,
        resourceId: resource.id,
        completed: true,
        completedAt: Timestamp.now()
      }, { merge: true });
      
      // Update resource completed count
      const resourceRef = doc(db, 'resources', resource.id);
      await updateDoc(resourceRef, {
        completedCount: increment(1)
      });
      
      await trackActivity('completed', resource.id);
      toast.success('Marked as complete! 🎉');
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to mark as complete');
      setIsCompleted(false);
    }
  };

  const handleHelpful = async (e: React.MouseEvent, helpful: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning('Please sign in to mark resources as helpful');
      return;
    }

    try {
      const resourceRef = doc(db, 'resources', resource.id);
      const activityRef = doc(db, 'userActivity', `${user.uid}_${resource.id}`);
      
      // Update resource helpful count
      if (isHelpful === null) {
        // First time marking
        await updateDoc(resourceRef, {
          helpfulCount: increment(helpful ? 1 : -1)
        });
        setHelpfulCount(prev => prev + (helpful ? 1 : -1));
      } else if (isHelpful !== helpful) {
        // Changing from helpful to not helpful or vice versa
        await updateDoc(resourceRef, {
          helpfulCount: increment(helpful ? 2 : -2)
        });
        setHelpfulCount(prev => prev + (helpful ? 2 : -2));
      }
      
      // Save helpful status to userActivity
      await setDoc(activityRef, {
        userId: user.uid,
        resourceId: resource.id,
        helpful,
        helpfulAt: Timestamp.now()
      }, { merge: true });
      
      setIsHelpful(helpful);
      
      // Track activity if marked as helpful
      if (helpful) {
        await trackActivity('helpful', resource.id);
        toast.success('Thanks for the feedback! 👍');
      } else {
        toast.info('Feedback updated');
      }
    } catch (error) {
      console.error('Error updating helpful:', error);
      toast.error('Failed to update helpful status');
    }
  };

  const handleRecommend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning('Please sign in to recommend resources');
      return;
    }

    try {
      const resourceRef = doc(db, 'resources', resource.id);
      
      if (isRecommended) {
        await updateDoc(resourceRef, {
          recommendations: arrayRemove(user.uid),
        });
        setIsRecommended(false);
        setRecommendCount(recommendCount - 1);
        toast.info('Recommendation removed');
      } else {
        await updateDoc(resourceRef, {
          recommendations: arrayUnion(user.uid),
        });
        setIsRecommended(true);
        setRecommendCount(recommendCount + 1);
        toast.success('Resource recommended! ⭐');
      }
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/?resourceId=${resource.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
      <div className="flex-1 p-4 pb-2 flex flex-col">
        <div className="flex items-start justify-between mb-2 pr-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3rem]">
            {resource.title}
          </h2>
          <span className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md whitespace-nowrap flex-shrink-0">
            {resource.type}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {resource.description}
        </p>

        {resource.techStack && resource.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[2rem]">
            {resource.techStack.slice(0, 5).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 shadow-sm h-fit"
              >
                {tech}
              </span>
            ))}
            {resource.techStack.length > 5 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 shadow-sm h-fit">
                +{resource.techStack.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto p-4 pt-0">
        {/* Progress indicators */}
        {user && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={handleComplete}
              disabled={isCompleted}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              {isCompleted ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold">Completed</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xs font-semibold">Mark Complete</span>
                </>
              )}
            </button>
            
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleHelpful(e, true)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isHelpful === true
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
                title="Mark as helpful"
              >
                <svg className="w-3.5 h-3.5" fill={isHelpful === true ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              
              <button
                onClick={(e) => handleHelpful(e, false)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isHelpful === false
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
                title="Mark as not helpful"
              >
                <svg className="w-3.5 h-3.5" fill={isHelpful === false ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
              
              {helpfulCount > 0 && (
                <span className="ml-1 text-xs font-semibold text-green-600 dark:text-green-400">
                  {helpfulCount}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{resource.source}</span>
            </div>
            
            {viewCount > 0 && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs font-medium">{viewCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user && resource.submittedBy === user.uid && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
                title="Edit your resource"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-xs font-medium">Edit</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCommentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs font-medium">View Details</span>
            </button>
            <button
              onClick={handleRecommend}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                isRecommended
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Recommend this resource"
            >
              <svg className="w-3.5 h-3.5" fill={isRecommended ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {recommendCount > 0 && <span className="text-xs font-semibold">{recommendCount}</span>}
            </button>
            {user && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRecommendModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                title="Recommend to a friend"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
            <button
              onClick={handleShare}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                copySuccess
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={copySuccess ? 'Link copied!' : 'Copy link to this resource'}
            >
              {copySuccess ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </button>
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Open resource link"
            >
              <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        resourceId={resource.id}
      />

      <RecommendModal
        isOpen={isRecommendModalOpen}
        onClose={() => setIsRecommendModalOpen(false)}
        resourceId={resource.id}
        resourceTitle={resource.title}
      />

      {isEditModalOpen && (
        <SubmitModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editMode={true}
          existingResource={resource}
        />
      )}

      <button
        onClick={handleFavorite}
        className="absolute cursor-pointer top-3 right-3 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-10 border border-gray-200 dark:border-gray-700"
        aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
      >
        <svg
          className={`w-4 h-4 transition-all ${
            isFavorited
              ? 'fill-red-500 text-red-500 scale-110'
              : 'fill-none text-gray-400 dark:text-gray-500'
          }`}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {favCount > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold shadow-md">
            {favCount}
          </span>
        )}
      </button>
    </div>
  );
}
