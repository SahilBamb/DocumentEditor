import { create } from 'zustand';
import type { RightPanelTab, SelectionRange } from '@/types';

export interface ChatAttachment {
  type: 'file' | 'text';
  id: string;
  label: string;
  content: string;
}

interface UIState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  commandPaletteOpen: boolean;
  searchReplaceOpen: boolean;
  currentSelection: SelectionRange | null;
  showInlineDiff: boolean;
  highlightedChangeItemId: string | null;
  compareModalOpen: boolean;
  compareInitialLeftId: string | null;
  compareInitialRightId: string | null;
  settingsModalOpen: boolean;
  auditExportOpen: boolean;
  chatAttachments: ChatAttachment[];

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSearchReplaceOpen: (open: boolean) => void;
  setCurrentSelection: (selection: SelectionRange | null) => void;
  setShowInlineDiff: (show: boolean) => void;
  setHighlightedChangeItemId: (id: string | null) => void;
  setCompareModalOpen: (open: boolean) => void;
  openCompareModal: (leftId?: string, rightId?: string) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setAuditExportOpen: (open: boolean) => void;
  addChatAttachment: (attachment: ChatAttachment) => void;
  removeChatAttachment: (id: string) => void;
  clearChatAttachments: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  rightPanelTab: 'chat',
  commandPaletteOpen: false,
  searchReplaceOpen: false,
  currentSelection: null,
  showInlineDiff: true,
  highlightedChangeItemId: null,
  compareModalOpen: false,
  compareInitialLeftId: null,
  compareInitialRightId: null,
  settingsModalOpen: false,
  auditExportOpen: false,
  chatAttachments: [],

  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab, rightPanelOpen: true }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setSearchReplaceOpen: (open) => set({ searchReplaceOpen: open }),
  setCurrentSelection: (selection) => set({ currentSelection: selection }),
  setShowInlineDiff: (show) => set({ showInlineDiff: show }),
  setHighlightedChangeItemId: (id) => set({ highlightedChangeItemId: id }),
  setCompareModalOpen: (open) => set({ compareModalOpen: open }),
  openCompareModal: (leftId, rightId) =>
    set({ compareModalOpen: true, compareInitialLeftId: leftId ?? null, compareInitialRightId: rightId ?? null }),
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
  setAuditExportOpen: (open) => set({ auditExportOpen: open }),
  addChatAttachment: (attachment) =>
    set((state) => {
      if (state.chatAttachments.some((a) => a.id === attachment.id)) return state;
      return { chatAttachments: [...state.chatAttachments, attachment] };
    }),
  removeChatAttachment: (id) =>
    set((state) => ({ chatAttachments: state.chatAttachments.filter((a) => a.id !== id) })),
  clearChatAttachments: () => set({ chatAttachments: [] }),
}));
