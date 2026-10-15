# Maintain your Seven Steps website

Run and edit the website in `site/`. Your current preview includes labelled photo spaces and a content checklist; the enquiry form does not send messages. To review the layout without editing code, start with [Review the site](../review/README.md).

## Run it on your computer

Install Node **22.23.2** and npm **10.9.8**, then clone the development branch:

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

Open [http://127.0.0.1:4321/](http://127.0.0.1:4321/). Use `npm run dev` while editing; use `build` followed by `preview` to inspect the compiled files. Rebuild after source changes and run one server on port 4321 at a time.

If you use nvm, run `nvm install` and `nvm use` from `site/`; `.nvmrc` contains the version. Keep `package-lock.json`. The install command skips dependency lifecycle scripts, and the application supports that installation method. Review any future package's install script before allowing it.

Keep your work on `feat/sevensteps-rebuild`. Keep `master` unchanged. The older HTML drafts remain under `website/`.

## Edit text and content requests

Use these files for the current preview. Paths below start at the repository root.

| To change | Edit |
|---|---|
| Homepage text and photo placement | `site/src/pages/index.astro` |
| Story text and photo order | `site/src/pages/stories/[slug].astro` |
| Navigation, footer and page metadata | `site/src/layouts/Layout.astro` |
| Enquiry text and controls | `site/src/components/Enquiry.astro` |
| Add/Replace notes and the 27 content requests | `site/src/data/content.ts` |
| Colours, type and layout | `site/src/styles/global.css`; see [Design system](DESIGN-SYSTEM.md) |
| Image display and missing-photo treatment | `site/src/components/PhotoSpace.astro` |
| Menu, viewer and gallery movement | `site/src/scripts/ui.ts` |

For a text edit:

1. Find the wording in the page or component above and change it.
2. Keep its content ID, such as `HOME-HERO-01`. Checklist links use these IDs.
3. Run `npm run check` and `npm run build` from `site/`.
4. Open the changed page. Check the wording, links and line wrapping on a narrow screen.

Edit the files yourself or with a developer or assistant. The browser checklist lets you read, filter and locate requests. It does not save edits or upload files; there is no CMS.

### Update a content request

Each record in `src/data/content.ts` has a request, note, checklist and status. Use the status that describes the work completed:

| Status | Set it when |
|---|---|
| `Needs content` | You still need the photo or information. |
| `Received: checking` | You have received it and are checking facts, rights, quality and placement. |
| `Needs an update` | You have written the required correction in `remaining`. Keep the supplied-content label. |
| `Ready` | You have completed that record's checks. |
| `Not needed` | You have chosen to omit an allowed optional item. Set `publicationDecision: 'omit'` and explain why in `omissionReason`. |

All 27 records currently start at `Needs content`. To change one, override the fields on that record's `defineSlot(...)` result. Keep its definition and ID; do not change the helper's defaults to update the whole list. Follow the `ContentSlot` type and run the content checker. Required records cannot use `Not needed`.

Use a short label in `supplied`, such as a photo selection name. Store permission emails, private links and source archives elsewhere. Marking a record `Ready` does not replace its photo or page text.

## Add your photos

Choose photos you have permission to publish, including permission for identifiable people and the names you intend to use. Keep original archives and private permission records in restricted storage.

For the current preview, `PhotoSpace` calls have no `photo` prop. To show a photo, prepare its image record, pass it to the relevant `PhotoSpace` call, then inspect its phone crop and full frame. Keep Add/Replace notes for the items still missing. Adding public JSON alone will not change these preview calls.

For the finished website:

1. Put the selected web masters in ignored `site/.local/media-masters/`.
2. Create `site/content/media.json` with their relative filenames, photo IDs, descriptions, credits and publication permission. Follow the exact [media input format](../site/docs/MEDIA-PIPELINE.md).
3. From `site/`, run `node scripts/prepare-media-public.mjs`. Check the generated photos for orientation, colour, skin tones, dark detail, crop and file size.
4. Create `site/content/public.json` using the [public content schema](../site/content/README.md). Add your business details, story text and contact wording, and reference the same photo IDs. Resolve the content records and optional omissions.
5. **Implement the missing real-content preview before seeking release approval.** The current public build requires release evidence before it will render your photos. The review and geometric test modes do not provide the final preview. A developer still needs to finish this code: an isolated local build for reviewing real content while preserving the production checks. See [release step 3.5](LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review).
6. Test that unpublished build with your photos, contact details and the device/accessibility checks below. Extend the automated tests to cover the new build. After approval to publish, record the evidence and exact content/media hashes in `content/release-approval.json`.

Do not create an approval file just to get a preview. A changed photo or content file needs another check and updated hashes before release.

The two story IDs are fixed: `wedding-story` and `couple-session`. Adding a story also requires changes to routes, navigation, enquiry context, schema and tests. Film, team and logo-artwork sections still need implementation if you want to include them.

The production build needs a secure way to obtain the selected web masters because they are absent from Git. Set that up before building on a remote host. Keep originals out of `public/` and test images out of the production portfolio.

## Contact and enquiry delivery

The public templates support an email link with privacy and reply information. Before enabling it, confirm your receiving address and who will respond, then test the destination with permission. The mailbox helper validates the address and encodes special characters in the link.

The local form backend works with test data. It validates a signed submission, writes the enquiry and notification job in one PostgreSQL transaction, and returns a receipt. A worker sends notifications after that transaction and reuses the provider key on retries. Signed provider events update delivery status; uncertain outcomes need reconciliation. A receipt confirms database storage. Email delivery and bookings are separate outcomes.

The browser keeps an opaque pending reference or receipt in session storage, without personal form values. It refuses submission if it cannot retain that retry reference. The ordinary preview has no active endpoint or named payload fields, disables submission and blocks implicit submission.

To enable a live form, follow the [provider setup](LIVE-ENQUIRY-PROVIDER-DECISION.md) and [backend instructions](BACKEND-IMPLEMENTATION-2026-10-15.md). Accounts, recipient, data handling, production form activation, ENQ-01 through ENQ-08, provider recovery and operator retrieval still need completion. Local fake notifications do not test Resend delivery or database restoration.

## Prepare a review package

From `site/`:

```sh
npm run check
npm run build
npm run test:review-package
npm run package:review
npm run preview:review-package
```

Open [http://127.0.0.1:4325/](http://127.0.0.1:4325/). Restart this server after rebuilding the package. It serves the checked `dist/` files with the same headers used in the ZIP.

The upload ZIP is `site/.review-package/owner-review.zip`; the equivalent directory is `.review-package/upload/`. Keep `manifest.json` outside the hosted directory. Follow [Preview sharing](PREVIEW-SHARING.md) to use a separate review host. Localhost links work on your computer only. Noindex instructions do not restrict access to a shared URL.

## Install test prerequisites

### PostgreSQL

Backend tests and both enquiry labs need native PostgreSQL **16 or newer**, including `initdb`, `postgres`, `pg_ctl` and `createdb`. Installing the npm `pg` package does not install these tools. Recorded runs used PostgreSQL 16.13 on macOS and PostgreSQL 16 on Ubuntu 24.04 CI.

The runner searches `SEVENSTEPS_PG_BIN`, `/opt/homebrew/opt/postgresql@16/bin`, then `PATH`. Set your installed bin directory if needed. For example, on Linux:

```sh
export SEVENSTEPS_PG_BIN=/usr/lib/postgresql/16/bin
```

Run tests as a normal user; `initdb` refuses root. The runner starts a fresh temporary cluster on loopback and stops it after the test or Ctrl+C. You do not need a shared database service. It rejects inherited production connections and fails if the native tools are missing.

The runner uses Unix paths and process behavior. On Windows, use WSL2 and verify the run there. Native Windows execution has not been tested.

### Browsers

```sh
npx playwright install chromium firefox webkit
```

On Linux, install the system libraries too if your machine permits it:

```sh
npx playwright install --with-deps chromium firefox webkit
```

## Test a change

For copy, run `check`, rebuild and inspect the changed text. For layout, images or interactions, run the affected browser tests as well. For receipt or notification changes, run `test:server` against the temporary database.

For a dependency update or release preparation, run the full sequence from `site/`:

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

`test:build` restores the ordinary review, so package it after that command. Before Playwright starts, stop your servers on ports **4322 through 4325** with Ctrl+C. Playwright starts those servers and cleans up their databases. It can reuse port 4321; check that the existing preview serves the current build. Do not stop unrelated PostgreSQL services or run simultaneous builds into the same directory.

Check these before publishing your photos:

- Actual photo transfer sizes, crops and full-frame quality. Shell budgets exclude photos.
- Windows, physical phones/tablets, screen-reader use and full zoom/text-enlargement journeys. Earlier Chrome 400% zoom checks had delayed key actions; Safari text enlargement had no reliable percentage. VoiceOver output was unavailable, so there is no screen-reader pass.
- The receiving contact, deployed cache/security headers, recovery process, account access, costs and retention arrangements in [Launch](LAUNCH.md).

See [test results](CONTENT-READY-IMPLEMENTATION-2026-10-15.md), [B04 measurements](../site/docs/audits/b04-summary.json) and [review-package verification](OWNER-HANDOFF-VERIFICATION-2026-10-15.md) for dated results. Run and report checks for your changed commit instead of treating an earlier result as a new pass.

## Command reference

Run these from `site/`.

| Command | Use |
|---|---|
| `npm run dev` | Edit at port 4321. |
| `npm run build` | Build the placeholder review into `dist/`. |
| `npm run preview` | Serve `dist/` at port 4321. |
| `npm run package:review` | Validate and package the existing review build. |
| `npm run test:review-package` | Test package contents and rejected inputs. |
| `npm run preview:review-package` | Serve checked review files and upload headers at port 4325. |
| `npm run build:fixture` | Build public templates with geometric images into `dist-fixture/`. |
| `npm run preview:fixture` | Serve the image fixture at port 4324. |
| `npm run build:integration` | Build the designed test form into `dist-integration/`. |
| `npm run lab:site` | Serve that form at port 4323 with temporary PostgreSQL and fake notifications. |
| `npm run lab` | Start the separate backend test page at port 4322. |
| `npm run build:public` | Build real content into `dist/` after the required content and release checks. Currently fails because these inputs are absent. |
| `npm run check` | Check Astro types, content records and source/rendered copy. |
| `npm run test:unit` | Run Node TypeScript unit tests. |
| `npm run test:media` | Test image processing and rejected inputs. |
| `npm run test:server` | Run backend tests against fresh native PostgreSQL. |
| `npm run test:e2e` | Run browser journeys in Chromium, Firefox and WebKit. Prepare the builds and package first. |
| `npm run test:build` | Check rejected public/direct/hosted test builds, then restore the review. |
| `npm run test` | Run unit, image, package, backend and browser tests. Does not install browsers or prepare builds. |
| `npm run budget` | Measure the current review's HTML, styles, scripts and fonts. |
| `node scripts/dependency-report.mjs` | Record pins, licences, integrity, install scripts and npm advisory results without upgrading packages. |
| `node scripts/preview-measure.mjs` | Measure the page served by the running ordinary preview. |

Use the named commands so the wrapper sets and validates each build mode. Builds remove their selected output first, including `dist/` after a failed public attempt. Astro also validates direct builds. Review and public builds share `dist/`, so check the build mode before choosing an upload. Keep `dist-fixture/` and `dist-integration/` local. The fixture uses `example.invalid`, inactive contact text and noindex; the integration server alone injects the active test client.

## Stack and source map

| Part | Exact version | Reason |
|---|---|---|
| Astro | 7.3.8 | Static HTML and ordinary links, with small scripts for interactions. |
| TypeScript | 6.0.3 | Strict component and content types, backed by runtime input checks. |
| CSS and browser code | Native CSS and TypeScript | No React, styling runtime or animation framework to download. |
| sharp | 0.35.5 | Prepare AVIF, WebP and progressive JPEG before serving photos. |
| Fontsource Variable | 5.3.1 | Two local Latin files: Source Serif 4 and Source Sans 3. Retain both OFL licences. |
| Netlify Functions / Database / Resend | 6.0.2 / 2.0.1 / 6.33.0 | Separate durable enquiry storage from email notification. |
| pg / `@types/pg` | 8.16.3 / 8.15.6 | Test PostgreSQL transactions and role restrictions. |
| Astro check / Playwright / axe-core Playwright | 0.9.10 / 1.64.1 / 4.13.0 | Type checks, browser journeys and accessibility checks. |
| `@types/node` | 22.20.5 | Node types for the selected runtime. |

Use [package.json](../site/package.json) and its lockfile for version changes. The Node engine range is `>=22.23.2 <23`; use 22.23.2 with npm 10.9.8 to reproduce CI. [GitHub Actions](../.github/workflows/verify.yml) runs on Ubuntu with read-only repository permissions and no deployment credentials. This website does not need Docker, a container registry or Kubernetes.

Additional source locations:

| Path | Contents |
|---|---|
| `site/src/pages/[reviewPage].astro` | Review checklist route; no public or fixture route. |
| `site/src/pages/404.astro`, `robots.txt.ts`, `sitemap.xml.ts` | Recovery page and search metadata. |
| `site/src/content.config.ts`, `site/scripts/content-check.mjs` | Content-record schema and validation. |
| `site/src/lib/public-content.ts`, `site-content.ts`, `public-assets.ts` | Public field allowlist, fixed input paths, release checks and exact asset/hash checks. |
| `site/src/lib/image-sizes.ts`, `media.ts` | Layout-matched image sizes and photograph types. |
| `site/src/scripts/enquiry-client.ts` | Active form states and receipt recovery. |
| `site/server/` | Input validation, tokens, HTTP handling, database, notification worker and provider events. |
| `site/server/migrations/`, `site/server/operator-views.sql` | Database schema and restricted retrieval/reconciliation views. |
| `site/netlify/functions/` | HTTP, provider-event and scheduled-repair adapters. |
| `site/scripts/`, `site/tests/` | Build tools, local runners and tests. Geometric public records stay in `tests/fixtures/`. |
| `site/content/` | Public input instructions. `public.json`, `media.json` and release approval are not supplied yet. |
| `site/docs/audits/` | Test results, measurements and file hashes. |
| Root `scripts/` | Sharing checks and disabled design-tooling controls. |

Review pages combine template text with content notes and compile to `dist/`. Public pages use a separate list of permitted fields and exclude review notes and routes. The image fixture exercises those public templates with generated shapes.

## Save, revert and update dependencies

Before committing, run these from the repository root:

```sh
git branch --show-current
git status --short
git diff
node scripts/test-shareable.mjs
node scripts/check-shareable.mjs
```

Commit one coherent change, record its checks and push `feat/sevensteps-rebuild` to the existing remote. Use your authorised account without changing shared global authentication or putting tokens in URLs. Check CI for the pushed commit. Publishing needs a separate release action.

To undo a shared commit, use `git revert <commit>` on the same branch, then review and test the result. Do not force-push or rewrite shared history. Reverting code cannot undo a database migration or recover deleted enquiry data; follow the database recovery instructions for those cases.

For a dependency update, check support, advisories, licences and install scripts. Update the exact pin and lockfile together, reinstall with `npm ci --ignore-scripts`, then run the full checks. Avoid `npm audit fix --force`. An audit result describes the advisories known on its run date.

For design work, read the local [photographer adapter](../.agents/skills/photographer-design-codex/SKILL.md) and [frontend-design skill](../.agents/skills/frontend-design/SKILL.md). For text, use [stop-slop](../.agents/skills/stop-slop/SKILL.md) and the [copy guide](COPY-AND-VOICE-SPEC.md): plain wording, accurate facts and no em dashes. OpenDesign's executable runtime remains disabled for dependency security issues; its text references are usable. [AI handoff](AI-HANDOFF.md) covers continuing in Claude or Codex, and [EXECUTION-PLAN.md](../EXECUTION-PLAN.md) lists unfinished tasks.
