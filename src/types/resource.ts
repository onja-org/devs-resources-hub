import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
  replies: Comment[];
  parentId?: string | null;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
  type: string;
  techStack: string[];
  source: string;
  createdAt: Timestamp;
  favorites: string[];
  comments: Comment[];
  approved?: boolean;
  recommendations: string[]; // Array of user IDs who recommended this
  submittedBy?: string; // User ID of the submitter
  viewCount?: number; // Track popularity
  helpfulCount?: number; // Track usefulness
  completedCount?: number; // Track how many users completed this
  readingTime?: number; // Estimated reading time in minutes
  brokenLinkReports?: string[]; // Array of user IDs who reported broken link
}

export interface Notification {
  id: string;
  userId: string;
  type: 'recommendation' | 'resource_approved' | 'resource_declined' | 'achievement' | 'streak_reminder' | 'learning_milestone';
  resourceId?: string;
  resourceTitle?: string;
  fromUserId?: string;
  fromUserName?: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  achievementType?: string;
}

// User Profile & Progress Tracking
export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  skills: string[]; // Technologies they know
  learningGoals: string[]; // Technologies they want to learn
  experience: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  dailyReminder: boolean;
  weeklyDigest: boolean;
  showLeaderboard: boolean;
  publicProfile: boolean;
}

// Gamification & Progress
export interface UserProgress {
  id: string;
  userId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD format
  totalResourcesViewed: number;
  totalResourcesCompleted: number;
  totalResourcesBookmarked: number;
  totalResourcesSubmitted: number;
  totalContributions: number;
  achievements: string[]; // Achievement IDs
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Timestamp;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: {
    type: 'streak' | 'views' | 'completed' | 'submissions' | 'helpful' | 'favorites';
    count: number;
  };
}

// Bookmarks & Collections
export interface Bookmark {
  id: string;
  userId: string;
  resourceId: string;
  collectionId?: string;
  tags: string[];
  notes: string;
  createdAt: Timestamp;
  isCompleted: boolean;
  completedAt?: Timestamp;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  resourceIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Learning Paths
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  technology: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  steps: LearningStep[];
  createdBy: string;
  isOfficial: boolean;
  enrolledUsers: string[];
  createdAt: Timestamp;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  resourceIds: string[];
  order: number;
  estimatedMinutes: number;
}

export interface UserPathProgress {
  id: string;
  userId: string;
  pathId: string;
  enrolledAt: Timestamp;
  currentStepId: string;
  completedSteps: string[];
  progress: number; // 0-100
  completedAt?: Timestamp;
}

// Goals & Reminders
export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  technology: string;
  targetDate: Timestamp;
  minutesPerDay?: number;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Social Features
export interface StudyBuddy {
  id: string;
  userId1: string;
  userId2: string;
  status: 'pending' | 'active' | 'inactive';
  sharedGoals: string[];
  createdAt: Timestamp;
}

export interface ResourceReview {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  isHelpful: boolean;
  review?: string;
  skillBefore?: number; // 1-5
  skillAfter?: number; // 1-5
  createdAt: Timestamp;
}

// Activity Tracking
export interface UserActivity {
  id: string;
  userId: string;
  type: 'viewed' | 'completed' | 'bookmarked' | 'reviewed' | 'submitted' | 'recommended';
  resourceId: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

