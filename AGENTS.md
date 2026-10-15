# Seven Steps project instructions

## Read first

1. [EXECUTION-PLAN.md](EXECUTION-PLAN.md): current work and remaining tasks.
2. [MAINTAINER-GUIDE.md](docs/MAINTAINER-GUIDE.md): setup, source files and commands.
3. [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md): implemented colour, type, layout and motion.
4. [AI-HANDOFF.md](docs/AI-HANDOFF.md): continuation notes and test evidence.

For design changes, read the project [photographer adapter](.agents/skills/photographer-design-codex/SKILL.md) and [frontend-design skill](.agents/skills/frontend-design/SKILL.md). For prose, read [stop-slop](.agents/skills/stop-slop/SKILL.md) and [the writing guide](docs/COPY-AND-VOICE-SPEC.md). Use the project copies on a fresh clone.

## Current work

The Astro site, two story pages, checklist, responsive image pipeline, public templates and local enquiry backend exist. Continue from this implementation. Review the current placeholders before adding supplied photos and business details.

Local implementation, tests, documentation and pushes to `feat/sevensteps-rebuild` are authorized. The current handoff stays in GitHub, including `review/owner-review.zip` and its manifest. Do not deploy, set up Netlify accounts, buy services, change domains or send live messages under this scope. If hosting is requested later, use the Seven Steps account already chosen for it.

Keep the ordinary review form non-sending. Use synthetic data and fake notifications in the local labs. Leave live provider activation for its documented setup and acceptance tests.

## Git and files

- Use `swapnalihinukale/sevensteps-website`, branch `feat/sevensteps-rebuild`. Preserve `master`; commit changes without force-pushing or rewriting shared history.
- Use AtharvaBondre's repository-scoped GitHub credentials for pushes. Do not switch shared global authentication or create a replacement fork.
- Keep the older `website/` drafts as history. Punctuation cleanup is allowed; do not rebuild from their content or design.
- Keep secrets, original photo archives, private correspondence and live enquiries out of Git, logs and public output.
- Keep `.review-package/` and other working build directories ignored. Update the tracked review ZIP and manifest together after a website change.

## Content and writing

Write instructions to the reader: “your photos”, “your site”, “edit this file”. Cut chat history, repeated status explanations and template language. Use no em dashes in repository text or rendered copy. Preserve copyright/licence text and record edits to upstream references with their source hashes.

Keep the 27 content IDs stable. A Ready status or a populated `public.json` does not replace hardcoded review copy or photo calls. The maintainer guide shows the edit locations. The checklist displays requests; it does not upload or save content.

Do not invent biography, prices, awards, testimonials, team members or publication permission. The research associates Seven Steps Photography & Films in Pune with Yogesh Repale; it does not confirm current ownership or services. Use [the input list](docs/OWNER-INPUTS.md) for missing facts. Do not expect the current user to know them or message anyone without an instruction to do so.

## Design and tests

Keep **Close to the people**, the selected working design. Reuse its paired opening, two story choices and readable mobile order. Existing Netlify drafts and reference sites are research, not specifications to copy.

Preserve requested arrows, transitions and horizontal/vertical motion. Galleries start paused. Keep pause/reset controls, keyboard access and reduced-motion behavior. Use the saved [responsive](docs/RESPONSIVE-AND-RELIABILITY-SPEC.md), [motion](docs/MOTION-AND-INTERACTION-SPEC.md) and [quality](docs/QUALITY-AND-SECURITY-GATES.md) checks for changes to those features.

Report tests against the commit or build checked. Do not claim physical-device coverage from resized desktop browsers, or real-photo performance from placeholders. VoiceOver and the full real-device matrix remain unfinished. Stop manual servers on ports 4322 through 4325 before Playwright starts its test servers.

## Remaining implementation

Before reviewing real public content, build an isolated local preview path that accepts the real inputs without requiring release approval first. Keep the production refusal in place. Also finish controlled photo provisioning for remote builds. These are developer tasks; see [launch step 3](docs/LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review).

Public templates support a confirmed email link. A live form still needs public activation, actual provider tests, retention maintenance and operating access. Use the [provider decision](docs/LIVE-ENQUIRY-PROVIDER-DECISION.md) and launch guide. A receipt means stored enquiry, not email delivery or booking.

OpenDesign's runtime remains disabled after its dependency audit. Read its portable references without starting the daemon or bypassing the launcher. Do not change global skills, configuration or memory for this project.

Update the work plan and relevant evidence after a change. Keep research and earlier test reports available; link them instead of repeating their history in each guide.
