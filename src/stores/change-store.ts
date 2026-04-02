import { create } from 'zustand';
import type { ChangeSet, ChangeItemStatus } from '@/types';
import { sampleChangeSets } from '@/lib/sample-data';
import { generateId } from '@/lib/utils';

interface ChangeState {
  changeSets: ChangeSet[];
  activeChangeSetId: string | null;

  setActiveChangeSet: (id: string | null) => void;
  getActiveChangeSet: () => ChangeSet | undefined;
  getDocumentChangeSets: (documentId: string) => ChangeSet[];
  updateItemStatus: (changeSetId: string, itemId: string, status: ChangeItemStatus) => void;
  acceptAll: (changeSetId: string) => void;
  rejectAll: (changeSetId: string) => void;
  acceptAllForDocument: (documentId: string) => void;
  rejectAllForDocument: (documentId: string) => void;
  addChangeSet: (changeSet: Omit<ChangeSet, 'id' | 'createdAt'>) => ChangeSet;
}

function deriveSetStatus(items: { status: ChangeItemStatus }[]): ChangeSet['status'] {
  const allAccepted = items.every((i) => i.status === 'accepted');
  const allRejected = items.every((i) => i.status === 'rejected');
  const anyAccepted = items.some((i) => i.status === 'accepted');
  const anyRejected = items.some((i) => i.status === 'rejected');

  if (allAccepted) return 'approved';
  if (allRejected) return 'rejected';
  if (anyAccepted || anyRejected) return 'partially_approved';
  return 'proposed';
}

export const useChangeStore = create<ChangeState>((set, get) => ({
  changeSets: sampleChangeSets,
  activeChangeSetId: sampleChangeSets[0]?.id ?? null,

  setActiveChangeSet: (id) => set({ activeChangeSetId: id }),

  getActiveChangeSet: () => {
    const { changeSets, activeChangeSetId } = get();
    return changeSets.find((cs) => cs.id === activeChangeSetId);
  },

  getDocumentChangeSets: (documentId) =>
    get().changeSets.filter((cs) => cs.documentId === documentId),

  updateItemStatus: (changeSetId, itemId, status) =>
    set((state) => ({
      changeSets: state.changeSets.map((cs) => {
        if (cs.id !== changeSetId) return cs;
        const items = cs.items.map((item) =>
          item.id === itemId ? { ...item, status } : item,
        );
        return { ...cs, items, status: deriveSetStatus(items) };
      }),
    })),

  acceptAll: (changeSetId) =>
    set((state) => ({
      changeSets: state.changeSets.map((cs) => {
        if (cs.id !== changeSetId) return cs;
        const items = cs.items.map((item) => ({ ...item, status: 'accepted' as const }));
        return { ...cs, items, status: 'approved' };
      }),
    })),

  rejectAll: (changeSetId) =>
    set((state) => ({
      changeSets: state.changeSets.map((cs) => {
        if (cs.id !== changeSetId) return cs;
        const items = cs.items.map((item) => ({ ...item, status: 'rejected' as const }));
        return { ...cs, items, status: 'rejected' };
      }),
    })),

  acceptAllForDocument: (documentId) =>
    set((state) => ({
      changeSets: state.changeSets.map((cs) => {
        if (cs.documentId !== documentId || cs.status !== 'proposed') return cs;
        const items = cs.items.map((item) =>
          item.status === 'pending' ? { ...item, status: 'accepted' as const } : item,
        );
        return { ...cs, items, status: deriveSetStatus(items) };
      }),
    })),

  rejectAllForDocument: (documentId) =>
    set((state) => ({
      changeSets: state.changeSets.map((cs) => {
        if (cs.documentId !== documentId || cs.status !== 'proposed') return cs;
        const items = cs.items.map((item) =>
          item.status === 'pending' ? { ...item, status: 'rejected' as const } : item,
        );
        return { ...cs, items, status: deriveSetStatus(items) };
      }),
    })),

  addChangeSet: (csData) => {
    const id = generateId();
    const cs: ChangeSet = {
      ...csData,
      id,
      createdAt: new Date().toISOString(),
      items: csData.items.map((item) => ({ ...item, changeSetId: id })),
    };
    set((state) => ({ changeSets: [...state.changeSets, cs] }));
    return cs;
  },
}));
