'use client';

import { Check, X, CheckCheck, XCircle, ChevronDown, ChevronUp, Eye, Send, Users } from 'lucide-react';
import { useState } from 'react';
import { useChangeStore } from '@/stores/change-store';
import { useDocumentStore } from '@/stores/document-store';
import { useUIStore } from '@/stores/ui-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { cn, generateId } from '@/lib/utils';
import type { ChangeItem, ChangeSet, ReviewRequest } from '@/types';

export function ChangesPanel() {
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const allChangeSets = useChangeStore((s) => s.changeSets);
  const changeSets = allChangeSets.filter((cs) => cs.documentId === activeDocId);
  const activeChangeSetId = useChangeStore((s) => s.activeChangeSetId);
  const setActiveChangeSet = useChangeStore((s) => s.setActiveChangeSet);
  const showInlineDiff = useUIStore((s) => s.showInlineDiff);
  const setShowInlineDiff = useUIStore((s) => s.setShowInlineDiff);

  if (changeSets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            <Eye size={20} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No pending changes
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            AI-proposed edits will appear here for review
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {changeSets.length} change set{changeSets.length !== 1 ? 's' : ''}
        </span>
        <GlassButton
          size="sm"
          icon={<Eye size={13} />}
          onClick={() => setShowInlineDiff(!showInlineDiff)}
          className={showInlineDiff ? '' : 'opacity-50'}
        >
          Inline diff
        </GlassButton>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {changeSets.map((cs) => (
          <ChangeSetCard
            key={cs.id}
            changeSet={cs}
            isActive={activeChangeSetId === cs.id}
            onSelect={() => setActiveChangeSet(cs.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ChangeSetCard({
  changeSet,
  isActive,
  onSelect,
}: {
  changeSet: ChangeSet;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerInput, setReviewerInput] = useState('');
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const updateItemStatus = useChangeStore((s) => s.updateItemStatus);
  const acceptAll = useChangeStore((s) => s.acceptAll);
  const rejectAll = useChangeStore((s) => s.rejectAll);
  const setHighlightedId = useUIStore((s) => s.setHighlightedChangeItemId);

  const handleSendReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reviewerInput.trim()) return;
    const newReview: ReviewRequest = {
      id: generateId(),
      changeSetId: changeSet.id,
      requestedBy: 'You',
      reviewers: [reviewerInput.trim()],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, newReview]);
    setReviewerInput('');
    setShowReviewForm(false);
  };

  const pendingCount = changeSet.items.filter((i) => i.status === 'pending').length;
  const acceptedCount = changeSet.items.filter((i) => i.status === 'accepted').length;
  const rejectedCount = changeSet.items.filter((i) => i.status === 'rejected').length;

  const statusColor =
    changeSet.status === 'approved'
      ? 'var(--green-text)'
      : changeSet.status === 'rejected'
        ? 'var(--red-text)'
        : changeSet.status === 'partially_approved'
          ? 'var(--yellow-text)'
          : 'var(--accent)';

  return (
    <div
      className={cn('rounded-xl overflow-hidden transition-all cursor-pointer')}
      style={{
        border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
        background: 'var(--bg-paper)',
        boxShadow: isActive ? '0 0 0 2px var(--accent-light)' : 'var(--shadow-glass)',
      }}
      onClick={onSelect}
    >
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-medium pr-2" style={{ color: 'var(--text-primary)' }}>
            {changeSet.summary}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex-shrink-0 cursor-pointer"
          >
            {expanded ? (
              <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} />
            ) : (
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
            )}
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span style={{ color: statusColor }} className="font-medium capitalize">
            {changeSet.status.replace('_', ' ')}
          </span>
          <span>{changeSet.items.length} changes</span>
          {acceptedCount > 0 && (
            <span style={{ color: 'var(--green-text)' }}>{acceptedCount} accepted</span>
          )}
          {rejectedCount > 0 && (
            <span style={{ color: 'var(--red-text)' }}>{rejectedCount} rejected</span>
          )}
        </div>
      </div>

      {expanded && (
        <div>
          {changeSet.items.map((item) => (
            <ChangeItemCard
              key={item.id}
              item={item}
              onAccept={() => updateItemStatus(changeSet.id, item.id, 'accepted')}
              onReject={() => updateItemStatus(changeSet.id, item.id, 'rejected')}
              onHover={() => setHighlightedId(item.id)}
              onLeave={() => setHighlightedId(null)}
            />
          ))}

          {pendingCount > 0 && (
            <div
              className="px-3 py-2 flex items-center gap-2"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <GlassButton
                size="sm"
                variant="accent"
                icon={<CheckCheck size={13} />}
                onClick={(e) => {
                  e.stopPropagation();
                  acceptAll(changeSet.id);
                }}
              >
                Accept all
              </GlassButton>
              <GlassButton
                size="sm"
                variant="glass"
                icon={<XCircle size={13} />}
                onClick={(e) => {
                  e.stopPropagation();
                  rejectAll(changeSet.id);
                }}
              >
                Reject all
              </GlassButton>
            </div>
          )}

          <div className="px-3 py-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                {reviews.map((r) =>
                  r.reviewers.map((name) => (
                    <div
                      key={r.id + name}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                    >
                      <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[8px] text-white"
                        style={{ background: 'var(--accent)' }}
                      >
                        {name[0]?.toUpperCase()}
                      </span>
                      {name}
                      <span
                        className="ml-0.5 px-1 py-px rounded text-[9px]"
                        style={{
                          background: r.status === 'approved' ? 'var(--green-tint)' : r.status === 'changes_requested' ? 'var(--red-tint)' : 'rgba(0,0,0,0.05)',
                          color: r.status === 'approved' ? 'var(--green-text)' : r.status === 'changes_requested' ? 'var(--red-text)' : 'var(--text-tertiary)',
                        }}
                      >
                        {r.status === 'pending' ? 'pending' : r.status === 'approved' ? '✓' : '✗'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {showReviewForm ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={reviewerInput}
                  onChange={(e) => setReviewerInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendReview(e as unknown as React.MouseEvent); }}
                  placeholder="Name or email..."
                  className="flex-1 h-7 px-2 rounded-lg text-xs bg-transparent outline-none"
                  style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                  autoFocus
                />
                <GlassButton size="sm" variant="accent" icon={<Send size={11} />} onClick={handleSendReview}>
                  Send
                </GlassButton>
              </div>
            ) : (
              <GlassButton
                size="sm"
                variant="glass"
                icon={<Users size={12} />}
                onClick={(e) => { e.stopPropagation(); setShowReviewForm(true); }}
              >
                Share for Review
              </GlassButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChangeItemCard({
  item,
  onAccept,
  onReject,
  onHover,
  onLeave,
}: {
  item: ChangeItem;
  onAccept: () => void;
  onReject: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const [showFull, setShowFull] = useState(false);
  const highlightedId = useUIStore((s) => s.highlightedChangeItemId);
  const isHighlighted = highlightedId === item.id;

  const isDone = item.status !== 'pending';

  return (
    <div
      className={cn('px-3 py-2.5 transition-all')}
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: isHighlighted
          ? 'var(--accent-light)'
          : isDone
            ? 'rgba(0,0,0,0.01)'
            : undefined,
        opacity: isDone ? 0.6 : 1,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium"
            style={{
              color:
                item.status === 'accepted'
                  ? 'var(--green-text)'
                  : item.status === 'rejected'
                    ? 'var(--red-text)'
                    : 'var(--text-secondary)',
            }}
          >
            {item.label}
          </span>
          {item.status !== 'pending' && (
            <span
              className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                background:
                  item.status === 'accepted' ? 'var(--green-tint)' : 'var(--red-tint)',
                color: item.status === 'accepted' ? 'var(--green-text)' : 'var(--red-text)',
              }}
            >
              {item.status}
            </span>
          )}
        </div>
        {item.status === 'pending' && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-green-50 transition-colors cursor-pointer"
              style={{ color: 'var(--green-text)' }}
              title="Accept"
            >
              <Check size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors cursor-pointer"
              style={{ color: 'var(--red-text)' }}
              title="Reject"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="rounded-md px-2.5 py-1.5 text-xs leading-relaxed" style={{ background: 'var(--red-tint)', fontFamily: 'var(--font-serif)' }}>
          <span className="diff-delete-inline">
            {showFull ? item.beforeFragment : item.beforeFragment.slice(0, 120)}
            {!showFull && item.beforeFragment.length > 120 ? '…' : ''}
          </span>
        </div>
        <div className="rounded-md px-2.5 py-1.5 text-xs leading-relaxed" style={{ background: 'var(--green-tint)', fontFamily: 'var(--font-serif)' }}>
          <span className="diff-insert-inline">
            {showFull ? item.afterFragment : item.afterFragment.slice(0, 120)}
            {!showFull && item.afterFragment.length > 120 ? '…' : ''}
          </span>
        </div>
      </div>

      {(item.beforeFragment.length > 120 || item.afterFragment.length > 120) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFull(!showFull);
          }}
          className="text-xs mt-1.5 cursor-pointer"
          style={{ color: 'var(--accent)' }}
        >
          {showFull ? 'Show less' : 'Show full change'}
        </button>
      )}
    </div>
  );
}
