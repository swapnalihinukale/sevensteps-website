import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  contentSlots, getReadiness, getSlot, projects, validateContent,
  type ContentSlot,
} from '../src/data/content.ts';

function copySlots(): ContentSlot[] {
  return contentSlots.map((slot) => structuredClone(slot));
}

function publicFixture(): ContentSlot[] {
  return copySlots().map((slot) => slot.required ? {
    ...slot, status: 'Ready', supplied: 'Synthetic test content', remaining: '',
  } : {
    ...slot, status: 'Not needed', publicationDecision: 'omit',
    omissionReason: 'Excluded from this synthetic test scope.', remaining: '',
  });
}

const noForm = { enquiryForm: false, personalDataHandling: false };

test('canonical source preserves the 27 planning references and contains serializable review data', () => {
  const inventory = readFileSync(new URL('../../docs/CONTENT-SLOT-INVENTORY.md', import.meta.url), 'utf8');
  const plannedIds = [...inventory.matchAll(/^\| `([A-Z0-9-]+)` \|/gm)].map((match) => match[1]);
  assert.equal(plannedIds.length, 27);
  assert.deepEqual(contentSlots.map((slot) => slot.id), plannedIds);
  assert.equal(new Set(contentSlots.map((slot) => slot.id)).size, 27);
  assert.deepEqual(JSON.parse(JSON.stringify(contentSlots)), contentSlots);
  assert.equal(contentSlots.filter((slot) => slot.requirement === 'required').length, 15);
  assert.equal(contentSlots.filter((slot) => slot.requirement === 'optional').length, 10);
  assert.equal(contentSlots.filter((slot) => slot.requirement === 'conditional').length, 2);
  assert.ok(contentSlots.every((slot) => slot.status === 'Needs content' && slot.supplied === null));
});

test('project layout records point to their own existing content groups', () => {
  assert.deepEqual(projects.map((project) => [project.id, project.frameCount]), [
    ['wedding-story', 6], ['couple-session', 5],
  ]);
  for (const project of projects) {
    const prefix = project.id === 'wedding-story' ? 'STORY-A-' : 'STORY-B-';
    for (const key of ['coverSlot', 'detailsSlot', 'gallerySlot', 'noteSlot'] as const) {
      assert.ok(getSlot(project[key]).id.startsWith(prefix));
    }
  }
  assert.throws(() => getSlot('STORY-C-COVER-01'), /Unknown content reference/);
});

test('checklist locations return to a specific note on the correct draft route', () => {
  for (const slot of contentSlots) {
    const destination = new URL(slot.location, 'https://draft.invalid');
    assert.equal(destination.hash, `#content-${slot.id}`);
    const project = projects.find((entry) => [entry.coverSlot, entry.detailsSlot, entry.gallerySlot, entry.noteSlot].some((id) => id === slot.id));
    assert.equal(destination.pathname, project?.href ?? '/');
    assert.equal(destination.origin, 'https://draft.invalid');
  }
});

test('review permits missing material and starts at zero of 27 groups Ready', () => {
  assert.deepEqual(getReadiness(), { ready: 0, active: 27, notNeeded: 0, total: 27 });
  assert.deepEqual(validateContent(), { valid: true, issues: [] });
});

test('public mode blocks missing required content and undecided optional or conditional features', () => {
  const result = validateContent(contentSlots, 'public');
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.startsWith('HOME-HERO-01:') && issue.includes('must be Ready')));
  assert.ok(result.issues.some((issue) => issue.startsWith('FILM-01:') && issue.includes('decide whether')));
  assert.ok(result.issues.some((issue) => issue.startsWith('enquiryForm:')));
  assert.ok(result.issues.some((issue) => issue.startsWith('personalDataHandling:')));
});

test('required groups cannot bypass the gate with an omission or a weaker requirement', () => {
  const slots = publicFixture();
  Object.assign(slots[0], {
    status: 'Not needed', publicationDecision: 'omit', omissionReason: 'Synthetic omission',
  });
  assert.ok(validateContent(slots, 'public', noForm).issues.some((issue) => issue.includes('required content cannot be omitted')));
  slots[0].required = false;
  slots[0].requirement = 'optional';
  assert.ok(validateContent(slots, 'public', noForm).issues.some((issue) => issue.includes('publication requirements changed')));
});

test('an explicit omission requires both Not needed status and a reason', () => {
  const slots = publicFixture();
  const film = slots.find((slot) => slot.id === 'FILM-01')!;
  film.omissionReason = null;
  assert.ok(validateContent(slots, 'public', noForm).issues.some((issue) => issue.startsWith('FILM-01:') && issue.includes('recorded reason')));
  film.omissionReason = 'No film in this synthetic scope.';
  film.status = 'Needs content';
  assert.equal(validateContent(slots, 'public', noForm).valid, false);
});

