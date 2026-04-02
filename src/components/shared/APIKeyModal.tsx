'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Key,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronDown,
  Trash2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAPIKeyStore, PROVIDERS, type AIProvider, type ProviderConfig } from '@/stores/api-key-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { GlassButton } from '@/components/shared/GlassButton';
import { cn } from '@/lib/utils';

export function APIKeyModal() {
  const settingsOpen = useAPIKeyStore((s) => s.settingsOpen);
  const setSettingsOpen = useAPIKeyStore((s) => s.setSettingsOpen);

  return (
    <AnimatePresence>
      {settingsOpen && <APIKeyModalInner onClose={() => setSettingsOpen(false)} />}
    </AnimatePresence>
  );
}

function APIKeyModalInner({ onClose }: { onClose: () => void }) {
  const provider = useAPIKeyStore((s) => s.provider);
  const apiKey = useAPIKeyStore((s) => s.apiKey);
  const model = useAPIKeyStore((s) => s.model);
  const isConfigured = useAPIKeyStore((s) => s.isConfigured);
  const setProvider = useAPIKeyStore((s) => s.setProvider);
  const setApiKey = useAPIKeyStore((s) => s.setApiKey);
  const setModel = useAPIKeyStore((s) => s.setModel);
  const saveSettings = useAPIKeyStore((s) => s.saveSettings);
  const clearSettings = useAPIKeyStore((s) => s.clearSettings);

  const isProUser = useSubscriptionStore((s) => s.isProUser);
  const plan = useSubscriptionStore((s) => s.plan);
  const setPricingOpen = useSubscriptionStore((s) => s.setPricingOpen);

  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentConfig = PROVIDERS.find((p) => p.id === provider);

  useEffect(() => {
    if (provider && inputRef.current) {
      inputRef.current.focus();
    }
  }, [provider]);

  useEffect(() => {
    setValidationResult(null);
  }, [apiKey, provider]);

  const handleValidate = async () => {
    if (!apiKey || !provider) return;
    setValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, model }),
      });
      setValidationResult(res.ok ? 'success' : 'error');
    } catch {
      setValidationResult('error');
    }
    setValidating(false);
  };

  const handleSave = () => {
    saveSettings();
    onClose();
  };

  const maskedKey = apiKey
    ? apiKey.slice(0, 7) + '•'.repeat(Math.max(0, apiKey.length - 11)) + apiKey.slice(-4)
    : '';

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
        className="fixed top-[12%] left-1/2 -translate-x-1/2 z-50 w-[520px] glass-strong shadow-float rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-light)' }}
            >
              <Key size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                AI Provider Settings
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Connect your API key to enable AI editing
              </p>
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

        {/* Pro Status or Upsell */}
        {isProUser ? (
          <div
            className="mx-6 mt-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
            >
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {plan || 'Pro'} plan active
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                AI is included — no API key needed. You can still add your own key below for a different provider.
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { onClose(); setPricingOpen(true); }}
            className="mx-6 mt-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl w-[calc(100%-48px)] text-left transition-all hover:scale-[1.005] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
            >
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                Upgrade to Pro — $12/mo
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Skip the API key — get unlimited AI edits powered by GPT-4o.
              </p>
            </div>
            <ExternalLink size={13} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
          </button>
        )}

        {/* Divider */}
        {!isProUser && (
          <div className="px-6 pt-2 pb-1">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border-glass)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                or bring your own key
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-glass)' }} />
            </div>
          </div>
        )}

        {/* Provider Selection */}
        <div className="px-6 pt-5 pb-3">
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
            Provider
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PROVIDERS.map((p) => (
              <ProviderCard
                key={p.id}
                config={p}
                selected={provider === p.id}
                onClick={() => setProvider(p.id)}
              />
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              API Key
            </label>
            {currentConfig && (
              <a
                href={currentConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent)' }}
              >
                Get a key
                <ExternalLink size={10} />
              </a>
            )}
          </div>
          <div
            className="flex items-center rounded-xl h-10 px-3 gap-2 transition-all"
            style={{
              background: 'rgba(0,0,0,0.03)',
              border: validationResult === 'error'
                ? '1.5px solid var(--red-border)'
                : validationResult === 'success'
                  ? '1.5px solid var(--green-border)'
                  : '1px solid var(--border-glass)',
            }}
          >
            <Key size={14} style={{ color: 'var(--text-tertiary)' }} className="flex-shrink-0" />
            <input
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={currentConfig?.placeholder || 'Paste your API key...'}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/[0.05] transition-colors cursor-pointer"
              style={{ color: 'var(--text-tertiary)' }}
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {validationResult === 'success' && (
              <Check size={14} style={{ color: 'var(--green-text)' }} className="flex-shrink-0" />
            )}
          </div>

          {validationResult === 'error' && (
            <p className="text-xs mt-1.5 fade-in" style={{ color: 'var(--red-text)' }}>
              Could not validate this key. Check that it&apos;s correct and has the right permissions.
            </p>
          )}
          {validationResult === 'success' && (
            <p className="text-xs mt-1.5 fade-in" style={{ color: 'var(--green-text)' }}>
              Key validated successfully.
            </p>
          )}
        </div>

        {/* Model Selection */}
        {currentConfig && (
          <div className="px-6 pb-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Model
            </label>
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="w-full flex items-center justify-between h-10 px-3 rounded-xl text-sm transition-colors cursor-pointer"
                style={{
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {model || currentConfig.defaultModel}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
              </button>

              <AnimatePresence>
                {modelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-11 left-0 right-0 z-10 glass-strong shadow-float rounded-xl py-1 overflow-hidden"
                  >
                    {currentConfig.models.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setModel(m);
                          setModelDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer flex items-center justify-between',
                          'hover:bg-black/[0.04]',
                        )}
                        style={{
                          color: model === m ? 'var(--accent)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px',
                        }}
                      >
                        {m}
                        {model === m && <Check size={13} style={{ color: 'var(--accent)' }} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="px-6 pb-4">
          <div
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.02)' }}
          >
            <Shield size={14} style={{ color: 'var(--text-tertiary)' }} className="mt-0.5 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              Your key is stored locally in your browser and sent directly to the provider API.
              It never touches our servers.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.015)' }}
        >
          <div>
            {isConfigured && (
              <GlassButton
                size="sm"
                variant="ghost"
                icon={<Trash2 size={13} />}
                onClick={() => {
                  clearSettings();
                  onClose();
                }}
                style={{ color: 'var(--red-text)' } as React.CSSProperties}
              >
                Remove key
              </GlassButton>
            )}
          </div>
          <div className="flex items-center gap-2">
            <GlassButton
              size="md"
              variant="glass"
              onClick={handleValidate}
              disabled={!apiKey || !provider || validating}
            >
              {validating ? 'Validating...' : 'Test connection'}
            </GlassButton>
            <GlassButton
              size="md"
              variant="accent"
              icon={<Sparkles size={14} />}
              onClick={handleSave}
              disabled={!apiKey || !provider}
            >
              Save & enable AI
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function ProviderCard({
  config,
  selected,
  onClick,
}: {
  config: ProviderConfig;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all cursor-pointer',
        'hover:bg-black/[0.03]',
      )}
      style={{
        border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
        background: selected ? 'var(--accent-light)' : undefined,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
        style={{ background: config.color }}
      >
        {config.name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p
          className="text-[11px] font-semibold leading-tight"
          style={{ color: selected ? 'var(--accent)' : 'var(--text-primary)' }}
        >
          {config.name}
        </p>
        <p className="text-[9px] leading-tight mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {config.description.split(',')[0]}
        </p>
      </div>
    </button>
  );
}
