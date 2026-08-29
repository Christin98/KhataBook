/**
 * KhataKithab Systematic Release Automation Engine
 * Lifecycle: Dev (Local) -> Beta (Flight) -> Prod (Official Release)
 * 
 * Usage:
 *   node scripts/release.js --beta "Title or message"
 *   node scripts/release.js --prod  "Title or message"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const changelogDataPath = path.join(__dirname, '..', 'src', 'lib', 'changelog-data.json');

const args = process.argv.slice(2);
const isBetaRelease = args.includes('--beta');
const isProdRelease = args.includes('--prod');
const customMessage = args.find((a) => !a.startsWith('--')) || '';

if (!isBetaRelease && !isProdRelease) {
  console.error('\n❌ Please specify target release channel:');
  console.error('   npm run deploy:beta "Release message / title"');
  console.error('   npm run deploy:prod "Release message / title"\n');
  process.exit(1);
}

function run(cmd, errorMessage) {
  try {
    console.log(`\n⚙️  Running: ${cmd}`);
    return execSync(cmd, { stdio: 'inherit', encoding: 'utf8' });
  } catch (err) {
    console.error(`\n❌ Error: ${errorMessage || cmd}`);
    process.exit(1);
  }
}

const DEFAULT_CHANGELOG = {
  title: 'Performance & Stability Improvements',
  summary: 'Minor performance improvements, UI/UX refinements, and stability optimizations.',
  highlights: [
    '⚡ Minor performance improvements and optimizations.',
    '🛡️ Improved stability and overall app performance.',
    '✨ Minor UI/UX refinements.',
    '🐛 Bug fixes and internal improvements.'
  ],
  features: [
    {
      title: 'Performance & UX Refinements',
      description: 'Minor performance improvements, UI/UX refinements, and stability optimizations.',
      tag: 'Improved'
    }
  ],
  fixes: [
    'Minor performance improvements and optimizations.',
    'Improved stability and overall app performance.',
    'Minor UI/UX refinements.',
    'Bug fixes and internal improvements.'
  ]
};

// 1. Read package.json and changelog-data.json
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const changelog = JSON.parse(fs.readFileSync(changelogDataPath, 'utf8'));

let [versionCore, betaTag] = pkg.version.split('-beta.');
let [major, minor, patch] = versionCore.split('.').map(Number);
let betaNum = betaTag ? parseInt(betaTag, 10) : 0;

const today = new Date().toISOString().split('T')[0];

if (isBetaRelease) {
  console.log('\n=============================================');
  console.log('🚀 INITIATING BETA FLIGHT RELEASE PIPELINE');
  console.log('=============================================');

  // Ensure on beta branch
  run('git checkout beta', 'Failed to checkout beta branch');

  // Increment beta version
  if (betaTag) {
    betaNum += 1;
    pkg.version = `${major}.${minor}.${patch}-beta.${betaNum}`;
  } else {
    patch += 1;
    pkg.version = `${major}.${minor}.${patch}-beta.1`;
  }

  const newVersionStr = `v${pkg.version}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`\n📌 Bumped Beta Version: ${newVersionStr}`);

  // Update constants
  run('node scripts/update-version.js --no-bump', 'Failed to update version constants');

  // Record into changelog-data.json
  const existingBetaIndex = changelog.beta.findIndex((b) => b.version === newVersionStr);
  if (existingBetaIndex !== -1) {
    changelog.beta = changelog.beta.map((b, idx) => ({
      ...b,
      isCurrent: idx === existingBetaIndex
    }));
  } else {
    const betaEntry = {
      version: newVersionStr,
      stage: 'Beta Flight',
      date: today,
      title: customMessage || DEFAULT_CHANGELOG.title,
      summary: customMessage ? `Beta candidate build: ${customMessage}` : DEFAULT_CHANGELOG.summary,
      isCurrent: true,
      highlights: customMessage
        ? [
            `🚀 Flight release ${newVersionStr}: ${customMessage}`,
            ...DEFAULT_CHANGELOG.highlights
          ]
        : DEFAULT_CHANGELOG.highlights,
      features: customMessage
        ? [
            {
              title: customMessage,
              description: 'Newest changes and fixes ready for flight candidate testing.',
              tag: 'Beta Flight'
            }
          ]
        : DEFAULT_CHANGELOG.features,
      fixes: DEFAULT_CHANGELOG.fixes
    };
    changelog.beta = [betaEntry, ...changelog.beta.map((b) => ({ ...b, isCurrent: false }))];
  }
  fs.writeFileSync(changelogDataPath, JSON.stringify(changelog, null, 2) + '\n', 'utf8');

  // Run local build verification
  console.log('\n🧪 Running Pre-Deployment Build Verification...');
  run('npm run build', 'Build verification failed! Beta deployment aborted.');

  // Commit & Push ONLY to origin beta
  console.log('\n📦 Committing & Pushing to Beta Flight (origin/beta)...');
  run('git add -A', 'Failed to stage git changes');
  run(`git commit -m "flight(beta): ${newVersionStr} - ${customMessage || DEFAULT_CHANGELOG.title}"`, 'Git commit failed');
  run('git push origin beta', 'Failed to push to origin beta');

  console.log('\n===============================================================');
  console.log(`✅ SUCCESS: Deployed ${newVersionStr} to Beta Flight Channel!`);
  console.log('🌐 Preview URL: https://beta--khatakithab.netlify.app');
  console.log('🔒 Production branch (main) remains 100% untouched.');
  console.log('===============================================================\n');

} else if (isProdRelease) {
  console.log('\n===============================================================');
  console.log('🌟 INITIATING PRODUCTION PROMOTION & RELEASE PIPELINE');
  console.log('===============================================================');

  // Ensure beta branch is clean
  run('git checkout beta', 'Failed to checkout beta branch');

  // Strip beta tag and finalize release version
  if (betaTag) {
    pkg.version = `${major}.${minor}.${patch}`;
  } else {
    patch += 1;
    pkg.version = `${major}.${minor}.${patch}`;
  }

  const newVersionStr = `v${pkg.version}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`\n📌 Finalized Production Version: ${newVersionStr}`);

  // Update constants
  run('node scripts/update-version.js --no-bump', 'Failed to update version constants');

  // Record into changelog-data.json
  const existingProdIndex = changelog.prod.findIndex((p) => p.version === newVersionStr);
  if (existingProdIndex !== -1) {
    changelog.prod = changelog.prod.map((p, idx) => ({
      ...p,
      isCurrent: idx === existingProdIndex
    }));
  } else {
    const prodEntry = {
      version: newVersionStr,
      stage: 'Production Stable',
      date: today,
      title: customMessage || DEFAULT_CHANGELOG.title,
      summary: customMessage ? `Production release: ${customMessage}` : DEFAULT_CHANGELOG.summary,
      isCurrent: true,
      highlights: customMessage
        ? [
            `🌟 Official Release ${newVersionStr}: ${customMessage}`,
            ...DEFAULT_CHANGELOG.highlights
          ]
        : DEFAULT_CHANGELOG.highlights,
      features: customMessage
        ? [
            {
              title: customMessage,
              description: 'Stable feature enhancements promoted after successful beta testing.',
              tag: 'Stable'
            }
          ]
        : DEFAULT_CHANGELOG.features,
      fixes: DEFAULT_CHANGELOG.fixes
    };
    changelog.prod = [prodEntry, ...changelog.prod.map((p) => ({ ...p, isCurrent: false }))];
  }
  fs.writeFileSync(changelogDataPath, JSON.stringify(changelog, null, 2) + '\n', 'utf8');

  // Run local production build verification
  console.log('\n🧪 Running Final Production Build Verification...');
  run('npm run build', 'Production build verification failed! Promotion aborted.');

  // Commit on beta first
  console.log('\n📦 Finalizing release commit on beta...');
  run('git add -A', 'Failed to stage changes');
  run(`git commit -m "release(prod): ${newVersionStr} - ${customMessage || 'Official release'}"`, 'Git commit failed');

  // Merge into main & push to origin main
  console.log('\n🚀 Merging Beta into Main & Deploying to Production...');
  run('git checkout main', 'Failed to checkout main branch');
  run('git merge beta', 'Failed to merge beta into main');
  run('git push origin main', 'Failed to push to origin main');

  // Switch back to beta
  run('git checkout beta', 'Failed to switch back to beta branch');
  run('git push origin beta', 'Failed to sync beta branch');

  console.log('\n===============================================================');
  console.log(`🎉 SUCCESS: Promoted ${newVersionStr} to Live Production!`);
  console.log('🌐 Production Live URL: https://khatakithab.netlify.app');
  console.log('🌿 Switched back to "beta" branch for continued development.');
  console.log('===============================================================\n');
}
