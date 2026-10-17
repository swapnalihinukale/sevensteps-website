# Seven Steps technical decisions

**Updated 17 October 2026:** The Astro draft, public templates, image pipeline and local enquiry backend exist in `site/`. Direction A remains selected. The portfolio grows from content within one site; see [verification](../EXECUTION-PLAN.md#17-october-verification). The fixed B03 platform is Netlify static/Functions/Database with Resend, as recorded in [the provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md). B06's real-content candidate preview, controlled media provisioning and live activation remain unfinished.

## Decision

Build the portfolio with **Astro static output, TypeScript and native CSS**, with small browser modules for the interactions that need them. Use ordinary page navigation. Keep the live enquiry receiver separate from page rendering.

Use an isolated application workspace and lockfile. Do not inherit packages, Node tooling or runtime configuration from the OpenDesign checkout. Its runtime remains on security hold; the copied design references remain usable.

The [independent architecture review](ARCHITECTURE-REVIEW-NOTES.md), [enquiry review](ENQUIRY-ARCHITECTURE-REVIEW.md) and [prebuild design review](PREBUILD-DESIGN-REVIEW.md) support these decisions. This document records the resolution where those reviews compare alternatives.

## Framework and delivery choices

| Decision | Default and reason | Revisit trigger |
|---|---|---|
| Portfolio rendering | Pre-render Astro pages at build time. The site needs shared layouts, typed content and image processing, with little client-side state. | Confirmed accounts, client portals or other per-user application behavior. |
| Client code | Small TypeScript modules compiled to browser JavaScript. Use Astro components for markup, native controls and CSS for layout/motion. No React adapter or global state library in the first build. | A specific interaction exceeds the native approach, and a measured comparison justifies its dependency cost. |
| Navigation | Normal links and browser history. Add supported native View Transitions as an enhancement after the core works. Do not install Astro's ClientRouter for a transition alone. | A demonstrated navigation/state requirement that warrants client routing and its lifecycle tests. |
| Content | Astro content collections with schema-checked project/media records. Preserve the existing slot IDs and readiness workflow. Use structured data and plain text; add restricted Markdown only for longer approved notes. | A maintainer needs frequent self-service editing. Evaluate a CMS then. |
| Styles | Tokens for colour, type, spacing and motion; component CSS; fluid layout and content-based breakpoints. Native scroll overflow, dialog/disclosure and progressive CSS enhancements. | A concrete reuse/maintenance problem, with a comparison of generated CSS and accessibility behavior. |
| Build environment | Use one supported Node LTS line, a compatible pinned npm version and one committed lockfile. Select exact patches after fresh support/advisory checks when implementation starts. | A supported Astro release changes its runtime requirements or a security update requires a pin change. |
| Static hosting | Use a CDN/static host. Netlify is the first integration candidate because it supports static Astro and isolated functions; the existing draft URLs do not establish ownership, budget or final selection. | Account, regional/data, operating-cost or deployment constraints favor another provider. Static pages remain portable. |
| Live enquiry | Keep the strict ENQ-01 through ENQ-08 contract. Use an isolated same-origin handler with a transactional managed store and a store-backed notification outbox. | A managed form provider supplies and passes the required receipt, validation, retry and spam behavior. |
| Films | Use a cleared poster and load the selected player after intent. No page-entry film download or custom streaming/transcoding service. | The photographer supplies a film catalogue with requirements that justify a separate media service. |

Next.js can produce a static portfolio, but its client navigation and static-export constraints add choices this project does not need. Plain Vite with several HTML pages can work, but the developer would need to create more content/schema/page-generation conventions. Neither comparison proves a performance result. Astro is the selected engineering default because its components, collections and image pipeline fit this scope.

Select maintained package versions at the installation step, review lifecycle scripts and licences, then audit the complete locked tree and production subset. This architecture choice does not certify Astro, Sharp, npm or any future test package as secure.

## Minimum site and component boundaries

Use one website and domain. Share `/` as the main visitor entry point, with exactly two featured assignments and links to `/stories/<id>/`. Generate `/stories/` as an archive once the public collection has more than two stories. Generate detail routes, navigation and sitemap entries from the same content. The ordinary review keeps its two placeholder stories, recoverable 404 and review-only `/content-checklist/`. Developer preview and test ports do not define additional public websites.

| Component or boundary | Responsibility | Exclusions |
|---|---|---|
| Page layout and navigation | Landmarks, page metadata, skip link, navigation, footer and focus behavior | No full-page animation gate or client router by default. |
| Photograph | Intrinsic size, selected derivatives, crop/focal metadata, caption/alt/credit and loading priority | No raw original archive, unapproved image download or arbitrary remote URL processing. |
| Story entry and story page | Clear occasion/title, cover, ordered frame references, factual context and an enquiry link | No third project invented to fill a grid, no category filtering for two assignments. |
| Image viewer | Lazy enhancement of a real image link; fixed controls, active image, close/Escape, focus return and failure recovery | No global arrow-key capture, automatic catalogue preload or queued animation backlog. |
| Motion controls | Full/Still preference, explicit Play/Pause, one optional image strip and lifecycle handling | No motion of essential text or the main page; no simultaneous horizontal and vertical loops. |
| Enquiry UI | Minimal fields, visible/removable story context, pending/receipt/error/uncertain states | No provider credentials, pretend receipt, presumed package or automatic booking. |
| Receipt service | Server validation, abuse limits, atomic deduplication, durable receipt and notification recovery | No portfolio rendering, public client uploads, payment system or custom admin portal. |
| Content slot and checklist | One readiness record per existing slot; local Add/Replace notes and shared completion state | No parallel stale lists or a page per slot. |

Keep the first phone opening usable at narrow and short heights. Show brand/service context and one work link around the lead image. Place the companion after that context. Avoid a compulsory full-viewport hero. The layout must preserve faces and gestures once original images arrive.

## Content, assets and preview separation

Define four records before component work: site identity/contact, project, photograph and content slot. Use stable IDs and validate cross-references, unique public slugs, dimensions and readiness. A project references one assignment's ordered photographs. A slot can refer to the same photograph as a story cover without requesting a duplicate asset.

The 17 October public contract accepts 2 to 24 stories with unique IDs matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`, from 1 to 80 characters. Retain `wedding-story` and `couple-session` for the existing 27 checklist records. Add assignments through `content/public.json` and their image inputs. Optional `home.featuredStoryIds` contains exactly two distinct existing IDs in homepage order; omission selects the first two stories. The `stories` array controls archive order and next-story links, wrapping from last to first. Keep the static architecture and existing packages; no CMS is required.

The four-story fixture uses synthetic content to exercise archive growth and remains outside ordinary review and public output. This does not complete B06: a guarded real-content candidate still needs to render before release approval without weakening the production gate.

During implementation, migrate the 27-slot Markdown register into one schema-backed content source and generate the draft notes/checklist from it. Retain the current inventory as the planning record or a generated snapshot; do not require editors to keep two live registers in sync.

Keep rights correspondence, confidential source references and originals outside public assets and client bundles. Prepare a small set of permitted web masters, then use Astro's asset pipeline or a reviewed build step for derivatives. Inspect metadata stripping, orientation, colour, skin tones, fabric and low-light detail. Store or retrieve those web masters through a documented process that a clean build can reproduce. Do not accept owner-supplied MDX or unrestricted HTML as ordinary content.

Use explicit **review** and **public** build modes. Review mode permits missing content and includes the checklist and Add/Replace notes; its form stays non-sending. Separate integration labs use synthetic enquiries and local notification doubles. Public mode exports only whitelisted public fields, omits review routes/notes and fails if retained required identity, work or contact content is unresolved. Check HTML, scripts, JSON, source maps and metadata for leakage. Hiding notes with CSS is insufficient.

Use synthetic data for test/preview receiving systems. A provider's automatic database preview branch may copy production data. Prevent that behavior or use an empty isolated database before deploying previews. Confirm preview access controls for any uncleared material; noindex does not restrict access.

## Image, font and motion budget

Keep the existing combined budgets: target at most **350 KiB critical transfer**, **900 KiB cold entry**, **80 KiB initial compressed JavaScript**, **30 KiB CSS**, **35 KiB HTML** and **100 KiB initial fonts**, under the conditions in the [performance research](INTERNATIONAL-AND-PERFORMANCE-RESEARCH.md). These are design targets, not measurements. The component ceilings cannot all be consumed if the combined entry limit is exceeded.

Prioritise one lead photograph. Generate a bounded width set from the actual layouts, with correct sizes/srcset and intrinsic dimensions. Request the companion and nearby images within the measured entry allowance. Preloading both art-direction variants or a complete slideshow would defeat that plan. Keep natural aspect ratios in the story where possible and provide a full-frame viewing path when a cover crop removes context.

For the selected font pair, ship only needed files, scripts and weights. Check glyph coverage before any Marathi or other language addition. A proposed font name does not establish a licensed, correctly subsetted asset. Optional films, social feeds, maps and chat must not consume startup bytes by default.

Add menu/viewer transitions and arrow feedback first. Add one user-played strip only after the baseline stays within budget. The two-story index uses visible links; M04's project rail remains an expansion option. Horizontal and vertical strips remain alternatives. Native View Transitions and scroll-driven effects need feature checks, reduced-motion behavior and normal-link/static fallbacks.

Explicit Play must work while its control retains keyboard focus or pointer hover. Treat a subsequent inspection event as a pause, not the focus state that resulted from activating Play. Backgrounding, leaving view, opening a modal, reduced-motion changes or a failed next image still stop progression. A paused component stays paused until the visitor resumes it.

## Live enquiry contract

Static Astro output cannot handle a future visitor's POST by itself. Keep that receiver in an isolated function or service at the same origin. The ordinary review remains non-sending; the local B03 labs use synthetic data.

Retain the strict contract. The managed Netlify Forms documentation establishes submission storage and notifications, but it does not establish the required atomic idempotency and arbitrary server-side validation; its honeypot can silently reject submissions. The [enquiry review](ENQUIRY-ARCHITECTURE-REVIEW.md) records why it is not the selected baseline under these requirements.

Use a small receipt handler and one managed transactional store, with an outbox in the same store. A managed PostgreSQL service is a suitable default class. Netlify Functions plus Netlify Database and Resend are selected for B03 under [the provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md); verify the actual account, billing, preview isolation and data-handling conditions before activation. Function adapters and local database tests exist; live services remain unverified.

1. The browser sends bounded fields, a random per-submission idempotency token and optional public story ID. Display that story context so the visitor can remove or change it. Require a short name and one reply destination in the provisional form; allow uncertain date/place and an optional note. Confirm the useful fields with the responder before live integration.
2. The handler validates types, lengths and allowed fields and applies bounded abuse controls. Optional story context must match the safe slug syntax above; accept past story IDs so catalogue changes do not invalidate retries. Treat the ID as untrusted context, not proof of client identity or an assignment. Insert the enquiry and an outbox record in one transaction, with a unique key for the logical submission. Define key scope/lifetime. Reuse with conflicting content returns a safe conflict state rather than silently changing an existing enquiry.
3. Return a stable receipt result after the transaction commits. A concurrent request or retry with the same key returns the existing result without adding a second logical enquiry. Return only the necessary status/reference; do not expose stored personal data through a guessable status endpoint.
4. Dispatch notification after commit. A worker claims the outbox item with bounded retries and records provider acceptance/failure. Require documented provider idempotency or a tested equivalent that passes ENQ-03 and ENQ-05. Keep retries within its guarantee and reconcile unknown outcomes outside that window. If the guarantee is unmet, keep live activation blocked under the current contract; a weaker path needs an explicit scope/contract change. Provider acceptance does not prove final inbox delivery.
5. Preserve failed notifications for the named operator's recovery. Prefer a post-commit attempt plus a repair sweep suited to the provider's billing and failure tolerance. Frequent polling can keep a sleeping database awake. Do not assume a zero-cost workload or introduce a second queue service without need.

Use a provider's existing restricted dashboard/export capability or an agreed operator retrieval process for recovery; the initial scope does not include a custom admin portal. Confirm that the responder can find and act on stored enquiries before launch. Keep real enquiry text and contact data out of logs, analytics and URL query strings.

A server function returning 202 for queued work is not a receipt until the agreed durable condition exists. Do not treat a disabled submit button or a honeypot as server-side deduplication. Rate-limited or rejected visitors need an understandable recovery state. Spam classification and notification failure must not turn into invisible loss of legitimate records.

The enhanced form can use JSON POST. If JavaScript fails or is disabled, show a confirmed direct-contact alternative; do not claim no-JS form submission unless a native receiver and its token/receipt path have been implemented and tested. Keep ordinary portfolio content and navigation usable.

## Implementation order and acceptance

| Slice | Scope | Acceptance for this slice |
|---|---|---|
| 1: foundation | Separate app runtime/lockfile, Astro static output, content schemas, review/public modes and two story routes | Clean build; required/optional readiness rules; no draft or private field leakage into public output; COPY-01. |
| 2: reading experience | Header, mobile opening, two visible work links, one complete story template and contact section | Native navigation, missing-content states, keyboard/zoom and sampled widths; coherent mobile order. |
| 3: real media | Process permitted originals; verify variants/crops/fonts | Image quality and actual request budgets. A placeholder pass does not satisfy this slice. |
| 4: interaction | Viewer, arrows, menu, motion preference and optional played strip | Focus return, rapid actions, Play/focus rule, reduced motion, visibility/failure lifecycle; compare traces to the baseline. |
| 5: live enquiry | Isolated receiving service once provider, recipient and data handling are confirmed | ENQ-01 through ENQ-08 with controlled failure injection, then an agreed real receiving test. |
| 6: release candidate | Full copy, dependency, browser/device, accessibility, performance and recovery checks | Complete V01 evidence for one artifact, then authorized L01 release and smoke checks. |

The slices describe a work order, not a requirement to wait for originals before interaction work. Build layout, viewer and motion-state behavior with labelled placeholders while real-image quality and byte-budget checks remain pending. Final code and rendered-design review is V02; complete it before public release.

Select the smallest useful test set: schema/content validation, nontrivial enquiry/retry/motion state logic, integration tests for receipt failures, Playwright for critical journeys, axe-core plus human keyboard/assistive checks, and controlled performance traces. Audit test/build dependencies as well as production dependencies. Use dated evidence for completed runs; the earlier results do not verify the 17 October structure change.

## Decisions still requiring external facts

Owner facts: public identity/role, desired work, cleared originals and reviews, actual services, recipient/responder, response promises, retention and editing responsibility. Account decisions: intended domain, hosting authority, provider terms/cost/data handling and deployment credentials. Direction A is selected and implemented for the private draft.

These do not prevent the technical decisions above or an authorized private build. They do prevent claims about cleared images, live receipt, public readiness or measured business outcomes. Reopen an architectural choice only when one of those facts changes its reason.

## Verified documentation and model check

The root review checked the Astro [islands](https://docs.astro.build/en/concepts/islands/), [rendering](https://docs.astro.build/en/guides/on-demand-rendering/), [collections](https://docs.astro.build/en/guides/content-collections/), [images](https://docs.astro.build/en/guides/images/), [View Transitions](https://docs.astro.build/en/guides/view-transitions/), [Netlify deployment](https://docs.astro.build/en/guides/deploy/netlify/) and [TypeScript](https://docs.astro.build/en/guides/typescript/) documentation through public HTTP on 15 October 2026. The rendering request started at the older rendering-modes URL and redirected with HTTP 200; a later direct request returned 403. The independent review records its own successful documentation reads. These checks establish documentation access, not an installed dependency or working website.

The app host catalogue listed GPT-6.1 Sol, but an isolated inference probe requested with `gpt-6.1-sol` at Low failed with **404: The API deployment for this resource does not exist**. The first dispatch attempt hit the agent limit; a later dispatch reached the provider and returned this failure. Do not infer that Sol works in the current provider setup from the catalogue. This does not establish its availability elsewhere or the cause of the deployment mismatch. The agent did not alter model/provider settings. UI inspection of Codex was blocked by the computer-use tool, so the model-picker selection was not verified. Continue this review in the user's current session; retest Sol after its configured deployment changes.

## Completion boundary

The architecture and prebuild design review support the existing implementation. Check CI for the branch commit you use. B06's real-content preview, real-media and device checks, live activation and final release review remain open in [the work plan](../EXECUTION-PLAN.md). Continue from the code and recorded research.
