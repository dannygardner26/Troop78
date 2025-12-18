import { create } from 'zustand';
import { UserRole, User, mockUsers } from '@/data/mock-db';

interface AppState {
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  isTerminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  syncProgress: number;
  setSyncProgress: (progress: number) => void;
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  currentUser: mockUsers.find(user => user.role === 'scoutmaster') || null,
  currentRole: 'scoutmaster',
  setCurrentUser: (user) => set({ currentUser: user, currentRole: user.role }),
  switchRole: (role) => {
    const user = mockUsers.find(user => user.role === role);
    if (user) {
      set({ currentUser: user, currentRole: role });
    }
  },
  isTerminalOpen: false,
  setTerminalOpen: (open) => set({ isTerminalOpen: open }),
  syncProgress: 0,
  setSyncProgress: (progress) => set({ syncProgress: progress }),
  isSyncing: false,
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}));