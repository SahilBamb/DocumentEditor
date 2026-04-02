'use client';

import { useState } from 'react';
import { usePresenceStore, type PresenceUser } from '@/stores/presence-store';

function Avatar({ user }: { user: PresenceUser }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white transition-opacity"
        style={{
          background: user.color,
          opacity: user.isOnline ? 1 : 0.4,
        }}
      >
        {user.avatar}
      </div>
      {user.isOnline && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
          style={{ background: '#22c55e' }}
        />
      )}
      {hovered && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap z-50 glass-strong shadow-float"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="font-medium">{user.name}</span>
          <span className="ml-1.5" style={{ color: user.isOnline ? '#22c55e' : 'var(--text-tertiary)' }}>
            {user.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      )}
    </div>
  );
}

export function PresenceAvatars() {
  const users = usePresenceStore((s) => s.users);
  const currentUser = usePresenceStore((s) => s.currentUser);

  const allUsers = [currentUser, ...users];
  const visible = allUsers.slice(0, 4);
  const overflow = allUsers.length - 4;

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((user) => (
        <Avatar key={user.id} user={user} />
      ))}
      {overflow > 0 && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
          style={{ background: 'rgba(0,0,0,0.08)', color: 'var(--text-secondary)' }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
