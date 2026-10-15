# Seven Steps: prebuild design review

15 October 2026. **Review complete; corrections integrated into the planning documents.** The agent reviewed the design and content plans. No website exists to inspect, and the agent has run no website, usability or device tests in this review. These findings address design decisions and acceptance gaps, not observed implementation defects.

The team has enough research to define the first review version. **Resolve the two-story scope, opening hierarchy and Play/focus interaction before translating the proposals into components.** Keep image curation and publication clearance as separate checks; placeholders can support an authorised private build while those inputs remain missing.

## Review basis

The review applies the [project frontend-design adapter](../.agents/skills/photographer-design-codex/SKILL.md), its [frontend-design guidance](../.agents/skills/frontend-design/SKILL.md) and [stop-slop](/Users/admin/.codex/skills/stop-slop/SKILL.md). Sources inspected:

- [Design brief](../DESIGN.md) and [research synthesis with concepts A, B and C](../RESEARCH-SYNTHESIS-AND-CONCEPTS.md).
- [Own-work assessment](CONTENT-ASSESSMENT.md), [27-slot inventory](CONTENT-SLOT-INVENTORY.md) and [replacement UX](CONTENT-REPLACEMENT-UX.md).
- [Motion specification](MOTION-AND-INTERACTION-SPEC.md), [responsive/reliability specification](RESPONSIVE-AND-RELIABILITY-SPEC.md) and [copy/voice specification](COPY-AND-VOICE-SPEC.md).

The own-work evidence consists of five sampled public projects and one Behance sign-in restriction. Earlier reviewers saw Malav & Pari portraits, ceremony/family context and later celebration; Mili & Saptrishi meadow portraits; Vasya & Anthony quiet and playful coastal frames; and earlier samples of Pranita & Abhishek and Vaidehi & Vivek, Goa. The agent relied on those recorded observations here and did not perform another browser inspection.

The original reviewers used browser panels and screenshots, including a capture with stitching artifacts. They did not inspect full-resolution originals or a complete delivered gallery. Recorded project publication dates from 2023 and 2024 do not establish current portfolio priorities. Client comfort, commercial fit, permissions and current services remain owner inputs.

## Ranked findings

**P1** identifies decisions to settle before the baseline component plan. **P2** identifies corrections or acceptance checks needed for the first review and eventual publication. None selects a final concept or authorises website coding.

### D01 · P1 · Reconcile the minimum portfolio and the motion proposal

**Evidence:** Concept A's desktop sketch includes “Selected story A”, “Selected story B” and “Couple session”. The inventory defines two assignments: wedding A and outdoor couple B. The motion document recommends a horizontal project rail, but the team has not established a useful browsing problem for a two-item index.

**Correction:** Define the first review as two story routes with two visible entry links. Use a two-image composition on desktop and an ordered vertical sequence on phones as the baseline. Retain the requested motion craft through photograph Previous/Next controls, viewer transitions and one optional played strip. Compare a horizontal project rail if a later edit adds enough distinct projects to warrant it. Do not add a third placeholder project or category filters to fill the sketch.

Keep the 27 content groups as an inventory, with compact local notes for optional material. They do not require 27 sections or a separate page per group. A moving strip can reuse cleared story photographs; it must not imply additional assignments.

**Acceptance later:** The sitemap, sketch and content register name the same two assignments. Visitors can see and open both story choices without operating a carousel. The chosen motion treatment retains its controls and static equivalent. Additional projects have a recorded content purpose and cleared material.

### D02 · P1 · Specify the first mobile view before sizing the paired opening

**Evidence:** Concept A puts a lead image before the introduction on phones, followed by a companion image. The proposal lacks a height/content contract for that opening. A tall portrait plus the required draft guidance could push the business context and work link below both photographs. The sampled work contains faces, hands and wider family/ceremony context that a rigid full-screen crop could remove.

**Correction:** Keep the brand, concise service context and one work link available around the first photograph. Place the companion after that context on mobile. Avoid a compulsory full-viewport hero. Keep contact in ordinary navigation; reserve the opening's main action for viewing the featured work. Give the introduction and controls a stable reading surface instead of relying on contrast against an unknown photograph.

Treat the pair as an optional composition until originals permit it. Prioritise one lead-image request. Check any eager companion against the existing transfer budget, including fonts and nearby lazy-loaded images. The mobile budget must not become permission to crush photographic detail or stretch a small image across a wide display.

**Acceptance later:** Review the opening at 320 CSS px, 390×844, short landscape height and the documented desktop widths. Inspect the missing-image and blocked-font states as well as supplied work. The visitor can identify the proposed service and reach work/contact without waiting for a reveal. Crops preserve the important people and gestures. Record the first image, companion request timing and total entry bytes on the actual build.

### D03 · P1 · Give explicit Play precedence over the inspection-pause event

