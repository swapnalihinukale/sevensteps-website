# Seven Steps: research synthesis and proposed creative direction

15 October 2026. This is a reviewable recommendation and three non-code concepts, not a selected brand system or authorization to build. Execution status lives in [EXECUTION-PLAN.md](EXECUTION-PLAN.md).

The opportunity is to make the photographer's real work easier to recognise, trust and act on. The website should combine a distinctive photographic edit, clear client guidance, an easy enquiry and dependable delivery. Visual richness must remain compatible with a normal phone and an ordinary connection.

## What the deeper research adds

The [Indian study](docs/INDIAN-BENCHMARK-RESEARCH.md) covers 15 sites, including four Pune-relevant practices. The [international study](docs/INTERNATIONAL-AND-PERFORMANCE-RESEARCH.md) covers nine more. [Browser review](docs/BROWSER-VISUAL-REVIEW-2026-10-15.md) sampled 12 of those sites and selected story/contact journeys. These are qualitative references, not a ranking or evidence of their conversion performance.

The strongest transferable ideas are precise image context, representative complete stories, a clear account of who works with the client, helpful coverage information and a proportionate next step. Repeated claims such as timeless, authentic and storytelling are already common. They cannot be the main differentiation by themselves.

Our [own-work assessment](docs/CONTENT-ASSESSMENT.md) now has five public projects sampled across two sessions and one sign-in-restricted project. Malav & Pari includes directed portraits, rituals and later celebration; Mili & Saptrishi and Vasya & Anthony show quieter outdoor couple work. These broaden the original sample, while leaving originals, current work, authorship/rights, business fit and the full delivered-gallery standard unresolved.

## A concrete experience worth exploring

**Let visitors meet the photographer through a few well-told real days.** Start with a characteristic photograph and a concise, truthful introduction. Let the visitor choose a relevant story. Within it, move between the portrait, the people around it and the moments that give it meaning. Add a short authentic note from the photographer where it reveals something a picture alone cannot. Carry that story context into a straightforward enquiry.

For a future first version, a story might contain an opening portrait, anticipation, people and ritual, celebration, and a quiet closing frame. This is an editorial hypothesis, not a mandatory seven-section gimmick based on the brand name. Use only chapters that the assignment supports. A wedding and an outdoor couple session need different sequences.

Three layers give this experience depth without making every page an application:

- **Immediate impression:** one strong image, legible identity, a clear route into the work, and a deliberate small motion sequence that never hides essential content.
- **Evidence at the visitor's pace:** a few selected stories, meaningful captions, optional larger-image viewing, and plain explanations of guidance, coverage and next steps.
- **Action and continuity:** a short enquiry with the chosen story attached as context, an honest receipt state, and a named response process. The business can follow the enquiry through a quote and booking.

An optional small moving image strip can add texture after the main story selection. Horizontal arrows, swipe and keyboard navigation can support deliberate browsing. Automatic horizontal or vertical movement belongs in a separate pausable treatment; it must not carry information someone has to chase. Detailed behavior is specified in the [motion plan](docs/MOTION-AND-INTERACTION-SPEC.md).

## Three comparable concept treatments

All concepts use the same initial test content: a representative wedding sequence, an outdoor couple sequence, an honest working-method note and the same enquiry task. Unknown assets remain clearly labelled placeholders in a first review version. Names, prices, reviews and ownership claims are not fabricated.

Font families below are candidates to inspect and confirm for licensing, glyph coverage, delivered files and actual rendering before use. Palettes are proposed tokens, not approved branding; contrast must be measured in the eventual combinations.

### A. Close to the people: recommended first exploration

**Job:** help couples and families recognise themselves in a real celebration and trust the photographer's attention to people. **Evidence:** public wedding rituals and celebration sequences, with directed portraits to balance candid moments.

**Memorable idea:** an opening pair of photographs relates an expressive portrait to a moment involving the people around the couple. The rest of the page is quiet enough for that relationship to register. Do not invent a connection between unrelated events.

**Proposed palette:** Paper `#FAFAF8`; Ink `#242422`; Pomegranate `#722F46`; Leaf `#405B4B`; Mist `#E5E7E3`. Paper/ink are the reading surfaces; coloured accents are small and draw from the red/green relationships visible in the work, not a generic luxury-gold scheme.

