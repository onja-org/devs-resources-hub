import { Achievement } from '@/types/resource';

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Visit 3 days in a row',
    icon: '🔥',
    xpReward: 50,
    requirement: { type: 'streak', count: 3 }
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Visit 7 days in a row',
    icon: '⚡',
    xpReward: 150,
    requirement: { type: 'streak', count: 7 }
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Visit 30 days in a row',
    icon: '💪',
    xpReward: 500,
    requirement: { type: 'streak', count: 30 }
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Visit 100 days in a row',
    icon: '👑',
    xpReward: 2000,
    requirement: { type: 'streak', count: 100 }
  },

  // Views Achievements
  {
    id: 'views_10',
    name: 'Curious Mind',
    description: 'View 10 resources',
    icon: '👀',
    xpReward: 25,
    requirement: { type: 'views', count: 10 }
  },
  {
    id: 'views_50',
    name: 'Knowledge Seeker',
    description: 'View 50 resources',
    icon: '🔍',
    xpReward: 100,
    requirement: { type: 'views', count: 50 }
  },
  {
    id: 'views_100',
    name: 'Explorer',
    description: 'View 100 resources',
    icon: '🗺️',
    xpReward: 250,
    requirement: { type: 'views', count: 100 }
  },
  {
    id: 'views_500',
    name: 'Master Explorer',
    description: 'View 500 resources',
    icon: '🌟',
    xpReward: 1000,
    requirement: { type: 'views', count: 500 }
  },

  // Completed Achievements
  {
    id: 'completed_5',
    name: 'First Steps',
    description: 'Complete 5 resources',
    icon: '✅',
    xpReward: 50,
    requirement: { type: 'completed', count: 5 }
  },
  {
    id: 'completed_25',
    name: 'Dedicated Learner',
    description: 'Complete 25 resources',
    icon: '📚',
    xpReward: 200,
    requirement: { type: 'completed', count: 25 }
  },
  {
    id: 'completed_100',
    name: 'Learning Machine',
    description: 'Complete 100 resources',
    icon: '🎓',
    xpReward: 750,
    requirement: { type: 'completed', count: 100 }
  },

  // Submission Achievements
  {
    id: 'submit_1',
    name: 'Contributor',
    description: 'Submit your first resource',
    icon: '📝',
    xpReward: 100,
    requirement: { type: 'submissions', count: 1 }
  },
  {
    id: 'submit_5',
    name: 'Active Contributor',
    description: 'Submit 5 resources',
    icon: '✨',
    xpReward: 300,
    requirement: { type: 'submissions', count: 5 }
  },
  {
    id: 'submit_20',
    name: 'Content Creator',
    description: 'Submit 20 resources',
    icon: '🏆',
    xpReward: 1000,
    requirement: { type: 'submissions', count: 20 }
  },

  // Helpful Achievements
  {
    id: 'helpful_10',
    name: 'Helpful Friend',
    description: 'Mark 10 resources as helpful',
    icon: '👍',
    xpReward: 50,
    requirement: { type: 'helpful', count: 10 }
  },
  {
    id: 'helpful_50',
    name: 'Community Helper',
    description: 'Mark 50 resources as helpful',
    icon: '💖',
    xpReward: 200,
    requirement: { type: 'helpful', count: 50 }
  },

  // Favorites Achievements
  {
    id: 'favorites_10',
    name: 'Collector',
    description: 'Favorite 10 resources',
    icon: '⭐',
    xpReward: 30,
    requirement: { type: 'favorites', count: 10 }
  },
  {
    id: 'favorites_50',
    name: 'Curator',
    description: 'Favorite 50 resources',
    icon: '💎',
    xpReward: 150,
    requirement: { type: 'favorites', count: 50 }
  }
];

export function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForNextLevel(currentLevel: number): number {
  // XP needed for next level = (nextLevel)^2 * 100
  return Math.pow(currentLevel + 1, 2) * 100;
}

export function getXPProgress(currentXP: number, currentLevel: number): number {
  const currentLevelXP = Math.pow(currentLevel, 2) * 100;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.max(0, Math.min(100, progress));
}

export function checkNewAchievements(
  userProgress: any,
  unlockedAchievements: string[]
): Achievement[] {
  const newAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (unlockedAchievements.includes(achievement.id)) return;

    const { type, count } = achievement.requirement;
    let currentCount = 0;

    switch (type) {
      case 'streak':
        currentCount = userProgress.currentStreak || 0;
        break;
      case 'views':
        currentCount = userProgress.totalResourcesViewed || 0;
        break;
      case 'completed':
        currentCount = userProgress.totalResourcesCompleted || 0;
        break;
      case 'submissions':
        currentCount = userProgress.totalResourcesSubmitted || 0;
        break;
      case 'helpful':
        currentCount = userProgress.totalHelpfulMarked || 0;
        break;
      case 'favorites':
        currentCount = userProgress.totalResourcesBookmarked || 0;
        break;
    }

    if (currentCount >= count) {
      newAchievements.push(achievement);
    }
  });

  return newAchievements;
}
