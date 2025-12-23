'use client';

import { Resource } from '@/types/resource';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState } from 'react';
import CommentModal from './CommentModal';
import RecommendModal from './RecommendModal';

import Link from 'next/link';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(
    user ? resource.favorites.includes(user.uid) : false
  );
  const [favCount, setFavCount] = useState(resource.favorites.length);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [isRecommended, setIsRecommended] = useState(
    user && resource.recommendations ? resource.recommendations.includes(user.uid) : false
  );
  const [recommendCount, setRecommendCount] = useState(resource.recommendations?.length || 0);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to favorite resources');
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
      } else {
        await updateDoc(resourceRef, {
          favorites: arrayUnion(user.uid),
        });
        setIsFavorited(true);
        setFavCount(favCount + 1);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      alert('Failed to update favorite');
    }
  };

  const handleRecommend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to recommend resources');
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
      } else {
        await updateDoc(resourceRef, {
          recommendations: arrayUnion(user.uid),
        });
        setIsRecommended(true);
        setRecommendCount(recommendCount + 1);
      }
    } catch (error) {
      console.error('Error updating recommendation:', error);
      alert('Failed to update recommendation');
    }
  };

  return (
    <div className="group relative flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
      <div className="flex-1 p-6 pb-4">
        <div className="flex items-start justify-between mb-4 pr-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {resource.title}
          </h2>
          <span className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md whitespace-nowrap flex-shrink-0">
            {resource.type}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
          {resource.description}
        </p>

        {resource.techStack && resource.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {resource.techStack.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-6 pt-0">
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{resource.source}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCommentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs font-medium">View Details</span>
            </button>
            <button
              onClick={handleRecommend}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                isRecommended
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Recommend this resource"
            >
              <svg className="w-4 h-4" fill={isRecommended ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
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
                className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                title="Recommend to a friend"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Open resource link"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <button
        onClick={handleFavorite}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-10 border border-gray-200 dark:border-gray-700"
        aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
      >
        <svg
          className={`w-5 h-5 transition-all ${
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
          <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-md">
            {favCount}
          </span>
        )}
      </button>
    </div>
  );
}
