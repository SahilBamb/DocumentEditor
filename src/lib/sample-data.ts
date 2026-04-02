import { generateId } from './utils';
import type {
  FileNode,
  Document,
  DocumentRevision,
  ChangeSet,
  AIThread,
  ActivityEvent,
} from '@/types';

const welcomeDocId = generateId();

export const sampleDocuments: Document[] = [
  {
    id: welcomeDocId,
    workspaceId: 'ws-1',
    title: 'Untitled Document',
    currentRevisionId: null,
    editorContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Untitled Document' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 0,
  },
];

export const sampleFileTree: FileNode[] = [
  {
    id: 'file-welcome',
    name: 'Untitled Document',
    type: 'file',
    parentId: null,
    workspaceId: 'ws-1',
    documentId: welcomeDocId,
    starred: false,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const sampleRevisions: DocumentRevision[] = [];

export const sampleChangeSets: ChangeSet[] = [];

export const sampleThreads: AIThread[] = [];

export const sampleActivity: ActivityEvent[] = [];
