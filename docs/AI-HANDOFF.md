# Handoff for Claude, Codex and a new developer

Start here in a fresh clone. The source baseline is commit `8ef0d59` on `feat/sevensteps-rebuild` in [swapnalihinukale/sevensteps-website](https://github.com/swapnalihinukale/sevensteps-website). The user is waiting for real photos and business details, and wants to review the existing placeholder website. Preserve that state. The frontend, image pipeline, public rendering and local backend already exist; do not restart framework or design selection.

## Read in this order

1. [AGENTS.md](../AGENTS.md), then [EXECUTION-PLAN.md](../EXECUTION-PLAN.md). They contain project instructions, scope and the authoritative status register.
2. [The maintainer guide](MAINTAINER-GUIDE.md) for setup, scripts, file ownership, content editing and safe reversals.
3. [The design system](DESIGN-SYSTEM.md) and [DESIGN.md](../DESIGN.md) before visual work.
4. [The current implementation report](CONTENT-READY-IMPLEMENTATION-2026-10-15.md) and [B04 evidence](../site/docs/audits/b04-summary.json) before describing tests as complete.
5. [Preview sharing](PREVIEW-SHARING.md) for the checked owner-review package and [owner handoff verification](OWNER-HANDOFF-VERIFICATION-2026-10-15.md) for later focused checks and bounded native-browser observations.
6. The relevant input or service reference: [public content](../site/content/README.md), [image preparation](../site/docs/MEDIA-PIPELINE.md), [backend implementation](BACKEND-IMPLEMENTATION-2026-10-15.md) or [live provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md).

The dated B02/B03 reports and research remain useful history. Their smaller test counts and older artifact sizes are not the latest baseline. Some older documents contain the original machine's absolute paths. Resolve project files relative to this clone, and use the portable skills below instead of requiring `/Users/admin`.

## Portable skills and tool boundaries

| Work | Local guidance |
|---|---|
| Design and implementation | Read [photographer-design-codex](../.agents/skills/photographer-design-codex/SKILL.md), then the pinned [frontend-design](../.agents/skills/frontend-design/SKILL.md). The adapter is readable by either assistant; its name does not require Codex APIs. |
| Copy, notes and documentation | Read [stop-slop](../.agents/skills/stop-slop/SKILL.md), then its phrase, structure and example references. The project rule forbids em dashes in authored copy. |
| Typography, colour, accessibility, forms and motion | Read the relevant portable OpenDesign reference under [the adapter's references](../.agents/skills/photographer-design-codex/references/open-design/README.md). |
| New owner PDF | Use an available PDF-reading tool only when the file arrives. A PDF preview does not replace original photographs or permission. |
| Browser review | Use available browser automation plus screenshots and the installed Playwright checks. Record actual engines/devices and any limits. |

The pinned frontend-design copy is Apache-2.0; the portable stop-slop copy is MIT with its upstream commit, hashes and licence retained. The OpenDesign text references have their preserved notices. See [tool provenance](../.design-tooling/SOURCES.json) and [stop-slop provenance](../.agents/skills/stop-slop/PROVENANCE.json).

Do not run or reinstall the OpenDesign application to work on this site. Its executable runtime remains on a dependency security hold. Earlier successful protocol checks do not clear that hold. The website uses its own Node/npm stack and needs no paid model API call or design daemon. Do not change a developer's global skills, configuration, authentication or memory to continue this repository.

An assistant does not need automatic skill discovery to use this guidance: read the local Markdown files. Claude's entry file is [CLAUDE.md](../CLAUDE.md); Codex should use `AGENTS.md` and this handoff. If an older adapter line points to the former global stop-slop location, use the bundled project copy.

## Settled implementation

- Astro 7.3.8 static output, TypeScript 6.0.3 and native CSS/TypeScript interactions. Node 22.23.2, npm 10.9.8, exact package pins and one lockfile under `site/`.
- Direction A, **Close to the people**. Paper, Ink, Leaf, Pomegranate and Mist; local Source Serif 4 and Source Sans 3. Preserve the paired opening, two visible story choices and usable mobile reading order.
- Review homepage, two story pages, content checklist and recovery page. Twenty-seven stable Add/Replace groups are unresolved. No real portfolio content or owner-approved business representation is implied.
- sharp 0.35.5 image preparation, responsive derivatives, natural/full-frame viewing, failure recovery and geometry-tested `sizes` declarations.
- Public templates rebuild an allowlisted data shape and omit review routes/notes. Actual public builds remain blocked by absent approved content, canonical readiness and release evidence. Synthetic fixtures cannot satisfy those gates.
- The maintainer still needs to implement a guarded, isolated real-content candidate path before release approval. This engineering prerequisite appears in [release step 3.5](LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review). Existing review/fixture modes cannot provide the final candidate, and the public mode already requires release evidence. Do not bypass that gate or fabricate evidence to preview real work.
- A local durable PostgreSQL enquiry receiver, idempotent receipt/outbox flow, bounded notification retries, signed-event handling and operator restrictions. Local tests and fake notifications work. Real accounts, deployment, provider receipt/recovery acceptance and live form activation remain pending.
- A confirmed email link is the supported public-template contact option before a separately accepted live form. Its required contact/privacy facts still need owner approval.
- GitHub Actions checks the single branch with no deployment credentials. Docker, a registry, Kubernetes, a CMS and a custom admin portal are outside the selected implementation.

The current source file map and commands are in the maintainer guide. Read those before searching the entire repository or copying an old HTML draft.

## Safe continuation contract

Check `git status`, the branch and the remote before editing. Keep project changes on `feat/sevensteps-rebuild`, preserve `website/`, use coherent commits and keep `master` unchanged. The user authorized saving project work to this branch. Do not force-push or replace the repository with a fork. Use the intended collaborator account without switching shared global authentication.

Keep the ordinary review non-sending. Use synthetic data in local enquiry tests. Keep genuine enquiry data, credentials, originals and private permission correspondence out of Git, logs, client bundles and generated public files. A public profile establishes a research lead, not current ownership, rights or account control.

Publishing, domain/account changes, paid services, real form submissions and outreach retain their own authorization and factual prerequisites. Do not infer them from permission to edit the site. Approval evidence files describe completed checks; do not populate them with invented names or generic success text to bypass a refusal.

Avoid weakening a test or build gate to make an unfinished input appear complete. Diagnose the missing input, keep its state visible in the review and continue independent authorized work. The current wait for real content is intentional. Do not fill it with extra libraries, speculative features or invented photographer copy.

## Reproduce the baseline

From `site/`, use the exact Node/npm version, `npm ci --ignore-scripts` and the native PostgreSQL/browser prerequisites in the maintainer guide. Build review, fixture and integration before the browser suite. Run `npm run test:build`, which restores review output, then `npm run package:review`. The full `npm run test` includes the focused `test:review-package` command. Use `npm run preview:review-package` on port 4325 for manual inspection of the upload bytes and headers. Stop manual servers on ports 4322 through 4325 so Playwright can own and clean up its instances. Do not run concurrent builds into the same output directory.

The recorded checks at `8ef0d59` are 41 unit, 17 image, 99 backend and 126 browser cases, with no failures or skipped cases. These counts describe the saved artifact. They do not claim a fresh run on the next computer. Run checks appropriate to a change and report that run's exact result; a documentation-only edit does not require repeating the full browser suite.

The saved coverage includes Chromium, Firefox, WebKit, 12 image-layout widths from 320 to 2560px, reduced motion, no JavaScript, image errors, token/receipt recovery and database races. A limited native Safari 27.0.1 check covered 200% zoom and gallery/menu interaction. Physical Windows/mobile/tablet coverage, screen readers, real photographic fidelity/transfer and live-provider operation remain separate release checks.

The later focused browser run passed 27 cases: nine new review-package cases and 18 designed-form repeats. Do not add the repeats to the baseline or claim a new full-suite/CI pass from this run. The owner handoff report records bounded Chrome 400% zoom and Safari text-enlargement observations, with incomplete journeys and no reliable Safari text-only percentage. VoiceOver output was unavailable. A working screen-reader session remains required.

## Starting prompts

For a read-only review:

> Read AGENTS.md, docs/AI-HANDOFF.md, docs/MAINTAINER-GUIDE.md and the current B04 evidence. Check the branch and working tree. Review the existing placeholder site using the local design and writing skills. Report specific usability or maintenance findings with source locations and verification limits. Keep this task read-only and preserve the review and live-activation boundaries.

For a specific approved change:

> Read the project instructions and handoff, then implement the requested change on feat/sevensteps-rebuild. Reuse the chosen architecture and design. Explain the affected files, run the checks appropriate to the behavior, inspect the rendered result when UI changes, and update the relevant status/evidence record. Preserve labelled missing content and keep live delivery and deployment gated.

For supplied owner material:

> Read the public-content and media guides. Inventory the supplied files and owner statements against the canonical slot IDs. Separate received material from checked, permitted content. Integrate only the material authorized for this review, retain useful notes for unresolved items, inspect real crops and image quality, and report what remains before public release. Do not activate a contact destination or publish without its specific prerequisites.

## Finish a turn with a useful handoff

State what changed, where it lives, what passed and what still depends on owner material or external acceptance. Link the local preview or review artifact without implying that localhost is shareable. Record new evidence in the relevant report and update the execution status instead of duplicating the research brief. Before committing, review the diff and run the repository's sharing guard. No secrets belong in an assistant transcript or handoff.
