import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { createPublicView, type PublicView } from './public-content.ts';
import { verifyPublicAssets } from './public-assets.ts';
import { contentSlots, publicationDecisions } from '../data/content.ts';
import { fixtureContent, fixtureSlots, fixtureDecisions } from '../../tests/fixtures/public-content.ts';

export type RenderMode = 'review' | 'public' | 'fixture';
export function renderMode(value = process.env.PUBLIC_SITE_MODE ?? 'review'): RenderMode {
  if (value !== 'review' && value !== 'public' && value !== 'fixture') throw new Error('Use review, public or fixture rendering.');
  return value;
}
// Astro bundles server modules into a different directory. The build command runs from site/.
const root = process.cwd();
function read(relative: string): { bytes: Buffer; value: unknown } {
  let bytes: Buffer;
  try { bytes = readFileSync(resolve(root, relative)); } catch { throw new Error(`${relative}: required publication input is missing.`); }
  if (bytes.length > 2_000_000) throw new Error(`${relative}: publication input exceeds its size limit.`);
  try { return { bytes, value: JSON.parse(bytes.toString('utf8')) }; } catch { throw new Error(`${relative}: supply valid JSON.`); }
}
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

/** Validate gates from fixed paths even when Astro is invoked directly. */
export function loadSiteContent(mode = renderMode()): PublicView | undefined {
  if (mode === 'review') return undefined;
  const media = read(mode === 'fixture' ? '.generated/media-fixture.json' : '.generated/media-public.json');
  if (mode === 'fixture') {
    const view = createPublicView(fixtureContent, media.value, mode, fixtureSlots, fixtureDecisions);
    verifyPublicAssets(view.photos, resolve(root, '.generated/fixture-public'));
    return view;
  }
  const data = read('content/public.json');
  const approval = read('content/release-approval.json').value as Record<string, unknown>;
  if (!approval || Array.isArray(approval) || approval.version !== 1 || approval.authorization !== 'public-release-approved' || approval.contentSha256 !== sha256(data.bytes) || approval.mediaSha256 !== sha256(media.bytes)) throw new Error('Public release approval is missing or does not match the content and media.');
  for (const field of ['approvedBy', 'approvedAt', 'ownerContentEvidence', 'mediaRightsEvidence', 'contactTestEvidence', 'responsiveReviewEvidence', 'accessibilityReviewEvidence', 'realMediaBudgetEvidence', 'securityReviewEvidence', 'rollbackEvidence']) {
    if (typeof approval[field] !== 'string' || !String(approval[field]).trim() || /placeholder|pending|fixture|synthetic/iu.test(String(approval[field]))) throw new Error(`Release approval: record completed ${field}.`);
  }
  if (!Number.isFinite(Date.parse(String(approval.approvedAt)))) throw new Error('Release approval: approvedAt must contain an ISO date.');
  const view = createPublicView(data.value, media.value, 'public', contentSlots, publicationDecisions);
  verifyPublicAssets(view.photos, resolve(root, '.generated/public-assets'));
  return view;
}
