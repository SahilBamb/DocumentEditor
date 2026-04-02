import { create } from 'zustand';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq';

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  placeholder: string;
  prefix: string;
  docsUrl: string;
  models: string[];
  defaultModel: string;
  color: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4.1, o3-mini',
    placeholder: 'sk-...',
    prefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o3-mini'],
    defaultModel: 'gpt-4o',
    color: '#10a37f',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 4 Sonnet, Claude 3.5',
    placeholder: 'sk-ant-...',
    prefix: 'sk-ant-',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    defaultModel: 'claude-sonnet-4-20250514',
    color: '#d97706',
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini 2.5 Pro, Gemini 2.5 Flash',
    placeholder: 'AIza...',
    prefix: 'AIza',
    docsUrl: 'https://aistudio.google.com/apikey',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    defaultModel: 'gemini-2.5-flash',
    color: '#4285f4',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral Large, Medium, Small',
    placeholder: '',
    prefix: '',
    docsUrl: 'https://console.mistral.ai/api-keys',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    defaultModel: 'mistral-large-latest',
    color: '#ff7000',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Llama 3.3 70B, Mixtral',
    placeholder: 'gsk_...',
    prefix: 'gsk_',
    docsUrl: 'https://console.groq.com/keys',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'llama-3.1-8b-instant'],
    defaultModel: 'llama-3.3-70b-versatile',
    color: '#f55036',
  },
];

interface APIKeyState {
  provider: AIProvider | null;
  apiKey: string;
  model: string;
  settingsOpen: boolean;
  isConfigured: boolean;

  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setSettingsOpen: (open: boolean) => void;
  saveSettings: () => void;
  clearSettings: () => void;
  loadFromStorage: () => void;
  getProviderConfig: () => ProviderConfig | undefined;
}

const STORAGE_KEY = 'doc-editor-ai-settings';

function loadStored(): { provider: AIProvider | null; apiKey: string; model: string } {
  if (typeof window === 'undefined') return { provider: null, apiKey: '', model: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { provider: null, apiKey: '', model: '' };
}

export const useAPIKeyStore = create<APIKeyState>((set, get) => ({
  provider: null,
  apiKey: '',
  model: '',
  settingsOpen: false,
  isConfigured: false,

  setProvider: (provider) => {
    const config = PROVIDERS.find((p) => p.id === provider);
    set({ provider, model: config?.defaultModel ?? '' });
  },

  setApiKey: (apiKey) => set({ apiKey }),
  setModel: (model) => set({ model }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  saveSettings: () => {
    const { provider, apiKey, model } = get();
    if (provider && apiKey) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, apiKey, model }));
      set({ isConfigured: true, settingsOpen: false });
    }
  },

  clearSettings: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ provider: null, apiKey: '', model: '', isConfigured: false });
  },

  loadFromStorage: () => {
    const stored = loadStored();
    if (stored.provider && stored.apiKey) {
      set({ ...stored, isConfigured: true });
    }
  },

  getProviderConfig: () => {
    const { provider } = get();
    return PROVIDERS.find((p) => p.id === provider) ?? undefined;
  },
}));
