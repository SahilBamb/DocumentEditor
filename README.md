# DocumentEditor — AI-Native Writing

**Cursor for documents, not Word with AI.**

A beautiful, AI-native document editor where AI proposes edits and you retain full control through an intuitive review workflow. Every change is inspectable, reversible, and safe.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Frontend
- **Next.js 16** + React 19 + TypeScript
- **Tiptap / ProseMirror** — headless rich text editor
- **Zustand** — lightweight state management
- **Tailwind CSS** — utility-first styling with custom design tokens
- **Framer Motion** — smooth animations
- **Lucide React** — icon system
- **docx / mammoth / file-saver** — DOCX import/export

### Design System
- Frosted glass chrome (sidebars, toolbar, panels, modals)
- Opaque paper surface for the document canvas
- Indigo accent color, soft shadows, generous spacing
- Editorial typography (serif for body, sans-serif for UI)

## Features

### Document Editor
- Full rich text editing via Tiptap/ProseMirror
- Headings, bold, italic, underline, strikethrough
- Text color, highlights, font families
- Paragraph alignment, line spacing
- Bullet lists, numbered lists, checklists
- Block quotes, tables, images, links
- Undo/redo, keyboard shortcuts
- Page-like layout with paper shadow
- DOCX import (via mammoth) and export (via docx library)
- Inline slash-command `/` for quick AI prompts
- Voice input for hands-free editing (Web Speech API)
- Mobile-responsive layout with overlay panels

### File Explorer (Left Rail)
- Folder tree with expand/collapse
- File status indicators (draft, shared, AI-generated, needs review)
- Star/favorite files
- Search and filter
- Create new documents and folders
- Drag-and-drop reordering and reparenting

### AI Assistant (Right Rail — Chat Tab)
- Real AI integration with OpenAI, Anthropic, Google AI, Mistral, Groq
- Chat with full document context
- Selection-aware prompts
- Quick action buttons (rewrite, shorten, expand, reformat)
- Structured change set generation from AI responses
- Voice-to-text input with live transcription

### Reviewable AI Edits (Right Rail — Changes Tab)
- Per-change accept/reject with inline ProseMirror diff decorations
- Before/after review cards with red/green highlights
- Batch accept all / reject all (from chat panel)
- Inline diff overlay on document canvas (green insertions, red deletions)
- Share for review workflow with reviewer assignment

### Comments (Right Rail — Comments Tab)
- Inline comments on selected text
- Reply threads with author avatars
- Resolve/unresolve toggle
- Comment count and filtering

### Version History (Right Rail — History Tab)
- Revision timeline with creator attribution
- Word count diffs (+added / -removed)
- Restore any previous revision (creates new head, non-destructive)
- Side-by-side revision comparison with word-level diff
- Activity event logging

### Collaboration
- Simulated multiplayer presence (avatar bar with online indicators)
- Shared review workflows on change sets
- Reviewer assignment and status tracking

### Command Palette
- `⌘K` to open
- Search commands, documents, formatting actions
- Keyboard navigation (arrow keys + enter)
- Categories: File, Documents, AI, Review, Edit, View, Format

### Enterprise Features
- **Settings modal** with tabbed UI (Sharing, SSO, Org, Integrations)
- **Sharing & Permissions**: role-based access (Owner, Editor, Reviewer, Viewer), add users by email, link sharing toggle
- **SSO Configuration**: SAML, OIDC, Google Workspace, Microsoft Entra with certificate fields
- **Organization settings**: name, default role, SSO requirement toggle
- **Audit log export**: filterable by date range and event type, download as JSON or CSV
- **Org knowledge integrations**: Google Drive, Notion, Confluence, Slack, GitHub with connect/disconnect

### Backend API
- `POST /api/documents` — create document
- `GET /api/documents/:id` — get document
- `PUT /api/documents/:id` — update document
- `POST /api/ai/edits` — request AI edits (real provider integration)
- `POST /api/ai/validate` — validate API keys
- `GET /api/change-sets/:id` — get change set
- `POST /api/change-sets/:id` — accept/reject batch
- `POST /api/revisions/:id` — restore revision

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # Backend API routes
│   │   ├── ai/edits/      # AI edit endpoint (multi-provider)
│   │   ├── ai/validate/   # API key validation
│   │   ├── change-sets/[id]/
│   │   ├── documents/
│   │   └── revisions/[id]/
│   ├── globals.css        # Design tokens & Tiptap styles
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── command-palette/   # ⌘K command palette
│   ├── editor/            # Tiptap editor, toolbar, selection toolbar, diff extension, slash prompt
│   ├── file-explorer/     # Left rail file tree with drag-and-drop
│   ├── layout/            # App shell, status bar
│   ├── right-rail/        # Chat, Changes, Comments, History panels
│   ├── review/            # Review-specific components
│   └── shared/            # Reusable UI (GlassButton, APIKeyModal, SettingsModal, AuditExportModal, RevisionCompareModal, PresenceAvatars, VoiceInput, DocxImportButton, IntegrationsPanel)
├── lib/                   # Utilities, sample data, DOCX utils, diff utils
├── stores/                # Zustand stores
│   ├── api-key-store.ts   # AI provider configuration
│   ├── change-store.ts    # Change sets & items
│   ├── chat-store.ts      # AI threads & messages
│   ├── comment-store.ts   # Document comments & replies
│   ├── document-store.ts  # Documents & revisions
│   ├── file-store.ts      # File tree
│   ├── presence-store.ts  # Simulated multiplayer presence
│   └── ui-store.ts        # UI state (panels, modals, selection, etc.)
└── types/                 # TypeScript type definitions
```

## Data Model

- **Document** — the current accepted state of a file
- **DocumentRevision** — a snapshot after a meaningful save/apply event
- **ChangeSet** — a proposed batch of edits (usually from AI)
- **ChangeItem** — a single atomic suggested edit within a change set
- **Comment / CommentReply** — inline comments with reply threads
- **ReviewRequest** — shared review workflow on change sets
- **AIThread / AIMessage** — conversation history
- **ActivityEvent** — audit log entries
- **PresenceUser** — simulated collaborator presence

## Key Principle

**AI writes to a staging layer, not directly to the live document.**

Every AI run produces a change set of individually reviewable items. The user can accept, reject, or partially accept. Only accepted changes become part of the document. This is what makes the editor trustworthy.

## Roadmap

### Phase 1 — Single-Player AI Editor ✅
- [x] File explorer with drag-and-drop
- [x] Document canvas with Tiptap
- [x] Chat panel with real AI integration
- [x] AI propose edits (OpenAI, Anthropic, Google AI, Mistral, Groq)
- [x] Per-change accept/reject with inline ProseMirror diffs
- [x] Revision history
- [x] Polished glass UI
- [x] DOCX import/export
- [x] Voice input and slash commands
- [x] Mobile-responsive layout

### Phase 2 — Collaboration ✅
- [x] Multiplayer presence (simulated avatars with online indicators)
- [x] Comments/threads on selected text
- [x] Shared review workflows with reviewer assignment
- [x] Compare revisions side by side with word-level diff

### Phase 3 — Enterprise ✅
- [x] Permissions & SSO settings (SAML, OIDC, Google, Microsoft)
- [x] Audit log exports (JSON/CSV with filters)
- [x] Stronger DOCX fidelity (headings, lists, tables, marks, formatting)
- [x] Org knowledge integrations (Google Drive, Notion, Confluence, Slack, GitHub)
