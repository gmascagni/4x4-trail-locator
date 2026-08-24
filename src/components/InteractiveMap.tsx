import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trail4x4 } from '../types';
import { Layers, Compass, ShieldAlert, Award, Navigation, Maximize2 } from 'lucide-react';
import { getDifficultyScaleBadge } from '../services/trailService';

interface InteractiveMapProps {
  trails: Trail4x4[];
  selectedTrail: Trail4x4 | null;
  onSelectTrail: (trail: Trail4x4) => void;
  center?: { lat: number; lng: number };
}

export default function InteractiveMap({
  trails,
  selectedTrail,
  onSelectTrail,
  center = { lat: 38.5733, lng: -109.5498 }
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapLayer, setMapLayer] = useState<'topo' | 'satellite' | 'streets'>('topo');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset container if previous instance left leaflet id
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 11,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial layer: USGS / High-Reliability Outdoor Topo Map
    const topoLayer = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'USGS National Map &copy; U.S. Geological Survey'
    });
    topoLayer.addTo(map);
    tileLayerRef.current = topoLayer;

    mapInstanceRef.current = map;

    // Invalidate size after layout mounts
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    // Resize observer to handle dynamic layout shifts
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newTileLayer: L.TileLayer;
    if (mapLayer === 'satellite') {
      newTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri World Imagery'
      });
    } else if (mapLayer === 'streets') {
      newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });
    } else {
      // Topo
      newTileLayer = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'USGS National Map &copy; U.S. Geological Survey'
      });
    }

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapLayer]);

  // Center change
  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;
    mapInstanceRef.current.setView([center.lat, center.lng], mapInstanceRef.current.getZoom());
  }, [center]);

  // Render Trail Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    trails.forEach(trail => {
      const isSelected = selectedTrail?.id === trail.id;
      const diffBadge = getDifficultyScaleBadge(trail.difficultyScale);

      // Custom 4x4 Icon HTML
      const iconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 hover:scale-110">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-2xl font-heading font-bold text-sm ${
            isSelected 
              ? 'bg-amber-500 text-stone-950 border-white ring-4 ring-amber-500/50 scale-125 z-50' 
              : `${diffBadge.badgeNumColor} border-stone-900`
          }">
            <span>${trail.difficultyScale}</span>
            ${trail.isBadgeOfHonor ? '<div class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center text-[9px] font-black border border-stone-950">★</div>' : ''}
          </div>
          <div class="absolute top-10 left-1/2 -translate-x-1/2 mt-1 bg-stone-950/90 text-stone-200 border border-stone-800 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            ${trail.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-4x4-marker',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([trail.location.lat, trail.location.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div class="p-1 min-w-[200px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${diffBadge.badgeNumColor}">
              RATING ${trail.difficultyScale}/10
            </span>
            ${trail.isBadgeOfHonor ? '<span class="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[10px] font-bold">BADGE OF HONOR</span>' : ''}
          </div>
          <h4 class="font-heading font-bold text-stone-100 text-base leading-tight mb-1">${trail.name}</h4>
          <p class="text-xs text-stone-400 mb-2">${trail.region}</p>
          <div class="grid grid-cols-2 gap-1 text-[11px] font-mono bg-stone-900/80 p-2 rounded border border-stone-800 mb-2">
            <div><span class="text-stone-500">TIRES:</span> <span class="text-amber-400 font-bold">${trail.recommendedTireSize}"+</span></div>
            <div><span class="text-stone-500">CLEARANCE:</span> <span class="text-amber-400 font-bold">${trail.minClearanceInches}"</span></div>
            <div><span class="text-stone-500">LENGTH:</span> <span class="text-stone-300 font-bold">${trail.lengthMiles} mi</span></div>
            <div><span class="text-stone-500">STATUS:</span> <span class="${trail.trailheadStatus === 'Open' ? 'text-emerald-400' : 'text-amber-400'} font-bold">${trail.trailheadStatus}</span></div>
          </div>
          <button id="btn-select-${trail.id}" class="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-bold text-xs rounded transition-colors uppercase tracking-wider text-center">
            Inspect Rig Fit & Trail Specs
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectTrail(trail);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${trail.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectTrail(trail);
          };
        }
      });

      markersRef.current.push(marker);
    });

    if (selectedTrail) {
      map.setView([selectedTrail.location.lat, selectedTrail.location.lng], 12, { animate: true });
    }
  }, [trails, selectedTrail, onSelectTrail]);

  const fitAllMarkers = () => {
    if (!mapInstanceRef.current || trails.length === 0) return;
    const group = L.featureGroup(markersRef.current);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-900">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Top Map Layer Selector Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-stone-950/90 backdrop-blur-md p-1.5 rounded-xl border border-stone-800/80 shadow-2xl">
        <button
          type="button"
          onClick={() => setMapLayer('topo')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center gap-1.5 ${
            mapLayer === 'topo'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Topo 3D
        </button>
        <button
          type="button"
          onClick={() => setMapLayer('satellite')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center gap-1.5 ${
            mapLayer === 'satellite'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Satellite
        </button>
        <button
          type="button"
          onClick={() => setMapLayer('streets')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center gap-1.5 ${
            mapLayer === 'streets'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Roads
        </button>
      </div>

      {/* Fit all bounds button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={fitAllMarkers}
          title="Fit All Trails into View"
          className="p-2.5 bg-stone-950/90 hover:bg-stone-900 text-stone-300 hover:text-amber-400 rounded-xl border border-stone-800 shadow-xl transition-colors backdrop-blur-md"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-stone-950/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-stone-800 shadow-2xl hidden md:flex items-center gap-4 text-xs font-mono">
        <span className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Difficulty Scale:</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />1-2 Easy</span>
          <span className="inline-flex items-center gap-1 text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />3-4 Mod</span>
          <span className="inline-flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />5-6 Tech</span>
          <span className="inline-flex items-center gap-1 text-orange-400"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" />7-8 Extreme</span>
          <span className="inline-flex items-center gap-1 text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-600" />9-10 Buggy</span>
        </div>
      </div>
    </div>
  );
}
