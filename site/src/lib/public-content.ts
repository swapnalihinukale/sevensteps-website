import type { ContentSlot, PublicationDecisions } from '../data/content.ts';
import { validateContent } from '../data/content.ts';
import type { Photograph } from './media.ts';
import { emailContact } from './email-contact.ts';

export type PublicContact = { heading: string; introduction: string; email: string; privacyText: string; replyNote: string };
export type PublicStory = { id: 'wedding-story' | 'couple-session'; title: string; category: string; description: string; context?: string; coverPhotoId: string; photoIds: string[] };
export type PublicView = {
  site: { origin: string; name: string; tagline: string; description: string; footerText: string; sharePhotoId: string };
  home: { label: string; title: string; description: string; heroPhotoId: string; companionPhotoId?: string; companionCaption?: string; workTitle: string; workDescription: string };
  about: { heading: string; biography: string; portraitPhotoId?: string; process: { title: string; description: string }[]; services: { title: string; description: string }[] };
  stories: PublicStory[];
  contact: PublicContact;
  optional: { faq?: { question: string; answer: string }[]; pricing?: string; review?: { quote: string; attribution: string } };
  photos: Record<string, Photograph>;
};

type RecordValue = Record<string, unknown>;
function record(value: unknown, path: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path}: supply a content record.`);
  return value as RecordValue;
}
function text(value: unknown, path: string, max = 2000): string {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > max || /[\u0000-\u001f\u007f<>]/u.test(value) || value.includes(String.fromCodePoint(8212)) || /&(?:#(?:x2014|8212)|mdash);/iu.test(value)) throw new Error(`${path}: supply bounded plain text without markup, controls or em dashes.`);
  return value;
}
function identifier(value: unknown, path: string): string {
  const id = text(value, path, 80);
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(id)) throw new Error(`${path}: use a stable lowercase media ID.`);
  return id;
}
function optionalIdentifier(value: unknown, path: string): string | undefined { return value === undefined ? undefined : identifier(value, path); }
function optionalText(value: unknown, path: string, max?: number): string | undefined { return value === undefined ? undefined : text(value, path, max); }
function list(value: unknown, path: string, min = 1, max = 100): unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) throw new Error(`${path}: supply between ${min} and ${max} items.`);
  return value;
}
function own<T extends object>(value: T): T { return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T; }
function pair(value: unknown, path: string) { const item = record(value, path); return { title: text(item.title, `${path}.title`, 160), description: text(item.description, `${path}.description`) }; }

/** Rebuild every public field. Private register fields, approvals and source paths never pass through. */
export function createPublicView(input: unknown, mediaInput: unknown, mode: 'public' | 'fixture', slots: readonly ContentSlot[], decisions: PublicationDecisions): PublicView {
  const source = record(input, 'content');
  if (source.version !== 1 || source.kind !== (mode === 'fixture' ? 'synthetic' : 'public')) throw new Error('Content kind does not match the build mode.');
  const readiness = validateContent(slots, 'public', decisions);
  if (!readiness.valid) throw new Error(`Public content is unresolved: ${readiness.issues.join(' ')}`);
  if (decisions.enquiryForm !== false || decisions.personalDataHandling !== true) throw new Error('This renderer requires the reviewed email contact path and privacy information. Live form release is a separate gate.');
  const rawSite = record(source.site, 'site');
  const origin = text(rawSite.origin, 'site.origin', 250);
  let parsed: URL;
  try { parsed = new URL(origin); } catch { throw new Error('site.origin: use a valid HTTPS origin.'); }
  if (parsed.origin !== origin || parsed.protocol !== 'https:' || parsed.port !== '' || parsed.username || parsed.password || (mode === 'fixture' ? parsed.hostname !== 'example.invalid' : /(?:^|\.)(?:localhost|invalid|test|example\.(?:com|org|net))$|^\d+(?:\.\d+){3}$|:/iu.test(parsed.hostname))) throw new Error('site.origin: use the approved origin for this mode.');
  const site = { origin, name: text(rawSite.name, 'site.name', 100), tagline: text(rawSite.tagline, 'site.tagline', 160), description: text(rawSite.description, 'site.description', 320), footerText: text(rawSite.footerText, 'site.footerText', 320), sharePhotoId: identifier(rawSite.sharePhotoId, 'site.sharePhotoId') };
  const rawHome = record(source.home, 'home');
  const home = own({ label: text(rawHome.label, 'home.label', 120), title: text(rawHome.title, 'home.title', 160), description: text(rawHome.description, 'home.description'), heroPhotoId: identifier(rawHome.heroPhotoId, 'home.heroPhotoId'), companionPhotoId: optionalIdentifier(rawHome.companionPhotoId, 'home.companionPhotoId'), companionCaption: optionalText(rawHome.companionCaption, 'home.companionCaption', 240), workTitle: text(rawHome.workTitle, 'home.workTitle', 160), workDescription: text(rawHome.workDescription, 'home.workDescription', 500) });
  if (Boolean(home.companionPhotoId) !== Boolean(home.companionCaption)) throw new Error('The companion photograph needs its caption, or both must be omitted.');
  const rawAbout = record(source.about, 'about');
  const about = own({ heading: text(rawAbout.heading, 'about.heading', 160), biography: text(rawAbout.biography, 'about.biography'), portraitPhotoId: optionalIdentifier(rawAbout.portraitPhotoId, 'about.portraitPhotoId'), process: list(rawAbout.process, 'about.process', 1, 6).map((item, i) => pair(item, `about.process.${i}`)), services: list(rawAbout.services, 'about.services', 1, 6).map((item, i) => pair(item, `about.services.${i}`)) });
  const stories: PublicStory[] = list(source.stories, 'stories', 2, 2).map((value, i) => {
    const item = record(value, `stories.${i}`);
    if (item.id !== 'wedding-story' && item.id !== 'couple-session') throw new Error('Use the two reviewed story IDs.');
    const photoIds = list(item.photoIds, `stories.${i}.photoIds`, 2, 60).map(id => identifier(id, 'photograph reference'));
    if (new Set(photoIds).size !== photoIds.length) throw new Error('A story gallery must not repeat photograph references.');
    return own({ id: item.id, title: text(item.title, `stories.${i}.title`, 160), category: text(item.category, `stories.${i}.category`, 120), description: text(item.description, `stories.${i}.description`, 500), context: optionalText(item.context, `stories.${i}.context`), coverPhotoId: identifier(item.coverPhotoId, `stories.${i}.coverPhotoId`), photoIds });
  });
  if (new Set(stories.map(item => item.id)).size !== 2) throw new Error('Story IDs must be unique.');
  const rawContact = record(source.contact, 'contact');
  const contact = { heading: text(rawContact.heading, 'contact.heading', 160), introduction: text(rawContact.introduction, 'contact.introduction', 500), email: emailContact(text(rawContact.email, 'contact.email', 254)).address, privacyText: text(rawContact.privacyText, 'contact.privacyText'), replyNote: text(rawContact.replyNote, 'contact.replyNote', 500) };
  if (mode === 'fixture' ? contact.email !== 'hello@example.invalid' : /@(?:.*\.)?(?:example\.(?:com|net|org|invalid)|localhost|test|invalid)$/iu.test(contact.email)) throw new Error('contact.email: use the confirmed address for this mode.');
  const rawOptional = record(source.optional, 'optional');
  const optional: PublicView['optional'] = {};
  if (rawOptional.faq !== undefined) optional.faq = list(rawOptional.faq, 'optional.faq', 1, 8).map((value, i) => { const item = record(value, `faq.${i}`); return { question: text(item.question, `faq.${i}.question`, 240), answer: text(item.answer, `faq.${i}.answer`) }; });
  if (rawOptional.pricing !== undefined) optional.pricing = text(rawOptional.pricing, 'optional.pricing');
  if (rawOptional.review !== undefined) { const review = record(rawOptional.review, 'optional.review'); optional.review = { quote: text(review.quote, 'optional.review.quote'), attribution: text(review.attribution, 'optional.review.attribution', 160) }; }
  const represented: Record<string, boolean> = { 'HOME-HERO-COMPANION-01': !!home.companionPhotoId, 'ABOUT-PORTRAIT-01': !!about.portraitPhotoId, 'STORY-A-NOTE-01': !!stories.find(item => item.id === 'wedding-story')?.context, 'STORY-B-NOTE-01': !!stories.find(item => item.id === 'couple-session')?.context, 'FAQ-01': !!optional.faq, 'PRICING-01': !!optional.pricing, 'REVIEW-01': !!optional.review, 'BRAND-MARK-01': false, 'TEAM-01': false, 'FILM-01': false, 'ENQUIRY-FIELDS-01': false, 'PRIVACY-01': true };
  for (const [id, exists] of Object.entries(represented)) if ((slots.find(slot => slot.id === id)?.publicationDecision === 'retain') !== exists) throw new Error(`${id}: public content and the recorded retain or omit decision disagree.`);
  const referenced = new Set([site.sharePhotoId, home.heroPhotoId, home.companionPhotoId, about.portraitPhotoId, ...stories.flatMap(item => [item.coverPhotoId, ...item.photoIds])].filter((id): id is string => !!id));
  const manifest = record(mediaInput, 'media');
  if (mode === 'public' && Object.keys(manifest).some(id => !referenced.has(id))) throw new Error('Public media includes unreferenced photographs. Compile only the approved selection.');
  for (const story of stories) if (!story.photoIds.includes(story.coverPhotoId)) throw new Error('A story cover must belong to its gallery assignment.');
  if (mode === 'public') {
    const openingStory = stories.find(story => story.photoIds.includes(home.heroPhotoId));
    if (!openingStory || (home.companionPhotoId && !openingStory.photoIds.includes(home.companionPhotoId))) throw new Error('Opening photographs must belong to the same published assignment.');
    const allGalleryIds = stories.flatMap(story => story.photoIds);
    if (new Set(allGalleryIds).size !== allGalleryIds.length) throw new Error('The two public stories must contain distinct assignment selections.');
  }
  const photos: Record<string, Photograph> = {};
  for (const id of referenced) {
    const photo = record(manifest[id], `media.${id}`);
    if (photo.id !== id) throw new Error(`media.${id}: photograph identity mismatch.`);
    const dimension = (value: unknown): number => { if (!Number.isSafeInteger(value) || Number(value) <= 0 || Number(value) > 30000) throw new Error(`media.${id}: invalid dimensions.`); return Number(value); };
    const variant = (value: unknown) => { const item = record(value, `media.${id}.variant`); const src = text(item.src, `media.${id}.src`, 250); if (!/^\/media\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:avif|webp|jpe?g)$/u.test(src)) throw new Error(`media.${id}: only generated local derivatives are allowed.`); const bytes = Number(item.bytes); if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > 20_000_000) throw new Error(`media.${id}: invalid byte length.`); return { src, width: dimension(item.width), height: dimension(item.height), bytes }; };
    const sources = record(photo.sources, `media.${id}.sources`);
    const focalPoint = record(photo.focalPoint, `media.${id}.focalPoint`);
    for (const axis of ['x', 'y']) if (typeof focalPoint[axis] !== 'number' || !Number.isFinite(focalPoint[axis]) || Number(focalPoint[axis]) < 0 || Number(focalPoint[axis]) > 1) throw new Error(`media.${id}: invalid focal point.`);
    photos[id] = own({ id, alt: text(photo.alt, `media.${id}.alt`, 500), caption: optionalText(photo.caption, `media.${id}.caption`, 500), credit: optionalText(photo.credit, `media.${id}.credit`, 240), width: dimension(photo.width), height: dimension(photo.height), focalPoint: { x: Number(focalPoint.x), y: Number(focalPoint.y) }, sources: { avif: list(sources.avif, 'avif', 1, 20).map(variant), webp: list(sources.webp, 'webp', 1, 20).map(variant), jpeg: list(sources.jpeg, 'jpeg', 1, 20).map(variant) }, full: variant(photo.full) });
  }
  const result = { site, home, about, stories, contact, optional, photos };
  if (mode === 'public' && /synthetic|fixture|example\.invalid|photograph to add|content-checklist|needs content|private review/iu.test(JSON.stringify(result))) throw new Error('Public content contains test or review material.');
  return result;
}
