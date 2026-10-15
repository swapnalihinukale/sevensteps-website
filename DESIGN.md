# Seven Steps: private draft design brief

Status: private draft authorized, 15 October 2026. The user has asked the team to proceed. Use direction A, **Close to the people**, as the working visual selection for this private draft. Build with the Astro static output, TypeScript and native CSS defaults in [TECHNICAL-DECISIONS.md](docs/TECHNICAL-DECISIONS.md). Track B02 in [EXECUTION-PLAN.md](EXECUTION-PLAN.md) and actual checks in the [implementation verification ledger](docs/IMPLEMENTATION-VERIFICATION-2026-10-15.md).

The [research synthesis and three non-code concepts](RESEARCH-SYNTHESIS-AND-CONCEPTS.md) records the earlier comparison, proposed palettes, type roles, desktop/mobile reading orders, sample story structure and critique. This brief carries direction A into the private build. The choice remains open to revision after rendered review and does not establish owner-approved branding. Deep reference coverage and the own-work sample are complete to the bounded scope described there.

The user's additional first-version requirements are captured in the [replacement UX](docs/CONTENT-REPLACEMENT-UX.md), [responsive/reliability](docs/RESPONSIVE-AND-RELIABILITY-SPEC.md), [motion](docs/MOTION-AND-INTERACTION-SPEC.md) and [quality/security](docs/QUALITY-AND-SECURITY-GATES.md) specifications. Rich motion and modern CSS are deliberate candidates within the performance envelope; no single technique is a reason to hide essential content or inflate the bundle. Unknown real content gets useful, visible Add/Replace guidance in the private review version. Checks remain Not run until their evidence is added to the implementation ledger.

The [initial 27-slot inventory](docs/CONTENT-SLOT-INVENTORY.md) defines the minimum review content, exact requests and readiness states. It remains the planning source for stable IDs. The private build uses two story views, one wedding and one outdoor couple assignment, with truthful placeholders until the actual assignments and assets are cleared.

Use the execution plan's stage-specific skills/tools map. Apply [stop-slop](/Users/admin/.codex/skills/stop-slop/SKILL.md) and the [copy/voice specification](docs/COPY-AND-VOICE-SPEC.md) to concept prose, owner notes and website text. Use no em dashes in authored UX, including accessible labels and metadata. Check clarity and factual accuracy by hand as well as scanning text.

The [prebuild design review](docs/PREBUILD-DESIGN-REVIEW.md) produced seven findings. Apply these corrections: use two visible story links for the minimum scope; place brand/service context and a work link around one lead image on phones, with the companion afterward; allow explicit Play while its control retains focus; assess placeholder composition and original-image quality as separate results; curate only supported moments; keep owner notes compact with detailed requests in the shared checklist; show optional story context in the enquiry and allow removal/change. Later implementation must pass each finding's acceptance checks.

## Purpose

Create an experience that makes this photographer's actual work recognisable, helps suitable clients judge fit and trust, and gives them a clear path to a conversation the business can handle. It should look impressive through the quality of the photographic edit, composition, narrative and interaction. Features must earn their place through client or operating value.

## Selected private draft

Direction A relates a lead portrait or moment to a companion photograph from the same assignment. Use unequal image areas on desktop and one lead image, service context and a work link before the companion on phones. Keep both story choices visible without requiring a carousel. Until originals arrive, review these relationships with labelled placeholders rather than borrowed or generated portfolio work.

Use A's proposed draft tokens: Paper `#FAFAF8`, Ink `#242422`, Pomegranate `#722F46`, Leaf `#405B4B` and Mist `#E5E7E3`. Source Serif 4 is the heading candidate and Source Sans 3 the reading/control candidate. Confirm licences, glyph coverage, actual files, contrast and transfer cost during implementation. These are working design choices, not a claim that the owner supplied a brand system.

The minimum local scope is a homepage with work, experience/about and enquiry sections; two story views; a recoverable 404; and a shared private content checklist. Implement navigation, viewer and motion controls within the saved specifications. Keep the enquiry non-sending with explicit draft text and visible, removable story context. No public release, account/domain changes or outreach belongs to this build instruction.

## What we can currently support