test('retained optional content must be Ready even when all required groups are complete', () => {
  const slots = publicFixture();
  Object.assign(slots.find((slot) => slot.id === 'FILM-01')!, {
    status: 'Needs content', publicationDecision: 'retain', omissionReason: null,
  });
  const result = validateContent(slots, 'public', noForm);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.startsWith('FILM-01:') && issue.includes('must be Ready')));
});

test('a synthetic complete register with explicit omissions passes the content gate', () => {
  const slots = publicFixture();
  assert.deepEqual(validateContent(slots, 'public', noForm), { valid: true, issues: [] });
  assert.deepEqual(getReadiness(slots), { ready: 15, active: 15, notNeeded: 12, total: 27 });
});

test('retaining a live form requires both field and privacy content', () => {
  const slots = publicFixture();
  const formWithoutPrivacy = validateContent(slots, 'public', { enquiryForm: true, personalDataHandling: false });
  assert.ok(formWithoutPrivacy.issues.some((issue) => issue.includes('handles personal data')));
  const liveForm = { enquiryForm: true, personalDataHandling: true };
  assert.ok(validateContent(slots, 'public', liveForm).issues.some((issue) => issue.startsWith('ENQUIRY-FIELDS-01:')));
  assert.ok(validateContent(slots, 'public', liveForm).issues.some((issue) => issue.startsWith('PRIVACY-01:')));
  for (const slot of slots.filter((slot) => slot.requirement === 'conditional')) {
    Object.assign(slot, {
      status: 'Ready', publicationDecision: 'retain', omissionReason: null,
      supplied: 'Synthetic tested form or privacy text', remaining: '',
    });
  }
  assert.deepEqual(validateContent(slots, 'public', liveForm), { valid: true, issues: [] });
});

test('personal data handling can require privacy even without a form', () => {
  const slots = publicFixture();
  const result = validateContent(slots, 'public', { enquiryForm: false, personalDataHandling: true });
  assert.ok(result.issues.some((issue) => issue.startsWith('PRIVACY-01:')));
  assert.ok(!result.issues.some((issue) => issue.startsWith('ENQUIRY-FIELDS-01:')));
});

test('supplied states need a safe reference and an update needs a specific remaining note', () => {
  for (const status of ['Received: checking', 'Needs an update', 'Ready'] as const) {
    const slots = copySlots();
    slots[0].status = status;
    assert.ok(validateContent(slots).issues.some((issue) => issue.includes('safe supplied-content label')));
  }
  const slots = copySlots();
  Object.assign(slots[0], { status: 'Needs an update', supplied: 'Synthetic copy', remaining: '' });
  assert.ok(validateContent(slots).issues.some((issue) => issue.includes('specific update')));
});

test('missing, duplicate and unknown references cannot pass validation', () => {
  assert.ok(validateContent(copySlots().slice(1)).issues.some((issue) => issue.includes('missing content group')));
  assert.ok(validateContent([...copySlots(), { ...getSlot('HOME-HERO-01') }]).issues.some((issue) => issue.includes('duplicate content reference')));
  const slots = copySlots();
  slots[0].id = 'UNKNOWN-01';
  assert.ok(validateContent(slots).issues.some((issue) => issue.includes('Unknown content reference')));
});

test('invalid record fields fail with a result and do not expose their values', () => {
  const slots = copySlots();
  Object.assign(slots[0], { privateNotes: 'Synthetic private value', status: 'Needs an update', remaining: 42 });
  const result = validateContent(slots);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.includes('unsupported field privateNotes')));
  assert.ok(result.issues.every((issue) => !issue.includes('Synthetic private value')));
  Object.assign(slots[1], { status: 'Not needed', publicationDecision: 'omit', omissionReason: 42 });
  assert.doesNotThrow(() => validateContent(slots));
});

test('CLI obeys review/public mode and refuses unknown modes', () => {
  const script = new URL('../scripts/content-check.mjs', import.meta.url);
  const run = (mode: string) => spawnSync(process.execPath, [script.pathname], {
    env: { ...process.env, PUBLIC_SITE_MODE: mode }, encoding: 'utf8',
  });
  const review = run('review');
  assert.equal(review.status, 0, review.stderr);
  assert.match(review.stdout, /0 of 27 active groups Ready/);
  const publicBuild = run('public');
  assert.equal(publicBuild.status, 1);
  assert.match(publicBuild.stderr, /Public build blocked/);
  assert.equal(run('production').status, 1);
});
