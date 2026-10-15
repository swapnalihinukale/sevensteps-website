export type ContentStatus =
  | 'Needs content'
  | 'Received: checking'
  | 'Needs an update'
  | 'Ready'
  | 'Not needed';

export type ContentRequirement = 'required' | 'optional' | 'conditional';
export type PublicationDecision = 'retain' | 'omit' | 'undecided';
export type ContentCondition = 'enquiryForm' | 'personalDataHandling';
export type SiteMode = 'review' | 'public';

export interface ContentSlot {
  id: string;
  title: string;
  section: string;
  location: string;
  request: string;
  note: string;
  checklist: readonly string[];
  required: boolean;
  requirement: ContentRequirement;
  condition: ContentCondition | null;
  status: ContentStatus;
  publicationDecision: PublicationDecision;
  omissionReason: string | null;
  supplied: string | null;
  remaining: string;
}

type SlotInput = Omit<ContentSlot,
  'required' | 'condition' | 'status' | 'publicationDecision' |
  'omissionReason' | 'supplied' | 'remaining'
> & { condition?: ContentCondition };

function defineSlot<Id extends string>(input: SlotInput & { id: Id }): ContentSlot & { id: Id } {
  return {
    ...input,
    required: input.requirement === 'required',
    condition: input.condition ?? null,
    status: 'Needs content',
    publicationDecision: input.requirement === 'required' ? 'retain' : 'undecided',
    omissionReason: null,
    supplied: null,
    remaining: 'Nothing supplied or cleared for this slot yet.',
  };
}

