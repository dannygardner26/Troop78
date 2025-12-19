'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPhotos, mockUsers, mockTrips, Photo } from '@/data/mock-db';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Camera,
  HardDrive,
  Search,
  Check,
  User,
  X,
  RefreshCw,
  Upload,
  Calendar,
  Tag,
  MapPin,
  ChevronDown,
  Image,
  Loader2,
  Plus,
  Sparkles,
  UserPlus
} from 'lucide-react';

// Mock AI tag pool for realistic suggestions
const mockAITagPool = [
  'camping', 'hiking', 'cooking', 'campfire', 'swimming', 'canoeing',
  'rock-climbing', 'archery', 'fishing', 'tent-setup', 'knot-tying',
  'forest', 'lake', 'mountain', 'trail', 'campsite', 'lodge', 'river',
  'merit-badge', 'ceremony', 'eagle-project', 'court-of-honor', 'meeting',
  'flag', 'uniform', 'backpack', 'tent', 'compass', 'rope', 'nature',
  'group-photo', 'activity', 'outdoor', 'adventure', 'teamwork'
];

// Sync log messages for the terminal simulator
const syncMessages = [
  '> Initializing Synology NAS connection...',
  '> Authenticating with DS920+...',
  '> Connection established.',
  '> Scanning /volume1/photos/...',
  '> Found 42,247 files across 847 directories.',
  '> Indexing photos...',
  '> Face Detection running...',
  '> Scene Recognition active...',
  '> Building search index...',
  '> ✓ Success: 14TB Indexed. 42,247 photos processed.',
];

interface AIPhotoResult {
  file: File;
  url: string;
  userTags: string[];
  suggestedTags: string[];
  acceptedTags: string[];
  faces: { scoutId?: string; confidence: number; verified: boolean }[];
}

