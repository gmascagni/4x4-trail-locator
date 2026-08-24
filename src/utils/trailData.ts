import { Trail4x4 } from '../types';

export const FALLBACK_TRAILS: Trail4x4[] = [
  {
    id: "trail-hells-revenge",
    name: "Hell's Revenge (Badge of Honor)",
    address: "Sand Flats Recreation Area, Moab, UT 84532",
    region: "Moab, Utah",
    location: {
      lat: 38.5772,
      lng: -109.5238
    },
    rating: 4.9,
    userRatingsTotal: 1420,
    photos: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Dry slickrock dome conditions. Grippy surface, low wind, excellent visibility.",
    description: "One of Moab's most world-renowned slickrock trails. Features steep roller-coaster sandstone fins, perilous drop-offs with panoramic views of the La Sal Mountains and Negro Bill Canyon, and optional iconic extreme obstacles.",
    proTips: "Air down tires to 12-15 PSI for maximum rubber contact on Navajo Sandstone. Trust your spotter and keep tires squarely on high points.",
    difficultyScale: 6,
    difficultyCategory: "Difficult (Technical)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 10.5,
    recommendedTireSize: 35,
    requiresFrontLocker: false,
    requiresRearLocker: true,
    winchRecommended: true,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 0,
    lengthMiles: 6.5,
    trailType: "Loop",
    elevationGainFt: 1120,
    highestElevationFt: 4850,
    estimatedDriveTimeHours: 3.5,
    recommendedPsi: {
      slickrock: 14,
      sand: 12,
      crawling: 13,
      mud: 16,
      gravel: 18
    },
    hasCellService: "Spotty",
    emergencyRadioChannel: "CB Ch 4 / GMRS Ch 16",
    obstacles: [
      {
        name: "The Escalator",
        description: "Deep, twisting slickrock bathtub crevice requiring precise tire placement and throttle modulation.",
        hasBypass: true,
        difficultyRating: 8,
        requiresLocker: true,
        requiresWinch: false
      },
      {
        name: "Mickey's Hot Tub",
        description: "Conical sandstone depression with near-vertical wall climb out.",
        hasBypass: true,
        difficultyRating: 8,
        requiresLocker: true,
        requiresWinch: false
      },
      {
        name: "Tip-Over Challenge",
        description: "Steep off-camber rock face with severe body roll tendency.",
        hasBypass: true,
        difficultyRating: 7,
        requiresLocker: true,
        requiresWinch: false
      }
    ],
    terrainTags: ["Slickrock", "Rock Crawling", "Shelf Roads / High Exposure", "V-Notch & Waterfalls"],
    reviews: [
      {
        authorName: "Brett 'Crawler' Reynolds",
        text: "Did this in my 2022 Rubicon with 37s. The views are unmatched. Escalator is no joke—took the bypass on Hot Tub due to standing water.",
        rating: 5,
        date: "2 days ago"
      },
      {
        authorName: "Sarah Jenkins",
        text: "Stunning experience! Make sure your brakes and steering are in top shape. The fins feel intimidating at first but the traction is incredible.",
        rating: 5,
        date: "1 week ago"
      }
    ]
  },
  {
    id: "trail-rubicon-trail",
    name: "The Rubicon Trail (Badge of Honor)",
    address: "Rubicon Springs, Tahoma, CA 96142",
    region: "Sierra Nevada, California",
    location: {
      lat: 39.0039,
      lng: -120.2505
    },
    rating: 5.0,
    userRatingsTotal: 2150,
    photos: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Summer season open. High clearance granite boulder fields. Carry extra fluids, U-joints, and spare tire.",
    description: "The global benchmark for off-road prowess after which the iconic Jeep trim is named. 22 miles of relentless granite slabs, massive boulder gardens, and picturesque Sierra pine forests.",
    proTips: "Full undercarriage skid plates and solid rock sliders are non-negotiable. Travel with a group of at least 2-3 rigs.",
    difficultyScale: 9,
    difficultyCategory: "Extreme (Rock Crawling)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 12.0,
    recommendedTireSize: 37,
    requiresFrontLocker: true,
    requiresRearLocker: true,
    winchRecommended: true,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 24,
    lengthMiles: 22.0,
    trailType: "Point-to-Point",
    elevationGainFt: 3450,
    highestElevationFt: 7100,
    estimatedDriveTimeHours: 12.0,
    recommendedPsi: {
      crawling: 10,
      slickrock: 12,
      sand: 11,
      mud: 12,
      gravel: 15
    },
    hasCellService: "None",
    emergencyRadioChannel: "Ham 146.805 MHz / CB Ch 4",
    obstacles: [
      {
        name: "Cadillac Hill",
        description: "Relentless uphill granite boulder crawl with severe off-camber drops.",
        hasBypass: false,
        difficultyRating: 9,
        requiresLocker: true,
        requiresWinch: true
      },
      {
        name: "Big Sluice Box",
        description: "Brutal gauntlet of Volkswagen-sized granite boulders navigating down to Rubicon Springs.",
        hasBypass: false,
        difficultyRating: 9,
        requiresLocker: true,
        requiresWinch: true
      },
      {
        name: "Walker Rock / Walker Hill",
        description: "Steep ledges with high chance of differential drags.",
        hasBypass: false,
        difficultyRating: 8,
        requiresLocker: true,
        requiresWinch: false
      }
    ],
    terrainTags: ["Rock Crawling", "Boulder Fields", "Mud & Water Crossings", "Forest Service / Fire Roads"],
    reviews: [
      {
        authorName: "Dave Miller",
        text: "The bucket list trail. Completed Loon Lake to Tahoma in 2 days. Smashed my diff cover on Big Sluice, bring spares!",
        rating: 5,
        date: "3 weeks ago"
      }
    ]
  },
  {
    id: "trail-black-bear-pass",
    name: "Black Bear Pass (Badge of Honor)",
    address: "Black Bear Pass Rd, Telluride, CO 81435",
    region: "San Juan Mountains, Colorado",
    location: {
      lat: 37.9042,
      lng: -107.7592
    },
    rating: 4.8,
    userRatingsTotal: 980,
    photos: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Caution",
    trailheadStatusDetail: "One-way section open above Ingram Falls. Narrow switchbacks with 1,000+ ft sheer drops. Low range mandatory.",
    description: "Famous for the infamous warning sign: 'You don't have to be crazy to drive this road, but it helps.' Spectacular alpine scenery starting at 12,840 ft elevation descending into Telluride via tight switchbacks.",
    proTips: "One-way from Red Mountain Pass to Telluride. Never attempt in wet, snowy, or icy conditions. Ensure your parking brake and low 4WD gearing work flawlessly.",
    difficultyScale: 5,
    difficultyCategory: "Moderate (Trail)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 10.0,
    recommendedTireSize: 33,
    requiresFrontLocker: false,
    requiresRearLocker: false,
    winchRecommended: false,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: false,
    waterFordingDepthInches: 12,
    lengthMiles: 8.6,
    trailType: "Point-to-Point",
    elevationGainFt: 1800,
    highestElevationFt: 12840,
    estimatedDriveTimeHours: 3.0,
    recommendedPsi: {
      gravel: 18,
      crawling: 15,
      slickrock: 16,
      sand: 14,
      mud: 16
    },
    hasCellService: "Spotty",
    emergencyRadioChannel: "CB Ch 4 / GMRS Ch 15",
    obstacles: [
      {
        name: "The Steps (Ingram Falls)",
        description: "Steep rock ledge descent adjacent to the waterfall cliff edge.",
        hasBypass: false,
        difficultyRating: 6,
        requiresLocker: false,
        requiresWinch: false
      },
      {
        name: "Telluride Switchbacks",
        description: "Multi-point turns on loose shale above vertical cliffs.",
        hasBypass: false,
        difficultyRating: 5,
        requiresLocker: false,
        requiresWinch: false
      }
    ],
    terrainTags: ["Shelf Roads / High Exposure", "Forest Service / Fire Roads"],
    reviews: [
      {
        authorName: "Marcus Vance",
        text: "Breathtaking views of Bridal Veil Falls. The switchbacks require 3-point turns in a 4-door Wrangler. Stay calm and in 4-Lo.",
        rating: 5,
        date: "5 days ago"
      }
    ]
  },
  {
    id: "trail-fins-and-things",
    name: "Fins & Things (Badge of Honor)",
    address: "Sand Flats Rd, Moab, UT 84532",
    region: "Moab, Utah",
    location: {
      lat: 38.5833,
      lng: -109.4833
    },
    rating: 4.7,
    userRatingsTotal: 1250,
    photos: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Excellent conditions. Follow the painted white dinosaur tracks / dashes.",
    description: "The quintessential intro to Moab slickrock crawling. Provides thrilling climbs and descents on steep sandstone domes with manageable bypasses.",
    proTips: "Watch your departure angle coming off steep sandstone ledges to avoid bumper scrapes.",
    difficultyScale: 4,
    difficultyCategory: "Moderate (Trail)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 9.5,
    recommendedTireSize: 33,
    requiresFrontLocker: false,
    requiresRearLocker: false,
    winchRecommended: false,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 0,
    lengthMiles: 9.4,
    trailType: "Loop",
    elevationGainFt: 850,
    highestElevationFt: 4600,
    estimatedDriveTimeHours: 3.0,
    recommendedPsi: {
      slickrock: 14,
      sand: 12,
      crawling: 14,
      mud: 16,
      gravel: 18
    },
    hasCellService: "Good",
    emergencyRadioChannel: "CB Ch 4",
    obstacles: [
      {
        name: "Frenchie's Fin",
        description: "Steep ascent up a narrow sandstone spine with rapid roll drop-offs on both flanks.",
        hasBypass: true,
        difficultyRating: 5,
        requiresLocker: false,
        requiresWinch: false
      },
      {
        name: "Dino Ledge",
        description: "2-foot drop requiring controlled brake throttle balance.",
        hasBypass: true,
        difficultyRating: 4,
        requiresLocker: false,
        requiresWinch: false
      }
    ],
    terrainTags: ["Slickrock", "Sand Dunes"],
    reviews: [
      {
        authorName: "Kelly O'Connor",
        text: "Did this in my stock Rubicon. Perfect confidence builder before attempting Hell's Revenge!",
        rating: 5,
        date: "1 month ago"
      }
    ]
  },
  {
    id: "trail-poison-spider-mesa",
    name: "Poison Spider Mesa (Badge of Honor)",
    address: "Potash Rd, Moab, UT 84532",
    region: "Moab, Utah",
    location: {
      lat: 38.5322,
      lng: -109.6085
    },
    rating: 4.8,
    userRatingsTotal: 860,
    photos: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Dry, clear trail markings. Waterfall obstacle has moderate ledge undercut.",
    description: "Diverse trail blending sand dunes, slickrock domes, and challenging stair-step ledges culminating at Little Arch overlook over the Colorado River.",
    proTips: "Lockers strongly recommended on The Waterfall obstacle. Watch for deep sand pockets near the mesa rim.",
    difficultyScale: 7,
    difficultyCategory: "Difficult (Technical)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 11.0,
    recommendedTireSize: 35,
    requiresFrontLocker: false,
    requiresRearLocker: true,
    winchRecommended: true,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 0,
    lengthMiles: 16.0,
    trailType: "Out & Back",
    elevationGainFt: 1400,
    highestElevationFt: 5100,
    estimatedDriveTimeHours: 4.5,
    recommendedPsi: {
      slickrock: 13,
      sand: 11,
      crawling: 12,
      mud: 15,
      gravel: 16
    },
    hasCellService: "Spotty",
    emergencyRadioChannel: "CB Ch 4 / GMRS Ch 16",
    obstacles: [
      {
        name: "The Waterfall",
        description: "Tall tiered sandstone ledge obstacle that tests front approach angle and suspension flex.",
        hasBypass: true,
        difficultyRating: 7,
        requiresLocker: true,
        requiresWinch: false
      },
      {
        name: "The Wedges",
        description: "Off-camber V-crack rock notch.",
        hasBypass: false,
        difficultyRating: 6,
        requiresLocker: true,
        requiresWinch: false
      }
    ],
    terrainTags: ["Slickrock", "Rock Crawling", "Sand Dunes", "V-Notch & Waterfalls"],
    reviews: []
  },
  {
    id: "trail-windrock-park",
    name: "Windrock Park - Trail 16 (Badge of Honor)",
    address: "912 Windrock Rd, Oliver Springs, TN 37840",
    region: "Appalachia, Tennessee",
    location: {
      lat: 36.0381,
      lng: -84.3417
    },
    rating: 4.9,
    userRatingsTotal: 1740,
    photos: [
      "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Caution",
    trailheadStatusDetail: "Recent mountain rain. Wet rock gardens, slick clay mud pits, high traction tire lugs advised.",
    description: "Located in the massive 73,000-acre Windrock Park. Trail 16 is notorious for steep mountain rock shelves, muddy hill climbs, and dense hardwood forest crawling.",
    proTips: "Carry a winch recovery kit with tree trunk protector and snatch block. Wet Tennessee limestone offers zero traction when muddy.",
    difficultyScale: 8,
    difficultyCategory: "Extreme (Rock Crawling)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 12.5,
    recommendedTireSize: 37,
    requiresFrontLocker: true,
    requiresRearLocker: true,
    winchRecommended: true,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 20,
    lengthMiles: 3.8,
    trailType: "Point-to-Point",
    elevationGainFt: 1650,
    highestElevationFt: 3200,
    estimatedDriveTimeHours: 3.5,
    recommendedPsi: {
      mud: 11,
      crawling: 10,
      slickrock: 12,
      sand: 12,
      gravel: 15
    },
    hasCellService: "Spotty",
    emergencyRadioChannel: "CB Ch 16 / GMRS Ch 20",
    obstacles: [
      {
        name: "Little Mule Rock Garden",
        description: "Greasy limestone slab garden with 3-foot undercut ledges.",
        hasBypass: false,
        difficultyRating: 8,
        requiresLocker: true,
        requiresWinch: true
      },
      {
        name: "The Chute",
        description: "Narrow V-ditch with tall mud walls and protruding boulders.",
        hasBypass: true,
        difficultyRating: 8,
        requiresLocker: true,
        requiresWinch: false
      }
    ],
    terrainTags: ["Rock Crawling", "Mud & Water Crossings", "Boulder Fields", "V-Notch & Waterfalls"],
    reviews: []
  },
  {
    id: "trail-sand-hollow",
    name: "Sand Hollow - The Maze & Double Sammy",
    address: "3300 S Sand Hollow Rd, Hurricane, UT 84737",
    region: "Hurricane / St. George, Utah",
    location: {
      lat: 37.1235,
      lng: -113.3855
    },
    rating: 4.9,
    userRatingsTotal: 1100,
    photos: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Red sand & red slickrock dry and grippy. High sun, carry extra drinking water.",
    description: "World-class red rock crawling surrounded by bright red sand dunes and turquoise reservoir waters. Home to famous winter 4x4 events.",
    proTips: "Lower tire pressure to 10-12 PSI for sand dune transitions and aggressive traction on sandstone steps.",
    difficultyScale: 7,
    difficultyCategory: "Difficult (Technical)",
    isBadgeOfHonor: false,
    minClearanceInches: 11.5,
    recommendedTireSize: 35,
    requiresFrontLocker: false,
    requiresRearLocker: true,
    winchRecommended: true,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 0,
    lengthMiles: 7.2,
    trailType: "Loop",
    elevationGainFt: 980,
    highestElevationFt: 3600,
    estimatedDriveTimeHours: 3.5,
    recommendedPsi: {
      sand: 10,
      slickrock: 12,
      crawling: 11,
      mud: 14,
      gravel: 16
    },
    hasCellService: "Good",
    emergencyRadioChannel: "CB Ch 4",
    obstacles: [
      {
        name: "The Chute (Double Sammy)",
        description: "Steep technical slot climb with extreme tire wedge dynamics.",
        hasBypass: true,
        difficultyRating: 7,
        requiresLocker: true,
        requiresWinch: false
      }
    ],
    terrainTags: ["Rock Crawling", "Slickrock", "Sand Dunes"],
    reviews: []
  },
  {
    id: "trail-imogene-pass",
    name: "Imogene Pass (Badge of Honor)",
    address: "Camp Bird Rd, Ouray, CO 81427",
    region: "San Juan Mountains, Colorado",
    location: {
      lat: 37.9317,
      lng: -107.7364
    },
    rating: 4.9,
    userRatingsTotal: 1890,
    photos: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Summit pass clear at 13,114 ft. Tomboy ghost town open for historical exploration.",
    description: "The second highest drivable mountain pass in Colorado. Connects Ouray ('Switzerland of America') to Telluride over rugged tundra, historical mining ruins, and creek crossings.",
    proTips: "Engage 4-Lo on steep descents to utilize engine braking. Yield to uphill traffic.",
    difficultyScale: 4,
    difficultyCategory: "Moderate (Trail)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 9.5,
    recommendedTireSize: 33,
    requiresFrontLocker: false,
    requiresRearLocker: false,
    winchRecommended: false,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: false,
    waterFordingDepthInches: 18,
    lengthMiles: 17.5,
    trailType: "Point-to-Point",
    elevationGainFt: 5320,
    highestElevationFt: 13114,
    estimatedDriveTimeHours: 4.5,
    recommendedPsi: {
      gravel: 18,
      crawling: 16,
      slickrock: 16,
      sand: 14,
      mud: 16
    },
    hasCellService: "Spotty",
    emergencyRadioChannel: "CB Ch 4 / GMRS Ch 15",
    obstacles: [
      {
        name: "Tomboy Ridge Shelf",
        description: "Narrow rocky shelf road with sheer mountain valley drops.",
        hasBypass: false,
        difficultyRating: 4,
        requiresLocker: false,
        requiresWinch: false
      }
    ],
    terrainTags: ["Shelf Roads / High Exposure", "Forest Service / Fire Roads", "Mud & Water Crossings"],
    reviews: []
  },
  {
    id: "trail-rausch-creek",
    name: "Rausch Creek Off-Road Park (Badge of Honor Trails)",
    address: "453 Molleystown Rd, Pine Grove, PA 17963",
    region: "Appalachia, Pennsylvania",
    location: {
      lat: 40.5971,
      lng: -76.4719
    },
    rating: 4.7,
    userRatingsTotal: 1350,
    photos: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Park open Thursday-Sunday. 3,000 acres of guided rocky glades, water troughs, and rock crawling.",
    description: "The premier off-road park in the Northeast US. Multi-level trails ranging from mild green trails to insane boulder crawling at Lake Christy and CV Trail.",
    proTips: "Pennsylvania mud contains sharp shale. Keep air down moderate (12-14 PSI) to prevent sidewall pinch flats.",
    difficultyScale: 6,
    difficultyCategory: "Difficult (Technical)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 11.0,
    recommendedTireSize: 35,
    requiresFrontLocker: false,
    requiresRearLocker: true,
    winchRecommended: true,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 22,
    lengthMiles: 14.0,
    trailType: "OHV Park Grid",
    elevationGainFt: 720,
    highestElevationFt: 1450,
    estimatedDriveTimeHours: 5.0,
    recommendedPsi: {
      crawling: 12,
      mud: 12,
      gravel: 16,
      sand: 14,
      slickrock: 14
    },
    hasCellService: "Spotty",
    emergencyRadioChannel: "CB Ch 4 / Park Staff 462.5625 MHz",
    obstacles: [
      {
        name: "Rock Creek Boulder Garden",
        description: "Endless glacial boulder field testing belly clearance.",
        hasBypass: true,
        difficultyRating: 7,
        requiresLocker: true,
        requiresWinch: false
      }
    ],
    terrainTags: ["Rock Crawling", "Boulder Fields", "Mud & Water Crossings"],
    reviews: []
  },
  {
    id: "trail-hollister-hills",
    name: "Hollister Hills SVRA (Badge of Honor)",
    address: "7800 Cienega Rd, Hollister, CA 95023",
    region: "Central Coast, California",
    location: {
      lat: 36.7719,
      lng: -121.4194
    },
    rating: 4.6,
    userRatingsTotal: 890,
    photos: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Upper Ranch 4WD area open daily. Obstacle course and hill climb test areas dry.",
    description: "California state vehicular recreation area featuring tight canyon trails, mud pits, stair-step obstacles, and high-traction frame twisters in the Diablo Mountain Range.",
    proTips: "Great training ground for testing suspension flex and locker engagement before heading into the High Sierra.",
    difficultyScale: 5,
    difficultyCategory: "Moderate (Trail)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 10.0,
    recommendedTireSize: 33,
    requiresFrontLocker: false,
    requiresRearLocker: false,
    winchRecommended: false,
    skidPlatesRecommended: true,
    swaybarDisconnectRecommended: true,
    waterFordingDepthInches: 12,
    lengthMiles: 11.2,
    trailType: "OHV Park Grid",
    elevationGainFt: 1250,
    highestElevationFt: 2400,
    estimatedDriveTimeHours: 3.5,
    recommendedPsi: {
      mud: 14,
      gravel: 16,
      crawling: 13,
      sand: 12,
      slickrock: 14
    },
    hasCellService: "Good",
    emergencyRadioChannel: "CB Ch 4",
    obstacles: [
      {
        name: "The Frame Twister",
        description: "Offset concrete and log dips that force opposite suspension compression.",
        hasBypass: true,
        difficultyRating: 6,
        requiresLocker: true,
        requiresWinch: false
      }
    ],
    terrainTags: ["Forest Service / Fire Roads", "V-Notch & Waterfalls", "Mud & Water Crossings"],
    reviews: []
  },
  {
    id: "trail-ocala-national-forest",
    name: "Ocala National Forest - Tread Lightly 4WD Way",
    address: "State Rd 40, Silver Springs, FL 34488",
    region: "Central Florida",
    location: {
      lat: 29.1872,
      lng: -81.7947
    },
    rating: 4.5,
    userRatingsTotal: 650,
    photos: [
      "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
    ],
    trailheadStatus: "Open",
    trailheadStatusDetail: "Sugar sand and pine scrub tracks open. Bring tire deflator and 12V air compressor.",
    description: "Florida's signature designated 4WD trail. Winding 81-mile trail through pine flatwoods, deep soft sugar sand washes, and swamp waterholes.",
    proTips: "Sugar sand gets extremely soft in midday heat. Deflate to 12-14 PSI early to avoid high-centering in sand ruts.",
    difficultyScale: 3,
    difficultyCategory: "Easy (Scenic)",
    isBadgeOfHonor: true,
    badgePoints: 10,
    minClearanceInches: 9.0,
    recommendedTireSize: 32,
    requiresFrontLocker: false,
    requiresRearLocker: false,
    winchRecommended: false,
    skidPlatesRecommended: false,
    swaybarDisconnectRecommended: false,
    waterFordingDepthInches: 18,
    lengthMiles: 81.0,
    trailType: "Point-to-Point",
    elevationGainFt: 210,
    highestElevationFt: 160,
    estimatedDriveTimeHours: 6.0,
    recommendedPsi: {
      sand: 12,
      mud: 14,
      gravel: 18,
      crawling: 16,
      slickrock: 18
    },
    hasCellService: "Spotty",
    emergencyRadioChannel: "CB Ch 4 / GMRS Ch 16",
    obstacles: [
      {
        name: "Big Scrub Sand Sinks",
        description: "Deep sugar sand hill sections prone to digging in.",
        hasBypass: false,
        difficultyRating: 3,
        requiresLocker: false,
        requiresWinch: false
      }
    ],
    terrainTags: ["Sand Dunes", "Desert Washes", "Mud & Water Crossings", "Forest Service / Fire Roads"],
    reviews: []
  }
];

export const REGIONAL_HUBS = [
  { name: "Moab, Utah", query: "Moab, UT", center: { lat: 38.5733, lng: -109.5498 } },
  { name: "Rubicon / Lake Tahoe, CA", query: "Tahoma, CA", center: { lat: 39.0039, lng: -120.2505 } },
  { name: "Ouray & Telluride, CO", query: "Ouray, CO", center: { lat: 37.9317, lng: -107.7364 } },
  { name: "Sand Hollow, UT", query: "Hurricane, UT", center: { lat: 37.1235, lng: -113.3855 } },
  { name: "Windrock Park, TN", query: "Oliver Springs, TN", center: { lat: 36.0381, lng: -84.3417 } },
  { name: "Rausch Creek, PA", query: "Pine Grove, PA", center: { lat: 40.5971, lng: -76.4719 } },
  { name: "Hollister Hills, CA", query: "Hollister, CA", center: { lat: 36.7719, lng: -121.4194 } },
  { name: "Ocala Forest, FL", query: "Silver Springs, FL", center: { lat: 29.1872, lng: -81.7947 } }
];
