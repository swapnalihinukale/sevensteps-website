# Independent review of the private draft

15 October 2026. Direction A, **Close to the people**. This review covers the implementation source named below and supplied captures of the homepage, both stories and content checklist. It is an independent source and composition review, not a release approval or a substitute for the implementation agent's test results.

## Outcome and scope

**REVIEW-01 passes within the reviewed source scope.** Four actionable source findings were corrected and re-inspected: malformed story options, an offscreen observer attached to the wrong element, focus lost across the navigation breakpoint, and a hidden no-JS Approach link. Targeted Chromium tests provide supporting behavior evidence. The [verification ledger](IMPLEMENTATION-VERIFICATION-2026-10-15.md#defects-and-retests) keeps each issue, fix and retest scope visible.

**REVIEW-02 passes within the private page/composition scope.** The reviewed desktop and phone pages and settled gallery viewer show a coherent layout with no open blocking composition finding in those screens. The earlier viewer ghosting was captured during its entry animation; the settled recaptures are opaque and clear. The implementation agent then removed the whole-panel opacity fade from viewer and menu while retaining translation. That source revision was re-inspected. Open menu, detailed failure states and short-height layouts remain part of wider quality coverage, beyond this scoped pass. Actual photographic selection, crops, colour, texture and high-density quality cannot be assessed from placeholders.

The reviewer did not rerun the browser suite or interact with a receiving service. No website code was changed during this documentation/review pass.

## Source snapshot

These files were read for controller logic, finite navigation, motion precedence, draft form behavior, ordinary navigation and relevant page structure. Later homepage/enquiry copy, opaque menu/viewer entry and the immediate visibility calculation used by Play were also re-inspected; the hashes below include those revisions. Hashes identify the re-inspected source, not every file in the application or a complete build artifact.

| File | SHA-256 |
|---|---|
| [UI controller](../site/src/scripts/ui.ts) | `a5c36e150f3b4c323ec12cf51af952618b0d010fecc706c2bd09d57710f4708d` |
| [Motion policy](../site/src/lib/motion.ts) | `48399fcea64310b0124fe39e8c8e22b7c0cd19df9aa0b0eb63b59bfe196c9c67` |
| [Enquiry component](../site/src/components/Enquiry.astro) | `143c263efdabd999f3cb4ad8a3a96d34317ab16ef051374194b1013d67be2747` |
| [Layout](../site/src/layouts/Layout.astro) | `bef813735758ecbdc1fe87eef8b11d3618a2cb98ff90bc7dbb656050440720c4` |
| [Homepage](../site/src/pages/index.astro) | `975b440cb0e31d598684ce14bdc2ff9975c41c76eeb0b2947e0e8b8f59bfc758` |
| [Story template](../site/src/pages/stories/[slug].astro) | `9186607fc8067bebc3fefb6f76f02e9c9d1bb02985169a5c28067d4e4ea3e37f` |
| [Checklist](../site/src/pages/content-checklist.astro) | `6632b63b91556e7553410a8e99819eccc7cdbecd1e1c810cd9a0db246f58b4c2` |
| [404 page](../site/src/pages/404.astro) | `e53036933fabbac84684df3f33ec88f3210f3eac06fd65eb6c9d25396cf38f18` |
| [Styles](../site/src/styles/global.css) | `295404682efd5b0242bb5f7a952ff5eab821d0b1a2e5fe0e2b2725d9bd0c580c` |

Aggregate SHA-256: `a99c3feb87eb5412e5cd76ec1c1d04dfaab2464f57b4eec45addd012bd2e7431`. It is computed from the listed order as one UTF-8 line per file: repository-relative path, one space, its SHA-256, then a newline. Re-review affected behavior if those sources change. The implementation agent still needs to bind the final test report to the complete candidate.

## Browser evidence read

The reviewer read [journeys.spec.ts](../site/tests/browser/journeys.spec.ts) and the result snapshot starting **2026-10-15T06:51:09.379Z**. It recorded Playwright 1.64.1, 16 Chromium passes, no unexpected/skipped/flaky results, and 6801.745 ms duration. The two later tests cover returning from the checklist to content inside a disclosure and blocked fonts/unavailable local storage.

Earlier history is attributed to the implementation agent: six failures in an initial 14-test Chromium run, fixes, then 14 of 14 passing. The reviewer independently inspected the later source and 16-test result. The mutable result file was subsequently overwritten by a Firefox launch attempt; the ledger records that environmental failure separately. The implementation agent later reported resolving the temporary-profile environment, passing a targeted Firefox retest after the Play visibility correction, and correcting transient menu contrast found in WebKit. This reviewer re-inspected the source corrections but did not inspect a final combined result. The final 17-journey, three-engine run remains the implementation agent's evidence to record.

The assertions include five-route axe/body-copy checks, menu/viewer states, finite gallery controls, focused Play and later inspection pause, reduced motion, draft form non-sending, content count/search/deep links, no-JS core navigation and font/storage failures. Overflow assertions exercise home, wedding and checklist at 16 widths from 320 to 2560, plus two short landscape sizes. This is narrower than visual approval of every layout at every width, browser zoom testing or physical-device coverage. The axe result does not certify accessibility.

## Captures actually viewed

The current [capture report](../site/docs/audits/2026-10-15T06-56-55Z-preview-measure.json) reports Chromium **156.0.8078.4**, desktop **1440x1000**, phone viewport **390x844**, and DPR 1. The phone profile is emulated with desktop network/CPU throttling; it is not a physical phone. The report is a capture/measurement run, not an interaction test.

| Surface | Captures inspected |
|---|---|
| Homepage, desktop | [Viewport](../site/docs/screenshots/2026-10-15T06-56-55Z-desktop-1440.png), [full page](../site/docs/screenshots/2026-10-15T06-56-55Z-desktop-1440-full.png) |
| Homepage, phone | [Viewport](../site/docs/screenshots/2026-10-15T06-56-55Z-mobile-390.png), [full page](../site/docs/screenshots/2026-10-15T06-56-55Z-mobile-390-full.png) |
| Wedding story, desktop | [Viewport](../site/docs/screenshots/2026-10-15T06-56-55Z-wedding-desktop-1440.png), [full page](../site/docs/screenshots/2026-10-15T06-56-55Z-wedding-desktop-1440-full.png) |
| Wedding story, phone | [Viewport](../site/docs/screenshots/2026-10-15T06-56-55Z-wedding-mobile-390.png), [full page](../site/docs/screenshots/2026-10-15T06-56-55Z-wedding-mobile-390-full.png); native-size crop of y=1300 to 2700 inspected |
| Couple story, desktop | [Full page](../site/docs/screenshots/couple-desktop-full.png), 1440x6239 |
| Couple story, phone | [Full page](../site/docs/screenshots/couple-mobile-full.png), 390x5499; native-size crops of y=0 to 1100 and y=3150 to 4500 inspected |
| Settled gallery viewer | [Desktop](../site/docs/screenshots/viewer-desktop-settled.png), 1440x1000; [phone](../site/docs/screenshots/viewer-mobile-settled.png), 390x844. The capture agent explicitly awaited active animations finishing. |
| Checklist, desktop | [Viewport](../site/docs/screenshots/2026-10-15T06-56-55Z-checklist-desktop-1440.png), [full page](../site/docs/screenshots/2026-10-15T06-56-55Z-checklist-desktop-1440-full.png) |
| Checklist, phone | [Viewport](../site/docs/screenshots/2026-10-15T06-56-55Z-checklist-mobile-390.png), [full page](../site/docs/screenshots/2026-10-15T06-56-55Z-checklist-mobile-390-full.png); native-size crop of y=850 to 2250 inspected |

The full-page images were downscaled by the viewer for an overview. They support sequence, rhythm and section-balance observations, not a claim that every fine-print line was checked. Native viewport images and four local detail crops supported closer inspection. The capture agent separately reported that the 06:56 homepage response hash matched its then-current `dist/index.html`; this reviewer did not independently bind all screenshots to a build hash. The later homepage/enquiry copy revision was read in source and in the newer couple-page form capture. Final homepage captures are being refreshed separately.

## Composition observations

1. **The hierarchy is clear.** The text wordmark, small service description and restrained navigation establish the site before the large serif statement. On desktop, the statement and lead placeholder have a clear relationship, with the smaller companion below the copy. Distinct sizes and generous spacing carry the hierarchy without decorative interface elements competing with the future work.
2. **The two occasions remain understandable.** Wedding story and Couple session appear as two choices with different image proportions. There is no invented third assignment or filter required to discover the available work. Their actual photographic distinction still depends on the supplied material.
3. **Both story sequences have useful variation.** The broad cover, context section, paired portrait frames and wider single frames create a readable sequence. The wedding phone detail crop preserves that pairing without visibly clipped captions or Add content links. The couple phone crops show distinct story context, visible motion controls, the other-story link and a clearly labelled non-sending form. Frame count and order are provisional and should change to suit a coherent real assignment.
4. **Draft notes are visible and truthful.** Missing work is identified as a photograph to add, and local burgundy requests lead into the checklist. The form plainly states that sending is not set up. These captures do not mistake placeholder colours or invented client details for a completed portfolio.
5. **The checklist is readable but deliberately substantial.** Initial counts, preparation instructions, search/section controls and separate content groups make its purpose clear. The phone detail crop shows distinct labels, status, instructions and return links. Its full-page height is about 15,749 px at 390 px width, so deep links and filtering are important; their behavior is supported by separate Chromium tests. It is an owner review aid, not a visitor-facing portfolio page.
6. **One nonblocking refinement remains.** In the 390x844 homepage capture, the lead image begins around y=570 after the brand, headline, copy, work link and introduction request. The first view is therefore text-heavy. When real photographs are available, compare a more compact introduction-note/spacing treatment so more of the lead is visible while preserving the brand/service context and work link. This is a visual recommendation, not an overflow failure or an instruction to suppress the draft notice.
7. **The settled viewer is easy to parse.** Its title and Close button sit above the image; the caption, content link, count and navigation remain outside it. Both checked widths distinguish the disabled Previous control from the available Next control. The phone capture keeps those controls visible without background-page text competing with them. Keyboard behavior is established by separate tests, not these screenshots.

## Remaining review work

- Keep open-menu, empty-search, visible-focus and relevant failure-state review in the wider quality coverage. Test results alone do not show their composition.
- Complete short-height, zoom, assistive-technology, real Safari/iOS, Android and other tiered coverage in the responsive specification. Automated Chromium, Firefox and WebKit are useful approximations with different limits.
- Replace provisional content with cleared source material before judging the photographic experience or approving public copy. Reassess sequence, full-frame versus cover crops, skin/colour/fabric detail and normal/high-density derivatives.
- Record the final build identity, final multi-engine results, security checks and actual load measurements in the verification ledger. Keep placeholder measurements distinct from a real-image production budget.

The current findings support continuing private review and content collection. They do not establish live enquiry receipt, universal browser/device support or public readiness.
