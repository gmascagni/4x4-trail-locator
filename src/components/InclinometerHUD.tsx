import React, { useState, useEffect } from 'react';
import { Compass, AlertTriangle, RefreshCw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Trail4x4 } from '../types';

interface InclinometerHUDProps {
  trail?: Trail4x4 | null;
  onClose?: () => void;
}

export default function InclinometerHUD({ trail, onClose }: InclinometerHUDProps) {
  const [pitch, setPitch] = useState<number>(12); // Nose up/down degrees (-45 to +45)
  const [roll, setRoll] = useState<number>(8);   // Side-to-side roll degrees (-45 to +45)
  const [useDeviceSensor, setUseDeviceSensor] = useState<boolean>(false);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(false);

  // Device orientation sensor handler
  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setSensorAvailable(true);

      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (!useDeviceSensor) return;
        if (e.beta !== null && e.gamma !== null) {
          // beta: front-to-back pitch, gamma: left-to-right roll
          setPitch(Math.round(Math.max(-45, Math.min(45, e.beta))));
          setRoll(Math.round(Math.max(-45, Math.min(45, e.gamma))));
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [useDeviceSensor]);

  const getAngleSeverity = (angle: number) => {
    const abs = Math.abs(angle);
    if (abs < 15) return { color: 'text-emerald-400', status: 'SAFE ZONE', border: 'border-emerald-500/40 bg-emerald-950/20' };
    if (abs < 28) return { color: 'text-amber-400', status: 'CAUTION ZONE', border: 'border-amber-500/40 bg-amber-950/20' };
    return { color: 'text-red-500 animate-pulse', status: 'ROLLOVER DANGER', border: 'border-red-500 bg-red-950/40' };
  };

  const pitchSeverity = getAngleSeverity(pitch);
  const rollSeverity = getAngleSeverity(roll);

  return (
    <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 shadow-2xl space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-white text-base uppercase tracking-wider">
              TACTICAL 4X4 INCLINOMETER HUD
            </h3>
            {trail && <p className="text-xs text-stone-400">Calibrated for {trail.name}</p>}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Gauges Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* PITCH GAUGE (Front/Back) */}
        <div className={`p-4 rounded-xl border text-center font-mono ${pitchSeverity.border}`}>
          <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider mb-1">
            PITCH (NOSE ANGLE)
          </span>
          <div className="text-4xl font-heading font-extrabold my-2 text-white">
            <span className={pitchSeverity.color}>{pitch > 0 ? `+${pitch}` : pitch}°</span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${pitchSeverity.border} ${pitchSeverity.color}`}>
            {pitchSeverity.status}
          </span>
          <div className="mt-3 text-[11px] text-stone-400">
            {pitch > 0 ? 'CLIMBING (APPROACH)' : pitch < 0 ? 'DESCENDING (DEPARTURE)' : 'LEVEL TERRAIN'}
          </div>
        </div>

        {/* ROLL GAUGE (Off-Camber Side Tilt) */}
        <div className={`p-4 rounded-xl border text-center font-mono ${rollSeverity.border}`}>
          <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider mb-1">
            ROLL (SIDE CAMBER)
          </span>
          <div className="text-4xl font-heading font-extrabold my-2 text-white">
            <span className={rollSeverity.color}>{roll > 0 ? `+${roll}` : roll}°</span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${rollSeverity.border} ${rollSeverity.color}`}>
            {rollSeverity.status}
          </span>
          <div className="mt-3 text-[11px] text-stone-400">
            {roll > 0 ? 'TILT RIGHT' : roll < 0 ? 'TILT LEFT' : 'LATERAL LEVEL'}
          </div>
        </div>
      </div>

      {/* Visual Jeep Horizon Graphic */}
      <div className="relative h-44 bg-stone-900/90 rounded-xl border border-stone-800 overflow-hidden flex items-center justify-center">
        {/* Horizon grid line */}
        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-stone-700/60" />
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-stone-700/60" />

        {/* Dynamic Animated Jeep Silhouette / Horizon Box */}
        <div
          style={{
            transform: `rotate(${roll}deg) translateY(${pitch * 0.8}px)`
          }}
          className="relative transition-transform duration-100 ease-out flex flex-col items-center"
        >
          {/* Jeep Front Grille Vector / Outline */}
          <div className="w-28 h-16 bg-stone-950 border-2 border-amber-500 rounded-lg shadow-2xl flex flex-col items-center justify-between p-2">
            {/* Windshield */}
            <div className="w-20 h-4 bg-amber-500/20 border border-amber-500/40 rounded-sm" />
            {/* 7-Slot Grille & Headlights */}
            <div className="flex items-center gap-1.5 w-full px-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shrink-0" />
              <div className="flex-1 flex justify-between px-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-0.5 h-3.5 bg-amber-500/80 rounded-full" />
                ))}
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shrink-0" />
            </div>
          </div>
        </div>

        {/* Compass Crosshair Labels */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-stone-500 uppercase">0° HORIZON</span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-stone-500">-30° L</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-stone-500">+30° R</span>
      </div>

      {/* Simulator Sliders / Sensor Toggle */}
      <div className="space-y-3 p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-stone-300 font-bold uppercase">Manual Simulator Mode</span>
          {sensorAvailable && (
            <button
              type="button"
              onClick={() => setUseDeviceSensor(!useDeviceSensor)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                useDeviceSensor ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {useDeviceSensor ? 'Phone Gyro Active' : 'Enable Gyro'}
            </button>
          )}
        </div>

        {!useDeviceSensor && (
          <>
            <div>
              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                <span>Simulate Pitch (Approach / Descent)</span>
                <span className="text-amber-400 font-bold">{pitch}°</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                <span>Simulate Roll (Side Off-Camber)</span>
                <span className="text-amber-400 font-bold">{roll}°</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={roll}
                onChange={(e) => setRoll(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={() => { setPitch(0); setRoll(0); }}
              className="w-full py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-mono flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset to Level (0°, 0°)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
