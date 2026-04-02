'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  FileText,
  Sparkles,
  GitCompareArrows,
  Mic,
  FolderTree,
  History,
  Slash,
  Smartphone,
  CreditCard,
  MessageSquare,
  Search,
  FileDown,
  ArrowRight,
  Menu,
  X,
  Play,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'What Is It?' },
  { href: '/docs', label: 'Docs' },
  { href: '/editor', label: 'Open Editor' },
];

interface FeatureSection {
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
  details: string[];
  color: string;
}

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    id: 'ai-editing',
    icon: Sparkles,
    title: 'AI-Powered Editing',
    tagline: 'Chat with AI to transform your writing',
    description:
      'Type a prompt in the chat panel and the AI will analyze your document, suggest targeted edits, and present them as a structured changeset. Each proposed modification is individually reviewable — accept what works, reject what doesn\'t.',
    details: [
      'Supports OpenAI, Anthropic, Google, Mistral, and Groq providers',
      'Context-aware: AI sees the full document and any selected text',
      'Drag files or text snippets into chat for additional context',
      'Quick prompts for common tasks: rewrite, expand, shorten, restructure',
    ],
    color: '#4f46e5',
  },
  {
    id: 'inline-diffs',
    icon: GitCompareArrows,
    title: 'Inline Diff Review',
    tagline: 'Review AI changes right inside your document',
    description:
      'Inspired by how Cursor handles code edits, every AI suggestion appears as an inline diff directly in your document flow. Deleted text shows as red strikethrough, new text as green highlights, with accept/reject buttons on each change.',
    details: [
      'ProseMirror decorations for pixel-perfect inline rendering',
      'Accept or reject individual changes, or batch accept/reject all',
      'Changes panel in the sidebar for an overview of all proposals',
      'Toggle inline diffs on/off with the "Show inline diff" switch',
    ],
    color: '#8b5cf6',
  },
  {
    id: 'voice-input',
    icon: Mic,
    title: 'Voice Input',
    tagline: 'Speak your edits, hands-free',
    description:
      'Click the microphone button and dictate your editing instructions. The Web Speech API transcribes your voice in real-time, and the prompt is submitted to the AI just like a typed message. Essential for mobile editing.',
    details: [
      'Real-time interim transcript display while speaking',
      'Available in the toolbar (global) and chat panel (contextual)',
      'Automatic submission on speech end',
      'Works on Chrome, Edge, Safari and other supported browsers',
    ],
    color: '#ec4899',
  },
  {
    id: 'file-explorer',
    icon: FolderTree,
    title: 'File Explorer',
    tagline: 'Organize your documents with drag and drop',
    description:
      'A full file tree in the left sidebar lets you create documents and folders, rename them, and reorganize with drag-and-drop. Drag a file into the chat panel to reference its content in your AI prompt.',
    details: [
      'Create, rename, and delete files and folders',
      'Drag files between folders to reorganize',
      'Drag files into chat to provide AI context',
      'Search and filter across all documents',
    ],
    color: '#f59e0b',
  },
  {
    id: 'version-history',
    icon: History,
    title: 'Version History',
    tagline: 'Every change, every version, always recoverable',
    description:
      'The history panel tracks every revision of your document. Browse timestamps, see who made changes, compare any two versions side by side, and restore a previous version with one click.',
    details: [
      'Automatic revision snapshots on every save',
      'Side-by-side diff comparison between any two versions',
      'One-click restore to any previous version',
      'Activity log tracking all document events',
    ],
    color: '#10b981',
  },
  {
    id: 'slash-commands',
    icon: Slash,
    title: 'Slash Commands',
    tagline: 'AI prompts without leaving the document',
    description:
      'Type / anywhere in your document and an inline prompt appears at your cursor. Type your instruction, press Enter, and the AI processes it — no need to switch to the chat panel. Type // if you just want a literal slash.',
    details: [
      'Contextual: AI sees the text around your cursor position',
      'Instant inline popup at cursor position',
      'Enter to send, Escape to cancel, / to insert a literal slash',
      'Results appear as inline diffs in the document',
    ],
    color: '#06b6d4',
  },
  {
    id: 'chat-panel',
    icon: MessageSquare,
    title: 'AI Chat Panel',
    tagline: 'A dedicated conversation with your AI editor',
    description:
      'The right sidebar houses a full chat interface. See your conversation history, view proposed changes, and manage edits all in one place. Drag text or files into the chat for rich context.',
    details: [
      'Persistent conversation threads per document',
      'Quick action buttons for common editing tasks',
      'Attachment chips for referenced files and selected text',
      'Accept All / Reject All controls for batch change management',
    ],
    color: '#6366f1',
  },
  {
    id: 'rich-editor',
    icon: FileText,
    title: 'Rich Text Editor',
    tagline: 'A full-featured writing environment',
    description:
      'Built on Tiptap/ProseMirror, the editor supports headings, bold, italic, underline, strikethrough, lists, task lists, blockquotes, tables, images, links, text colors, highlights, and horizontal rules.',
    details: [
      'Toolbar with formatting controls and keyboard shortcuts',
      'Selection toolbar that appears on text selection',
      'Search & replace across the document',
      'DOCX import and export',
    ],
    color: '#1a1a1a',
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile Responsive',
    tagline: 'Full editing on any screen size',
    description:
      'On mobile, the file explorer and right panel become slide-in overlays with smooth animations. The toolbar adapts to show essential controls, and voice input makes AI prompting effortless without a keyboard.',
    details: [
      'Panels slide in as animated overlays on small screens',
      'Toolbar collapses to essential controls only',
      'Touch-friendly tap targets and gestures',
      'Voice input prominently accessible for mobile AI editing',
    ],
    color: '#f97316',
  },
  {
    id: 'search-replace',
    icon: Search,
    title: 'Search & Replace',
    tagline: 'Find and replace across your document',
    description:
      'Built-in search and replace with match highlighting, case sensitivity toggle, and replace-all support. Navigate between matches with keyboard shortcuts or arrow buttons.',
    details: [
      'Real-time match highlighting as you type',
      'Case-sensitive and whole-word matching options',
      'Replace one at a time or replace all matches',
      'Keyboard shortcuts for quick access (Cmd+F / Cmd+H)',
    ],
    color: '#14b8a6',
  },
  {
    id: 'export-import',
    icon: FileDown,
    title: 'DOCX Import & Export',
    tagline: 'Seamless Word document compatibility',
    description:
      'Import .docx files directly into the editor, preserving formatting. Export your documents back to .docx format for sharing with colleagues who use Microsoft Word or Google Docs.',
    details: [
      'Import preserves headings, lists, bold, italic, and more',
      'Export generates a properly formatted .docx file',
      'One-click import and export from the toolbar',
      'Compatible with Microsoft Word and Google Docs',
    ],
    color: '#2563eb',
  },
  {
    id: 'subscription',
    icon: CreditCard,
    title: 'Pro Subscription',
    tagline: 'Unlimited AI with no API key required',
    description:
      'The free tier lets you bring your own API key from any supported provider. Upgrade to Pro ($12/month) and the platform provides the AI — no API key setup, no usage limits to worry about.',
    details: [
      'Free: bring your own key from OpenAI, Anthropic, Google, Mistral, or Groq',
      'Pro: unlimited AI edits powered by GPT-4o, no key needed',
      'Stripe-powered checkout with secure payment processing',
      'Manage subscription, payment method, and invoices via Stripe Portal',
    ],
    color: '#6366f1',
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

export default function FeaturesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
    >
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          background: 'rgba(240, 238, 233, 0.8)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
                style={{ color: link.href === '/features' ? 'var(--accent)' : 'var(--text-secondary)' }}
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
              Launch Editor
              <ArrowRight size={14} />
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

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            What is DocumentEditor?
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            A deep dive into every feature. Each section below includes a demo area
            where you can see the feature in action.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="px-6 pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto space-y-12">
          {FEATURE_SECTIONS.map((feature, idx) => (
            <div key={feature.id} id={feature.id}>
              <GlassCard className="overflow-hidden">
                <div className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                  {/* Text content */}
                  <div className="flex-1 p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${feature.color}12`, color: feature.color }}
                      >
                        <feature.icon size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold">{feature.title}</h2>
                        <p className="text-xs" style={{ color: feature.color }}>{feature.tagline}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: feature.color }}
                          />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Demo placeholder */}
                  <div
                    className="flex-1 flex items-center justify-center p-8 md:p-10 min-h-[240px]"
                    style={{ background: `${feature.color}06` }}
                  >
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: `${feature.color}12`, color: feature.color }}
                      >
                        <Play size={28} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: feature.color }}>
                        Demo coming soon
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        Record a demo of {feature.title.toLowerCase()} to display here
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <GlassCard className="p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ready to try it?
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Jump into the editor and start writing with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/editor"
                className="px-8 py-3.5 text-sm font-semibold rounded-xl flex items-center gap-2.5 text-white transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
              >
                Open Editor
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/docs"
                className="px-8 py-3.5 text-sm font-medium rounded-xl flex items-center gap-2.5 transition-all hover:bg-black/[0.04]"
                style={{ color: 'var(--text-secondary)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                Read the docs
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <FileText size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold">DocumentEditor</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>&copy; {new Date().getFullYear()} DocumentEditor</p>
        </div>
      </footer>
    </div>
  );
}
