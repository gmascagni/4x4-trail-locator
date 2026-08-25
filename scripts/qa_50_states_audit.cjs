const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetFile = 'c:/Users/gmasc/Documents/Antigravity/4x4TrailFinder/index.html';
const content = fs.readFileSync(targetFile, 'utf8');

console.log('====================================================');
console.log('🧪 RUNNING 4X4 TRAILFINDER 50-STATE QA AUDIT SUITE');
console.log('====================================================\n');

// 1. Parse Script Context
const scriptStart = content.indexOf('<script>') + 8;
const scriptEnd = content.indexOf('</script>', scriptStart);
const scriptCode = content.slice(scriptStart, scriptEnd);

let renderedCards = [];
let drawnLayers = [];
let currentBounds = null;

const sandbox = {
  window: {
    US_STATES_GEOJSON_DATA: JSON.parse(fs.readFileSync('c:/Users/gmasc/Documents/Antigravity/4x4TrailFinder/assets/us_states.geojson', 'utf8'))
  },
  document: {
    getElementById: (id) => ({
      innerHTML: '',
      innerText: '',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      value: id === 'searchInput' ? sandbox.searchQuery : '',
      appendChild: (c) => renderedCards.push(c)
    }),
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } })
  },
  L: {
    map: () => ({
      removeLayer: () => {},
      flyTo: () => {},
      invalidateSize: () => {},
      fitBounds: (b) => { currentBounds = b; },
      setView: () => {}
    }),
    tileLayer: () => ({ addTo: () => {} }),
    layerGroup: () => ({ addTo: () => {}, clearLayers: () => {} }),
    divIcon: () => ({}),
    marker: () => ({
      bindPopup: () => ({ addTo: () => {} }),
      bindTooltip: () => ({ bindPopup: () => ({ addTo: () => {} }) }),
      addTo: () => {}
    }),
    circle: () => ({ addTo: () => {} }),
    rectangle: () => ({ addTo: () => ({ bindTooltip: () => {} }) }),
    geoJSON: (data, opts) => ({
      addTo: () => {
        drawnLayers.push({ type: 'geoJSON', data });
        return { bindTooltip: () => {} };
      },
      getBounds: () => ({ pad: () => ({}) })
    }),
    latLngBounds: () => ({ pad: () => ({}) })
  },
  navigator: { geolocation: { getCurrentPosition: (cb) => cb({ coords: { latitude: 34.7, longitude: -84.0 } }) } },
  console: { log: () => {}, warn: () => {}, error: console.error },
  setTimeout: (fn) => fn(),
  encodeURIComponent: encodeURIComponent
};

vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

// 2. AUDIT 1: Database Integrity & Deduplication Check
console.log('▶ TEST 1: Database Integrity & Deduplication Audit...');
const allTrails = sandbox.window.TRAILS || sandbox.TRAILS;
console.log(`  ✔ Total Trails Loaded: ${allTrails.length}`);

const idSet = new Set();
const duplicateIds = [];
allTrails.forEach(t => {
  if (idSet.has(t.id)) duplicateIds.push(t.id);
  idSet.add(t.id);

  if (!t.name || !t.stateCode || !t.lat || !t.lng) {
    console.error(`  ❌ Trail missing required fields: ${JSON.stringify(t)}`);
    process.exit(1);
  }
});

if (duplicateIds.length > 0) {
  console.error(`  ❌ Duplicate Trail IDs found: ${duplicateIds.join(', ')}`);
  process.exit(1);
}
console.log('  ✔ 0 Duplicate IDs found across entire database. Integrity verified!\n');

// 3. AUDIT 2: Comprehensive 50-State Query & GeoJSON Resolution Audit
console.log('▶ TEST 2: Comprehensive 50-State Search & GeoJSON Boundary Audit...');

const ALL_50_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

let failedStates = [];

ALL_50_STATES.forEach(st => {
  // Test by full state name
  renderedCards = [];
  drawnLayers = [];
  sandbox.searchQuery = st.name;
  sandbox.userLat = 34.7000;
  sandbox.userLng = -84.0000;
  sandbox.renderTrails();

  if (renderedCards.length === 0) {
    failedStates.push(`${st.name} (${st.code}) - 0 trails returned on state name search`);
    return;
  }

  // Test by state abbreviation
  renderedCards = [];
  sandbox.searchQuery = st.code;
  sandbox.renderTrails();

  if (renderedCards.length === 0) {
    failedStates.push(`${st.name} (${st.code}) - 0 trails returned on abbreviation search`);
    return;
  }

  // Verify GeoJSON feature exists in dataset
  const feature = sandbox.window.US_STATES_GEOJSON_DATA.features.find(f =>
    (f.properties && f.properties.name && f.properties.name.toLowerCase() === st.name.toLowerCase()) ||
    (f.id && f.id === st.code)
  );

  if (!feature) {
    failedStates.push(`${st.name} (${st.code}) - Missing GeoJSON boundary polygon`);
  }
});

if (failedStates.length > 0) {
  console.error(`  ❌ 50-State Audit Failed on ${failedStates.length} states:`);
  failedStates.forEach(f => console.error(`     - ${f}`));
  process.exit(1);
}

console.log(`  ✔ All 50 US States verified with active trails and GeoJSON borders!\n`);

// 4. AUDIT 3: Dynamic GPS Distance Calculations
console.log('▶ TEST 3: Dynamic GPS Distance Calculation Audit...');
const testTrail = allTrails[0];
const dist1 = sandbox.calculateDistanceInMiles(34.7, -84.0, testTrail.lat, testTrail.lng);
const dist2 = sandbox.calculateDistanceInMiles(40.7, -74.0, testTrail.lat, testTrail.lng);

if (typeof dist1.miles !== 'number' || typeof dist2.miles !== 'number' || dist1.miles === dist2.miles) {
  console.error('  ❌ GPS Distance calculation failed dynamic test!');
  process.exit(1);
}
console.log(`  ✔ Dynamic Haversine calculation verified! (Pos 1: ${dist1.miles} mi, Pos 2: ${dist2.miles} mi)\n`);

console.log('====================================================');
console.log('✅ ALL 50-STATE QA CHECKS PASSED WITH 100% SUCCESS!');
console.log('====================================================\n');
process.exit(0);
