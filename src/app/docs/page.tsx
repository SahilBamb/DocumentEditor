'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  FileText,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  GitCompareArrows,
  Mic,
  FolderTree,
  History,
  Slash,
  MessageSquare,
  Search,
  FileDown,
  Smartphone,
  CreditCard,
  Key,
  Settings,
  Palette,
  Command,
  Keyboard,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'What Is It?' },
  { href: '/docs', label: 'Docs' },
  { href: '/editor', label: 'Open Editor' },
];

interface DocSection {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  content: { heading: string; body: string }[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'getting-started',
    icon: Sparkles,
    title: 'Getting Started',
    color: '#4f46e5',
    content: [
      {
        heading: 'Opening the Editor',
        body: 'Navigate to the /editor route or click "Launch Editor" from the landing page. The editor loads with a sample document so you can explore features immediately.',
      },
      {
        heading: 'Setting Up AI',
        body: 'Click the key icon in the toolbar to open the AI Provider Settings modal. Choose your provider (OpenAI, Anthropic, Google, Mistral, or Groq), paste your API key, select a model, and click "Test connection" to validate. Then click "Save & enable AI" to activate.',
      },
      {
        heading: 'Pro Subscription (Optional)',
        body: 'Instead of providing your own API key, you can upgrade to Pro ($12/month). Click the pricing option in the API key modal or status bar. Pro subscribers get unlimited AI edits powered by GPT-4o with no key required.',
      },
      {
        heading: 'Your First AI Edit',
        body: 'Open the chat panel (right sidebar), type a prompt like "Make the intro more compelling", and press Enter. The AI will analyze your document and propose inline diffs. Accept or reject each change individually.',
      },
    ],
  },
  {
    id: 'editor',
    icon: FileText,
    title: 'Rich Text Editor',
    color: '#1a1a1a',
    content: [
      {
        heading: 'Formatting',
        body: 'The toolbar provides buttons for Bold (Cmd+B), Italic (Cmd+I), Underline (Cmd+U), Strikethrough, Headings (H1/H2/H3), and text alignment (left/center/right/justify). All formatting uses Tiptap extensions on top of ProseMirror.',
      },
      {
        heading: 'Lists & Tasks',
        body: 'Create bullet lists, numbered lists, and task lists (interactive checkboxes). Indent/outdent with Tab/Shift+Tab. Task items can be checked off directly in the editor.',
      },
      {
        heading: 'Tables',
        body: 'Insert tables from the toolbar. Once created, you can add/remove rows and columns, merge cells, and resize columns by dragging borders. Tables support full rich text formatting within cells.',
      },
      {
        heading: 'Links & Images',
        body: 'Select text and click the link button to create a hyperlink. Use the image button to insert images by URL. Links open in new tabs and images are displayed inline in the document flow.',
      },
      {
        heading: 'Text Colors & Highlights',
        body: 'The palette icon opens a color picker for text color. The highlighter icon lets you apply background highlight colors to selected text. Multiple colors are available for both.',
      },
      {
        heading: 'Blockquotes & Horizontal Rules',
        body: 'Use the quote button for blockquotes (styled with a left border accent) and the horizontal rule button for visual section dividers.',
      },
    ],
  },
  {
    id: 'ai-chat',
    icon: MessageSquare,
    title: 'AI Chat Panel',
    color: '#6366f1',
    content: [
      {
        heading: 'Opening the Chat',
        body: 'Click the chat tab in the right sidebar, or click the AI sparkle button in the toolbar. The chat panel shows your conversation with the AI assistant for the currently active document.',
      },
      {
        heading: 'Sending Prompts',
        body: 'Type your instruction in the text area and press Enter (or click Send). The AI will analyze your full document text (and any selected text) and propose changes. Shift+Enter creates a new line without sending.',
      },
      {
        heading: 'Quick Prompts',
        body: 'When the chat is empty, you\'ll see suggested quick actions: "Rewrite to sound more executive", "Expand into 5 bullet points", "Shorten by 30%", "Turn into a proposal", "Insert a comparison table", and "Draft a conclusion". Click any to pre-fill the input.',
      },
      {
        heading: 'Attachments & Context',
        body: 'Drag files from the file explorer or selected text from the editor into the chat panel. These appear as attachment chips above the input, providing the AI with additional context for more accurate edits.',
      },
      {
        heading: 'Change Management',
        body: 'When the AI proposes changes, a card appears showing the pending count with "Accept all" and "Reject all" buttons. Click "View proposed changes" on any AI message to jump to the Changes tab for individual review.',
      },
    ],
  },
  {
    id: 'inline-diffs',
    icon: GitCompareArrows,
    title: 'Inline Diff Review',
    color: '#8b5cf6',
    content: [
      {
        heading: 'How Diffs Work',
        body: 'When the AI proposes changes, they appear directly in the document as inline decorations. Deleted text shows as red strikethrough, and new replacement text appears as green highlighted text immediately after, with small accept/reject buttons.',
      },
      {
        heading: 'Accepting Changes',
        body: 'Click the green checkmark (✓) next to a change to accept it. The original text is removed and replaced with the AI\'s suggestion. The change status updates to "accepted" in the Changes panel.',
      },
      {
        heading: 'Rejecting Changes',
        body: 'Click the red X (✗) next to a change to reject it. The AI\'s suggestion is removed and the original text remains unchanged. The change status updates to "rejected" in the Changes panel.',
      },
      {
        heading: 'Batch Operations',
        body: 'Use "Accept all" or "Reject all" in the chat panel or Changes tab to process all pending changes at once. Changes are applied in reverse document order to prevent position shifts.',
      },
      {
        heading: 'Toggle Visibility',
        body: 'In the Changes tab, toggle "Show inline diff" to hide/show the decorations in the editor without accepting or rejecting them. This is useful when you want to read the document without visual noise.',
      },
    ],
  },
  {
    id: 'slash-commands',
    icon: Slash,
    title: 'Slash Commands',
    color: '#06b6d4',
    content: [
      {
        heading: 'Invoking a Slash Command',
        body: 'While typing in the editor, press / to open the inline AI prompt. A small popup appears at your cursor position. Type your instruction and press Enter to send it to the AI.',
      },
      {
        heading: 'Typing a Literal Slash',
        body: 'If you just want to type a / character, press / twice. The first / triggers the prompt popup, and the second / closes it and inserts a / character into the document.',
      },
      {
        heading: 'Canceling',
        body: 'Press Escape to close the prompt without sending. The slash character that triggered the prompt is automatically removed from the document.',
      },
      {
        heading: 'Results',
        body: 'The AI response is the same as a chat message — changes appear as inline diffs in the document, and the conversation is logged in the chat panel for reference.',
      },
    ],
  },
  {
    id: 'voice-input',
    icon: Mic,
    title: 'Voice Input',
    color: '#ec4899',
    content: [
      {
        heading: 'Toolbar Voice Button',
        body: 'The microphone button in the toolbar provides global voice input. Click it, speak your editing instruction, and when you stop speaking the prompt is automatically sent to the AI. Results appear as inline diffs.',
      },
      {
        heading: 'Chat Panel Voice Button',
        body: 'The microphone button next to the chat input appends transcribed text to the input field rather than auto-sending. This lets you compose longer prompts by combining voice and typed text.',
      },
      {
        heading: 'Visual Feedback',
        body: 'While recording, the microphone button pulses red, and an interim transcript tooltip shows what the AI has recognized so far. When recognition is complete, the button returns to its default state.',
      },
      {
        heading: 'Browser Support',
        body: 'Voice input requires the Web Speech API (SpeechRecognition). It is fully supported in Chrome, Edge, and Safari. Firefox does not yet support this API. If unsupported, the microphone button is hidden.',
      },
    ],
  },
  {
    id: 'file-explorer',
    icon: FolderTree,
    title: 'File Explorer',
    color: '#f59e0b',
    content: [
      {
        heading: 'Creating Files & Folders',
        body: 'Click the + button in the file explorer header to create a new document. Use the folder+ button to create a new folder. New items appear at the top level by default.',
      },
      {
        heading: 'Renaming',
        body: 'Double-click any file or folder name to rename it. Press Enter to confirm or Escape to cancel. The file extension is preserved.',
      },
      {
        heading: 'Drag & Drop',
        body: 'Drag files to reorder them or drop them onto folders to move them inside. A blue highlight appears on valid drop targets. Folders can be expanded/collapsed by clicking the arrow.',
      },
      {
        heading: 'Context for Chat',
        body: 'Drag any file from the explorer directly into the chat input area. The file content becomes an attachment chip, giving the AI full context of that document when processing your prompt.',
      },
      {
        heading: 'Search & Filter',
        body: 'Use the search icon in the explorer header to filter files by name. The filter applies recursively to nested folders.',
      },
    ],
  },
  {
    id: 'version-history',
    icon: History,
    title: 'Version History',
    color: '#10b981',
    content: [
      {
        heading: 'Viewing History',
        body: 'Open the History tab in the right sidebar to see all document revisions listed chronologically. Each entry shows a timestamp, word count, and summary of changes.',
      },
      {
        heading: 'Comparing Versions',
        body: 'Click "Compare" on any revision to open a side-by-side diff modal showing exactly what changed between that version and the current document.',
      },
      {
        heading: 'Restoring Versions',
        body: 'Click "Restore" on any revision to revert the document to that state. A new revision is created capturing the current state before the restore, so you never lose work.',
      },
      {
        heading: 'Activity Log',
        body: 'The bottom of the history panel shows an activity log of all document events — edits, AI suggestions, version restores, and more.',
      },
    ],
  },
  {
    id: 'search-replace',
    icon: Search,
    title: 'Search & Replace',
    color: '#14b8a6',
    content: [
      {
        heading: 'Opening Search',
        body: 'Press Cmd+F (or Ctrl+F) to open the search bar. Press Cmd+H (or Ctrl+H) to open search and replace. The search bar appears at the top of the editor area.',
      },
      {
        heading: 'Finding Text',
        body: 'Type your search query and matches are highlighted in the document in real-time. Use the up/down arrows (or Enter/Shift+Enter) to navigate between matches. The current match is highlighted more prominently.',
      },
      {
        heading: 'Replacing Text',
        body: 'In replace mode, type the replacement text and click "Replace" to replace the current match, or "Replace All" to replace every occurrence at once.',
      },
      {
        heading: 'Options',
        body: 'Toggle case sensitivity with the "Aa" button. Match counts are displayed showing the current position (e.g., "3 of 12").',
      },
    ],
  },
  {
    id: 'import-export',
    icon: FileDown,
    title: 'DOCX Import & Export',
    color: '#2563eb',
    content: [
      {
        heading: 'Importing DOCX',
        body: 'Click the import button (upload icon) in the toolbar to select a .docx file from your computer. The document content is parsed and loaded into the editor, preserving headings, formatting, lists, and other supported elements.',
      },
      {
        heading: 'Exporting DOCX',
        body: 'Click the export button (download icon) in the toolbar to generate a .docx file from the current document content. The file downloads automatically with the document title as the filename.',
      },
      {
        heading: 'Supported Formatting',
        body: 'Import/export supports: headings (H1-H3), bold, italic, underline, strikethrough, bullet lists, numbered lists, blockquotes, links, and horizontal rules. Tables and images have limited support.',
      },
    ],
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile Experience',
    color: '#f97316',
    content: [
      {
        heading: 'Responsive Layout',
        body: 'On screens narrower than 768px, the file explorer and right panel are hidden by default. They can be opened as full-height slide-in overlay panels by tapping the panel toggle buttons in the toolbar.',
      },
      {
        heading: 'Adapted Toolbar',
        body: 'On mobile, the toolbar shows only essential controls: panel toggles, undo/redo, voice input, and the AI button. Formatting buttons are hidden to save space — use selection toolbar for formatting.',
      },
      {
        heading: 'Selection Toolbar',
        body: 'When you select text on mobile, a floating toolbar appears with formatting options (bold, italic, headings) and an "Ask AI" button to send the selection to the chat with a prompt.',
      },
      {
        heading: 'Voice-First Editing',
        body: 'On mobile, voice input is the most efficient way to interact with the AI. Tap the microphone in the toolbar, speak your instruction, and the AI processes it — no typing needed.',
      },
    ],
  },
  {
    id: 'command-palette',
    icon: Command,
    title: 'Command Palette',
    color: '#8b5cf6',
    content: [
      {
        heading: 'Opening the Palette',
        body: 'Press Cmd+K (or Ctrl+K) to open the command palette. A search-driven modal appears with a list of all available commands.',
      },
      {
        heading: 'Available Commands',
        body: 'The palette includes commands for: formatting (bold, italic, headings), inserting elements (table, image, horizontal rule), navigation (toggle panels), AI actions (open chat, new thread), and document actions (export, import).',
      },
      {
        heading: 'Fuzzy Search',
        body: 'Type to filter commands by name. The search is fuzzy, so "bold" matches "Toggle Bold", and "table" matches "Insert Table". Press Enter to execute the highlighted command.',
      },
    ],
  },
  {
    id: 'api-providers',
    icon: Key,
    title: 'AI Provider Configuration',
    color: '#4f46e5',
    content: [
      {
        heading: 'Supported Providers',
        body: 'DocumentEditor supports five AI providers: OpenAI (GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo), Anthropic (Claude 4 Sonnet, Claude 3.5 Sonnet, Claude 3 Haiku), Google (Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash), Mistral (Mistral Large, Mistral Medium, Mistral Small), and Groq (Llama 3, Mixtral, Gemma).',
      },
      {
        heading: 'API Key Storage',
        body: 'Your API key is stored in your browser\'s localStorage. It is sent directly to the provider API from the server-side route — it never touches any third-party servers. Clear your key anytime from the settings modal.',
      },
      {
        heading: 'Validation',
        body: 'Click "Test connection" in the API key modal to validate your key against the provider\'s API. A success checkmark confirms the key is valid and has the correct permissions.',
      },
      {
        heading: 'Model Selection',
        body: 'After choosing a provider, select a model from the dropdown. Each provider offers multiple models with different capabilities and pricing. The selected model is used for all AI requests.',
      },
    ],
  },
  {
    id: 'subscription',
    icon: CreditCard,
    title: 'Subscription & Billing',
    color: '#6366f1',
    content: [
      {
        heading: 'Free Tier',
        body: 'DocumentEditor is free to use with all editing features. To use AI features, provide your own API key from any supported provider. There are no limits on documents, files, or editor features.',
      },
      {
        heading: 'Pro Tier ($12/month)',
        body: 'Upgrade to Pro for unlimited AI edits powered by GPT-4o. No API key required — the platform provides the AI. Subscribe via the Pricing modal accessible from the status bar, API key modal, or chat panel.',
      },
      {
        heading: 'Payment Processing',
        body: 'Payments are processed securely by Stripe. You\'ll be redirected to Stripe\'s hosted checkout page for payment. All major credit cards and debit cards are accepted.',
      },
      {
        heading: 'Managing Your Subscription',
        body: 'Pro subscribers can manage their subscription through the Stripe Customer Portal: update payment method, view invoices, change plans, or cancel. Access it from the Pricing modal or API key settings.',
      },
      {
        heading: 'Cancellation',
        body: 'Cancel anytime from the Stripe Customer Portal. Your Pro access continues until the end of the current billing period. After that, you revert to the free tier and can still use the editor with your own API key.',
      },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    icon: Keyboard,
    title: 'Keyboard Shortcuts',
    color: '#64748b',
    content: [
      {
        heading: 'General',
        body: 'Cmd+K — Command palette\nCmd+Z — Undo\nCmd+Shift+Z — Redo\nCmd+F — Search\nCmd+H — Search & Replace',
      },
      {
        heading: 'Formatting',
        body: 'Cmd+B — Bold\nCmd+I — Italic\nCmd+U — Underline\nCmd+Shift+X — Strikethrough\nCmd+Shift+H — Highlight',
      },
      {
        heading: 'Structure',
        body: 'Cmd+Alt+1 — Heading 1\nCmd+Alt+2 — Heading 2\nCmd+Alt+3 — Heading 3\nCmd+Shift+7 — Ordered list\nCmd+Shift+8 — Bullet list\nCmd+Shift+9 — Task list',
      },
      {
        heading: 'AI',
        body: '/ — Slash command (AI prompt at cursor)\n// — Insert literal slash character\nMicrophone button — Voice input',
      },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings & Customization',
    color: '#6b7280',
    content: [
      {
        heading: 'Editor Settings',
        body: 'Open Settings from the status bar gear icon. Configure editor preferences including font family (sans-serif, serif, mono), font size, line height, and page width.',
      },
      {
        heading: 'Theme',
        body: 'DocumentEditor uses a light frosted-glass theme. The warm off-white background (#f0eee9) with translucent glass panels provides a clean, distraction-free writing environment.',
      },
      {
        heading: 'Audit Log',
        body: 'Click "Audit log" in the status bar to view and export a complete activity log. The log records all document edits, AI interactions, version restores, and file operations.',
      },
    ],
  },
];

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)',
      }}
    >
      {children}
    </div>
  );
}

