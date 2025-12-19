'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPhotos, mockUsers, Photo } from '@/data/mock-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Camera,
  HardDrive,
  Search,
  Check,
  User,
  X,
  RefreshCw,
  Filter,
  Grid,
  LayoutGrid
} from 'lucide-react';

// Sync log messages for the terminal simulator
const syncMessages = [
  '> Initializing Synology NAS connection...',
  '> Authenticating with DS920+...',
  '> Connection established.',
  '> Scanning /volume1/photos/...',
  '> Found 42,247 files across 847 directories.',
  '> Indexing /vol/photos/2012/summer_camp/IMG_0001.jpg...',
  '> Indexing /vol/photos/2012/summer_camp/IMG_0002.jpg...',
  '> Face Detect: Danny [98%]...',
  '> Indexing /vol/photos/2015/gettysburg/DSC_0412.jpg...',
  '> Scene Recognition: Campfire [94%]...',
  '> Indexing /vol/photos/2018/switzerland/DSCN4521.jpg...',
  '> Face Detect: Kavya [92%]...',
  '> Indexing /vol/photos/2020/winter_camp/P1010023.jpg...',
  '> OCR Processing: Merit Badge Card detected...',
  '> Indexing /vol/photos/2023/eagle_ceremony/IMG_8834.jpg...',
  '> Face Detect: Multiple scouts [87%]...',
  '> Generating thumbnails...',
  '> Building search index...',
  '> Compressing metadata...',
  '> Syncing to cloud backup...',
  '> Verifying checksums...',
  '> ✓ Success: 14TB Indexed. 42,247 photos processed.',
];

export default function PhotosPage() {
  const [mounted, setMounted] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [photos, setPhotos] = useState(mockPhotos);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          return {
            ...photo,
            verifiedTags: photo.verifiedTags.filter(t => t !== tag)
          };
        } else {
          return {
            ...photo,
            verifiedTags: [...photo.verifiedTags, tag]
          };
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

  if (!mounted) return null;

  // Filter photos by search
  const filteredPhotos = photos.filter(photo =>
    photo.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.aiTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    photo.verifiedTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <p className="text-slate-500 mt-1">14,247 photos · 14TB · AI-indexed</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                />
              </div>

              {/* Sync Button */}
              <Button
                onClick={() => {
                  setSyncModalOpen(true);
                  startSync();
                }}
                className="troop-button-primary"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Sync Synology NAS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
              onMouseEnter={() => setHoveredPhoto(photo.id)}
              onMouseLeave={() => setHoveredPhoto(null)}
            >
              <Card className="troop-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative aspect-video">
                  <img
                    src={photo.url}
                    alt={photo.event}
                    className="w-full h-full object-cover"
                  />

                  {/* AI Tags Overlay on Hover */}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  verifyTag(photo.id, tag);
                                }}
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

                        {/* Face Detection Prompts */}
                        {photo.faceDetections.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <p className="text-white text-xs font-medium mb-2">Faces Detected:</p>
                            <div className="flex flex-wrap gap-2">
                              {photo.faceDetections.map((face, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                                    face.verified
                                      ? 'bg-green-600 text-white'
                                      : 'bg-amber-500 text-white'
                                  }`}
                                >
                                  <User className="h-3 w-3" />
                                  {face.scoutId ? getScoutName(face.scoutId) : 'Unknown'}
                                  <span className="opacity-70">{Math.round(face.confidence * 100)}%</span>
                                  {!face.verified && (
                                    <button className="ml-1 hover:text-white/80">
                                      Identify?
                                    </button>
                                  )}
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
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 rounded-full">
                        AI: {Math.round(photo.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Verified Tags */}
                  {photo.verifiedTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {photo.verifiedTags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                        >
                          <Check className="h-3 w-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Synology Sync Modal */}
      <Dialog open={syncModalOpen} onOpenChange={setSyncModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-green-400" />
              Synology NAS Sync
            </DialogTitle>
          </DialogHeader>

          {/* Terminal Interface */}
          <div
            ref={terminalRef}
            className="bg-black rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm"
          >
            {syncLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${
                  log.includes('✓') ? 'text-green-400' :
                  log.includes('Face Detect') ? 'text-cyan-400' :
                  log.includes('OCR') ? 'text-yellow-400' :
                  log.includes('Scene') ? 'text-purple-400' :
                  'text-green-500'
                }`}
              >
                {log}
              </motion.div>
            ))}
            {isSyncing && (
              <span className="text-green-500 animate-pulse">_</span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>
                {syncComplete ? 'Sync Complete' : isSyncing ? 'Syncing...' : 'Ready'}
              </span>
              <span>
                {syncComplete ? '42,247 / 42,247' : isSyncing ? `${Math.min(syncLogs.length * 2000, 42247).toLocaleString()} / 42,247` : '0 / 42,247'}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: syncComplete ? '100%' : `${(syncLogs.length / syncMessages.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            {syncComplete && (
              <Button
                variant="outline"
                onClick={() => {
                  setSyncComplete(false);
                  startSync();
                }}
                className="text-slate-300 border-slate-600 hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-sync
              </Button>
            )}
            <Button
              onClick={() => setSyncModalOpen(false)}
              className={syncComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'}
            >
              {syncComplete ? 'Done' : 'Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}