# Seven Steps copy and voice

15 October 2026. Apply the user's [stop-slop skill](/Users/admin/.codex/skills/stop-slop/SKILL.md) when drafting or reviewing project prose, owner instructions and website text. Read its [phrase guidance](/Users/admin/.codex/skills/stop-slop/references/phrases.md), [structure guidance](/Users/admin/.codex/skills/stop-slop/references/structures.md) and [examples](/Users/admin/.codex/skills/stop-slop/references/examples.md). Follow the user's no-em-dash instruction and the skill's core rules where an example conflicts.

The agent has prepared this copy specification for the planned website. Website copy tests remain **Not run** until an implementation exists.

## Write for the person using the page

Help a couple judge the photographer's work, understand the service and enquire. Help the photographer supply the missing material in the owner-review version. Use their vocabulary. Keep implementation terms out of public copy.

Use active voice and concrete verbs. Name the person taking the action where that helps. Cut filler, intensifiers, rhetorical questions and generic claims about excellence. Vary sentence length. Retain technical conditions and uncertainty when they affect the truth of a statement.

Ground public copy in cleared work and confirmed operating facts. Ask the photographer for specific observations about an assignment or client preparation. Edit those facts into the page. A writing skill cannot supply a genuine testimonial, a delivery promise or a biography.

Use sentence case for navigation, buttons and notes. Keep an action's name consistent through its flow. Show the next action with a plain verb. Choose the photographer's public use of “I” or “we” after confirming their voice and role; neither choice establishes a team size.

## Punctuation and text coverage

Use no em dashes, Unicode U+2014, in authored project prose or website UX. Restructure the sentence with a full stop, comma, colon or parentheses. Do not replace each em dash with a double hyphen or another dash used in the same way.

Apply the rule to headings, body copy, navigation, button text, captions, Add/Replace notes, status messages, field help, validation errors, receipt/retry states, film states and the content checklist. Include image descriptions, accessible names, page titles/descriptions, social previews and structured data. Check translated copy if the project adds another language.

Keep source quotations and licence/provenance records intact. For a testimonial containing an em dash, choose an accurate excerpt without it or obtain a punctuation edit the client accepts before publication. Keep the original in the source record. Do not change a quote's meaning to satisfy a style check.

Third-party source files, raw audit evidence and upstream skills are reference material. Their punctuation does not set the project's voice. Avoid copying it into the website.

## Working vocabulary

Use these examples as proposed UX text. Match the [replacement specification](CONTENT-REPLACEMENT-UX.md) and [slot inventory](CONTENT-SLOT-INVENTORY.md) when those files give a more specific request.

| Surface | Proposed copy | Condition |
|---|---|---|
| Owner-review notice | “Website draft. Add the missing photos and details using the content checklist.” | Show while preparing the private review version. |
| Checklist action | “View content checklist” | Open the shared checklist. |
| Empty hero | “Add your opening photograph.” | Request an original and refer to `HOME-HERO-01`. |
| Unsuitable supplied image | “Replace this photograph with the original file. This copy is too small for the opening image.” | Use after checking the supplied resolution and intended display. |
| Missing story context | “Add the names and location you can publish.” | Allow a non-identifying title if needed. |
| Received owner material | “Received: checking” | The agent still needs to check facts, rights or display quality. |
| Completed owner slot | “Content added: ready” | The agent has completed that slot's checks. |
| Draft form | “Draft enquiry form. Add the receiving address before this can send.” | The draft must not transmit or claim receipt. |
| Primary enquiry action | “Send enquiry” | Use once the sending path works. The draft keeps its adjacent explanation. |
| Missing reply address | “Enter an email address so we can reply.” | Use if email is the chosen reply field. Adapt to the selected contact method. |
| Pending request | “Sending your enquiry…” | A request is in progress. Apply the documented timeout. |
| Unknown receipt after timeout | “We could not confirm receipt. Try again.” | Retry must preserve input and prevent duplicate enquiries. |
| Confirmed receipt | “We have received your enquiry.” | Use only after the agreed receiving system stores a recoverable record. Confirm the brand's voice before publication. |
| Missing film | “Add a film” with “Film not added yet” | Show in owner review with the required source/credit request. |
| Public film failure | “This film could not load. Try again.” | Provide a working retry or confirmed alternate viewing link. |

The developer must match each status to the actual outcome. A plain sentence can still make a false promise. Keep receipt, notification, response, availability and booking separate.

## Copy review at execution

| Check | Run it at | Evidence to retain |
|---|---|---|
| COPY-01: source text | C03 drafting and B02/B03 changes | Scan owned content and string sources for U+2014. Check raw or escaped forms that could render it, including HTML entities and Unicode escapes. Review each match. |
| COPY-02: voice and facts | C02/C03 proposals; B02/B03 copy review | Read the text in page order. Cut filler and generic claims; confirm names, terms and promises against the content register. Record unresolved facts as content gaps. |
| COPY-03: rendered states | V01 on the production build | Inspect decoded visible text, accessible names, image descriptions and metadata. Open menu/viewer/form/error/empty states and direct routes. A source-only search cannot catch text from a CMS, dependency or encoded string. |
| COPY-04: public handoff | L01 release review | Reconcile the content register, remove owner-review notes from the public version and repeat the checks on the exact release candidate. Preserve the draft's checklist for handoff. |

During implementation, add a small copy check to the selected build/test scripts. Include content inputs and rendered output; scope it to text the site presents. Do not fail on unused punctuation in a vendored licence, package source or raw research record. Do not change vendor code or weaken integrity checks to remove a text match.

Treat an em dash in authored UX as a defect to fix before acceptance. Check the reader's task by hand as well: a string scan cannot judge tone, clarity or factual accuracy.

For prose review, score Directness, Rhythm, Trust, Authenticity and Density from 1 to 10 using stop-slop. Revise below 35/50. Record this as an editorial self-assessment, not an AI detector or proof of user comprehension. Keep the score in internal review notes.

## Current result

The agent has specified COPY-01 through COPY-04. Future website runs remain **Not run**. The execution record holds the separate checks on the current planning files. Read the stage-specific skill/tool map in [the execution plan](../EXECUTION-PLAN.md) before each task.