**Evidence:** The motion lifecycle requires a pause when focus or hover enters and a latched pause afterward. It also offers explicit Play/Resume. The plan does not state how Play behaves when the visitor activates it while the button retains keyboard focus or sits under the pointer.

**Correction:** Define explicit Play as the visitor's request to start from the current position, including when Play retains focus. Do not cancel it because focus is already inside the component. A new inspection event, such as moving focus to another control or photograph, pauses progression. Leaving that area does not resume it. Preserve the existing reduced-motion, hidden-page, modal and failed-image stop rules; explicit Play cannot override the OS reduced-motion policy.

Keep the controls stationary and avoid a separate floating playback toolbar. Start with one played strip orientation, a finite pass and the documented static state. The team can compare the horizontal and vertical alternatives without shipping both.

**Acceptance later:** A keyboard user can focus Play, start, pause and resume without moving focus away first. A pointer user can activate the same control without an immediate hover cancellation. Moving to another control pauses; leaving does not restart. Test reduced-motion changes, image failure and backgrounding during playback. Record results on the built component rather than claiming the state table proves them.

### D04 · P2 · Separate composition review from native-image acceptance

**Evidence:** All 27 slots remain Needs content. The visual assessment supports subject and sequencing hypotheses, but its panel sizes and capture artifacts cannot establish sharpness, colour fidelity, compression tolerance or the crop latitude of an original. The three proposed palettes and font pairs remain untested against supplied work.

**Correction:** Review the private placeholder version for hierarchy, reading order and controls. Give image quality a separate pending result. Once originals arrive, compare natural-aspect photographs on the proposed surfaces before applying masks, colour effects or repeated cover crops. Use actual red ceremonial clothing, skin, meadow foliage, coast, black-and-white and evening frames from the selected assignments for that comparison.

Keep a full-frame view available when a cover crop removes context. Constrain display size to the source's usable resolution; do not upscale a small public image to satisfy a wide hero. Request the original photographs behind public collages where possible. Preserve the photographer's colour treatment and distinguish a source limitation from a derivative compression defect.

**Acceptance later:** Record source filenames, credits/rights, intended display sizes, phone/desktop crops and export comparisons for the selected hero and stories. Inspect normal and high-density displays with the agreed budgets. The owner clears usage and facts; the agent checks rendering. A placeholder layout pass does not mark the image slot Ready. Missing originals need not block an authorised private build.

### D05 · P2 · Edit each assignment to its evidence, without filling a preset narrative

**Evidence:** Malav & Pari offers the strongest recorded wedding sequence, including portraits, rituals and celebration. The sampled pages do not prove preparation coverage, chronology or a full delivered-day standard. Mili and Vasya offer different outdoor rhythms. The 25–35-image example in the performance research is a budget scenario, not an editorial quota.

**Correction:** Request Malav's representative original edit first and compare Pranita before choosing wedding A. For the public sequence, use chapters the assignment supports. A possible Malav edit moves from portrait/context through ceremony and people to evening/celebration; confirm chronology before implying it. Omit unsupported preparation or closing-story claims.

Choose one of Mili, Vasya or Goa for B after checking the original selection and desired current work. Let a session use setting, closeness and movement without borrowing a wedding-day structure. Remove repeated frames that add no information. Retain colour/black-and-white variation where the photographer's edit gives it a purpose. Keep the cover and gallery tied to the same assignment.

**Acceptance later:** The curator records why each selected frame belongs, flags missing context and verifies public names/location. A reviewer can follow the sequence without an invented anecdote. The team does not pad a gallery to hit a count, infer places from scenery or present a sampled showcase as evidence of complete delivery quality.

### D06 · P2 · Make project type and owner requests clearer than the design vocabulary

**Evidence:** The concepts use internal terms such as “story”, “contact sheet” and “real days”. The public sample spans weddings and outdoor sessions. Malav's source copy includes generic poetry and an unfinished sentence. The inventory provides useful Add prompts, but repeated headings and explanatory paragraphs could dominate a draft when 27 groups are empty.

**Correction:** Use a cleared assignment title with a plain occasion label, such as Wedding or Couple session, on each project entry. Keep “moving contact sheet” as an internal design description unless it helps the visitor. Draft the opening around service and photographic attention supported by facts; avoid inherited poetry or claims about luxury, timelessness, years, volume and guaranteed comfort.

Keep each local owner note to an action, the needed material and its content reference. Put detailed source/clearance guidance in the linked register while retaining the specific missing-content request at its intended location. Display gallery requests as one group until frame-level review is useful. Do not hide missing optional slots from the first owner review.

Confirm the public name/role and use of “I” or “we” before publication. Use the copy specification's canonical form states, including “Draft enquiry form. Add the receiving address before this can send.” Preserve source quotations and approved meaning while enforcing the user's no-em-dash rule in authored copy.

