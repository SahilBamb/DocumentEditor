import { create } from 'zustand';
import type { Document, DocumentRevision, ActivityEvent } from '@/types';
import { sampleDocuments, sampleRevisions, sampleActivity } from '@/lib/sample-data';
import { generateId } from '@/lib/utils';

interface DocumentState {
  documents: Document[];
  activeDocumentId: string | null;
  revisions: DocumentRevision[];
  activityEvents: ActivityEvent[];

  setActiveDocument: (id: string | null) => void;
  getActiveDocument: () => Document | undefined;
  updateDocumentContent: (id: string, content: Record<string, unknown>) => void;
  updateDocumentTitle: (id: string, title: string) => void;
  createDocument: (title: string, content?: Record<string, unknown>) => Document;
  createRevision: (
    documentId: string,
    summary: string,
    snapshotJson: Record<string, unknown>,
    createdByType: 'user' | 'ai' | 'system',
    statsAdded?: number,
    statsRemoved?: number,
  ) => DocumentRevision;
  restoreRevision: (revisionId: string) => void;
  getDocumentRevisions: (documentId: string) => DocumentRevision[];
  getDocumentActivity: (documentId: string) => ActivityEvent[];
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'createdAt'>) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: sampleDocuments,
  activeDocumentId: sampleDocuments[0]?.id ?? null,
  revisions: sampleRevisions,
  activityEvents: sampleActivity,

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  getActiveDocument: () => {
    const { documents, activeDocumentId } = get();
    return documents.find((d) => d.id === activeDocumentId);
  },

  updateDocumentContent: (id, content) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, editorContent: content, updatedAt: new Date().toISOString() } : d,
      ),
    })),

  updateDocumentTitle: (id, title) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, title, updatedAt: new Date().toISOString() } : d,
      ),
    })),

  createDocument: (title, content) => {
    const doc: Document = {
      id: generateId(),
      workspaceId: 'ws-1',
      title,
      currentRevisionId: null,
      editorContent: content ?? {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: title }],
          },
          { type: 'paragraph', content: [{ type: 'text', text: '' }] },
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0,
    };
    set((state) => ({ documents: [...state.documents, doc] }));
    return doc;
  },

  createRevision: (documentId, summary, snapshotJson, createdByType, statsAdded = 0, statsRemoved = 0) => {
    const doc = get().documents.find((d) => d.id === documentId);
    const rev: DocumentRevision = {
      id: generateId(),
      documentId,
      parentRevisionId: doc?.currentRevisionId ?? null,
      createdByType,
      createdById: createdByType === 'ai' ? 'ai-1' : 'user-1',
      summary,
      snapshotJson,
      statsAdded,
      statsRemoved,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      revisions: [...state.revisions, rev],
      documents: state.documents.map((d) =>
        d.id === documentId ? { ...d, currentRevisionId: rev.id } : d,
      ),
    }));
    return rev;
  },

  restoreRevision: (revisionId) => {
    const revision = get().revisions.find((r) => r.id === revisionId);
    if (!revision) return;

    const newRev: DocumentRevision = {
      id: generateId(),
      documentId: revision.documentId,
      parentRevisionId: revisionId,
      createdByType: 'system',
      createdById: 'system',
      summary: `Restored from: ${revision.summary}`,
      snapshotJson: revision.snapshotJson,
      statsAdded: 0,
      statsRemoved: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      revisions: [...state.revisions, newRev],
      documents: state.documents.map((d) =>
        d.id === revision.documentId ? { ...d, currentRevisionId: newRev.id } : d,
      ),
    }));
  },

  getDocumentRevisions: (documentId) =>
    get().revisions.filter((r) => r.documentId === documentId),

  getDocumentActivity: (documentId) =>
    get().activityEvents.filter((e) => e.documentId === documentId),

  addActivityEvent: (event) =>
    set((state) => ({
      activityEvents: [
        ...state.activityEvents,
        { ...event, id: generateId(), createdAt: new Date().toISOString() },
      ],
    })),
}));
