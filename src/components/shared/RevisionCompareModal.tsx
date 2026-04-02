'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown, GitCompareArrows, Plus, Minus } from 'lucide-react';
import { useDocumentStore } from '@/stores/document-store';
import { useUIStore } from '@/stores/ui-store';
import { computeTextDiff, extractPlainText } from '@/lib/diff-utils';
import { cn } from '@/lib/utils';
import type { DocumentRevision } from '@/types';

export function RevisionCompareModal() {
  const setCompareModalOpen = useUIStore((s) => s.setCompareModalOpen);
  const initialLeftId = useUIStore((s) => s.compareInitialLeftId);
  const initialRightId = useUIStore((s) => s.compareInitialRightId);
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const allRevisions = useDocumentStore((s) => s.revisions);
  const activeDoc = useDocumentStore((s) => s.getActiveDocument());

  const revisions = useMemo(
    () =>
      allRevisions
        .filter((r) => r.documentId === (activeDocId ?? ''))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [allRevisions, activeDocId],
  );

  const [leftId, setLeftId] = useState<string>(initialLeftId ?? revisions[0]?.id ?? '');
  const [rightId, setRightId] = useState<string>(
    initialRightId ?? (revisions.length > 1 ? revisions[revisions.length - 1]?.id : revisions[0]?.id) ?? '',
  );

  const leftRevision = revisions.find((r) => r.id === leftId);
  const rightRevision = revisions.find((r) => r.id === rightId);

  const leftText = useMemo(() => {
    if (!leftRevision) return '';
    const text = extractPlainText(leftRevision.snapshotJson);
    if (text) return text;
    return activeDoc ? extractPlainText(activeDoc.editorContent) : '';
  }, [leftRevision, activeDoc]);

  const rightText = useMemo(() => {
    if (!rightRevision) return '';
    const text = extractPlainText(rightRevision.snapshotJson);
    if (text) return text;
    return activeDoc ? extractPlainText(activeDoc.editorContent) : '';
  }, [rightRevision, activeDoc]);

  const leftIsEmpty = leftRevision && Object.keys(leftRevision.snapshotJson).length === 0;
  const rightIsEmpty = rightRevision && Object.keys(rightRevision.snapshotJson).length === 0;

  const diff = useMemo(() => computeTextDiff(leftText, rightText), [leftText, rightText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const seg of diff) {
      const wordCount = seg.text.trim().split(/\s+/).filter(Boolean).length;
      if (seg.type === 'insert') added += wordCount;
      if (seg.type === 'delete') removed += wordCount;
    }
    return { added, removed };
  }, [diff]);

  const onClose = () => setCompareModalOpen(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-4 z-50 flex flex-col rounded-2xl overflow-hidden shadow-float"
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-light)' }}
            >
              <GitCompareArrows size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Compare Revisions
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Side-by-side diff of document revisions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.05] transition-colors cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Selectors */}
        <div
          className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.015)' }}
        >
          <RevisionSelector
            label="Older"
            revisions={revisions}
            value={leftId}
            onChange={setLeftId}
          />
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            <GitCompareArrows size={14} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <RevisionSelector
            label="Newer"
            revisions={revisions}
            value={rightId}
            onChange={setRightId}
          />
        </div>

        {/* Stats bar */}
        <div
          className="flex items-center gap-4 px-6 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--green-text)' }}>
            <Plus size={11} />
            {stats.added} word{stats.added !== 1 ? 's' : ''} added
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--red-text)' }}>
            <Minus size={11} />
            {stats.removed} word{stats.removed !== 1 ? 's' : ''} removed
          </span>
        </div>

        {/* Side-by-side panels */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--border-glass)' }}>
            <div
              className="px-4 py-2 flex-shrink-0 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {leftRevision?.summary ?? 'Select revision'}
              </span>
              {leftIsEmpty && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  Current version
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <DiffView segments={diff} side="left" />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="px-4 py-2 flex-shrink-0 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {rightRevision?.summary ?? 'Select revision'}
              </span>
              {rightIsEmpty && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  Current version
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <DiffView segments={diff} side="right" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function DiffView({ segments, side }: { segments: ReturnType<typeof computeTextDiff>; side: 'left' | 'right' }) {
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
      {segments.map((seg, i) => {
        if (seg.type === 'equal') {
          return <span key={i}>{seg.text}</span>;
        }
        if (seg.type === 'delete' && side === 'left') {
          return (
            <span
              key={i}
              className="rounded px-0.5"
              style={{ background: 'var(--red-bg, rgba(239,68,68,0.12))', color: 'var(--red-text)' }}
            >
              {seg.text}
            </span>
          );
        }
        if (seg.type === 'insert' && side === 'right') {
          return (
            <span
              key={i}
              className="rounded px-0.5"
              style={{ background: 'var(--green-bg, rgba(34,197,94,0.12))', color: 'var(--green-text)' }}
            >
              {seg.text}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}

function RevisionSelector({
  label,
  revisions,
  value,
  onChange,
}: {
  label: string;
  revisions: DocumentRevision[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = revisions.find((r) => r.id === value);

  return (
    <div className="flex-1 relative">
      <span className="text-[10px] font-medium uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </span>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between h-9 px-3 rounded-xl text-sm transition-colors cursor-pointer',
        )}
        style={{
          background: 'rgba(0,0,0,0.03)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-primary)',
        }}
      >
        <span className="truncate text-xs">
          {selected?.summary ?? 'Select...'}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} className="flex-shrink-0 ml-2" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl py-1 overflow-hidden shadow-float max-h-60 overflow-y-auto glass-strong"
          >
            {revisions.map((rev) => (
              <button
                key={rev.id}
                onClick={() => {
                  onChange(rev.id);
                  setOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer',
                  'hover:bg-black/[0.04]',
                )}
                style={{
                  color: rev.id === value ? 'var(--accent)' : 'var(--text-primary)',
                }}
              >
                <span className="font-medium">{rev.summary}</span>
                <span className="block text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {rev.createdByType} · {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
