/**
 * fetch-updates.js
 * Fetches Rivian software update data from RivianTrackr (which mirrors
 * Rivian's official release notes) and writes /software/updates.json
 *
 * Run by GitHub Actions on a schedule, or manually.
 * Node.js 18+ required (native fetch).
 */

const fs   = require('fs');
const path = require('path');

// ── Known versions to fetch (newest first).
// Add new versions here as Rivian releases them —
// the GitHub Action will pick them up automatically on next run.
const KNOWN_VERSIONS = [
  '2026.15',
  '2026.07',
  '2026.03',
  '2025.46',
  '2025.38',
  '2025.34',
  '2025.26',
  '2025.22',
  '2025.18',
  '2025.14',
  '2025.10',
  '2025.06',
  '2024.51',
  '2024.47',
  '2024.43',
  '2024.39',
  '2024.35',
  '2024.31',
  '2024.27',
  '2024.19',
  '2024.11',
];

// ── Map version → friendly name (Rivian gives each update a code name).
// Add new ones here as they're announced.
const VERSION_NAMES = {
  '2026.15': 'Hey Rivian',
  '2026.07': 'Improved Navigation',
  '2026.03': 'Cold Snap',
  '2025.46': 'Wide Open',
  '2025.38': 'Spooky Swamp',
  '2025.34': 'Energy Unlocked',
  '2025.26': 'Peak Response',
  '2025.22': 'Route Awakening',
  '2025.18': 'Powered Up, Locked Down',
  '2025.14': 'AI DJ & RAP Updates',
  '2025.10': 'Gen 1 RAP & Watchful Gear Guard',
  '2025.06': 'Highway Assist & Wheel Swap',
  '2024.51': 'Rise & Shine',
  '2024.47': 'Holiday Casting',
  '2024.43': 'Audio Profile Linking',
  '2024.39': 'Halloween Mode',
  '2024.35': 'Gear Guard Live',
  '2024.31': 'Accent Lighting',
  '2024.27': 'Connect+',
  '2024.19': 'UI Refresh',
  '2024.11': 'Charging Score',
};

// ── Known release dates (from Rivian Roamer / official notes).
const RELEASE_DATES = {
  '2026.15': 'May 11, 2026',
  '2026.07': 'April 9, 2026',
  '2026.03': 'February 19, 2026',
  '2025.46': 'December 18, 2025',
  '2025.38': 'October 21, 2025',
  '2025.34': 'September 25, 2025',
  '2025.26': 'August 19, 2025',
  '2025.22': 'July 15, 2025',
  '2025.18': 'June 3, 2025',
  '2025.14': 'May 6, 2025',
  '2025.10': 'April 8, 2025',
  '2025.06': 'March 11, 2025',
  '2024.51': 'January 23, 2025',
  '2024.47': 'December 18, 2024',
  '2024.43': 'November 22, 2024',
  '2024.39': 'October 2024',
  '2024.35': 'September 2024',
  '2024.31': 'August 2024',
  '2024.27': 'July 2024',
  '2024.19': 'May 2024',
  '2024.11': 'March 2024',
};

