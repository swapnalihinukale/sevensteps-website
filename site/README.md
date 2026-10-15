# Seven Steps website

This folder contains your Astro website: homepage, two photo stories, image viewer and content checklist. The preview uses labelled spaces for photos and information still to add. Its enquiry form accepts sample typing but cannot send messages.

## Run the website

Use Node **22.23.2** and npm **10.9.8**. From the repository root:

```sh
cd site
npm ci --ignore-scripts
npm run build
npm run preview
```

Open [http://127.0.0.1:4321/](http://127.0.0.1:4321/). Use `npm run dev` while editing. Preview serves the last build, so rebuild after source changes. Run one server on port 4321 at a time.

## Edit your website

| Change | File |
|---|---|
| Homepage text and photo placement | `src/pages/index.astro` |
| Story text and photo order | `src/pages/stories/[slug].astro` |
| Navigation, footer and metadata | `src/layouts/Layout.astro` |
| Enquiry copy | `src/components/Enquiry.astro` |
| Add/Replace requests and their statuses | `src/data/content.ts` |
| Colours, typography and layout | `src/styles/global.css` |
| Menu, viewer and moving gallery | `src/scripts/ui.ts` |

The [maintainer guide](../docs/MAINTAINER-GUIDE.md) has step-by-step text/photo editing and the full source map. Use the [design system](../docs/DESIGN-SYSTEM.md) for exact colours, type sizes, spacing and motion settings.

Keep the 27 content IDs so checklist links still work. Update each request from `Needs content` to `Received: checking`, `Needs an update`, `Ready` or `Not needed` as you complete its checks. An optional omission needs a reason. The browser checklist does not upload files or save edits; edit the source files yourself or with a developer or assistant.

To show your photos, prepare the records using [Image preparation](docs/MEDIA-PIPELINE.md), then pass them to the relevant `PhotoSpace` calls. Changing a status or adding public JSON alone will not replace the current photo spaces. Keep private permission records and original archives outside the repository.

## Pages to review

| Address | Contents |
|---|---|
| `/` | Opening, story choices, approach and enquiry area. |
| `/stories/wedding-story/` | Wedding story, viewer and optional moving gallery. |
| `/stories/couple-session/` | Couple session and viewer. |
| `/content-checklist/` | Content requests, search, section filter and return links. |
| `/404.html` | Missing-page recovery. |
| `/sitemap.xml`, `/robots.txt` | Search discovery and indexing instructions. |

Use [the review instructions](../review/README.md) to view the saved version and [Preview sharing](../docs/PREVIEW-SHARING.md#give-feedback) to record feedback. For a remote reviewer, follow [Preview sharing](../docs/PREVIEW-SHARING.md). Localhost links work on your computer only, and noindex does not restrict access to a shared URL.

## Build and preview commands

Run these from `site/`:

| Command | Result |
|---|---|
| `npm run build` | Placeholder review in `dist/`; serve with `npm run preview` on port 4321. |
| `npm run build:fixture` | Public templates with geometric test images in `dist-fixture/`; serve with `npm run preview:fixture` on port 4324. |
| `npm run build:integration` | Designed test form in `dist-integration/`; serve with `npm run lab:site` on port 4323. |
| `npm run lab` | Separate backend test page on port 4322. |
| `npm run package:review` | Checked `.review-package/owner-review.zip` and `.review-package/upload/`. Keep the manifest outside the hosted upload. |
| `npm run test:review-package` | Tests for package contents and rejected inputs. |
| `npm run preview:review-package` | Checked `dist/` files and upload headers on port 4325. Restart after rebuilding. |
| `npm run build:public` | Real public website in `dist/`. Currently refuses missing content and release evidence. |

Both enquiry labs create temporary PostgreSQL databases and use fake notifications. They send no real email. The server on port 4323 injects the active form script; the static integration build cannot submit on its own. Ctrl+C stops the lab and removes its database.

Install native PostgreSQL **16 or newer** for labs and backend tests. You need `initdb`, `postgres`, `pg_ctl` and `createdb`; set `SEVENSTEPS_PG_BIN` to their directory if needed. The [test setup](../docs/MAINTAINER-GUIDE.md#install-test-prerequisites) covers macOS/Linux, normal-user execution and WSL2 for Windows. Do not connect tests to a shared database.

Keep both test build directories local. The fixture uses `example.invalid`, inactive contact text and noindex. Review and public builds both use `dist/`; check which command produced it before uploading. Builds remove the selected output first, so a failed public build leaves no stale review there. Astro repeats validation on direct builds.

## Test your changes

Install the browsers and prepare the builds before the full suite:

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

On Linux, use Playwright's `--with-deps` install option for system libraries. Stop your servers on ports **4322 through 4325** before Playwright starts its test servers. It can reuse port 4321 if that preview serves the current build. `test:build` restores the review, so run `package:review` after it.

`npm run test` runs unit, image, package, PostgreSQL and browser tests. It does not install browsers or prepare builds. For a smaller change, run `test:unit`, `test:media`, `test:review-package`, `test:server` or `test:e2e` as appropriate. `scripts/preview-measure.mjs` measures the running ordinary preview.

Read [B04 test results](../docs/CONTENT-READY-IMPLEMENTATION-2026-10-15.md), [measurements](docs/audits/b04-summary.json) and [review-package verification](../docs/OWNER-HANDOFF-VERIFICATION-2026-10-15.md) for dated evidence. Physical-device and full zoom/text-enlargement checks remain incomplete. VoiceOver output was unavailable, so screen-reader testing still needs a working session. Test image quality and transfer size again with your photos.

## Prepare for publication

Use the [public content schema](content/README.md) for business details and story records. Public templates exclude review notes and the checklist, validate the permitted fields and check exact image files and hashes. Film, team and logo-artwork sections still need implementation if you want to include them.

A developer must first add a separate local build for reviewing your real content before release approval. The current public build requires release evidence before rendering; the review and fixture modes cannot provide that final preview. Follow [release step 3.5](../docs/LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review) and test the resulting build. Do not create approval evidence just to obtain a preview.

The public templates support an email link after you confirm the receiving address, reply process and privacy wording. The local backend already stores enquiries and notification jobs, handles duplicate submissions, retries and provider events, and supplies recovery views. Its client keeps an opaque receipt/reference in session storage without personal form values. It stops submission if it cannot retain the retry reference.

A live form still needs account setup, production activation, real-provider tests and an operator who can retrieve and recover enquiries. Follow the [backend instructions](../docs/BACKEND-IMPLEMENTATION-2026-10-15.md), [provider setup](../docs/LIVE-ENQUIRY-PROVIDER-DECISION.md) and [launch checklist](../docs/LAUNCH.md). A database receipt confirms storage; it does not confirm email delivery or a booking.

## Save your work

Keep changes on `feat/sevensteps-rebuild` and preserve `../website/`. Use [Git workflow](../docs/GIT-WORKFLOW.md) for commits, pushes and reversals. CI checks the branch without deploying it.

The stack uses Astro 7.3.8, TypeScript 6.0.3, native CSS/TypeScript, sharp 0.35.5 and local Source Serif 4/Source Sans 3. [package.json](package.json), its lockfile and [dependency records](docs/DEPENDENCIES.md) contain the exact pins and audit details.

Use the local [design adapter](../.agents/skills/photographer-design-codex/SKILL.md), [frontend-design](../.agents/skills/frontend-design/SKILL.md) and [stop-slop](../.agents/skills/stop-slop/SKILL.md). Keep authored text free of em dashes and preserve source/font licences. OpenDesign's executable runtime remains disabled for dependency security issues. For Claude or Codex, start with [AI handoff](../docs/AI-HANDOFF.md).
