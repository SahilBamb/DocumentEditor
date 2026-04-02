import { create } from 'zustand';

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  cursorPosition?: { from: number; to: number };
}

interface PresenceState {
  users: PresenceUser[];
  currentUser: PresenceUser;
}

export const usePresenceStore = create<PresenceState>(() => ({
  users: [
    {
      id: 'user-alice',
      name: 'Alice Chen',
      color: '#3b82f6',
      avatar: 'AC',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      cursorPosition: { from: 42, to: 42 },
    },
    {
      id: 'user-bob',
      name: 'Bob Martinez',
      color: '#f59e0b',
      avatar: 'BM',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      cursorPosition: { from: 108, to: 120 },
    },
    {
      id: 'user-carol',
      name: 'Carol Smith',
      color: '#10b981',
      avatar: 'CS',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  currentUser: {
    id: 'user-you',
    name: 'You',
    color: '#8b5cf6',
    avatar: 'Y',
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
}));
