import React, { useState } from 'react';
import { X, Copy, Check, Share2, MapPin, Radio, Award } from 'lucide-react';
import { Trail4x4 } from '../types';

interface ShareTrailModalProps {
  trail: Trail4x4;
  onClose: () => void;
}

export default function ShareTrailModal({ trail, onClose }: ShareTrailModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `[4x4 Trail Information: ${trail.name}]\nRegion: ${trail.region}\nRating: ${trail.difficultyScale}/10 (${trail.difficultyCategory})\nStatus: ${trail.trailheadStatus}\nTire Rec: ${trail.recommendedTireSize}"+\nMin Clearance: ${trail.minClearanceInches}"\nGPS Coordinates: ${trail.location.lat.toFixed(5)}, ${trail.location.lng.toFixed(5)}\nGoogle Maps: https://maps.google.com/?q=${trail.location.lat},${trail.location.lng}\nComms Channel: ${trail.emergencyRadioChannel}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-bold text-white text-base uppercase">
              SHARE 4X4 TRAIL SPECS
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

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-stone-300 whitespace-pre-line leading-relaxed">
            {shareText}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`w-full py-2.5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
              copied
                ? 'bg-emerald-500 text-stone-950 shadow-lg'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Trail Details</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
