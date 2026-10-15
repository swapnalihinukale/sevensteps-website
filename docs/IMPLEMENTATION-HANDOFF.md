# Seven Steps implementation handoff

The application lives in `site/`. Use the [maintainer guide](MAINTAINER-GUIDE.md) for the stack, source map, installation and test commands. Use the [execution plan](../EXECUTION-PLAN.md) for task status.

## Implemented

The Astro static frontend has a homepage, two story routes, content checklist and 404 page. Native CSS and TypeScript handle navigation, disclosures, a keyboard-accessible gallery and optional finite gallery movement. Reduced motion stops automatic movement; ordinary links and essential content work without JavaScript.

The selected design is **Close to the people**. Change colours, type, layout and timing through the [design system](DESIGN-SYSTEM.md). If you change photo geometry, update `site/src/lib/image-sizes.ts` and its browser checks too.

The [image pipeline](../site/docs/MEDIA-PIPELINE.md) produces bounded AVIF, WebP and JPEG derivatives from local masters, applies orientation and sRGB conversion, and strips metadata. Public templates validate an allowlisted content shape, omit review notes and derive metadata from approved inputs.

The [local backend](BACKEND-IMPLEMENTATION-2026-10-15.md) stores an enquiry and notification job in one PostgreSQL transaction. It handles idempotent retries, provider events and operator recovery. Tests use disposable databases and fake notifications. Live delivery still needs implementation and acceptance work below.

## Build modes

| Mode | Output and purpose |
|---|---|
| Review | `dist/`, port 4321. Labelled placeholders, 27 unresolved content groups and a non-sending form. |
| Fixture | `dist-fixture/`, port 4324. Public templates with geometric test images. |
| Integration | `dist-integration/`, port 4323 through `lab:site`. The server activates the designed form against temporary PostgreSQL and fake notifications. The static files alone retain disabled submission. |
| Public | `dist/` after content, media, canonical and release checks. Required inputs are absent, so this build refuses. Templates support a confirmed email link; a live form needs separate activation. |

Keep the outputs separate. Follow the maintainer guide's build order and server instructions. CI tests the branch without deploying it; this architecture needs no container image or registry.

## Review delivery

The branch includes [review/owner-review.zip](../review/owner-review.zip), its manifest and [viewing instructions](../review/README.md). Share that branch or download link. No live review URL exists. Regenerate the package after website changes; a documentation edit alone does not change its HTML.

The checklist displays and filters content requests. Edit the source files to change text or photos; setting a record to `Ready` does not replace a page element. Follow [public content inputs](../site/content/README.md) when preparing the finished pages.

## Remaining engineering

1. **B06: isolated real-content preview.** Add and test a candidate build before release approval. Current public rendering requires approval evidence, while review and fixture modes cannot render the final candidate. Do not bypass that gate. Follow [Launch, step 3](LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review).
2. **Production media provisioning.** Give an authorized build controlled access to selected web masters. Keep originals out of Git and `public/`; record input hashes.
3. **Release verification.** Check real photos' quality and transfer, full zoom and screen-reader journeys, physical devices, and deployed headers/cache behavior. The [verification report](OWNER-HANDOFF-VERIFICATION-2026-10-15.md) records current limits.
4. **Live form, if selected.** Implement public activation, verify provider receipt/recovery and operator access, then test retention maintenance and monitoring. Follow the [provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md) and [launch runbook](LAUNCH.md). Account access, the receiving mailbox, responder, costs and data-handling choices precede live tests.

Keep these tasks distinct from adding the photos and text requested in the checklist. The latest recorded [CI run](https://github.com/swapnalihinukale/sevensteps-website/actions/runs/38757678728) passed 135 browser cases at `3c57720`. Earlier measurements remain in [B04](CONTENT-READY-IMPLEMENTATION-2026-10-15.md); they do not establish real-photo performance or live delivery.

For assistant continuation, use [AI-HANDOFF.md](AI-HANDOFF.md). Keep changes on `feat/sevensteps-rebuild` and follow [Git workflow](GIT-WORKFLOW.md) for reversals.