**Type:** Source Serif 4 for a small number of expressive story headings; Source Sans 3 for navigation, paragraphs and forms. Clear sentence case, comfortable line lengths and strong functional contrast.

**Layout and alignment:** left-aligned reading and navigation; two unequal image areas on desktop, a deliberately selected single lead image followed by its companion on mobile. Preserve people and gestures rather than mechanically cropping both into identical cards.

```text
Desktop
Brand                 Work  Experience  Enquire
[large portrait / moment]   [smaller related frame]
Brief statement            Explore this real story
Wedding story A                     Couple session B
How working together feels             Practical answers
Enquire about your day

Phone
Brand                                  Menu
[one purposeful lead photograph]
Short identity + story link
[the related human moment]
Selected stories, one at a time
Guidance and practical answers
Enquire
```

**Motion:** image controls respond promptly; a short title/detail entrance follows an already visible image; restrained transition into a story; optional secondary horizontal strip with pause. Story reading stays native and vertical.

**Content need:** permission-cleared, coherent assignments; accurate moments/captions; the real photographer's working-method note. Start editorial curation with Malav and compare with Pranita, rather than judging a whole portfolio from a few portraits.

### B. Portraits with a person behind them

**Job:** show a recognisable portrait sensibility and reduce uncertainty about being photographed. **Evidence:** quiet bridal/couple pictures and composed outdoor portraits. **Memorable idea:** a strong portrait is paired with a very brief, real account of the guidance or observation behind it.

**Proposed palette:** Gallery `#171A1C`; Light `#F6F7F5`; Silver `#C9CECF`; Blue-green `#2E6F73`; Paper `#FFFFFF`. Dark photographic sections alternate with light functional reading areas. This is a comparison proposal, not a claim that dark equals premium.

**Type:** Literata for selected portrait titles; IBM Plex Sans for prose and controls. Avoid ultra-light text and decorative label systems.

**Layout and alignment:** one dominant photograph with a compact adjacent note; left-aligned copy and simple controls. Alternate portrait and environment shapes to reflect the photographs' natural aspect ratios. Keep enquiry on a clear, light surface.

```text
Desktop: brand/nav → dominant portrait + short real note
         → small portrait selection → guidance/process
         → relevant whole story → enquiry
Phone:   portrait → note → work choices → guidance → enquiry
```

**Motion:** controlled crossfade between a very small selection, explicit previous/next buttons, a quiet lightbox and a static alternative. Never animate a real photograph to imply moments that were not captured.

**Content need:** original portraits, a genuine explanation of how the photographer helps clients, and fuller stories proving the work beyond favourable portrait conditions. Test whether the mood feels welcoming to the actual audience.

### C. A place for your story

**Job:** help a couple understand a location-led session and the experience it involves. **Evidence:** Goa, meadow and shore imagery; confirm locations in uncaptioned photographs. **Memorable idea:** pair place and people with a useful observation about light, timing, travel or comfort. Use advice the photographer can support from that assignment.

**Proposed palette:** White `#FFFFFF`; River `#194859`; Sky `#DCEBF0`; Field `#496A46`; Slate `#26353B`. Large colour comes from the photographs. UI colour distinguishes information and actions instead of decorating every section.

**Type:** Fraunces for sparing titles; Source Sans 3 for all practical reading and actions. Validate that the type adds character without fighting foliage, architecture or faces.

**Layout and alignment:** a landscape establishing image, a closer human frame and concise practical context form one sequence. Left-aligned reading; natural aspect ratios and mobile art direction. A small location list uses ordinary links before any map is considered.

```text
Desktop: setting photograph → couple/detail pairing
         → a real session story → practical choices → enquiry
Phone:   lead crop → people → setting/context → preparation → enquiry
```

**Motion:** a limited horizontal scene rail with arrows/swipe and a clear next-story link. An optional vertical ambient strip can be compared as a separate treatment with explicit start/pause; it does not move the page itself or replace manual reading.

**Content need:** additional representative sessions, accurate locations, real preparation advice, travel economics and a service the photographer wants more of. This may be a focused service page rather than the whole brand.

## Critique before implementation

The initial temptation was to turn every section into an editorial image card, add a luxury serif treatment and use “timeless stories” as the promise. The research makes that too generic. The revised concepts put the distinction in the relationship between actual images, context and client guidance. The token systems remain restrained and functional.

