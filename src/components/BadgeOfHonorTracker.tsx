import React, { useState } from 'react';
import { Award, CheckCircle2, Star, Calendar, Truck, Gauge, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import { Trail4x4, JeepRig, OffroadLogbookEntry } from '../types';

interface BadgeOfHonorTrackerProps {
  trails: Trail4x4[];
  activeRig: JeepRig;
  logbook: OffroadLogbookEntry[];
  onAddLogEntry: (entry: OffroadLogbookEntry) => void;
}

export default function BadgeOfHonorTracker({
  trails,
  activeRig,
  logbook,
  onAddLogEntry
}: BadgeOfHonorTrackerProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTrailId, setSelectedTrailId] = useState<string>(trails[0]?.id || '');
  const [psiUsed, setPsiUsed] = useState<number>(14);
  const [notes, setNotes] = useState<string>('');
  const [favoriteLine, setFavoriteLine] = useState<string>('');

  const bohTrails = trails.filter(t => t.isBadgeOfHonor);
  const conqueredTrailIds = new Set(logbook.map(l => l.trailId));
  const totalPoints = bohTrails.filter(t => conqueredTrailIds.has(t.id)).reduce((acc, t) => acc + (t.badgePoints || 10), 0);

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const trail = trails.find(t => t.id === selectedTrailId);
    if (!trail) return;

    const newEntry: OffroadLogbookEntry = {
      id: `log-${Date.now()}`,
      trailId: trail.id,
      trailName: trail.name,
      dateCompleted: new Date().toISOString().split('T')[0],
      rigId: activeRig.id,
      rigName: activeRig.name,
      tirePsiUsed: psiUsed,
      obstaclesAttempted: trail.obstacles.map(o => o.name),
      bypassesUsed: [],
      recoveryEvents: 'None - Clean Run',
      trailDamage: 'None / Skid plate scrapes only',
      favoriteLine: favoriteLine || 'Main trail obstacle line',
      badgeClaimed: trail.isBadgeOfHonor,
      notes: notes || 'Great day on the trail.'
    };

    onAddLogEntry(newEntry);
    setShowLogModal(false);
    setNotes('');
    setFavoriteLine('');
  };

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-5 shadow-2xl space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
              JEEP BADGE OF HONOR & TRAIL LOGBOOK
            </h2>
            <p className="text-xs text-stone-400">
              Track officially certified trail badges & maintain your off-road run logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-stone-950 px-4 py-2 rounded-xl border border-stone-800 text-center font-mono">
            <span className="text-[10px] text-stone-500 block uppercase">BADGES CONQUERED</span>
            <span className="text-base font-extrabold text-amber-400">
              {conqueredTrailIds.size} / {bohTrails.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-extrabold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Log Completed Run</span>
          </button>
        </div>
      </div>

      {/* Badge Grid Display */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-stone-200 text-sm uppercase flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          Official Badge of Honor Registry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bohTrails.map((trail) => {
            const isConquered = conqueredTrailIds.has(trail.id);
            return (
              <div
                key={trail.id}
                className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                  isConquered
                    ? 'bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border-amber-500/80 shadow-lg shadow-amber-500/10'
                    : 'bg-stone-950/60 border-stone-800/80 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center">
                    {isConquered ? (
                      <Award className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ) : (
                      <Award className="w-5 h-5 text-stone-600" />
                    )}
                  </div>
                  {isConquered ? (
                    <span className="px-2 py-0.5 bg-amber-500 text-stone-950 rounded text-[9px] font-mono font-black uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      EARNED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-stone-900 text-stone-500 rounded text-[9px] font-mono uppercase">
                      UNLOCKED
                    </span>
                  )}
                </div>

                <h4 className="font-heading font-bold text-stone-100 text-sm mb-0.5">{trail.name}</h4>
                <p className="text-xs text-stone-400 font-mono mb-2">{trail.region}</p>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-stone-800/80 text-stone-400">
                  <span>Rating: <strong className="text-amber-400">{trail.difficultyScale}/10</strong></span>
                  <span>Length: <strong className="text-stone-300">{trail.lengthMiles} mi</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trail Log History */}
      {logbook.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-stone-800">
          <h3 className="font-heading font-bold text-stone-200 text-sm uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Recent Logged Trail Runs ({logbook.length})
          </h3>

          <div className="space-y-2.5">
            {logbook.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-stone-100">{entry.trailName}</span>
                    <span className="text-[10px] text-stone-500">{entry.dateCompleted}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400">
                    <span>Rig: <strong className="text-stone-300">{entry.rigName}</strong></span>
                    <span>PSI: <strong className="text-amber-400">{entry.tirePsiUsed} PSI</strong></span>
                    <span>Line: <strong className="text-stone-300">{entry.favoriteLine}</strong></span>
                  </div>
                </div>

                <div className="text-stone-400 text-[11px] max-w-xs italic">
                  "{entry.notes}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-heading font-bold text-white text-base uppercase">
                LOG COMPLETED OFF-ROAD RUN
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-stone-400 block mb-1">Select Conquered Trail</label>
                <select
                  value={selectedTrailId}
                  onChange={(e) => setSelectedTrailId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
                >
                  {trails.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Tire Pressure Run (PSI)</label>
                  <input
                    type="number"
                    value={psiUsed}
                    onChange={(e) => setPsiUsed(parseInt(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Rig Used</label>
                  <input
                    type="text"
                    disabled
                    value={activeRig.name}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Favorite Line / Obstacle Highlights</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared Escalator without winching!"
                  value={favoriteLine}
                  onChange={(e) => setFavoriteLine(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Trail Notes & Memories</label>
                <textarea
                  rows={3}
                  placeholder="Trail conditions, group members, recovery notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                >
                  Save to Logbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
