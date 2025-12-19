'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getCurrentMemoryOfDay, mockTrips, mockUsers, TROOP_LOCATION } from '@/data/mock-db';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Camera,
  Award,
  MapPin,
  Users,
  ArrowRight,
  Navigation,
  AlertTriangle,
  Share2,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const { currentRole } = useAppStore();
  const [memoryOfDay, setMemoryOfDay] = useState(getCurrentMemoryOfDay());
  const [mounted, setMounted] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    setMemoryOfDay(getCurrentMemoryOfDay());
  }, []);

  const handleShareLocation = () => {
    if (!shareLocation) {
      // Simulate getting user location (would use real geolocation in production)
      setUserLocation({ lat: 40.0355, lng: -75.5120 });
    } else {
      setUserLocation(null);
    }
    setShareLocation(!shareLocation);
  };

  if (!mounted) return null;

  const upcomingTrips = mockTrips.filter(t => t.status === 'open').slice(0, 3);
  const activeScouts = mockUsers.filter(u => u.role === 'scout' || u.role === 'patrol_leader').length;
  const eagleScouts = mockUsers.filter(u => u.eagleDate).length;

  const quickStats = [
    { label: 'Active Scouts', value: activeScouts.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Eagle Scouts', value: eagleScouts.toString(), icon: Award, color: 'text-amber-600' },
    { label: 'Photos Archived', value: '14,247', icon: Camera, color: 'text-green-600' },
    { label: 'Upcoming Trips', value: upcomingTrips.length.toString(), icon: MapPin, color: 'text-red-900' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION - Solid Maroon, NO GRADIENTS */}
      <section className="hero-maroon py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Willistown Troop 78
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 mb-8"
          >
            Est. 1978 · Malvern, Pennsylvania
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/trips">
              <Button className="bg-white text-red-900 hover:bg-slate-100 font-medium">
                View Upcoming Trips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/photos">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Explore Photo Archive
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4"
              >
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Memory of the Day - Polaroid Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="troop-card overflow-hidden">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Camera className="h-5 w-5 text-red-900" />
                    Memory of the Day
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Polaroid Frame */}
                    <div className="bg-white p-3 shadow-lg border border-slate-200 rotate-[-2deg] hover:rotate-0 transition-transform">
                      <img
                        src={memoryOfDay.url}
                        alt={memoryOfDay.event}
                        className="w-full md:w-64 h-48 object-cover"
                      />
                      <div className="pt-3 text-center">
                        <p className="font-medium text-slate-900">{memoryOfDay.event}</p>
                        <p className="text-sm text-slate-500">{memoryOfDay.date}</p>
                      </div>
                    </div>
                    {/* Memory Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">{memoryOfDay.event}</h3>
                        <p className="text-slate-600">
                          {memoryOfDay.location && `Location: ${memoryOfDay.location}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">AI Detected Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {memoryOfDay.verifiedTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                              {tag}
                            </span>
                          ))}
                          {memoryOfDay.aiTags.filter(t => !memoryOfDay.verifiedTags.includes(t)).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-full border border-slate-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link href="/photos" className="inline-flex items-center text-red-900 hover:text-red-800 font-medium text-sm">
                        View Full Archive <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interactive Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="troop-card overflow-hidden">
                <CardHeader className="border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <MapPin className="h-5 w-5 text-red-900" />
                      Troop Meeting Location
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareLocation}
                      className={shareLocation ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {shareLocation ? 'Sharing Location' : 'Share My Location'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Map Container */}
                  <div className="relative h-64 bg-slate-200">
                    {/* Placeholder Map Background */}
                    <div className="absolute inset-0 bg-slate-300">
                      {/* Map Grid Lines */}
                      <svg className="absolute inset-0 w-full h-full opacity-20">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#666" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Maroon Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                      <div className="maroon-pin animate-bounce" />
                    </div>

                    {/* User Location (Blue Dot) */}
                    {userLocation && (
                      <div className="absolute top-[45%] left-[48%] -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                          <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
                        </div>
                      </div>
                    )}

                    {/* Navigation Warning Tooltip */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 text-sm">Navigation Warning</p>
                          <p className="text-amber-700 text-xs">{TROOP_LOCATION.mapNote}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-900">{TROOP_LOCATION.address}</span>
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${TROOP_LOCATION.coordinates.lat},${TROOP_LOCATION.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-900 hover:text-red-800 font-medium"
                      >
                        Get Directions
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Upcoming Trips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="troop-card">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
                    <Calendar className="h-5 w-5 text-red-900" />
                    Upcoming Trips
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-200">
                    {upcomingTrips.map((trip) => (
                      <Link
                        key={trip.id}
                        href={`/trips`}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                      >
                        <img
                          src={trip.imageUrl}
                          alt={trip.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{trip.name}</p>
                          <p className="text-sm text-slate-500">{trip.destination}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <Link href="/trips">
                      <Button variant="outline" className="w-full">
                        View All Trips
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions based on role */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="troop-card">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-slate-900 text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Link href="/documents" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </Link>
                  <Link href="/trips" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Sign Permission Slips
                    </Button>
                  </Link>
                  {['scoutmaster', 'admin', 'spl'].includes(currentRole) && (
                    <Link href="/communication" className="block">
                      <Button className="w-full justify-start troop-button-primary">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Send Announcement
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}