**Acceptance later:** Read the homepage, both stories and contact in order. A reviewer can distinguish the two occasions and identify the exact input needed at a missing slot. Scan source and decoded rendered text, accessible names, metadata and error states for U+2014. Check quotes against their source; do not count a clean scan as proof that copy is clear or true.

### D07 · P2 · Define story context and the minimum enquiry request

**Evidence:** The synthesis proposes carrying the selected story into an enquiry. The inventory proposes a name, reply channel, occasion, approximate date/place and note without deciding required fields. These are useful starting points, but the plan does not define how a visitor sees or changes the inherited story context. The current user cannot confirm the photographer's operating details.

**Correction:** Use the story as optional reference context, displayed as “Work you liked: [cleared project title]”, with a way to remove or change it. Do not convert that choice into an assumed package or booking request. Keep context out of personal-data URLs and avoid adding a required field merely to populate analytics.

For a provisional local form, require a reply destination and a short name; allow an unset date/place and an optional note. Confirm the primary reply method and useful qualifying fields with the responder before live integration. Do not require both phone and email by default. Preserve the fixed action label “Send enquiry” through validation and retry.

The draft remains non-sending until a real recipient and receiving contract exist. Show receipt only after the agreed recoverable system accepts the enquiry, and distinguish that state from response, availability and booking. Resolve any alternate contact link before offering it as recovery.

**Acceptance later:** Open the enquiry from each story and from the homepage. Confirm visible/editable context, honest unset values, keyboard/autofill behavior and input preservation after errors. Test receipt, unknown timeout, duplicate retry and operator retrieval using the reliability contract. These checks remain Not run.

## Recommended first comparison

Use the same two assignment roles, service note and enquiry task for A, B and C. Compare a phone opening, desktop opening and one story-reading sequence before expanding the rest of the page.

| Concept | Evidence to preserve | Risk to test | Recommendation status |
|---|---|---|---|
| A: Close to the people | Portraits with ceremony/family and celebration context from the wedding sample | The paired opening could crowd the phone or over-crop people; the two-story minimum could become an unnecessary catalogue | First exploration remains justified, subject to the corrections above. The user has not selected it. |
| B: Portraits with a person behind them | Close portraits and outdoor compositions, with a real account of guidance if supplied | A portrait-heavy edit could obscure the breadth of wedding coverage; a dark surface may change how viewers perceive the photographs | Keep as a comparison using the same representative work. No dark palette or guidance claim is approved. |
| C: A place for your story | Named Goa project and observed outdoor setting/closeness/movement | The team could imply a destination business or name unverified locations; scenery could displace the people | Compare as a couple-session treatment or focused page. Current travel services and commercial priority remain unknown. |

Ask a reviewer to identify the service, open relevant work, explain what they learned and find the enquiry path. Record observed confusion without steering the answer. This task can evaluate a build after authorisation; the team has not run it or measured conversion, preference or revenue impact.

## Integration and remaining checks

The coordinating agent accepted the seven findings and updated the design brief, synthesis, motion specification and [technical decision record](TECHNICAL-DECISIONS.md). These are planning corrections. Implementation and rendered acceptance remain pending.

| Finding | Disposition | Later evidence |
|---|---|---|
| D01 | Accepted in planning: two visible story links; project rail conditional on a larger edit | Built index and content-register agreement |
| D02 | Accepted in planning: one prioritised lead image, service context/work link around it, later companion | Real phone/desktop crops, missing states and request trace |
| D03 | Accepted in planning: explicit Play overrides its existing focus/hover state; new inspection pauses | Keyboard/pointer, visibility and reduced-motion tests |
| D04 | Accepted in planning: separate placeholder composition from original-image acceptance | Source/export comparison and rights/display checks |
| D05 | Accepted in planning: assignment-specific edit with no count/chapter quota | Curated original sequence and confirmed context |
| D06 | Accepted in planning: plain occasion labels, compact local requests, full shared checklist | Page-order copy review and COPY checks |
| D07 | Accepted in planning: visible/removable story context and minimal provisional fields | Built form states and ENQ-01 through ENQ-08 |

At the start of this review, concepts, fonts, palette, stack and routes were provisional. The architecture decision now selects Astro static output as the engineering default; visual choices and actual project titles remain open. Owner-confirmed identity, services, rights, current work, recipient and operating promises remain specific dependencies. The team can prepare labelled placeholders while those inputs are missing. Public release requires the corresponding clearance and functioning checks.

**Document checks:** seven ranked finding IDs, 11 valid local links and zero U+2014 characters. **Editorial self-assessment:** Directness 9, Rhythm 8, Trust 9, Authenticity 8, Density 8; **42/50**. This is a stop-slop self-review, not a user-comprehension result. Website and image-rendering acceptance remains **Not run**.
