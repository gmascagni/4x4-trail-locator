import React, { useState, useEffect, useCallback } from 'react';
import { Database, AlertCircle, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { Trail4x4, Trip, UserProfile } from '../../types';
import { supabase, isSupabaseConfigured, getLocalUserProfile } from '../../lib/supabaseClient';
import TripCalendar from './TripCalendar';
import PlanRunModal from './PlanRunModal';
import TripDetailDrawer from './TripDetailDrawer';

interface TrailRunSchedulerProps {
  trails: Trail4x4[];
  prefillTrail?: Trail4x4 | null;
  currentUser?: UserProfile;
  onClearPrefill?: () => void;
}

// Initial seed trips (real community runs on verified trails)
const INITIAL_DEMO_TRIPS: Trip[] = [
  {
    id: "trip-fins-and-things",
    trailId: "trail-fins-and-things",
    trailName: "Fins & Things (Badge of Honor)",
    title: "Saturday Sandstone Fins & Frenchie's Fin Run",
    description: "Morning technical run tackling the slickrock domes and steep fin climbs. Air down to 12-14 PSI at the north staging parking lot. Full recovery kit and spotters on Frenchie's Fin.",
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days ahead
    endTime: new Date(Date.now() + 86400000 * 2 + 14400000).toISOString(), // +4 hours
    meetingLocation: "Fins & Things North Entrance Staging Lot, Sand Flats Rd, Moab, UT",
    meetingPointCoordinates: { lat: 38.5815, lng: -109.4795 },
    organizerId: "host-utah-guide",
    organizerProfile: {
      id: "host-utah-guide",
      fullName: "Red Rock Trail Guide",
      defaultRig: "Jeep Wrangler Rubicon 392 (37s)"
    },
    maxRigs: 8,
    difficultyRating: "Moderate",
    minimumRequirements: ['33" Tires min', 'Rear Locker required', 'Full-size spare', 'Rated recovery points'],
    commsChannel: "GMRS Channel 16 / 462.575 MHz (Standard 4x4)",
    status: "Upcoming",
    createdAt: new Date().toISOString()
  },
  {
    id: "trip-hells-revenge",
    trailId: "trail-hells-revenge",
    trailName: "Hell's Revenge (Badge of Honor)",
    title: "Escalator & Hell's Gate Technical Crawl",
    description: "High exposure slickrock crawling. Minimum 35-inch tires and true locking differentials strongly advised for the optional Hell's Gate and Escalator hot tubs.",
    startTime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days ahead
    endTime: new Date(Date.now() + 86400000 * 5 + 18000000).toISOString(), // +5 hours
    meetingLocation: "Sand Flats Recreation Area Staging Kiosk, Moab, UT",
    meetingPointCoordinates: { lat: 38.5756, lng: -109.5211 },
    organizerId: "host-crawler-pro",
    organizerProfile: {
      id: "host-crawler-pro",
      fullName: "Moab Expeditions Lead",
      defaultRig: "Built JLU on 40s & Dynatrac 60s"
    },
    maxRigs: 6,
    difficultyRating: "Hard",
    minimumRequirements: ['35" Tires min', 'Front Locker required', 'Rear Locker required', 'Winch required'],
    commsChannel: "GMRS Channel 19 / 462.650 MHz",
    status: "Upcoming",
    createdAt: new Date().toISOString()
  },
  {
    id: "trip-beasley-knob",
    trailId: "trail-beasley-knob",
    trailName: "Beasley Knob OHV Trail System",
    title: "Chattahoochee Mountain Forest & Clay Ruts",
    description: "Exploring the 93B mountain ridge cutouts and hill climbs in Blairsville. Winch and mud terrain tires recommended if damp.",
    startTime: new Date(Date.now() + 86400000 * 9).toISOString(), // 9 days ahead
    endTime: new Date(Date.now() + 86400000 * 9 + 18000000).toISOString(),
    meetingLocation: "Beasley Knob Trailhead Staging, Blairsville, GA",
    meetingPointCoordinates: { lat: 34.8465, lng: -83.9142 },
    organizerId: "host-appalachian",
    organizerProfile: {
      id: "host-appalachian",
      fullName: "Blue Ridge 4x4 Host",
      defaultRig: "Jeep Gladiator Rubicon"
    },
    maxRigs: 8,
    difficultyRating: "Hard",
    minimumRequirements: ['33" Tires min', 'Winch required', 'Rated recovery points'],
    commsChannel: "GMRS Channel 16 / 462.575 MHz (Standard 4x4)",
    status: "Upcoming",
    createdAt: new Date().toISOString()
  }
];

export default function TrailRunScheduler({
  trails,
  prefillTrail,
  currentUser: propUser,
  onClearPrefill
}: TrailRunSchedulerProps) {
  const [currentUser] = useState<UserProfile>(propUser || getLocalUserProfile());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(Boolean(prefillTrail));

  // Open modal whenever prefillTrail is passed from parent
  useEffect(() => {
    if (prefillTrail) {
      setIsPlanModalOpen(true);
    }
  }, [prefillTrail]);

  // Load trips from Supabase or local storage
  const fetchTrips = useCallback(async () => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          id,
          trail_id,
          trail_name,
          title,
          description,
          start_time,
          end_time,
          meeting_location,
          meeting_point_coordinates,
          organizer_id,
          max_rigs,
          difficulty_rating,
          minimum_requirements,
          comms_channel,
          status,
          created_at,
          profiles (
            id,
            full_name,
            avatar_url,
            default_rig
          )
        `)
        .order('start_time', { ascending: true });

      if (data && !error) {
        const mapped: Trip[] = data.map((t: any) => ({
          id: t.id,
          trailId: t.trail_id,
          trailName: t.trail_name,
          title: t.title,
          description: t.description,
          startTime: t.start_time,
          endTime: t.end_time,
          meetingLocation: t.meeting_location,
          meetingPointCoordinates: t.meeting_point_coordinates,
          organizerId: t.organizer_id,
          organizerProfile: t.profiles ? {
            id: t.profiles.id,
            fullName: t.profiles.full_name,
            avatarUrl: t.profiles.avatar_url,
            defaultRig: t.profiles.default_rig
          } : undefined,
          maxRigs: t.max_rigs,
          difficultyRating: t.difficulty_rating,
          minimumRequirements: t.minimum_requirements || [],
          commsChannel: t.comms_channel,
          status: t.status,
          createdAt: t.created_at
        }));
        setTrips(mapped);
        return;
      }
    }

    // Local session fallback
    try {
      const stored = localStorage.getItem('local_trail_trips');
      if (stored) {
        setTrips(JSON.parse(stored));
      } else {
        setTrips(INITIAL_DEMO_TRIPS);
        localStorage.setItem('local_trail_trips', JSON.stringify(INITIAL_DEMO_TRIPS));
      }
    } catch (e) {
      setTrips(INITIAL_DEMO_TRIPS);
    }
  }, []);

  useEffect(() => {
    fetchTrips();

    // Supabase Realtime subscription for trips
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('trips-feed')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trips' },
          () => {
            fetchTrips();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchTrips]);

  const handleTripCreated = (newTrip: Trip) => {
    setTrips(prev => [newTrip, ...prev]);
    setSelectedTrip(newTrip);
  };

  const handleClosePlanModal = () => {
    setIsPlanModalOpen(false);
    onClearPrefill?.();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Supabase Status Banner (Truthful & Transparent labeling) */}
      {!isSupabaseConfigured && (
        <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-4 text-xs flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-stone-300">
              <span className="font-heading font-bold text-stone-100 flex items-center gap-2">
                Running in Local Storage Mode (Supabase Not Connected)
              </span>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                Your group runs, RSVPs, and discussion messages are currently stored on-device in your browser's local storage.
                To activate multi-user live realtime cloud synchronization, run <code className="bg-stone-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">supabase/schema.sql</code> in your Supabase SQL Editor and set <code className="bg-stone-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">VITE_SUPABASE_URL</code> & <code className="bg-stone-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">VITE_SUPABASE_ANON_KEY</code> in your environment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Calendar */}
      <TripCalendar
        trips={trips}
        onSelectTrip={(trip) => setSelectedTrip(trip)}
        onOpenPlanRunModal={() => setIsPlanModalOpen(true)}
      />

      {/* Plan Run Modal */}
      {isPlanModalOpen && (
        <PlanRunModal
          trails={trails}
          prefillTrail={prefillTrail}
          currentUser={currentUser}
          onClose={handleClosePlanModal}
          onTripCreated={handleTripCreated}
        />
      )}

      {/* Trip Detail Drawer */}
      {selectedTrip && (
        <TripDetailDrawer
          trip={selectedTrip}
          currentUser={currentUser}
          onClose={() => setSelectedTrip(null)}
          onTripUpdated={fetchTrips}
        />
      )}
    </div>
  );
}