// This register contains review guidance only. Keep originals, personal details
// and confidential permission records outside the website source and assets.
export const contentSlots = [
  defineSlot({
    id: 'BRAND-NAME-01', title: 'Business name', section: 'Identity', location: '/#content-BRAND-NAME-01', requirement: 'required',
    request: 'Add the exact name you want clients to know.',
    note: 'Confirm the business spelling and how you describe your work.',
    checklist: [
      'Supply the exact public display name and a short, accurate service description.',
      'Confirm the current public role and representation. Public research does not establish ownership.',
      'We will use the cleared spelling in navigation, page titles and contact details.',
    ],
  }),
  defineSlot({
    id: 'BRAND-MARK-01', title: 'Logo', section: 'Identity', location: '/#content-BRAND-MARK-01', requirement: 'optional',
    request: 'Add your logo, if you have one.',
    note: 'Send the original artwork and any usage guidance. A text treatment can also work.',
    checklist: [
      'Supply the original vector file or suitable artwork, with permission to use it.',
      'Include existing colour, spacing or usage rules if they exist.',
      'If no logo is needed, record that decision and use the confirmed business name.',
    ],
  }),
  defineSlot({
    id: 'HOME-HERO-01', title: 'Opening photograph', section: 'Opening', location: '/#content-HOME-HERO-01', requirement: 'required',
    request: 'Add your opening photograph.',
    note: 'Choose recent work you want more of. Send the original so we can check phone and desktop crops.',
    checklist: [
      'Supply one representative original, its assignment reference and the correct credit.',
      'Confirm permission to publish the image and any identifiable people as intended.',
      'We will check resolution, subject placement, colour and responsive crops. A public screenshot is not a production asset.',
    ],
  }),
  defineSlot({
    id: 'HOME-HERO-COMPANION-01', title: 'Related opening photograph', section: 'Opening', location: '/#content-HOME-HERO-COMPANION-01', requirement: 'optional',
    request: 'Add a related moment for this photograph.',
    note: 'Choose a frame from the same assignment that shows another part of the experience.',
    checklist: [
      'Supply one cleared original and identify its relationship to the opening photograph.',
      'A cleared story frame can be reused here without supplying the same file twice.',
      'If the paired treatment is omitted, record the decision. Do not pair unrelated couples as one event.',
    ],
  }),
  defineSlot({
    id: 'HOME-INTRO-01', title: 'Short introduction', section: 'Opening', location: '/#content-HOME-INTRO-01', requirement: 'required',
    request: 'Add a short introduction to your work.',
    note: 'Tell couples what you enjoy photographing and how you help them feel comfortable.',
    checklist: [
      'Supply two or three factual sentences in your own voice.',
      'Confirm any base, service emphasis or way of working mentioned in the introduction.',
      'We will edit for clarity without adding years of experience, awards or other unconfirmed claims.',
    ],
  }),
  defineSlot({
    id: 'STORY-A-COVER-01', title: 'Wedding story cover', section: 'Wedding story', location: '/stories/wedding-story/#content-STORY-A-COVER-01', requirement: 'required',
    request: 'Choose the cover for this wedding story.',
    note: 'Pick a frame that represents the assignment as a whole.',
    checklist: [
      'Choose one original from the same wedding as the gallery, with credit and publication clearance.',
      'We will check the cover crop on phone and desktop.',
      'The same permitted source may serve as the opening photograph and story cover.',
    ],
  }),
  defineSlot({
    id: 'STORY-A-DETAILS-01', title: 'Wedding story details', section: 'Wedding story', location: '/stories/wedding-story/#content-STORY-A-DETAILS-01', requirement: 'required',
    request: "Add this couple's story details.",
    note: 'Share the names you may publish, the occasion and the place. Leave private details out.',
    checklist: [
      'Supply the preferred public names or a non-identifying title, the occasion and the confirmed location.',
      'Add a few factual details only if they help visitors understand this assignment.',
      'Confirm naming permissions. An event date is optional; a portfolio publication date is not an event date.',
    ],
  }),
  defineSlot({
    id: 'STORY-A-GALLERY-01', title: 'Wedding photographs', section: 'Wedding story', location: '/stories/wedding-story/#content-STORY-A-GALLERY-01', requirement: 'required',
    request: 'Add photographs from this one wedding.',
    note: 'Send the originals together. Include people, setting, portraits, rituals and celebration where they belong to the actual day.',
    checklist: [
      'Supply a representative edit from one real wedding, keeping original filenames and credits.',
      'Confirm which photographs and people may appear publicly. Keep confidential consent records elsewhere.',
      'We will curate the sequence, captions, descriptions and crops. The six draft frames do not set the final photo count.',
    ],
  }),
  defineSlot({
    id: 'STORY-A-NOTE-01', title: 'Wedding assignment note', section: 'Wedding story', location: '/stories/wedding-story/#content-STORY-A-NOTE-01', requirement: 'optional',
    request: 'Add a note about this assignment.',
    note: 'Share one real observation or decision that helps visitors understand this work.',
    checklist: [
      'Supply a short, first-hand recollection, piece of guidance or photographic decision.',
      'Check the facts and what the clients are comfortable publishing.',
      'Omit the note if it adds no useful context. Do not invent feelings or an emotional anecdote.',
    ],
  }),
  defineSlot({
    id: 'STORY-B-COVER-01', title: 'Couple session cover', section: 'Couple session', location: '/stories/couple-session/#content-STORY-B-COVER-01', requirement: 'required',
    request: 'Choose the cover for this couple session.',
    note: 'Pick work that shows a useful difference from the wedding story.',
    checklist: [
      'Choose one cleared original tied to the same assignment as this session gallery.',
      'Include the correct credit and identify the assignment.',
      'We will check its crop and contribution to the two-story selection.',
    ],
  }),
  defineSlot({
    id: 'STORY-B-DETAILS-01', title: 'Couple session details', section: 'Couple session', location: '/stories/couple-session/#content-STORY-B-DETAILS-01', requirement: 'required',
    request: "Add this session's details.",
    note: 'Share the public names or title, the occasion and the confirmed location.',
    checklist: [
      'Supply accurate public names or a non-identifying title and the session context.',
      'Confirm the location and any travel statement before it appears on the site.',
      'A beach or meadow in a photograph does not establish its location.',
    ],
  }),
  defineSlot({
    id: 'STORY-B-GALLERY-01', title: 'Couple session photographs', section: 'Couple session', location: '/stories/couple-session/#content-STORY-B-GALLERY-01', requirement: 'required',
    request: 'Add photographs from this one session.',
    note: 'Include a sense of place, closer portraits and different moments that belong together.',
    checklist: [
      'Supply a representative original selection from one assignment, with credits and clearance.',
      'Keep original filenames so the edit can be discussed without losing references.',
      'We will curate a suitable sequence and check crops, colour and detail. The five draft frames do not set the final photo count.',
    ],
  }),
  defineSlot({
    id: 'STORY-B-NOTE-01', title: 'Session advice', section: 'Couple session', location: '/stories/couple-session/#content-STORY-B-NOTE-01', requirement: 'optional',
    request: 'Add a session tip.',
    note: 'Tell us something real about preparation, guidance or the place.',
    checklist: [
      'Supply brief, first-hand advice supported by this assignment.',
      'Confirm any location, permit or preparation information.',
      'Omit the note if factual input is unavailable. Do not imply guaranteed weather, travel packages or client feelings.',
    ],
  }),
  defineSlot({
    id: 'FILM-01', title: 'Film', section: 'Selected work', location: '/#content-FILM-01', requirement: 'optional',
    request: 'Add a real film to watch.',
    note: 'Send its source or authorised viewing link, a still frame, title and credits.',
    checklist: [
      'Supply the actual film, a poster image and the authorised title and credits.',
      'Confirm publication and music rights, with captions or descriptive alternatives where needed.',
      'We will test playback, controls and failure states before marking it Ready. Omit the feature if a usable film is not supplied.',
    ],
  }),
  defineSlot({
    id: 'REVIEW-01', title: 'Client feedback', section: 'Experience', location: '/#content-REVIEW-01', requirement: 'optional',
    request: "Add a client's real feedback.",
    note: 'Share their exact words and how they agree to be credited.',
    checklist: [
      'Supply the original quote or verifiable source, agreed attribution and publication permission.',
      'We will preserve its meaning and keep private details out of the site.',
      'Do not add a rating, stars or a client name that the source does not establish.',
    ],
  }),
  defineSlot({
    id: 'ABOUT-PORTRAIT-01', title: 'Photographer portrait', section: 'About', location: '/#content-ABOUT-PORTRAIT-01', requirement: 'optional',
    request: 'Add a photograph of you.',
    note: 'Choose a recent portrait or a clear image of you working.',
    checklist: [
      'Supply an original of the actual person clients may meet, with credit and permission.',
      'We will check the intended crop and identification.',
      'A text-led section is an option if no suitable portrait is available.',
    ],
  }),
  defineSlot({
    id: 'ABOUT-BIO-01', title: 'Photographer introduction', section: 'About', location: '/#content-ABOUT-BIO-01', requirement: 'required',
    request: 'Introduce yourself.',
    note: 'Confirm your public name, current role and what matters in your work.',
    checklist: [
      'Supply your public name, current role and a short factual biography.',
      'Confirm whether the site should use I or we and what that voice represents.',
      'We will edit confirmed facts. Public association with a brand does not establish a founder, owner or team claim.',
    ],
  }),
  defineSlot({
    id: 'TEAM-01', title: 'People clients may meet', section: 'About', location: '/#content-TEAM-01', requirement: 'optional',
    request: 'Add your team, if this helps clients understand who they will meet.',
    note: 'Share real public names, roles and photographs, and explain who attends assignments.',
    checklist: [
      'Describe the actual employee or associate arrangement and how staffing varies.',
      'Supply public names, roles, photographs, credits and permission for anyone introduced.',
      'Omit this section if it does not help clients. No fictional team members are needed.',
    ],
  }),
  defineSlot({
    id: 'SERVICES-01', title: 'Services and coverage', section: 'Experience', location: '/#content-SERVICES-01', requirement: 'required',
    request: 'Confirm the services you offer.',
    note: 'Tell us what clients receive, where you work and any important limits.',
    checklist: [
      'Confirm current service types, coverage area and any travel terms.',
      'Describe actual inclusions and relevant limits so a visitor can judge whether to enquire.',
      'We will write concise guidance from those facts. Published work does not establish current packages or availability.',
    ],
  }),
  defineSlot({
    id: 'PROCESS-01', title: 'Working together', section: 'Experience', location: '/#content-PROCESS-01', requirement: 'required',
    request: 'Explain what working with you involves.',
    note: 'Describe how you prepare, guide clients and deliver their photographs.',
    checklist: [
      'Describe the actual steps before, during and after an assignment, including who does the work.',
      'Include only commitments you can support.',
      'We will keep the useful steps concise without inventing deposits, delivery times or unlimited revisions.',
    ],
  }),
  defineSlot({
    id: 'FAQ-01', title: 'Practical questions', section: 'Experience', location: '/#content-FAQ-01', requirement: 'optional',
    request: 'Add answers to the questions clients ask most.',
    note: 'Start with what they need to decide whether to enquire.',
    checklist: [
      'Supply three to five useful questions and accurate answers if available.',
      'Check whether the services and process already answer each question.',
      'We can suggest unanswered questions, but travel, coverage and delivery answers need your actual terms.',
    ],
  }),
  defineSlot({
    id: 'PRICING-01', title: 'Pricing approach', section: 'Experience', location: '/#content-PRICING-01', requirement: 'optional',
    request: 'Choose what to say about pricing.',
    note: 'Share accurate prices and inclusions, explain your real quoting approach, or leave this section out.',
    checklist: [
      'Confirm whether prices, a quoting explanation or no pricing section should appear.',
      'If publishing amounts, supply current currency, tax, travel and inclusion details where relevant.',
      'We will not use sample prices or assume a package or quoting policy.',
    ],
  }),
  defineSlot({
    id: 'CONTACT-01', title: 'Enquiry destination', section: 'Enquiry', location: '/#content-CONTACT-01', requirement: 'required',
    request: 'Confirm where enquiries should go.',
    note: 'Add the business email or number you answer and the profiles you want linked.',
    checklist: [
      'Confirm a current business destination, preferred channel and the person responsible for replies.',
      'We will check the exact links and later test delivery or retrieval within the agreed authorization.',
      'A publicly listed phone number or profile is a lead, not proof of control. At least one working contact path is required for publication.',
    ],
  }),
  defineSlot({
    id: 'CONTACT-RESPONSE-01', title: 'What happens after an enquiry', section: 'Enquiry', location: '/#content-CONTACT-RESPONSE-01', requirement: 'required',
    request: 'Tell clients what happens after they enquire.',
    note: 'Say whether the next step is a call or email. Give a response time only if you can meet it.',
    checklist: [
      'Confirm the real follow-up process and any response commitment you want to publish.',
      'Accurate neutral wording is sufficient when no fixed turnaround is promised.',
      'We will match messages to actual receipt behavior. An enquiry does not confirm availability or a booking.',
    ],
  }),
  defineSlot({
    id: 'ENQUIRY-FIELDS-01', title: 'Enquiry form details', section: 'Enquiry', location: '/#content-ENQUIRY-FIELDS-01', requirement: 'conditional', condition: 'enquiryForm',
    request: 'Confirm what helps you respond to an enquiry.',
    note: 'Keep the details you need for the first reply. The draft form cannot send.',
    checklist: [
      'Confirm the useful first-contact fields with the person who will reply.',
      'The proposed form uses a name, one reply channel, occasion, approximate date or place and an optional short note. Uncertain plans are allowed.',
      'Any included story context must be visible and removable. Do not ask for sensitive or unnecessary details.',
    ],
  }),
  defineSlot({
    id: 'PRIVACY-01', title: 'Enquiry privacy information', section: 'Enquiry', location: '/#content-PRIVACY-01', requirement: 'conditional', condition: 'personalDataHandling',
    request: 'Explain how you handle enquiries.',
    note: 'Identify who receives the information and how people can contact you about it.',
    checklist: [
      'Confirm the actual business contact, purpose, recipients and retention or deletion approach.',
      'Identify the selected form, tracking or other processors before drafting their description.',
      'We will explain the implemented data flow without inventing a legal identity, compliance claim or consent requirement.',
    ],
  }),
  defineSlot({
    id: 'SEO-SHARE-01', title: 'Search and sharing details', section: 'Sharing', location: '/#content-SEO-SHARE-01', requirement: 'required',
    request: 'Confirm how this website should appear when shared.',
    note: 'We will prepare titles and descriptions from your cleared details and photographs.',
    checklist: [
      'Check the factual representation and permission for any proposed share image.',
      'Confirm the intended public domain when it is chosen.',
      'We will derive page titles, descriptions and image text from cleared content. No separate keyword list or invented review data is needed.',
    ],
  }),
] as const;

