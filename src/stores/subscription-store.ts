import { create } from 'zustand';

interface SubscriptionState {
  customerId: string | null;
  isProUser: boolean;
  plan: string | null;
  loading: boolean;
  pricingOpen: boolean;

  setPricingOpen: (open: boolean) => void;
  setCustomerId: (id: string) => void;
  clearSubscription: () => void;
  loadSubscription: () => Promise<void>;
}

const STORAGE_KEY = 'doc-editor-stripe-customer';

function loadStoredCustomerId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  customerId: null,
  isProUser: false,
  plan: null,
  loading: false,
  pricingOpen: false,

  setPricingOpen: (open) => set({ pricingOpen: open }),

  setCustomerId: (id) => {
    localStorage.setItem(STORAGE_KEY, id);
    set({ customerId: id });
  },

  clearSubscription: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ customerId: null, isProUser: false, plan: null });
  },

  loadSubscription: async () => {
    const stored = loadStoredCustomerId();
    if (!stored) {
      set({ customerId: null, isProUser: false, plan: null, loading: false });
      return;
    }

    set({ customerId: stored, loading: true });

    try {
      const res = await fetch('/api/stripe/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: stored }),
      });

      if (!res.ok) {
        set({ isProUser: false, plan: null, loading: false });
        return;
      }

      const data = await res.json();
      set({
        isProUser: data.active === true,
        plan: data.plan ?? null,
        loading: false,
      });
    } catch {
      set({ isProUser: false, plan: null, loading: false });
    }
  },
}));
