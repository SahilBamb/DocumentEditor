import { create } from 'zustand';
import type { FileNode, DocumentStatus } from '@/types';
import { sampleFileTree } from '@/lib/sample-data';
import { generateId } from '@/lib/utils';

type FilterType = 'all' | DocumentStatus;

interface FileState {
  files: FileNode[];
  expandedFolders: Set<string>;
  selectedFileId: string | null;
  filter: FilterType;
  searchQuery: string;

  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  selectFile: (id: string | null) => void;
  toggleFolder: (id: string) => void;
  toggleStar: (id: string) => void;
  createFile: (name: string, parentId: string | null, documentId: string) => FileNode;
  createFolder: (name: string, parentId: string | null) => FileNode;
  renameFile: (id: string, name: string) => void;
  deleteFile: (id: string) => void;
  moveFile: (fileId: string, newParentId: string | null) => void;
  getFilteredTree: () => FileNode[];
  getFileById: (id: string) => FileNode | undefined;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: sampleFileTree,
  expandedFolders: new Set(['folder-1', 'folder-2', 'folder-3']),
  selectedFileId: 'file-1',
  filter: 'all',
  searchQuery: '',

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectFile: (id) => set({ selectedFileId: id }),

  toggleFolder: (id) =>
    set((state) => {
      const next = new Set(state.expandedFolders);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedFolders: next };
    }),

  toggleStar: (id) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f)),
    })),

  createFile: (name, parentId, documentId) => {
    const file: FileNode = {
      id: generateId(),
      name,
      type: 'file',
      parentId,
      workspaceId: 'ws-1',
      documentId,
      starred: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ files: [...state.files, file] }));
    return file;
  },

  createFolder: (name, parentId) => {
    const folder: FileNode = {
      id: generateId(),
      name,
      type: 'folder',
      parentId,
      workspaceId: 'ws-1',
      starred: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      files: [...state.files, folder],
      expandedFolders: new Set([...state.expandedFolders, folder.id]),
    }));
    return folder;
  },

  renameFile: (id, name) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, name } : f)),
    })),

  deleteFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id && f.parentId !== id),
    })),

  moveFile: (fileId, newParentId) => {
    const { files } = get();
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    if (file.id === newParentId) return;
    // Prevent moving a folder into its own descendant
    if (file.type === 'folder' && newParentId) {
      let current = newParentId;
      while (current) {
        if (current === fileId) return;
        const parent = files.find((f) => f.id === current);
        current = parent?.parentId ?? '';
      }
    }
    set((state) => ({
      files: state.files.map((f) =>
        f.id === fileId ? { ...f, parentId: newParentId } : f,
      ),
      expandedFolders: newParentId
        ? new Set([...state.expandedFolders, newParentId])
        : state.expandedFolders,
    }));
  },

  getFileById: (id) => get().files.find((f) => f.id === id),

  getFilteredTree: () => {
    const { files, filter, searchQuery } = get();
    let filtered = files;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) => f.type === 'folder' || f.name.toLowerCase().includes(q),
      );
    }

    if (filter !== 'all') {
      if (filter === 'needs-review' || filter === 'draft' || filter === 'shared' || filter === 'ai-generated') {
        const matchingFiles = filtered.filter((f) => f.type === 'file' && f.status === filter);
        const parentIds = new Set(matchingFiles.map((f) => f.parentId));
        filtered = filtered.filter(
          (f) => (f.type === 'file' && f.status === filter) || (f.type === 'folder' && parentIds.has(f.id)),
        );
      }
    }

    return filtered;
  },
}));
