export type DifficultyScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TrailStatusType = "Open" | "Caution" | "Closed" | "Seasonal Closure" | "Permit Required";

export type TerrainTag = 
  | "Rock Crawling" 
  | "Slickrock" 
  | "Mud & Water Crossings" 
  | "Sand Dunes" 
  | "Shelf Roads / High Exposure" 
  | "Forest Service / Fire Roads" 
  | "Boulder Fields" 
  | "V-Notch & Waterfalls" 
  | "Desert Washes";

export interface TrailObstacle {
  name: string;
  description: string;
  hasBypass: boolean;
  difficultyRating: DifficultyScale;
  requiresLocker: boolean;
  requiresWinch: boolean;
}

export interface Trail4x4 {
  id: string;
  name: string;
  address: string;
  region: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  userRatingsTotal: number;
  photos: string[];
  reviews?: Array<{
    authorName: string;
    text: string;
    rating: number;
    date?: string;
  }>;
  
  // 4x4 & Off-Road Specific Attributes
  trailheadStatus: TrailStatusType;
  trailheadStatusDetail: string;
  description: string;
  proTips: string;
  
  // Rating 1-10 (Jeep Badge of Honor / Red Rock 4-Wheelers Scale)
  difficultyScale: DifficultyScale;
  difficultyCategory: "Easy (Scenic)" | "Moderate (Trail)" | "Difficult (Technical)" | "Extreme (Rock Crawling)" | "Buggy Only";
  
  // Badge of Honor
  isBadgeOfHonor: boolean;
  badgePoints?: number;
  badgeGraphic?: string;
  
  // Technical Requirements & Rig Specs
  minClearanceInches: number;
  recommendedTireSize: number; // e.g. 33, 35, 37, 40
  requiresFrontLocker: boolean;
  requiresRearLocker: boolean;
  winchRecommended: boolean;
  skidPlatesRecommended: boolean;
  swaybarDisconnectRecommended: boolean;
  waterFordingDepthInches?: number;
  
  // Route details
  lengthMiles: number;
  trailType: "Loop" | "Point-to-Point" | "Out & Back" | "OHV Park Grid";
  elevationGainFt: number;
  highestElevationFt: number;
  estimatedDriveTimeHours: number;
  
  // Air Down & Recovery
  recommendedPsi: {
    sand: number;
    slickrock: number;
    crawling: number;
    mud: number;
    gravel: number;
  };
  hasCellService: "None" | "Spotty" | "Good";
  emergencyRadioChannel: string; // e.g. "CB Ch 4 / GMRS Ch 16"
  
  // Key obstacles
  obstacles: TrailObstacle[];
  terrainTags: TerrainTag[];
  websiteUri?: string;
}

export interface JeepRig {
  id: string;
  name: string;
  model: "Wrangler Rubicon (JL/JLU)" | "Wrangler (JK/JKU)" | "Wrangler (TJ/LJ)" | "Gladiator (JT)" | "Cherokee (XJ)" | "CJ-7 / CJ-5" | "Grand Cherokee" | "Custom Rock Buggy";
  year: number;
  liftInches: number;
  tireSizeInches: number;
  hasFrontLocker: boolean;
  hasRearLocker: boolean;
  hasWinch: boolean;
  hasSwaybarDisconnect: boolean;
  hasSkidPlates: boolean;
  hasRockSliders: boolean;
  hasSnorkel: boolean;
  hasBeadlocks: boolean;
  isDailyDriver: boolean;
}

export interface RigMatchResult {
  score: number; // 0 - 100%
  status: "Ready to Conquer" | "Caution / Spotter Required" | "High Damage Risk" | "Not Recommended";
  color: string;
  warnings: string[];
  recommendations: string[];
  passesClearance: boolean;
  passesTires: boolean;
  passesLockers: boolean;
  passesWinch: boolean;
}

export interface CrowdsourcedConditionReport {
  id: string;
  trailId: string;
  trailName: string;
  reportDate: string;
  reportedBy: string;
  rigUsed: string;
  status: TrailStatusType;
  waterCrossingDepthInches?: number;
  mudLevel: "Dry" | "Moderate" | "Deep Mud / Winching Likely";
  shelfRoadCondition: "Clear" | "Loose Rock" | "Washout / Narrow";
  snowIcePresent: boolean;
  fallenTreesObstacles: string;
  notes: string;
  ratingScore: number;
}

export interface OffroadLogbookEntry {
  id: string;
  trailId: string;
  trailName: string;
  dateCompleted: string;
  rigId: string;
  rigName: string;
  tirePsiUsed: number;
  obstaclesAttempted: string[];
  bypassesUsed: string[];
  recoveryEvents: string;
  trailDamage: string;
  favoriteLine: string;
  badgeClaimed: boolean;
  photos?: string[];
  notes: string;
}
