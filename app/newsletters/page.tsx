'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockNewsletters, Newsletter, searchNewsletters } from '@/data/mock-db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Newspaper,
  Search,
  Calendar,
  Download,
  Eye,
  Sparkles,
  FileText,
  ChevronRight,
  X,
  Zap
} from 'lucide-react';

export default function NewslettersPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Search and filter newsletters
  const filteredNewsletters = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockNewsletters;
    }
    return searchNewsletters(searchQuery);
  }, [searchQuery]);

  // Highlight matched text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Get relevant excerpt with highlighted matches
  const getMatchedExcerpt = (newsletter: Newsletter, query: string) => {
    if (!query.trim()) return newsletter.excerpt;

    const searchContent = newsletter.searchableContent.toLowerCase();
    const queryLower = query.toLowerCase();
    const index = searchContent.indexOf(queryLower);

    if (index === -1) return newsletter.excerpt;

    // Get surrounding context
    const start = Math.max(0, index - 50);
    const end = Math.min(searchContent.length, index + query.length + 50);
    let excerpt = newsletter.searchableContent.slice(start, end);

    if (start > 0) excerpt = '...' + excerpt;
    if (end < newsletter.searchableContent.length) excerpt = excerpt + '...';

    return excerpt;
  };

  // Group newsletters by year
  const newslettersByYear = useMemo(() => {
    const grouped: Record<string, Newsletter[]> = {};
    filteredNewsletters.forEach(nl => {
      if (!grouped[nl.year]) {
        grouped[nl.year] = [];
      }
      grouped[nl.year].push(nl);
    });
    return grouped;
  }, [filteredNewsletters]);

  const years = Object.keys(newslettersByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-red-900" />
                Newsletter Archive
              </h1>
              <p className="text-slate-500 mt-1">
                {mockNewsletters.length} newsletters · AI-powered OCR search
              </p>
            </div>

            {/* AI Badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">AI OCR Search Enabled</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search newsletter content... (try 'Eagle Scout', 'Switzerland', 'camping')"
              className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="mt-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-slate-600">
                Found <span className="font-semibold text-purple-600">{filteredNewsletters.length}</span> newsletters matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results by Year */}
        {filteredNewsletters.length > 0 ? (
          <div className="space-y-12">
            {years.map(year => (
              <section key={year}>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-900" />
                  {year}
                  <span className="text-sm font-normal text-slate-500">
                    ({newslettersByYear[year].length} newsletter{newslettersByYear[year].length !== 1 ? 's' : ''})
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newslettersByYear[year].map((newsletter, index) => (
                    <motion.div
                      key={newsletter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Polaroid Style Card */}
                      <div
                        className="bg-white p-3 shadow-lg border border-slate-200 rounded-sm hover:shadow-xl transition-shadow cursor-pointer group"
                        style={{ transform: `rotate(${(index % 3 - 1) * 1}deg)` }}
                        onClick={() => {
                          setSelectedNewsletter(newsletter);
                          setPreviewOpen(true);
                        }}
                      >
                        {/* Newsletter Thumbnail */}
                        <div className="relative aspect-[8.5/11] bg-slate-100 overflow-hidden">
                          <img
                            src={newsletter.thumbnailUrl}
                            alt={newsletter.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* AI Scan Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex items-center gap-1 text-white text-xs">
                                <Sparkles className="h-3 w-3" />
                                <span>AI OCR Indexed</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Polaroid Caption */}
                        <div className="pt-3 pb-1">
                          <p className="font-medium text-slate-900 text-sm truncate">
                            {highlightText(newsletter.title, searchQuery)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{newsletter.month} {newsletter.year}</p>

                          {/* Matched Content Preview */}
                          {searchQuery && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-slate-600 border border-yellow-100">
                              <p className="line-clamp-2">
                                {highlightText(getMatchedExcerpt(newsletter, searchQuery), searchQuery)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Newspaper className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No newsletters found</h3>
            <p className="text-slate-500 mb-4">
              No newsletters match your search for "{searchQuery}"
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Newsletter Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedNewsletter && (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-900 flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-red-900" />
                  {selectedNewsletter.title}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                {/* Newsletter Preview Image */}
                <div className="relative aspect-[8.5/11] bg-slate-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedNewsletter.thumbnailUrl}
                    alt={selectedNewsletter.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Newsletter Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedNewsletter.month} {selectedNewsletter.year}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Excerpt</h4>
                    <p className="text-slate-600">{selectedNewsletter.excerpt}</p>
                  </div>

                  {/* AI-Extracted Content */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-purple-900">AI-Extracted Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedNewsletter.searchableContent.split(' ').slice(0, 15).map((word, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white text-purple-700 text-xs rounded-full border border-purple-200"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full PDF
                  </Button>
                  <Button className="troop-button-primary">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
