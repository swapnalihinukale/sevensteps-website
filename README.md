# Seven Steps Photography website

The website is ready for the photographer's review with labelled placeholders. The user has chosen to review this version first while real photographs and business details are pending. The Astro frontend, responsive image pipeline, gated public templates and local synthetic enquiry backend are implemented under [site/](site/README.md). The ordinary review form does not send enquiries.

All work uses `feat/sevensteps-rebuild` in [swapnalihinukale/sevensteps-website](https://github.com/swapnalihinukale/sevensteps-website). The original three HTML files remain under `website/`; keep `master` unchanged. [Git workflow](docs/GIT-WORKFLOW.md) explains commits and reversals.

## Start with the review or maintenance task

| Need | Read |
|---|---|
| Review the current site and provide feedback | [Review package](docs/REVIEW-PACKAGE.md) and [owner inputs](docs/OWNER-INPUTS.md). |
| Prepare a shareable placeholder review | [Preview sharing](docs/PREVIEW-SHARING.md), including the checked upload package and separate hosting boundary. |
| Check the owner handoff evidence | [Owner handoff verification](docs/OWNER-HANDOFF-VERIFICATION-2026-10-15.md), including package tests and bounded native-browser observations. |
| Set up a fresh clone, edit content or maintain the code | [Maintainer guide](docs/MAINTAINER-GUIDE.md). It includes prerequisites, commands, file map, validation and safe reverts. |
| Understand or change the visual design | [Design system](docs/DESIGN-SYSTEM.md), with actual colours, typography, layout, breakpoints, images and motion. |
| Continue with Claude or Codex | [AI handoff](docs/AI-HANDOFF.md), [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md). Project skills work from this clone. |
| Prepare a future release or operating process | [Release runbook](docs/LAUNCH.md) and [measurement guide](docs/MEASUREMENT.md). They document future gates and do not authorize publication. |

The owner can use the notes and checklist to supply material, and can maintain the site with a developer or assistant using these guides. Content editing is file based. The browser checklist does not upload files or save edits, and the project does not include a CMS.

## Run the private review

Use Node 22.23.2 and npm 10.9.8. From the repository root:

```sh
cd site
npm ci --ignore-scripts
npm run build
npm run preview
```

Open [the local review](http://127.0.0.1:4321/). It includes a homepage, two story pages, gallery controls and 27 Add/Replace content groups. Use `npm run dev` for source editing. Localhost works on the computer running the server; a remote preview needs its separate hosting and access-control arrangements.

## Implemented test surfaces

| Surface | Commands from `site/` | Local URL |
|---|---|---|
| Ordinary placeholder review | `npm run build`, then `npm run preview` | `http://127.0.0.1:4321/` |
| Separate synthetic enquiry lab | `npm run lab` | `http://127.0.0.1:4322/` |
| Designed enquiry integration with synthetic data | `npm run build:integration`, then `npm run lab:site` | `http://127.0.0.1:4323/` |
| Geometric images and public-template fixture | `npm run build:fixture`, then `npm run preview:fixture` | `http://127.0.0.1:4324/` |
| Checked review upload package | `npm run package:review`, then `npm run preview:review-package` | `http://127.0.0.1:4325/` |

Both enquiry labs need native PostgreSQL 16 or newer. They create isolated temporary databases and send no real email. Ctrl+C stops their own database. Playwright starts and stops its test instances; stop manual servers on ports 4322 through 4325 before the full browser suite. The maintainer guide has the exact preparation and test sequence, including `npm run test:review-package`.

GitHub Actions repeats the automated checks without deploying or using live secrets. At implementation commit `8ef0d59`, the recorded run passed 41 unit, 17 image, 99 backend and 126 browser cases. See [the content-ready report](docs/CONTENT-READY-IMPLEMENTATION-2026-10-15.md) and [B04 evidence](site/docs/audits/b04-summary.json) for source hashes and coverage limits. These numbers describe that baseline, not a new run on a fresh clone.

The later focused run passed 27 browser cases: nine new review-package cases and 18 repeats of the designed-form journeys. This does not establish a new full-suite or CI pass. The owner handoff report records bounded Chrome 400% zoom and Safari text-enlargement observations. VoiceOver output was unavailable; screen-reader verification remains incomplete.

## Content and release boundaries

Public rendering already exists. `npm run build:public` currently refuses release because approved content, canonical readiness and release evidence are absent. The supported public-template contact is a confirmed email link with privacy and follow-up text. A live form also requires the selected provider's acceptance and operating checks. Local receipts do not prove real email delivery, availability or bookings.

Use [public content inputs](site/content/README.md), [image preparation](site/docs/MEDIA-PIPELINE.md) and [the local backend report](docs/BACKEND-IMPLEMENTATION-2026-10-15.md) when those inputs arrive. Keep genuine photographs, rights, account authority, physical-device/screen-reader coverage and live delivery checks explicit. The test build directories are never deployment targets.

Before release approval, the maintainer must implement a guarded, isolated real-content candidate path and test its exact output. That engineering work remains open because the current public build requires release evidence before rendering; review and fixture modes do not provide the final real-content candidate. Follow [release step 3.5](docs/LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review) without fabricating approval or weakening the production gate.

The project uses the local [photographer design adapter](.agents/skills/photographer-design-codex/SKILL.md), [pinned frontend-design skill](.agents/skills/frontend-design/SKILL.md), [stop-slop](.agents/skills/stop-slop/SKILL.md) and portable OpenDesign references. Use no em dashes in authored UX or documentation. OpenDesign's executable runtime remains disabled on security hold; the website does not depend on it.

[EXECUTION-PLAN.md](EXECUTION-PLAN.md) owns status and acceptance criteria. [The implementation handoff](docs/IMPLEMENTATION-HANDOFF.md) summarises settled choices, and [the research synthesis](RESEARCH-SYNTHESIS-AND-CONCEPTS.md) preserves the reference study behind **Close to the people**.