export type ContentSlotId = (typeof contentSlots)[number]['id'];

export function getSlot(id: string): ContentSlot {
  const slot = contentSlots.find((item) => item.id === id);
  if (!slot) throw new Error(`Unknown content reference: ${id}`);
  return slot;
}

export interface DraftProject {
  id: 'wedding-story' | 'couple-session';
  title: string;
  category: string;
  href: string;
  coverSlot: ContentSlotId;
  detailsSlot: ContentSlotId;
  gallerySlot: ContentSlotId;
  noteSlot: ContentSlotId;
  frameCount: number;
}

// These describe the review layout, not real assignments or a required edit size.
export const projects = [
  {
    id: 'wedding-story', title: 'Wedding story', category: 'Wedding', href: '/stories/wedding-story/',
    coverSlot: 'STORY-A-COVER-01', detailsSlot: 'STORY-A-DETAILS-01',
    gallerySlot: 'STORY-A-GALLERY-01', noteSlot: 'STORY-A-NOTE-01', frameCount: 6,
  },
  {
    id: 'couple-session', title: 'Couple session', category: 'Couple session', href: '/stories/couple-session/',
    coverSlot: 'STORY-B-COVER-01', detailsSlot: 'STORY-B-DETAILS-01',
    gallerySlot: 'STORY-B-GALLERY-01', noteSlot: 'STORY-B-NOTE-01', frameCount: 5,
  },
] as const satisfies readonly DraftProject[];

