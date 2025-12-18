'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPhotos, Photo } from '@/data/mock-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import {
  Camera,
  Tag,
  Check,
  X,
  Search,
  Filter,
  Upload,
  Eye,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Clock,
  MoreHorizontal
} from 'lucide-react';

interface AITag {
  tag: string;
  confidence: number;
  verified: boolean;
}

export default function ArchivePage() {
  const { currentRole } = useAppStore();
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const verifyTag = (photoId: string, tagToVerify: string) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        return {
          ...photo,
          aiTags: photo.aiTags.map(tag =>
            tag.tag === tagToVerify ? { ...tag, verified: true } : tag
          )
        };
      }
      return photo;
    }));
  };

  const removeTag = (photoId: string, tagToRemove: string) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        return {
          ...photo,
          aiTags: photo.aiTags.filter(tag => tag.tag !== tagToRemove)
        };
      }
      return photo;
    }));
  };

  const addNewTag = (photoId: string, newTag: string) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        const tagExists = photo.aiTags.some(tag => tag.tag.toLowerCase() === newTag.toLowerCase());
        if (!tagExists) {
          return {
            ...photo,
            aiTags: [...photo.aiTags, {
              tag: newTag,
              confidence: 95,
              verified: true
            }]
          };
        }
      }
      return photo;
    }));
  };

  const filteredPhotos = filterTag
    ? photos.filter(photo =>
        photo.aiTags.some(tag =>
          tag.tag.toLowerCase().includes(filterTag.toLowerCase())
        ) ||
        photo.event?.toLowerCase().includes(filterTag.toLowerCase())
      )
    : photos;

  const allTags = Array.from(new Set(
    photos.flatMap(photo => photo.aiTags.map(tag => tag.tag))
  ));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Camera className="h-8 w-8 text-troop-maroon" />
          <h1 className="text-4xl font-bold text-white">Photo Archive</h1>
          <div className="px-3 py-1 bg-troop-maroon/20 border border-troop-maroon/30 rounded-full">
            <span className="text-sm text-troop-maroon font-semibold">AI-Enhanced</span>
          </div>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Browse 14TB of troop memories with intelligent tagging and facial recognition.
          Hover over photos to see AI-suggested tags and verify them.
        </p>
      </motion.section>

      {/* Controls */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-4 p-6 bg-black/30 rounded-xl border border-white/10"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos by tags or events..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-troop-maroon/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">All Events</option>
              <option value="Winter Camp">Winter Camp</option>
              <option value="Summer Camp">Summer Camp</option>
              <option value="Eagle Scout">Eagle Scout</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
          <div className="text-sm text-gray-400">
            {filteredPhotos.length} of {photos.length} photos
          </div>
        </div>
      </motion.section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Photos', value: '14,247', icon: Camera, color: 'text-blue-400' },
          { label: 'AI Tags Generated', value: '47,891', icon: Tag, color: 'text-green-400' },
          { label: 'Faces Recognized', value: '127', icon: Users, color: 'text-purple-400' },
          { label: 'Events Cataloged', value: '45', icon: Calendar, color: 'text-yellow-400' },
        ].map((stat, index) => (
          <Card key={stat.label} className="bg-black/30 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.section>

      {/* Photo Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
              onMouseEnter={() => setHoveredPhoto(photo.id)}
              onMouseLeave={() => setHoveredPhoto(null)}
            >
              <Card className="bg-black/40 border-white/10 overflow-hidden hover:border-troop-maroon/50 transition-all duration-300">
                {/* Photo Display Area */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  <Camera className="h-12 w-12 text-gray-600" />

                  {/* AI Tags Overlay */}
                  <AnimatePresence>
                    {hoveredPhoto === photo.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 bg-black/80 p-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-300">
                            <Sparkles className="h-3 w-3" />
                            <span>AI Suggested Tags</span>
                          </div>
                          <div className="space-y-1">
                            {photo.aiTags.map((tag) => (
                              <div key={tag.tag} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      tag.verified
                                        ? 'bg-troop-maroon text-white'
                                        : 'bg-gray-700 text-gray-300 animate-pulse'
                                    }`}
                                  >
                                    {tag.tag} {tag.confidence}%
                                  </span>
                                </div>
                                <div className="flex space-x-1">
                                  {!tag.verified && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          verifyTag(photo.id, tag.tag);
                                        }}
                                        className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                                      >
                                        <Check className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeTag(photo.id, tag.tag);
                                        }}
                                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(photo);
                            }}
                            className="text-xs text-white hover:text-troop-maroon"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <div className="text-xs text-gray-400">
                            {photo.aiTags.filter(tag => tag.verified).length} verified
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Photo Info */}
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {new Date(photo.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white mb-2">{photo.event}</p>
                  <div className="flex flex-wrap gap-1">
                    {photo.aiTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.tag}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tag.verified
                            ? 'bg-troop-maroon/20 text-troop-maroon border border-troop-maroon/30'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {tag.tag}
                      </span>
                    ))}
                    {photo.aiTags.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                        +{photo.aiTags.length - 3}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-black border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{selectedPhoto.event}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-600" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Photo Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">
                          Uploaded: {new Date(selectedPhoto.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">Event: {selectedPhoto.event}</span>
                      </div>
                      {selectedPhoto.scoutsIdentified && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {selectedPhoto.scoutsIdentified.length} scouts identified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">AI Tags</h3>
                    <div className="space-y-2">
                      {selectedPhoto.aiTags.map((tag) => (
                        <div key={tag.tag} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-white">{tag.tag}</span>
                            <span className="text-xs text-gray-400">({tag.confidence}%)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {tag.verified ? (
                              <div className="flex items-center space-x-1 text-green-400">
                                <Check className="h-3 w-3" />
                                <span className="text-xs">Verified</span>
                              </div>
                            ) : (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => verifyTag(selectedPhoto.id, tag.tag)}
                                  className="text-green-400 hover:bg-green-400/10"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTag(selectedPhoto.id, tag.tag)}
                                  className="text-red-400 hover:bg-red-400/10"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}