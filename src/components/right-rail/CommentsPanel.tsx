'use client';

import { useState } from 'react';
import { MessageSquareText, Check, CheckCircle2, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useCommentStore } from '@/stores/comment-store';
import { useDocumentStore } from '@/stores/document-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { RelativeTime } from '@/components/shared/RelativeTime';
import { getInitials, cn } from '@/lib/utils';
import type { Comment } from '@/types';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#14b8a6', '#06b6d4', '#3b82f6', '#84cc16', '#a855f7',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function CommentsPanel() {
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const comments = useCommentStore((s) =>
    s.comments.filter((c) => c.documentId === activeDocId),
  );

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  if (comments.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            <MessageSquareText size={20} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No comments yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Select text in the editor and click &ldquo;Comment&rdquo; to start a thread
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-glass)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {unresolvedCount} open comment{unresolvedCount !== 1 ? 's' : ''}
          {comments.length !== unresolvedCount && (
            <span className="ml-1 opacity-60">
              · {comments.length - unresolvedCount} resolved
            </span>
          )}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const addReply = useCommentStore((s) => s.addReply);
  const resolveComment = useCommentStore((s) => s.resolveComment);
  const unresolveComment = useCommentStore((s) => s.unresolveComment);
  const deleteComment = useCommentStore((s) => s.deleteComment);

  const handleSendReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    addReply(comment.id, trimmed, 'You');
    setReplyText('');
    setRepliesOpen(true);
  };

  return (
    <div
      className={cn('rounded-xl overflow-hidden transition-all')}
      style={{
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-paper)',
        boxShadow: 'var(--shadow-glass)',
        opacity: comment.resolved ? 0.6 : 1,
      }}
    >
      {/* Header */}
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: avatarColor(comment.author) }}
          >
            {getInitials(comment.author)}
          </div>
          <span className="text-xs font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
            {comment.author}
          </span>
          {comment.resolved && (
            <CheckCircle2 size={14} style={{ color: 'var(--green-text)' }} />
          )}
          <RelativeTime
            date={comment.createdAt}
            className="text-[10px]"
            style={{ color: 'var(--text-tertiary)' }}
          />
        </div>

        {/* Quoted text */}
        {comment.selectedText && (
          <div
            className="rounded-md px-2.5 py-1.5 text-xs leading-relaxed mb-2"
            style={{
              background: 'rgba(0,0,0,0.03)',
              borderLeft: '2px solid var(--accent)',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-serif)',
            }}
          >
            &ldquo;{comment.selectedText.length > 140
              ? comment.selectedText.slice(0, 140) + '…'
              : comment.selectedText}&rdquo;
          </div>
        )}

        {/* Comment body */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {comment.body}
        </p>
      </div>

      {/* Replies toggle */}
      {comment.replies.length > 0 && (
        <button
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-black/[0.02]"
          style={{ color: 'var(--accent)', borderBottom: repliesOpen ? '1px solid var(--border-subtle)' : undefined }}
          onClick={() => setRepliesOpen(!repliesOpen)}
        >
          {repliesOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
        </button>
      )}

      {/* Replies list */}
      {repliesOpen && comment.replies.map((reply) => (
        <div
          key={reply.id}
          className="px-3 py-2"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ background: avatarColor(reply.author) }}
            >
              {getInitials(reply.author)}
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {reply.author}
            </span>
            <RelativeTime
              date={reply.createdAt}
              className="text-[10px]"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
          <p className="text-xs leading-relaxed pl-7" style={{ color: 'var(--text-secondary)' }}>
            {reply.body}
          </p>
        </div>
      ))}

      {/* Reply input + actions */}
      <div className="px-3 py-2 flex items-center gap-1.5">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(); }}
          placeholder="Reply…"
          className="flex-1 text-xs rounded-md px-2.5 py-1.5 outline-none"
          style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
          }}
        />
        <GlassButton
          size="sm"
          icon={<Send size={12} />}
          onClick={handleSendReply}
          disabled={!replyText.trim()}
        />
        <GlassButton
          size="sm"
          icon={comment.resolved ? <CheckCircle2 size={12} /> : <Check size={12} />}
          onClick={() => comment.resolved ? unresolveComment(comment.id) : resolveComment(comment.id)}
          title={comment.resolved ? 'Unresolve' : 'Resolve'}
        />
        <GlassButton
          size="sm"
          icon={<Trash2 size={12} />}
          onClick={() => deleteComment(comment.id)}
          title="Delete"
        />
      </div>
    </div>
  );
}
