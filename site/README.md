# Seven Steps application

Direction A, **Close to the people**. The current owner review has labelled photo spaces, two story layouts, a viewer, controlled movement and a shared 27-group content checklist. The user has chosen to review this version while real material is pending. Keep the ordinary review non-sending.

The responsive image pipeline, public templates and local synthetic enquiry backend are implemented. Actual portfolio content, owner-approved business facts, live-provider acceptance and publication remain pending. Start with the portable [maintainer guide](../docs/MAINTAINER-GUIDE.md), [design system](../docs/DESIGN-SYSTEM.md) or [AI handoff](../docs/AI-HANDOFF.md) for detailed work. The [review package guide](../docs/REVIEW-PACKAGE.md) covers owner feedback. [Preview sharing](../docs/PREVIEW-SHARING.md) explains the checked upload package and hosting boundary; [owner handoff verification](../docs/OWNER-HANDOFF-VERIFICATION-2026-10-15.md) records its checks and native-browser limits.

## Run it

Use Node 22.23.2 and npm 10.9.8. From the repository root:

```sh
cd site
npm ci --ignore-scripts
npm run build
npm run preview
```

Open [the local review](http://127.0.0.1:4321/). Use `npm run dev` for editing. Preview serves the last build, so rebuild and reload after source changes. Run one server on port 4321 at a time. The normal application uses its own runtime and lockfile; OpenDesign remains on security hold.

## Build and lab surfaces

| Command | Output and use |
|---|---|
| `npm run build` | `dist/`: owner review with Add/Replace notes and a disabled form. Serve with `npm run preview` on port 4321. |
| `npm run build:fixture` | `dist-fixture/`: geometric test images and the public templates. Serve with `npm run preview:fixture` on port 4324. |
| `npm run build:integration` | `dist-integration/`: designed enquiry form for the local synthetic runner. Serve with `npm run lab:site` on port 4323. |
| `npm run lab` | Separate backend exercise page on port 4322. |
| `npm run build:public` | Attempt the real public `dist/` export. It currently refuses unresolved content and approval gates. |
| `npm run package:review` | Validate the current review build and prepare `.review-package/owner-review.zip` plus `.review-package/upload/`. Keep the manifest outside the hosted upload. |
| `npm run test:review-package` | Run the Node tests for package contents, safety checks and preview behavior. |
| `npm run preview:review-package` | Serve checked upload bytes and their headers at loopback port 4325. Restart after rebuilding the package. |

The synthetic image fixture has an invalid example domain, inactive test contact and noindex output. It is not portfolio work. The enquiry labs create temporary native PostgreSQL databases, use fake notifications and send no real email. Only the designed lab's loopback server injects its active client; the static integration files retain disabled submission. Ctrl+C stops the lab and removes its own database.

Install native PostgreSQL 16 or newer for labs/backend tests. The runner needs `initdb`, `postgres`, `pg_ctl` and `createdb`. Set `SEVENSTEPS_PG_BIN` to the installed bin directory if discovery needs help. Do not point tests at a shared database. [The maintainer guide](../docs/MAINTAINER-GUIDE.md) explains macOS/Linux setup and the unverified native Windows limitation.

Test directories are never deployment targets. The wrapper removes the selected output before building; a failed public command cannot leave a previous review artifact at `dist/`. Astro also checks gates when invoked directly. A directory called `dist` alone does not prove public readiness because review and public modes share that output name.

## Routes and content editing

| Route | Purpose |
|---|---|
| `/` | Opening, two stories, approach and enquiry/contact area. |
| `/stories/wedding-story/` | Wedding story layout, viewer and optional moving strip. |
| `/stories/couple-session/` | Couple-session layout and visible story context. |
| `/content-checklist/` | Review-only content requests, search, section filter and return links. |
| `/404.html` | Missing-page recovery. |
| `/sitemap.xml`, `/robots.txt` | Mode-specific search discovery and indexing instructions. |

The ordinary review uses noindex metadata and disallow-all crawler rules. Those do not provide access control. Keep uncleared private material out of a shared preview and follow the review package's hosting boundary.

Edit review page text in `src/pages/index.astro`, `src/pages/stories/[slug].astro` and the relevant shared component. Edit replacement requests and their checklist in `src/data/content.ts`. That file is the canonical source for the 27 slots, two draft projects and publication decisions. `src/content.config.ts` and `scripts/content-check.mjs` validate its shape, IDs and readiness. The older Markdown slot inventory is a planning snapshot.

The owner supplies originals and a document keyed by the content references. The browser checklist describes and filters requests; it does not upload files or save changes. The selected maintenance model is assisted file editing, with the guides supporting the owner, a developer or Claude/Codex. No CMS or custom admin interface is included.

Statuses are Needs content, Received: checking, Needs an update, Ready and Not needed. Check facts, rights, image quality and placement before Ready. An optional omission needs its recorded reason. Preserve stable IDs and keep private permission correspondence outside source files.

`PhotoSpace` already supports checked image records and labelled empty spaces. Current review calls intentionally use the latter. Changing a slot status or adding public JSON does not populate those review calls. Wire supplied, cleared content into the relevant review template when authorised, and preserve the useful notes for remaining gaps. The [maintainer guide](../docs/MAINTAINER-GUIDE.md) describes that distinction.

For eventual public content, follow [content inputs](content/README.md) and [image preparation](docs/MEDIA-PIPELINE.md). Public data passes an allowlist, generated image files pass an exact-file/hash check, and the checklist route and owner notes are absent from that output. Film, team and logo-artwork features remain omitted until their implementation and acceptance exist.

The maintainer must still implement an isolated, guarded real-content candidate path before release approval. The public gate requires completed release evidence before rendering, and the current review/fixture modes do not supply that final candidate. This is pending engineering. Complete [release step 3.5](../docs/LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review), test the candidate, then record genuine approval; do not fabricate approval or relabel synthetic fixtures.

## Enquiry behavior

The ordinary review form accepts sample typing but has no active endpoint or named payload fields. The button stays disabled, the controller prevents implicit submission and no personal values enter local storage. The visible story context can be changed or cleared. The optional motion preference uses a 30-day local-storage entry.

The local backend is complete for its synthetic scope: strict validation, signed submission tokens, durable receipt and outbox transaction, atomic deduplication, bounded notification retries, signed-event handling and recovery views. Its client retains only an opaque pending reference or receipt in session storage. It does not persist personal form values and refuses sending if it cannot retain the retry reference.

The public-template contact path supports a confirmed email link, with safely encoded mailbox text, privacy information and accurate follow-up wording. A live form remains gated by the fixed recipient, accounts, data handling, provider tests and operator recovery described in [the backend report](../docs/BACKEND-IMPLEMENTATION-2026-10-15.md) and [provider decision](../docs/LIVE-ENQUIRY-PROVIDER-DECISION.md). A stored receipt does not prove email delivery or a booking.

## Verify changes

Install the Playwright engines, then prepare the local builds and checked review package before the full suite:

```sh
npx playwright install chromium firefox webkit
npm run check
npm run build
npm run build:fixture
npm run build:integration
npm run test:build
npm run package:review
npm run test
npm run budget
node scripts/dependency-report.mjs
```

CI uses Playwright's `--with-deps` installation on Ubuntu for required system libraries. `npm run test` covers unit, image, review-package, native PostgreSQL and browser tests; it does not prepare missing builds or install browsers. Stop manually running labs, fixture and review-package servers on ports 4322 through 4325 before Playwright starts its own instances. A reused port-4321 preview must serve the intended current build.

For narrower checks use `test:unit`, `test:media`, `test:review-package`, `test:server` or `test:e2e`. `test:build` exercises refused public/direct/hosted modes and restores the ordinary review; prepare the upload package after that command. `scripts/preview-measure.mjs` needs the ordinary preview running; it measures that page, not a live production service. The full command and evidence map is in the maintainer guide.

At `8ef0d59`, recorded checks passed 41 unit tests, 17 image tests, 99 backend tests and 126 browser cases. See [B04 evidence](docs/audits/b04-summary.json) and [the content-ready report](../docs/CONTENT-READY-IMPLEMENTATION-2026-10-15.md) for exact versions, source hashes and limitations. Browser tests cover no JavaScript, failed images, finite navigation, focus, reduced motion, viewport reflow and synthetic receipt/retry states. They do not substitute for remaining physical-device, screen-reader, real-photo and live-provider checks.

The later focused run passed 27 browser cases: nine new package cases and 18 designed-form repeats. Do not add the repeats to the baseline or claim a new full-suite/CI pass from this run. Bounded Chrome 400% zoom and Safari text-enlargement observations appear in the owner handoff report. They do not complete the zoom/text-only matrix. VoiceOver output was unavailable, so screen-reader verification has no pass result.

## Source map and workflow

- `src/layouts/` and `src/pages/`: shared document, routes and selection of review/public templates.
- `src/components/`: image, note, enquiry, arrow, gallery and public-page components.
- `src/styles/`: global design plus image and enquiry states.
- `src/lib/`: motion bounds, image sizes, public schemas, release/file checks and email encoding.
- `src/scripts/`: browser behavior and active enquiry state machine.
- `server/` and `netlify/functions/`: receipt service, database/notification logic and hosting adapters.
- `scripts/` and `tests/`: build/media preparation, local runners and verification.

Use the local [design adapter](../.agents/skills/photographer-design-codex/SKILL.md), [frontend-design](../.agents/skills/frontend-design/SKILL.md) and [stop-slop](../.agents/skills/stop-slop/SKILL.md). Write no em dashes in authored text. Keep source notices and font licences intact. [Dependency records](docs/DEPENDENCIES.md) preserve pins and audit limits.

All changes stay on `feat/sevensteps-rebuild`; original HTML remains under `../website/`. Read [Git workflow](../docs/GIT-WORKFLOW.md) before committing, pushing or reverting. Follow [the release runbook](../docs/LAUNCH.md) only when the actual release inputs and authorization exist.