export default function PhotosPage() {
  const { currentRole } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [photos, setPhotos] = useState(mockPhotos);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Enhanced upload states
  const [uploadStep, setUploadStep] = useState<'select' | 'processing' | 'results'>('select');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [taggedScouts, setTaggedScouts] = useState<string[]>([]);
  const [selectedUploadEvent, setSelectedUploadEvent] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [aiResults, setAiResults] = useState<AIPhotoResult[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get unique events/trips from photos
  const uniqueEvents = useMemo(() => {
    const events = [...new Set(photos.map(p => p.event))];
    return events.sort();
  }, [photos]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach(p => {
      p.aiTags.forEach(t => tags.add(t));
      p.verifiedTags.forEach(t => tags.add(t));
    });
    return [...tags].sort();
  }, [photos]);

  // Get unique years
  const uniqueYears = useMemo(() => {
    const years = [...new Set(photos.map(p => p.date.split('-')[0]))];
    return years.sort((a, b) => Number(b) - Number(a));
  }, [photos]);

  // Get scouts for tagging
  const scouts = mockUsers.filter(u =>
    u.role === 'scout' || u.role === 'spl' || u.role === 'aspl' || u.role === 'patrol_leader'
  );

  // Generate mock AI tags
  const generateMockAITags = (): string[] => {
    const count = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...mockAITagPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Generate mock face detections
  const generateMockFaces = () => {
    const count = Math.floor(Math.random() * 3);
    return Array(count).fill(null).map(() => ({
      scoutId: Math.random() > 0.6 ? ['2', '3', '4', '6'][Math.floor(Math.random() * 4)] : undefined,
      confidence: 0.75 + Math.random() * 0.2,
      verified: false
    }));
  };

  // Run mock AI processing
  const runMockAIProcessing = async () => {
    setUploadStep('processing');
    setProcessingProgress(0);

    const messages = [
      'Uploading photos...',
      'Analyzing images with AI...',
      'Detecting faces...',
      'Generating tags...',
      'Finalizing...'
    ];

    for (let i = 0; i < messages.length; i++) {
      setProcessingMessage(messages[i]);
      setProcessingProgress((i + 1) * 20);
      await new Promise(r => setTimeout(r, 400));
    }

    // Generate results for each photo
    const results: AIPhotoResult[] = uploadedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      userTags: [...customTags],
      suggestedTags: generateMockAITags(),
      acceptedTags: [],
      faces: generateMockFaces()
    }));

    setAiResults(results);
    setUploadStep('results');
  };

  // Accept a suggested tag
  const acceptTag = (photoIndex: number, tag: string) => {
    setAiResults(prev => prev.map((result, idx) => {
      if (idx === photoIndex) {
        return {
          ...result,
          suggestedTags: result.suggestedTags.filter(t => t !== tag),
          acceptedTags: [...result.acceptedTags, tag]
        };
      }
      return result;
    }));
  };

  // Accept all suggestions for all photos
  const acceptAllSuggestions = () => {
    setAiResults(prev => prev.map(result => ({
      ...result,
      acceptedTags: [...result.acceptedTags, ...result.suggestedTags],
      suggestedTags: []
    })));
  };

  // Identify a face as a scout
  const identifyFace = (photoIndex: number, faceIndex: number, scoutId: string) => {
    setAiResults(prev => prev.map((result, idx) => {
      if (idx === photoIndex) {
        const newFaces = [...result.faces];
        newFaces[faceIndex] = { ...newFaces[faceIndex], scoutId, verified: true };
        return { ...result, faces: newFaces };
      }
      return result;
    }));
  };

  // Save photos to gallery
  const saveToGallery = () => {
    const newPhotos: Photo[] = aiResults.map((result, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: result.url,
      thumbnailUrl: result.url,
      date: new Date().toISOString().split('T')[0],
      event: selectedUploadEvent || 'New Upload',
      aiTags: result.suggestedTags,
      verifiedTags: [...result.userTags, ...result.acceptedTags],
      faceDetections: result.faces,
      confidenceScore: 0.85 + Math.random() * 0.1
    }));

    setPhotos(prev => [...newPhotos, ...prev]);
    resetUploadState();
    setUploadModalOpen(false);
  };

  // Reset upload state
  const resetUploadState = () => {
    setUploadedFiles([]);
    setCustomTags([]);
    setTagInput('');
    setTaggedScouts([]);
    setSelectedUploadEvent('');
    setUploadStep('select');
    setAiResults([]);
    setProcessingProgress(0);
    setProcessingMessage('');
  };

  // Add custom tag
  const addCustomTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !customTags.includes(tag)) {
      setCustomTags(prev => [...prev, tag]);
      setTagInput('');
    }
  };

  // Start sync simulation
  const startSync = () => {
    setIsSyncing(true);
    setSyncComplete(false);
    setSyncLogs([]);

    let index = 0;
    const interval = setInterval(() => {
      if (index < syncMessages.length) {
        setSyncLogs(prev => [...prev, syncMessages[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsSyncing(false);
        setSyncComplete(true);
      }
    }, 150);
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [syncLogs]);

  // Verify a tag on a photo
  const verifyTag = (photoId: string, tag: string) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        if (photo.verifiedTags.includes(tag)) {
          return { ...photo, verifiedTags: photo.verifiedTags.filter(t => t !== tag) };
        } else {
          return { ...photo, verifiedTags: [...photo.verifiedTags, tag] };
        }
      }
      return photo;
    }));
  };

  // Get scout name by ID
  const getScoutName = (id: string) => {
    const user = mockUsers.find(u => u.id === id);
    return user?.name || 'Unknown';
  };

  // Handle file operations
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedEvent('all');
    setSelectedTags([]);
    setSelectedYear('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedEvent !== 'all' || selectedTags.length > 0 || selectedYear !== 'all' || searchQuery;

  if (!mounted) return null;

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = !searchQuery ||
      photo.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.aiTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      photo.verifiedTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEvent = selectedEvent === 'all' || photo.event === selectedEvent;
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => photo.aiTags.includes(tag) || photo.verifiedTags.includes(tag));
    const matchesYear = selectedYear === 'all' || photo.date.startsWith(selectedYear);
    return matchesSearch && matchesEvent && matchesTags && matchesYear;
  });

  const isLeader = currentRole === 'scoutmaster' || currentRole === 'admin' || currentRole === 'spl';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Camera className="h-6 w-6 text-red-900" />
                Photo Archive
              </h1>
              <p className="text-slate-500 mt-1">
                {filteredPhotos.length} of {photos.length} photos · 14TB · AI-indexed
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => { setUploadModalOpen(true); resetUploadState(); }}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>

              {isLeader && (
                <Button
                  onClick={() => { setSyncModalOpen(true); startSync(); }}
                  className="troop-button-primary"
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Sync NAS
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by event, tag, or person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                >
                  <option value="all">All Events</option>
                  {uniqueEvents.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                >
                  <option value="all">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              <Button
                variant="outline"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className={filterPanelOpen ? 'bg-red-50 border-red-300' : ''}
              >
                <Tag className="h-4 w-4 mr-2" />
                Tags
                {selectedTags.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-900 text-white text-xs rounded-full">
                    {selectedTags.length}
                  </span>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Tags Filter Panel */}
          <AnimatePresence>
            {filterPanelOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-3">Filter by Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTagFilter(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-red-900 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {selectedTags.includes(tag) && <Check className="h-3 w-3 inline mr-1" />}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No photos found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
                onMouseEnter={() => setHoveredPhoto(photo.id)}
                onMouseLeave={() => setHoveredPhoto(null)}
              >
                <Card className="troop-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <div className="relative aspect-video">
                    <img src={photo.url} alt={photo.event} className="w-full h-full object-cover" />
                    <AnimatePresence>
                      {hoveredPhoto === photo.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end"
                        >
                          <p className="text-white text-xs font-medium mb-2">AI Suggested Tags:</p>
                          <div className="flex flex-wrap gap-2">
                            {photo.aiTags.map(tag => {
                              const isVerified = photo.verifiedTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  onClick={(e) => { e.stopPropagation(); verifyTag(photo.id, tag); }}
                                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                    isVerified
                                      ? 'bg-red-900 text-white'
                                      : 'bg-transparent text-white border border-white/50 hover:border-white'
                                  }`}
                                >
                                  {isVerified && <Check className="h-3 w-3 inline mr-1" />}
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                          {photo.faceDetections.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/20">
                              <p className="text-white text-xs font-medium mb-2">Faces Detected:</p>
                              <div className="flex flex-wrap gap-2">
                                {photo.faceDetections.map((face, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                                      face.verified ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                                    }`}
                                  >
                                    <User className="h-3 w-3" />
                                    {face.scoutId ? getScoutName(face.scoutId) : 'Unknown'}
                                    <span className="opacity-70">{Math.round(face.confidence * 100)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{photo.event}</p>
                        <p className="text-sm text-slate-500">{photo.date}</p>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-400">
                        AI: {Math.round(photo.confidenceScore * 100)}%
                      </span>
                    </div>
                    {photo.verifiedTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {photo.verifiedTags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                            <Check className="h-3 w-3 inline mr-1" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={(open) => { if (!open) resetUploadState(); setUploadModalOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              {uploadStep === 'select' && <><Upload className="h-5 w-5 text-red-900" />Upload Photos</>}
              {uploadStep === 'processing' && <><Sparkles className="h-5 w-5 text-red-900" />Analyzing with AI...</>}
              {uploadStep === 'results' && <><Check className="h-5 w-5 text-green-600" />Review AI Results</>}
            </DialogTitle>
            {uploadStep === 'select' && (
              <DialogDescription>Add photos from troop activities with custom tags and people.</DialogDescription>
            )}
          </DialogHeader>

          {/* Step 1: Select & Tag */}
          {uploadStep === 'select' && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-red-900 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Image className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-red-900' : 'text-slate-400'}`} />
                <p className="text-slate-600 mb-1">
                  Drag photos here or{' '}
                  <button onClick={() => fileInputRef.current?.click()} className="text-red-900 font-medium hover:underline">
                    browse
                  </button>
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, HEIC</p>
              </div>

              {/* Selected Photos Preview */}
              {uploadedFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{uploadedFiles.length} photo(s) selected</p>
                  <div className="grid grid-cols-5 gap-2 max-h-24 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full aspect-square object-cover rounded" />
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Tags Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Custom Tags
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-lg bg-white min-h-[44px]">
                  {customTags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                      {tag}
                      <button onClick={() => setCustomTags(prev => prev.filter(t => t !== tag))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                    placeholder="Type and press Enter..."
                    className="flex-1 min-w-[120px] outline-none text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Tag People */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <UserPlus className="h-4 w-4 inline mr-1" />
                  Tag People
                </label>
                <div className="flex flex-wrap gap-2">
                  {scouts.map(scout => (
                    <button
                      key={scout.id}
                      onClick={() => setTaggedScouts(prev =>
                        prev.includes(scout.id) ? prev.filter(id => id !== scout.id) : [...prev, scout.id]
                      )}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        taggedScouts.includes(scout.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {taggedScouts.includes(scout.id) && <Check className="h-3 w-3 inline mr-1" />}
                      {scout.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Event (optional)
                </label>
                <select
                  value={selectedUploadEvent}
                  onChange={(e) => setSelectedUploadEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                >
                  <option value="">Select an event...</option>
                  {mockTrips.map(trip => (
                    <option key={trip.id} value={trip.name}>{trip.name}</option>
                  ))}
                  <option value="Troop Meeting">Troop Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { resetUploadState(); setUploadModalOpen(false); }}>
                  Cancel
                </Button>
                <Button
                  onClick={runMockAIProcessing}
                  disabled={uploadedFiles.length === 0}
                  className="troop-button-primary"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upload & Analyze
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Processing */}
          {uploadStep === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-red-900" />
              <p className="mt-6 text-lg font-medium text-slate-900">{processingMessage}</p>
              <p className="mt-2 text-sm text-slate-500">AI is analyzing your photos...</p>
              <div className="mt-6 w-64 mx-auto">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-900"
                    initial={{ width: 0 }}
                    animate={{ width: `${processingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">{processingProgress}%</p>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {uploadStep === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Review AI suggestions for {aiResults.length} photo(s)
                </p>
                <Button variant="outline" size="sm" onClick={acceptAllSuggestions}>
                  <Check className="h-4 w-4 mr-1" />
                  Accept All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {aiResults.map((result, photoIdx) => (
                  <div key={photoIdx} className="border border-slate-200 rounded-lg p-3 bg-white">
                    <img src={result.url} alt="" className="w-full h-32 object-cover rounded mb-3" />

                    {/* User Tags */}
                    {result.userTags.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-500 mb-1">Your tags:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.userTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Accepted AI Tags */}
                    {result.acceptedTags.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-500 mb-1">Accepted:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.acceptedTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              <Check className="h-3 w-3 inline mr-0.5" />{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Suggested Tags */}
                    {result.suggestedTags.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-500 mb-1">AI suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.suggestedTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => acceptTag(photoIdx, tag)}
                              className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full hover:bg-amber-200 transition-colors flex items-center gap-1"
                            >
                              {tag}
                              <Plus className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Face Detections */}
                    {result.faces.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Faces detected:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.faces.map((face, faceIdx) => (
                            <div key={faceIdx} className="relative group">
                              {face.scoutId ? (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {getScoutName(face.scoutId)}
                                  <span className="opacity-60">{Math.round(face.confidence * 100)}%</span>
                                </span>
                              ) : (
                                <div className="relative">
                                  <select
                                    onChange={(e) => identifyFace(photoIdx, faceIdx, e.target.value)}
                                    className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full appearance-none cursor-pointer pr-5"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Unknown ({Math.round(face.confidence * 100)}%)</option>
                                    {scouts.map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <Button variant="outline" onClick={() => setUploadStep('select')}>
                  Back
                </Button>
                <Button onClick={saveToGallery} className="troop-button-primary">
                  <Check className="h-4 w-4 mr-2" />
                  Save to Gallery
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Synology Sync Modal */}
      <Dialog open={syncModalOpen} onOpenChange={setSyncModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-green-400" />
              Synology NAS Sync
            </DialogTitle>
          </DialogHeader>
          <div ref={terminalRef} className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {syncLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={log.includes('✓') ? 'text-green-400' : 'text-green-500'}
              >
                {log}
              </motion.div>
            ))}
            {isSyncing && <span className="text-green-500 animate-pulse">_</span>}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {syncComplete && (
              <Button variant="outline" onClick={() => { setSyncComplete(false); startSync(); }} className="text-slate-300 border-slate-600">
                <RefreshCw className="h-4 w-4 mr-2" />Re-sync
              </Button>
            )}
            <Button onClick={() => setSyncModalOpen(false)} className={syncComplete ? 'bg-green-600' : 'bg-slate-700'}>
              {syncComplete ? 'Done' : 'Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
