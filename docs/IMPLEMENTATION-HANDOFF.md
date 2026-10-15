# Seven Steps: implementation handoff

The newer [content-ready implementation report](CONTENT-READY-IMPLEMENTATION-2026-10-15.md) records the image pipeline, public rendering and designed local enquiry integration. The stack and palette below remain selected; the numerical B02 baseline is historical.

15 October 2026. The first private milestone is complete and running locally. The [execution plan](../EXECUTION-PLAN.md) owns task status; the [verification ledger](IMPLEMENTATION-VERIFICATION-2026-10-15.md) owns the test evidence. This handoff records the settled choices so the next implementation step does not restart design or framework selection.

## Fixed stack

| Area | Choice and reason |
|---|---|
| Frontend | Astro 7.3.8 static output. Deliver readable HTML before JavaScript and keep portfolio pages cheap to serve. |
| Language | TypeScript 6.0.3, strict source checking, Astro component templates. |
| Runtime | Node 22.23.2 and npm 10.9.8; exact dependency pins and one independent package lock under `site`. |
| Styling | Native CSS: grid/flex, fluid type and spacing, responsive breakpoints, container-query enhancement, safe-area support and reduced-motion fallbacks. No styling runtime. |
| Browser behavior | Small TypeScript modules and native controls. Ordinary links, disclosures, a dialog viewer and one optional gallery strip. No React adapter, client router, animation framework or page-scroll hijacking. |
| Content | Typed slot/project records plus Astro schema validation. Assisted file-based updates. No CMS for the first release; reconsider only if a confirmed maintainer needs self-service editing. |
| Fonts | Local Source Serif 4 and Source Sans 3, Fontsource Variable 5.3.1. Only the two normal Latin weight-axis files load, 77.94 KiB combined. Original OFL notices are included. |
| Testing | Node test runner, Playwright 1.64.1 across Chromium/Firefox/WebKit, axe-core 4.13.0, Astro check 0.9.10, static link/copy/content checks, dependency/licence scans and explicit byte budgets. |
| Future live service | Netlify static hosting + separate Netlify Functions + Netlify Database PostgreSQL + Resend. The [provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md) fixes transaction, deduplication, recovery, regions and preview isolation. It adds no live integration to the current draft. |

The installed dependency manifest and lockfile are the authority for package versions. The local B03 follow-up now includes exact server package pins and an updated audit, recorded in its implementation report.

## Fixed visual direction

Direction A, **Close to the people**, uses the selected research direction: one lead photograph with a related human moment, two visible full-story choices and a clear route to an enquiry. Desktop image areas are unequal; phones show service context and a work link before the lead frame, with the companion later. The design does not depend on a full-screen opening or a carousel to reveal the second story.

| Token | Hex | Role |
|---|---|---|
| Paper | `#FAFAF8` | Main reading surface |
| Ink | `#242422` | Headlines and body text |
| Leaf | `#405B4B` | Primary actions and quiet structural colour |
| Pomegranate | `#722F46` | Small brand accent, focus and owner guidance |
| Mist | `#E5E7E3` | Draft notice, supporting surfaces and control areas |

The palette supports the photographs without imposing gold, heavy gradients or a dark luxury template. The muted rose, sand and green image spaces are explicit placeholders, not a claim about real image colours. Replace them with cleared photographs and check each crop, skin tone and text overlay again.

Measured opaque text contrast on Paper is 14.88:1 for Ink, 7.14:1 for Leaf and 9.09:1 for Pomegranate. On Mist those values are 12.49:1, 5.99:1 and 7.63:1. These token pairs do not certify every future composition. The current rendered axe checks pass, including the corrected placeholder labels and opaque menu entry.

Source Serif 4 handles headings and story pacing; Source Sans 3 keeps navigation, captions and forms readable. Both share a coherent type family lineage. Bounded sizes, readable lines and responsive spacing carry the layout. A future Marathi or rupee-glyph requirement needs an appropriate checked subset or fallback, without changing accurate names to fit the font.

