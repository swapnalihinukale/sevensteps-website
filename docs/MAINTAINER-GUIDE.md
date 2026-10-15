# Maintainer guide

This guide starts from the content-ready implementation at `8ef0d59` on `feat/sevensteps-rebuild` and includes the later review-package commands. The photographer is reviewing a private draft with placeholders while real material is pending. Keep that review experience as the default. The application has working image preparation, gated public templates and a local synthetic enquiry backend; it has no live delivery or published release.

Read [the execution plan](../EXECUTION-PLAN.md) for current status, [the design system](DESIGN-SYSTEM.md) before visual changes and [the AI handoff](AI-HANDOFF.md) when continuing with an assistant. The [B04 report](CONTENT-READY-IMPLEMENTATION-2026-10-15.md) and [machine-readable evidence](../site/docs/audits/b04-summary.json) identify the completed checks. Older B02 and B03 reports describe earlier artifacts.

Use [Preview sharing](PREVIEW-SHARING.md) to prepare the current placeholder review for a separate host. [Owner handoff verification](OWNER-HANDOFF-VERIFICATION-2026-10-15.md) records package checks and the limits of the later native-browser observations. Preparing a package does not publish it.

## Start from a fresh clone

The repository is [swapnalihinukale/sevensteps-website](https://github.com/swapnalihinukale/sevensteps-website). Preserve `master` and the original `website/` HTML files. Development uses one branch:

```sh
git clone --branch feat/sevensteps-rebuild https://github.com/swapnalihinukale/sevensteps-website.git
cd sevensteps-website
git branch --show-current
git remote get-url origin
cd site
node --version
npm --version
npm ci --ignore-scripts
npm run build
npm run preview
```

Use Node `22.23.2` and npm `10.9.8`. The `site/.nvmrc` file supports an existing nvm installation; run `nvm install` and `nvm use` from `site/` if that is your version manager. The project pins the runtime and packages. Do not substitute the separate OpenDesign runtime.

Open [the private review](http://127.0.0.1:4321/). Loopback URLs work on the computer running the server. Use `npm run dev` instead of the preview command while editing. Preview serves the last build, so rebuild to see source changes. Do not run dev and preview on the same port at once.

`npm ci --ignore-scripts` installs the lockfile without dependency lifecycle scripts. The checked build works with that installation mode. If a future package needs an install script, review it and document the exception before changing this policy. Keep `package-lock.json`; do not repair an installation by deleting it.

### Native database and browser prerequisites

Backend tests and both enquiry labs create a fresh native PostgreSQL cluster. They need `initdb`, `postgres`, `pg_ctl` and `createdb` from PostgreSQL 16 or newer. The recorded macOS run used PostgreSQL 16.13. CI uses the PostgreSQL 16 binaries on Ubuntu 24.04.

The runner checks `SEVENSTEPS_PG_BIN`, `/opt/homebrew/opt/postgresql@16/bin`, then directories on `PATH`. After installing PostgreSQL through your system's package manager, set the project variable if discovery needs help:

```sh
export SEVENSTEPS_PG_BIN=/usr/lib/postgresql/16/bin
```

Use your actual bin directory. On Apple Silicon with Homebrew PostgreSQL 16, the documented default path usually works without this variable. The test runner starts its own cluster; you do not need to start a shared database service. Run it as a normal user, since PostgreSQL `initdb` refuses root. Each cluster binds to loopback, uses an isolated temporary directory and stops after the test or Ctrl+C. The runner refuses to substitute an inherited production connection. A missing native database fails the test instead of skipping it.

The native runner currently uses Unix paths and process behavior. macOS and Ubuntu are the recorded environments. A Windows maintainer should use a configured WSL2 Linux environment for this runner and verify the result; native Windows execution has not been established. That limitation does not describe the website's browser compatibility.

Install the three browser engines before browser tests:

```sh
npx playwright install chromium firefox webkit
```

A Linux runner also needs their system libraries. CI uses `npx playwright install --with-deps chromium firefox webkit`. Use that form where your machine policy permits package installation.

## Stack and the reasons for it

| Layer | Current choice | Maintenance consequence |
|---|---|---|
| Pages | Astro 7.3.8, static output | Each route builds to HTML. Ordinary links and content work before client JavaScript. There is no server-rendered portfolio route or client router to operate. |
| Types | TypeScript 6.0.3, strict Astro configuration | Validate content and component props at build time. Runtime input still needs the explicit validators. |
| Styles and interactions | Native CSS, small TypeScript browser modules | Change grid, typography and motion at their source. No React, styling runtime or animation framework is required. |
| Images | sharp 0.35.5 | Generate bounded AVIF, WebP and progressive JPEG during build preparation. Clients download derivatives; they do not encode images. |
| Fonts | Source Serif 4 and Source Sans 3 via Fontsource Variable 5.3.1 | Serve two local normal Latin variable WOFF2 files and preserve the two OFL notices. |
| Future receiver | Netlify Functions 6.0.2, Netlify Database 2.0.1, Resend 6.33.0 | Keep database receipt separate from notification. Production accounts, routing and recovery acceptance still need completion. |
| Test database client | pg 8.16.3, `@types/pg` 8.15.6 | Tests use actual PostgreSQL transactions and role boundaries. The client alone does not install the database. |
| Checks | Astro check 0.9.10, Playwright 1.64.1, axe-core Playwright 4.13.0, Node test runner | Use the committed scripts and evidence. A browser emulator does not prove a physical-device or screen-reader result. |

The manifest [site/package.json](../site/package.json) and its lockfile are the authority for pins. `@types/node` is 22.20.5. The Node engine accepts `>=22.23.2 <23`; the reproducible project and CI version is 22.23.2.

A small photography site benefits from CI because content, image handling and contact behavior can regress. [The workflow](../.github/workflows/verify.yml) checks the branch on Ubuntu, has read-only repository permissions and contains no deployment credentials. It builds static artifacts and runs synthetic tests. A Docker image, container registry and orchestration cluster are not part of this architecture. Revisit that only for a demonstrated operating need.

## File map and data flow

| Location | Responsibility |
|---|---|
| `site/src/pages/index.astro` | Review homepage and selection of the public homepage renderer. |
| `site/src/pages/stories/[slug].astro` | Two story routes, review frame definitions and public-story selection. |
| `site/src/pages/[reviewPage].astro` | Checklist route only in review mode. Its static path list is empty for fixture/public output. |
| `site/src/pages/404.astro`, `robots.txt.ts`, `sitemap.xml.ts` | Recovery page and search discovery output. |
| `site/src/layouts/Layout.astro` | Shared document, navigation, footer, canonical/social metadata and page script import. |
| `site/src/components/` | Photo spaces, replacement notes, arrows, gallery movement, enquiry and public templates. |
| `site/src/data/content.ts` | The 27 canonical content slots, two draft projects and publication decisions. |
| `site/src/content.config.ts` | Review content collection schema. Public output does not export that collection. |
| `site/src/lib/public-content.ts`, `site-content.ts`, `public-assets.ts` | Public field validation, fixed-path input loading, release gate and generated-file verification. |
| `site/src/lib/image-sizes.ts`, `media.ts` | Responsive size declarations that match the CSS layout, plus the public photograph type. |
| `site/src/styles/` | Global design, image states and enquiry states. |
| `site/src/scripts/ui.ts` | Menu, viewer, controlled movement, checklist and ordinary draft behavior. |
| `site/src/scripts/enquiry-client.ts` | Active synthetic/live-capable form state machine. The ordinary draft does not import an active sending client. |
| `site/server/` | Validation, tokens, HTTP receiver, PostgreSQL store, notification worker, provider adapter and verified events. |
| `site/server/migrations/`, `operator-views.sql` | Database schema, runtime restrictions and operator retrieval/reconciliation views. |
| `site/netlify/functions/` | Hosting adapters for enquiry HTTP, provider events and scheduled repair. |
| `site/scripts/` | Build, media preparation, local servers, database runner and quality checks. |
| `site/tests/` | Unit, image, database and browser regression coverage. Synthetic public data stays under `tests/fixtures/`. |
| `site/content/` | Public input instructions. Actual `public.json`, `media.json` and release approval are absent. |
| `site/docs/audits/` | Dated evidence and artifact fingerprints. Treat older numbers as historical. |
| `scripts/` at the repository root | Shareable-file guards and held design-tooling controls. |

The default page flow is review templates plus canonical notes, then Astro HTML/CSS/JavaScript, then `dist/`. Missing content is visible. Review typing does not send or save an enquiry.

The fixture flow generates geometric masters, prepares derivatives and an allowlisted view, then renders the public templates to `dist-fixture/`. It uses `example.invalid`, blocks indexing and displays an inactive test contact. The real public flow requires approved public fields, selected media, resolved canonical slots and matching release evidence before using the same public templates. It excludes review routes and checks the generated asset directory against an exact allowlist.

The active enquiry flow issues a signed token, validates a bounded same-origin submission, commits a durable enquiry and outbox record in one transaction, then returns its receipt. A notification worker sends or retries outside that transaction. Retries reuse the same provider key. Signed provider events update delivery state; uncertain outcomes reach reconciliation rather than a blind duplicate send. A receipt confirms storage, not availability, booking or email delivery. See [the backend report](BACKEND-IMPLEMENTATION-2026-10-15.md) for lease, cutoff, retention and failure details.

## Commands and output boundaries

Run these commands from `site/` unless the table says otherwise.

| Command | Purpose and output |
|---|---|
| `npm run dev` | Edit the review at loopback port 4321. |
| `npm run build` | Validate and build the ordinary review into `dist/`. |
| `npm run preview` | Serve the last review build at port 4321. |
| `npm run package:review` | Validate the existing review build and create `.review-package/owner-review.zip` plus `.review-package/upload/`. The integrity manifest remains outside the hosted directory. |
| `npm run test:review-package` | Run focused Node checks for the review package, file boundaries and preview behavior. |
| `npm run preview:review-package` | Serve checked package bytes and upload headers at loopback port 4325. Restart after rebuilding the package. |
| `npm run build:fixture` | Build labelled synthetic public templates into `dist-fixture/`. |
| `npm run preview:fixture` | Serve that fixture at port 4324. |
| `npm run build:integration` | Build the designed synthetic enquiry surface into `dist-integration/`. |
| `npm run lab:site` | Serve it at port 4323 with a fresh temporary database and fake notifications. The loopback runner injects the active client. |
| `npm run lab` | Serve the separate backend exercise page at port 4322, also synthetic. |
| `npm run build:public` | Attempt a gated real public export into `dist/`. It currently fails on unresolved content. It removes prior `dist/` so stale review output cannot masquerade as a release. |
| `npm run check` | Astro types, canonical content and authored/rendered punctuation checks. |
| `npm run test:unit` | Top-level Node TypeScript unit tests. |
| `npm run test:media` | Real sharp transformations and input/security limits. |
| `npm run test:server` | Backend tests against a new native PostgreSQL cluster. |
| `npm run test:e2e` | Playwright journeys across the three engines. Prepare review, fixture, integration and the review package first. |
| `npm run test:build` | Test public/direct-build/hosted-mode refusal, then restore the ordinary review build. It does not deploy. |
| `npm run test` | Unit, image, review-package, backend and browser suites. It does not install browsers or prepare missing builds. |
| `npm run budget` | Check the existing review shell budget. Real-image transfer needs its separate measurements. |
| `node scripts/dependency-report.mjs` | Inventory pins, licences, integrity, lifecycle scripts and audit results into dated evidence. It performs npm advisory requests; it does not upgrade packages. |

The environment flags are implementation details of the wrapper. Prefer the named commands over setting them by hand. Astro repeats public validation even without the wrapper and locks template mode to the selected configuration. Hosted fixture/local-integration modes fail. The public deployment target is `dist/` after a real public build, never either test directory.

Before the full suite, stop manual lab, fixture and review-package servers on ports 4322 through 4325. Playwright owns those instances and their database cleanup. Stop the specific process with Ctrl+C; do not kill unrelated PostgreSQL services. A current port-4321 preview may be reused, but ensure it serves the build you intend to test.

## Edit the current review

The owner can read notes and provide material without an account or upload screen. The content checklist filters and links to sections; it does not persist edits. There is no CMS, admin dashboard or browser upload workflow.

Edit ordinary review copy in `src/pages/index.astro`, the story page and shared `Layout.astro`/`Enquiry.astro`. Edit each Add/Replace request, detail and checklist in `src/data/content.ts`. Keep stable slot IDs because page anchors and return links use them. `ContentNote` renders the requested wording; changing a slot status alone does not replace its image or rewrite its page copy.

Current review photo calls intentionally have no `photo` prop. Public/fixture photo calls receive checked records. To introduce supplied work into a private review later, wire the selected checked record into the relevant review `PhotoSpace` call and inspect it. Merely adding `content/public.json` does not populate the review templates. Preserve the notes until the content review and agreed public-release step.

Slot states have specific meanings:

| State | Required maintainer action |
|---|---|
| `Needs content` | Explain what the owner should supply. Current slots all use this state. |
| `Received: checking` | Set a safe supplied-content label and check facts, rights, dimensions and placement. |
| `Needs an update` | Keep the supplied label and write the correction in `remaining`. |
| `Ready` | Record after completing the slot checks. A populated file or a boolean flag is insufficient. |
| `Not needed` | Use for an allowed omission, with `publicationDecision: 'omit'` and a non-empty reason. Required slots cannot use it. |

The `defineSlot` helper currently creates common initial states. To update one slot, change that row's resulting object with explicit per-slot state fields while preserving its original definition and ID. Do not change the helper defaults to mark all slots ready. Follow the `ContentSlot` type and `validateContent` checks. Leave private permission records outside the source; `supplied` should be a safe label, not a private path, signed link or email transcript.

## Add approved public content later

[Public inputs](../site/content/README.md) is the exact schema and gate reference. [Image preparation](../site/docs/MEDIA-PIPELINE.md) describes formats and bounds. Follow [release section 3](LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review) after the owner reviews the placeholder version:

1. Confirm the public identity, two assignment selections, captions/credits, services and contact method with the owner. Check permission for images, names and quotations. Keep unconfirmed claims in owner notes.
2. Place selected web masters under ignored `site/.local/media-masters/`; do not put archives in `public/`. Add their safe relative source list to `site/content/media.json`. Run the media preparation script and inspect crops, colour, low-light detail and readable descriptions.
3. Populate `site/content/public.json` with the approved fields. Reference stable photo IDs. Resolve the canonical slot decisions and omissions. The two current public story IDs remain fixed; adding another story requires route, navigation, form-context, schema and test work.
4. Implement the guarded, isolated local real-content candidate path required by release step 3.5. This remains engineering work for the maintainer. The existing public gate requires release evidence before rendering real content, while review and fixture modes do not provide the final candidate. Keep this prerequisite separate from missing owner material. Do not create approval evidence, relabel fixture content or weaken the production gate to obtain a preview.
5. Test that exact unpublished candidate with actual photographs, the required browsers/devices and assistive technologies. Verify contact behavior, factual copy, metadata, image quality, performance and output boundaries. Extend the current automated coverage to the new candidate path and record the checks that still need a person or device.
6. Obtain explicit publication approval after completing those checks. Record genuine evidence and exact content/media hashes in `content/release-approval.json`. Recheck after any content or derivative change. The approval record documents a decision; writing it does not grant one.

The current public contact renderer supports a confirmed email link with privacy and follow-up wording. The shared mailbox normalizer and URI encoding protect special characters. Choosing this path requires the documented publication decisions and a tested destination. The live form remains a separate provider integration with ENQ-01 through ENQ-08 acceptance.

A clean remote public build also needs an approved way to provision the selected web masters. Those private files are absent from Git on purpose. Do not make CI green by committing an original archive or copying test media into the real mode. Film, team and logo-artwork rendering remain omitted; retaining those optional features needs implementation and acceptance before release.

## Validate, save and reverse a change

For a copy-only change, run `npm run check`, rebuild the affected mode and inspect its rendered text, navigation and mobile wrapping. For grid, media or interaction changes, build review, fixture and integration, then use the relevant browser tests. Changes to the receipt path need the native backend suite. A release candidate or package upgrade needs the full current checks:

```sh
npm run check
npm run build
npm run build:fixture
npm run build:integration
npm run test:build
npm run package:review
npm run test
npm run budget
node scripts/budget.mjs dist-fixture docs/audits/budget-fixture-latest.json
npm audit --audit-level=high
```

`test:build` restores the ordinary review, so prepare the package after it. The full `test` command includes `test:review-package`. Stop the package preview on port 4325 along with the other manual test servers before Playwright starts.

Run the repository sharing guard from the repository root before committing, and inspect the diff:

```sh
git branch --show-current
git status --short
git diff
node scripts/test-shareable.mjs
node scripts/check-shareable.mjs
```

Commit a coherent change with the checks that support it, then push `feat/sevensteps-rebuild` to the existing remote using an authorized account. Use repository-scoped credentials without changing shared global authentication. Do not print tokens or insert them into remote URLs. Recheck the CI result for the pushed commit. Pushing this branch does not authorize publication.

Undo a shared commit with `git revert <commit>` on the same branch, then review and test the resulting change. A revert keeps the history. Do not force-push, rewrite shared history or merge into `master` during this development workflow. A code revert cannot reverse an applied database migration or retrieve deleted personal data; those need the separate tested operator plan.

Review dependency updates as changes: check current advisories and supported versions, inspect lifecycle scripts and licences, update an exact pin and lockfile together, run a clean `npm ci --ignore-scripts`, then run the applicable full checks. Avoid unreviewed `npm audit fix --force`. Zero reported advisories is a dated scanner result, not a permanent security claim.

## Current evidence and remaining release checks

At `8ef0d59`, the recorded run passed 41 unit tests, 17 image tests, 99 PostgreSQL/backend tests and 126 browser cases. Astro reported zero diagnostics across 64 files. Image size declarations matched rendered widths within 2px at 12 viewports from 320 to 2560 in Chromium, Firefox and WebKit. The repository guard has eight focused tests. Read the B04 evidence for exact source hashes and limits.

The review shell measured 94.77 KiB and the fixture shell 92.48 KiB. Both include 3.70 KiB gzip JavaScript and 77.94 KiB of fonts. These figures exclude photographs. Synthetic media checks and a limited Safari 27.0.1 review at 200% zoom do not establish final image fidelity, field Core Web Vitals, Windows, physical mobile/tablet or screen-reader coverage.

The later focused browser run passed 27 cases: nine new review-package cases and 18 repeats of the designed-form journeys. Keep the repeated cases separate from the dated baseline. This result does not establish a new full-suite or CI pass. The [owner handoff report](OWNER-HANDOFF-VERIFICATION-2026-10-15.md) records bounded Chrome 400% zoom and Safari text-enlargement observations. Chrome key actions were sometimes delayed, and Safari exposed no reliable numeric text scale. Neither observation completes its full journey. VoiceOver output was unavailable; do not record a screen-reader pass.

The next owner review remains the placeholder website. Before public release, complete the guarded real-content candidate path, controlled media provisioning, supplied-content review, actual media budgets, remaining device/accessibility checks, contact acceptance, account/processor/retention decisions and explicit publication approval. Verify deployed security/cache behavior on the chosen host. Local synthetic backend success does not establish live Resend delivery, database restore or an operator's ability to recover an enquiry.
