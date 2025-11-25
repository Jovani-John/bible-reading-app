export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  notificationTime?: string;
  notificationsEnabled: boolean;
}

export interface Note {
  id: string;
  userId: string;
  day: number;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  userId: string;
  completedDays: number[];
  notes: Note[];
  lastUpdated: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface DailyVerse {
  verse: string;
  reference: string;
  date: string;
}