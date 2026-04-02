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
  users: [],
  currentUser: {
    id: 'user-you',
    name: 'You',
    color: '#8b5cf6',
    avatar: 'Y',
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
}));
