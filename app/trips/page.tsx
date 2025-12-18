'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockTrips, Trip } from '@/data/mock-db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SignatureCanvasComponent } from '@/components/signature-canvas';
import { useAppStore } from '@/lib/store';
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  PenTool,
  CheckCircle,
  Clock,
  Mountain,
  Plane,
  Car,
  Camera,
  Award,
  AlertCircle,
  Globe
} from 'lucide-react';

export default function TripsPage() {
  const { currentRole } = useAppStore();
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getTripIcon = (tripName: string) => {
    if (tripName.toLowerCase().includes('switzerland')) return Globe;
    if (tripName.toLowerCase().includes('disney')) return Camera;
    if (tripName.toLowerCase().includes('winter')) return Mountain;
    if (tripName.toLowerCase().includes('gettysburg')) return Award;
    return Car;
  };

  const getTripStatus = (trip: Trip) => {
    const today = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    if (endDate < today) return { status: 'completed', label: 'Completed', color: 'bg-gray-600' };
    if (startDate <= today && endDate >= today) return { status: 'active', label: 'In Progress', color: 'bg-green-600' };
    if (startDate > today) return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-600' };
    return { status: 'planning', label: 'Planning', color: 'bg-yellow-600' };
  };

  const getPermissionStatus = (trip: Trip) => {
    if (!trip.permissionSlips) return null;
    const signed = trip.permissionSlips.filter(slip => slip.signed).length;
    const total = trip.permissionSlips.length;
    return { signed, total };
  };

  const openSignatureModal = (trip: Trip) => {
    setSelectedTrip(trip);
    setSignatureModalOpen(true);
  };

  const handleSignatureComplete = (signatureData: string) => {
    if (selectedTrip) {
      setTrips(prev => prev.map(trip => {
        if (trip.id === selectedTrip.id) {
          const updatedPermissionSlips = trip.permissionSlips?.map(slip =>
            slip.scoutId === 'scout-1' // Mock current user as scout-1
              ? { ...slip, signed: true, signedDate: new Date().toISOString() }
              : slip
          ) || [];
          return { ...trip, permissionSlips: updatedPermissionSlips };
        }
        return trip;
      }));
    }
  };

  const upcomingTrips = trips.filter(trip => new Date(trip.startDate) > new Date());
  const completedTrips = trips.filter(trip => new Date(trip.endDate) < new Date());

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Mountain className="h-8 w-8 text-troop-maroon" />
          <h1 className="text-4xl font-bold text-white">Scout Adventures</h1>
          <Badge variant="outline" className="border-troop-maroon text-troop-maroon">
            2025-2026
          </Badge>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore our upcoming adventures, from local camping trips to international expeditions.
          Complete digital permission slips and track your participation.
        </p>
      </motion.section>

      {/* Quick Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Upcoming Trips', value: upcomingTrips.length.toString(), icon: Calendar, color: 'text-blue-400' },
          { label: 'Total Adventures', value: trips.length.toString(), icon: Mountain, color: 'text-green-400' },
          { label: 'International Trips', value: '2', icon: Globe, color: 'text-purple-400' },
          { label: 'Active Participants', value: '45', icon: Users, color: 'text-yellow-400' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="bg-black/30 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Upcoming Trips */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Upcoming Adventures</h2>
          <p className="text-gray-400">Next trips requiring your attention</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcomingTrips.map((trip, index) => {
            const TripIcon = getTripIcon(trip.name);
            const status = getTripStatus(trip);
            const permissionStatus = getPermissionStatus(trip);
            const userPermission = trip.permissionSlips?.find(slip => slip.scoutId === 'scout-1');

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-black/40 to-troop-maroon/10 border-white/10 hover:border-troop-maroon/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-troop-maroon/20 rounded-lg">
                          <TripIcon className="h-6 w-6 text-troop-maroon" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{trip.name}</CardTitle>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <MapPin className="h-4 w-4" />
                              <span>{trip.location}</span>
                            </div>
                            {trip.cost && (
                              <div className="flex items-center space-x-1 text-sm text-troop-gold font-semibold">
                                <DollarSign className="h-4 w-4" />
                                <span>${trip.cost}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {trip.description}
                    </p>

                    {/* Permission Slip Status */}
                    <div className="mb-4">
                      {userPermission ? (
                        userPermission.signed ? (
                          <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 p-3 rounded-lg border border-green-600/30">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Permission Slip Signed</p>
                              <p className="text-xs text-green-300">
                                Signed on {new Date(userPermission.signedDate!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                            <div className="flex items-center space-x-2 text-yellow-400">
                              <AlertCircle className="h-5 w-5" />
                              <div>
                                <p className="font-medium">Permission Slip Required</p>
                                <p className="text-xs text-yellow-300">Digital signature needed</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openSignatureModal(trip)}
                              className="border-yellow-600 text-yellow-400 hover:bg-yellow-400/10"
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              Sign Now
                            </Button>
                          </div>
                        )
                      ) : (
                        <div className="p-3 bg-gray-900/20 border border-gray-600/30 rounded-lg">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="h-5 w-5" />
                            <p className="text-sm">No permission slip required yet</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Participation Stats (for leaders) */}
                    {(currentRole === 'scoutmaster' || currentRole === 'spl') && permissionStatus && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Permission Slips:</span>
                        <span className={`font-semibold ${
                          permissionStatus.signed === permissionStatus.total ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {permissionStatus.signed}/{permissionStatus.total} signed
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Past Adventures */}
      {completedTrips.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Past Adventures</h2>
            <p className="text-gray-400">Memories from completed trips</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedTrips.slice(0, 3).map((trip, index) => {
              const TripIcon = getTripIcon(trip.name);
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <Card className="bg-black/30 border-white/10 hover:border-gray-600 transition-colors">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <TripIcon className="h-5 w-5 text-gray-400" />
                        <CardTitle className="text-gray-300 text-lg">{trip.name}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{trip.location}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm">{trip.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Signature Modal */}
      {selectedTrip && (
        <SignatureCanvasComponent
          trip={selectedTrip}
          isOpen={signatureModalOpen}
          onClose={() => {
            setSignatureModalOpen(false);
            setSelectedTrip(null);
          }}
          onComplete={handleSignatureComplete}
        />
      )}
    </div>
  );
}