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

// PRIVACY ENGINE - Role-based permission helpers
export const canViewPhoneNumber = (viewerRole: UserRole, targetPatrol?: string, viewerPatrol?: string): boolean => {
  if (viewerRole === 'scoutmaster' || viewerRole === 'admin') return true;
  if (viewerRole === 'spl' || viewerRole === 'aspl') return true;
  if (viewerRole === 'patrol_leader' && targetPatrol === viewerPatrol) return true;
  return false;
};

export const canViewAddress = (viewerRole: UserRole): boolean => {
  return viewerRole === 'scoutmaster' || viewerRole === 'admin';
};

export const canViewMedicalStatus = (viewerRole: UserRole): boolean => {
  return viewerRole === 'scoutmaster' || viewerRole === 'admin';
};

export const canSendBlast = (role: UserRole): boolean => {
  return role === 'scoutmaster' || role === 'admin' || role === 'spl';
};

export const canSendEmergencyBlast = (role: UserRole): boolean => {
  return role === 'scoutmaster' || role === 'admin';
};

export const canEditRoster = (role: UserRole): boolean => {
  return role === 'scoutmaster' || role === 'admin';
};

export const canApproveDocuments = (role: UserRole): boolean => {
  return role === 'scoutmaster' || role === 'admin';
};

// Mask sensitive data for display
export const maskPhone = (phone: string): string => '***-***-****';
export const maskAddress = (address: string): string => '*** (Hidden)';

// Role display helpers
export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: 'Administrator',
    scoutmaster: 'Scoutmaster',
    spl: 'Senior Patrol Leader',
    aspl: 'Assistant SPL',
    patrol_leader: 'Patrol Leader',
    parent: 'Parent',
    scout: 'Scout',
    guest: 'Prospective / Guest'
  };
  return labels[role] || role;
};

export const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    admin: 'bg-red-900 text-white',
    scoutmaster: 'bg-red-900 text-white',
    spl: 'bg-amber-500 text-black',
    aspl: 'bg-amber-400 text-black',
    patrol_leader: 'bg-blue-600 text-white',
    parent: 'bg-green-600 text-white',
    scout: 'bg-slate-600 text-white',
    guest: 'bg-gray-400 text-black'
  };
  return colors[role] || 'bg-slate-500 text-white';
};