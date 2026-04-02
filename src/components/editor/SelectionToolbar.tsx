'use client';

import { useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Sparkles,
  Scissors,
  Expand,
  FileText,
  ListChecks,
  PenLine,
  MessageSquare,
  MessageSquareText,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCommentStore } from '@/stores/comment-store';
import { useDocumentStore } from '@/stores/document-store';
import { cn } from '@/lib/utils';

const aiActions = [
  { icon: PenLine, label: 'Rewrite', mode: 'rewrite' },
  { icon: Scissors, label: 'Shorten', mode: 'shorten' },
  { icon: Expand, label: 'Expand', mode: 'expand' },
  { icon: FileText, label: 'Reformat', mode: 'format' },
  { icon: ListChecks, label: 'To bullets', mode: 'insert' },
  { icon: MessageSquare, label: 'Ask AI...', mode: 'ask' },
] as const;

export function SelectionToolbar({ editor }: { editor: Editor }) {
  const selection = useUIStore((s) => s.currentSelection);
  const setRightPanelTab = useUIStore((s) => s.setRightPanelTab);
  const addComment = useCommentStore((s) => s.addComment);
  const activeDocumentId = useDocumentStore((s) => s.activeDocumentId);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selection || !editor) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const { view } = editor;
      const start = view.coordsAtPos(selection.from);
      const end = view.coordsAtPos(selection.to);
      const editorRect = view.dom.getBoundingClientRect();

      setPosition({
        top: start.top - editorRect.top - 48,
        left: (start.left + end.left) / 2 - editorRect.left,
      });
    };

    updatePosition();
  }, [selection, editor]);

  if (!selection || !position) return null;

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 fade-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
      }}
    >
      <div className="glass-strong shadow-float rounded-xl px-1.5 py-1 flex items-center gap-0.5">
        {aiActions.map((action) => (
          <button
            key={action.mode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/[0.04] cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setRightPanelTab('chat')}
            title={action.label}
          >
            <action.icon size={13} style={{ color: 'var(--accent)' }} />
            <span>{action.label}</span>
          </button>
        ))}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-black/[0.04] cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => {
            if (!selection || !activeDocumentId) return;
            addComment({
              documentId: activeDocumentId,
              selectedText: selection.text,
              anchorFrom: selection.from,
              anchorTo: selection.to,
              body: '',
              author: 'You',
            });
            setRightPanelTab('comments');
          }}
          title="Comment"
        >
          <MessageSquareText size={13} style={{ color: 'var(--accent)' }} />
          <span>Comment</span>
        </button>
      </div>
    </div>
  );
}
