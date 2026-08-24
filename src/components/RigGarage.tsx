import React, { useState } from 'react';
import { JeepRig } from '../types';
import { 
  Wrench, 
  Plus, 
  Check, 
  Trash2, 
  Shield, 
  Truck, 
  Gauge, 
  Sliders, 
  Radio, 
  Lock, 
  Anchor, 
  Award,
  Sparkles
} from 'lucide-react';

interface RigGarageProps {
  rigs: JeepRig[];
  activeRig: JeepRig;
  onSelectRig: (rig: JeepRig) => void;
  onUpdateRig: (rig: JeepRig) => void;
  onAddRig: (rig: JeepRig) => void;
}

export default function RigGarage({
  rigs,
  activeRig,
  onSelectRig,
  onUpdateRig,
  onAddRig
}: RigGarageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRig, setEditingRig] = useState<JeepRig>({ ...activeRig });

  const handleSave = () => {
    onUpdateRig(editingRig);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newRig: JeepRig = {
      id: `rig-${Date.now()}`,
      name: "Custom 4x4 Rig",
      model: "Wrangler Rubicon (JL/JLU)",
      year: 2024,
      liftInches: 2.5,
      tireSizeInches: 35,
      hasFrontLocker: true,
      hasRearLocker: true,
      hasWinch: true,
      hasSwaybarDisconnect: true,
      hasSkidPlates: true,
      hasRockSliders: true,
      hasSnorkel: false,
      hasBeadlocks: false,
      isDailyDriver: true
    };
    onAddRig(newRig);
    onSelectRig(newRig);
    setEditingRig(newRig);
    setIsEditing(true);
  };

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
              4X4 RIG GARAGE
            </h2>
            <p className="text-xs text-stone-400">
              Configure your Jeep build for automatic trail capability diagnostics
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-400 rounded-xl border border-stone-700 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Rig</span>
        </button>
      </div>

      {/* Rig Selector Carousel / Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rigs.map((rig) => {
          const isCurrent = rig.id === activeRig.id;
          return (
            <div
              key={rig.id}
              onClick={() => {
                onSelectRig(rig);
                setEditingRig({ ...rig });
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                isCurrent
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-bold text-sm text-stone-100">{rig.name}</span>
                {isCurrent && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-stone-950 rounded text-[9px] font-black uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 font-mono mb-2">{rig.year} {rig.model}</p>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="bg-stone-900 px-2 py-0.5 rounded text-amber-400 border border-stone-800">
                  {rig.tireSizeInches}" Tires
                </span>
                <span className="bg-stone-900 px-2 py-0.5 rounded text-stone-300 border border-stone-800">
                  +{rig.liftInches}" Lift
                </span>
                {rig.hasFrontLocker && rig.hasRearLocker && (
                  <span className="bg-stone-900 px-2 py-0.5 rounded text-emerald-400 border border-stone-800">
                    Dual Lockers
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Rig Customizer */}
      <div className="bg-stone-950 rounded-xl border border-stone-800/80 p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="font-heading font-bold text-stone-200 text-sm uppercase">
              Rig Specs & Off-Road Modifications
            </h3>
          </div>
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Save Modifications
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingRig({ ...activeRig });
                setIsEditing(true);
              }}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-heading font-bold text-xs rounded-lg border border-stone-700 transition-colors"
            >
              Edit Build Specs
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-stone-400 block mb-1">Rig Nickname</label>
              <input
                type="text"
                value={editingRig.name}
                onChange={(e) => setEditingRig({ ...editingRig, name: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-stone-400 block mb-1">Jeep Platform</label>
              <select
                value={editingRig.model}
                onChange={(e: any) => setEditingRig({ ...editingRig, model: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="Wrangler Rubicon (JL/JLU)">Wrangler Rubicon (JL/JLU)</option>
                <option value="Wrangler (JK/JKU)">Wrangler (JK/JKU)</option>
                <option value="Wrangler (TJ/LJ)">Wrangler (TJ/LJ)</option>
                <option value="Gladiator (JT)">Gladiator (JT)</option>
                <option value="Cherokee (XJ)">Cherokee (XJ)</option>
                <option value="CJ-7 / CJ-5">CJ-7 / CJ-5</option>
                <option value="Grand Cherokee">Grand Cherokee</option>
                <option value="Custom Rock Buggy">Custom Rock Buggy</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-stone-400">Suspension Lift</span>
                <span className="text-amber-400 font-bold">{editingRig.liftInches}"</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={editingRig.liftInches}
                onChange={(e) => setEditingRig({ ...editingRig, liftInches: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-stone-400">Tire Outer Diameter</span>
                <span className="text-amber-400 font-bold">{editingRig.tireSizeInches}"</span>
              </div>
              <input
                type="range"
                min="31"
                max="44"
                step="1"
                value={editingRig.tireSizeInches}
                onChange={(e) => setEditingRig({ ...editingRig, tireSizeInches: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Toggle Switches */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <label className="flex items-center gap-2 p-2 bg-stone-900 rounded-lg border border-stone-800 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={editingRig.hasFrontLocker}
                  onChange={(e) => setEditingRig({ ...editingRig, hasFrontLocker: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span>Front Locker</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-stone-900 rounded-lg border border-stone-800 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={editingRig.hasRearLocker}
                  onChange={(e) => setEditingRig({ ...editingRig, hasRearLocker: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span>Rear Locker</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-stone-900 rounded-lg border border-stone-800 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={editingRig.hasWinch}
                  onChange={(e) => setEditingRig({ ...editingRig, hasWinch: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span>Recovery Winch</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-stone-900 rounded-lg border border-stone-800 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={editingRig.hasSwaybarDisconnect}
                  onChange={(e) => setEditingRig({ ...editingRig, hasSwaybarDisconnect: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span>Swaybar Disconnect</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-stone-900 rounded-lg border border-stone-800 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={editingRig.hasSkidPlates}
                  onChange={(e) => setEditingRig({ ...editingRig, hasSkidPlates: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span>Belly Skid Plates</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-stone-900 rounded-lg border border-stone-800 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={editingRig.hasRockSliders}
                  onChange={(e) => setEditingRig({ ...editingRig, hasRockSliders: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <span>Rock Sliders</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
              <span className="text-stone-500 block text-[10px]">GROUND CLEARANCE</span>
              <span className="font-bold text-amber-400 text-sm">
                ~{(9.7 + activeRig.liftInches + (activeRig.tireSizeInches - 32) / 2).toFixed(1)}"
              </span>
            </div>
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
              <span className="text-stone-500 block text-[10px]">TIRE & WHEEL</span>
              <span className="font-bold text-stone-200 text-sm">
                {activeRig.tireSizeInches}" {activeRig.hasBeadlocks ? '(Beadlocks)' : ''}
              </span>
            </div>
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
              <span className="text-stone-500 block text-[10px]">DIFF LOCKERS</span>
              <span className="font-bold text-emerald-400 text-sm">
                {activeRig.hasFrontLocker && activeRig.hasRearLocker
                  ? 'Front & Rear'
                  : activeRig.hasRearLocker
                  ? 'Rear Only'
                  : 'Open Diffs'}
              </span>
            </div>
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
              <span className="text-stone-500 block text-[10px]">RECOVERY REEF</span>
              <span className="font-bold text-stone-200 text-sm">
                {activeRig.hasWinch ? 'Winch Equipped' : 'Tow Straps Only'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
