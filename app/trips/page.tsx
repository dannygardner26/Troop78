'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTrips, Trip, getUserById } from '@/data/mock-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
  Globe,
  Car,
  Camera,
  Award,
  AlertCircle,
  ChevronRight,
  FileText,
  Download,
  X
} from 'lucide-react';
import { SignatureCanvasComponent } from '@/components/signature-canvas';

export default function TripsPage() {
  const { currentRole, currentUser } = useAppStore();
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingForScoutId, setSigningForScoutId] = useState<string | null>(null);
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

    if (endDate < today) return { label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (startDate <= today && endDate >= today) return { label: 'In Progress', color: 'bg-green-50 text-green-700 border-green-200' };
    if (trip.status === 'open') return { label: 'Open for Signup', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'Planning', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  const getPermissionStatus = (trip: Trip) => {
    if (!trip.permissionSlips) return null;
    const signed = trip.permissionSlips.filter(slip => slip.signed).length;
    const total = trip.permissionSlips.length;
    return { signed, total };
  };

  const openTripDetail = (trip: Trip) => {
    setSelectedTrip(trip);
    setSheetOpen(true);
  };

  const openSignatureModal = (scoutId: string) => {
    setSigningForScoutId(scoutId);
    setSignatureModalOpen(true);
  };

  const handleSignatureComplete = (signatureData: string) => {
    if (selectedTrip && currentUser && signingForScoutId) {
      setTrips(prev => prev.map(trip => {
        if (trip.id === selectedTrip.id) {
          const updatedPermissionSlips = trip.permissionSlips?.map(slip =>
            slip.scoutId === signingForScoutId
              ? { ...slip, signed: true, signedDate: new Date().toISOString(), signedBy: currentUser.name }
              : slip
          ) || [];
          return { ...trip, permissionSlips: updatedPermissionSlips };
        }
        return trip;
      }));
      setSelectedTrip(prev => {
        if (!prev) return prev;
        const updatedPermissionSlips = prev.permissionSlips?.map(slip =>
          slip.scoutId === signingForScoutId
            ? { ...slip, signed: true, signedDate: new Date().toISOString(), signedBy: currentUser.name }
            : slip
        ) || [];
        return { ...prev, permissionSlips: updatedPermissionSlips };
      });
      setSigningForScoutId(null);
    }
  };

  const upcomingTrips = trips.filter(trip => new Date(trip.startDate) > new Date());
  const completedTrips = trips.filter(trip => new Date(trip.endDate) < new Date());

  // Check if current user has a permission slip for this trip
  // Parents can sign for their children
  const getUserPermissions = (trip: Trip) => {
    if (!trip.permissionSlips || !currentUser) return [];

    if (currentRole === 'parent' && currentUser.children) {
      // Parents see permission slips for their children
      return trip.permissionSlips.filter(slip => currentUser.children!.includes(slip.scoutId));
    }

    // Scouts/others see their own permission slip
    return trip.permissionSlips.filter(slip => slip.scoutId === currentUser.id);
  };

  // Legacy helper for backwards compatibility
  const getUserPermission = (trip: Trip) => {
    const permissions = getUserPermissions(trip);
    return permissions.length > 0 ? permissions[0] : null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Mountain className="h-6 w-6 text-red-900" />
                Scout Adventures
              </h1>
              <p className="text-slate-500 mt-1">{upcomingTrips.length} upcoming trips · {completedTrips.length} past adventures</p>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-900 text-sm font-medium rounded-full border border-red-200 self-start">
              2025-2026 Season
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Upcoming Trips', value: upcomingTrips.length.toString(), icon: Calendar, color: 'text-blue-600' },
            { label: 'Total Adventures', value: trips.length.toString(), icon: Mountain, color: 'text-green-600' },
            { label: 'International Trips', value: '2', icon: Globe, color: 'text-purple-600' },
            { label: 'Active Participants', value: '45', icon: Users, color: 'text-amber-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="troop-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Trips Section */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Adventures</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingTrips.map((trip, index) => {
              const TripIcon = getTripIcon(trip.name);
              const status = getTripStatus(trip);
              const permissionStatus = getPermissionStatus(trip);
              const userPermission = getUserPermission(trip);

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card
                    className="troop-card hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => openTripDetail(trip)}
                  >
                    {/* Trip Image */}
                    <div className="relative h-40">
                      <img
                        src={trip.imageUrl}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-slate-900">${trip.cost}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <TripIcon className="h-5 w-5 text-red-900" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{trip.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {trip.destination}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Permission Slip Status */}
                      {userPermission ? (
                        userPermission.signed ? (
                          <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                            <CheckCircle className="h-4 w-4" />
                            <span>Permission slip signed</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              <span>Permission slip required</span>
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 text-slate-500 rounded-lg text-sm border border-slate-200">
                          <Clock className="h-4 w-4" />
                          <span>Click to view details</span>
                        </div>
                      )}

                      {/* Leader Stats */}
                      {(currentRole === 'scoutmaster' || currentRole === 'spl') && permissionStatus && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Permission Slips:</span>
                            <span className={`font-semibold ${
                              permissionStatus.signed === permissionStatus.total ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              {permissionStatus.signed}/{permissionStatus.total} signed
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Past Adventures Section */}
        {completedTrips.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Past Adventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedTrips.map((trip, index) => {
                const TripIcon = getTripIcon(trip.name);
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="troop-card hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <TripIcon className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{trip.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{trip.destination}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Trip Detail Sheet/Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTrip && (
            <>
              <SheetHeader>
                <SheetTitle className="text-slate-900">{selectedTrip.name}</SheetTitle>
                <SheetDescription>{selectedTrip.destination}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Trip Image */}
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={selectedTrip.imageUrl}
                    alt={selectedTrip.name}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Dates</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedTrip.startDate).toLocaleDateString()} - {new Date(selectedTrip.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Cost</p>
                    <p className="font-medium text-slate-900">${selectedTrip.cost}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-slate-600">{selectedTrip.description}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {selectedTrip.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 bg-red-900 rounded-full" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Permission Slip Section */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-900" />
                    Required Forms
                  </h4>

                  {(() => {
                    const userPermissions = getUserPermissions(selectedTrip);
                    if (userPermissions.length === 0) {
                      return (
                        <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-sm">
                          No permission slip required for your role
                        </div>
                      );
                    }

                    // For parents with multiple children, show each child's slip
                    return (
                      <div className="space-y-3">
                        {userPermissions.map((slip) => {
                          const scout = getUserById(slip.scoutId);
                          const scoutName = scout?.name || 'Unknown Scout';

                          if (slip.signed) {
                            return (
                              <div key={slip.scoutId} className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-green-100 rounded-full">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-green-800">
                                      {currentRole === 'parent' ? `${scoutName}'s Permission Slip` : 'Permission Slip'} Signed
                                    </p>
                                    <p className="text-sm text-green-600">
                                      Signed by {slip.signedBy} on {new Date(slip.signedDate!).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" className="w-full" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Signed PDF
                                </Button>
                              </div>
                            );
                          }

                          return (
                            <div key={slip.scoutId} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-amber-100 rounded-full">
                                  <AlertCircle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-amber-800">
                                    {currentRole === 'parent' ? `${scoutName}'s Permission Slip` : 'Permission Slip'} Required
                                  </p>
                                  <p className="text-sm text-amber-600">Digital signature needed to participate</p>
                                </div>
                              </div>
                              <Button
                                onClick={() => openSignatureModal(slip.scoutId)}
                                className="w-full troop-button-primary"
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Sign Permission Slip
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Leader View: All Permission Slips */}
                {(currentRole === 'scoutmaster' || currentRole === 'spl') && selectedTrip.permissionSlips && (
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-3">All Permission Slips</h4>
                    <div className="space-y-2">
                      {selectedTrip.permissionSlips.map((slip) => {
                        const scout = getUserById(slip.scoutId);
                        return (
                          <div
                            key={slip.scoutId}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              slip.signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${slip.signed ? 'bg-green-500' : 'bg-amber-500'}`} />
                              <span className="text-sm font-medium text-slate-900">{scout?.name || 'Unknown'}</span>
                            </div>
                            {slip.signed ? (
                              <span className="text-xs text-green-600">Signed {new Date(slip.signedDate!).toLocaleDateString()}</span>
                            ) : (
                              <span className="text-xs text-amber-600">Pending</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Signature Modal */}
      {selectedTrip && (
        <SignatureCanvasComponent
          trip={selectedTrip}
          isOpen={signatureModalOpen}
          onClose={() => setSignatureModalOpen(false)}
          onComplete={handleSignatureComplete}
        />
      )}
    </div>
  );
}
