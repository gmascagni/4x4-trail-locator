import React, { useState } from 'react';
import { Gauge, AlertTriangle, ShieldCheck, Check, ArrowDownCircle, Info } from 'lucide-react';
import { JeepRig } from '../types';

interface AirDownCalculatorProps {
  activeRig: JeepRig;
}

export default function AirDownCalculator({ activeRig }: AirDownCalculatorProps) {
  const [terrain, setTerrain] = useState<'slickrock' | 'sand' | 'rocks' | 'mud' | 'highway'>('slickrock');
  const [hasBeadlocks, setHasBeadlocks] = useState<boolean>(activeRig.hasBeadlocks);
  const [vehicleWeight, setVehicleWeight] = useState<'light' | 'standard' | 'heavy'>('standard');

  const calculatePsi = () => {
    let baseFront = 15;
    let baseRear = 15;

    switch (terrain) {
      case 'sand':
        baseFront = 11;
        baseRear = 11;
        break;
      case 'slickrock':
        baseFront = 13;
        baseRear = 13;
        break;
      case 'rocks':
        baseFront = 12;
        baseRear = 12;
        break;
      case 'mud':
        baseFront = 14;
        baseRear = 14;
        break;
      case 'highway':
        baseFront = 35;
        baseRear = 35;
        break;
    }

    // Tire size modifier (larger tires hold more air volume, can drop lower PSI)
    if (activeRig.tireSizeInches >= 37) {
      baseFront -= 2;
      baseRear -= 2;
    } else if (activeRig.tireSizeInches >= 35) {
      baseFront -= 1;
      baseRear -= 1;
    }

    // Beadlock modifier (allows sub-10 PSI without de-beading)
    if (hasBeadlocks && terrain !== 'highway') {
      baseFront -= 3;
      baseRear -= 3;
    }

    // Weight modifier
    if (vehicleWeight === 'heavy') {
      baseFront += 2;
      baseRear += 2;
    } else if (vehicleWeight === 'light') {
      baseFront -= 1;
      baseRear -= 1;
    }

    const front = Math.max(6, baseFront);
    const rear = Math.max(6, baseRear);
    const contactPatchGain = terrain === 'highway' ? 0 : Math.round(((35 - front) / 35) * 180);

    return { front, rear, contactPatchGain };
  };

  const { front, rear, contactPatchGain } = calculatePsi();

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-white uppercase">
              TIRE AIR-DOWN CALCULATOR
            </h2>
            <p className="text-xs text-stone-400">
              Calculate optimal off-road PSI for maximum traction & sidewall flex
            </p>
          </div>
        </div>
      </div>

      {/* Inputs & Terrain Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-stone-400 block mb-2 font-bold uppercase">
              Select Terrain Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'slickrock', label: 'Moab Slickrock', desc: 'Max rubber wrap' },
                { id: 'rocks', label: 'Sharp Boulders', desc: 'Pinch-flat defense' },
                { id: 'sand', label: 'Sand Dunes', desc: 'Flotation & width' },
                { id: 'mud', label: 'Deep Mud / Clay', desc: 'Lug cleanout' },
                { id: 'highway', label: 'Pavement / Highway', desc: 'Full pressure' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTerrain(t.id as any)}
                  className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                    terrain === t.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  }`}
                >
                  <span className="font-bold text-xs block text-stone-100">{t.label}</span>
                  <span className="text-[10px] text-stone-400">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-stone-400 block mb-1">Wheel Type</label>
              <button
                type="button"
                onClick={() => setHasBeadlocks(!hasBeadlocks)}
                className={`w-full p-2 rounded-lg border text-center font-bold transition-colors ${
                  hasBeadlocks
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-stone-950 border-stone-800 text-stone-400'
                }`}
              >
                {hasBeadlocks ? 'True Beadlocks' : 'Standard Wheels'}
              </button>
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Overland Load</label>
              <select
                value={vehicleWeight}
                onChange={(e: any) => setVehicleWeight(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="light">Light (Doors off / Day run)</option>
                <option value="standard">Standard (Tools & Winch)</option>
                <option value="heavy">Heavy (Overland RTT & Gear)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculated Result Output */}
        <div className="bg-stone-950 rounded-xl border border-stone-800 p-4 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1">
              TARGET TIRE PRESSURE SPECIFICATION
            </span>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center font-mono">
                <span className="text-[10px] text-stone-500 block">FRONT AXLE</span>
                <span className="text-3xl font-heading font-extrabold text-white">{front} <span className="text-sm text-amber-400">PSI</span></span>
              </div>
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center font-mono">
                <span className="text-[10px] text-stone-500 block">REAR AXLE</span>
                <span className="text-3xl font-heading font-extrabold text-white">{rear} <span className="text-sm text-amber-400">PSI</span></span>
              </div>
            </div>
          </div>

          {terrain !== 'highway' && (
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-stone-200">
                <span className="font-bold">Contact Patch Traction:</span>
                <span className="text-emerald-400 font-extrabold">+{contactPatchGain}% footprint</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Air down increases tread length along the rock surface, providing dramatic mechanical keying over ledges.
              </p>
            </div>
          )}

          <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Always re-inflate before highway speeds above 45 MPH to prevent tire overheating.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
