import { getReadiness, validateContent } from '../src/data/content.ts';

const mode = process.argv[2] ?? process.env.PUBLIC_SITE_MODE ?? 'review';
if (process.argv.length > 3 || !['review', 'public'].includes(mode)) {
  console.error('Usage: node scripts/content-check.mjs [review|public]');
  process.exit(1);
}

const result = validateContent(undefined, mode);
if (!result.valid) {
  console.error(`${mode === 'public' ? 'Public build blocked' : 'Content check failed'}:`);
  for (const issue of result.issues) console.error(`- ${issue}`);
  process.exit(1);
}

const { ready, active, notNeeded } = getReadiness();
console.log(`Content check passed: ${ready} of ${active} active groups Ready; ${notNeeded} not needed.`);
if (mode === 'review') console.log('Missing content is allowed in this private draft. This check does not establish publication readiness.');
