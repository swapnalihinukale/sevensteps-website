# Continue work with Claude or Codex

Work in `site/` on `feat/sevensteps-rebuild`. Reuse the Astro frontend, image pipeline, public templates and local enquiry backend. Keep the selected **Close to the people** design.

## Read in this order

1. [AGENTS.md](../AGENTS.md) for instructions and [EXECUTION-PLAN.md](../EXECUTION-PLAN.md) for the next task.
2. [Maintainer guide](MAINTAINER-GUIDE.md) for installation, source files, commands and build modes.
3. [Implementation handoff](IMPLEMENTATION-HANDOFF.md) for completed code and open engineering work.
4. [Design system](DESIGN-SYSTEM.md) before visual changes; [verification report](OWNER-HANDOFF-VERIFICATION-2026-10-15.md) before claiming coverage.

Use paths relative to your clone. Older research reports may contain paths from the original machine.

## Skills

For design, read [photographer-design-codex](../.agents/skills/photographer-design-codex/SKILL.md), then [frontend-design](../.agents/skills/frontend-design/SKILL.md). For text, read [stop-slop](../.agents/skills/stop-slop/SKILL.md), its three references and the [copy rules](COPY-AND-VOICE-SPEC.md). Write specific instructions to the reader. Use no em dashes in authored text; preserve upstream licence text.

The project includes these skills and their provenance. Read them as files if your assistant does not discover them. OpenDesign's [text references](../.agents/skills/photographer-design-codex/references/open-design/README.md) remain usable; keep its executable runtime disabled under the recorded security hold. Do not change global skills, authentication or configuration.

## Current work

The branch contains [the review ZIP](../review/README.md), source and guides. Review pages retain 27 Add/Replace groups and a non-sending form. Collect feedback against page URLs and content IDs. Use the [content schema](../site/content/README.md) and [media guide](../site/docs/MEDIA-PIPELINE.md) when adding supplied material.

For the 17 October 2026 structure change, keep one site/domain and two homepage features. Generate detail routes, navigation and sitemap from the 2 to 24 story records; add `/stories/` only above two stories. Keep the two review placeholders and checklist IDs. Use the [story editing contract](../site/content/README.md#add-a-story-and-choose-the-homepage-features), including feature order and next-story wrapping. Four synthetic fixture stories exercise growth and stay out of review/public output. Developer ports are local tools; share the public homepage as the visitor entry point.

The [17 October verification](../EXECUTION-PLAN.md#17-october-verification) records the checked code commit, local results and review package. Check CI against the branch commit you use.

Implement B06's isolated real-content preview before seeking release approval. Current public builds require release evidence before rendering; review and fixture modes cannot provide that final candidate. Preserve the production gate and add tests for the new preview boundary. See [Launch, step 3](LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review).

Other open code and verification tasks appear in the implementation handoff. Missing photos do not prevent that engineering work. Keep optional features tied to an agreed requirement.

## Edit, verify and save

Check the branch, remote and working tree before editing. Preserve `website/`, keep `master` unchanged and use reviewable commits on the existing branch. Do not force-push or substitute a fork.

Follow the maintainer guide's checks for the affected behavior. Inspect rendered UI after visual changes. Run one build per output directory and let Playwright manage its test servers. The earlier [CI run](https://github.com/swapnalihinukale/sevensteps-website/actions/runs/38757678728) passed 135 browser cases at `3c57720`; it predates the structure change. Record new checks against the changed build.

Keep review forms non-sending and use synthetic enquiries in local labs. Keep credentials, private correspondence, originals and enquiry records outside Git and public output. Publishing, paid services, DNS/account changes and live messages require their specific authorization. Approval files must record completed checks.

Update the execution plan and relevant evidence after a change. Before committing, inspect the diff and run `node scripts/check-shareable.mjs` from the repository root. Report the changed files, checks and unfinished work. A GitHub ZIP link is a download, not a hosted website.
