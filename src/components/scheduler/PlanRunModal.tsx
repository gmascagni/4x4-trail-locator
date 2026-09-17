import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  Radio, 
  ShieldAlert, 
  Users, 
  Flame, 
  Sparkles,
  Compass
} from 'lucide-react';
import { Trail4x4, Trip, UserProfile, TripDifficulty, RigDetails } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface PlanRunModalProps {
  trails: Trail4x4[];
  prefillTrail?: Trail4x4 | null;
  currentUser: UserProfile;
  onClose: () => void;
  onTripCreated: (newTrip: Trip) => void;
}

const COMMON_REQUIREMENTS = [
  'Full-size spare',
  'Rated recovery points',
  '33" Tires min',
  '35" Tires min',
  '37" Tires min',
  'Rear Locker required',
  'Front Locker required',
  'Winch required',
  'Rock sliders',
  'Skid plates',
  'GMRS / CB Radio'
];

const RADIO_CHANNELS = [
  'GMRS Channel 16 / 462.575 MHz (Standard 4x4)',
  'GMRS Channel 19 / 462.650 MHz',
  'GMRS Channel 4 / 462.6375 MHz',
  'CB Channel 4 (27.005 MHz)',
  'CB Channel 16 (27.155 MHz 4x4)',
  'HAM 2m 146.520 MHz FM Simplex'
];

