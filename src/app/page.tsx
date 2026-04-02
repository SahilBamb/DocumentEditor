'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Sparkles,
  FileText,
  GitCompareArrows,
  Mic,
  FolderTree,
  History,
  Slash,
  Smartphone,
  CreditCard,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/features', label: 'What Is It?' },
  { href: '/docs', label: 'Docs' },
  { href: '/editor', label: 'Open Editor' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Editing',
    description: 'Chat with AI to rewrite, expand, shorten, or transform your documents. Changes appear as reviewable inline diffs.',
    color: '#4f46e5',
  },
  {
    icon: GitCompareArrows,
    title: 'Inline Diff Review',
    description: 'AI proposals render directly inside your document with accept/reject controls — exactly like a code review.',
    color: '#8b5cf6',
  },
  {
    icon: Mic,
    title: 'Voice Input',
    description: 'Speak your edits. Voice-to-text lets you dictate prompts hands-free, perfect for mobile editing.',
    color: '#ec4899',
  },
  {
    icon: FolderTree,
    title: 'File Explorer',
    description: 'Organize documents into folders with drag-and-drop. Drag files into chat for context-aware AI edits.',
    color: '#f59e0b',
  },
  {
    icon: History,
    title: 'Version History',
    description: 'Every edit is tracked. Browse, compare, and restore any previous version of your document.',
    color: '#10b981',
  },
  {
    icon: Slash,
    title: 'Slash Commands',
    description: 'Type / anywhere in your document to invoke AI without leaving the editor. Fast, inline, contextual.',
    color: '#06b6d4',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Full editing experience on any device. Panels slide in as overlays, toolbars adapt to screen size.',
    color: '#f97316',
  },
  {
    icon: CreditCard,
    title: 'Pro Subscription',
    description: 'Free tier with your own API key, or upgrade to Pro for unlimited AI edits with no key needed.',
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

export default function LandingPage() {
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
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
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
                style={{ color: link.href === '/editor' ? 'var(--accent)' : 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/editor"
              className="px-5 py-2 text-sm font-medium rounded-xl transition-all hover:shadow-md flex items-center gap-2 text-white"
              style={{ background: 'var(--accent)' }}
            >
              Launch Editor
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-black/[0.04] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm rounded-lg transition-colors hover:bg-black/[0.04]"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/editor"
              className="block px-4 py-2.5 text-sm font-medium rounded-lg text-white text-center mt-2"
              style={{ background: 'var(--accent)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Launch Editor
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: 'rgba(79, 70, 229, 0.08)',
              color: 'var(--accent)',
              border: '1px solid rgba(79, 70, 229, 0.15)',
            }}
          >
            <Sparkles size={12} />
            AI-native document editing
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Cursor, but for{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899)' }}
            >
              documents
            </span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: 'var(--text-secondary)' }}
          >
            An AI-native writing environment where AI proposes edits as reviewable diffs.
            Accept, reject, or refine — you stay in control of every word.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/editor"
              className="px-8 py-3.5 text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] flex items-center gap-2.5 text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
            >
              Open Editor
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/features"
              className="px-8 py-3.5 text-sm font-semibold rounded-xl transition-all hover:bg-black/[0.04] flex items-center gap-2.5"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              See what it does
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Editor Preview */}
      <section className="px-6 pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <GlassCard className="p-1.5 md:p-2">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--bg-paper)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                aspectRatio: '16/9',
              }}
            >
              <div className="h-full flex flex-col">
                {/* Fake toolbar */}
                <div
                  className="h-11 flex items-center gap-2 px-4 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    {['B', 'I', 'U'].map((l) => (
                      <div
                        key={l}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-tertiary)' }}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1" />
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
                  >
                    <Sparkles size={12} />
                    AI
                  </div>
                </div>
                {/* Fake content */}
                <div className="flex-1 flex">
                  <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                    <div className="max-w-lg">
                      <div className="h-4 rounded-full mb-6 w-3/4" style={{ background: 'rgba(0,0,0,0.08)' }} />
                      <div className="space-y-3 mb-8">
                        <div className="h-3 rounded-full w-full" style={{ background: 'rgba(0,0,0,0.04)' }} />
                        <div className="h-3 rounded-full w-5/6" style={{ background: 'rgba(0,0,0,0.04)' }} />
                        <div className="h-3 rounded-full w-4/6" style={{ background: 'rgba(0,0,0,0.04)' }} />
                      </div>
                      {/* Diff preview */}
                      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div
                          className="px-3 py-1.5 text-[11px] flex items-center gap-1.5"
                          style={{ background: 'rgba(239,68,68,0.06)', color: '#dc2626', textDecoration: 'line-through' }}
                        >
                          The project is going well and making progress.
                        </div>
                        <div
                          className="px-3 py-1.5 text-[11px] flex items-center gap-1.5"
                          style={{ background: 'rgba(34,197,94,0.06)', color: '#15803d' }}
                        >
                          The project is ahead of schedule, with all milestones met.
                        </div>
                        <div
                          className="px-2 py-1 flex items-center gap-1"
                          style={{ background: 'rgba(0,0,0,0.02)' }}
                        >
                          <div
                            className="px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d' }}
                          >
                            Accept
                          </div>
                          <div
                            className="px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
                          >
                            Reject
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Fake chat panel */}
                  <div
                    className="hidden md:flex flex-col w-72"
                    style={{ borderLeft: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.01)' }}
                  >
                    <div
                      className="px-4 py-3 text-xs font-semibold"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)' }}
                    >
                      AI Chat
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-end gap-3">
                      <div className="self-end px-3 py-2 rounded-xl text-xs text-white max-w-[180px]" style={{ background: 'var(--accent)' }}>
                        Make the intro more confident
                      </div>
                      <div
                        className="self-start px-3 py-2 rounded-xl text-xs max-w-[200px]"
                        style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-primary)' }}
                      >
                        I&apos;ve proposed 1 change for your review. Check the diff above.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-20 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to write better
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              A complete AI writing toolkit — from first draft to final revision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <GlassCard key={feature.title} className="p-6 hover:scale-[1.02] transition-transform">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}12`, color: feature.color }}
                >
                  <feature.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <GlassCard className="p-10 md:p-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Start writing with AI
            </h2>
            <p className="text-sm md:text-base mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Free to use with your own API key. Upgrade to Pro for unlimited AI with no setup required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/editor"
                className="px-8 py-3.5 text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] flex items-center gap-2.5 text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
              >
                Launch Editor
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/docs"
                className="px-8 py-3.5 text-sm font-medium rounded-xl transition-all hover:bg-black/[0.04] flex items-center gap-2.5"
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
        <div
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <FileText size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold">DocumentEditor</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
              Features
            </Link>
            <Link href="/docs" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
              Docs
            </Link>
            <Link href="/editor" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
              Editor
            </Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            &copy; {new Date().getFullYear()} DocumentEditor
          </p>
        </div>
      </footer>
    </div>
  );
}
