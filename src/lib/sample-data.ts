import { generateId } from './utils';
import type {
  FileNode,
  Document,
  DocumentRevision,
  ChangeSet,
  AIThread,
  ActivityEvent,
} from '@/types';

const now = new Date().toISOString();
const hourAgo = new Date(Date.now() - 3600000).toISOString();
const dayAgo = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
const weekAgo = new Date(Date.now() - 604800000).toISOString();

const docIds = {
  proposal: generateId(),
  quarterly: generateId(),
  productBrief: generateId(),
  blogDraft: generateId(),
  meetingNotes: generateId(),
};

const revIds = {
  proposalRev1: generateId(),
  proposalRev2: generateId(),
  quarterlyRev1: generateId(),
};

export const sampleDocuments: Document[] = [
  {
    id: docIds.proposal,
    workspaceId: 'ws-1',
    title: 'Q2 Growth Strategy Proposal',
    currentRevisionId: revIds.proposalRev2,
    editorContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Q2 Growth Strategy Proposal' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This document outlines our strategic priorities for Q2 2026, focusing on three key growth vectors: product-led acquisition, enterprise expansion, and international market entry.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Executive Summary' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'After a strong Q1 with 34% revenue growth, we are well-positioned to accelerate. Our core metrics show improving unit economics, rising NPS scores, and a growing pipeline of enterprise prospects. However, we face increasing competition in the mid-market segment and need to move decisively on pricing and packaging.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Product-Led Acquisition' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'We will launch a revamped free tier with generous usage limits to drive top-of-funnel growth. The key changes include: extending the trial period from 14 to 30 days, adding collaborative features to the free plan, and implementing usage-based upgrade prompts that feel helpful rather than pushy.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Enterprise Expansion' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Our enterprise pipeline has grown 2.5x quarter-over-quarter. To capitalize on this momentum, we will hire three additional enterprise account executives, build out SSO and SCIM provisioning by end of April, and launch a dedicated enterprise onboarding program with white-glove migration support.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. International Markets' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'We have identified Western Europe as our primary international growth target. Germany, the UK, and France represent 65% of our international inbound interest. We will localize the product into German and French, establish a London-based sales hub, and partner with two EU-based system integrators.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Budget and Timeline' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The total incremental investment for Q2 is $2.4M, broken down as follows: $800K for product and engineering (free tier + enterprise features), $1.1M for sales hiring and enablement, and $500K for international expansion. We expect these investments to generate $4.2M in incremental ARR by end of Q3.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Risks and Mitigations' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The primary risks are: (1) Free tier cannibalization of paid plans — mitigated by careful feature gating and usage analytics, (2) Enterprise sales cycle length — mitigated by parallel pipeline development and POC standardization, (3) International regulatory complexity — mitigated by engaging local legal counsel and data residency planning.',
            },
          ],
        },
      ],
    },
    createdAt: weekAgo,
    updatedAt: hourAgo,
    wordCount: 312,
  },
  {
    id: docIds.quarterly,
    workspaceId: 'ws-1',
    title: 'Q1 2026 Quarterly Review',
    currentRevisionId: revIds.quarterlyRev1,
    editorContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Q1 2026 Quarterly Review' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Q1 was a milestone quarter for the company. We exceeded our revenue target by 12%, signed our largest enterprise deal to date, and shipped the new collaboration engine on schedule.',
            },
          ],
        },
      ],
    },
    createdAt: twoDaysAgo,
    updatedAt: dayAgo,
    wordCount: 48,
  },
  {
    id: docIds.productBrief,
    workspaceId: 'ws-1',
    title: 'AI Editor Product Brief',
    currentRevisionId: null,
    editorContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'AI Editor Product Brief' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This brief outlines the vision, target users, and core differentiators for our AI-native document editor. The goal is to build a product that feels like Cursor for writing — where AI proposes changes and the user retains full control through an intuitive review workflow.',
            },
          ],
        },
      ],
    },
    createdAt: dayAgo,
    updatedAt: dayAgo,
    wordCount: 52,
  },
  {
    id: docIds.blogDraft,
    workspaceId: 'ws-1',
    title: 'Blog: The Future of AI Writing Tools',
    currentRevisionId: null,
    editorContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'The Future of AI Writing Tools' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Most AI writing tools today have a fundamental UX problem: they treat the document as a black box that the AI can freely mutate. This destroys trust and makes the writing experience feel chaotic rather than collaborative.',
            },
          ],
        },
      ],
    },
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    wordCount: 42,
  },
  {
    id: docIds.meetingNotes,
    workspaceId: 'ws-1',
    title: 'Team Standup Notes — March 31',
    currentRevisionId: null,
    editorContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Team Standup Notes — March 31' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Attendees: Alice, Bob, Carol, Dave' }],
        },
      ],
    },
    createdAt: dayAgo,
    updatedAt: dayAgo,
    wordCount: 12,
  },
];

