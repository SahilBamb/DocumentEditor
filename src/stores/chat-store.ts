import { create } from 'zustand';
import type { AIThread, AIMessage, AIMessageRole } from '@/types';
import { sampleThreads } from '@/lib/sample-data';
import { generateId } from '@/lib/utils';

interface ChatState {
  threads: AIThread[];
  activeThreadId: string | null;

  setActiveThread: (id: string | null) => void;
  getActiveThread: () => AIThread | undefined;
  getDocumentThreads: (documentId: string) => AIThread[];
  createThread: (documentId: string, title: string) => AIThread;
  addMessage: (threadId: string, role: AIMessageRole, body: string, linkedChangeSetId?: string) => AIMessage;
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: sampleThreads,
  activeThreadId: sampleThreads[0]?.id ?? null,

  setActiveThread: (id) => set({ activeThreadId: id }),

  getActiveThread: () => {
    const { threads, activeThreadId } = get();
    return threads.find((t) => t.id === activeThreadId);
  },

  getDocumentThreads: (documentId) =>
    get().threads.filter((t) => t.documentId === documentId),

  createThread: (documentId, title) => {
    const thread: AIThread = {
      id: generateId(),
      documentId,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      threads: [...state.threads, thread],
      activeThreadId: thread.id,
    }));
    return thread;
  },

  addMessage: (threadId, role, body, linkedChangeSetId) => {
    const msg: AIMessage = {
      id: generateId(),
      threadId,
      role,
      body,
      linkedChangeSetId,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, msg] } : t,
      ),
    }));
    return msg;
  },
}));