Concept A has the broadest connection to the observed wedding work and the clearest evidence-to-enquiry path. Concept B could become visually strong but might overemphasise portraits unless supported by complete coverage. Concept C is credible to explore as a session offering, but should not imply a destination business without commercial evidence. These are design judgments, not user-tested findings.

Compare the concepts using the same content and visitor task: “Find work relevant to our day, understand what working together involves, and make an informed enquiry.” Assess comprehension, confidence, photographic identity and performance before choosing a direction. Keep one coherent approach across the homepage.

## Business opportunities and tests

| Opportunity | Evidence / hypothesis | Operating cost and dependency | Practical test |
|---|---|---|---|
| Coherent destination from social/referrals | Existing social-to-Behance/domain fragmentation is observed; its lost-lead effect is unknown | Correct identity/domain/contact; maintenance owner | Can a new visitor identify the service, see relevant work and locate a working next step? |
| Better proof of fit | Own public work has different kinds of moments; references explain full assignments | Curation, originals, context and permissions | Compare a story edit with isolated highlights; record remaining buyer doubts. |
| Confidence about the experience | References answer camera comfort, family coverage and team involvement | Truthful process and actual responder | Check whether prospective clients can explain who will work with them and what happens next. |
| Better enquiry context | Preferred work and basic event details can inform a useful first reply | Small form, reliable delivery and owned follow-up | Check received context and response effort; keep optional questions only if useful. |
| Relevant local discovery | Pune association is corroborated; accurate local stories can establish relevance | Genuine service-area/venue experience and maintained content | Track relevant discovery and received enquiries without inventing city pages or ranking promises. |
| More worthwhile work | Revenue, capacity and contribution are currently unknown | Owner's anonymised enquiry/job evidence | Choose one business objective after reviewing fit, response, quote outcomes and fulfilment effort. |

## First-version and engineering contract

Apply [stop-slop](/Users/admin/.codex/skills/stop-slop/SKILL.md) and the [copy/voice specification](docs/COPY-AND-VOICE-SPEC.md) to concept prose, replacement guidance and website text. Use no em dashes in authored UX. Write specific observations from the photographer's work in place of generic claims about timeless stories or luxury.

The first website version, once coding is requested, can use labelled content slots. Follow [Content Replacement UX](docs/CONTENT-REPLACEMENT-UX.md) and the [initial 27-slot inventory](docs/CONTENT-SLOT-INVENTORY.md): a local note says exactly what to add, each slot has a stable reference, and one completion list links back to the correct place. No fake testimonials, invented prices or pretend functional success are needed to make a convincing review version.

The experience targets fluid behavior from narrow phones through tablets, laptops and wide monitors, including touch, keyboard, zoom, orientation and browser differences. Follow the [responsive/reliability specification](docs/RESPONSIVE-AND-RELIABILITY-SPEC.md). An emulation pass does not replace a real iPhone/iPad or Android check.

Start with the [proposed performance envelope](docs/INTERNATIONAL-AND-PERFORMANCE-RESEARCH.md): an immediately useful first image, small critical transfers, limited JavaScript/fonts, progressive image loading and intent-loaded players. These are targets to validate, not measured results. Rich motion must fit that same envelope.

The [architecture review](docs/TECHNICAL-DECISIONS.md) selected Astro static output, TypeScript and native CSS as the engineering default. Use assisted file-based content updates and a separate receiver for any live enquiry form. Confirm hosting/provider accounts and costs before activation. The [quality/security gates](docs/QUALITY-AND-SECURITY-GATES.md) define dependency, form, accessibility, performance and release checks.

Apply the [prebuild review](docs/PREBUILD-DESIGN-REVIEW.md) corrections across the concepts: two visible story choices, a mobile opening with service context and a work link around the lead image, and optional companion imagery after that context. Compare original-image quality after supplied assets arrive. Keep a selected story visible and removable in the enquiry; it is reference context, not a package choice.

## Next decision

Review A, B and C against the work and desired assignments, then record a chosen direction or a specific revision in `DESIGN.md`. Continue curation and owner-input preparation independently. Once the user asks for implementation, build the selected private review version with clear replacements, then verify it against the saved acceptance criteria. Missing optional media need not stop that local version; publishing and live business connections need their actual facts and authorization.
