'use client';

import { RotateCcw, User, Sparkles, Settings, GitBranch, Plus, Minus, GitCompareArrows } from 'lucide-react';
import { useDocumentStore } from '@/stores/document-store';
import { useUIStore } from '@/stores/ui-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { cn } from '@/lib/utils';
import { RelativeTime } from '@/components/shared/RelativeTime';
import type { DocumentRevision } from '@/types';

const creatorIcons = {
  user: User,
  ai: Sparkles,
  system: Settings,
};

export function HistoryPanel() {
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const allRevisions = useDocumentStore((s) => s.revisions);
  const revisions = allRevisions.filter((r) => r.documentId === (activeDocId ?? ''));
  const restoreRevision = useDocumentStore((s) => s.restoreRevision);
  const openCompareModal = useUIStore((s) => s.openCompareModal);
  const currentRevisionId = useDocumentStore((s) => {
    const doc = s.documents.find((d) => d.id === s.activeDocumentId);
    return doc?.currentRevisionId;
  });

  const sorted = [...revisions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const chronological = [...revisions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            <GitBranch size={20} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No revision history
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Revisions are created when changes are accepted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {sorted.length} revision{sorted.length !== 1 ? 's' : ''}
        </span>
        {sorted.length >= 2 && (
          <GlassButton
            size="sm"
            variant="glass"
            icon={<GitCompareArrows size={12} />}
            onClick={() => openCompareModal()}
          >
            Compare
          </GlassButton>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {sorted.map((rev, idx) => {
          const chronoIdx = chronological.findIndex((r) => r.id === rev.id);
          const prevRevision = chronoIdx > 0 ? chronological[chronoIdx - 1] : null;
          return (
            <RevisionItem
              key={rev.id}
              revision={rev}
              isCurrent={rev.id === currentRevisionId}
              isLast={idx === sorted.length - 1}
              onRestore={() => restoreRevision(rev.id)}
              onCompareWithPrevious={
                prevRevision
                  ? () => openCompareModal(prevRevision.id, rev.id)
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function RevisionItem({
  revision,
  isCurrent,
  isLast,
  onRestore,
  onCompareWithPrevious,
}: {
  revision: DocumentRevision;
  isCurrent: boolean;
  isLast: boolean;
  onRestore: () => void;
  onCompareWithPrevious?: () => void;
}) {
  const Icon = creatorIcons[revision.createdByType];

  return (
    <div className="flex gap-3 px-4 group">
      <div className="flex flex-col items-center pt-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: isCurrent ? 'var(--accent-light)' : 'rgba(0,0,0,0.04)',
            color: isCurrent ? 'var(--accent)' : 'var(--text-tertiary)',
          }}
        >
          <Icon size={13} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ background: 'var(--border-glass)' }} />
        )}
      </div>

      <div
        className="flex-1 py-3"
        style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {revision.summary}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>
                {revision.createdByType}
              </span>
              <RelativeTime
                date={revision.createdAt}
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              {revision.statsAdded > 0 && (
                <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--green-text)' }}>
                  <Plus size={10} />
                  {revision.statsAdded}
                </span>
              )}
              {revision.statsRemoved > 0 && (
                <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--red-text)' }}>
                  <Minus size={10} />
                  {revision.statsRemoved}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onCompareWithPrevious && (
              <GlassButton
                size="sm"
                variant="ghost"
                icon={<GitCompareArrows size={12} />}
                onClick={onCompareWithPrevious}
                title="Compare with previous"
              />
            )}
            {!isCurrent && (
              <GlassButton
                size="sm"
                variant="glass"
                icon={<RotateCcw size={12} />}
                onClick={onRestore}
              >
                Restore
              </GlassButton>
            )}
          </div>
        </div>

        {isCurrent && (
          <span
            className="inline-block text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded mt-2"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            Current
          </span>
        )}
      </div>
    </div>
  );
}
