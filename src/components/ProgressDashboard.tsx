'use client';

import { useUserProgress } from '@/contexts/UserProgressContext';
import { useAuth } from '@/contexts/AuthContext';
import { getXPForNextLevel, getXPProgress } from '@/lib/achievements';
import { useState } from 'react';

export default function ProgressDashboard() {
  const { user } = useAuth();
  const { userProgress, loading } = useUserProgress();
  const [showDetails, setShowDetails] = useState(false);

  if (!user || loading) return null;
  if (!userProgress) return null;

  const nextLevelXP = getXPForNextLevel(userProgress.level);
  const xpProgress = getXPProgress(userProgress.xp, userProgress.level);

  return (
    <>
      {/* Compact Progress Bar - Always Visible */}
      <div className="fixed top-16 right-4 z-30">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            {/* Level */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {userProgress.level}
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{userProgress.level}</p>
              </div>
            </div>

            {/* Streak */}
            {userProgress.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <span className="text-lg">🔥</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{userProgress.currentStreak}</span>
              </div>
            )}

            {/* XP Bar */}
            <div className="hidden sm:block">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {userProgress.xp} / {nextLevelXP} XP
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Detailed Progress Modal */}
      {showDetails && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDetails(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Progress</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Level & XP */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Current Level</p>
                    <p className="text-4xl font-bold">{userProgress.level}</p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                    {userProgress.level}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{userProgress.xp} XP</span>
                    <span>{nextLevelXP} XP</span>
                  </div>
                  <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                  <p className="text-sm opacity-90 text-center">
                    {Math.round(xpProgress)}% to Level {userProgress.level + 1}
                  </p>
                </div>
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔥</span>
                    <p className="font-semibold text-gray-900 dark:text-white">Current Streak</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userProgress.currentStreak}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">days in a row</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏆</span>
                    <p className="font-semibold text-gray-900 dark:text-white">Longest Streak</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{userProgress.longestStreak}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">days</p>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Viewed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProgress.totalResourcesViewed}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userProgress.totalResourcesCompleted}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Bookmarked</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userProgress.totalResourcesBookmarked}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Submitted</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userProgress.totalResourcesSubmitted}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Achievements</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userProgress.achievements.length}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total XP</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{userProgress.xp}</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {userProgress.badges.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    Achievements ({userProgress.badges.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userProgress.badges.slice(0, 6).map((badge) => (
                      <div
                        key={badge.id}
                        className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-center"
                      >
                        <div className="text-3xl mb-1">{badge.icon}</div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{badge.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                  {userProgress.badges.length > 6 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                      +{userProgress.badges.length - 6} more achievements
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
