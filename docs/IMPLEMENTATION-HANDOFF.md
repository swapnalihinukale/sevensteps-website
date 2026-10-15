# Seven Steps implementation handoff

The user has chosen to review the current labelled-placeholder website before the photographer supplies real material. Preserve that experience. The private frontend, responsive image pipeline, gated public renderer and local synthetic enquiry backend are implemented. Public deployment and live provider activation remain pending.

The [execution plan](../EXECUTION-PLAN.md) owns task status. Use [the content-ready report](CONTENT-READY-IMPLEMENTATION-2026-10-15.md) and [B04 evidence](../site/docs/audits/b04-summary.json) for the implementation baseline at `8ef0d59`. Earlier B02/B03 reports describe their historical checks, not the current totals.

## Continue from the right guide

| Work | Start here |
|---|---|
| Owner review and feedback | [Review package](REVIEW-PACKAGE.md) and [owner inputs](OWNER-INPUTS.md). |
| Review upload package and hosting boundary | [Preview sharing](PREVIEW-SHARING.md). |
| Later handoff checks and native-browser limits | [Owner handoff verification](OWNER-HANDOFF-VERIFICATION-2026-10-15.md). |
| Fresh clone, editing and maintenance | [Maintainer guide](MAINTAINER-GUIDE.md), then [site commands](../site/README.md). |
| Visual design, responsive grids and motion | [Design system](DESIGN-SYSTEM.md), backed by [DESIGN.md](../DESIGN.md). |
| Claude/Codex continuation | [AI handoff](AI-HANDOFF.md), [AGENTS.md](../AGENTS.md) and [CLAUDE.md](../CLAUDE.md). |
| Approved content and photographs | [Public inputs](../site/content/README.md) and [media preparation](../site/docs/MEDIA-PIPELINE.md). |
| Future live operation | [Release runbook](LAUNCH.md), [provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md) and [measurement](MEASUREMENT.md). |

The owner can maintain the site with a developer or assistant using these local guides. Content updates use files and reviewable commits. The browser checklist displays requests and filters them; it does not upload content or save changes. No CMS or admin dashboard has been promised.

## Settled stack

| Area | Implemented choice |
|---|---|
| Frontend | Astro 7.3.8 static output, ordinary document navigation. |
| Language/runtime | TypeScript 6.0.3 strict, Node 22.23.2 and npm 10.9.8. |
| Styling/interaction | Native CSS, small TypeScript controllers, native dialog and disclosure controls. No React or animation runtime. |
| Images | sharp 0.35.5 builds AVIF, WebP and progressive JPEG from selected local web masters. Responsive sizes match actual layout geometry. |
| Fonts | Local Source Serif 4 and Source Sans 3, Fontsource Variable 5.3.1. Two normal Latin files total 77.94 KiB, with OFL notices retained. |
| Content | Canonical slot/project records for the review; allowlisted validated records for public templates. Assisted file editing. |
| Receiver | Netlify Functions 6.0.2, Netlify Database 2.0.1 and Resend 6.33.0 adapters. Local behavior is implemented and tested; live activation is separate. |
| Tests | Node runner, native PostgreSQL, Playwright 1.64.1, axe-core 4.13.0 and Astro check 0.9.10, with content/copy/link/file-budget/security checks. |

[The package manifest](../site/package.json) and lockfile are authoritative for installed pins. Native PostgreSQL 16 or newer is a test prerequisite; the pg package alone does not install it. The maintainer guide has setup and operating-system limits.

CI validates the single branch without publishing or using live secrets. The selected static/Functions architecture does not need a container image, registry or cluster. Image preparation refers to photography derivatives produced before serving the pages.

## Selected visual direction

**Close to the people** pairs a lead photograph with a related moment, keeps two complete stories visible and provides a clear enquiry path. Desktop areas are unequal. Phones show service context and a work link before the lead frame and companion. The composition works with controlled motion disabled.

Paper `#FAFAF8`, Ink `#242422`, Leaf `#405B4B`, Pomegranate `#722F46` and Mist `#E5E7E3` remain the working palette. Source Serif 4 handles headings and Source Sans 3 handles reading and controls. The [design system](DESIGN-SYSTEM.md) records the actual token keys, type scale, gutters, breakpoints, focus treatment and timings. Changes to grid geometry also need changes to `image-sizes.ts` and its browser geometry checks.

These are selected private-draft choices. They do not establish owner-approved branding, permitted work or business facts. Keep the muted photo mats labelled until real images receive their checks.

## Implemented behavior and boundaries

