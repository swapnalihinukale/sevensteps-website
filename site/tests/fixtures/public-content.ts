import { contentSlots, type ContentSlot } from '../../src/data/content.ts';

// Synthetic typography and geometric images exercise export mechanics only.
export const fixtureContent = {
  version: 1, kind: 'synthetic',
  site: { origin: 'https://example.invalid', name: 'Example Photography', tagline: 'Synthetic layout sample', description: 'A synthetic site for checking public page rendering. No photographer or client work appears here.', footerText: 'Synthetic rendering sample.', sharePhotoId: 'fixture-wide' },
  home: { label: 'Synthetic layout sample', title: 'A place for the photographs.', description: 'Geometric test images help check the layout before cleared photographs arrive.', heroPhotoId: 'fixture-wide', companionPhotoId: 'fixture-square', companionCaption: 'A geometric test image.', workTitle: 'Explore the sample stories.', workDescription: 'These sample assignments test page structure and navigation.', featuredStoryIds: ['wedding-story', 'sample-celebration'] },
  about: { heading: 'Meet the photographer.', biography: 'This synthetic biography tests the space for the photographer’s approved introduction.', portraitPhotoId: 'fixture-tall', process: [{ title: 'Share your plans', description: 'Synthetic process copy for layout checks.' }, { title: 'Agree on the details', description: 'Synthetic process copy for layout checks.' }], services: [{ title: 'Sample service', description: 'Synthetic service copy for layout checks.' }] },
  stories: [
    { id: 'wedding-story', title: 'A sample wedding story', category: 'Synthetic assignment', description: 'This sample story contains geometric images for layout testing.', context: 'A synthetic note tests the space for approved assignment context.', coverPhotoId: 'fixture-wide', photoIds: ['fixture-wide', 'fixture-tall', 'fixture-square'] },
    { id: 'couple-session', title: 'A sample couple session', category: 'Synthetic assignment', description: 'This sample session checks portrait and landscape image layouts.', context: 'A synthetic note tests the space for approved preparation advice.', coverPhotoId: 'fixture-tall', photoIds: ['fixture-tall', 'fixture-square', 'fixture-wide'] },
    { id: 'sample-celebration', title: 'A third sample story', category: 'Synthetic assignment', description: 'This extra assignment checks that a new content entry creates its own page.', context: 'Synthetic context for an additional assignment.', coverPhotoId: 'fixture-square', photoIds: ['fixture-square', 'fixture-wide'] },
    { id: 'sample-gathering', title: 'A fourth sample story', category: 'Synthetic assignment', description: 'This extra assignment checks the archive grid and the last story link.', context: 'Synthetic context for the last assignment.', coverPhotoId: 'fixture-tall', photoIds: ['fixture-tall', 'fixture-square'] },
  ],
  contact: { heading: 'Talk about your plans.', introduction: 'This sample contact area does not send enquiries.', email: 'hello@example.invalid', privacyText: 'This synthetic rendering sample does not collect enquiry details.', replyNote: 'No one receives messages from this sample.' },
  optional: { faq: [{ question: 'Are these real photographs?', answer: 'No. These are geometric test images.' }] },
  privateNote: 'PRIVATE_EXPORT_SENTINEL',
};
const retained = new Set(['HOME-HERO-COMPANION-01', 'ABOUT-PORTRAIT-01', 'STORY-A-NOTE-01', 'STORY-B-NOTE-01', 'FAQ-01', 'PRIVACY-01']);
export const fixtureSlots: ContentSlot[] = contentSlots.map(slot => {
  const retain = slot.required || retained.has(slot.id);
  return { ...slot, status: retain ? 'Ready' : 'Not needed', publicationDecision: retain ? 'retain' : 'omit', supplied: retain ? 'Synthetic test value' : null, remaining: '', omissionReason: retain ? null : 'Omitted from the synthetic renderer test.' };
});
export const fixtureDecisions = { enquiryForm: false, personalDataHandling: true };
