import React, { useState } from 'react';
import { Flag, X, Check, Droplets, AlertTriangle, Mountain, ShieldAlert } from 'lucide-react';
import { Trail4x4, CrowdsourcedConditionReport, TrailStatusType, JeepRig } from '../types';

interface ConditionReportModalProps {
  trail: Trail4x4;
  activeRig: JeepRig;
  onClose: () => void;
  onSubmitReport: (report: CrowdsourcedConditionReport) => void;
}

export default function ConditionReportModal({
  trail,
  activeRig,
  onClose,
  onSubmitReport
}: ConditionReportModalProps) {
  const [status, setStatus] = useState<TrailStatusType>(trail.trailheadStatus);
  const [waterDepth, setWaterDepth] = useState<number>(0);
  const [mudLevel, setMudLevel] = useState<"Dry" | "Moderate" | "Deep Mud / Winching Likely">("Dry");
  const [shelfCondition, setShelfCondition] = useState<"Clear" | "Loose Rock" | "Washout / Narrow">("Clear");
  const [hasSnow, setHasSnow] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [reportedBy, setReportedBy] = useState<string>('Trail Navigator');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: CrowdsourcedConditionReport = {
      id: `report-${Date.now()}`,
      trailId: trail.id,
      trailName: trail.name,
      reportDate: new Date().toISOString().split('T')[0],
      reportedBy: reportedBy || 'Anonymous Jeeper',
      rigUsed: activeRig.name,
      status,
      waterCrossingDepthInches: waterDepth,
      mudLevel,
      shelfRoadCondition: shelfCondition,
      snowIcePresent: hasSnow,
      fallenTreesObstacles: 'None reported',
      notes: notes || 'Trail in standard runnable condition.',
      ratingScore: 5
    };

    onSubmitReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-heading font-bold text-white text-base uppercase">
              POST 4X4 TRAIL CONDITION REPORT
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-400 font-mono">
          Reporting for: <strong className="text-stone-200">{trail.name}</strong> ({trail.region})
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="text-stone-400 block mb-1">Overall Trailhead Status</label>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
            >
              <option value="Open">Open - Good Traction</option>
              <option value="Caution">Caution - High Water / Obstacles</option>
              <option value="Closed">Closed - Impassable / Washout</option>
              <option value="Seasonal Closure">Seasonal Winter Closure</option>
              <option value="Permit Required">Permit Required</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-400 block mb-1">Water Crossing Depth</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={waterDepth}
                  onChange={(e) => setWaterDepth(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
                />
                <span className="text-stone-400 font-bold">in</span>
              </div>
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Mud & Traction</label>
              <select
                value={mudLevel}
                onChange={(e: any) => setMudLevel(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
              >
                <option value="Dry">Dry / High Grip</option>
                <option value="Moderate">Moderate Mud</option>
                <option value="Deep Mud / Winching Likely">Deep Mud / Winch Needed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-400 block mb-1">Shelf Road / Rockslides</label>
              <select
                value={shelfCondition}
                onChange={(e: any) => setShelfCondition(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
              >
                <option value="Clear">Clear & Stable</option>
                <option value="Loose Rock">Loose Scree / Rockfall</option>
                <option value="Washout / Narrow">Narrow Shelf Washout</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSnow}
                  onChange={(e) => setHasSnow(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>Snow / Ice on Route</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-stone-400 block mb-1">Field Notes & Spotter Advice</label>
            <textarea
              rows={3}
              placeholder="e.g. River crossing was at bumper height. Top ledges are dry. Winched once on Escalator..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-100"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
            >
              Broadcast Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
