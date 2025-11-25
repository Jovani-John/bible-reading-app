// lib/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string; // تم التغيير إلى string
  notificationsEnabled?: boolean;
  notificationTime?: string;
}

export interface Note {
  id: string;
  userId: string;
  day: number;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  userId: string;
  completedDays: number[];
  notes: Note[];
  lastUpdated: string;
}

export interface Reading {
  day: number;
  date: string;
  book?: string;
  summary?: string;
  readings: string[];
}