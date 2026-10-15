# Owner handoff and review checks, 15 October 2026

This report extends the [B04 evidence](CONTENT-READY-IMPLEMENTATION-2026-10-15.md). The user chose to show the labelled-placeholder version before supplying real content. Content integration waits by choice. Independent documentation, packaging and quality checks continue.

## What this change adds

- A portable maintainer guide with setup, architecture, file map, editing paths, exact package/runtime choices, test commands and reversal instructions.
- A design-system reference for implemented colours, type, layout, spacing, imagery, states, motion and responsive behavior, with source locations.
- Claude/Codex entry instructions and a project-local, licensed stop-slop skill. These preserve project context without relying on the original maintainer's home directory.
- A launch/rollback/operator runbook and a manual enquiry-to-booking worksheet with a separate synthetic example. These documents do not provision live services or establish a measured business uplift.
- A static owner-review export, reproducible ZIP, external provenance manifest and local server using the upload's security headers. CI tests and attaches the review package without deploying it.

## Native accessibility observations

These are bounded observations, not a completed accessibility certification or the full release matrix.

| Check | Observed result | Remaining scope |
|---|---|---|
| Genuine browser zoom | Native Chrome for Testing 156.0.8078.4 exposed **Zoom: 400%** in its browser UI. The review homepage wrapped and used the narrow-screen menu. The wedding story and gallery opened; gallery position, caption and controls remained reachable by vertical scrolling. Escape eventually closed the viewer and focus returned to its opener. | This was not a complete 400% journey on every route. Some native key actions returned delayed or inconsistent state, so a full keyboard pass is not inferred from this observation. Recheck the exact real-content candidate. |
| Native text enlargement | Safari 27.0.1 applied its **Make Text Bigger** menu command five times. The checklist heading, notes and navigation enlarged and wrapped in the observed viewport. Five inverse **Make Text Smaller** actions followed. | The UI did not expose a reliable numeric scale. Do not label this a verified 200% text-only pass or a complete form journey. |
| VoiceOver | The System Settings switch initially showed off, then on after activation. No reliable speech, caption or rotor output could be observed. A later settings check showed it off; the runtime did not remain available. | **Not passed.** A maintainer with a working VoiceOver session must check landmarks, headings, menu/dialog announcements, focus return and form/error/receipt announcements. Automated axe checks do not substitute for that. |
| Physical Windows and mobile/tablet | No physical Windows, iPhone, iPad or Android device was available for this check. | Test the documented real-device matrix before launch. Desktop browser engines and resized viewports are separate evidence. |

The native tests used local review/synthetic routes. No real contact data or live message was submitted. Temporary native browser tabs were closed after checks. The original user preview at port 4321 remains available. The local enquiry lab uses disposable PostgreSQL and fake notifications; its process was stopped before automated tests took ownership of the test ports.

## Automated review-package and form checks

The new package browser cases cover mobile navigation, keyboard gallery operation/focus return, checklist filtering, no external resource requests, no browser errors under the restrictive CSP, disabled submission, no typed data in URLs, private-path rejection, request-method restrictions and headers on direct routes/404 responses. They run in Chromium, Firefox and WebKit.

The designed-form regression suite checks keyboard validation and submission, pending field locking, truthful local receipts, reload/restart, removable story context, linked server errors, retained user input, lost-acknowledgement retry with the same durable receipt, no JavaScript and denied storage. These synthetic tests cannot establish spoken screen-reader output or real provider delivery.

The focused local run passed all 27 browser cases: nine new package cases and 18 repeated designed-form cases across the three engines. The package guard suite passed 13 tests. Astro check reported zero errors, warnings or hints across 65 files; content and source/rendered punctuation checks passed. The checked export contains 15 static files. The source-sharing guard and its eight tests passed. [The machine-readable summary](../site/docs/audits/b05-summary.json) records source hashes, the focused browser result and package hashes. GitHub Actions reruns the full suite for the pushed commit and attaches the owner-review ZIP after success. No browser deployment has been performed. B04's 126 browser cases, 41 unit tests, 17 media tests and 99 backend tests describe the earlier committed baseline; do not add a focused repeat to those counts as though it were new coverage.

## Remaining work belongs to the right owner

The next visible milestone is the hosted placeholder review and consolidated feedback. It needs a named hosting account and an authorized upload. Real photographs, business facts and branding approval can follow.

The maintainer still owns the isolated real-content candidate preview, controlled production media provisioning, remaining real-device/screen-reader checks and actual hosted security/cache verification. The current real public build requires release evidence before rendering, so the candidate path must be implemented before asking anyone to approve that real artifact. This technical prerequisite is not an owner content blocker.

If a live form is chosen, the maintainer also owns its public activation path and real-provider acceptance, retention maintenance and monitoring. The owner supplies the correct accounts, recipient, responder and data-handling decisions. The first public version may use the already implemented, verified-email contact path if agreed. See [LAUNCH.md](LAUNCH.md) for the exact gates.
