'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { useDocumentStore } from '@/stores/document-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { useUIStore } from '@/stores/ui-store';
import { saveAs } from 'file-saver';

const EVENT_TYPES = [
  'document_created',
  'revision_created',
  'ai_edit_requested',
  'change_set_proposed',
  'change_accepted',
  'change_rejected',
] as const;

export function AuditExportModal() {
  const open = useUIStore((s) => s.auditExportOpen);
  const setOpen = useUIStore((s) => s.setAuditExportOpen);

  return (
    <AnimatePresence>
      {open && <AuditExportInner onClose={() => setOpen(false)} />}
    </AnimatePresence>
  );
}

function AuditExportInner({ onClose }: { onClose: () => void }) {
  const activityEvents = useDocumentStore((s) => s.activityEvents);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(EVENT_TYPES));
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  const filtered = useMemo(() => {
    return activityEvents.filter((ev) => {
      if (!selectedTypes.has(ev.eventType)) return false;
      if (fromDate && new Date(ev.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(ev.createdAt) > new Date(toDate + 'T23:59:59')) return false;
      return true;
    });
  }, [activityEvents, selectedTypes, fromDate, toDate]);

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const handleExport = () => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
      saveAs(blob, 'audit-log.json');
    } else {
      const header = 'id,documentId,actorType,actorId,eventType,createdAt,payload';
      const rows = filtered.map((ev) =>
        [ev.id, ev.documentId, ev.actorType, ev.actorId, ev.eventType, ev.createdAt, JSON.stringify(ev.payload)].join(',')
      );
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, 'audit-log.csv');
    }
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-[10%] left-1/2 -translate-x-1/2 z-50 w-[480px] max-h-[80vh] glass-strong shadow-float rounded-2xl overflow-hidden flex flex-col"
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              <Download size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Export Audit Log</h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Download activity events as JSON or CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.05] transition-colors cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl text-xs bg-transparent outline-none"
                style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl text-xs bg-transparent outline-none"
                style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Event Types</label>
            <div className="grid grid-cols-2 gap-1.5">
              {EVENT_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/[0.02] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(t)}
                    onChange={() => toggleType(t)}
                    className="rounded accent-[var(--accent)]"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{t.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Format</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" checked={format === 'json'} onChange={() => setFormat('json')} className="accent-[var(--accent)]" />
                <FileJson size={14} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>JSON</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" checked={format === 'csv'} onChange={() => setFormat('csv')} className="accent-[var(--accent)]" />
                <FileSpreadsheet size={14} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>CSV</span>
              </label>
            </div>
          </div>

          <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{filtered.length}</span> events match your filters
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.015)' }}
        >
          <GlassButton size="md" variant="glass" onClick={onClose}>Cancel</GlassButton>
          <GlassButton
            size="md"
            variant="accent"
            icon={<Download size={14} />}
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            Export {format.toUpperCase()}
          </GlassButton>
        </div>
      </motion.div>
    </>
  );
}
