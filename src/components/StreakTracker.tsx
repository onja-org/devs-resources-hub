'use client';

import { useEffect } from 'react';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useAuth } from '@/contexts/AuthContext';

export default function StreakTracker() {
  const { user } = useAuth();
  const { updateStreak } = useUserProgress();

  useEffect(() => {
    if (user) {
      // Update streak when user visits
      updateStreak();
    }
  }, [user]);

  return null; // This component doesn't render anything
}
