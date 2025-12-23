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
}

export interface Notification {
  id: string;
  userId: string;
  type: 'recommendation';
  resourceId: string;
  resourceTitle: string;
  fromUserId: string;
  fromUserName: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}