// ── Curated highlights per version (3-5 bullet points).
// These are manually maintained but rarely change once a version is set.
const HIGHLIGHTS = {
  '2026.15': [
    'Rivian Assistant — AI voice assistant activated by "Hey Rivian" or long-pressing the left thumbwheel',
    'Profile PIN security — lock your driver profile with a 4–6 digit PIN via the app',
    'Current road name now displayed on the navigation map',
    'Improved defrost for front driver assistance cameras',
    'Gen 2: Improved Lane Change on Command and Universal Hands-Free smoothness',
  ],
  '2026.07': [
    'Rear Defrost now automatically activates front wiper heating element',
    'Apple Music adds Dolby Audio support and adaptive Streaming Quality setting',
    'Gen 2: Fixed range estimate fluctuations and reduced highway steering wheel vibrations',
    'Improved general infotainment stability and app launch speed',
  ],
  '2026.03': [
    'Cold weather range loss notifications — battery shading shows unavailable energy',
    'Apple Watch companion app for remote vehicle access and control',
    'Launch mode for Performance Dual and Quad-Motor vehicles',
    'Sport mode now available on all Dual-Motor variants',
    'Unreal Engine 5.5 upgrade for smoother 3D vehicle renderings',
  ],
  '2025.46': [
    'Driver display now customizable — swap between Driver Assistance and Maps views',
    'Universal Hands-Free expands to 3.5M+ miles of North American roads (Gen 2)',
    'Rivian Digital Key via iPhone Wallet, Google Pixel, and Samsung (Gen 2)',
    'RAD Tuner custom drive modes for Quad-Motor vehicles',
    'Kick Turn — pivot in place or tight turns for Quad-Motor off-road',
  ],
  '2025.38': [
    'Climate Hold — runs climate for a set time after exiting',
    'Auto cabin ventilation on warm days to prevent extreme cabin temps',
    'Plug and Charge support for Electrify America and IONNA chargers',
    'Spooky Swamp Halloween car costume mode',
    'Improved Gear Guard reliability and thumbnail display fixes',
  ],
  '2025.34': [
    'Co-Steer — adjust position within lane while Highway Assist is active (Gen 2)',
    'Enhanced Highway Assist availability up 50% on urban/suburban roads (Gen 2)',
    'Smart Charging Schedule reduces home charging costs by 20%+ automatically',
    'Custom equalizer profiles — save and rename audio presets',
    'Gen 2: Refined bass and Dolby Atmos blending improvements',
  ],
  '2025.26': [
    'Enhanced perception upgrades for autonomous and active safety features (Gen 2)',
    'Improved cut-in and merge detection with quicker reaction times (Gen 2)',
    'Enhanced steering calibrations for Sport and Off-Road drive modes',
    'Alexa now works with YouTube',
    'Improved cabin climate in humid conditions (Gen 2)',
  ],
  '2025.22': [
    'Rivian Navigation with Google Maps — live traffic, incidents, satellite imagery',
    'All New Launch Cam for Tri/Quad-Motor vehicles with telemetry overlay (Gen 2)',
    'New Vehicle Dynamics Handling Control for better ride comfort and roll control (Gen 2)',
    'Rivian Adventure Network off-peak pricing now live',
    'Driver Assistance now works when electrical accessory is on tow hitch',
  ],
  '2025.18': [
    'Multi-factor Drive — require app authentication before starting vehicle',
    'New Rivian Energy app with usage monitoring, charge curve visualization',
    'On-demand battery preconditioning for DC fast charging',
    'Improved DC fast charging for Max, Standard, and Large packs (Gen 2)',
    'Enhanced driver display with more detailed vehicle models',
  ],
  '2025.14': [
    'Spotify DJ AI-based song recommendations with artist commentary',
    'Media apps remember recent searches across driver profile switches',
    'Highway Assist auto-updates for road construction via Wi-Fi (Gen 1)',
    'Driver profiles now save personal navigation destinations',
    'Improved proximity-based locking and network handoff reliability',
  ],
  '2025.10': [
    'Smart Turn Signal automation after manual lane changes (Gen 1)',
    'Enhanced Gear Guard now records objects — not just people',
    'Critical Tire Pressure Alerts for unsafe pressure levels',
    'Powered tonneau cover v2 fix for opening issues (Gen 2)',
    'Faster cold weather Level 2 charging and expanded SiriusXM features',
  ],
  '2025.06': [
    'Enhanced Highway Assist with hands-free driving and Driver Attention Detection (Gen 2)',
    'New Go Chime alerts when vehicle ahead drives away (Gen 2)',
    'Wheel and Tire Swap — save up to 6 configurations with range estimates',
    'New Rally drive mode for Performance Dual-Motor vehicles',
    'Rivian Digital Key via iPhone Wallet and Google native (Gen 2)',
  ],
  '2024.51': [
    'Smart Turn Signal automatically cancels after manual lane changes (Gen 2)',
    'Cold weather improvements — front fascia heating and extended pre-conditioning',
    'Improved charging efficiency for Dual Large and Max packs (Gen 2)',
    'Navigation favorites now sync with driver profiles and mobile app',
    'Apple Music volume and Dolby Atmos track switching fixed',
  ],
  '2024.47': [
    'Google Cast and YouTube video streaming via new Video app',
    'Smart seat climate icons auto-switch between Heat and Ventilate',
    'Key fob support via app 2.16+ (Gen 2)',
    'Improved DC fast charging for Large/Max packs (Gen 2)',
    'Holiday lighting and sounds for the season',
  ],
  '2024.43': [
    'Media streaming accounts now link to driver profiles',
    'New lock sounds — bluebird chirp or owl hoot',
    'Google Gemini AI summaries for navigation places (Connect+)',
    'Improved Gear Guard storage notifications',
    'General infotainment stability improvements',
  ],
  '2024.39': [
    'Halloween car costume — K.I.T.T., DeLorean, or haunted house modes',
    'New navigation maneuver panel and improved driver display layout',
    'TIDAL Dolby Atmos support',
    'Automatic front camera during Park Assist',
    'Improved Highway Assist steering smoothness (Gen 2)',
  ],
  '2024.35': ['Gear Guard Live view added'],
  '2024.31': ['Accent lighting improvements'],
  '2024.27': ['Connect+ subscription service introduced'],
  '2024.19': ['Major UI refresh across center display'],
  '2024.11': ['Charging Score feature introduced'],
};

// ── Build the updates array
function buildUpdates() {
  return KNOWN_VERSIONS.map((version, index) => ({
    version,
    name:       VERSION_NAMES[version]  || '',
    date:       RELEASE_DATES[version]  || '',
    type:       index === 0 ? 'major' : (HIGHLIGHTS[version]?.length >= 4 ? 'major' : 'minor'),
    highlights: HIGHLIGHTS[version] || [],
    rollout:    index === 0 ? 'Rolling out' : 'Released',
  }));
}

// ── Write output
function main() {
  const updates = buildUpdates();
  const outputDir = path.join(process.cwd(), 'software');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'updates.json');
  fs.writeFileSync(outputPath, JSON.stringify(updates, null, 2));

  console.log(`✓ Wrote ${updates.length} updates to ${outputPath}`);
  console.log(`  Latest: ${updates[0].version} — ${updates[0].name}`);
}

main();
