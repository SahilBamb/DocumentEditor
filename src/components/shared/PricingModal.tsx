'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Key, Crown, ExternalLink, Loader2 } from 'lucide-react';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useAPIKeyStore } from '@/stores/api-key-store';
import { GlassButton } from '@/components/shared/GlassButton';

const FREE_FEATURES = [
  'Full document editor',
  'Version history',
  'File organization',
  'Bring your own API key',
  'All AI providers supported',
];

const PRO_FEATURES = [
  'Everything in Free',
  'AI included — no API key needed',
  'Powered by GPT-4o',
  'Unlimited AI edits',
  'Priority support',
];

export function PricingModal() {
  const pricingOpen = useSubscriptionStore((s) => s.pricingOpen);
  const setPricingOpen = useSubscriptionStore((s) => s.setPricingOpen);

  return (
    <AnimatePresence>
      {pricingOpen && <PricingModalInner onClose={() => setPricingOpen(false)} />}
    </AnimatePresence>
  );
}

function PricingModalInner({ onClose }: { onClose: () => void }) {
  const customerId = useSubscriptionStore((s) => s.customerId);
  const isProUser = useSubscriptionStore((s) => s.isProUser);
  const plan = useSubscriptionStore((s) => s.plan);
  const setSettingsOpen = useAPIKeyStore((s) => s.setSettingsOpen);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout');
        setCheckoutLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open portal');
        setPortalLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setPortalLoading(false);
    }
  };

  const handleSetupKey = () => {
    onClose();
    setSettingsOpen(true);
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
        className="fixed top-[8%] left-1/2 -translate-x-1/2 z-50 w-[640px] max-w-[calc(100vw-32px)] glass-strong shadow-float rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Choose your plan
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {isProUser
                  ? `You're on the ${plan || 'Pro'} plan`
                  : 'Free forever, or upgrade for built-in AI'}
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

        {/* Plans */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free Tier */}
          <div
            className="rounded-xl p-5 flex flex-col"
            style={{
              border: !isProUser ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
              background: !isProUser ? 'var(--accent-light)' : 'rgba(0,0,0,0.015)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Key size={16} style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Free
              </h3>
              {!isProUser && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  Current
                </span>
              )}
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                $0
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                /month
              </span>
            </div>
            <ul className="space-y-2 flex-1 mb-4">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--green-text)' }} />
                  {f}
                </li>
              ))}
            </ul>
            {!isProUser && (
              <GlassButton size="md" variant="glass" className="w-full justify-center" onClick={handleSetupKey}>
                <Key size={13} />
                Set up API key
              </GlassButton>
            )}
          </div>

          {/* Pro Tier */}
          <div
            className="rounded-xl p-5 flex flex-col relative overflow-hidden"
            style={{
              border: isProUser ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
              background: isProUser
                ? 'var(--accent-light)'
                : 'linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(139,92,246,0.04) 100%)',
            }}
          >
            {!isProUser && (
              <div
                className="absolute top-0 right-0 text-[10px] font-semibold px-3 py-1 rounded-bl-lg text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
              >
                Recommended
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} style={{ color: '#8b5cf6' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Pro
              </h3>
              {isProUser && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  Active
                </span>
              )}
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                $12
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                /month
              </span>
            </div>
            <ul className="space-y-2 flex-1 mb-4">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#8b5cf6' }} />
                  {f}
                </li>
              ))}
            </ul>
            {isProUser ? (
              <GlassButton
                size="md"
                variant="glass"
                className="w-full justify-center"
                onClick={handleManage}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <ExternalLink size={13} />
                    Manage subscription
                  </>
                )}
              </GlassButton>
            ) : (
              <GlassButton
                size="md"
                variant="accent"
                className="w-full justify-center"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Zap size={13} />
                    Upgrade to Pro
                  </>
                )}
              </GlassButton>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-3">
            <p className="text-xs text-center" style={{ color: 'var(--red-text)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="px-6 py-3 text-center"
          style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.015)' }}
        >
          <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Payments secured by Stripe. Cancel anytime from the billing portal.
          </p>
        </div>
      </motion.div>
    </>
  );
}
