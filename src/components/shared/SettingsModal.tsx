'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Shield,
  Users,
  Building2,
  Plug,
  ChevronDown,
  Link,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { IntegrationsPanel } from '@/components/shared/IntegrationsPanel';
import { cn } from '@/lib/utils';

type SettingsTab = 'sharing' | 'sso' | 'org' | 'integrations';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'sharing', label: 'Sharing', icon: <Users size={14} /> },
  { id: 'sso', label: 'SSO', icon: <Shield size={14} /> },
  { id: 'org', label: 'Organization', icon: <Building2 size={14} /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={14} /> },
];

export function SettingsModal() {
  const open = useUIStore((s) => s.settingsModalOpen);
  const setOpen = useUIStore((s) => s.setSettingsModalOpen);

  return (
    <AnimatePresence>
      {open && <SettingsModalInner onClose={() => setOpen(false)} />}
    </AnimatePresence>
  );
}

function SettingsModalInner({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<SettingsTab>('sharing');
  const setAuditExportOpen = useUIStore((s) => s.setAuditExportOpen);

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
        className="fixed top-[8%] left-1/2 -translate-x-1/2 z-50 w-[600px] max-h-[84vh] glass-strong shadow-float rounded-2xl overflow-hidden flex flex-col"
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              <Settings size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Manage sharing, security, and integrations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GlassButton
              size="sm"
              variant="ghost"
              icon={<Download size={13} />}
              onClick={() => { setAuditExportOpen(true); onClose(); }}
            >
              Audit log
            </GlassButton>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.05] transition-colors cursor-pointer"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-6 pt-3" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer',
                tab === t.id ? '' : 'hover:bg-black/[0.03]',
              )}
              style={{
                color: tab === t.id ? 'var(--accent)' : 'var(--text-tertiary)',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'sharing' && <SharingTab />}
          {tab === 'sso' && <SSOTab />}
          {tab === 'org' && <OrgTab />}
          {tab === 'integrations' && <IntegrationsPanel />}
        </div>
      </motion.div>
    </>
  );
}

const FAKE_USERS = [
  { name: 'You', email: 'you@company.com', role: 'Owner' },
  { name: 'Alice Chen', email: 'alice@company.com', role: 'Editor' },
  { name: 'Bob Martinez', email: 'bob@company.com', role: 'Reviewer' },
  { name: 'Carol Smith', email: 'carol@company.com', role: 'Viewer' },
];

const ROLES = ['Owner', 'Editor', 'Reviewer', 'Viewer'];