export const sampleFileTree: FileNode[] = [
  {
    id: 'folder-1',
    name: 'Strategy',
    type: 'folder',
    parentId: null,
    workspaceId: 'ws-1',
    starred: false,
    createdAt: weekAgo,
    updatedAt: weekAgo,
  },
  {
    id: 'file-1',
    name: 'Q2 Growth Strategy Proposal',
    type: 'file',
    parentId: 'folder-1',
    workspaceId: 'ws-1',
    documentId: docIds.proposal,
    starred: true,
    status: 'needs-review',
    createdAt: weekAgo,
    updatedAt: hourAgo,
  },
  {
    id: 'file-2',
    name: 'Q1 2026 Quarterly Review',
    type: 'file',
    parentId: 'folder-1',
    workspaceId: 'ws-1',
    documentId: docIds.quarterly,
    starred: false,
    status: 'shared',
    createdAt: twoDaysAgo,
    updatedAt: dayAgo,
  },
  {
    id: 'folder-2',
    name: 'Product',
    type: 'folder',
    parentId: null,
    workspaceId: 'ws-1',
    starred: false,
    createdAt: dayAgo,
    updatedAt: dayAgo,
  },
  {
    id: 'file-3',
    name: 'AI Editor Product Brief',
    type: 'file',
    parentId: 'folder-2',
    workspaceId: 'ws-1',
    documentId: docIds.productBrief,
    starred: true,
    status: 'draft',
    createdAt: dayAgo,
    updatedAt: dayAgo,
  },
  {
    id: 'folder-3',
    name: 'Content',
    type: 'folder',
    parentId: null,
    workspaceId: 'ws-1',
    starred: false,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: 'file-4',
    name: 'Blog: The Future of AI Writing Tools',
    type: 'file',
    parentId: 'folder-3',
    workspaceId: 'ws-1',
    documentId: docIds.blogDraft,
    starred: false,
    status: 'ai-generated',
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: 'file-5',
    name: 'Team Standup Notes — March 31',
    type: 'file',
    parentId: null,
    workspaceId: 'ws-1',
    documentId: docIds.meetingNotes,
    starred: false,
    status: 'draft',
    createdAt: dayAgo,
    updatedAt: dayAgo,
  },
];

export const sampleRevisions: DocumentRevision[] = [
  {
    id: revIds.proposalRev1,
    documentId: docIds.proposal,
    parentRevisionId: null,
    createdByType: 'user',
    createdById: 'user-1',
    summary: 'Initial draft',
    snapshotJson: {},
    statsAdded: 245,
    statsRemoved: 0,
    createdAt: weekAgo,
  },
  {
    id: revIds.proposalRev2,
    documentId: docIds.proposal,
    parentRevisionId: revIds.proposalRev1,
    createdByType: 'ai',
    createdById: 'ai-1',
    summary: 'AI rewrote executive summary and tightened budget section',
    snapshotJson: {},
    statsAdded: 124,
    statsRemoved: 38,
    createdAt: hourAgo,
  },
  {
    id: revIds.quarterlyRev1,
    documentId: docIds.quarterly,
    parentRevisionId: null,
    createdByType: 'user',
    createdById: 'user-1',
    summary: 'First draft of quarterly review',
    snapshotJson: {},
    statsAdded: 48,
    statsRemoved: 0,
    createdAt: twoDaysAgo,
  },
];

