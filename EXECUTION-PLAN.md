# Seven Steps work plan

Updated 15 October 2026. Keep changes on `feat/sevensteps-rebuild` and share [the branch](https://github.com/swapnalihinukale/sevensteps-website/tree/feat/sevensteps-rebuild).

## Current version

The homepage, two stories and 27-item content checklist are ready to review. The image pipeline, public templates and local enquiry backend are implemented. The review form cannot send messages.

Review the layout before adding your photos and text. The repository includes [the ZIP](review/README.md), [editing instructions](docs/MAINTAINER-GUIDE.md) and [design values](docs/DESIGN-SYSTEM.md).

Delivery stays in GitHub. Hosting is deferred. If you request a hosted review later, use your Seven Steps Netlify account; access has not been arranged here.

## Next tasks

| Task | Who handles it | Complete when |
|---|---|---|
| Review the placeholder site | You and your team | Agree the layout changes, sections to keep and work to feature. You can send photos later. |
| Apply the agreed changes | Developer | Check affected pages, links, keyboard behavior and phone layouts; update the review ZIP and manifest. |
| Gather photos and text | You and your team | Supply the items in [the content list](docs/OWNER-INPUTS.md), with permission to publish the selected work. |
| B06: preview real content before release | Developer | Add an isolated local preview for the real inputs. Test it without fabricating approval or disabling production checks. |
| B06: supply photos to a remote build | Developer | Retrieve approved web masters from controlled storage and verify hashes; keep private archives and credentials out of Git. |
| V01/V02: check the real-content version | Developer, with your review | Check crops, colour, download sizes, text, chosen contact route, actual devices and assistive technology. Resolve findings before publishing. |
| L01: publish | Developer and account administrator | Complete [the launch procedure](docs/LAUNCH.md), approve the exact version, record rollback details and test the deployed site. |
| M01: review enquiries and bookings | Whoever replies to enquiries | Use [the register](docs/MEASUREMENT.md) to establish a baseline, compare outcomes and choose the next improvement. |

A live website form adds B03 provider setup, public form activation, delivery/recovery tests, monitoring and retention maintenance. The public templates already support a confirmed email link if that is your chosen first contact method.

## Completed work

| IDs | Result | Reference |
|---|---|---|
| P00, T03 | Work plan, skill map and writing checks | This file and [writing guide](docs/COPY-AND-VOICE-SPEC.md) |
| T01 | Project-local design skills and references | [Tool sources](.design-tooling/SOURCES.json) |
| R01, R02, R05 | 24 reference sites, 12 browser reviews and five public work samples; one portfolio page required sign-in | [Research brief](PHOTOGRAPHER-RESEARCH-AND-STRATEGY-2026-10-14.md), [browser review](docs/BROWSER-VISUAL-REVIEW-2026-10-15.md), [content assessment](docs/CONTENT-ASSESSMENT.md) |
| R03, R04 | Content request list and business-improvement questions | [Inputs](docs/OWNER-INPUTS.md), [research synthesis](RESEARCH-SYNTHESIS-AND-CONCEPTS.md) |
| C01, C02, C04 | Three concepts compared; direction A selected for review; seven prebuild findings addressed | [Design brief](DESIGN.md), [concepts](RESEARCH-SYNTHESIS-AND-CONCEPTS.md), [prebuild review](docs/PREBUILD-DESIGN-REVIEW.md) |
| C03, Q00 | 27 content IDs, replacement notes, responsive/motion requirements and test criteria | [Slot inventory](docs/CONTENT-SLOT-INVENTORY.md), [replacement guide](docs/CONTENT-REPLACEMENT-UX.md) |
| B01 | Astro/static architecture and durable enquiry design | [Technical decisions](docs/TECHNICAL-DECISIONS.md), [enquiry architecture](docs/ENQUIRY-ARCHITECTURE-REVIEW.md) |
| B02 | Homepage, story pages, menu, gallery and motion controls | [Implementation review](docs/IMPLEMENTATION-REVIEW-NOTES-2026-10-15.md) |
| B03, local portion | PostgreSQL receipt/outbox handling, retries and synthetic test labs | [Backend report](docs/BACKEND-IMPLEMENTATION-2026-10-15.md) |
| B04 | Responsive AVIF/WebP/JPEG generation, public templates and designed form integration | [Implementation report](docs/CONTENT-READY-IMPLEMENTATION-2026-10-15.md) |
| B05 | Editing/design guides, review ZIP, package checks and CI download | [Handoff tests](docs/OWNER-HANDOFF-VERIFICATION-2026-10-15.md), [review package](docs/REVIEW-PACKAGE.md) |

T02 remains on hold: the optional OpenDesign runtime has unresolved dependency advisories. Its text references are available. The website does not need the daemon. See [the audit](.design-tooling/DEPENDENCY-AUDIT-2026-10-15.md) before any attempt to enable it.

## Use the right guidance

| Work | Read/use |
|---|---|
| Layout, typography, colour and interactions | [Photographer adapter](.agents/skills/photographer-design-codex/SKILL.md), then [frontend-design](.agents/skills/frontend-design/SKILL.md), [design system](docs/DESIGN-SYSTEM.md) and the relevant portable OpenDesign reference |
| Text and documentation | [stop-slop](.agents/skills/stop-slop/SKILL.md) and [writing guide](docs/COPY-AND-VOICE-SPEC.md) |
| New research questions | The saved research first, then browser inspection through the `unified-computer-use` plugin where available; record the source and access limits |
| Photos and supplied PDFs | [Media pipeline](site/docs/MEDIA-PIPELINE.md); use a PDF-reading skill if a PDF arrives, while retaining original image files for production |
| Enquiry changes | [Provider decision](docs/LIVE-ENQUIRY-PROVIDER-DECISION.md), local PostgreSQL tests and fake notification providers |
| UI verification | Playwright, axe, browser inspection and the required physical devices; apply [responsive](docs/RESPONSIVE-AND-RELIABILITY-SPEC.md), [motion](docs/MOTION-AND-INTERACTION-SPEC.md) and [quality](docs/QUALITY-AND-SECURITY-GATES.md) checks |
| Review and publication | [Package guide](docs/REVIEW-PACKAGE.md), GitHub Actions and [launch guide](docs/LAUNCH.md); use provider tools only for the agreed account and action |
| Skill maintenance | Use skill-installer or skill-creator when needed; preserve licences, source commits and local edits |

The Code Review plugin can inspect checks if a PR is created. `codex-app-tools` can open files and previews. Neither is a website dependency. A fresh Claude or Codex session should start with [AGENTS.md](AGENTS.md) and [AI-HANDOFF.md](docs/AI-HANDOFF.md).

## Verification still needed

The automated suite covers Chromium, Firefox and WebKit, with layout widths from 320 to 2560 CSS pixels and failure/retry cases. Use the dated reports for exact counts and checked commits. A planned check is not a pass.

Finish VoiceOver, complete zoom/text-enlargement journeys and the physical Windows, iPhone, iPad and Android checks on the real-content version. The previous native zoom observations covered part of the site. VoiceOver did not remain active in the test environment.

Measure real-photo quality and transfer size after integration. The field targets are LCP at most 2.5s, INP at most 200ms and CLS at most 0.1 at the 75th percentile. Keep lab measurements separate from field results.

Before public release, confirm names, services, usage rights, your reply destination and the person handling enquiries. Check the final domain, redirects, metadata, headers, backup and rollback. Live forms also need tested storage, receipt recovery and provider delivery. Keep existing mail/DNS records intact.

## Record progress

Update the affected task after checking it. Link the test report or commit, and name what remains. Keep completed research available instead of restarting it. Preserve current package pins and design choices unless a specific change warrants reconsideration.
