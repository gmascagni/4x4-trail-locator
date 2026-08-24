import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ShieldAlert, 
  MapPin, 
  Share2, 
  Copy, 
  Check, 
  LifeBuoy, 
  AlertTriangle, 
  Wrench,
  Anchor,
  PhoneCall
} from 'lucide-react';
import { Trail4x4, JeepRig } from '../types';

interface SafetyBeaconProps {
  currentLocation?: { lat: number; lng: number } | null;
  activeRig: JeepRig;
  selectedTrail: Trail4x4 | null;
}

export default function SafetyBeacon({
  currentLocation,
  activeRig,
  selectedTrail
}: SafetyBeaconProps) {
  const [copied, setCopied] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>(
    currentLocation || (selectedTrail ? selectedTrail.location : { lat: 38.5772, lng: -109.5238 })
  );

  useEffect(() => {
    if (currentLocation) setGpsCoords(currentLocation);
    else if (selectedTrail) setGpsCoords(selectedTrail.location);
  }, [currentLocation, selectedTrail]);

  const emergencyMessage = `[4x4 OFFROAD SOS / RECOVERY BEACON]\nTrail: ${selectedTrail ? selectedTrail.name : 'Backcountry 4WD Route'}\nCoords: ${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}\nGoogle Maps: https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}\nVehicle: ${activeRig.year} ${activeRig.name} (${activeRig.model})\nComms: ${selectedTrail ? selectedTrail.emergencyRadioChannel : 'CB Ch 4 / GMRS Ch 16'}\nNeed recovery assistance.`;

  const handleCopySOS = () => {
    navigator.clipboard.writeText(emergencyMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-white uppercase">
              TRAIL RECOVERY & SAFETY BEACON
            </h2>
            <p className="text-xs text-stone-400">
              Offline GPS broadcast, winch rigging protocols & radio frequencies
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GPS Emergency Transmitter Card */}
        <div className="bg-stone-950 rounded-xl border border-stone-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Live GPS Coordinates
            </span>
            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded text-[10px] font-mono">
              WGS-84 Format
            </span>
          </div>

          <div className="p-3 bg-stone-900 rounded-lg border border-stone-800 font-mono text-center">
            <span className="text-2xl font-extrabold text-white tracking-wider">
              {gpsCoords.lat.toFixed(5)}° N, {Math.abs(gpsCoords.lng).toFixed(5)}° W
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">
              Active Trailhead: {selectedTrail ? selectedTrail.name : 'Custom GPS Point'}
            </span>
          </div>

          {/* Formatted SOS Message */}
          <div>
            <label className="text-[10px] font-mono text-stone-400 uppercase block mb-1">
              Pre-Formatted Emergency SMS / Satellite SOS (Garmin InReach / Spot)
            </label>
            <div className="p-2.5 bg-stone-900/80 rounded-lg border border-stone-800 text-[11px] font-mono text-stone-300 whitespace-pre-line">
              {emergencyMessage}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySOS}
            className={`w-full py-2 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-emerald-500 text-stone-950 shadow-lg'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>SOS Coordinates Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Emergency SOS Packet</span>
              </>
            )}
          </button>
        </div>

        {/* Winch & Radio Directory Card */}
        <div className="space-y-4">
          {/* Radio Frequency Standards */}
          <div className="bg-stone-950 rounded-xl border border-stone-800 p-3.5 space-y-2 font-mono text-xs">
            <h4 className="font-heading font-bold text-stone-100 uppercase flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              Standard 4x4 Trail Comms
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <span className="text-stone-500 block text-[9px]">CB RADIO</span>
                <span className="text-amber-400 font-bold">Ch 4 (4x4 Standard)</span>
                <span className="text-stone-400 block text-[9px]">Ch 9 (Emergency)</span>
              </div>
              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <span className="text-stone-500 block text-[9px]">GMRS RADIO</span>
                <span className="text-amber-400 font-bold">Ch 16 / Ch 20</span>
                <span className="text-stone-400 block text-[9px]">462.575 MHz</span>
              </div>
              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <span className="text-stone-500 block text-[9px]">HAM RADIO</span>
                <span className="text-stone-200 font-bold">146.520 MHz</span>
                <span className="text-stone-400 block text-[9px]">Wilderness Calling</span>
              </div>
              <div className="p-2 bg-stone-900 rounded border border-stone-800">
                <span className="text-stone-500 block text-[9px]">OFFROAD RESCUE</span>
                <span className="text-emerald-400 font-bold">1-800-4WD-RESCUE</span>
                <span className="text-stone-400 block text-[9px]">4x4 Volunteer Network</span>
              </div>
            </div>
          </div>

          {/* Winch Rigging Safety Rules */}
          <div className="bg-stone-950 rounded-xl border border-stone-800 p-3.5 space-y-2 text-xs">
            <h4 className="font-heading font-bold text-stone-100 uppercase flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-amber-400" />
              Winch & Recovery Checklist
            </h4>
            <ul className="space-y-1 text-[11px] text-stone-300 font-mono list-disc list-inside">
              <li>Always drape a recovery damper / heavy jacket over the winch line</li>
              <li>Use a tree trunk protector strap—never wrap winch cable around a tree</li>
              <li>Stand clear by at least 1.5x the length of the extended line</li>
              <li>Use a snatch block to double pulling power (2:1 mechanical advantage)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