function SharingTab() {
  const [users, setUsers] = useState(FAKE_USERS);
  const [newEmail, setNewEmail] = useState('');
  const [linkSharing, setLinkSharing] = useState(false);

  const handleAddUser = () => {
    if (!newEmail.trim()) return;
    setUsers((prev) => [...prev, { name: newEmail.split('@')[0], email: newEmail.trim(), role: 'Viewer' }]);
    setNewEmail('');
  };

  const updateRole = (idx: number, role: string) => {
    setUsers((prev) => prev.map((u, i) => (i === idx ? { ...u, role } : u)));
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Who has access</h3>
        <div className="space-y-1">
          {users.map((user, idx) => (
            <div key={user.email} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/[0.02] transition-colors">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                style={{ background: idx === 0 ? '#8b5cf6' : idx === 1 ? '#3b82f6' : idx === 2 ? '#f59e0b' : '#10b981' }}
              >
                {user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
              </div>
              <div className="relative">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(idx, e.target.value)}
                  disabled={idx === 0}
                  className="appearance-none bg-transparent text-xs font-medium pr-5 pl-2 py-1 rounded-lg cursor-pointer outline-none"
                  style={{
                    color: idx === 0 ? 'var(--text-tertiary)' : 'var(--accent)',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Add people</h3>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddUser(); }}
            placeholder="Enter email address..."
            className="flex-1 h-9 px-3 rounded-xl text-xs bg-transparent outline-none"
            style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
          />
          <GlassButton size="sm" variant="accent" onClick={handleAddUser} disabled={!newEmail.trim()}>
            Add
          </GlassButton>
        </div>
      </div>

      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.015)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link size={14} style={{ color: 'var(--text-tertiary)' }} />
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Anyone with the link can view</p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Share a read-only link externally</p>
          </div>
        </div>
        <button
          onClick={() => setLinkSharing(!linkSharing)}
          className="w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
          style={{ background: linkSharing ? 'var(--accent)' : 'rgba(0,0,0,0.12)' }}
        >
          <div
            className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
            style={{ transform: linkSharing ? 'translateX(17px)' : 'translateX(2px)' }}
          />
        </button>
      </div>
    </div>
  );
}

const SSO_PROVIDERS = [
  { id: 'saml', label: 'SAML 2.0' },
  { id: 'oidc', label: 'OpenID Connect' },
  { id: 'google', label: 'Google Workspace' },
  { id: 'microsoft', label: 'Microsoft Entra' },
];

function SSOTab() {
  const [selectedProvider, setSelectedProvider] = useState('saml');
  const [entityId, setEntityId] = useState('');
  const [ssoUrl, setSsoUrl] = useState('');
  const [certificate, setCertificate] = useState('');

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
        style={{ background: 'var(--yellow-tint)', border: '1px solid var(--yellow-border)' }}
      >
        <AlertTriangle size={14} style={{ color: 'var(--yellow-text)' }} className="mt-0.5 flex-shrink-0" />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--yellow-text)' }}>
          This feature requires an <span className="font-semibold">Enterprise plan</span>. Upgrade to configure SSO for your organization.
        </p>
      </div>

      <div>
        <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>Identity Provider</label>
        <div className="grid grid-cols-2 gap-2">
          {SSO_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={cn('px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all cursor-pointer', 'hover:bg-black/[0.03]')}
              style={{
                border: selectedProvider === p.id ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
                background: selectedProvider === p.id ? 'var(--accent-light)' : undefined,
                color: selectedProvider === p.id ? 'var(--accent)' : 'var(--text-primary)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Entity ID</label>
          <input
            type="text"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="https://your-idp.com/entity"
            className="w-full h-9 px-3 rounded-xl text-xs bg-transparent outline-none"
            style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>SSO URL</label>
          <input
            type="text"
            value={ssoUrl}
            onChange={(e) => setSsoUrl(e.target.value)}
            placeholder="https://your-idp.com/sso/saml"
            className="w-full h-9 px-3 rounded-xl text-xs bg-transparent outline-none"
            style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Certificate</label>
          <textarea
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
            placeholder="Paste your X.509 certificate..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-xs bg-transparent outline-none resize-none"
            style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Status</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Not configured</p>
        </div>
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--text-tertiary)' }}
        />
      </div>
    </div>
  );
}

function OrgTab() {
  const [orgName, setOrgName] = useState('My Organization');
  const [defaultRole, setDefaultRole] = useState('Viewer');
  const [requireSSO, setRequireSSO] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Organization Name</label>
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="w-full h-9 px-3 rounded-xl text-xs bg-transparent outline-none"
          style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
        />
      </div>

      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Default Role for New Members</label>
        <div className="relative">
          <select
            value={defaultRole}
            onChange={(e) => setDefaultRole(e.target.value)}
            className="w-full appearance-none h-9 px-3 pr-8 rounded-xl text-xs bg-transparent outline-none cursor-pointer"
            style={{ border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </div>

      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.015)' }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Require SSO for all members</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Members must authenticate via SSO</p>
        </div>
        <button
          onClick={() => setRequireSSO(!requireSSO)}
          className="w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
          style={{ background: requireSSO ? 'var(--accent)' : 'rgba(0,0,0,0.12)' }}
        >
          <div
            className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
            style={{ transform: requireSSO ? 'translateX(17px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold">4</span> members in your organization
          </p>
        </div>
      </div>
    </div>
  );
}
