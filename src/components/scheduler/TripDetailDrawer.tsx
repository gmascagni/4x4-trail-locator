import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Users, 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  ExternalLink,
  ShieldCheck,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { Trip, TripParticipant, UserProfile, RigDetails, TripRole, RSVPStatus, TripGoDecision } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import AddToCalendarButton from './AddToCalendarButton';
import DiscussionThread from './DiscussionThread';
import { TIRE_SIZE_OPTIONS, LIFT_KIT_OPTIONS } from './PlanRunModal';

interface TripDetailDrawerProps {
  trip: Trip;
  currentUser: UserProfile;
  onClose: () => void;
  onTripUpdated?: () => void;
  onUpdateTripDecision?: (tripId: string, decision: TripGoDecision, reason?: string) => void;
}

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Moderate: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  Hard: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Extreme: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' }
};

export default function TripDetailDrawer({
  trip,
  currentUser,
  onClose,
  onTripUpdated,
  onUpdateTripDecision
}: TripDetailDrawerProps) {
  const [roster, setRoster] = useState<TripParticipant[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(true);
  const [isEditingDecision, setIsEditingDecision] = useState(false);

  // RSVP Form State
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [year, setYear] = useState<number>(2023);
  const [make, setMake] = useState('Jeep');
  const [model, setModel] = useState('Wrangler Rubicon');
  const [tireSize, setTireSize] = useState<number>(35);
  const [liftKit, setLiftKit] = useState<string>('2.5" Lift');
  const [hasWinch, setHasWinch] = useState(true);
  const [role, setRole] = useState<TripRole>('Participant');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('Going');
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  // Fetch roster & subscribe to Realtime
  useEffect(() => {
    let isMounted = true;

    async function loadRoster() {
      setIsLoadingRoster(true);
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('trip_participants')
          .select(`
            id,
            trip_id,
            user_id,
            rig_details,
            role,
            status,
            joined_at,
            profiles (
              id,
              full_name,
              avatar_url,
              default_rig
            )
          `)
          .eq('trip_id', trip.id);

        if (data && !error && isMounted) {
          const mapped: TripParticipant[] = data.map((p: any) => ({
            id: p.id,
            tripId: p.trip_id,
            userId: p.user_id,
            rigDetails: typeof p.rig_details === 'string' 
              ? { year: 2024, make: '4x4', model: p.rig_details, tireSize: 33, hasWinch: false } 
              : p.rig_details,
            role: p.role,
            status: p.status,
            joinedAt: p.joined_at,
            userProfile: p.profiles ? {
              id: p.profiles.id,
              fullName: p.profiles.full_name,
              avatarUrl: p.profiles.avatar_url,
              defaultRig: p.profiles.default_rig
            } : undefined
          }));
          setRoster(mapped);
        }
      } else {
        // Fallback local storage
        try {
          const stored = localStorage.getItem(`trip_roster_${trip.id}`);
          if (stored && isMounted) {
            setRoster(JSON.parse(stored));
          } else if (isMounted) {
            // Include trip organizer as host initially
            const initialHost: TripParticipant = {
              id: `part-host-${trip.id}`,
              tripId: trip.id,
              userId: trip.organizerId,
              userProfile: trip.organizerProfile || {
                id: trip.organizerId,
                fullName: 'Trip Host'
              },
              rigDetails: {
                year: 2024,
                make: 'Jeep',
                model: 'Wrangler Rubicon 392',
                tireSize: 37,
                hasWinch: true,
                hasLockers: true
              },
              role: 'Host',
              status: 'Going',
              joinedAt: trip.createdAt
            };
            setRoster([initialHost]);
          }
        } catch (e) {}
      }
      if (isMounted) setIsLoadingRoster(false);
    }

    loadRoster();

    // Supabase Realtime channel for roster updates
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel(`roster-${trip.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trip_participants',
            filter: `trip_id=eq.${trip.id}`
          },
          () => {
            loadRoster();
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [trip.id]);

  const goingParticipants = roster.filter(p => p.status === 'Going');
  const openSpots = Math.max(0, trip.maxRigs - goingParticipants.length);
  const myParticipant = roster.find(p => p.userId === currentUser.id);

  const handleJoinRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRsvp) return;
    setIsSubmittingRsvp(true);

    const rigDetails: RigDetails = {
      year,
      make,
      model,
      tireSize,
      liftKit,
      hasWinch
    };

    // If no spots left, place in waitlist
    const effectiveRole: TripRole = openSpots <= 0 && role !== 'Host' ? 'Waitlist' : role;
    const effectiveStatus: RSVPStatus = rsvpStatus;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('trip_participants')
        .upsert({
          trip_id: trip.id,
          user_id: currentUser.id,
          rig_details: rigDetails,
          role: effectiveRole,
          status: effectiveStatus
        });

      if (error) {
        console.error('RSVP submission error:', error);
      } else {
        onTripUpdated?.();
      }
    } else {
      // Local session update
      const newPart: TripParticipant = {
        id: `part-${Date.now()}`,
        tripId: trip.id,
        userId: currentUser.id,
        userProfile: currentUser,
        rigDetails,
        role: effectiveRole,
        status: effectiveStatus,
        joinedAt: new Date().toISOString()
      };

      const updated = [...roster.filter(p => p.userId !== currentUser.id), newPart];
      setRoster(updated);
      try {
        localStorage.setItem(`trip_roster_${trip.id}`, JSON.stringify(updated));
      } catch (e) {}
    }

    setIsRsvpOpen(false);
    setIsSubmittingRsvp(false);
  };

  const handleCancelRsvp = async () => {
    if (!myParticipant) return;
    if (isSupabaseConfigured) {
      await supabase
        .from('trip_participants')
        .delete()
        .eq('id', myParticipant.id);
      onTripUpdated?.();
    } else {
      const updated = roster.filter(p => p.userId !== currentUser.id);
      setRoster(updated);
      try {
        localStorage.setItem(`trip_roster_${trip.id}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const diffStyle = DIFFICULTY_STYLES[trip.difficultyRating] || DIFFICULTY_STYLES.Moderate;

  const formatDateString = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const formatTimeString = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-2xl bg-stone-900 border-l border-stone-800 h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 bg-stone-950 border-b border-stone-800 sticky top-0 z-10 flex items-start justify-between">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
                {trip.difficultyRating} Difficulty
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                trip.status === 'Completed' || trip.title.includes('Example Only')
                  ? 'bg-stone-800 text-stone-400 border border-stone-700'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {trip.status === 'Completed' || trip.title.includes('Example Only') ? 'Past Run (Example Only)' : trip.status}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {trip.trailName}
              </span>
            </div>
            <h2 className="text-xl font-heading font-black text-stone-100 leading-tight">
              {trip.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* Go / No-Go Decision Banner */}
          <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
            trip.goDecision === 'NO_GO' || trip.status === 'Postponed' || trip.status === 'Cancelled'
              ? 'bg-red-950/40 border-red-700/60 text-red-200'
              : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs text-white ${
                  trip.goDecision === 'NO_GO' || trip.status === 'Postponed' || trip.status === 'Cancelled'
                    ? 'bg-red-600'
                    : 'bg-emerald-600'
                }`}>
                  {trip.goDecision === 'NO_GO' || trip.status === 'Postponed' || trip.status === 'Cancelled' ? '✕' : '✓'}
                </span>
                <div>
                  <h4 className="font-heading font-black text-sm uppercase tracking-wide">
                    {trip.goDecision === 'NO_GO' || trip.status === 'Postponed' || trip.status === 'Cancelled'
                      ? '🔴 NO-GO: Run Postponed / Called Off'
                      : '🟢 GO: Trail Ride Confirmed & Active'}
                  </h4>
                  <p className="text-[11px] font-mono text-stone-300">
                    {trip.goDecision === 'NO_GO' || trip.status === 'Postponed' || trip.status === 'Cancelled'
                      ? 'Inclement weather, trail condition, or turnout conflict. Convoy is suspended.'
                      : 'Weather and trail check clear. Convoy departure proceeding as planned.'}
                  </p>
                </div>
              </div>

              {/* Host Toggle Action */}
              <button
                type="button"
                onClick={() => setIsEditingDecision(!isEditingDecision)}
                className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-[11px] font-mono transition-colors"
              >
                {isEditingDecision ? 'Done' : 'Change Go/No-Go'}
              </button>
            </div>

            {/* Postponement Reason Alert */}
            {(trip.goDecision === 'NO_GO' || trip.status === 'Postponed' || trip.status === 'Cancelled') && trip.cancellationReason && (
              <div className="mt-1 p-2.5 bg-red-900/30 rounded-lg border border-red-800/40 text-[11.5px] font-mono text-red-200">
                <span className="font-bold text-red-300 block mb-0.5">⚠️ Reason for Cancellation / Postponement:</span>
                {trip.cancellationReason}
              </div>
            )}

            {/* Host Decision Edit Panel */}
            {isEditingDecision && (
              <div className="mt-2 pt-3 border-t border-stone-800 space-y-2.5 bg-stone-900/90 p-3 rounded-lg">
                <span className="text-[11px] font-heading font-bold text-stone-200 block">
                  Update Convoy Status & Decision:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateTripDecision?.(trip.id, 'GO');
                      setIsEditingDecision(false);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      trip.goDecision !== 'NO_GO' && trip.status !== 'Postponed'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-emerald-950/60'
                    }`}
                  >
                    🟢 GO (Ride Confirmed)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt("Enter reason for postponement / cancellation (e.g. Bad rain / trail washout / low turnout):", trip.cancellationReason || "Inclement weather forecasted.");
                      if (reason !== null) {
                        onUpdateTripDecision?.(trip.id, 'NO_GO', reason);
                        setIsEditingDecision(false);
                      }
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      trip.goDecision === 'NO_GO' || trip.status === 'Postponed'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-red-950/60'
                    }`}
                  >
                    🔴 NO-GO (Postponed / Cancelled)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Example / Past Notice Banner */}
          {(trip.status === 'Completed' || trip.title.includes('Example Only')) && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-700/40 rounded-xl text-xs text-amber-200 font-mono flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Historical Demonstration Run (Example Only)</strong>
                This run is provided solely as an example to illustrate convoy coordination, meeting locations, and rig criteria. It is not an active upcoming run, and registration is closed.
              </div>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Date & Time
              </span>
              <p className="font-bold text-stone-200">
                {formatDateString(trip.startTime)}
              </p>
              <p className="text-stone-400 text-[11px]">
                {formatTimeString(trip.startTime)} {trip.endTime ? `- ${formatTimeString(trip.endTime)}` : ''}
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Rendezvous Point
              </span>
              <p className="font-bold text-stone-200 line-clamp-1">
                {trip.meetingLocation}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(trip.meetingLocation)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-400" /> Radio Comms
              </span>
              <p className="font-bold text-stone-200">
                {trip.commsChannel}
              </p>
              <p className="text-stone-400 text-[11px]">
                Keep active during entire convoy
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Convoy Slots
              </span>
              <p className="font-bold text-stone-200">
                {openSpots > 0 ? `${openSpots} of ${trip.maxRigs} Slots Open` : 'Convoy Full (Waitlist)'}
              </p>
              <p className="text-stone-400 text-[11px]">
                {goingParticipants.length} confirmed rigs
              </p>
            </div>
          </div>

          {/* Action Row: Add to Calendar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-950 rounded-xl border border-stone-800">
            <div>
              <h4 className="text-xs font-heading font-bold text-stone-200">Trip Schedule Integration</h4>
              <p className="text-[11px] text-stone-400">Sync with your mobile device, Apple, or Google Calendar</p>
            </div>
            <AddToCalendarButton trip={trip} />
          </div>

          {/* Description & Overview */}
          {trip.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-heading font-bold text-stone-300 uppercase tracking-wider">
                Run Briefing & Details
              </h3>
              <p className="text-xs text-stone-300 bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 leading-relaxed">
                {trip.description}
              </p>
            </div>
          )}

          {/* Minimum Rig Requirements */}
          <div className="space-y-2">
            <h3 className="text-xs font-heading font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Minimum Rig Requirements
            </h3>
            <div className="flex flex-wrap gap-2">
              {trip.minimumRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-stone-950 text-stone-200 text-xs font-mono border border-stone-800 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{req}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Convoy Roster & RSVP Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-heading font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" />
                Convoy Roster ({roster.length} / {trip.maxRigs} Rigs)
              </h3>

              {!myParticipant && trip.goDecision !== 'NO_GO' && trip.status !== 'Postponed' && trip.status !== 'Cancelled' && trip.status !== 'Completed' && !trip.title.includes('Example Only') && (
                <button
                  type="button"
                  onClick={() => setIsRsvpOpen(!isRsvpOpen)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{openSpots > 0 ? 'RSVP / Join Convoy' : 'Join Waitlist'}</span>
                </button>
              )}
              {(trip.goDecision === 'NO_GO' || trip.status === 'Postponed' || trip.status === 'Cancelled') && (
                <span className="text-[11px] font-mono text-red-400 bg-red-950/50 border border-red-800/60 px-2.5 py-1 rounded-md">
                  Registration Locked (Run Postponed)
                </span>
              )}
              {trip.goDecision !== 'NO_GO' && trip.status !== 'Postponed' && trip.status !== 'Cancelled' && (trip.status === 'Completed' || trip.title.includes('Example Only')) && (
                <span className="text-[11px] font-mono text-stone-400 bg-stone-950 border border-stone-800 px-2.5 py-1 rounded-md">
                  Registration Closed (Example Run)
                </span>
              )}
            </div>

            {/* RSVP Form (Inline expansion) */}
            {isRsvpOpen && !myParticipant && (
              <form onSubmit={handleJoinRun} className="p-4 bg-stone-950 rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-heading font-bold text-stone-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Enter Rig Specifications for Convoy Clearance
                  </span>
                  <button type="button" onClick={() => setIsRsvpOpen(false)} className="text-stone-500 hover:text-stone-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block mb-1">Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-mono"
                      min={1960}
                      max={2027}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block mb-1">Make</label>
                    <input
                      type="text"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Jeep, Toyota"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-mono"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-mono text-stone-400 block mb-1">Model / Trim</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Wrangler Rubicon"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block mb-1">Tires (31" to 42")</label>
                    <select
                      value={tireSize}
                      onChange={(e) => setTireSize(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-mono"
                    >
                      {TIRE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>{size}" Tires</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block mb-1">Lift Kit (1" to 5")</label>
                    <select
                      value={liftKit}
                      onChange={(e) => setLiftKit(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-mono"
                    >
                      {LIFT_KIT_OPTIONS.map((lift) => (
                        <option key={lift} value={lift}>{lift}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as TripRole)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-100 font-mono"
                    >
                      <option value="Participant">Participant</option>
                      <option value="Tail Gunner / Sweep">Tail Gunner / Sweep</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <label className="flex items-center gap-2 text-stone-200 cursor-pointer font-mono text-[11px]">
                      <input
                        type="checkbox"
                        checked={hasWinch}
                        onChange={(e) => setHasWinch(e.target.checked)}
                        className="rounded border-stone-700 text-amber-500 focus:ring-0"
                      />
                      <span>Winch Installed</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRsvpOpen(false)}
                    className="px-3 py-1.5 text-stone-400 hover:text-stone-200 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRsvp}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    {isSubmittingRsvp ? 'Submitting...' : 'Confirm RSVP'}
                  </button>
                </div>
              </form>
            )}

            {/* My RSVP Status Card */}
            {myParticipant && (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-heading font-bold text-emerald-300 block">
                      You are registered ({myParticipant.role}) &bull; Status: {myParticipant.status}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      Rig: {myParticipant.rigDetails.year} {myParticipant.rigDetails.make} {myParticipant.rigDetails.model} ({myParticipant.rigDetails.tireSize}" Tires{myParticipant.rigDetails.liftKit && !myParticipant.rigDetails.liftKit.includes('No Lift') ? `, ${myParticipant.rigDetails.liftKit}` : ''})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelRsvp}
                  className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-[11px] font-mono rounded-lg transition-colors"
                >
                  Cancel RSVP
                </button>
              </div>
            )}

            {/* Participants Roster List */}
            <div className="space-y-2">
              {roster.map((p) => {
                const isHost = p.role === 'Host';
                const isTailGunner = p.role === 'Tail Gunner / Sweep';
                const isWaitlist = p.role === 'Waitlist';

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-stone-100">
                          {p.userProfile?.fullName || 'Trail Driver'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isHost ? 'bg-amber-500 text-stone-950' :
                          isTailGunner ? 'bg-blue-600 text-white' :
                          isWaitlist ? 'bg-stone-700 text-stone-300' :
                          'bg-stone-800 text-stone-300'
                        }`}>
                          {p.role}
                        </span>
                      </div>
                      <p className="text-stone-400 text-[11px] font-mono flex items-center gap-1.5 flex-wrap">
                        <span>{p.rigDetails.year} {p.rigDetails.make} {p.rigDetails.model}</span>
                        <span>&bull;</span>
                        <span>{p.rigDetails.tireSize}" Tires</span>
                        {p.rigDetails.liftKit && !p.rigDetails.liftKit.includes('No Lift') && (
                          <>
                            <span>&bull;</span>
                            <span className="text-amber-300 font-bold">{p.rigDetails.liftKit}</span>
                          </>
                        )}
                        {p.rigDetails.hasWinch && (
                          <>
                            <span>&bull;</span>
                            <span className="text-amber-400 font-bold">Winch</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full ${
                        p.status === 'Going' ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800' :
                        p.status === 'Maybe' ? 'text-amber-400 bg-amber-950/40 border border-amber-800' :
                        'text-stone-500 bg-stone-900 border border-stone-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Discussion & Chat Stream */}
          <div className="space-y-2 pt-2">
            <DiscussionThread tripId={trip.id} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
