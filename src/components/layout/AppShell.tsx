'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/ui-store';
import { useAPIKeyStore } from '@/stores/api-key-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { FileExplorer } from '@/components/file-explorer/FileExplorer';
import { EditorArea } from '@/components/editor/EditorArea';
import { RightPanel } from '@/components/right-rail/RightPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { APIKeyModal } from '@/components/shared/APIKeyModal';
import { PricingModal } from '@/components/shared/PricingModal';
import { RevisionCompareModal } from '@/components/shared/RevisionCompareModal';
import { SettingsModal } from '@/components/shared/SettingsModal';
import { AuditExportModal } from '@/components/shared/AuditExportModal';
import { StatusBar } from '@/components/layout/StatusBar';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function AppShell() {
  const leftPanelOpen = useUIStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const compareModalOpen = useUIStore((s) => s.compareModalOpen);
  const loadFromStorage = useAPIKeyStore((s) => s.loadFromStorage);
  const loadSubscription = useSubscriptionStore((s) => s.loadSubscription);
  const setCustomerId = useSubscriptionStore((s) => s.setCustomerId);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadFromStorage();
    loadSubscription();
  }, [loadFromStorage, loadSubscription]);

  // Handle Stripe checkout success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success' && params.get('session_id')) {
      const sessionId = params.get('session_id')!;
      fetch('/api/stripe/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.customerId) {
            setCustomerId(data.customerId);
            loadSubscription();
          }
        })
        .catch(() => {});
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setCustomerId, loadSubscription]);

  // Auto-close panels on mobile on first load
  useEffect(() => {
    if (isMobile) {
      if (leftPanelOpen) toggleLeftPanel();
      if (rightPanelOpen) toggleRightPanel();
    }
    // Only run when isMobile changes, not on every panel toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <Toolbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop: inline panels */}
        {!isMobile && (
          <AnimatePresence mode="wait">
            {leftPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full overflow-hidden flex-shrink-0"
              >
                <FileExplorer />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          <EditorArea />
        </div>

        {!isMobile && (
          <AnimatePresence mode="wait">
            {rightPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full overflow-hidden flex-shrink-0"
              >
                <RightPanel />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Mobile: overlay panels */}
        {isMobile && (
          <AnimatePresence>
            {leftPanelOpen && (
              <>
                <motion.div
                  className="mobile-panel-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleLeftPanel}
                />
                <motion.div
                  className="mobile-panel-left"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <FileExplorer />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        {isMobile && (
          <AnimatePresence>
            {rightPanelOpen && (
              <>
                <motion.div
                  className="mobile-panel-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleRightPanel}
                />
                <motion.div
                  className="mobile-panel-right"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <RightPanel />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}
      </div>

      <StatusBar />

      <AnimatePresence>
        {commandPaletteOpen && <CommandPalette />}
      </AnimatePresence>

      <APIKeyModal />
      <PricingModal />

      <AnimatePresence>
        {compareModalOpen && <RevisionCompareModal />}
      </AnimatePresence>

      <SettingsModal />
      <AuditExportModal />
    </div>
  );
}
