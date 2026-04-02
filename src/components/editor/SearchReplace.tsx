'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Replace } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { GlassButton } from '@/components/shared/GlassButton';

export function SearchReplace() {
  const setSearchReplaceOpen = useUIStore((s) => s.setSearchReplaceOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  return (
    <div
      className="absolute top-2 right-4 z-40 glass-strong shadow-float rounded-xl fade-in"
      style={{ width: '340px' }}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="flex-1 h-8 px-3 rounded-lg text-sm bg-black/[0.03] outline-none focus:ring-2"
            style={{
              color: 'var(--text-primary)',
              ['--tw-ring-color' as string]: 'var(--accent-medium)',
            }}
            autoFocus
          />
          <div className="flex items-center gap-0.5">
            <GlassButton size="sm" icon={<ChevronUp size={14} />} title="Previous" />
            <GlassButton size="sm" icon={<ChevronDown size={14} />} title="Next" />
            <GlassButton
              size="sm"
              icon={<Replace size={14} />}
              onClick={() => setShowReplace(!showReplace)}
              title="Toggle replace"
            />
            <GlassButton
              size="sm"
              icon={<X size={14} />}
              onClick={() => setSearchReplaceOpen(false)}
              title="Close"
            />
          </div>
        </div>

        {showReplace && (
          <div className="flex items-center gap-2 fade-in">
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Replace with..."
              className="flex-1 h-8 px-3 rounded-lg text-sm bg-black/[0.03] outline-none focus:ring-2"
              style={{
                color: 'var(--text-primary)',
                ['--tw-ring-color' as string]: 'var(--accent-medium)',
              }}
            />
            <GlassButton size="sm" variant="glass">
              Replace
            </GlassButton>
            <GlassButton size="sm" variant="glass">
              All
            </GlassButton>
          </div>
        )}
      </div>
    </div>
  );
}
