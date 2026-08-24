import React, { useState } from 'react';
import { Search, MapPin, Compass, Sparkles, Navigation } from 'lucide-react';
import { REGIONAL_HUBS } from '../utils/trailData';

interface LocationSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function LocationSearch({ onSearch, isLoading }: LocationSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-stone-500 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 4x4 trail name, region (Moab, Telluride, Rubicon...), or terrain..."
          className="w-full bg-stone-900/90 text-stone-100 placeholder-stone-500 pl-12 pr-28 py-3.5 rounded-2xl border border-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 text-sm font-sans shadow-2xl transition-all focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-heading font-extrabold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5 uppercase tracking-wider"
        >
          {isLoading ? (
            <span className="animate-spin text-xs">⟳</span>
          ) : (
            <Compass className="w-3.5 h-3.5" />
          )}
          <span>Search</span>
        </button>
      </form>

      {/* Quick Regional Hub Quick-Jump Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
        <span className="text-stone-500 text-[10px] uppercase font-bold shrink-0 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-amber-400" />
          Hubs:
        </span>
        {REGIONAL_HUBS.map((hub) => (
          <button
            key={hub.name}
            type="button"
            onClick={() => {
              setQuery(hub.name);
              onSearch(hub.name);
            }}
            className="px-2.5 py-1 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 text-[11px] shrink-0 transition-colors"
          >
            {hub.name}
          </button>
        ))}
      </div>
    </div>
  );
}
