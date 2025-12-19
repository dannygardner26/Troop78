'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { searchContent } from '@/data/mock-db';
import {
  Search,
  User,
  Camera,
  Mountain,
  FileText,
  ArrowRight,
  Clock,
  Star,
  MapPin,
  Calendar,
  Command,
  Hash
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'scout' | 'photo' | 'trip';
  title: string;
  subtitle: string;
  description?: string;
  icon: any;
  url: string;
}

export function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock recent searches
  useEffect(() => {
    setRecentSearches(['Eagle Scout', 'Winter Camp', 'Switzerland', 'Danny']);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Handle search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchResults = searchContent(query);
    const formattedResults: SearchResult[] = searchResults.map(result => {
      let icon = User;
      let url = '/';

      switch (result.type) {
        case 'scout':
          icon = User;
          url = `/roster`;
          break;
        case 'trip':
          icon = Mountain;
          url = `/trips`;
          break;
        case 'photo':
          icon = Camera;
          url = `/photos`;
          break;
      }

      return {
        id: result.id,
        type: result.type,
        title: result.title,
        subtitle: result.subtitle,
        description: result.description,
        icon,
        url
      };
    });

    setResults(formattedResults.slice(0, 8));
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSearchOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, results, selectedIndex, setSearchOpen]);

  const handleResultSelect = (result: SearchResult) => {
    setRecentSearches(prev => {
      const newRecent = [query, ...prev.filter(s => s !== query)].slice(0, 4);
      return newRecent;
    });

    setSearchOpen(false);
    setQuery('');

    // In production, use router.push(result.url)
    window.location.href = result.url;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scout': return 'text-blue-600 bg-blue-50';
      case 'trip': return 'text-green-600 bg-green-50';
      case 'photo': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const quickActions = [
    { label: 'View Photos', icon: Camera, url: '/photos' },
    { label: 'Upcoming Trips', icon: Mountain, url: '/trips' },
    { label: 'Scout Roster', icon: User, url: '/roster' },
    { label: 'Newsletters', icon: FileText, url: '/newsletters' },
  ];

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white border-slate-200">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search scouts, photos, trips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-lg"
          />
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <div className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
              <Command className="h-3 w-3" />
            </div>
            <span>K</span>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-4 space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Recent Searches</span>
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search) => (
                      <Button
                        key={search}
                        variant="ghost"
                        className="w-full justify-start text-left text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        onClick={() => setQuery(search)}
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Quick Actions</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className="justify-start text-left text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-auto p-3"
                      onClick={() => window.location.href = action.url}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              <AnimatePresence>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-left p-3 h-auto ${
                        selectedIndex === index
                          ? 'bg-red-50 border border-red-200'
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => handleResultSelect(result)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                          <result.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-900 truncate">{result.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                              {result.type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
                          {result.description && (
                            <p className="text-xs text-slate-400 truncate mt-1">{result.description}</p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-2">No results found</p>
              <p className="text-sm text-slate-400">
                Try searching for scouts, trips, or photos
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">↑</div>
                <div className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">↓</div>
                <span>navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">↵</div>
                <span>select</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">esc</div>
                <span>close</span>
              </div>
            </div>
            <span>Global Search</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