Public profiles identify Seven Steps Photography & Films in Pune and directly connect to Yogesh Repale's Behance. Sampled work includes colourful ceremonies, family moments, composed couple portraits, quiet bridal images and a Goa pre-wedding session. These are observations from a limited sample, not a final positioning or a claim about every assignment. See the [source-linked research](PHOTOGRAPHER-RESEARCH-AND-STRATEGY-2026-10-14.md).

The likely initial audience to investigate is couples and other decision-makers considering wedding or pre-wedding photography. Their price range, geography, languages, priorities and buying process remain unknown. The working conversion is a received, suitable enquiry, with confirmed bookings and contribution measured later if the owner supplies reliable data.

## Questions the experience should answer

1. What does this photographer see and capture particularly well?
2. Can I see a coherent assignment relevant to my occasion, beyond a few standout images?
3. Who will work with us, how will they help us feel comfortable, and what happens next?
4. Is this service appropriate for our place, date and expectations?
5. How do we enquire, and what response can we truthfully expect?

These are hypotheses to test, not interview findings. The business objective might instead be better fit, higher contribution, off-season demand or less administration; owner evidence should settle that.

## Earlier direction hypotheses

- **A wedding remembered from the inside:** sequence real people, rituals and smaller moments across a complete day. Test emotional and cultural relevance.
- **A personal portrait of your celebration:** let carefully composed portraits and an honest account of client guidance establish an individual point of view. Test trust and camera comfort.
- **Your story, somewhere meaningful:** explore real places and practical pre-wedding choices. Test demand and travel economics before making this the main offer.

These hypotheses originated in the public work and informed the completed concept comparison. Direction A, Close to the people, is the working private-draft choice. Keep the alternatives as research history rather than restarting selection during implementation.

## Completed concept basis

The concept comparison records audience/job hypotheses, supporting evidence, memorable visual ideas, story sequences, desktop/mobile sketches, proposed colour/type roles, image/crop principles, motion intent and the enquiry journey. Use A and the accepted prebuild corrections as the implementation basis. Distinguish selected draft tokens from unconfirmed copy, asset rights and font-file checks.

Explain how the rendered choices follow from this photographer's work. Critique generic defaults and revise weak decisions. Check whether a reviewer can identify the service, evidence of fit and next step; a preference vote alone is insufficient. Preserve the dated non-code research. Any supplied image still needs the appropriate source and permission before public use.

## Quality requirements for the private draft and later release

- Authentic work, accurate names and context, no fabricated proof or invented scarcity.
- A small, coherent selection with accessible project pages and useful captions; do not load a complete archive on entry.
- Mobile composition designed deliberately, with useful navigation, visible focus, readable type, appropriate contrast, zoom support and reduced motion.
- Draft enquiry controls state that they do not send. Live B03 states must cover validation, sending, received confirmation, failure, timeout and recovery. A WhatsApp tap is not proof a message was sent or received.
- Confirm a reliable designated recipient and response process before B03; meaningful context travels with the eventual enquiry.
- Searchable, contextual image content and accurate service/location information. No invented service-area pages.
- Efficient responsive images and fonts. Target good Core Web Vitals, distinguishing lab checks from field data; no claim of current results.
- Content and tooling the owner can maintain. Prefer a simpler workflow where it solves the same demonstrated need.

## External facts and release inputs still required

Audience and priority service; commercial objective; ownership/team identity; permitted projects/films/reviews; business domain; contact recipient; response and delivery promises; price presentation; maintainer; languages; final public route titles and owner-approved identity; hosting/provider accounts and running cost. Direction A and Astro static output are selected for this private draft, with assisted file-based content updates as the engineering default. Revisit a CMS if owner editing needs warrant it. The [owner input sheet](docs/OWNER-INPUTS.md) consolidates facts that public research cannot establish.

OpenDesign design systems, templates and generated recommendations are references, not evidence of these decisions. The private-build authorization does not clear its executable runtime's dependency security hold. Continue with the independent Astro implementation and portable guidance.

Use [the design system](docs/DESIGN-SYSTEM.md) for colours, type and motion, and [B04 measurements](docs/CONTENT-READY-IMPLEMENTATION-2026-10-15.md) for the recorded build sizes. Direction A remains selected.
