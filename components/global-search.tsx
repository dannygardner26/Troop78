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
  type: 'scout' | 'photo' | 'trip' | 'newsletter';
  title: string;
  subtitle: string;
  description?: string;
  icon: any;
  url: string;
  metadata?: {
    date?: string;
    location?: string;
    tags?: string[];
  };
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
    const formattedResults: SearchResult[] = [];

    // Add scout results
    searchResults.scouts.forEach(scout => {
      formattedResults.push({
        id: scout.id,
        type: 'scout',
        title: scout.name,
        subtitle: scout.rank,
        description: `Patrol: ${scout.patrolId}`,
        icon: User,
        url: `/scouts/${scout.id}`,
        metadata: {
          date: `Joined: ${new Date(scout.joinDate).toLocaleDateString()}`
        }
      });
    });

    // Add trip results
    searchResults.trips.forEach(trip => {
      formattedResults.push({
        id: trip.id,
        type: 'trip',
        title: trip.name,
        subtitle: trip.location,
        description: trip.description,
        icon: Mountain,
        url: `/trips/${trip.id}`,
        metadata: {
          date: new Date(trip.startDate).toLocaleDateString(),
          location: trip.location
        }
      });
    });

    // Add photo results
    searchResults.photos.forEach(photo => {
      formattedResults.push({
        id: photo.id,
        type: 'photo',
        title: photo.event || 'Untitled Photo',
        subtitle: `${photo.aiTags.length} AI tags`,
        description: photo.aiTags.map(tag => tag.tag).join(', '),
        icon: Camera,
        url: `/archive?photo=${photo.id}`,
        metadata: {
          date: new Date(photo.uploadDate).toLocaleDateString(),
          tags: photo.aiTags.map(tag => tag.tag)
        }
      });
    });

    // Add newsletter results
    searchResults.newsletters.forEach(newsletter => {
      formattedResults.push({
        id: newsletter.id,
        type: 'newsletter',
        title: newsletter.title,
        subtitle: `${newsletter.month} ${newsletter.year}`,
        description: newsletter.summary,
        icon: FileText,
        url: `/newsletters/${newsletter.id}`,
        metadata: {
          date: `${newsletter.month} ${newsletter.year}`
        }
      });
    });

    setResults(formattedResults.slice(0, 8)); // Limit to 8 results
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
    // Add to recent searches
    setRecentSearches(prev => {
      const newRecent = [query, ...prev.filter(s => s !== query)].slice(0, 4);
      return newRecent;
    });

    // Close search and navigate
    setSearchOpen(false);
    setQuery('');

    // In a real app, you would use router.push(result.url)
    console.log('Navigate to:', result.url);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scout': return 'text-blue-400 bg-blue-400/10';
      case 'trip': return 'text-green-400 bg-green-400/10';
      case 'photo': return 'text-purple-400 bg-purple-400/10';
      case 'newsletter': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const quickActions = [
    { label: 'View Archive', icon: Camera, action: () => console.log('Navigate to /archive') },
    { label: 'Upcoming Trips', icon: Mountain, action: () => console.log('Navigate to /trips') },
    { label: 'Scout Roster', icon: User, action: () => console.log('Navigate to /roster') },
    { label: 'Latest Newsletter', icon: FileText, action: () => console.log('Navigate to /newsletters') },
  ];

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-black border-white/20">
        {/* Search Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-white/10">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search scouts, photos, trips, newsletters..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
          />
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <div className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">
              <Command className="h-3 w-3" />
            </div>
            <span>K</span>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            // Empty state with recent searches and quick actions
            <div className="p-4 space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Recent Searches</span>
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={search}
                        variant="ghost"
                        className="w-full justify-start text-left text-gray-300 hover:text-white"
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
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Quick Actions</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className="justify-start text-left text-gray-300 hover:text-white h-auto p-3"
                      onClick={action.action}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            // Search results
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
                          ? 'bg-troop-maroon/20 border border-troop-maroon/30'
                          : 'hover:bg-white/5'
                      }`}
                      onClick={() => handleResultSelect(result)}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                          <result.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-white truncate">{result.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                              {result.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{result.subtitle}</p>
                          {result.description && (
                            <p className="text-xs text-gray-500 truncate mt-1">{result.description}</p>
                          )}
                          {result.metadata && (
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {result.metadata.date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{result.metadata.date}</span>
                                </div>
                              )}
                              {result.metadata.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{result.metadata.location}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            // No results
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No results found</p>
              <p className="text-sm text-gray-500">
                Try searching for scouts, trips, photos, or newsletters
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">↑</div>
                <div className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">↓</div>
                <span>navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">↵</div>
                <span>select</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">esc</div>
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