import React, { useState } from 'react';
import { Trail4x4, JeepRig } from '../types';
import { 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Gauge, 
  Radio, 
  Mountain, 
  Compass, 
  Clock, 
  Maximize, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Flag,
  CloudSun,
  Layers,
  Sparkles
} from 'lucide-react';
import { getDifficultyScaleBadge, getStatusBadge } from '../services/trailService';
import { calculateRigMatch } from '../utils/rigMatcher';

interface TrailCardProps {
  trail: Trail4x4;
  activeRig: JeepRig;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenReportModal?: (trail: Trail4x4) => void;
  onOpenShareModal?: (trail: Trail4x4) => void;
  onOpenInclinometer?: (trail: Trail4x4) => void;
}

export default function TrailCard({
  trail,
  activeRig,
  isSelected,
  onSelect,
  onOpenReportModal,
  onOpenShareModal,
  onOpenInclinometer
}: TrailCardProps) {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [showObstacles, setShowObstacles] = useState(false);
  const [showRigAnalysis, setShowRigAnalysis] = useState(false);

  const diffBadge = getDifficultyScaleBadge(trail.difficultyScale);
  const statusBadge = getStatusBadge(trail.trailheadStatus);
  const rigMatch = calculateRigMatch(activeRig, trail);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % trail.photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + trail.photos.length) % trail.photos.length);
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-stone-900/90 rounded-2xl border transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl cursor-pointer ${
        isSelected 
          ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-amber-500/10' 
          : 'border-stone-800 hover:border-stone-700'
      }`}
    >
      {/* Badge of Honor Top Banner */}
      {trail.isBadgeOfHonor && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 py-1 px-4 flex items-center justify-between text-stone-950 font-heading font-extrabold text-xs tracking-wider shadow-inner">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 fill-stone-950" />
            <span>OFFICIAL JEEP BADGE OF HONOR TRAIL</span>
          </div>
          <span className="font-mono text-[10px] bg-stone-950/20 px-1.5 py-0.5 rounded font-bold">
            +{trail.badgePoints} PTS
          </span>
        </div>
      )}

      {/* Photorealistic Media Carousel */}
      <div className="relative h-56 w-full overflow-hidden bg-stone-950 select-none">
        <img
          src={trail.photos[currentPhotoIdx] || trail.photos[0]}
          alt={trail.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Vignette for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/60" />

        {/* Difficulty Scale Badge & Status */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
          <div className={`px-2.5 py-1 rounded-lg border font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-lg ${diffBadge.bg}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[11px] ${diffBadge.badgeNumColor}`}>
              {trail.difficultyScale}
            </span>
            <span>{diffBadge.label}</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] flex items-center gap-1.5 backdrop-blur-md shadow-lg ${statusBadge.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.label}</span>
          </div>
        </div>

        {/* Photo Nav Arrows */}
        {trail.photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-950/70 hover:bg-stone-900 text-stone-200 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-stone-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-950/70 hover:bg-stone-900 text-stone-200 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-stone-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Location & Title on Photo */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-0.5">
            {trail.region}
          </p>
          <h3 className="text-xl font-heading font-extrabold text-white leading-tight drop-shadow-md">
            {trail.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Rig Compatibility Matcher Banner */}
        <div 
          onClick={(e) => { e.stopPropagation(); setShowRigAnalysis(!showRigAnalysis); }}
          className={`p-3 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${rigMatch.color}`}
        >
          <div className="flex items-center gap-2.5">
            <Wrench className="w-4 h-4 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xs uppercase">RIG MATCH:</span>
                <span className="font-extrabold text-xs">{rigMatch.status}</span>
                <span className="font-mono text-[10px] opacity-80">({rigMatch.score}%)</span>
              </div>
              <p className="text-[11px] opacity-90 leading-tight">
                Tested against: <span className="font-semibold">{activeRig.name}</span>
              </p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${showRigAnalysis ? 'rotate-90' : ''}`} />
        </div>

        {/* Expandable Rig Analysis */}
        {showRigAnalysis && (
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs space-y-2 text-stone-300">
            <h4 className="font-heading font-bold text-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Rig Capability Diagnostics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                {rigMatch.passesClearance ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                <span>Clearance: {trail.minClearanceInches}" req</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rigMatch.passesTires ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                <span>Tires: {trail.recommendedTireSize}"+ req</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rigMatch.passesLockers ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-amber-400" />}
                <span>Lockers: {trail.requiresRearLocker ? 'Rear req' : 'Optional'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rigMatch.passesWinch ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                <span>Winch: {trail.winchRecommended ? 'Recommended' : 'Optional'}</span>
              </div>
            </div>

            {rigMatch.warnings.length > 0 && (
              <div className="pt-2 border-t border-stone-800 space-y-1">
                {rigMatch.warnings.map((w, i) => (
                  <p key={i} className="text-amber-400 flex items-start gap-1.5 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trail Specs Grid */}
        <div className="grid grid-cols-4 gap-2 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80 text-center font-mono">
          <div>
            <span className="text-[10px] text-stone-500 block">LENGTH</span>
            <span className="text-xs font-bold text-stone-200">{trail.lengthMiles} mi</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">TIME</span>
            <span className="text-xs font-bold text-stone-200">{trail.estimatedDriveTimeHours}h</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">ELEV GAIN</span>
            <span className="text-xs font-bold text-amber-400">+{trail.elevationGainFt} ft</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">PEAK ALT</span>
            <span className="text-xs font-bold text-stone-200">{trail.highestElevationFt} ft</span>
          </div>
        </div>

        {/* Terrain Tags */}
        <div className="flex flex-wrap gap-1.5">
          {trail.terrainTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-300 text-[10px] font-mono border border-stone-700/60 flex items-center gap-1"
            >
              <Mountain className="w-2.5 h-2.5 text-amber-400" />
              {tag}
            </span>
          ))}
        </div>

        {/* Trail Description */}
        <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
          {trail.description}
        </p>

        {/* Tire Pressure & Radio Details */}
        <div className="flex items-center justify-between p-2.5 bg-amber-950/20 rounded-xl border border-amber-500/20 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-amber-400 block font-bold uppercase">AIR DOWN REC</span>
              <span className="text-xs font-extrabold text-stone-200">{trail.recommendedPsi.crawling} - {trail.recommendedPsi.gravel} PSI</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 block uppercase">RADIO COMMS</span>
            <span className="text-[11px] font-bold text-stone-300">{trail.emergencyRadioChannel}</span>
          </div>
        </div>

        {/* Key Obstacles Accordion Button */}
        {trail.obstacles.length > 0 && (
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowObstacles(!showObstacles);
              }}
              className="w-full py-2 px-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/60 text-xs font-heading font-bold text-stone-200 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                KEY OBSTACLES ({trail.obstacles.length})
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showObstacles ? 'rotate-90' : ''}`} />
            </button>

            {showObstacles && (
              <div className="mt-2 space-y-2 p-3 bg-stone-950 rounded-xl border border-stone-800">
                {trail.obstacles.map((obs, idx) => (
                  <div key={idx} className="pb-2 border-b border-stone-800/80 last:border-0 last:pb-0 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-bold text-stone-100">{obs.name}</span>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded border border-amber-500/40">
                          {obs.difficultyRating}/10
                        </span>
                        {obs.hasBypass ? (
                          <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded border border-emerald-700">
                            Bypass Avail
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-red-950 text-red-400 rounded border border-red-800">
                            No Bypass
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400">{obs.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-stone-800 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenInclinometer?.(trail);
            }}
            className="flex-1 py-2 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-heading font-bold text-xs rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Inclinometer</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReportModal?.(trail);
            }}
            className="flex-1 py-2 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-heading font-bold text-xs rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Post Report</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenShareModal?.(trail);
            }}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 rounded-xl border border-stone-700 transition-colors"
            title="Share Trail Coordinates"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
