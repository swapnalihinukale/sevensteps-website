# Seven Steps private draft

Direction A, Close to the people. This is a local review website with labelled image spaces, two story layouts, a gallery viewer, optional controlled movement and a shared content checklist. It contains no cleared portfolio images or live enquiry receiver.

## Run it

Use Node 22.23.2 and npm 10.9.8, independently of the held OpenDesign tools.

```sh
cd /Users/admin/Documents/Website/site
npm ci --ignore-scripts
npm run build
npm run preview
```

Open `http://127.0.0.1:4321/`. The server binds to this computer's loopback address. For editing, use `npm run dev`. Rebuild and reload when using the production preview.

## Routes

| Route | Purpose |
|---|---|
| `/` | Introduction, two stories, proposed approach and draft enquiry |
| `/stories/wedding-story/` | Wedding layout, viewer and movement preview |
| `/stories/couple-session/` | Couple session layout and enquiry with visible story context |
| `/content-checklist/` | 27 content groups, search, section filter and return links |
| `/404.html` | Missing-page recovery |

The draft has `noindex` metadata and a disallow-all robots file. Those are crawler instructions, not access controls. Do not upload this build to a public host or add uncleared private material to a shared preview.

## Supply and maintain content

The photographer uses the on-page Add notes and checklist. No upload or account is needed. Share originals with the builder in one folder per assignment, keeping filenames, and a document keyed by the checklist references. Include credits and the intended publication permissions. Do not put private permission correspondence or original archives in `public`.

`src/data/content.ts` is the live source for the 27 content records and two draft project records. The older Markdown slot inventory is the planning snapshot. `src/content.config.ts` applies Astro's schema validation; `scripts/content-check.mjs` validates IDs, relationships, readiness and publication decisions. Both the local notes and the checklist use this source.

Content can move through Needs content, Received: checking, Needs an update, Ready and Not needed. A received file is not automatically Ready. The builder checks facts, rights, image quality and placement before recording readiness. Optional exclusions need a reason. These state records are not a replacement for permission evidence kept outside the site.

The current photo component deliberately renders labelled spaces. Integration of cleared originals, responsive derivatives, alt text, crops and film playback is the next media slice. Do not label placeholder screenshots as the photographer's work. The current gallery length is a layout sample, not a required edit size.

## Enquiries and publication

The form accepts sample typing for review, but it has no endpoint or named payload fields. Its action stays disabled, and the controller prevents implicit submission. It stores no form values and makes no contact/provider calls. The story selector can be changed or cleared. Only the motion preference uses local storage, with a 30-day expiry and no personal data.

`npm run build:public` intentionally fails while content and publication choices remain unresolved. It first removes generated `dist` output so a failed command cannot leave a previous review build to publish by mistake. Direct Astro invocation with `PUBLIC_SITE_MODE=public` also refuses. Public rendering remains gated until the real media and receiving service release work is complete, even if somebody marks content records Ready.

Use the saved enquiry architecture for B03: confirmed recipient and data handling, server validation, durable receipt, atomic deduplication, notification recovery and real destination testing. No successful enquiry, availability or booking claim exists in this draft.

## Verify changes

```sh
npm run check
npm run test:unit
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
npm run budget
node scripts/dependency-report.mjs
node scripts/preview-measure.mjs
```

The browser tests run against the built preview. Stop unrelated processes on port 4321 or select the intended preview before running. The measurement script needs that preview already running. Test evidence and screenshots live under `docs`; Playwright retains failing traces in `test-results` and its HTML report in `playwright-report`.

Tests cover the actual private draft, including invalid content, publication refusal, finite navigation, focus return, movement interruption, reduced motion, absent JavaScript, font/storage failure, disclosure links, accessibility and viewport reflow. Physical Windows, iOS/iPadOS and Android devices, assistive technology and real-media delivery still require later checks. See the workspace [verification ledger](../docs/IMPLEMENTATION-VERIFICATION-2026-10-15.md) for results and limits.

## Implementation map

- `src/layouts/Layout.astro`: shared shell, navigation, review banner and motion preference.
- `src/pages/`: static documents and two story routes.
- `src/components/`: content notes, photo spaces, enquiry, arrows and gallery preview.
- `src/styles/global.css`: fluid composition, responsive styles and motion fallbacks.
- `src/scripts/ui.ts`: small native controllers for menus, viewer, motion and checklist.
- `src/lib/motion.ts`: finite motion state transitions and bounds.
- `tests/`: content/motion logic and browser journeys.

No React runtime, animation framework, third-party player, analytics tag or external font request is included. Local font licences ship in `public/licenses`. The [dependency record](docs/DEPENDENCIES.md) preserves exact pins and audit limits.

## Enquiry backend and local lab

Use `npm run test:server` for isolated native PostgreSQL tests and `npm run lab` for the synthetic form at `http://127.0.0.1:4322/`. The lab writes sample data to a temporary local database and sends no email. Native PostgreSQL 16 or newer is required; set `SEVENSTEPS_PG_BIN` if needed. Ctrl+C stops the lab and removes its database. `npm run test:e2e` starts its own lab, so stop a manually running lab before that command.

The server modules live under `server/`, provider adapters under `netlify/functions/`, and tests under `tests/server/`. The public form remains disabled. See [B03 implementation](../docs/BACKEND-IMPLEMENTATION-2026-10-15.md) for receipt, retry, activation and data-handling requirements. The test client keeps only a retry reference or receipt in session storage, with no personal form content; it fails before sending if that reference cannot be retained.

All changes use `feat/sevensteps-rebuild` on the original repository. The three original HTML files remain under `../website/`. See [Git workflow](../docs/GIT-WORKFLOW.md) before pushing or reverting.
