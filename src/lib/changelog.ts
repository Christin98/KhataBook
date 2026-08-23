import { ChangelogRelease } from './types';
import { APP_INFO } from './constants';
import rawData from './changelog-data.json';

// 1. Production Release History (Official stable releases on 'main')
export const PROD_CHANGELOG: ChangelogRelease[] = rawData.prod as ChangelogRelease[];

// 2. Beta Flight History (Flight testing releases on 'beta')
export const BETA_CHANGELOG: ChangelogRelease[] = rawData.beta as ChangelogRelease[];

// 3. Local Development Build History (Local workspace & dev server)
export const DEV_CHANGELOG: ChangelogRelease[] = rawData.dev as ChangelogRelease[];

// Helper: returns the appropriate changelog for the active environment
export const getChangelogForCurrentEnv = (envOverride?: 'dev' | 'beta' | 'prod'): { channel: string; releases: ChangelogRelease[] } => {
  if (envOverride === 'dev' || (!envOverride && APP_INFO.isDev)) {
    return { channel: 'Local Dev Channel', releases: DEV_CHANGELOG };
  }
  if (envOverride === 'beta' || (!envOverride && APP_INFO.isBeta)) {
    return { channel: 'Beta Flight Channel', releases: BETA_CHANGELOG };
  }
  return { channel: 'Production Channel', releases: PROD_CHANGELOG };
};

export const CURRENT_RELEASE = getChangelogForCurrentEnv().releases[0];
export const CHANGELOG_RELEASES = getChangelogForCurrentEnv().releases;