- The ordinary review serves the homepage, two story routes, recovery page and 27 content groups. All real slots remain unresolved; the form stays disabled and non-sending.
- Menu and viewer controls support keyboard use, Escape, focus restoration and responsive reflow. No-JavaScript visitors retain ordinary links and essential content.
- Optional gallery movement begins with Play and makes one finite pass. Inspection, layout changes, hidden pages, image failure and reduced motion pause it. The operating system's reduced-motion preference wins.
- The image pipeline strips metadata, applies orientation/sRGB conversion, bounds derivatives and preserves full-frame links. Synthetic geometric fixtures test behavior without claiming photographic fidelity.
- Public templates already omit review notes and the checklist route. Canonical/social metadata, sitemap and robots come from checked public data. Exact asset allowlists and hashes reject stray or changed files.
- Public builds still refuse absent owner content, canonical readiness or release approval. Test output cannot satisfy those gates. The current public-template contact option is a confirmed email link with privacy and follow-up wording.
- The local backend commits a durable receipt and outbox, handles idempotent retries and provider-event ordering, and supplies operator recovery views. The designed integration lab uses temporary PostgreSQL and fake notifications. Actual provider delivery and restoration remain unverified live-service work.

Review text and placeholder calls remain in the review templates. A Ready status or a new public JSON file does not replace them. Wire actual approved content into the intended review component when that work is authorized, keeping clear notes for unresolved items.

## Recorded verification at 8ef0d59

| Check | Result |
|---|---|
| Unit tests | 41 passed. |
| Image pipeline | 17 passed. |
| Native PostgreSQL/backend | 99 passed. |
| Browser journeys | 126 passed in Chromium, Firefox and WebKit, with no failures, retries or skipped cases. |
| Astro | 64 files, zero errors, warnings or hints. |
| Image geometry | Declared sizes matched actual widths within 2px at 12 viewports from 320 to 2560px. |
| Repository sharing guard | Eight focused tests; staged/working/unignored files checked for unsafe sharing. |
| Build boundaries | Public/direct-build refusal and hosted test-mode rejection passed; the normal review output was restored. |

The review shell measured 94.77 KiB and the fixture shell 92.48 KiB. Both include 3.70 KiB gzip JavaScript and 77.94 KiB of fonts. These conservative file envelopes exclude images and do not establish real-photo transfer or field performance. Advisory results are dated snapshots in the evidence, not permanent clearance.

A limited native Safari 27.0.1 check covered 200% browser zoom, menu reflow, gallery keyboard navigation and Escape. Physical Windows/mobile/tablet, screen-reader, real photographic quality/transfer and live-provider checks remain explicit release work. A new clone should report its own run results rather than inherit these as freshly verified.

The later focused browser run passed 27 cases: nine new review-package cases and 18 designed-form repeats. It does not replace the dated 126-case baseline or establish a full-suite/CI result. The owner handoff report adds bounded Chrome 400% zoom and Safari text-enlargement observations. It records incomplete journeys, uncertain keyboard timing and no reliable Safari text-only percentage. VoiceOver output was unavailable, so screen-reader verification remains incomplete.

## Next work follows actual inputs

| Work | Required input and action |
|---|---|
| Current owner review | Use the existing labelled version and collect feedback against routes/slot IDs. Prepare and test the upload package with the preview-sharing guide. Localhost is not remote access; separate hosting and authorization remain necessary. |
| Real stories and identity | Obtain permitted originals, exact public names, assignment context and credits. Update the canonical slots, integrate selected records and inspect actual crops/quality/budgets. |
| Services and process | Edit the owner's confirmed facts into the existing sections. Record optional omissions and avoid invented prices, reviews or response commitments. |
| Confirmed contact | Verify the intended mailbox and responder, privacy wording and follow-up process before enabling its public link. |
| Real-content candidate engineering | Implement a guarded, isolated local candidate path before release approval, as required by release step 3.5. The current public gate requires completed release evidence; review and fixture modes do not provide this candidate. This is unfinished maintainer work. |
| Live enquiry form | Complete business-controlled accounts, domain/sender authority, accepted costs/data handling and ENQ-01 through ENQ-08. Verify operator retrieval and recovery before activation. |
| Public release | After the candidate path exists, review its exact real-content output, complete remaining device/accessibility/operating gates, approve the candidate and follow the release/rollback runbook. Do not fabricate approval evidence to obtain a preview. |

These inputs do not reopen the chosen framework or require speculative features while the owner reviews. Keep changes on `feat/sevensteps-rebuild`, preserve the original `website/` files and use [safe reverts](GIT-WORKFLOW.md).

Use the local [photographer adapter](../.agents/skills/photographer-design-codex/SKILL.md), [frontend-design](../.agents/skills/frontend-design/SKILL.md) and [stop-slop](../.agents/skills/stop-slop/SKILL.md). The copied skills and licences support a fresh clone with Claude or Codex. OpenDesign's executable runtime stays on security hold. Apply the project's no-em-dash rule to authored text and keep private originals, credentials and correspondence out of Git and public artifacts.
