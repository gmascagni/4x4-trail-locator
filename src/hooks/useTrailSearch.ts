import { useState, useCallback } from 'react';
import { Trail4x4 } from '../types';
import { FALLBACK_TRAILS, REGIONAL_HUBS } from '../utils/trailData';

function getDistanceInMiles(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useTrailSearch() {
  const [trails, setTrails] = useState<Trail4x4[]>(FALLBACK_TRAILS);
  const [selectedHub, setSelectedHub] = useState<string>("All Regions");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({ lat: 38.5733, lng: -109.5498 });

  const searchTrails = useCallback(async (query: string): Promise<{ trails: Trail4x4[]; locationName: string; center: { lat: number; lng: number } }> => {
    setIsLoading(true);
    const q = query.trim().toLowerCase();

    // Quick check matching regional hubs
    const matchingHub = REGIONAL_HUBS.find(h => 
      h.name.toLowerCase().includes(q) || 
      h.query.toLowerCase().includes(q)
    );

    let center = matchingHub ? matchingHub.center : { lat: 38.5733, lng: -109.5498 };
    let locationName = matchingHub ? matchingHub.name : query;

    // Filter or rank fallback trails based on proximity or query match
    let results = [...FALLBACK_TRAILS];

    if (q && q !== "all" && q !== "all regions") {
      results = FALLBACK_TRAILS.filter(trail => 
        trail.name.toLowerCase().includes(q) ||
        trail.region.toLowerCase().includes(q) ||
        trail.address.toLowerCase().includes(q) ||
        trail.terrainTags.some(tag => tag.toLowerCase().includes(q)) ||
        (q.includes('badge') && trail.isBadgeOfHonor) ||
        (q.includes('rock') && trail.terrainTags.includes("Rock Crawling")) ||
        (q.includes('sand') && trail.terrainTags.includes("Sand Dunes")) ||
        (q.includes('water') && trail.terrainTags.includes("Mud & Water Crossings"))
      );

      // If matching hub found, calculate distance from hub center
      if (matchingHub) {
        results.sort((a, b) => {
          const distA = getDistanceInMiles(matchingHub.center, a.location);
          const distB = getDistanceInMiles(matchingHub.center, b.location);
          return distA - distB;
        });
      }
    }

    if (results.length === 0) {
      // If no exact match, return all trails sorted by distance to selected center
      results = [...FALLBACK_TRAILS];
    } else {
      center = results[0].location;
      locationName = results[0].region;
    }

    setTrails(results);
    setCurrentCenter(center);
    setIsLoading(false);

    return { trails: results, locationName, center };
  }, []);

  return {
    trails,
    setTrails,
    isLoading,
    currentCenter,
    selectedHub,
    setSelectedHub,
    searchTrails
  };
}