export default function PlanRunModal({
  trails,
  prefillTrail,
  currentUser,
  onClose,
  onTripCreated
}: PlanRunModalProps) {
  // Form fields
  const [selectedTrailId, setSelectedTrailId] = useState<string>(prefillTrail?.id || trails[0]?.id || '');
  const [title, setTitle] = useState(prefillTrail ? `${prefillTrail.name} Group Run` : '');
  const [description, setDescription] = useState('');

  // Default start time: tomorrow at 09:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(14, 0, 0, 0);

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [startTime, setStartTime] = useState(formatDateTimeLocal(tomorrow));
  const [endTime, setEndTime] = useState(formatDateTimeLocal(tomorrowEnd));

  const selectedTrail = trails.find(t => t.id === selectedTrailId) || prefillTrail;

  const [meetingLocation, setMeetingLocation] = useState(
    selectedTrail ? `Staging Area: ${selectedTrail.address}` : 'Trailhead Staging Lot'
  );
  const [maxRigs, setMaxRigs] = useState(8);
  const [difficulty, setDifficulty] = useState<TripDifficulty>(
    selectedTrail?.difficultyScale && selectedTrail.difficultyScale >= 7 ? 'Hard' :
    selectedTrail?.difficultyScale && selectedTrail.difficultyScale >= 4 ? 'Moderate' : 'Easy'
  );
  const [commsChannel, setCommsChannel] = useState(RADIO_CHANNELS[0]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([
    'Full-size spare',
    'Rated recovery points'
  ]);

  // Host Rig details
  const [hostRigYear, setHostRigYear] = useState(2024);
  const [hostRigMake, setHostRigMake] = useState('Jeep');
  const [hostRigModel, setHostRigModel] = useState('Wrangler Rubicon');
  const [hostTireSize, setHostTireSize] = useState(35);
  const [hostHasWinch, setHostHasWinch] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle trail change
  const handleTrailChange = (trailId: string) => {
    setSelectedTrailId(trailId);
    const t = trails.find(x => x.id === trailId);
    if (t) {
      if (!title || title.includes('Group Run')) {
        setTitle(`${t.name} Group Run`);
      }
      setMeetingLocation(`Staging Area: ${t.address}`);
      if (t.difficultyScale >= 8) setDifficulty('Extreme');
      else if (t.difficultyScale >= 6) setDifficulty('Hard');
      else if (t.difficultyScale >= 4) setDifficulty('Moderate');
      else setDifficulty('Easy');
    }
  };

  const toggleRequirement = (req: string) => {
    setSelectedRequirements(prev =>
      prev.includes(req) ? prev.filter(r => r !== req) : [...prev, req]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!title.trim()) {
      setErrorMessage('Please enter a run title.');
      return;
    }
    if (!selectedTrail) {
      setErrorMessage('Please select a trail for this run.');
      return;
    }

    setIsSubmitting(true);

    const tripId = `trip-${Date.now()}`;
    const startIso = new Date(startTime).toISOString();
    const endIso = endTime ? new Date(endTime).toISOString() : undefined;

    const newTrip: Trip = {
      id: tripId,
      trailId: selectedTrail.id,
      trailName: selectedTrail.name,
      title: title.trim(),
      description: description.trim(),
      startTime: startIso,
      endTime: endIso,
      meetingLocation: meetingLocation.trim(),
      meetingPointCoordinates: selectedTrail.location ? {
        lat: selectedTrail.location.lat,
        lng: selectedTrail.location.lng
      } : undefined,
      organizerId: currentUser.id,
      organizerProfile: currentUser,
      maxRigs,
      difficultyRating: difficulty,
      minimumRequirements: selectedRequirements,
      commsChannel,
      status: 'Upcoming',
      createdAt: new Date().toISOString()
    };

    const hostRigDetails: RigDetails = {
      year: hostRigYear,
      make: hostRigMake,
      model: hostRigModel,
      tireSize: hostTireSize,
      hasWinch: hostHasWinch
    };

    if (isSupabaseConfigured) {
      try {
        const { data: insertedTrip, error: tripError } = await supabase
          .from('trips')
          .insert({
            trail_id: newTrip.trailId,
            trail_name: newTrip.trailName,
            title: newTrip.title,
            description: newTrip.description,
            start_time: newTrip.startTime,
            end_time: newTrip.endTime,
            meeting_location: newTrip.meetingLocation,
            meeting_point_coordinates: newTrip.meetingPointCoordinates,
            organizer_id: currentUser.id,
            max_rigs: newTrip.maxRigs,
            difficulty_rating: newTrip.difficultyRating,
            minimum_requirements: newTrip.minimumRequirements,
            comms_channel: newTrip.commsChannel,
            status: 'Upcoming'
          })
          .select()
          .single();

        if (tripError) {
          console.error('Supabase trip insert error:', tripError);
          setErrorMessage(tripError.message);
          setIsSubmitting(false);
          return;
        }

        if (insertedTrip) {
          newTrip.id = insertedTrip.id;

          // Register host as participant
          await supabase
            .from('trip_participants')
            .insert({
              trip_id: insertedTrip.id,
              user_id: currentUser.id,
              rig_details: hostRigDetails,
              role: 'Host',
              status: 'Going'
            });
        }
      } catch (err: any) {
        console.error('Database submission failed:', err);
        setErrorMessage(err.message || 'Failed to schedule trip');
        setIsSubmitting(false);
        return;
      }
    } else {
      // Local fallback persistence
      try {
        const existingRaw = localStorage.getItem('local_trail_trips');
        const list: Trip[] = existingRaw ? JSON.parse(existingRaw) : [];
        list.unshift(newTrip);
        localStorage.setItem('local_trail_trips', JSON.stringify(list));

        // Save host participant
        const hostParticipant = {
          id: `part-host-${newTrip.id}`,
          tripId: newTrip.id,
          userId: currentUser.id,
          userProfile: currentUser,
          rigDetails: hostRigDetails,
          role: 'Host',
          status: 'Going',
          joinedAt: new Date().toISOString()
        };
        localStorage.setItem(`trip_roster_${newTrip.id}`, JSON.stringify([hostParticipant]));
      } catch (e) {}
    }

    setIsSubmitting(false);
    onTripCreated(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-black text-stone-100">
                Plan a Group Trail Run
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                Schedule a convoy, establish rig criteria, and open community RSVPs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="px-5 py-2.5 bg-red-950/50 border-b border-red-800 text-red-300 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs">
          {/* Trail Selector & Run Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-heading font-bold text-stone-300 block mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Target Trail
              </label>
              <select
                value={selectedTrailId}
                onChange={(e) => handleTrailChange(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                required
              >
                {trails.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-heading font-bold text-stone-300 block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Run Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Saturday Rock Crawl & Ridge Overlook"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">
                Start Time (Rendezvous)
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">
                Estimated Wrap-up Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Meeting Point & Comms Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-heading font-bold text-stone-300 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Meeting Point / Staging Area
              </label>
              <input
                type="text"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="e.g. Shell Gas Station Air Down Lot, Hwy 128"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono placeholder-stone-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="font-heading font-bold text-stone-300 block mb-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                Comms Radio Channel
              </label>
              <select
                value={commsChannel}
                onChange={(e) => setCommsChannel(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-500"
              >
                {RADIO_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Convoy Size & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-heading font-bold text-stone-300 block mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Convoy Limit ({maxRigs} Rigs Maximum)
              </label>
              <input
                type="range"
                min={3}
                max={15}
                value={maxRigs}
                onChange={(e) => setMaxRigs(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-stone-500 mt-1">
                <span>Small Squad (3)</span>
                <span>Standard Convoy (8)</span>
                <span>Club Run (15)</span>
              </div>
            </div>

            <div>
              <label className="font-heading font-bold text-stone-300 block mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Run Difficulty Rating
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TripDifficulty)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="Easy">Easy (Stock Friendly / Scenic)</option>
                <option value="Moderate">Moderate (33" Tires / Rock Sliders)</option>
                <option value="Hard">Hard (35"+ Tires / Lockers Required)</option>
                <option value="Extreme">Extreme (37"+ Buggy / High Damage Risk)</option>
              </select>
            </div>
          </div>

          {/* Minimum Rig Requirements Checklist */}
          <div>
            <label className="font-heading font-bold text-stone-300 block mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Minimum Rig Requirements for Attendees
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-stone-950 rounded-xl border border-stone-800 font-mono text-[11px]">
              {COMMON_REQUIREMENTS.map((req) => (
                <label key={req} className="flex items-center gap-2 text-stone-300 cursor-pointer hover:text-stone-100">
                  <input
                    type="checkbox"
                    checked={selectedRequirements.includes(req)}
                    onChange={() => toggleRequirement(req)}
                    className="rounded border-stone-700 text-amber-500 focus:ring-0"
                  />
                  <span>{req}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Briefing / Description */}
          <div>
            <label className="font-heading font-bold text-stone-300 block mb-1.5">
              Trail Run Briefing & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline obstacle line choices, recovery expectations, air down procedures, lunch spot, etc."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Host Rig Information */}
          <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <span className="font-heading font-bold text-stone-300 block text-xs">
              Host Lead Rig Details (Shown on Convoy Roster)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-stone-500 block mb-1">Year</span>
                <input
                  type="number"
                  value={hostRigYear}
                  onChange={(e) => setHostRigYear(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-100"
                />
              </div>
              <div>
                <span className="text-stone-500 block mb-1">Make / Model</span>
                <input
                  type="text"
                  value={`${hostRigMake} ${hostRigModel}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setHostRigMake(parts[0] || '');
                    setHostRigModel(parts.slice(1).join(' ') || '');
                  }}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-100"
                />
              </div>
              <div>
                <span className="text-stone-500 block mb-1">Tires (Inches)</span>
                <input
                  type="number"
                  value={hostTireSize}
                  onChange={(e) => setHostTireSize(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-100"
                />
              </div>
              <div className="flex items-center pt-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={hostHasWinch}
                    onChange={(e) => setHostHasWinch(e.target.checked)}
                    className="rounded border-stone-700 text-amber-500 focus:ring-0"
                  />
                  <span>Winch Equipped</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-heading font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-bold text-xs rounded-xl transition-colors shadow-lg flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Run...' : 'Publish Group Run'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
