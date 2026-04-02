'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { Sparkles, Send, X } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useDocumentStore } from '@/stores/document-store';
import { useChangeStore } from '@/stores/change-store';
import { useChatStore } from '@/stores/chat-store';
import { useAPIKeyStore } from '@/stores/api-key-store';
import { useSubscriptionStore } from '@/stores/subscription-store';

function extractPlainText(content: Record<string, unknown>): string {
  const parts: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;
    if (n.text && typeof n.text === 'string') parts.push(n.text);
    if (Array.isArray(n.content)) for (const child of n.content) walk(child);
  }
  walk(content);
  return parts.join('\n');
}

interface SlashPromptProps {
  editor: Editor;
}

export function SlashPrompt({ editor }: SlashPromptProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const slashPosRef = useRef<number | null>(null);

  const setRightPanelTab = useUIStore((s) => s.setRightPanelTab);
  const selection = useUIStore((s) => s.currentSelection);
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const getActiveDocument = useDocumentStore((s) => s.getActiveDocument);
  const addChangeSet = useChangeStore((s) => s.addChangeSet);
  const setActiveChangeSet = useChangeStore((s) => s.setActiveChangeSet);
  const addMessage = useChatStore((s) => s.addMessage);
  const createThread = useChatStore((s) => s.createThread);
  const getActiveThread = useChatStore((s) => s.getActiveThread);
  const isConfigured = useAPIKeyStore((s) => s.isConfigured);
  const provider = useAPIKeyStore((s) => s.provider);
  const apiKey = useAPIKeyStore((s) => s.apiKey);
  const model = useAPIKeyStore((s) => s.model);
  const setSettingsOpen = useAPIKeyStore((s) => s.setSettingsOpen);
  const isProUser = useSubscriptionStore((s) => s.isProUser);
  const subCustomerId = useSubscriptionStore((s) => s.customerId);
  const aiReady = isProUser || isConfigured;

  const openPrompt = useCallback(() => {
    const { view } = editor;
    const cursorPos = view.state.selection.from;
    slashPosRef.current = cursorPos;

    try {
      const coords = view.coordsAtPos(cursorPos);
      const editorRect = view.dom.closest('.editor-scroll-container')?.getBoundingClientRect()
        ?? view.dom.getBoundingClientRect();

      setPosition({
        top: coords.bottom - editorRect.top + 4,
        left: coords.left - editorRect.left,
      });
    } catch {
      setPosition({ top: 100, left: 72 });
    }

    setOpen(true);
    setPrompt('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [editor]);

  const closePrompt = useCallback((restoreFocus = true) => {
    setOpen(false);
    setPrompt('');
    setSending(false);
    if (restoreFocus) {
      setTimeout(() => editor.commands.focus(), 0);
    }
  }, [editor]);

  const deleteSlashChar = useCallback(() => {
    if (slashPosRef.current !== null) {
      const pos = slashPosRef.current;
      const docSize = editor.state.doc.content.size;
      if (pos >= 1 && pos <= docSize) {
        editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).run();
      }
    }
  }, [editor]);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || !activeDocId) return;
    const text = prompt.trim();

    deleteSlashChar();
    setSending(true);

    setRightPanelTab('chat');

    const thread = getActiveThread() ?? createThread(activeDocId, text.slice(0, 40));
    const threadId = thread.id;
    addMessage(threadId, 'user', text);

    if (!aiReady) {
      addMessage(threadId, 'assistant', 'Please configure an AI provider first.');
      closePrompt();
      if (!isConfigured) setSettingsOpen(true);
      return;
    }

    try {
      const doc = getActiveDocument();
      const documentText = doc ? extractPlainText(doc.editorContent) : '';

      const requestBody = isProUser && subCustomerId
        ? {
            subscription: true,
            customerId: subCustomerId,
            prompt: text,
            documentText,
            selectedText: selection?.text || undefined,
          }
        : {
            provider,
            apiKey,
            model,
            prompt: text,
            documentText,
            selectedText: selection?.text || undefined,
          };

      const res = await fetch('/api/ai/edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const changeSetData = await res.json();
      const cs = addChangeSet({
        documentId: activeDocId,
        baseRevisionId: doc?.currentRevisionId ?? '',
        status: 'proposed',
        prompt: text,
        model: model || '',
        summary: changeSetData.summary || `AI processed: "${text}"`,
        items: (changeSetData.items || []).map((item: Record<string, unknown>) => ({
          ...item,
          changeSetId: changeSetData.id,
        })),
      });
      setActiveChangeSet(cs.id);

      const changeCount = cs.items.length;
      const changeLabels = cs.items.slice(0, 3).map((item) => `• ${item.label}`).join('\n');
      const moreText = changeCount > 3 ? `\n• ...and ${changeCount - 3} more` : '';

      addMessage(
        threadId,
        'assistant',
        `${cs.summary}\n\nI've proposed ${changeCount} change${changeCount !== 1 ? 's' : ''} for your review:\n${changeLabels}${moreText}\n\nYou can review each change individually in the Changes tab.`,
        cs.id,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      addMessage(threadId, 'assistant', `Sorry, I encountered an error: ${message}`);
    }

    closePrompt();
  }, [
    prompt, activeDocId, deleteSlashChar, setRightPanelTab, getActiveThread,
    createThread, addMessage, aiReady, isConfigured, isProUser, subCustomerId,
    provider, apiKey, model, getActiveDocument, selection, addChangeSet,
    setActiveChangeSet, closePrompt, setSettingsOpen,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open) return;

      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.activeElement;
        const isTiptap = el?.closest('.tiptap');
        if (!isTiptap) return;

        const { state } = editor;
        const { from } = state.selection;

        if (from >= 2) {
          const textBefore = state.doc.textBetween(from - 1, from, '');
          if (textBefore === '/') {
            return;
          }
        }

        setTimeout(() => {
          openPrompt();
        }, 10);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, editor, openPrompt]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!prompt.trim()) {
        deleteSlashChar();
        closePrompt();
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      deleteSlashChar();
      closePrompt();
    } else if (e.key === '/' && prompt === '') {
      e.preventDefault();
      closePrompt();
    }
  };

  if (!open) return null;

  return (
    <div
      className="absolute z-50 fade-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div
        className="glass-strong shadow-float rounded-xl overflow-hidden"
        style={{ width: '380px' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
          <Sparkles size={14} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            AI Prompt
          </span>
          <span className="text-[10px] ml-auto" style={{ color: 'var(--text-tertiary)' }}>
            Enter to send · Esc to cancel · / to type slash
          </span>
        </div>
        <div className="flex items-center gap-2 p-2">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="What should AI do here?"
            className="flex-1 bg-transparent outline-none text-sm px-1 py-1"
            style={{ color: 'var(--text-primary)' }}
            disabled={sending}
          />
          {sending ? (
            <div
              className="w-7 h-7 flex items-center justify-center rounded-lg animate-spin"
              style={{ color: 'var(--accent)' }}
            >
              <Sparkles size={14} />
            </div>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-30 hover:bg-black/[0.04]"
                style={{ color: 'var(--accent)' }}
                title="Send"
              >
                <Send size={14} />
              </button>
              <button
                onClick={() => { deleteSlashChar(); closePrompt(); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer hover:bg-black/[0.04]"
                style={{ color: 'var(--text-tertiary)' }}
                title="Cancel"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
        {!aiReady && (
          <div
            className="px-3 py-2 text-xs"
            style={{ borderTop: '1px solid var(--border-glass)', color: 'var(--yellow-text)', background: 'var(--yellow-tint)' }}
          >
            No AI provider configured.{' '}
            <button
              onClick={() => { closePrompt(false); setSettingsOpen(true); }}
              className="underline cursor-pointer font-medium"
            >
              Set up now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
