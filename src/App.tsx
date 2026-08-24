import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Map as MapIcon, 
  LayoutGrid, 
  Truck, 
  Award, 
  Gauge, 
  LifeBuoy, 
  Flag, 
  Filter, 
  Layers, 
  SlidersHorizontal, 
  ShieldCheck, 
  Sparkles,
  Mountain,
  RefreshCw,
  Sun,
  AlertTriangle,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { Trail4x4, JeepRig, OffroadLogbookEntry, CrowdsourcedConditionReport } from './types';
import { useTrailSearch } from './hooks/useTrailSearch';
import { DEFAULT_RIGS } from './utils/rigMatcher';
import LocationSearch from './components/LocationSearch';
import InteractiveMap from './components/InteractiveMap';
import TrailCard from './components/TrailCard';
import RigGarage from './components/RigGarage';
import InclinometerHUD from './components/InclinometerHUD';
import AirDownCalculator from './components/AirDownCalculator';
import SafetyBeacon from './components/SafetyBeacon';
import BadgeOfHonorTracker from './components/BadgeOfHonorTracker';
import ConditionReportModal from './components/ConditionReportModal';
import ShareTrailModal from './components/ShareTrailModal';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'garage' | 'inclinometer' | 'airdown' | 'boh' | 'safety'>('explore');
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');

  // Rigs State
  const [rigs, setRigs] = useState<JeepRig[]>(DEFAULT_RIGS);
  const [activeRig, setActiveRig] = useState<JeepRig>(DEFAULT_RIGS[0]);

  // Trail Search & Data
  const { trails, setTrails, isLoading, currentCenter, searchTrails } = useTrailSearch();
  const [selectedTrail, setSelectedTrail] = useState<Trail4x4 | null>(trails[0] || null);

  // Filters
  const [filterBOHOnly, setFilterBOHOnly] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMinTires, setFilterMinTires] = useState<number>(0);

  // Modals
  const [reportingTrail, setReportingTrail] = useState<Trail4x4 | null>(null);
  const [sharingTrail, setSharingTrail] = useState<Trail4x4 | null>(null);
  const [inclinometerModalTrail, setInclinometerModalTrail] = useState<Trail4x4 | null>(null);

  // Logbook State
  const [logbook, setLogbook] = useState<OffroadLogbookEntry[]>([
    {
      id: "log-1",
      trailId: "trail-fins-and-things",
      trailName: "Fins & Things (Badge of Honor)",
      dateCompleted: "2026-08-15",
      rigId: "rig-rubicon-jl",
      rigName: "Wrangler Rubicon (Built JLU)",
      tirePsiUsed: 14,
      obstaclesAttempted: ["Frenchie's Fin", "Dino Ledge"],
      bypassesUsed: [],
      recoveryEvents: "None",
      trailDamage: "Minor rock slider paint scrape",
      favoriteLine: "High line on Frenchie's Fin",
      badgeClaimed: true,
      notes: "Awesome run with sunny 78F weather. Airing down to 14 PSI made the sandstone grip like sandpaper."
    }
  ]);

  // Filter Trails
  const filteredTrails = useMemo(() => {
    return trails.filter(trail => {
      if (filterBOHOnly && !trail.isBadgeOfHonor) return false;
      if (filterStatus !== 'all' && trail.trailheadStatus !== filterStatus) return false;
      if (filterMinTires > 0 && trail.recommendedTireSize > filterMinTires) return false;
      if (filterDifficulty !== 'all') {
        const d = trail.difficultyScale;
        if (filterDifficulty === 'easy' && d > 3) return false;
        if (filterDifficulty === 'mod' && (d < 4 || d > 6)) return false;
        if (filterDifficulty === 'hard' && (d < 7 || d > 8)) return false;
        if (filterDifficulty === 'extreme' && d < 9) return false;
      }
      return true;
    });
  }, [trails, filterBOHOnly, filterDifficulty, filterStatus, filterMinTires]);

  const handleAddLogEntry = (entry: OffroadLogbookEntry) => {
    setLogbook([entry, ...logbook]);
  };

  const handleAddConditionReport = (report: CrowdsourcedConditionReport) => {
    // Update local trail status
    setTrails(prev => prev.map(t => {
      if (t.id === report.trailId) {
        return {
          ...t,
          trailheadStatus: report.status,
          trailheadStatusDetail: `Updated: ${report.notes} (Reported by ${report.reportedBy})`
        };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-topo-pattern text-stone-100 flex flex-col">
      {/* Top Tactical Navigation Header */}
      <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-heading font-black text-xl shadow-lg shadow-amber-500/20 border border-amber-400">
              4x4
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg text-white tracking-wide">
                  TRAILFINDER <span className="text-amber-500">4X4</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-mono font-bold uppercase">
                  TRAIL RATED
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono hidden md:block">
                Jeep Off-Road Trail Status, Live Inclinometer & Badge Registry
              </p>
            </div>
          </div>

          {/* Center Nav Buttons */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-stone-900/80 p-1 rounded-xl border border-stone-800 font-heading font-bold text-xs uppercase">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Trails</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('garage')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'garage'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Rig Garage</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inclinometer')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'inclinometer'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span>Inclinometer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('airdown')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'airdown'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Air-Down PSI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('boh')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'boh'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Badge of Honor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('safety')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'safety'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-red-400 hover:bg-stone-800'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Recovery Beacon</span>
            </button>
          </nav>

          {/* Active Rig Quick Pill */}
          <div 
            onClick={() => setActiveTab('garage')}
            className="flex items-center gap-2 p-1.5 pl-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl cursor-pointer transition-colors"
          >
            <div className="text-right">
              <span className="text-[9px] font-mono text-stone-400 block uppercase leading-none">ACTIVE RIG</span>
              <span className="text-xs font-heading font-bold text-amber-400">{activeRig.name}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-stone-950 border border-stone-700 flex items-center justify-center text-stone-300">
              <Truck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Mobile Sub Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around bg-stone-950 px-2 py-2 border-t border-stone-800 font-heading text-xs font-bold uppercase overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'explore' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
          >
            Trails
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('garage')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'garage' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
          >
            Garage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inclinometer')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'inclinometer' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
          >
            HUD
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('airdown')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'airdown' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
          >
            PSI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('boh')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'boh' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
          >
            Badges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'safety' ? 'bg-red-600 text-white' : 'text-stone-400'}`}
          >
            SOS
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Search & Overview Top Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <LocationSearch onSearch={searchTrails} isLoading={isLoading} />
              </div>

              {/* View Layout Switcher & Stats */}
              <div className="flex items-center justify-between p-3 bg-stone-900/90 rounded-2xl border border-stone-800 font-mono text-xs">
                <div className="space-y-0.5">
                  <span className="text-stone-400 block text-[10px] uppercase">MATCHING TRAILS</span>
                  <span className="text-base font-extrabold text-amber-400 font-heading">
                    {filteredTrails.length} ROUTES FOUND
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'split' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'}`}
                    title="Split Map & Grid"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'}`}
                    title="Cards Grid"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'}`}
                    title="Full Map View"
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-xs font-mono">
              <span className="text-stone-400 font-bold uppercase flex items-center gap-1 text-[11px] mr-2">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                Filters:
              </span>

              {/* Badge of Honor Switch */}
              <button
                type="button"
                onClick={() => setFilterBOHOnly(!filterBOHOnly)}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  filterBOHOnly
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Badge of Honor Only</span>
              </button>

              {/* Difficulty Dropdown */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Difficulty Ratings (1-10)</option>
                <option value="easy">Easy / Scenic (1-3)</option>
                <option value="mod">Moderate / Trail (4-6)</option>
                <option value="hard">Difficult / Technical (7-8)</option>
                <option value="extreme">Extreme Rock Crawling (9-10)</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Trail Statuses</option>
                <option value="Open">Open Only</option>
                <option value="Caution">Caution / High Water</option>
                <option value="Closed">Closed</option>
              </select>

              {(filterBOHOnly || filterDifficulty !== 'all' || filterStatus !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterBOHOnly(false);
                    setFilterDifficulty('all');
                    setFilterStatus('all');
                  }}
                  className="px-2.5 py-1.5 text-amber-400 hover:text-amber-300 text-[11px] underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Split View Layout (Map + Trail Cards) */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Trail Cards List (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTrails.map((trail) => (
                      <TrailCard
                        key={trail.id}
                        trail={trail}
                        activeRig={activeRig}
                        isSelected={selectedTrail?.id === trail.id}
                        onSelect={() => setSelectedTrail(trail)}
                        onOpenReportModal={(t) => setReportingTrail(t)}
                        onOpenShareModal={(t) => setSharingTrail(t)}
                        onOpenInclinometer={(t) => setInclinometerModalTrail(t)}
                      />
                    ))}
                  </div>
                </div>

                {/* Right: Sticky Interactive Map (5 Cols) */}
                <div className="lg:col-span-5">
                  <div className="sticky top-20 h-[650px]">
                    <InteractiveMap
                      trails={filteredTrails}
                      selectedTrail={selectedTrail}
                      onSelectTrail={(t) => setSelectedTrail(t)}
                      center={currentCenter}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Full Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTrails.map((trail) => (
                  <TrailCard
                    key={trail.id}
                    trail={trail}
                    activeRig={activeRig}
                    isSelected={selectedTrail?.id === trail.id}
                    onSelect={() => setSelectedTrail(trail)}
                    onOpenReportModal={(t) => setReportingTrail(t)}
                    onOpenShareModal={(t) => setSharingTrail(t)}
                    onOpenInclinometer={(t) => setInclinometerModalTrail(t)}
                  />
                ))}
              </div>
            )}

            {/* Full Map View */}
            {viewMode === 'map' && (
              <div className="h-[750px]">
                <InteractiveMap
                  trails={filteredTrails}
                  selectedTrail={selectedTrail}
                  onSelectTrail={(t) => setSelectedTrail(t)}
                  center={currentCenter}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Rig Garage */}
        {activeTab === 'garage' && (
          <RigGarage
            rigs={rigs}
            activeRig={activeRig}
            onSelectRig={setActiveRig}
            onUpdateRig={(updated) => {
              setRigs(rigs.map(r => r.id === updated.id ? updated : r));
              setActiveRig(updated);
            }}
            onAddRig={(newRig) => {
              setRigs([...rigs, newRig]);
            }}
          />
        )}

        {/* Tab 3: Tactical Inclinometer HUD */}
        {activeTab === 'inclinometer' && (
          <InclinometerHUD trail={selectedTrail} />
        )}

        {/* Tab 4: Air Down Calculator */}
        {activeTab === 'airdown' && (
          <AirDownCalculator activeRig={activeRig} />
        )}

        {/* Tab 5: Badge of Honor Tracker */}
        {activeTab === 'boh' && (
          <BadgeOfHonorTracker
            trails={trails}
            activeRig={activeRig}
            logbook={logbook}
            onAddLogEntry={handleAddLogEntry}
          />
        )}

        {/* Tab 6: Safety Beacon */}
        {activeTab === 'safety' && (
          <SafetyBeacon
            activeRig={activeRig}
            selectedTrail={selectedTrail}
          />
        )}
      </main>

      {/* Condition Report Modal */}
      {reportingTrail && (
        <ConditionReportModal
          trail={reportingTrail}
          activeRig={activeRig}
          onClose={() => setReportingTrail(null)}
          onSubmitReport={handleAddConditionReport}
        />
      )}

      {/* Share Trail Modal */}
      {sharingTrail && (
        <ShareTrailModal
          trail={sharingTrail}
          onClose={() => setSharingTrail(null)}
        />
      )}

      {/* Inclinometer Modal */}
      {inclinometerModalTrail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <InclinometerHUD
            trail={inclinometerModalTrail}
            onClose={() => setInclinometerModalTrail(null)}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800 bg-stone-950 py-6 text-center text-xs font-mono text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-amber-500">TRAILFINDER 4X4</span>
            <span>&bull; Built for Jeeps, Rock Crawlers & Off-Road Explorers</span>
          </div>
          <div className="text-stone-400">
            Tread Lightly! &copy; {new Date().getFullYear()} 4x4 Trail Status. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
