import { JeepRig, Trail4x4, RigMatchResult } from '../types';

export const DEFAULT_RIGS: JeepRig[] = [
  {
    id: "rig-rubicon-jl",
    name: "Wrangler Rubicon (Built JLU)",
    model: "Wrangler Rubicon (JL/JLU)",
    year: 2023,
    liftInches: 3.5,
    tireSizeInches: 37,
    hasFrontLocker: true,
    hasRearLocker: true,
    hasWinch: true,
    hasSwaybarDisconnect: true,
    hasSkidPlates: true,
    hasRockSliders: true,
    hasSnorkel: false,
    hasBeadlocks: true,
    isDailyDriver: false
  },
  {
    id: "rig-stock-sport",
    name: "Wrangler Sport (Stock)",
    model: "Wrangler (JK/JKU)",
    year: 2018,
    liftInches: 0,
    tireSizeInches: 32,
    hasFrontLocker: false,
    hasRearLocker: false,
    hasWinch: false,
    hasSwaybarDisconnect: false,
    hasSkidPlates: false,
    hasRockSliders: false,
    hasSnorkel: false,
    hasBeadlocks: false,
    isDailyDriver: true
  },
  {
    id: "rig-gladiator-overlander",
    name: "Gladiator Mojave Overlander",
    model: "Gladiator (JT)",
    year: 2022,
    liftInches: 2.5,
    tireSizeInches: 35,
    hasFrontLocker: false,
    hasRearLocker: true,
    hasWinch: true,
    hasSwaybarDisconnect: false,
    hasSkidPlates: true,
    hasRockSliders: true,
    hasSnorkel: true,
    hasBeadlocks: false,
    isDailyDriver: true
  }
];

export function calculateRigMatch(rig: JeepRig, trail: Trail4x4): RigMatchResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Base Clearance Check (Estimated clearance = stock 9.7 + lift + (tires - 32)/2)
  const estimatedRigClearance = 9.7 + rig.liftInches + (rig.tireSizeInches - 32) / 2;
  const passesClearance = estimatedRigClearance >= trail.minClearanceInches;
  if (!passesClearance) {
    warnings.push(`Low Ground Clearance: Rig has ~${estimatedRigClearance.toFixed(1)}" vs trail minimum ${trail.minClearanceInches}". High centering risk!`);
  }

  // Tire Size Check
  const passesTires = rig.tireSizeInches >= trail.recommendedTireSize;
  if (!passesTires) {
    warnings.push(`Tires: Rig running ${rig.tireSizeInches}" tires (Trail recommends ${trail.recommendedTireSize}"+ for ledges & diff clearance).`);
  }

  // Locker Checks
  let passesLockers = true;
  if (trail.requiresRearLocker && !rig.hasRearLocker) {
    passesLockers = false;
    warnings.push(`Rear Locker Required: Trail obstacles require positive traction to prevent open-differential spin.`);
  }
  if (trail.requiresFrontLocker && !rig.hasFrontLocker) {
    passesLockers = false;
    warnings.push(`Front Locker Required: Extreme vertical steps require front axle pull.`);
  }

  // Winch Check
  const passesWinch = !trail.winchRecommended || rig.hasWinch;
  if (trail.winchRecommended && !rig.hasWinch) {
    recommendations.push(`Winch Recommended: Travel with a buddy rig equipped with recovery gear.`);
  }

  // Armor Check
  if (trail.skidPlatesRecommended && !rig.hasSkidPlates) {
    recommendations.push(`Skid Plates Advised: Vulnerable oil pan and transfer case risk direct rock impact.`);
  }
  if (trail.difficultyScale >= 6 && !rig.hasRockSliders) {
    recommendations.push(`Rock Sliders Advised: Risk of rocker panel and door tub damage on boulder shelves.`);
  }

  // Calculate score 0 - 100
  let score = 100;
  if (!passesClearance) score -= 30;
  if (!passesTires) score -= 20;
  if (!passesLockers) score -= 25;
  if (!passesWinch && trail.winchRecommended) score -= 15;
  if (!rig.hasRockSliders && trail.difficultyScale >= 6) score -= 10;
  
  score = Math.max(10, Math.min(100, score));

  let status: RigMatchResult["status"] = "Ready to Conquer";
  let color = "text-emerald-400 border-emerald-500 bg-emerald-500/10";

  if (score < 40 || trail.difficultyScale >= 9 && (!rig.hasFrontLocker || !rig.hasRearLocker)) {
    status = "Not Recommended";
    color = "text-red-400 border-red-500 bg-red-500/10";
  } else if (score < 70 || warnings.length >= 2) {
    status = "High Damage Risk";
    color = "text-orange-400 border-orange-500 bg-orange-500/10";
  } else if (score < 90 || warnings.length === 1) {
    status = "Caution / Spotter Required";
    color = "text-amber-400 border-amber-500 bg-amber-500/10";
  }

  return {
    score,
    status,
    color,
    warnings,
    recommendations,
    passesClearance,
    passesTires,
    passesLockers,
    passesWinch
  };
}
