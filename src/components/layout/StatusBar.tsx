'use client';

import { Settings, ScrollText, Crown } from 'lucide-react';
import { useDocumentStore } from '@/stores/document-store';
import { useChangeStore } from '@/stores/change-store';
import { useAPIKeyStore } from '@/stores/api-key-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useUIStore } from '@/stores/ui-store';
import { formatWordCount } from '@/lib/utils';

export function StatusBar() {
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const changeSets = useChangeStore((s) => s.changeSets);
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const isConfigured = useAPIKeyStore((s) => s.isConfigured);
  const provider = useAPIKeyStore((s) => s.provider);
  const setSettingsOpen = useAPIKeyStore((s) => s.setSettingsOpen);

  const isProUser = useSubscriptionStore((s) => s.isProUser);
  const setPricingOpen = useSubscriptionStore((s) => s.setPricingOpen);

  const setSettingsModalOpen = useUIStore((s) => s.setSettingsModalOpen);
  const setAuditExportOpen = useUIStore((s) => s.setAuditExportOpen);

  const pendingChanges = changeSets
    .filter((cs) => cs.documentId === activeDocId)
    .flatMap((cs) => cs.items)
    .filter((item) => item.status === 'pending').length;

  return (
    <div
      className="glass h-7 flex items-center justify-between px-3 md:px-4 text-xs flex-shrink-0"
      style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-glass)' }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {doc && <span>{formatWordCount(doc.wordCount)}</span>}
        {doc && <span className="hidden md:inline">Autosaved</span>}
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        {isProUser && (
          <button
            onClick={() => setPricingOpen(true)}
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity px-1.5 py-0.5 rounded-md"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
              color: '#8b5cf6',
            }}
          >
            <Crown size={10} />
            <span className="text-[10px] font-semibold">Pro</span>
          </button>
        )}
        {isConfigured || isProUser ? (
          <span style={{ color: 'var(--green-text)' }} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--green-text)' }} />
            <span className="hidden md:inline">AI:</span> {isProUser ? 'Pro' : provider}
          </span>
        ) : (
          <button
            onClick={() => setSettingsOpen(true)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent)' }}
          >
            Set up AI
          </button>
        )}
        {pendingChanges > 0 && (
          <span style={{ color: 'var(--accent)' }}>
            {pendingChanges} pending
          </span>
        )}
        <button
          onClick={() => setAuditExportOpen(true)}
          className="hidden md:flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <ScrollText size={12} />
          Audit log
        </button>
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Settings size={12} />
          <span className="hidden md:inline">Settings</span>
        </button>
        <span className="hidden md:inline">⌘K for commands</span>
      </div>
    </div>
  );
}
