'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { collection, doc, getDoc, setDoc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProgress, Badge } from '@/types/resource';
import { calculateLevel, getXPForNextLevel, checkNewAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { useToast } from './ToastContext';

interface UserProgressContextType {
  userProgress: UserProgress | null;
  loading: boolean;
  updateStreak: () => Promise<void>;
  addXP: (amount: number, reason: string) => Promise<void>;
  trackActivity: (type: 'viewed' | 'completed' | 'bookmarked' | 'submitted' | 'helpful', resourceId: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export function UserProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize or fetch user progress
  useEffect(() => {
    if (!user) {
      setUserProgress(null);
      setLoading(false);
      return;
    }

    fetchUserProgress();
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        setUserProgress({ id: progressDoc.id, ...progressDoc.data() } as UserProgress);
      } else {
        // Create initial progress
        const initialProgress: Omit<UserProgress, 'id'> = {
          userId: user.uid,
          xp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastVisitDate: '',
          totalResourcesViewed: 0,
          totalResourcesCompleted: 0,
          totalResourcesBookmarked: 0,
          totalResourcesSubmitted: 0,
          totalContributions: 0,
          achievements: [],
          badges: []
        };

        await setDoc(progressRef, initialProgress);
        setUserProgress({ id: user.uid, ...initialProgress });
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProgress = useCallback(async () => {
    await fetchUserProgress();
  }, [user]);

  const updateStreak = async () => {
    if (!user || !userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    const lastVisit = userProgress.lastVisitDate;

    // Already updated today
    if (lastVisit === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;

    if (lastVisit === yesterday) {
      // Continue streak
      newStreak = (userProgress.currentStreak || 0) + 1;
    }

    const longestStreak = Math.max(newStreak, userProgress.longestStreak || 0);

    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      await updateDoc(progressRef, {
        currentStreak: newStreak,
        longestStreak,
        lastVisitDate: today
      });

      const updated = { ...userProgress, currentStreak: newStreak, longestStreak, lastVisitDate: today };
      setUserProgress(updated);

      // Check for streak achievements
      const newAchievements = checkNewAchievements(updated, userProgress.achievements);
      if (newAchievements.length > 0) {
        await unlockAchievements(newAchievements);
      }

      // Celebrate streaks
      if (newStreak === 3) {
        toast.success('🔥 3-day streak! Keep it going!');
      } else if (newStreak === 7) {
        toast.success('⚡ 7-day streak! You\'re on fire!');
      } else if (newStreak % 10 === 0 && newStreak >= 10) {
        toast.success(`💪 ${newStreak}-day streak! Incredible!`);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const addXP = async (amount: number, reason: string) => {
    if (!user || !userProgress) return;

    const newXP = (userProgress.xp || 0) + amount;
    const newLevel = calculateLevel(newXP);
    const oldLevel = userProgress.level || 1;

    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      await updateDoc(progressRef, {
        xp: newXP,
        level: newLevel
      });

      setUserProgress({ ...userProgress, xp: newXP, level: newLevel });

      // Level up notification
      if (newLevel > oldLevel) {
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
        
        // Create notification
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          type: 'learning_milestone',
          message: `Congratulations! You've reached level ${newLevel}!`,
          read: false,
          createdAt: Timestamp.now()
        });
      } else {
        toast.info(`+${amount} XP ${reason ? `(${reason})` : ''}`);
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const unlockAchievements = async (achievements: typeof ACHIEVEMENTS) => {
    if (!user || !userProgress) return;

    const newAchievementIds = achievements.map(a => a.id);
    const newBadges: Badge[] = achievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlockedAt: Timestamp.now()
    }));

    const totalXP = achievements.reduce((sum, a) => sum + a.xpReward, 0);

    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      await updateDoc(progressRef, {
        achievements: [...userProgress.achievements, ...newAchievementIds],
        badges: [...userProgress.badges, ...newBadges],
        xp: (userProgress.xp || 0) + totalXP
      });

      // Show achievement notifications
      for (const achievement of achievements) {
        toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`);
        
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          type: 'achievement',
          achievementType: achievement.id,
          message: `You unlocked "${achievement.name}" - ${achievement.description}`,
          read: false,
          createdAt: Timestamp.now()
        });
      }

      await refreshProgress();
    } catch (error) {
      console.error('Error unlocking achievements:', error);
    }
  };

  const trackActivity = async (
    type: 'viewed' | 'completed' | 'bookmarked' | 'submitted' | 'helpful',
    resourceId: string
  ) => {
    if (!user || !userProgress) return;

    try {
      // Check if this specific activity was already tracked
      const activityRef = doc(db, 'userActivity', `${user.uid}_${resourceId}`);
      const activityDoc = await getDoc(activityRef);
      
      // For views, only track once per resource per user
      if (type === 'viewed' && activityDoc.exists() && activityDoc.data().viewed) {
        return; // Already viewed, don't award XP again
      }
      
      // For completed, only track once
      if (type === 'completed' && activityDoc.exists() && activityDoc.data().completed) {
        return; // Already completed, don't award XP again
      }
      
      // For bookmarked, check if already bookmarked
      if (type === 'bookmarked' && activityDoc.exists() && activityDoc.data().bookmarked) {
        return; // Already bookmarked, don't award XP again
      }

      const updates: any = {};
      let xpAmount = 0;
      let xpReason = '';

      switch (type) {
        case 'viewed':
          updates.totalResourcesViewed = (userProgress.totalResourcesViewed || 0) + 1;
          xpAmount = 5;
          xpReason = 'viewing a resource';
          break;
        case 'completed':
          updates.totalResourcesCompleted = (userProgress.totalResourcesCompleted || 0) + 1;
          xpAmount = 25;
          xpReason = 'completing a resource';
          break;
        case 'bookmarked':
          updates.totalResourcesBookmarked = (userProgress.totalResourcesBookmarked || 0) + 1;
          xpAmount = 10;
          xpReason = 'bookmarking a resource';
          break;
        case 'submitted':
          updates.totalResourcesSubmitted = (userProgress.totalResourcesSubmitted || 0) + 1;
          xpAmount = 50;
          xpReason = 'submitting a resource';
          break;
        case 'helpful':
          updates.totalHelpfulMarked = ((userProgress as any).totalHelpfulMarked || 0) + 1;
          xpAmount = 5;
          xpReason = 'marking as helpful';
          break;
      }

      // Update progress
      const progressRef = doc(db, 'userProgress', user.uid);
      await updateDoc(progressRef, updates);

      // Track activity in general log (for analytics)
      await addDoc(collection(db, 'userActivity'), {
        userId: user.uid,
        type,
        resourceId,
        timestamp: Timestamp.now()
      });

      // Add XP
      if (xpAmount > 0) {
        await addXP(xpAmount, xpReason);
      }

      // Check for new achievements
      const updated = { ...userProgress, ...updates };
      const newAchievements = checkNewAchievements(updated, userProgress.achievements);
      if (newAchievements.length > 0) {
        await unlockAchievements(newAchievements);
      }

      await refreshProgress();
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  return (
    <UserProgressContext.Provider
      value={{
        userProgress,
        loading,
        updateStreak,
        addXP,
        trackActivity,
        refreshProgress
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
}

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within UserProgressProvider');
  }
  return context;
}
