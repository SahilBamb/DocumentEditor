'use client';

import { MessageSquare, GitCompareArrows, History, MessageSquareText } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { ChatPanel } from '@/components/right-rail/ChatPanel';
import { ChangesPanel } from '@/components/right-rail/ChangesPanel';
import { HistoryPanel } from '@/components/right-rail/HistoryPanel';
import { CommentsPanel } from '@/components/right-rail/CommentsPanel';
import { cn } from '@/lib/utils';
import type { RightPanelTab } from '@/types';

const tabs: { id: RightPanelTab; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'changes', label: 'Changes', icon: GitCompareArrows },
  { id: 'comments', label: 'Comments', icon: MessageSquareText },
  { id: 'history', label: 'History', icon: History },
];

export function RightPanel() {
  const activeTab = useUIStore((s) => s.rightPanelTab);
  const setTab = useUIStore((s) => s.setRightPanelTab);

  return (
    <div className="glass h-full flex flex-col" style={{ borderLeft: '1px solid var(--border-glass)' }}>
      <div className="flex items-center border-b flex-shrink-0" style={{ borderColor: 'var(--border-glass)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors cursor-pointer relative',
            )}
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-tertiary)',
            }}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'changes' && <ChangesPanel />}
        {activeTab === 'comments' && <CommentsPanel />}
        {activeTab === 'history' && <HistoryPanel />}
      </div>
    </div>
  );
}
