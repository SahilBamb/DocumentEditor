export type DocumentStatus = 'draft' | 'shared' | 'ai-generated' | 'needs-review';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  workspaceId: string;
  documentId?: string;
  children?: FileNode[];
  starred: boolean;
  status?: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  workspaceId: string;
  title: string;
  currentRevisionId: string | null;
  editorContent: Record<string, unknown>;
  originalFileId?: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  parentRevisionId: string | null;
  createdByType: 'user' | 'ai' | 'system';
  createdById: string;
  summary: string;
  snapshotJson: Record<string, unknown>;
  statsAdded: number;
  statsRemoved: number;
  createdAt: string;
}

export type ChangeSetStatus =
  | 'drafting'
  | 'proposed'
  | 'partially_approved'
  | 'approved'
  | 'rejected'
  | 'superseded';

export interface ChangeSet {
  id: string;
  documentId: string;
  baseRevisionId: string;
  status: ChangeSetStatus;
  prompt: string;
  model: string;
  summary: string;
  items: ChangeItem[];
  createdAt: string;
}

export type ChangeType = 'insert' | 'delete' | 'replace' | 'format';
export type ChangeItemStatus = 'pending' | 'accepted' | 'rejected';

export interface ChangeItem {
  id: string;
  changeSetId: string;
  anchorPath: string;
  beforeFragment: string;
  afterFragment: string;
  changeType: ChangeType;
  status: ChangeItemStatus;
  label: string;
  orderIndex: number;
}

export interface AIThread {
  id: string;
  documentId: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
}

export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  threadId: string;
  role: AIMessageRole;
  body: string;
  linkedChangeSetId?: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  documentId: string;
  actorType: 'user' | 'ai' | 'system';
  actorId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export type RightPanelTab = 'chat' | 'changes' | 'history' | 'comments';

export interface SelectionRange {
  from: number;
  to: number;
  text: string;
}

export interface ReviewRequest {
  id: string;
  changeSetId: string;
  requestedBy: string;
  reviewers: string[];
  status: 'pending' | 'approved' | 'changes_requested';
  createdAt: string;
}

export type AIEditMode = 'rewrite' | 'insert' | 'format' | 'ask' | 'expand' | 'shorten';

export interface Comment {
  id: string;
  documentId: string;
  selectedText: string;
  anchorFrom: number;
  anchorTo: number;
  body: string;
  author: string;
  authorAvatar?: string;
  replies: CommentReply[];
  resolved: boolean;
  createdAt: string;
}

export interface CommentReply {
  id: string;
  commentId: string;
  body: string;
  author: string;
  createdAt: string;
}
