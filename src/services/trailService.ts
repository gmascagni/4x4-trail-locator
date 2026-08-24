import { DifficultyScale, TrailStatusType } from '../types';

export interface AI4x4TrailInsights {
  difficultyScale: DifficultyScale;
  badgeOfHonor: boolean;
  minClearance: string;
  recommendedTireSize: number;
  proSummary: string;
  obstacleWarnings: string[];
}

export async function fetchAI4x4Insights(trailName: string, region?: string): Promise<AI4x4TrailInsights> {
  try {
    const response = await fetch("/api/trail-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trailName, region }),
    });
    
    if (!response.ok) throw new Error("Failed to fetch 4x4 insights");
    return await response.json();
  } catch (error) {
    console.error("Error fetching 4x4 trail insights:", error);
    return {
      difficultyScale: 5,
      badgeOfHonor: false,
      minClearance: "10 inches",
      recommendedTireSize: 33,
      proSummary: "Rugged backcountry 4x4 trail. Air down tires to 15 PSI and inspect obstacles before attempting.",
      obstacleWarnings: ["Check approach and departure angles on ledges", "Use a spotter on off-camber sections"]
    };
  }
}

export function getDifficultyScaleBadge(scale: DifficultyScale) {
  if (scale <= 2) {
    return {
      bg: 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300',
      label: 'Easy / Scenic',
      badgeNumColor: 'bg-emerald-500 text-stone-950',
      description: 'Stock 4x4s, high clearance SUVs, forest roads & light gravel'
    };
  }
  if (scale <= 4) {
    return {
      bg: 'bg-blue-950/80 border-blue-600/60 text-blue-300',
      label: 'Moderate',
      badgeNumColor: 'bg-blue-500 text-stone-950',
      description: 'Stock Rubicon/Willys capable, 32"+ tires, mild rock steps & sand'
    };
  }
  if (scale <= 6) {
    return {
      bg: 'bg-amber-950/80 border-amber-600/60 text-amber-300',
      label: 'Difficult (Technical)',
      badgeNumColor: 'bg-amber-500 text-stone-950',
      description: '33-35" tires, rear locker strongly advised, tall ledges & slickrock fins'
    };
  }
  if (scale <= 8) {
    return {
      bg: 'bg-orange-950/80 border-orange-600/60 text-orange-300',
      label: 'Extreme Crawling',
      badgeNumColor: 'bg-orange-500 text-stone-950',
      description: '35-37" tires, dual lockers, winch, skid plates, severe off-camber boulders'
    };
  }
  return {
    bg: 'bg-red-950/80 border-red-600/60 text-red-300',
    label: 'Hardcore Buggy Only',
    badgeNumColor: 'bg-red-600 text-white',
    description: '38-42" tires, roll cage, beadlocks, hydraulic steering, high body damage risk'
  };
}

export function getStatusBadge(status: TrailStatusType) {
  switch (status) {
    case 'Open':
      return {
        bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400',
        dot: 'bg-emerald-400 animate-pulse',
        label: 'TRAIL OPEN'
      };
    case 'Caution':
      return {
        bg: 'bg-amber-950/70 border-amber-500/50 text-amber-400',
        dot: 'bg-amber-400 animate-pulse',
        label: 'CAUTION ADVISED'
      };
    case 'Closed':
      return {
        bg: 'bg-red-950/70 border-red-500/50 text-red-400',
        dot: 'bg-red-500',
        label: 'TRAIL CLOSED'
      };
    case 'Seasonal Closure':
      return {
        bg: 'bg-blue-950/70 border-blue-500/50 text-blue-300',
        dot: 'bg-blue-400',
        label: 'SEASONAL CLOSURE'
      };
    case 'Permit Required':
      return {
        bg: 'bg-purple-950/70 border-purple-500/50 text-purple-300',
        dot: 'bg-purple-400',
        label: 'PERMIT REQUIRED'
      };
  }
}
