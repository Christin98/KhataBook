const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'patch'; // 'patch' | 'minor' | 'major'
const packageJsonPath = path.join(__dirname, '..', 'package.json');

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let [versionCore, betaTag] = pkg.version.split('-beta.');
let [major, minor, patch] = versionCore.split('.').map(Number);
let betaNum = betaTag ? parseInt(betaTag, 10) : 1;

if (type === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
  betaNum = 1;
} else if (type === 'minor') {
  minor += 1;
  patch = 0;
  betaNum = 1;
} else {
  // default patch or beta increment
  betaNum += 1;
}

const newVersion = `${major}.${minor}.${patch}-beta.${betaNum}`;
pkg.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`[KhataKithab Version Bump] Version bumped to ${newVersion}`);

// Update constants right after bump
require('./update-version');
