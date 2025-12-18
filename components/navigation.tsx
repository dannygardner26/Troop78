'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { mockUsers } from '@/data/mock-db';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Search,
  Shield,
  Users,
  Camera,
  Map,
  FileText,
  Radio,
  User,
  ChevronDown,
  Terminal
} from 'lucide-react';

export function Navigation() {
  const {
    currentUser,
    currentRole,
    switchRole,
    setSearchOpen,
    setTerminalOpen
  } = useAppStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!mounted) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'scoutmaster': return 'Scoutmaster';
      case 'spl': return 'Senior Patrol Leader';
      case 'patrol_leader': return 'Patrol Leader';
      case 'parent': return 'Parent';
      case 'scout': return 'Scout';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'scoutmaster': return 'bg-troop-maroon text-white';
      case 'spl': return 'bg-troop-gold text-black';
      case 'patrol_leader': return 'bg-blue-600 text-white';
      case 'parent': return 'bg-green-600 text-white';
      case 'scout': return 'bg-gray-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', icon: Shield },
      { href: '/archive', label: 'Photo Archive', icon: Camera },
      { href: '/trips', label: 'Trips', icon: Map },
      { href: '/newsletters', label: 'Newsletters', icon: FileText },
    ];

    if (currentRole === 'scoutmaster') {
      baseItems.splice(2, 0, { href: '/roster', label: 'Scout Roster', icon: Users });
    }

    if (currentRole === 'spl' || currentRole === 'scoutmaster') {
      baseItems.push({ href: '/blast', label: 'Communication', icon: Radio });
    }

    return baseItems;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-troop-maroon" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white">Troop 78</span>
                  <span className="text-xs text-gray-400">Est. 1978</span>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                {getNavigationItems().map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="text-gray-300 hover:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Search</span>
                <span className="ml-2 text-xs text-gray-500">⌘K</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTerminalOpen(true)}
                className="text-gray-300 hover:text-white"
              >
                <Terminal className="h-4 w-4" />
              </Button>

              {/* Dev Role Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-white">
                        {currentUser?.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(currentRole)}`}>
                        {getRoleLabel(currentRole)}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Switch Role (Dev)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {mockUsers.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => switchRole(user.role)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}