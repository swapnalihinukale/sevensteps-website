# Review-package verification, 15 October 2026

The [CI run at `3c57720`](https://github.com/swapnalihinukale/sevensteps-website/actions/runs/38757678728) passed **135 browser cases** in Chromium, Firefox and WebKit. Use this result for the current full browser suite. The earlier [B04 report](CONTENT-READY-IMPLEMENTATION-2026-10-15.md) records its 126-case baseline and image/backend measurements.

## Review package

The branch contains [owner-review.zip](../review/owner-review.zip) and [manifest.json](../review/manifest.json). The ZIP has 15 static files, labelled placeholders and a non-sending form. No hosted review URL exists. Use [the viewing instructions](../review/README.md); extracted pages need an HTTP server.

The manifest records hashes and the checkout at packaging, `289aebf`. That source stamp is distinct from the later commit containing the ZIP and the CI-tested commit. Regenerate the package after changing the website. Keep the manifest outside any upload directory.

The package checks reject fixture/integration/public builds, unexpected files, symlinks, source files, private paths and real media. Browser cases cover navigation, gallery keyboard use and focus return, checklist filtering, disabled submission, headers, and errors or external requests under the package CSP. The local preview uses the same bytes and headers. Noindex does not restrict access.

## Earlier focused checks

The [B05 summary](../site/docs/audits/b05-summary.json) records:

| Check | Result |
|---|---|
| Focused browser run | 27 passed: nine package cases and 18 repeated designed-form cases across three engines. |
| Package guards | 13 passed. |
| Astro | 65 files; zero errors, warnings or hints. |
| Content and punctuation | Source and rendered checks passed. |
| Sharing guard | Source check and eight tests passed. |

The form cases cover validation, pending field locking, durable receipts, restart/reload, context removal, linked server errors, preserved input, lost-response retries, no JavaScript and denied storage. These tests use temporary PostgreSQL and fake notifications. The 18 repeated cases do not add new coverage to the full-suite count.

## Native accessibility observations

| Check | Observation and limit |
|---|---|
| Chrome for Testing 156.0.8078.4, 400% browser zoom | The browser UI showed **Zoom: 400%**. The homepage wrapped and used its narrow menu. The wedding story and gallery opened; vertical scrolling exposed position, caption and controls. Escape closed the viewer and returned focus, but some key actions had delayed or inconsistent results. This was an incomplete journey, not a full keyboard pass at 400%. |
| Safari 27.0.1, text enlargement | Five **Make Text Bigger** commands enlarged and wrapped checklist headings, notes and navigation. Five inverse commands followed. The UI exposed no reliable percentage, so this does not verify 200% text-only enlargement or a full form journey. |
| VoiceOver | Settings showed off, then on, but the session supplied no reliable speech, caption or rotor output. A later check showed off. **Not passed.** Check landmarks, headings, menu/dialog announcements, focus return and form/error/receipt announcements in a working session. |
| Physical devices | No physical Windows, iPhone, iPad or Android coverage. Resized desktop viewports do not fill this gap. |

These checks used local review or synthetic pages. No live message was sent. B04 also records a limited native Safari 200% browser-zoom check.

## Unfinished checks and implementation

Implement the isolated real-content candidate preview and controlled media provisioning before testing the finished pages. Then complete screen-reader and device journeys, real-photo quality/transfer checks, and deployed security/cache checks. See [the implementation handoff](IMPLEMENTATION-HANDOFF.md) and [launch runbook](LAUNCH.md).

For a live form, public activation, provider acceptance/recovery, retention maintenance and monitoring remain unfinished. Arrange the account access, receiving mailbox, responder and data-handling decisions before those live tests. The implemented email-link option has separate destination and wording checks. Local test receipts prove neither email delivery nor a booking.
