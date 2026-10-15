# Seven Steps Photography website

The private Astro website and local enquiry backend are implemented under [site/](site/README.md). The original three HTML drafts remain unchanged under `website/`.

All work uses `feat/sevensteps-rebuild` on `swapnalihinukale/sevensteps-website`. See [Git workflow](docs/GIT-WORKFLOW.md) for access, commits and safe reverts. Keep `master` unchanged.

## Run locally

Use Node 22.23.2 and npm 10.9.8:

```sh
cd site
npm ci --ignore-scripts
npm run build
npm run preview
```

Open `http://127.0.0.1:4321/`. The private review includes a homepage, two story pages, gallery controls and a 27-item Add/Replace checklist. Its enquiry form remains non-sending.

Use `npm run lab` for the separate synthetic enquiry test at `http://127.0.0.1:4322/`. It requires native PostgreSQL 16 or newer, stores sample data locally and sends no email. Ctrl+C removes its temporary database. Stop a manually running lab before `npm run test:e2e`, which starts its own instance.

## Current records

- [Implementation handoff](docs/IMPLEMENTATION-HANDOFF.md): selected stack, palette and interaction choices.
- [Local enquiry backend](docs/BACKEND-IMPLEMENTATION-2026-10-15.md): receipt, retries, PostgreSQL tests and remaining live integration gates.
- [Content-ready implementation](docs/CONTENT-READY-IMPLEMENTATION-2026-10-15.md): responsive image processing, public rendering, the designed local enquiry test and current verification.
- [Execution plan](EXECUTION-PLAN.md): work status, skills/tools and acceptance criteria.
- [Research synthesis](RESEARCH-SYNTHESIS-AND-CONCEPTS.md): the reference study and selected direction, Close to the people.
- [Owner inputs](docs/OWNER-INPUTS.md): authentic content, contact and operating facts still needed.

Before browser tests, run `npm run build`, `npm run build:fixture` and `npm run build:integration` from `site/`. Run `npm run check`, `npm run test:unit`, `npm run test:media`, `npm run test:server`, `npm run test:build` and `npm run test:e2e`. The GitHub workflow repeats the automated checks without deployment or live secrets. Physical devices, screen readers, actual portfolio media and provider integration remain release checks.

The site uses the project [Codex design adapter](.agents/skills/photographer-design-codex/SKILL.md), pinned Anthropic frontend-design guidance and portable OpenDesign craft references. Apply stop-slop and the [copy rules](docs/COPY-AND-VOICE-SPEC.md); use no em dashes in authored UX. OpenDesign's optional executable runtime remains disabled on security hold. Its dependencies are separate from the website application.

Production builds currently refuse release. Add the photographer's permitted originals and verified business information, complete the live receiving and data-handling checks, then follow the authorised release process. Local synthetic receipts do not establish actual email delivery or bookings.
