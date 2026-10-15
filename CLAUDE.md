# Seven Steps website

Read [AGENTS.md](AGENTS.md) first and follow its current instructions. Then read [docs/AI-HANDOFF.md](docs/AI-HANDOFF.md), [docs/MAINTAINER-GUIDE.md](docs/MAINTAINER-GUIDE.md) and [EXECUTION-PLAN.md](EXECUTION-PLAN.md). These files make the project portable across Claude, Codex and developer machines.

For the current owner review, use [Preview sharing](docs/PREVIEW-SHARING.md) and [Owner handoff verification](docs/OWNER-HANDOFF-VERIFICATION-2026-10-15.md). The latter separates focused package/form checks from the historical full-suite baseline and records bounded native-browser observations. VoiceOver output was unavailable; no screen-reader pass is recorded.

The current baseline is `8ef0d59` on `feat/sevensteps-rebuild`. The user is waiting for real photographer material and wants to review the existing site with useful placeholders. The Astro application, image pipeline, gated public rendering and synthetic local backend already exist. Reuse them. Do not restart design or stack selection, invent portfolio content or treat missing owner input as permission to publish.

Before release approval, the maintainer must implement and test the guarded, isolated real-content candidate path in [release step 3.5](docs/LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review). That engineering work remains open. Review/fixture modes do not provide the final candidate, and the public mode requires completed release evidence; do not bypass its gate to obtain a preview.

Before design work, read `.agents/skills/photographer-design-codex/SKILL.md`, then `.agents/skills/frontend-design/SKILL.md`. For copy and documentation, read `.agents/skills/stop-slop/SKILL.md` and its referenced files. Use the local copies if older documents refer to machine-specific global paths. Apply the project rule: no em dashes in authored text. Preserve upstream quotations and licences.

Use Node 22.23.2 and npm 10.9.8 in `site/`. A normal start is `npm ci --ignore-scripts`, `npm run build`, then `npm run preview` at `http://127.0.0.1:4321/`. Full backend/browser testing also needs native PostgreSQL 16 or newer and the installed Playwright engines. The maintainer guide has the complete commands and mode boundaries.

Keep changes on `feat/sevensteps-rebuild`, preserve original `website/` files, inspect the working tree and use reviewable commits. Do not merge into `master`, force-push or change shared global authentication. The ordinary review stays non-sending. The local labs use synthetic data and fake notifications. Publishing, live accounts, real messages, domain changes and paid services require their separate authorization and factual inputs.

OpenDesign's executable runtime remains on security hold. Its portable text references are usable; do not start the daemon or bypass the guard. Keep secrets, originals and private correspondence outside tracked files and public output. Read the current B04 evidence before stating test results, and distinguish recorded results from checks you run in this session.
