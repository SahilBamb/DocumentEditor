'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  FileText,
  FolderPlus,
  Sparkles,
  History,
  Download,
  Upload,
  Type,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Table,
  Image,
  Link,
  Quote,
  Eye,
  PanelLeft,
  PanelRight,
  Undo2,
  Redo2,
  Replace,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useDocumentStore } from '@/stores/document-store';
import { useFileStore } from '@/stores/file-store';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof FileText;
  category: string;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setRightPanelTab = useUIStore((s) => s.setRightPanelTab);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const setSearchReplaceOpen = useUIStore((s) => s.setSearchReplaceOpen);
  const createDocument = useDocumentStore((s) => s.createDocument);
  const setActiveDocument = useDocumentStore((s) => s.setActiveDocument);
  const createFile = useFileStore((s) => s.createFile);
  const selectFile = useFileStore((s) => s.selectFile);
  const documents = useDocumentStore((s) => s.documents);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = () => setCommandPaletteOpen(false);

  const commands: CommandItem[] = [
    {
      id: 'new-doc',
      label: 'New Document',
      icon: FileText,
      category: 'File',
      action: () => {
        const doc = createDocument('Untitled Document');
        const file = createFile('Untitled Document', null, doc.id);
        selectFile(file.id);
        setActiveDocument(doc.id);
        close();
      },
      shortcut: '⌘N',
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: FolderPlus,
      category: 'File',
      action: () => close(),
    },
    {
      id: 'import',
      label: 'Import Document',
      description: 'DOCX, HTML, TXT, MD',
      icon: Upload,
      category: 'File',
      action: () => close(),
    },
    {
      id: 'export',
      label: 'Export as DOCX',
      icon: Download,
      category: 'File',
      action: () => close(),
    },
    ...documents.map((doc) => ({
      id: `open-${doc.id}`,
      label: doc.title,
      description: 'Open document',
      icon: FileText,
      category: 'Documents',
      action: () => {
        setActiveDocument(doc.id);
        close();
      },
    })),
    {
      id: 'ai-chat',
      label: 'AI Chat',
      description: 'Ask AI to edit your document',
      icon: Sparkles,
      category: 'AI',
      action: () => {
        setRightPanelTab('chat');
        close();
      },
      shortcut: '⌘J',
    },
    {
      id: 'ai-rewrite',
      label: 'AI Rewrite Selection',
      icon: Sparkles,
      category: 'AI',
      action: () => {
        setRightPanelTab('chat');
        close();
      },
    },
    {
      id: 'view-changes',
      label: 'View Pending Changes',
      icon: Eye,
      category: 'Review',
      action: () => {
        setRightPanelTab('changes');
        close();
      },
    },
    {
      id: 'view-history',
      label: 'Revision History',
      icon: History,
      category: 'Review',
      action: () => {
        setRightPanelTab('history');
        close();
      },
    },
    {
      id: 'search-replace',
      label: 'Search & Replace',
      icon: Replace,
      category: 'Edit',
      action: () => {
        setSearchReplaceOpen(true);
        close();
      },
      shortcut: '⌘⇧H',
    },
    {
      id: 'toggle-left',
      label: 'Toggle File Explorer',
      icon: PanelLeft,
      category: 'View',
      action: () => {
        toggleLeftPanel();
        close();
      },
    },
    {
      id: 'toggle-right',
      label: 'Toggle Side Panel',
      icon: PanelRight,
      category: 'View',
      action: () => {
        toggleRightPanel();
        close();
      },
    },
    { id: 'h1', label: 'Heading 1', icon: Heading1, category: 'Format', action: () => close() },
    { id: 'h2', label: 'Heading 2', icon: Heading2, category: 'Format', action: () => close() },
    { id: 'bold', label: 'Bold', icon: Bold, category: 'Format', action: () => close(), shortcut: '⌘B' },
    { id: 'italic', label: 'Italic', icon: Italic, category: 'Format', action: () => close(), shortcut: '⌘I' },
    { id: 'bullet', label: 'Bullet List', icon: List, category: 'Format', action: () => close() },
    { id: 'numbered', label: 'Numbered List', icon: ListOrdered, category: 'Format', action: () => close() },
    { id: 'table', label: 'Insert Table', icon: Table, category: 'Format', action: () => close() },
    { id: 'image', label: 'Insert Image', icon: Image, category: 'Format', action: () => close() },
    { id: 'link', label: 'Insert Link', icon: Link, category: 'Format', action: () => close() },
    { id: 'blockquote', label: 'Block Quote', icon: Quote, category: 'Format', action: () => close() },
  ];

  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  const categories = [...new Set(filtered.map((c) => c.category))];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex]);

  let globalIdx = -1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={close}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-[560px] max-h-[60vh] glass-strong shadow-float rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 h-12" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-tertiary)' }}
          >
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="overflow-y-auto p-2 max-h-[calc(60vh-48px)]">
          {categories.map((cat) => (
            <div key={cat}>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {cat}
              </p>
              {filtered
                .filter((c) => c.category === cat)
                .map((cmd) => {
                  globalIdx++;
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                      )}
                      style={{
                        background: isSelected ? 'var(--accent-light)' : undefined,
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                    >
                      <cmd.icon size={15} className="flex-shrink-0 opacity-60" />
                      <span className="flex-1 text-left">{cmd.label}</span>
                      {cmd.description && (
                        <span className="text-xs opacity-50">{cmd.description}</span>
                      )}
                      {cmd.shortcut && (
                        <kbd
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-tertiary)' }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No commands found
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
