'use client';

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Link,
  Image,
  Table,
  Undo2,
  Redo2,
  Search,
  FileDown,
  FileUp,
  Sparkles,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Highlighter,
  Command,
  Key,
  Mic,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useDocumentStore } from '@/stores/document-store';
import { useAPIKeyStore } from '@/stores/api-key-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { VoiceInput } from '@/components/shared/VoiceInput';
import { DocxImportButton } from '@/components/shared/DocxImportButton';
import { exportToDocx } from '@/lib/docx-utils';
import { useChatStore } from '@/stores/chat-store';
import { useChangeStore } from '@/stores/change-store';
import { PresenceAvatars } from '@/components/shared/PresenceAvatars';
import { cn } from '@/lib/utils';

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

function Divider() {
  return <div className="w-px h-5 mx-1 hidden md:block" style={{ background: 'var(--border-glass)' }} />;
}

export function Toolbar() {
  const leftPanelOpen = useUIStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setRightPanelTab = useUIStore((s) => s.setRightPanelTab);
  const selection = useUIStore((s) => s.currentSelection);
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const getActiveDocument = useDocumentStore((s) => s.getActiveDocument);
  const isAIConfigured = useAPIKeyStore((s) => s.isConfigured);
  const setSettingsOpen = useAPIKeyStore((s) => s.setSettingsOpen);
  const provider = useAPIKeyStore((s) => s.provider);
  const apiKey = useAPIKeyStore((s) => s.apiKey);
  const model = useAPIKeyStore((s) => s.model);
  const addMessage = useChatStore((s) => s.addMessage);
  const createThread = useChatStore((s) => s.createThread);
  const getActiveThread = useChatStore((s) => s.getActiveThread);
  const addChangeSet = useChangeStore((s) => s.addChangeSet);
  const setActiveChangeSet = useChangeStore((s) => s.setActiveChangeSet);
  const isProUser = useSubscriptionStore((s) => s.isProUser);
  const customerId = useSubscriptionStore((s) => s.customerId);

  const aiReady = isProUser || isAIConfigured;

  const handleVoiceTranscript = async (text: string) => {
    if (!text.trim() || !activeDocId) return;

    setRightPanelTab('chat');

    const thread = getActiveThread() ?? createThread(activeDocId, text.slice(0, 40));
    const threadId = thread.id;
    addMessage(threadId, 'user', `🎙️ ${text}`);

    if (!aiReady) {
      addMessage(threadId, 'assistant', 'Please configure an AI provider first.');
      if (!isAIConfigured) setSettingsOpen(true);
      return;
    }

    try {
      const docData = getActiveDocument();
      const documentText = docData ? extractPlainText(docData.editorContent) : '';

      const requestBody = isProUser && customerId
        ? {
            subscription: true,
            customerId,
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
        baseRevisionId: docData?.currentRevisionId ?? '',
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
  };

  return (
    <div
      className="glass-strong flex items-center gap-1 px-2 md:px-3 flex-shrink-0 overflow-x-auto"
      style={{
        height: 'var(--toolbar-height)',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      <GlassButton
        size="sm"
        icon={leftPanelOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        onClick={toggleLeftPanel}
        title="Toggle file explorer"
      />

      <Divider />

      {/* Undo/Redo — always visible */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<Undo2 size={15} />} label="Undo" shortcut="⌘Z" />
        <ToolbarButton icon={<Redo2 size={15} />} label="Redo" shortcut="⌘⇧Z" />
      </div>

      <Divider />

      {/* Headings — hidden on mobile */}
      <div className="hidden md:flex items-center gap-0.5">
        <ToolbarButton icon={<Heading1 size={15} />} label="Heading 1" />
        <ToolbarButton icon={<Heading2 size={15} />} label="Heading 2" />
        <ToolbarButton icon={<Heading3 size={15} />} label="Heading 3" />
        <ToolbarButton icon={<Type size={15} />} label="Paragraph" />
      </div>

      <div className="hidden md:block"><Divider /></div>

      {/* Text formatting — show B/I/U on mobile, rest hidden */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<Bold size={15} />} label="Bold" shortcut="⌘B" />
        <ToolbarButton icon={<Italic size={15} />} label="Italic" shortcut="⌘I" />
        <ToolbarButton icon={<Underline size={15} />} label="Underline" shortcut="⌘U" className="hidden md:flex" />
        <ToolbarButton icon={<Strikethrough size={15} />} label="Strikethrough" className="hidden md:flex" />
      </div>

      {/* Everything below — hidden on mobile */}
      <div className="hidden md:block"><Divider /></div>

      <div className="hidden md:flex items-center gap-0.5">
        <ToolbarButton icon={<Palette size={14} />} label="Text color" />
        <ToolbarButton icon={<Highlighter size={14} />} label="Highlight" />
      </div>

      <div className="hidden md:block"><Divider /></div>

      <div className="hidden md:flex items-center gap-0.5">
        <ToolbarButton icon={<AlignLeft size={15} />} label="Align left" />
        <ToolbarButton icon={<AlignCenter size={15} />} label="Align center" />
        <ToolbarButton icon={<AlignRight size={15} />} label="Align right" />
        <ToolbarButton icon={<AlignJustify size={15} />} label="Justify" />
      </div>

      <div className="hidden md:block"><Divider /></div>

      <div className="hidden md:flex items-center gap-0.5">
        <ToolbarButton icon={<List size={15} />} label="Bullet list" />
        <ToolbarButton icon={<ListOrdered size={15} />} label="Numbered list" />
        <ToolbarButton icon={<CheckSquare size={15} />} label="Checklist" />
        <ToolbarButton icon={<Quote size={15} />} label="Block quote" />
      </div>

      <div className="hidden md:block"><Divider /></div>

      <div className="hidden md:flex items-center gap-0.5">
        <ToolbarButton icon={<Link size={15} />} label="Link" />
        <ToolbarButton icon={<Image size={15} />} label="Image" />
        <ToolbarButton icon={<Table size={15} />} label="Table" />
        <ToolbarButton icon={<Minus size={15} />} label="Page break" />
      </div>

      <div className="flex-1 min-w-2" />

      {doc && (
        <span className="text-xs truncate max-w-[200px] mr-2 hidden md:inline" style={{ color: 'var(--text-tertiary)' }}>
          {doc.title}
        </span>
      )}

      <div className="hidden md:flex items-center mr-1">
        <PresenceAvatars />
      </div>

      <GlassButton
        size="sm"
        icon={<Search size={14} />}
        onClick={() => useUIStore.getState().setSearchReplaceOpen(true)}
        title="Search & Replace"
        className="hidden md:flex"
      />

      <DocxImportButton
        onImport={(html) => {
          window.dispatchEvent(new CustomEvent('docx-import', { detail: html }));
        }}
      />

      <GlassButton
        size="sm"
        icon={<FileUp size={14} />}
        onClick={() => {
          const d = getActiveDocument();
          if (d) exportToDocx(d.title, d.editorContent);
        }}
        title="Export DOCX"
        className="hidden md:flex"
      />

      {/* Voice input — visible everywhere, especially useful on mobile */}
      <VoiceInput onTranscript={handleVoiceTranscript} />

      <GlassButton
        size="sm"
        variant="glass"
        icon={<Sparkles size={14} />}
        onClick={() => {
          if (aiReady) {
            setRightPanelTab('chat');
          } else {
            setSettingsOpen(true);
          }
        }}
        title={aiReady ? 'AI Assistant' : 'Configure AI to get started'}
        style={{ color: 'var(--accent)' } as React.CSSProperties}
      />

      <GlassButton
        size="sm"
        icon={<Key size={14} />}
        onClick={() => setSettingsOpen(true)}
        title="AI provider settings"
        className="hidden md:flex"
        style={aiReady ? { color: 'var(--green-text)' } as React.CSSProperties : undefined}
      />

      <GlassButton
        size="sm"
        icon={<Command size={14} />}
        onClick={() => setCommandPaletteOpen(true)}
        title="Command palette (⌘K)"
        className="hidden md:flex"
      />

      <Divider />

      <GlassButton
        size="sm"
        icon={rightPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        onClick={toggleRightPanel}
        title="Toggle side panel"
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  active,
  shortcut,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  shortcut?: string;
  className?: string;
}) {
  return (
    <button
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded-md transition-colors cursor-pointer',
        active
          ? ''
          : 'hover:bg-black/[0.04] active:bg-black/[0.07]',
        className,
      )}
      style={
        active
          ? { background: 'var(--accent-light)', color: 'var(--accent)' }
          : { color: 'var(--text-secondary)' }
      }
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
    </button>
  );
}
