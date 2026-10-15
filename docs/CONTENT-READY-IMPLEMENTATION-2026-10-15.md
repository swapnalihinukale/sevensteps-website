# Content-ready implementation

15 October 2026. The user authorized the next implementation while the photographer's originals and business details are pending. This work extends the existing Astro application and GitHub Actions workflow. It does not deploy a site or activate live email.

## Build choices

GitHub Actions validates the single `feat/sevensteps-rebuild` branch. It installs the exact lockfile, checks types/content/copy, builds each supported test surface, checks release boundaries and file budgets, runs media/unit/PostgreSQL/browser tests, audits dependencies and scans shareable files. CI has read-only repository permissions and no deployment credentials. A container registry or Docker image adds no value to the selected static Astro and Netlify Functions deployment.

Image building means preparing responsive files before the site is served. The pipeline uses the existing sharp version, now pinned directly at 0.35.5. It generates AVIF, WebP and progressive JPEG with intrinsic dimensions, bounded sizes and content-based filenames. Only the selected full-frame image loads after viewer intent. Client JavaScript contains no image encoder.

## Implemented surfaces

- The existing review build keeps the 27 Add/Replace groups and non-sending form. All real content remains unresolved.
- `npm run build:fixture` produces `dist-fixture`, using clearly labelled geometric test images and an invalid example domain. It exercises actual images, public templates, metadata and omitted review routes without asserting owner approval. Its local server is `npm run preview:fixture` on port 4324.
- `npm run build:integration` produces `dist-integration`. `npm run lab:site` serves the actual designed form on port 4323 with an isolated temporary PostgreSQL database and synthetic notifications. Only that loopback server injects the active client. The files themselves retain disabled submission. No real email is sent.
- `npm run build:public` validates the real canonical slots, owner-supplied public records, approved media selection and recorded release evidence. It currently refuses because those inputs are absent. A rejection removes the previous deployable output. Fixture data cannot satisfy this mode.

Public data is rebuilt from an allowlist. The public and fixture outputs omit replacement notes and the checklist route. Page titles/descriptions, canonical and social URLs, sitemap and robots are generated from the validated site identity. Actual public content supports a confirmed direct-email contact path; activating the live form remains the separate B03 provider gate. Required privacy/contact content still applies.

The generated asset folder has an exact allowlist, including the two font licences. Derivative bytes must match their hash and manifest size. Extra files, symlinks, changed base assets, undeclared media and stale outputs fail validation. Originals remain under ignored `.local/media-masters`, never in the public folder. [Media pipeline](../site/docs/MEDIA-PIPELINE.md) and [content inputs](../site/content/README.md) describe the handoff.

## Defects corrected during review

- Long homepage titles and the footer name could overflow a 320px screen. Bounded mobile type, shrinkable grid items and word wrapping now preserve the content width.
- Disabling the focused Next or Previous viewer control could let Tab leave the dialog. Focus now moves to an enabled control at either end.
- Valid special characters in an email mailbox could become `mailto:` query or fragment syntax. The public contact uses the shared mailbox normalizer and URI encoding.
- Every third desktop gallery frame spans a wider area. Its responsive image sizes now follow the actual layout rather than the ordinary two-column width.
- A previous generated asset could remain beside the new media. Full output cleanup and exact-file validation cover wrapper and direct Astro builds.

## Verification

The final local validation passed. The [B04 evidence summary](../site/docs/audits/b04-summary.json) identifies source hashes, runtime versions, artifact budgets and the recorded checks. Saved command logs have trailing line whitespace removed; their result text is unchanged.

| Check | Result |
|---|---|
| Clean lockfile install | Passed with lifecycle scripts disabled |
| Astro diagnostics | 64 files, zero errors, warnings or hints |
| Unit tests | 41 passed |
| Image pipeline tests | 17 passed, covering formats, orientation, metadata, bounds and invalid inputs |
| PostgreSQL/backend tests | 99 passed; isolated test cluster stopped and removed |
| Browser journeys | 126 passed across Chromium, Firefox and WebKit, with no failures, retries or skipped cases |
| Responsive image geometry | Image sizes matched rendered frames within 2px across 12 widths from 320px to 2560px in all three engines |
| Build boundaries | Unresolved public output, direct-build bypass, hosted fixture/integration and unknown local modes rejected; ordinary review output restored |
| Artifact budgets | Review shell 94.77 KiB; fixture shell 92.48 KiB. Both include 3.70 KiB gzip JavaScript and 77.94 KiB fonts. These figures exclude images and are not real-photo transfer measurements. |

The browser suite also checks no-JavaScript navigation, failed images, reduced motion, keyboard focus, synthetic enquiry validation and retry states. Local cold-entry measurements with geometric images pass the configured transfer limits; real photographs still require their own measurements. Independent review of the final CI/build files found no additional actionable issues.

Manual review in native Safari 27.0.1 covered the story page at 200% browser zoom, menu reflow, gallery keyboard navigation and Escape-to-close. Zoom was restored and the temporary tab closed. This was a limited native-browser check, not the complete device or assistive-technology matrix.

Browser observations distinguish actual test engines from physical devices. A geometric test image can verify orientation, metadata, request selection, dimensions and error recovery. It cannot establish skin tones, fine fabric detail, final composition or real-photo transfer budgets. Windows, physical iOS/Android/iPad, screen readers and live-provider delivery remain explicit release checks where not exercised.

The deployment sequence remains: supply and approve real content, inspect actual derivatives, confirm contact/data handling and account authority, finish device/accessibility and provider checks, approve the exact release candidate, then deploy and verify it. Existing schema, source and original HTML history remain on the same reversible branch.
