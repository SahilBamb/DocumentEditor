import { create } from 'zustand';
import type { Comment, CommentReply } from '@/types';
import { generateId } from '@/lib/utils';

interface CommentState {
  comments: Comment[];

  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'replies' | 'resolved'>) => Comment;
  addReply: (commentId: string, body: string, author: string) => CommentReply;
  resolveComment: (commentId: string) => void;
  unresolveComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  getDocumentComments: (documentId: string) => Comment[];
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],

  addComment: (partial) => {
    const comment: Comment = {
      ...partial,
      id: generateId(),
      replies: [],
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ comments: [...state.comments, comment] }));
    return comment;
  },

  addReply: (commentId, body, author) => {
    const reply: CommentReply = {
      id: generateId(),
      commentId,
      body,
      author,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c,
      ),
    }));
    return reply;
  },

  resolveComment: (commentId) =>
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId ? { ...c, resolved: true } : c,
      ),
    })),

  unresolveComment: (commentId) =>
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId ? { ...c, resolved: false } : c,
      ),
    })),

  deleteComment: (commentId) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId),
    })),

  getDocumentComments: (documentId) =>
    get().comments.filter((c) => c.documentId === documentId),
}));
