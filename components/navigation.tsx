'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { RoleSwitcher } from '@/components/role-switcher';
import { Button } from '@/components/ui/button';
import {
  Search,
  Shield,
  Camera,
  Map,
  FileText,
  Radio,
  Users,
  Newspaper,
  Menu,
  X,
  Command
} from 'lucide-react';

export function Navigation() {
  const { currentRole, setSearchOpen, setTerminalOpen } = useAppStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [setSearchOpen]);

  if (!mounted) return null;

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', icon: Shield },
      { href: '/photos', label: 'Photos', icon: Camera },
      { href: '/trips', label: 'Trips', icon: Map },
      { href: '/newsletters', label: 'Newsletters', icon: Newspaper },
    ];

    // Add Documents for all roles
    baseItems.push({ href: '/documents', label: 'Documents', icon: FileText });

    // Add Roster for scoutmaster, spl, patrol_leader
    if (['scoutmaster', 'admin', 'spl', 'aspl', 'patrol_leader'].includes(currentRole)) {
      baseItems.splice(3, 0, { href: '/roster', label: 'Roster', icon: Users });
    }

    // Add Communication for scoutmaster and spl
    if (['scoutmaster', 'admin', 'spl'].includes(currentRole)) {
      baseItems.push({ href: '/communication', label: 'Blast', icon: Radio });
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  return (
    <nav className="sticky top-0 z-50 nav-dark">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-900 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">Troop 78</span>
              <span className="text-xs text-slate-400">Est. 1978</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Search</span>
              <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-slate-600 bg-slate-800 px-1.5 text-xs text-slate-400">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>

            {/* Role Switcher */}
            <div className="hidden md:block">
              <RoleSwitcher />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <RoleSwitcher />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}