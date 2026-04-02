'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Loader2, ArrowRight, ExternalLink, Key, AlertCircle, FileText, X, Type, CheckCheck, XCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import { useChangeStore } from '@/stores/change-store';
import { useDocumentStore } from '@/stores/document-store';
import { useUIStore, type ChatAttachment } from '@/stores/ui-store';
import { useAPIKeyStore } from '@/stores/api-key-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { VoiceInput } from '@/components/shared/VoiceInput';
import { cn } from '@/lib/utils';
import { RelativeTime } from '@/components/shared/RelativeTime';
import type { AIMessage } from '@/types';

const DRAG_TYPE_FILE_FOR_CHAT = 'application/x-doc-editor-file-chat';
const DRAG_TYPE_EDITOR_TEXT = 'application/x-doc-editor-text';

const quickPrompts = [
  'Rewrite to sound more executive',
  'Expand into 5 bullet points',
  'Shorten by 30%',
  'Turn into a proposal',
  'Insert a comparison table',
  'Draft a conclusion',
];

function extractPlainText(content: Record<string, unknown>): string {
  const parts: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;
    if (n.text && typeof n.text === 'string') {
      parts.push(n.text);
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child);
    }
  }
  walk(content);
  return parts.join('\n');
}

export function ChatPanel() {
  const activeThread = useChatStore((s) => s.getActiveThread());
  const addMessage = useChatStore((s) => s.addMessage);
  const createThread = useChatStore((s) => s.createThread);
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const getActiveDocument = useDocumentStore((s) => s.getActiveDocument);
  const documents = useDocumentStore((s) => s.documents);
  const setRightPanelTab = useUIStore((s) => s.setRightPanelTab);
  const selection = useUIStore((s) => s.currentSelection);
  const allChangeSets = useChangeStore((s) => s.changeSets);
  const addChangeSet = useChangeStore((s) => s.addChangeSet);
  const setActiveChangeSet = useChangeStore((s) => s.setActiveChangeSet);
  const acceptAllForDocument = useChangeStore((s) => s.acceptAllForDocument);
  const rejectAllForDocument = useChangeStore((s) => s.rejectAllForDocument);
  const chatAttachments = useUIStore((s) => s.chatAttachments);
  const addChatAttachment = useUIStore((s) => s.addChatAttachment);
  const removeChatAttachment = useUIStore((s) => s.removeChatAttachment);
  const clearChatAttachments = useUIStore((s) => s.clearChatAttachments);

  const isConfigured = useAPIKeyStore((s) => s.isConfigured);
  const provider = useAPIKeyStore((s) => s.provider);
  const apiKey = useAPIKeyStore((s) => s.apiKey);
  const model = useAPIKeyStore((s) => s.model);
  const setSettingsOpen = useAPIKeyStore((s) => s.setSettingsOpen);

  const isProUser = useSubscriptionStore((s) => s.isProUser);
  const customerId = useSubscriptionStore((s) => s.customerId);
  const setPricingOpen = useSubscriptionStore((s) => s.setPricingOpen);

  const aiReady = isProUser || isConfigured;

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const messages = activeThread?.messages ?? [];

  const pendingCount = allChangeSets
    .filter((cs) => cs.documentId === activeDocId && cs.status === 'proposed')
    .flatMap((cs) => cs.items)
    .filter((item) => item.status === 'pending').length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    const types = e.dataTransfer.types;
    if (types.includes(DRAG_TYPE_FILE_FOR_CHAT) || types.includes(DRAG_TYPE_EDITOR_TEXT) || types.includes('text/plain')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      dragCounterRef.current = 0;

      const fileData = e.dataTransfer.getData(DRAG_TYPE_FILE_FOR_CHAT);
      if (fileData) {
        try {
          const parsed = JSON.parse(fileData);
          if (parsed.documentId) {
            const doc = documents.find((d) => d.id === parsed.documentId);
            const docText = doc ? extractPlainText(doc.editorContent) : '';
            addChatAttachment({
              type: 'file',
              id: `file-${parsed.id}`,
              label: parsed.name,
              content: docText,
            });
          } else {
            addChatAttachment({
              type: 'file',
              id: `folder-${parsed.id}`,
              label: `📁 ${parsed.name}`,
              content: '',
            });
          }
          useUIStore.getState().setRightPanelTab('chat');
          inputRef.current?.focus();
          return;
        } catch {}
      }

      const editorText = e.dataTransfer.getData(DRAG_TYPE_EDITOR_TEXT);
      if (editorText) {
        addChatAttachment({
          type: 'text',
          id: `text-${Date.now()}`,
          label: `"${editorText.slice(0, 40)}${editorText.length > 40 ? '…' : ''}"`,
          content: editorText,
        });
        inputRef.current?.focus();
        return;
      }

      const plainText = e.dataTransfer.getData('text/plain');
      if (plainText && plainText.trim()) {
        addChatAttachment({
          type: 'text',
          id: `text-${Date.now()}`,
          label: `"${plainText.slice(0, 40)}${plainText.length > 40 ? '…' : ''}"`,
          content: plainText,
        });
        inputRef.current?.focus();
      }
    },
    [documents, addChatAttachment],
  );

  const handleSend = async () => {
    if ((!input.trim() && chatAttachments.length === 0) || !activeDocId) return;
    const prompt = input.trim();
    setInput('');
    setError(null);

    const attachmentContext = chatAttachments
      .map((a) => {
        if (a.type === 'file' && a.content) {
          return `[Referenced file: ${a.label}]\n${a.content}`;
        }
        if (a.type === 'text') {
          return `[Referenced text]\n${a.content}`;
        }
        return `[Referenced: ${a.label}]`;
      })
      .join('\n\n');

    const fullPrompt = attachmentContext
      ? `${attachmentContext}\n\n${prompt}`
      : prompt;

    const displayMessage = chatAttachments.length > 0
      ? `${chatAttachments.map((a) => `📎 ${a.label}`).join('\n')}\n\n${prompt}`
      : prompt;

    clearChatAttachments();

    let threadId = activeThread?.id;
    if (!threadId) {
      const thread = createThread(activeDocId, prompt.slice(0, 40) || 'Chat');
      threadId = thread.id;
    }

    addMessage(threadId, 'user', displayMessage);
    setIsGenerating(true);

    if (!aiReady) {
      addMessage(
        threadId,
        'assistant',
        'Please configure an AI provider first. Click the key icon in the toolbar or the button below to set up your API key.',
      );
      setIsGenerating(false);
      return;
    }

    try {
      const doc = getActiveDocument();
      const documentText = doc ? extractPlainText(doc.editorContent) : '';

      const requestBody = isProUser && customerId
        ? {
            subscription: true,
            customerId,
            prompt: fullPrompt,
            documentText,
            selectedText: selection?.text || undefined,
          }
        : {
            provider,
            apiKey,
            model,
            prompt: fullPrompt,
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
        prompt: fullPrompt,
        model: model || '',
        summary: changeSetData.summary || `AI processed: "${prompt}"`,
        items: (changeSetData.items || []).map((item: Record<string, unknown>) => ({
          ...item,
          changeSetId: changeSetData.id,
        })),
      });

      setActiveChangeSet(cs.id);

      const changeCount = cs.items.length;
      const changeLabels = cs.items
        .slice(0, 3)
        .map((item) => `• ${item.label}`)
        .join('\n');
      const moreText = changeCount > 3 ? `\n• ...and ${changeCount - 3} more` : '';

      addMessage(
        threadId,
        'assistant',
        `${cs.summary}\n\nI've proposed ${changeCount} change${changeCount !== 1 ? 's' : ''} for your review:\n${changeLabels}${moreText}\n\nYou can review each change individually in the Changes tab.`,
        cs.id,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      addMessage(
        threadId,
        'assistant',
        `Sorry, I encountered an error: ${message}\n\nPlease check your API key and try again.`,
      );
    }

    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      ref={dropZoneRef}
      className="h-full flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center fade-in"
          style={{ background: 'rgba(79, 70, 229, 0.06)', border: '2px dashed var(--accent)', borderRadius: '12px' }}
        >
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2"
              style={{ background: 'var(--accent-light)' }}
            >
              <Sparkles size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              Drop to add context
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              Files or selected text
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4 pt-8">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--accent-light)' }}
              >
                <Sparkles size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                AI Assistant
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {selection
                  ? `Working with selected text (${selection.text.length} chars)`
                  : 'Ask me to edit, rewrite, or improve your document'}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Drag files or text here to add context
              </p>
            </div>

            {!aiReady && (
              <div className="space-y-2">
                <button
                  onClick={() => setPricingOpen(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-black/[0.03] cursor-pointer fade-in"
                  style={{
                    border: '1px solid rgba(99,102,241,0.2)',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04))',
                    color: '#8b5cf6',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
                  >
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold">Upgrade to Pro</p>
                    <p className="text-[11px] opacity-70">
                      Get unlimited AI edits — no API key needed
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-black/[0.03] cursor-pointer fade-in"
                  style={{
                    border: '1px dashed var(--accent)',
                    color: 'var(--accent)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-light)' }}
                  >
                    <Key size={15} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold">Set up API provider</p>
                    <p className="text-[11px] opacity-70">
                      Bring your own key from OpenAI, Anthropic, Google, Mistral, or Groq
                    </p>
                  </div>
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-xs font-medium px-1" style={{ color: 'var(--text-tertiary)' }}>
                Quick actions
              </p>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:bg-black/[0.03] flex items-center justify-between group cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>{prompt}</span>
                  <ArrowRight
                    size={12}
                    className="opacity-0 group-hover:opacity-60 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onViewChanges={() => setRightPanelTab('changes')}
          />
        ))}

        {isGenerating && (
          <div className="flex items-start gap-2.5 fade-in">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-light)' }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 pt-1">
              <div className="shimmer h-4 rounded w-3/4 mb-2" />
              <div className="shimmer h-4 rounded w-1/2" />
            </div>
          </div>
        )}

        {pendingCount > 0 && messages.length > 0 && (
          <div
            className="rounded-xl p-3 fade-in"
            style={{
              background: 'rgba(0,0,0,0.02)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={13} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {pendingCount} pending change{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => activeDocId && acceptAllForDocument(activeDocId)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer hover:shadow-sm"
                style={{
                  background: 'var(--green-tint)',
                  color: 'var(--green-text)',
                  border: '1px solid var(--green-border)',
                }}
              >
                <CheckCheck size={13} />
                Accept all
              </button>
              <button
                onClick={() => activeDocId && rejectAllForDocument(activeDocId)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer hover:shadow-sm"
                style={{
                  background: 'var(--red-tint)',
                  color: 'var(--red-text)',
                  border: '1px solid var(--red-border)',
                }}
              >
                <XCircle size={13} />
                Reject all
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-glass)' }}>
        {error && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg mb-2 text-xs fade-in"
            style={{ background: 'var(--red-tint)', color: 'var(--red-text)' }}
          >
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div
          className="rounded-xl overflow-hidden transition-all"
          style={{
            background: 'rgba(0,0,0,0.03)',
            border: isDragOver ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
          }}
        >
          {selection && (
            <div
              className="px-3 py-1.5 text-xs flex items-center gap-1.5"
              style={{
                borderBottom: '1px solid var(--border-glass)',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
              }}
            >
              <span className="font-medium">Selection:</span>
              <span className="truncate opacity-80">
                &ldquo;{selection.text.slice(0, 60)}{selection.text.length > 60 ? '…' : ''}&rdquo;
              </span>
            </div>
          )}

          {chatAttachments.length > 0 && (
            <div
              className="px-2 py-1.5 flex flex-wrap gap-1.5"
              style={{ borderBottom: '1px solid var(--border-glass)' }}
            >
              {chatAttachments.map((att) => (
                <AttachmentChip key={att.id} attachment={att} onRemove={() => removeChatAttachment(att.id)} />
              ))}
            </div>
          )}

          <div className="flex items-end gap-1.5 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                chatAttachments.length > 0
                  ? 'What should I do with this context?'
                  : aiReady
                    ? 'Ask AI to edit your document...'
                    : 'Configure AI provider to start...'
              }
              className="flex-1 resize-none outline-none text-sm min-h-[36px] max-h-[120px] bg-transparent py-1 px-1"
              style={{ color: 'var(--text-primary)' }}
              rows={1}
            />
            <VoiceInput
              onTranscript={(text) => {
                setInput((prev) => (prev ? `${prev} ${text}` : text));
                inputRef.current?.focus();
              }}
            />
            <GlassButton
              size="sm"
              variant="accent"
              icon={isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              onClick={handleSend}
              disabled={(!input.trim() && chatAttachments.length === 0) || isGenerating}
            />
          </div>
        </div>
        {aiReady && (
          <div className="flex items-center justify-between mt-1.5 px-1">
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {isProUser
                ? <span>Using <span className="font-medium" style={{ color: '#8b5cf6' }}>Pro</span> · GPT-4o</span>
                : <span>Using <span className="font-medium">{provider}</span> · {model}</span>
              }
            </p>
            <button
              onClick={() => isProUser ? setPricingOpen(true) : setSettingsOpen(true)}
              className="text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent)' }}
            >
              {isProUser ? 'Manage' : 'Change'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentChip({ attachment, onRemove }: { attachment: ChatAttachment; onRemove: () => void }) {
  const Icon = attachment.type === 'file' ? FileText : Type;

  return (
    <div
      className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg text-xs font-medium fade-in"
      style={{
        background: attachment.type === 'file' ? 'var(--accent-light)' : 'var(--green-tint)',
        color: attachment.type === 'file' ? 'var(--accent)' : 'var(--green-text)',
      }}
    >
      <Icon size={11} className="flex-shrink-0" />
      <span className="truncate max-w-[140px]">{attachment.label}</span>
      <button
        onClick={onRemove}
        className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/[0.06] transition-colors cursor-pointer flex-shrink-0"
      >
        <X size={10} />
      </button>
    </div>
  );
}

function ChatMessage({
  message,
  onViewChanges,
}: {
  message: AIMessage;
  onViewChanges: () => void;
}) {
  const isUser = message.role === 'user';
  const setSettingsOpen = useAPIKeyStore((s) => s.setSettingsOpen);
  const needsConfig =
    !isUser && message.body.toLowerCase().includes('configure an ai provider');

  return (
    <div className={cn('flex items-start gap-2.5 fade-in', isUser && 'flex-row-reverse')}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold"
        style={
          isUser
            ? { background: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)' }
            : { background: 'var(--accent-light)', color: 'var(--accent)' }
        }
      >
        {isUser ? 'Y' : <Sparkles size={14} />}
      </div>
      <div className={cn('flex-1 min-w-0', isUser && 'text-right')}>
        <div
          className={cn(
            'inline-block rounded-xl px-3 py-2 text-sm leading-relaxed max-w-full',
            isUser ? 'rounded-tr-sm' : 'rounded-tl-sm',
          )}
          style={
            isUser
              ? { background: 'var(--accent)', color: 'white' }
              : { background: 'rgba(0,0,0,0.03)', color: 'var(--text-primary)' }
          }
        >
          <div className="whitespace-pre-wrap text-left">{message.body}</div>
          {needsConfig && (
            <button
              onClick={() => setSettingsOpen(true)}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:shadow-sm"
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
              }}
            >
              <Key size={12} />
              Set up API key
            </button>
          )}
        </div>
        {message.linkedChangeSetId && (
          <button
            onClick={onViewChanges}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--accent)' }}
          >
            <ExternalLink size={11} />
            View proposed changes
          </button>
        )}
        <RelativeTime
          date={message.createdAt}
          className="text-xs mt-1 opacity-50 block"
          style={{ color: 'var(--text-tertiary)' }}
        />
      </div>
    </div>
  );
}