export interface PublicationDecisions {
  enquiryForm: boolean | null;
  personalDataHandling: boolean | null;
}

// Null means undecided for publication. The visible review form is non-sending.
export const publicationDecisions: PublicationDecisions = {
  enquiryForm: null,
  personalDataHandling: null,
};

export function getReadiness(slots: readonly ContentSlot[] = contentSlots) {
  const notNeeded = slots.filter((slot) => slot.status === 'Not needed').length;
  return {
    ready: slots.filter((slot) => slot.status === 'Ready').length,
    active: slots.length - notNeeded,
    notNeeded,
    total: slots.length,
  };
}

const statuses: readonly ContentStatus[] = [
  'Needs content', 'Received: checking', 'Needs an update', 'Ready', 'Not needed',
];
const decisions: readonly PublicationDecision[] = ['retain', 'omit', 'undecided'];
const slotFields = new Set([
  'id', 'title', 'section', 'location', 'request', 'note', 'checklist', 'required',
  'requirement', 'condition', 'status', 'publicationDecision', 'omissionReason', 'supplied', 'remaining',
]);

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Validates the register, not the truth of a supplied claim or a live service. */
export function validateContent(
  slots: readonly ContentSlot[] = contentSlots,
  mode: SiteMode = 'review',
  publication: PublicationDecisions = publicationDecisions,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (mode !== 'review' && mode !== 'public') {
    return { valid: false, issues: ['Use review or public content mode.'] };
  }
  if (!Array.isArray(slots)) return { valid: false, issues: ['The content register must be an array.'] };
  const seen = new Set<string>();
  const expected = new Map<string, ContentSlot>(contentSlots.map((slot) => [slot.id, slot]));

  for (const slot of slots as readonly ContentSlot[]) {
    if (!slot || typeof slot !== 'object') {
      issues.push('Every content group must be a plain record.');
      continue;
    }
    const original = expected.get(slot.id);
    if (!original) issues.push(`Unknown content reference: ${String(slot.id)}.`);
    if (seen.has(slot.id)) issues.push(`${slot.id}: duplicate content reference.`);
    seen.add(slot.id);
    for (const field of Object.keys(slot)) {
      if (!slotFields.has(field)) issues.push(`${slot.id}: unsupported field ${field}. Keep private records outside this source.`);
    }
    for (const field of ['id', 'title', 'section', 'location', 'request', 'note'] as const) {
      if (typeof slot[field] !== 'string' || !slot[field].trim()) issues.push(`${slot.id}: ${field} must contain plain text.`);
    }
    if (!Array.isArray(slot.checklist) || slot.checklist.length === 0 || slot.checklist.some((line: unknown) => !hasText(line))) {
      issues.push(`${slot.id}: include specific checklist guidance.`);
    }
    if (!statuses.includes(slot.status)) issues.push(`${slot.id}: unsupported content status.`);
    if (!decisions.includes(slot.publicationDecision)) issues.push(`${slot.id}: choose retain, omit or undecided.`);
    if (original && (slot.requirement !== original.requirement || slot.required !== original.required || slot.condition !== original.condition)) {
      issues.push(`${slot.id}: publication requirements changed. Review the scope and canonical schema before changing them.`);
    }
    if (typeof slot.remaining !== 'string') issues.push(`${slot.id}: remaining must be a plain text note.`);
    for (const field of ['supplied', 'omissionReason'] as const) {
      if (slot[field] !== null && (typeof slot[field] !== 'string' || !slot[field].trim())) {
        issues.push(`${slot.id}: ${field} must be null or non-empty plain text.`);
      }
    }
    if (['Received: checking', 'Needs an update', 'Ready'].includes(slot.status) && !hasText(slot.supplied)) {
      issues.push(`${slot.id}: ${slot.status} needs a safe supplied-content label. Keep private file paths and correspondence elsewhere.`);
    }
    if (slot.status === 'Needs an update' && !hasText(slot.remaining)) {
      issues.push(`${slot.id}: explain the specific update needed.`);
    }
    if (slot.required && (slot.publicationDecision !== 'retain' || slot.status === 'Not needed')) {
      issues.push(`${slot.id}: required content cannot be omitted under the current scope.`);
    }
    if (slot.publicationDecision === 'omit' || slot.status === 'Not needed') {
      if (slot.publicationDecision !== 'omit' || slot.status !== 'Not needed' || !hasText(slot.omissionReason)) {
        issues.push(`${slot.id}: an omission needs Not needed status and a recorded reason.`);
      }
    } else if (slot.omissionReason !== null) {
      issues.push(`${slot.id}: remove the omission reason when retaining this content.`);
    }

    if (mode === 'public') {
      if (slot.publicationDecision === 'undecided') issues.push(`${slot.id}: decide whether to retain or omit this feature before publication.`);
      if (slot.publicationDecision === 'retain' && slot.status !== 'Ready') issues.push(`${slot.id}: retained content is ${slot.status}; it must be Ready before publication.`);
      if (slot.condition && publication?.[slot.condition] === true && slot.publicationDecision !== 'retain') {
        issues.push(`${slot.id}: ${slot.condition} is enabled, so this content must be retained and Ready.`);
      }
      if (slot.condition && publication?.[slot.condition] === false && slot.publicationDecision !== 'omit') {
        issues.push(`${slot.id}: ${slot.condition} is disabled; record this slot as Not needed with a reason.`);
      }
    }
  }
  for (const id of expected.keys()) {
    if (!seen.has(id)) issues.push(`${id}: missing content group. Preserve retired IDs with their omission decision.`);
  }
  for (const key of ['enquiryForm', 'personalDataHandling'] as const) {
    const value = publication?.[key];
    if (value !== true && value !== false && value !== null) issues.push(`${key}: the publication decision must be true, false or null.`);
    if (mode === 'public' && value === null) issues.push(`${key}: choose the public feature scope before publication.`);
  }
  if (publication?.enquiryForm === true && publication.personalDataHandling !== true) {
    issues.push('A live enquiry form handles personal data. Resolve that privacy requirement before publication.');
  }
  return { valid: issues.length === 0, issues };
}