## Fixed interaction and content rules

- Galleries begin still. Play allows one bounded horizontal or vertical pass, with visible pause/reset, direction and speed controls. New inspection, leaving view, layout change, modal entry and reduced-motion changes stop movement. No automatic restart follows inspection.
- The operating system's reduced-motion choice wins. The explicit Full/Still preference works without storage; essential content works without JavaScript.
- Menus and viewers use stationary controls, keyboard navigation and visible focus. The opaque panel moves briefly; its text does not fade into an unreadable state.
- The 27 Add/Replace notes and checklist share one source. Each checklist item links back to its page location. All 27 currently need content, and the form remains non-sending.
- Use stop-slop and no em dashes in authored UX, metadata, accessible names, notes or errors. Never invent awards, prices, testimonials, availability, team size or delivery promises.
- Keep real originals and private permission correspondence outside public assets. Build responsive delivery files only from cleared media, then test actual image quality and transfer sizes.

## Current verification

The final private run passed 51 browser checks, 19 logic tests, strict type/content/copy checks and 178 static local links/assets. It covers five documents, key interactive states, absent JavaScript, font/storage failures and the recorded widths from 320 to 2560 CSS pixels with breakpoint neighbours and short landscape windows. The independent source and rendered private reviews have no open blocking findings.

The final artifact contains 3.03 KiB compressed JavaScript, 6.34 KiB compressed CSS and 77.94 KiB of fonts. The conservative page shell is 94.08 KiB. Full and production dependency audits report zero known advisories at the recorded snapshot. Exact evidence, scanner limits and placeholder-only performance measurements are in the ledger. Physical-device, assistive-technology, real-media and live-receipt checks remain release gates.

## Remaining work has a defined entry condition

| Next work | Required input | Execute when it arrives |
|---|---|---|
| Brand and real stories | Exact public identity, permitted originals, assignment context and credits | Update the canonical slots, integrate derivatives, inspect composition and run real-media budgets. |
| Business copy | Actual services, process, useful FAQ/reviews and any agreed price presentation | Edit the existing sections, remove optional sections the owner declines and verify facts/copy. |
| Live enquiry | Business-controlled accounts, fixed recipient, domain authority, approved spending and data handling | Follow the fixed provider decision and ENQ-01 through ENQ-08. Test durable receipt and operator recovery before activation. |
| Public release | Cleared content, accepted processors, completed device/assistive checks and release authorization | Implement the public content export, confirm absence of draft/private fields, deploy the exact tested artifact and run the documented rollback/smoke checks. |

These are external facts and acceptance gates, not unresolved framework or design alternatives. The user does not know the photographer personally, so internet research cannot substitute for their account authority, rights or retention policy. Keep building independent work; do not invent those answers or activate a guessed contact destination.

## Skills and tools at execution

Use the project [Codex design adapter](../.agents/skills/photographer-design-codex/SKILL.md), pinned [frontend-design](../.agents/skills/frontend-design/SKILL.md) and [stop-slop](/Users/admin/.codex/skills/stop-slop/SKILL.md). Apply the portable OpenDesign typography, colour, accessibility, state and animation references at the relevant surface. The OpenDesign executable runtime remains on security hold and is not an application dependency. Use browser automation for rendered review, the installed test scripts for regressions, and the PDF skill only when a real PDF arrives. The execution plan contains the full stage-to-skill map.

Start from [site/README.md](../site/README.md) for commands and the file map. Keep this build local until the release conditions are met.

## B03 local implementation follow-up

The local enquiry backend and synthetic browser lab are implemented. Follow [B03 implementation](BACKEND-IMPLEMENTATION-2026-10-15.md) for current checks and integration gates, and [Git workflow](GIT-WORKFLOW.md) for the single branch and reversible commits. The existing private UI remains non-sending.
