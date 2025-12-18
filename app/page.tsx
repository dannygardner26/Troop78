'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentMemoryOfDay, mockTrips, mockPhotos, eagleScouts2024 } from '@/data/mock-db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { SynologySync } from '@/components/synology-sync';
import {
  Calendar,
  Camera,
  Award,
  MapPin,
  Users,
  Zap,
  ArrowRight,
  Star,
  Mountain,
  Globe
} from 'lucide-react';

export default function HomePage() {
  const { currentRole, setTerminalOpen } = useAppStore();
  const [memoryOfDay, setMemoryOfDay] = useState(getCurrentMemoryOfDay());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMemoryOfDay(getCurrentMemoryOfDay());
  }, []);

  if (!mounted) return null;

  const upcomingTrips = mockTrips.slice(0, 3);
  const recentPhotos = mockPhotos.slice(0, 3);

  const quickStats = [
    { label: 'Active Scouts', value: '45', icon: Users, color: 'text-blue-400' },
    { label: 'Eagle Scouts 2024', value: eagleScouts2024.length.toString(), icon: Award, color: 'text-yellow-400' },
    { label: 'Photos Archived', value: '14,247', icon: Camera, color: 'text-green-400' },
    { label: 'Upcoming Trips', value: upcomingTrips.length.toString(), icon: MapPin, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl font-bold text-white mb-4">
              Willistown{' '}
              <span className="text-troop-maroon">Troop 78</span>
            </h1>
            <p className="text-xl text-gray-300 mb-2">Est. 1978 • Modernizing Adventure</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>15 Mill Road, Malvern, PA</span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Welcome to the future of scouting management. Our high-tech platform brings
            together 45+ years of tradition with cutting-edge digital innovation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              variant="maroon"
              size="lg"
              className="text-lg px-8"
              onClick={() => setTerminalOpen(true)}
            >
              <Zap className="mr-2 h-5 w-5" />
              Sync Archive
            </Button>
            <Button variant="outline" size="lg" className="text-lg">
              View Photo Vault
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Memory of the Day */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gradient-to-br from-troop-maroon/20 to-purple-900/20 border-troop-maroon/30 maroon-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Star className="h-5 w-5 text-troop-gold" />
                <span>Memory of the Day</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                {memoryOfDay.yearAgo} year{memoryOfDay.yearAgo > 1 ? 's' : ''} ago today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-600" />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {memoryOfDay.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {memoryOfDay.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Access key features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start text-left">
                <Mountain className="mr-2 h-4 w-4" />
                Winter Camp Check-in
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left">
                <Globe className="mr-2 h-4 w-4" />
                Switzerland 2026 Forms
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left">
                <Award className="mr-2 h-4 w-4" />
                Eagle Scout Progress
              </Button>
              <Button variant="ghost" className="w-full justify-start text-left">
                <Camera className="mr-2 h-4 w-4" />
                Upload Event Photos
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Upcoming Trips */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Upcoming Adventures</h2>
          <p className="text-gray-400">Next trips on the calendar</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + index * 0.1 }}
            >
              <Card className="bg-black/40 border-white/10 hover:border-troop-maroon/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{trip.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{trip.location}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {trip.description}
                  </p>
                  {trip.cost && (
                    <div className="mt-3 text-troop-gold font-semibold">
                      ${trip.cost}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recent Photos Preview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9 }}
        className="pb-8"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Recent Photo Uploads</h2>
          <p className="text-gray-400">Latest memories from our adventures</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.0 + index * 0.1 }}
            >
              <Card className="bg-black/40 border-white/10 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-600" />
                </div>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {photo.aiTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.tag}
                        className={`text-xs px-2 py-1 rounded-full ${
                          tag.verified ? 'bg-troop-maroon text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {tag.tag} {tag.confidence}%
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">{photo.event}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Synology Sync Component */}
      <SynologySync />
    </div>
  );
}