export default function DocsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
    >
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{ background: 'rgba(240, 238, 233, 0.8)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">DocumentEditor</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-black/[0.04]"
                style={{ color: link.href === '/docs' ? 'var(--accent)' : 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex">
            <Link
              href="/editor"
              className="px-5 py-2 text-sm font-medium rounded-xl flex items-center gap-2 text-white"
              style={{ background: 'var(--accent)' }}
            >
              Launch Editor <ArrowRight size={14} />
            </Link>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-black/[0.04]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="block px-4 py-2.5 text-sm rounded-lg hover:bg-black/[0.04]" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="pt-16 flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:block w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto py-8 pl-6 pr-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-4 px-3" style={{ color: 'var(--text-tertiary)' }}>
            Documentation
          </p>
          <nav className="space-y-0.5">
            {DOC_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-black/[0.04]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <section.icon size={13} style={{ color: section.color }} />
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button
          className="lg:hidden fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white"
          style={{ background: 'var(--accent)' }}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {mobileSidebarOpen && (
          <>
            <div className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <aside
              className="lg:hidden fixed left-0 top-16 bottom-0 z-40 w-64 overflow-y-auto py-6 px-4 backdrop-blur-xl"
              style={{ background: 'rgba(240, 238, 233, 0.95)', borderRight: '1px solid rgba(0,0,0,0.06)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-4 px-3" style={{ color: 'var(--text-tertiary)' }}>
                Documentation
              </p>
              <nav className="space-y-0.5">
                {DOC_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-colors hover:bg-black/[0.04]"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <section.icon size={13} style={{ color: section.color }} />
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 py-8 lg:py-12 lg:pl-8 lg:pr-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Documentation</h1>
            <p className="text-sm md:text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
              Everything you need to know about DocumentEditor, from getting started to advanced features.
            </p>

            <div className="space-y-16">
              {DOC_SECTIONS.map((section) => (
                <section key={section.id} id={section.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${section.color}12`, color: section.color }}
                    >
                      <section.icon size={18} />
                    </div>
                    <h2 className="text-xl font-bold">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item) => (
                      <GlassCard key={item.heading} className="p-6">
                        <h3
                          className="text-sm font-semibold mb-2 flex items-center gap-2"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <ChevronRight size={13} style={{ color: section.color }} />
                          {item.heading}
                        </h3>
                        <p
                          className="text-xs leading-relaxed whitespace-pre-line"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {item.body}
                        </p>
                      </GlassCard>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 mb-8">
              <GlassCard className="p-8 text-center">
                <h3 className="text-lg font-bold mb-2">Ready to start?</h3>
                <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Open the editor and try these features for yourself.
                </p>
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
                >
                  Launch Editor <ArrowRight size={14} />
                </Link>
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
