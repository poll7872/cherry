import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  activeTab: 'files' | 'chat' | 'settings';
  editorMode: boolean;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'files' | 'chat' | 'settings') => void;
  setEditorMode: (mode: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      activeTab: 'chat',
      editorMode: false,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setEditorMode: (mode) => set({ editorMode: mode }),
    }),
    {
      name: 'zenith-ui-storage',
    }
  )
);
