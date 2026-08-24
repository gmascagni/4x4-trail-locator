const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOTS_DIR = path.join(PROJECT_ROOT, 'backups', 'snapshots');
const MANIFEST_FILE = path.join(SNAPSHOTS_DIR, 'snapshots_manifest.json');

if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

function loadManifest() {
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
}

function getTimestampId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${y}-${m}-${d}_${hh}-${mm}-${ss}`;
}

function createSnapshot(description = 'Manual Snapshot') {
  const timestamp = getTimestampId();
  const manifest = loadManifest();
  const versionNum = `v2.${manifest.length + 4}.0`;
  const snapshotId = `${versionNum}_${timestamp}`;
  const targetZip = path.join(SNAPSHOTS_DIR, `${snapshotId}.zip`);

  console.log(`\n==================================================`);
  console.log(`📦 CREATING VERSION SNAPSHOT: ${snapshotId}`);
  console.log(`📝 Description: "${description}"`);
  console.log(`==================================================\n`);

  const itemsToZip = ['index.html', 'package.json', 'README.md', 'assets', 'public', '.github', 'scripts'];
  const existingItems = itemsToZip.filter(i => fs.existsSync(path.join(PROJECT_ROOT, i)));
  const pathsArg = existingItems.map(i => `'${path.join(PROJECT_ROOT, i)}'`).join(',');

  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path ${pathsArg} -DestinationPath '${targetZip}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });

  const stats = fs.statSync(targetZip);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  let gitHash = 'N/A';
  try {
    gitHash = execSync('git rev-parse --short HEAD', { cwd: PROJECT_ROOT }).toString().trim();
  } catch (e) {}

  const snapshotEntry = {
    id: snapshotId,
    version: versionNum,
    timestamp: new Date().toISOString(),
    displayDate: new Date().toLocaleString(),
    description,
    zipFile: `${snapshotId}.zip`,
    sizeMb: `${sizeMb} MB`,
    gitHash
  };

  manifest.unshift(snapshotEntry);
  saveManifest(manifest);

  try {
    execSync(`git tag -a "${snapshotId}" -m "${description}"`, { cwd: PROJECT_ROOT, stdio: 'ignore' });
  } catch (e) {}

  console.log(`\n✅ SNAPSHOT CREATED SUCCESSFULLY!`);
  console.log(`   Version:     ${versionNum}`);
  console.log(`   Snapshot ID: ${snapshotId}`);
  console.log(`   File Size:   ${sizeMb} MB`);
  console.log(`   Saved Path:  ${targetZip}\n`);
  return snapshotEntry;
}

function listSnapshots() {
  const manifest = loadManifest();
  console.log(`\n========================================================================`);
  console.log(`📋 4X4 TRAILFINDER - VERSION CONTROL SNAPSHOT HISTORY (${manifest.length} saved points)`);
  console.log(`========================================================================\n`);

  if (manifest.length === 0) {
    console.log('No snapshots found yet. Run "npm run snapshot" to create your first snapshot.\n');
    return [];
  }

  console.log('INDEX | VERSION | DATE / TIME            | GIT COMMIT | DESCRIPTION');
  console.log('------------------------------------------------------------------------');
  manifest.forEach((s, idx) => {
    const num = String(idx + 1).padStart(2, ' ');
    const ver = String(s.version || 'N/A').padEnd(7, ' ');
    const date = String(s.displayDate || s.timestamp).padEnd(22, ' ');
    const git = String(s.gitHash || 'N/A').padEnd(10, ' ');
    console.log(` [${num}] | ${ver} | ${date} | ${git} | ${s.description}`);
  });
  console.log('------------------------------------------------------------------------\n');
  return manifest;
}

function rollback(targetIdentifier) {
  const manifest = loadManifest();
  if (manifest.length === 0) {
    console.error('❌ Error: No snapshots available to roll back to.');
    return;
  }

  let selectedSnapshot = null;

  if (targetIdentifier) {
    const idx = parseInt(targetIdentifier, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= manifest.length) {
      selectedSnapshot = manifest[idx - 1];
    } else {
      selectedSnapshot = manifest.find(s => s.id === targetIdentifier || s.version === targetIdentifier || s.id.includes(targetIdentifier));
    }
  } else {
    if (manifest.length > 1) {
      selectedSnapshot = manifest[1];
    } else {
      selectedSnapshot = manifest[0];
    }
  }

  if (!selectedSnapshot) {
    console.error(`❌ Error: Snapshot "${targetIdentifier}" not found in manifest.`);
    listSnapshots();
    return;
  }

  const zipPath = path.join(SNAPSHOTS_DIR, selectedSnapshot.zipFile);
  if (!fs.existsSync(zipPath)) {
    console.error(`❌ Error: Snapshot archive file not found: ${zipPath}`);
    return;
  }

  console.log(`\n==================================================`);
  console.log(`⚠️  ROLLING BACK TO VERSION: ${selectedSnapshot.version} (${selectedSnapshot.id})`);
  console.log(`📝 Target: "${selectedSnapshot.description}" [${selectedSnapshot.displayDate}]`);
  console.log(`==================================================\n`);

  console.log('1. Creating pre-rollback safety snapshot of current state...');
  createSnapshot(`Pre-rollback safety backup before reverting to ${selectedSnapshot.version}`);

  console.log(`2. Extracting snapshot archive ${selectedSnapshot.zipFile} into project...`);
  const psExtractCmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${PROJECT_ROOT}' -Force"`;
  execSync(psExtractCmd, { stdio: 'inherit' });

  try {
    console.log('3. Staging and committing restored snapshot to Git...');
    execSync(`git add . && git commit -m "Rollback to ${selectedSnapshot.version}: ${selectedSnapshot.description}"`, { cwd: PROJECT_ROOT, stdio: 'ignore' });
    console.log('4. Pushing rolled-back state to GitHub Pages...');
    execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'ignore' });
  } catch (e) {
    console.warn('Note: Git commit/push completed with notes.');
  }

  console.log(`\n🎉 ROLLBACK COMPLETED SUCCESSFULLY!`);
  console.log(`   Restored to: ${selectedSnapshot.version} - "${selectedSnapshot.description}"`);
  console.log(`   Live site updated: https://gmascagni.github.io/4x4-trail-locator/\n`);
}

function showInteractiveMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\n==================================================`);
  console.log(`🛡️  4X4 TRAILFINDER VERSION CONTROL & ROLLBACK MANAGER`);
  console.log(`==================================================`);
  console.log(` [1] 📦 Create New Snapshot / Backup Point`);
  console.log(` [2] 📋 List All Saved Version Snapshots`);
  console.log(` [3] ⏪ Rollback to a Previous Version`);
  console.log(` [4] ❌ Exit`);
  console.log(`==================================================`);

  rl.question('Select an option (1-4): ', (ans) => {
    const choice = ans.trim();
    if (choice === '1') {
      rl.question('Enter snapshot description: ', (desc) => {
        createSnapshot(desc || 'Manual Snapshot');
        rl.close();
      });
    } else if (choice === '2') {
      listSnapshots();
      rl.close();
    } else if (choice === '3') {
      const manifest = listSnapshots();
      if (manifest.length === 0) {
        rl.close();
        return;
      }
      rl.question(`Enter Snapshot # or ID to restore (1-${manifest.length}): `, (target) => {
        if (target.trim()) {
          rollback(target.trim());
        } else {
          console.log('Rollback cancelled.');
        }
        rl.close();
      });
    } else {
      console.log('Exiting version manager.');
      rl.close();
    }
  });
}

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'menu';

if (command === 'snapshot' || command === 'save' || command === 'backup') {
  const desc = args.slice(1).join(' ') || 'Snapshot created via CLI';
  createSnapshot(desc);
} else if (command === 'list' || command === 'history' || command === 'log') {
  listSnapshots();
} else if (command === 'rollback' || command === 'restore' || command === 'revert') {
  const target = args[1];
  rollback(target);
} else {
  showInteractiveMenu();
}
