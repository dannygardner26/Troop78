'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockUsers, User, PATROLS, RANKS } from '@/data/mock-db';
import {
  useAppStore,
  canViewPhoneNumber,
  canViewAddress,
  canViewMedicalStatus,
  maskPhone,
  maskAddress,
  getRoleLabel,
  getRoleBadgeColor
} from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Shield,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
  Search,
  Filter,
  User as UserIcon
} from 'lucide-react';

export default function RosterPage() {
  const { currentRole, currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatrol, setSelectedPatrol] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Check if current role can access this page
  const canAccessRoster = ['scoutmaster', 'admin', 'spl', 'aspl', 'patrol_leader'].includes(currentRole);

  if (!canAccessRoster) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="troop-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-500 mb-4">
              The roster is only accessible to Scoutmasters, SPL, ASPL, and Patrol Leaders.
            </p>
            <p className="text-sm text-slate-400">
              Current role: <span className="font-medium">{getRoleLabel(currentRole)}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get scouts to display based on role
  const getVisibleScouts = (): User[] => {
    const scouts = mockUsers.filter(u =>
      u.role === 'scout' || u.role === 'patrol_leader' || u.role === 'spl' || u.role === 'aspl'
    );

    // Patrol leaders only see their patrol
    if (currentRole === 'patrol_leader' && currentUser?.patrol) {
      return scouts.filter(s => s.patrol === currentUser.patrol);
    }

    return scouts;
  };

  const visibleScouts = getVisibleScouts();

  // Filter scouts by search and patrol
  const filteredScouts = visibleScouts.filter(scout => {
    const matchesSearch = !searchQuery ||
      scout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scout.rank && scout.rank.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPatrol = !selectedPatrol || scout.patrol === selectedPatrol;

    return matchesSearch && matchesPatrol;
  });

  // Get medical status badge
  const getMedicalBadge = (status?: string) => {
    if (!canViewMedicalStatus(currentRole)) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
          <EyeOff className="h-3 w-3" />
          Hidden
        </span>
      );
    }

    switch (status) {
      case 'complete':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
            <CheckCircle className="h-3 w-3" />
            Complete
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'missing':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
            <AlertCircle className="h-3 w-3" />
            Missing
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
            Unknown
          </span>
        );
    }
  };

  // Get visible phone number
  const getDisplayPhone = (scout: User) => {
    const canView = canViewPhoneNumber(currentRole, scout.patrol, currentUser?.patrol);
    return canView ? scout.phone : maskPhone(scout.phone);
  };

  // Get visible address
  const getDisplayAddress = (scout: User) => {
    const canView = canViewAddress(currentRole);
    return canView ? scout.address : maskAddress(scout.address);
  };

  // Get unique patrols from visible scouts
  const availablePatrols = Array.from(new Set(visibleScouts.map(s => s.patrol).filter((p): p is string => Boolean(p))));

  // Privacy visibility summary
  const getPrivacySummary = () => {
    const canPhone = currentRole === 'scoutmaster' || currentRole === 'admin' || currentRole === 'spl' || currentRole === 'aspl';
    const canAddr = currentRole === 'scoutmaster' || currentRole === 'admin';
    const canMed = currentRole === 'scoutmaster' || currentRole === 'admin';

    return { canPhone, canAddr, canMed };
  };

  const privacy = getPrivacySummary();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-red-900" />
                Troop Roster
              </h1>
              <p className="text-slate-500 mt-1">
                {filteredScouts.length} scouts · {availablePatrols.length} patrols
              </p>
            </div>

            {/* Privacy Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <Eye className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Viewing As:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(currentRole)}`}>
                  {getRoleLabel(currentRole)}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Indicators */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${privacy.canPhone ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500'}`}>
              <Phone className="h-3 w-3" />
              Phone Numbers: {privacy.canPhone ? 'Visible' : 'Masked'}
            </div>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${privacy.canAddr ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500'}`}>
              <MapPin className="h-3 w-3" />
              Addresses: {privacy.canAddr ? 'Visible' : 'Hidden'}
            </div>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${privacy.canMed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500'}`}>
              <Shield className="h-3 w-3" />
              Medical: {privacy.canMed ? 'Visible' : 'Hidden'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or rank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
            />
          </div>

          {/* Patrol Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedPatrol === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPatrol(null)}
              className={selectedPatrol === null ? "bg-red-900 text-white" : ""}
            >
              All Patrols
            </Button>
            {availablePatrols.map(patrol => (
              <Button
                key={patrol}
                variant={selectedPatrol === patrol ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPatrol(patrol || null)}
                className={selectedPatrol === patrol ? "bg-red-900 text-white" : ""}
              >
                {patrol}
              </Button>
            ))}
          </div>
        </div>

        {/* Scout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScouts.map((scout, index) => (
            <motion.div
              key={scout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="troop-card hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{scout.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {scout.patrol && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            {scout.patrol}
                          </span>
                        )}
                        {scout.rank && (
                          <span className="text-xs text-slate-500">{scout.rank}</span>
                        )}
                      </div>
                    </div>
                    {getMedicalBadge(scout.medicalStatus)}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{scout.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className={!canViewPhoneNumber(currentRole, scout.patrol, currentUser?.patrol) ? 'text-slate-400' : ''}>
                        {getDisplayPhone(scout)}
                      </span>
                      {!canViewPhoneNumber(currentRole, scout.patrol, currentUser?.patrol) && (
                        <EyeOff className="h-3 w-3 text-slate-300" />
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span className={!canViewAddress(currentRole) ? 'text-slate-400' : ''}>
                        {getDisplayAddress(scout)}
                      </span>
                      {!canViewAddress(currentRole) && (
                        <EyeOff className="h-3 w-3 text-slate-300" />
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  {scout.joinDate && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-400">
                        Member since {new Date(scout.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {/* Eagle Scout Badge */}
                  {scout.eagleDate && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <Award className="h-4 w-4" />
                      <span>Eagle Scout - {new Date(scout.eagleDate).getFullYear()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredScouts.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No scouts found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
