'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Search,
  Plus,
  FolderPlus,
  Star,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Sparkles,
  AlertCircle,
  Share2,
  File,
  GripVertical,
} from 'lucide-react';
import { useFileStore } from '@/stores/file-store';
import { useDocumentStore } from '@/stores/document-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import type { FileNode, DocumentStatus } from '@/types';
import { GlassButton } from '@/components/shared/GlassButton';

const DRAG_TYPE_FILE = 'application/x-doc-editor-file';
const DRAG_TYPE_FILE_FOR_CHAT = 'application/x-doc-editor-file-chat';

const statusIcons: Record<DocumentStatus, { icon: typeof FileText; color: string }> = {
  draft: { icon: File, color: 'var(--text-tertiary)' },
  shared: { icon: Share2, color: 'var(--accent)' },
  'ai-generated': { icon: Sparkles, color: '#8b5cf6' },
  'needs-review': { icon: AlertCircle, color: 'var(--yellow-text)' },
};

const filters: { label: string; value: 'all' | DocumentStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Shared', value: 'shared' },
  { label: 'AI', value: 'ai-generated' },
  { label: 'Review', value: 'needs-review' },
];

export function FileExplorer() {
  const files = useFileStore((s) => s.getFilteredTree());
  const expandedFolders = useFileStore((s) => s.expandedFolders);
  const selectedFileId = useFileStore((s) => s.selectedFileId);
  const filter = useFileStore((s) => s.filter);
  const searchQuery = useFileStore((s) => s.searchQuery);
  const setFilter = useFileStore((s) => s.setFilter);
  const setSearchQuery = useFileStore((s) => s.setSearchQuery);
  const selectFile = useFileStore((s) => s.selectFile);
  const toggleFolder = useFileStore((s) => s.toggleFolder);
  const toggleStar = useFileStore((s) => s.toggleStar);
  const moveFile = useFileStore((s) => s.moveFile);
  const createFile = useFileStore((s) => s.createFile);
  const createFolder = useFileStore((s) => s.createFolder);
  const setActiveDocument = useDocumentStore((s) => s.setActiveDocument);
  const createDocument = useDocumentStore((s) => s.createDocument);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropTargetRoot, setDropTargetRoot] = useState(false);

  const rootFolders = files.filter((f) => f.type === 'folder' && f.parentId === null);
  const rootFiles = files.filter((f) => f.type === 'file' && f.parentId === null);

  const handleNewDocument = () => {
    const doc = createDocument('Untitled Document');
    const file = createFile('Untitled Document', null, doc.id);
    selectFile(file.id);
    setActiveDocument(doc.id);
  };

  const handleNewFolder = () => {
    createFolder('New Folder', null);
  };

  const handleFileClick = (file: FileNode) => {
    selectFile(file.id);
    if (file.documentId) {
      setActiveDocument(file.documentId);
    }
  };

  const getChildren = (parentId: string) =>
    files.filter((f) => f.parentId === parentId);

  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_TYPE_FILE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTargetRoot(true);
    }
  }, []);

  const handleRootDragLeave = useCallback(() => {
    setDropTargetRoot(false);
  }, []);

  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTargetRoot(false);
      const fileId = e.dataTransfer.getData(DRAG_TYPE_FILE);
      if (fileId) {
        moveFile(fileId, null);
      }
    },
    [moveFile],
  );

  return (
    <div className="glass h-full flex flex-col" style={{ borderRight: '1px solid var(--border-glass)' }}>
      <div className="p-3 flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          Files
        </span>
        <div className="flex items-center gap-0.5">
          <GlassButton size="sm" icon={<Plus size={14} />} onClick={handleNewDocument} title="New document" />
          <GlassButton size="sm" icon={<FolderPlus size={14} />} onClick={handleNewFolder} title="New folder" />
        </div>
      </div>

      <div className="px-3 pb-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 h-8 px-2.5 rounded-lg text-sm"
          style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)' }}
        >
          <Search size={14} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-tertiary)]"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="px-3 pb-2 flex gap-1 flex-wrap flex-shrink-0">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
              filter === f.value
                ? 'text-white'
                : 'hover:bg-black/[0.04]',
            )}
            style={
              filter === f.value
                ? { background: 'var(--accent)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto px-1.5 pb-3 transition-colors rounded-b-lg',
          dropTargetRoot && 'ring-2 ring-inset',
        )}
        style={dropTargetRoot ? { background: 'var(--accent-light)', ['--tw-ring-color' as string]: 'var(--accent)' } : undefined}
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
      >
        {rootFolders.map((folder) => (
          <DraggableFolderItem
            key={folder.id}
            folder={folder}
            expanded={expandedFolders.has(folder.id)}
            onToggle={() => toggleFolder(folder.id)}
            selectedFileId={selectedFileId}
            onFileClick={handleFileClick}
            onToggleStar={toggleStar}
            getChildren={getChildren}
            dropTargetId={dropTargetId}
            setDropTargetId={setDropTargetId}
            moveFile={moveFile}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
        {rootFiles.map((file) => (
          <DraggableFileItem
            key={file.id}
            file={file}
            selected={selectedFileId === file.id}
            onClick={() => handleFileClick(file)}
            onToggleStar={() => toggleStar(file.id)}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableFolderItem({
  folder,
  expanded,
  onToggle,
  selectedFileId,
  onFileClick,
  onToggleStar,
  getChildren,
  dropTargetId,
  setDropTargetId,
  moveFile,
  expandedFolders,
  toggleFolder,
}: {
  folder: FileNode;
  expanded: boolean;
  onToggle: () => void;
  selectedFileId: string | null;
  onFileClick: (f: FileNode) => void;
  onToggleStar: (id: string) => void;
  getChildren: (parentId: string) => FileNode[];
  dropTargetId: string | null;
  setDropTargetId: (id: string | null) => void;
  moveFile: (fileId: string, newParentId: string | null) => void;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
}) {
  const children = getChildren(folder.id);
  const Chevron = expanded ? ChevronDown : ChevronRight;
  const isDropTarget = dropTargetId === folder.id;
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(DRAG_TYPE_FILE, folder.id);
    e.dataTransfer.setData(DRAG_TYPE_FILE_FOR_CHAT, JSON.stringify({ id: folder.id, name: folder.name, type: 'folder' }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_TYPE_FILE)) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      setDropTargetId(folder.id);
      if (!expanded && !expandTimerRef.current) {
        expandTimerRef.current = setTimeout(() => {
          if (!expandedFolders.has(folder.id)) toggleFolder(folder.id);
          expandTimerRef.current = null;
        }, 600);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDropTargetId(null);
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetId(null);
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    const fileId = e.dataTransfer.getData(DRAG_TYPE_FILE);
    if (fileId && fileId !== folder.id) {
      moveFile(fileId, folder.id);
    }
  };

  return (
    <div>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex items-center gap-1 rounded-lg text-sm transition-all cursor-pointer group',
          isDropTarget
            ? 'ring-2'
            : 'hover:bg-black/[0.04]',
        )}
        style={
          isDropTarget
            ? { background: 'var(--accent-light)', ['--tw-ring-color' as string]: 'var(--accent)' }
            : { color: 'var(--text-secondary)' }
        }
      >
        <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing pl-0.5">
          <GripVertical size={12} />
        </div>
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-1.5 px-1 py-1.5 cursor-pointer min-w-0"
        >
          <Chevron size={14} className="flex-shrink-0 opacity-50" />
          <Folder size={14} className="flex-shrink-0" />
          <span className="truncate flex-1 text-left font-medium" style={{ color: 'var(--text-primary)' }}>
            {folder.name}
          </span>
          <span className="text-xs opacity-0 group-hover:opacity-60 transition-opacity pr-1">
            {children.filter((c) => c.type === 'file').length}
          </span>
        </button>
      </div>
      {expanded && (
        <div className="ml-3">
          {children.map((child) =>
            child.type === 'folder' ? (
              <DraggableFolderItem
                key={child.id}
                folder={child}
                expanded={expandedFolders.has(child.id)}
                onToggle={() => toggleFolder(child.id)}
                selectedFileId={selectedFileId}
                onFileClick={onFileClick}
                onToggleStar={onToggleStar}
                getChildren={getChildren}
                dropTargetId={dropTargetId}
                setDropTargetId={setDropTargetId}
                moveFile={moveFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ) : (
              <DraggableFileItem
                key={child.id}
                file={child}
                selected={selectedFileId === child.id}
                onClick={() => onFileClick(child)}
                onToggleStar={() => onToggleStar(child.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function DraggableFileItem({
  file,
  selected,
  onClick,
  onToggleStar,
}: {
  file: FileNode;
  selected: boolean;
  onClick: () => void;
  onToggleStar: () => void;
}) {
  const statusDef = file.status ? statusIcons[file.status] : null;
  const StatusIcon = statusDef?.icon ?? FileText;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(DRAG_TYPE_FILE, file.id);
    e.dataTransfer.setData(
      DRAG_TYPE_FILE_FOR_CHAT,
      JSON.stringify({ id: file.id, name: file.name, documentId: file.documentId, type: 'file' }),
    );
    e.dataTransfer.effectAllowed = 'copyMove';

    const ghost = document.createElement('div');
    ghost.textContent = file.name;
    ghost.style.cssText =
      'position:fixed;left:-1000px;top:-1000px;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:500;color:var(--accent);background:var(--bg-glass);border:1px solid var(--border-glass);backdrop-filter:blur(8px);white-space:nowrap;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => document.body.removeChild(ghost));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={cn(
        'w-full flex items-center gap-1 rounded-lg text-sm transition-colors cursor-pointer group',
        selected ? '' : 'hover:bg-black/[0.04]',
      )}
      style={
        selected
          ? { background: 'var(--accent-light)', color: 'var(--accent)' }
          : { color: 'var(--text-primary)' }
      }
    >
      <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing pl-0.5">
        <GripVertical size={12} />
      </div>
      <div className="flex-1 flex items-center gap-2 px-1 py-1.5 min-w-0">
        <StatusIcon
          size={14}
          className="flex-shrink-0"
          style={{ color: selected ? 'var(--accent)' : statusDef?.color ?? 'var(--text-tertiary)' }}
        />
        <span className="truncate flex-1 text-left">{file.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
        >
          <Star
            size={12}
            className={cn(file.starred ? 'fill-current' : '')}
            style={{ color: file.starred ? 'var(--yellow-text)' : 'var(--text-tertiary)' }}
          />
        </button>
      </div>
    </div>
  );
}
