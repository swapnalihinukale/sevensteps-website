import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicView } from '../src/lib/public-content.ts';
import { fixtureContent, fixtureSlots, fixtureDecisions } from './fixtures/public-content.ts';
import type { Photograph } from '../src/lib/media.ts';
import { contentSlots, publicationDecisions } from '../src/data/content.ts';
import { isStoryId, storyPath } from '../src/lib/story-id.ts';

const photograph = (id: string): Photograph => {
  const image = { src: `/media/${id}-abc-800.jpg`, width: 800, height: 600, bytes: 40000 };
  return { id, alt: 'A geometric test image.', width: 800, height: 600, focalPoint: { x: .5, y: .5 }, sources: { avif: [{ ...image, src: image.src.replace('.jpg', '.avif') }], webp: [{ ...image, src: image.src.replace('.jpg', '.webp') }], jpeg: [image] }, full: image };
};
const manifest = Object.fromEntries(['fixture-wide', 'fixture-tall', 'fixture-square'].map(id => [id, photograph(id)]));
const build = (data: unknown = fixtureContent, media: unknown = manifest, slots = fixtureSlots) => createPublicView(data, media, 'fixture', slots, fixtureDecisions);

test('public allowlist strips private fields at each record level and unused photographs', () => {
  const data = structuredClone(fixtureContent) as Record<string, any>;
  data.site.privateMemo = 'OWNER_ONLY';
  data.about.process[0].sourcePath = '/private/original';
  data.stories[0].permissionEmail = 'PRIVATE_PERMISSION';
  const media = { ...manifest, unused: photograph('unused') } as Record<string, any>;
  media['fixture-wide'] = { ...media['fixture-wide'], source: 'ORIGINAL_SOURCE', rightsNote: 'CONFIDENTIAL_RIGHTS' };
  const view = build(data, media);
  assert.equal(view.stories.length, 4);
  assert.deepEqual(Object.keys(view.photos).sort(), ['fixture-square', 'fixture-tall', 'fixture-wide']);
  assert.doesNotMatch(JSON.stringify(view), /PRIVATE_EXPORT_SENTINEL|OWNER_ONLY|sourcePath|privateMemo|permissionEmail|ORIGINAL_SOURCE|CONFIDENTIAL_RIGHTS|unused/);
});
test('ready status alone cannot supply required content', () => {
  const data = structuredClone(fixtureContent);
  data.about.biography = '';
  assert.throws(() => build(data), /about.biography/);
  assert.throws(() => build(fixtureContent, {}), /media.fixture-wide/);
});
test('actual unresolved register blocks public data even with complete values', () => {
  assert.throws(() => createPublicView(fixtureContent, manifest, 'fixture', contentSlots, publicationDecisions), /unresolved/);
});
test('retaining optional content requires the corresponding payload', () => {
  const data = structuredClone(fixtureContent) as Record<string, any>;
  delete data.optional.faq;
  assert.throws(() => build(data), /FAQ-01/);
  const slots = fixtureSlots.map(slot => slot.id === 'FILM-01' ? { ...slot, status: 'Ready' as const, publicationDecision: 'retain' as const, supplied: 'Film supplied', omissionReason: null } : slot);
  assert.throws(() => build(fixtureContent, manifest, slots), /FILM-01/);
});
test('an omitted slot cannot silently keep its content', () => {
  const slots = fixtureSlots.map(slot => slot.id === 'HOME-HERO-COMPANION-01' ? { ...slot, status: 'Not needed' as const, publicationDecision: 'omit' as const, supplied: null, omissionReason: 'No paired image selected.' } : slot);
  assert.throws(() => build(fixtureContent, manifest, slots), /HOME-HERO-COMPANION/);
});
test('story IDs and gallery references remain unique and bounded', () => {
  const duplicate = structuredClone(fixtureContent);
  duplicate.stories[1].id = 'wedding-story';
  assert.throws(() => build(duplicate), /Story IDs must be unique/);
  const repeat = structuredClone(fixtureContent);
  repeat.stories[0].photoIds = ['fixture-wide', 'fixture-wide'];
  assert.throws(() => build(repeat), /must not repeat/);
});
test('additional assignments keep their own paths and selected homepage order', () => {
  const view = build();
  assert.deepEqual(view.stories.map(story => storyPath(story.id)), [
    '/stories/wedding-story/', '/stories/couple-session/', '/stories/sample-celebration/', '/stories/sample-gathering/',
  ]);
  assert.deepEqual(view.home.featuredStoryIds, ['wedding-story', 'sample-celebration']);
  const data = structuredClone(fixtureContent) as Record<string, any>;
  delete data.home.featuredStoryIds;
  assert.deepEqual(build(data).home.featuredStoryIds, ['wedding-story', 'couple-session']);
});
test('portfolio bounds preserve checklist assignments and reject invalid homepage choices', () => {
  const data = structuredClone(fixtureContent);
  data.stories = data.stories.slice(0, 2);
  data.home.featuredStoryIds = ['wedding-story', 'couple-session'];
  assert.equal(build(data).stories.length, 2);
  data.stories[0].id = 'a-renamed-story';
  assert.throws(() => build(data), /existing content checklist/);
  const tooMany = structuredClone(fixtureContent);
  tooMany.stories.push(...Array.from({ length: 20 }, (_, i) => ({ ...tooMany.stories[2], id: `extra-${i}` })));
  assert.equal(build(tooMany).stories.length, 24);
  tooMany.stories.push({ ...tooMany.stories[2], id: 'one-too-many' });
  assert.throws(() => build(tooMany), /between 2 and 24/);
  for (const choices of [[], ['wedding-story'], ['wedding-story', 'missing-story'], ['wedding-story', 'wedding-story'], ['wedding-story', 'couple-session', 'sample-celebration']]) {
    const invalid = structuredClone(fixtureContent);
    invalid.home.featuredStoryIds = choices;
    assert.throws(() => build(invalid), /home.featuredStoryIds/);
  }
});
test('additional public assignments require distinct galleries and keep their private fields out', () => {
  // In-memory test records only. These values never become release inputs.
  const data = JSON.parse(JSON.stringify(fixtureContent).replace(/synthetic|fixture/giu, 'test'));
  data.kind = 'public';
  data.site.origin = 'https://unit-check.studio';
  data.contact.email = 'hello@unit-check.studio';
  data.stories.forEach((story: Record<string, any>, index: number) => {
    story.coverPhotoId = `assignment-${index}-cover`;
    story.photoIds = [story.coverPhotoId, `assignment-${index}-detail`];
    story.permissionEmail = 'PRIVATE_PERMISSION';
  });
  data.site.sharePhotoId = data.home.heroPhotoId = data.stories[0].coverPhotoId;
  data.home.companionPhotoId = data.stories[0].photoIds[1];
  data.about.portraitPhotoId = data.stories[1].coverPhotoId;
  const photos = Object.fromEntries(data.stories.flatMap((story: { photoIds: string[] }) => story.photoIds).map((id: string) => [id, photograph(id)]));
  const publish = (input = data) => createPublicView(input, photos, 'public', fixtureSlots, fixtureDecisions);
  const view = publish();
  assert.equal(view.stories.length, 4);
  assert.doesNotMatch(JSON.stringify(view), /PRIVATE_PERMISSION|permissionEmail|PRIVATE_EXPORT_SENTINEL/);
  const repeated = structuredClone(data);
  repeated.stories[2].photoIds[1] = repeated.stories[0].coverPhotoId;
  // Remove the now unused photo so this checks cross-assignment duplication itself.
  const repeatedPhotos = { ...photos };
  delete repeatedPhotos[data.stories[2].photoIds[1]];
  assert.throws(() => createPublicView(repeated, repeatedPhotos, 'public', fixtureSlots, fixtureDecisions), /distinct assignment selections/);
  const mixedOpening = structuredClone(data);
  mixedOpening.home.companionPhotoId = mixedOpening.stories[2].coverPhotoId;
  assert.throws(() => publish(mixedOpening), /same published assignment/);
});
test('story paths reject traversal, encoded paths, control text and malformed slugs', () => {
  for (const id of ['', '../private', '.', '..', 'a/b', '%2f', 'Uppercase', '-leading', 'trailing-', 'two--hyphens', 'a_b', 'a?b', 'a#b', 'a.b', 'a\\b', 'é', 'a\nb', 'a'.repeat(81)]) {
    assert.equal(isStoryId(id), false);
    assert.throws(() => storyPath(id), /Story ID/);
    const data = structuredClone(fixtureContent); data.stories[2].id = id;
    assert.throws(() => build(data), /stories.2.id/);
  }
  assert.equal(isStoryId('a'.repeat(80)), true);
  assert.equal(isStoryId('2026-wedding'), true);
});
test('markup, em dashes and malformed email are rejected before rendering', () => {
  for (const title of ['<img src=x>', 'Words\u2014words', 'Words&mdash;words', 'Line\nline']) {
    const data = structuredClone(fixtureContent); data.home.title = title;
    assert.throws(() => build(data), /plain text/);
  }
  const data = structuredClone(fixtureContent); data.contact.email = 'hello@example.invalid?subject=oops';
  assert.throws(() => build(data), /contact.email/);
});
test('derivative references must remain local, bounded and identified', () => {
  for (const src of ['https://example.com/p.jpg', '/media/../private.jpg', '/media/x.svg']) {
    const media = structuredClone(manifest); media['fixture-wide'].full.src = src;
    assert.throws(() => build(fixtureContent, media), /local derivatives/);
  }
  const media = structuredClone(manifest); media['fixture-wide'].focalPoint.x = 3;
  assert.throws(() => build(fixtureContent, media), /focal point/);
});
test('synthetic records cannot pass into public mode even when readiness is complete', () => {
  assert.throws(() => createPublicView(fixtureContent, manifest, 'public', fixtureSlots, fixtureDecisions), /kind/);
  const data = { ...fixtureContent, kind: 'public' };
  assert.throws(() => createPublicView(data, manifest, 'public', fixtureSlots, fixtureDecisions), /origin/);
});
test('fixture rendering cannot claim a real domain or activate a real contact address', () => {
  const data = structuredClone(fixtureContent); data.site.origin = 'https://photography.studio';
  assert.throws(() => build(data), /origin/);
  const data2 = structuredClone(fixtureContent); data2.contact.email = 'hello@photography.studio';
  assert.throws(() => build(data2), /contact.email/);
});

test('media IDs reject traversal and object prototype names', () => {
  for (const id of ['__proto__', '../secret', 'constructor.prototype']) {
    const data = structuredClone(fixtureContent); data.home.heroPhotoId = id;
    assert.throws(() => build(data), /stable lowercase media ID/);
  }
});
test('a story cover must be one of its selected photographs', () => {
  const data = structuredClone(fixtureContent); data.stories[0].coverPhotoId = 'another-photo';
  assert.throws(() => build(data), /cover must belong/);
});
test('origin rejects user information, paths, ports and lookalike fixture domains', () => {
  for (const origin of ['https://user@example.invalid', 'https://example.invalid/path', 'https://example.invalid:443', 'https://example.invalid:8443', 'https://example.invalid.attacker.com', 'javascript:alert(1)']) {
    const data = structuredClone(fixtureContent); data.site.origin = origin;
    assert.throws(() => build(data), /origin/);
  }
});