export const sampleChangeSets: ChangeSet[] = [
  {
    id: 'cs-1',
    documentId: docIds.proposal,
    baseRevisionId: revIds.proposalRev2,
    status: 'proposed',
    prompt: 'Make the executive summary more persuasive and concise',
    model: 'gpt-4o',
    summary: 'Rewrote executive summary for impact and brevity',
    items: [
      {
        id: 'ci-1',
        changeSetId: 'cs-1',
        anchorPath: 'content[1]',
        beforeFragment:
          'This document outlines our strategic priorities for Q2 2026, focusing on three key growth vectors: product-led acquisition, enterprise expansion, and international market entry.',
        afterFragment:
          'After delivering 34% revenue growth in Q1, we are doubling down on three strategic bets for Q2: product-led acquisition to dominate the self-serve funnel, enterprise expansion to capture six-figure accounts, and international entry to unlock the European market.',
        changeType: 'replace',
        status: 'pending',
        label: 'Rewrote intro for impact',
        orderIndex: 0,
      },
      {
        id: 'ci-2',
        changeSetId: 'cs-1',
        anchorPath: 'content[3]',
        beforeFragment:
          'After a strong Q1 with 34% revenue growth, we are well-positioned to accelerate. Our core metrics show improving unit economics, rising NPS scores, and a growing pipeline of enterprise prospects. However, we face increasing competition in the mid-market segment and need to move decisively on pricing and packaging.',
        afterFragment:
          'Q1 proved our model works: 34% revenue growth, record NPS, and a 2.5x increase in enterprise pipeline. The window to lead is now. Mid-market competition is intensifying, and the companies that move first on pricing, packaging, and international presence will define the category for the next three years.',
        changeType: 'replace',
        status: 'pending',
        label: 'Sharpened executive summary',
        orderIndex: 1,
      },
      {
        id: 'ci-3',
        changeSetId: 'cs-1',
        anchorPath: 'content[9]',
        beforeFragment:
          'The total incremental investment for Q2 is $2.4M, broken down as follows: $800K for product and engineering (free tier + enterprise features), $1.1M for sales hiring and enablement, and $500K for international expansion. We expect these investments to generate $4.2M in incremental ARR by end of Q3.',
        afterFragment:
          'Total Q2 investment: $2.4M. Expected return: $4.2M in incremental ARR by end of Q3 — a 1.75x payback ratio within two quarters. Allocation: $800K product & engineering, $1.1M sales, $500K international.',
        changeType: 'replace',
        status: 'pending',
        label: 'Made budget section punchier',
        orderIndex: 2,
      },
    ],
    createdAt: now,
  },
];

export const sampleThreads: AIThread[] = [
  {
    id: 'thread-1',
    documentId: docIds.proposal,
    title: 'Editing Q2 Proposal',
    messages: [
      {
        id: 'msg-1',
        threadId: 'thread-1',
        role: 'user',
        body: 'Make the executive summary more persuasive and concise',
        createdAt: now,
      },
      {
        id: 'msg-2',
        threadId: 'thread-1',
        role: 'assistant',
        body: "I've analyzed the executive summary and identified 3 areas to strengthen. Here's what I'm proposing:\n\n1. **Rewrite the opening** to lead with your strongest metric (34% growth)\n2. **Sharpen the exec summary** to create urgency around market timing\n3. **Tighten the budget section** to lead with ROI instead of cost\n\nI've created 3 changes for your review. You can accept or reject each individually.",
        linkedChangeSetId: 'cs-1',
        createdAt: now,
      },
    ],
    createdAt: now,
  },
];

export const sampleActivity: ActivityEvent[] = [
  {
    id: 'evt-1',
    documentId: docIds.proposal,
    actorType: 'user',
    actorId: 'user-1',
    eventType: 'document_created',
    payload: {},
    createdAt: weekAgo,
  },
  {
    id: 'evt-2',
    documentId: docIds.proposal,
    actorType: 'user',
    actorId: 'user-1',
    eventType: 'revision_created',
    payload: { summary: 'Initial draft' },
    createdAt: weekAgo,
  },
  {
    id: 'evt-3',
    documentId: docIds.proposal,
    actorType: 'ai',
    actorId: 'ai-1',
    eventType: 'ai_edit_requested',
    payload: { prompt: 'Make the executive summary more persuasive and concise' },
    createdAt: hourAgo,
  },
  {
    id: 'evt-4',
    documentId: docIds.proposal,
    actorType: 'ai',
    actorId: 'ai-1',
    eventType: 'change_set_proposed',
    payload: { changeSetId: 'cs-1', itemCount: 3 },
    createdAt: hourAgo,
  },
];
