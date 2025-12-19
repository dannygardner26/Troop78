'use client';

import { useState, useEffect } from 'react';
import { useAppStore, getRoleLabel, getRoleBadgeColor } from '@/lib/store';
import { mockUsers, UserRole } from '@/data/mock-db';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Eye, Shield, Users, User, Star, UserX } from 'lucide-react';

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  scoutmaster: <Shield className="h-4 w-4" />,
  spl: <Star className="h-4 w-4" />,
  aspl: <Star className="h-4 w-4" />,
  patrol_leader: <Users className="h-4 w-4" />,
  parent: <User className="h-4 w-4" />,
  scout: <User className="h-4 w-4" />,
  guest: <UserX className="h-4 w-4" />,
};

// Available roles for the dev switcher (in order of permission level)
const switchableRoles: UserRole[] = ['scoutmaster', 'spl', 'patrol_leader', 'parent', 'scout', 'guest'];

export function RoleSwitcher() {
  const { currentUser, currentRole, switchRole } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
        <Eye className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-300">View As:</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(currentRole)}`}>
          {getRoleLabel(currentRole)}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white border border-slate-200 shadow-lg">
        <DropdownMenuLabel className="text-slate-500 text-xs uppercase tracking-wide">
          DevTools - Switch Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />
        {switchableRoles.map((role) => {
          const user = mockUsers.find(u => u.role === role);
          if (!user) return null;

          const isActive = currentRole === role;

          return (
            <DropdownMenuItem
              key={role}
              onClick={() => switchRole(role)}
              className={`flex items-center justify-between cursor-pointer ${
                isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-600">{roleIcons[role]}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">{user.name}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(role)}`}>
                {getRoleLabel(role)}
              </span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-slate-200" />
        <div className="px-2 py-2 text-xs text-slate-400">
          Permissions update instantly when role changes
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}