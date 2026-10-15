# Private Astro draft: implementation verification

Historical B02 baseline: this ledger records the first private UI candidate. The current backend and Git work is recorded in [B03 implementation](BACKEND-IMPLEMENTATION-2026-10-15.md). Its source and lockfile hashes below identify B02, not the later B03 checkout. The browser JSON was redacted before sharing to remove inherited environment variables; test outcomes remain unchanged.
15 October 2026. **B02 private draft complete. All 51 browser cases and 19 logic tests pass. Public-release checks remain open where noted.** The user authorized a private draft using direction A, Close to the people. This file records the actual evidence and its limits. It does not approve publication.

Use the [execution plan](../EXECUTION-PLAN.md) for task status and the [design brief](../DESIGN.md), [technical decisions](TECHNICAL-DECISIONS.md), [prebuild findings](PREBUILD-DESIGN-REVIEW.md), [quality/security gates](QUALITY-AND-SECURITY-GATES.md), [responsive specification](RESPONSIVE-AND-RELIABILITY-SPEC.md), [motion specification](MOTION-AND-INTERACTION-SPEC.md) and [copy rules](COPY-AND-VOICE-SPEC.md) for acceptance. Do not mark a requirement satisfied merely because it appears in those documents.

## Scope and evidence rules

The current deliverable is a local, private review site: homepage, two story views, shared review checklist, recoverable 404 and the agreed controls. Missing material uses specific Add/Replace notes. The enquiry must remain non-sending. Do not submit to a real recipient, publish, change accounts/domains or contact people as part of these checks.

Record the exact candidate build, test environment, command or manual steps, observed result and evidence location. A changed candidate needs retests for the affected paths. Keep failures and their later retests visible. Do not replace an unavailable device, skipped check or failed scanner with a pass.

Allowed results are **Pass**, **Partial**, **Fail**, **Blocked**, **Not run** and **Not applicable with reason**. Partial means some of a row's acceptance has evidence while named checks remain open. A row can pass only the behavior and environment actually exercised. A test double does not prove live receipt, an emulated viewport does not prove a physical device, and a placeholder does not prove photographic fidelity.

## Recorded evidence and retest history

The implementation agent reported six failures in the initial 14-test Chromium run, followed by 14 of 14 passing after corrections. That history is retained; the independent reviewer did not inspect the initial failing report. After two more tests were added, the independent reviewer read a Playwright 1.64.1 result starting **2026-10-15T06:51:09.379Z**: **16 expected passes, zero unexpected, skipped or flaky results**, all in the Chromium project. The reviewer read the tests and results rather than executing that run.

The mutable [test result file](../site/test-results/results.json) was subsequently overwritten by a targeted Firefox attempt starting **2026-10-15T06:59:15.911Z**. It failed before exercising the page because Firefox could not find its temporary profile folder. That attempt is an environment blocker, not evidence of a gallery defect or a Firefox pass. The implementation agent later reported resolving that environment, a targeted Firefox pass after the Play visibility correction, and a transient menu-contrast correction found during WebKit testing. The independent reviewer re-inspected those source changes; the implementation agent owns the final 17-journey, three-engine run and exact candidate identity. Do not treat the earlier Chromium snapshot as the latest file contents.

The [independent review notes](IMPLEMENTATION-REVIEW-NOTES-2026-10-15.md) record the source reviewed, four corrected source findings, the supplied homepage/story/checklist screenshots actually viewed, composition observations and remaining visual scope. Screenshots do not prove keyboard, networking or motion behavior.

## Final private-candidate result

At **2026-10-15T07:14:00.433Z**, the final Playwright run completed **51 expected passes, zero failures, skips or flaky results** in 29.4 seconds: 17 journeys each in Chromium, Firefox and WebKit. The earlier Firefox startup problem is resolved through process-only scratch app-data directories in `site/playwright.config.ts`; no existing browser profile or security setting changed. A subsequent Firefox keyboard test exposed an observer-delivery race, which now uses current image-window geometry at Play. WebKit exposed transient menu contrast during a fade; the menu and viewer now keep an opaque background and text while translating.

Evidence: [final browser JSON](../site/docs/audits/final-browser-results.json), [browser log](../site/docs/audits/final-browser-tests.log), [19 logic tests](../site/docs/audits/unit-tests.log), [clean installation](../site/docs/audits/clean-install.log), [type/content/copy checks](../site/docs/audits/final-check.log), [build and 178 local link/asset checks](../site/docs/audits/final-build.log), [public-build refusal](../site/docs/audits/public-build-refusal.json), [final source manifest](../site/docs/audits/final-source-manifest.json).

The checker also exposed a local test-setup fault: its broad TypeScript include pulled generated browser-report JavaScript into diagnostics and exhausted the default heap. The include now targets application/test/config source and excludes generated reports. It passes without raising the heap limit. This was a tooling-scope defect, not a visitor payload problem.

The exact final source fingerprint is `35f63f33bc221c29abea4426055ddcb606366ecdb8623c6441724cc29837202e`. The static artifact fingerprint is `7560773a821bf1375abcd8f616608fae324b31ca84f6e2d7ad362ce064092fc3`. No public deployment occurred.

## Candidate identity

| Field | Recorded value |
|---|---|
| Application directory | `site/` |
| Build/commit or reproducible content hash | Source and artifact SHA-256 values above; file manifests in linked evidence. |
| Build mode and local URL | Private review at `http://127.0.0.1:4321/`; no deployment |
| Node / package manager / Astro versions | Node 22.23.2; npm 10.9.8; Astro 7.3.8; TypeScript 6.0.3. |
| Lockfile path and hash | `site/package-lock.json`; SHA-256 `87c3c86461cba7994c89546b4fceef0c319d43588bffc27edeb1e86d146fc4ad`. |
| Test tools and exact versions | Playwright 1.64.1; @axe-core/playwright 4.13.0 with axe-core 4.13.0; @astrojs/check 0.9.10; Node test runner. |
| Host OS/build and CPU/device | macOS 27.0.1, build 26A434, ARM64. Automated desktop engines and emulated CSS viewports. |
| Browser name/version and automation engine | Chromium 156.0.8078.4; Firefox 157.0; WebKit 27.2, installed through Playwright 1.64.1. |
| Test start/end time and timezone | Final run started 2026-10-15T07:14:00.433Z, duration 29.4 seconds. Performance capture started 07:15:22Z. Times are UTC. |
| Content baseline | Chromium checklist test and inspected captures show 27 content groups: 0 ready, 27 needing content, 0 not needed. This is the private draft baseline. |
| External delivery | Not configured or tested by this ledger; keep draft non-sending |
| OpenDesign | Runtime remains on its separate security hold; no website clearance inferred from its previous checks |

## Private-build checks

| ID | What to verify | Result | Evidence, actual coverage, defect or next action |
|---|---|---|---|
| BUILD-01 | Supported pinned runtime/package manager; separate application lockfile; clean reproducible installation and production build | Pass | Clean immutable npm ci --ignore-scripts, audited native bindings and five-page static build succeed. Versions and logs above. |
| BUILD-02 | Applicable type, schema and content checks; stable unique slot IDs; two story records; meaningful failure for invalid content | Pass | 21 source/config/test files report zero type errors, warnings or hints; 19 tests include malformed data, stable IDs, readiness, required/optional conditions, CLI modes and finite motion bounds. |
| MODE-01 | Review output includes useful draft notes/checklist; public-mode validation prevents unresolved required content from becoming a public artifact | Pass for private boundary | Review notes are visible. Wrapper and direct Astro public builds both refuse; the wrapper removes prior dist output. Public rendering remains deliberately unimplemented and gated even if content statuses change. |
| SEC-01 | Full locked dependency audit and production subset; direct/transitive paths and applicable reachability | Pass, snapshot | Full and production npm audits at 07:15:35Z both report zero known vulnerabilities. See site/docs/audits dated npm audit JSON and DEPENDENCIES.md. No zero-risk claim. |
| SEC-02 | Dependency/font/asset licences and provenance; lifecycle scripts reviewed; no unexpected package sources | Pass for shipped dependencies | All direct pins, registry integrity, installed engines and declared licences checked; no unresolved inventory items. Both font OFL notices ship in public/licenses. No photographer assets are included. |
| SEC-03 | No exposed credentials, private source records, personal form data or unintended raw originals in tracked/built files | Pass, scoped | Final pattern scan plus source/build inspection found no token/credential patterns or raw originals. Draft enquiry values stay out of URLs/storage/network requests in all three engines. Pattern scans do not prove detection of every secret. |
| COPY-01 | Source text has no authored em dashes, including escaped/entity forms used by the interface | Pass | Source and generated output checks cover literal and encoded em dashes; copied vendor licences and raw evidence remain intact. |
| COPY-02 | Page-order reading is clear and truthful; unknown business facts and missing assets stay labelled | Pass for private copy | Read home, both stories, checklist, disclosures, enquiry and viewer. Replaced formulaic introductory fragments with direct guidance. Unknown facts stay labelled; no fake prices, reviews or promises. Editorial self-assessment: 40/50, not an AI detector. |
| COPY-03 | Decoded rendered text, accessible names, metadata and all exercised states follow copy rules | Pass for exercised draft states | Three-engine checks inspect decoded body text and accessible attributes; source/output scanner includes head metadata and entity forms. Current menu/viewer/form/disclosure copy also reviewed. Repeat COPY-04 on real public content. |
| NAV-01 | Home sections, both visible story links, direct story entry, back/forward, refresh and 404 recovery | Pass, scoped | All three engines pass two stories, deep links, disclosure return, Back/Forward/refresh, mobile menu and no-JS navigation. Static check verifies 178 local destinations/assets and unique IDs across five documents. |
| CONTENT-01 | One implemented content source drives local notes and checklist; all retained groups have useful requests and status | Pass for draft | One typed 27-slot source drives notes/checklist; schema and 15 content tests validate references, states and release conditions. All 27 are Needs content. |
| DRAFT-ENQ-01 | Draft notice is clear; fields/context can be reviewed; submit actions cannot send or claim genuine receipt | Pass, scoped | All three engines verify removable context, disabled sending, no non-GET request on Enter/requestSubmit(), no personal values in URL/storage and retained typed input. No live receiver is connected. |
| DRAFT-ENQ-02 | Story context is visible and removable/changeable; required-field feedback preserves other input | Partial | Source now has valid empty/wedding/couple options. Chromium confirms story context can be cleared and entered values remain after attempted submission. Full future validation/error behavior is not implemented or passed here. |
| DRAFT-ENQ-03 | Keyboard/autofill/virtual-keyboard layout; absent JS and no confirmed contact destination remain truthful | Partial | No-JS Three-engine test confirms disabled sending and available core content. Actual autofill, virtual keyboard and physical-device coverage remain open. |
| VIEWER-01 | Image links remain usable; viewer opens/closes; Escape, focus return, Previous/Next and repeated actions work | Partial | Three-engine tests finite six-item navigation, initial Close focus, Shift+Tab wrap, Escape and focus return. One-image, actual failed media, touch and real-browser variations remain open. |
| MOTION-01 | Full/Still and reduced-motion behavior; essential content remains visible without animation | Partial | All three engines cover changed OS reduced motion, Full unable to override it, explicit Still and persistence. Source and no-JS checks preserve static content. Complete manual/assistive review remains open. |
| MOTION-02 | Explicit Play works while its control retains focus/hover; later inspection pauses; leave does not resume | Pass, scoped | All three engines verify focused keyboard Play, new-inspection pause, no resume on refocus, offscreen pause and manual reset. Current-geometry check resolves the Firefox observer timing race. |
| MOTION-03 | Played strip pauses on backgrounding, leaving view, modal entry, reduced-motion changes and image failure | Partial | Source now observes the image window. All three engines verify offscreen pause, manual restart/reset and changed reduced-motion preference. Hidden-tab, modal-entry and actual failed-image lifecycle tests remain open. |
| A11Y-01 | Landmarks, heading order, labels, error associations, visible/unobscured focus, keyboard order and target size | Partial | Three-engine axe checks pass on five routes plus open mobile menu and gallery; targeted menu/gallery focus tests pass. Human screen-reader, target-size and complete keyboard/visible-focus inspection remain open. |
| A11Y-02 | Contrast, 200%/400% zoom, 320 CSS-pixel reflow, forced colours and screen-reader sample | Partial | Reported opacity contrast defects were corrected and later Three-engine axe checks passed. Width assertions cover 320 CSS px. Browser zoom at 200%/400%, forced colours and assistive-technology samples remain open. |
| LAYOUT-01 | Content-driven layouts at 320, 360, 390, 430, 768, 820, 1024, 1280, 1440, 1920 and 2560 CSS px | Partial | Chromium checks document overflow on home, wedding and checklist at 16 widths including all specified widths and breakpoint boundaries, each height 900. Supplied 390/1440 captures were visually reviewed. This does not cover every route/state or genuine browser zoom. |
| LAYOUT-02 | Portrait/landscape, short window, tablet Split View, safe areas and virtual keyboard | Partial | Three-engine width assertions also exercise 640x360 and 844x390 on three routes. Real rotation, safe areas, Split View and virtual-keyboard behavior remain open. |
| FAIL-01 | Failed/slow media, blocked fonts/optional scripts, offline browsing and safe errors preserve navigation/contact context | Partial | Three-engine test blocks local fonts and makes localStorage unavailable, then confirms readable core heading, no width overflow/page error and usable Still control. Failed photographs, offline navigation and other recovery conditions remain open. |
| PERF-01 | Actual placeholder-build requests, initial JS/CSS/HTML/fonts, layout shifts and exercised interaction traces | Pass for placeholder envelope | Final artifact: CSS 6.34 KiB gzip, JS 3.03 KiB gzip, largest HTML 6.78 KiB gzip, fonts 77.94 KiB, conservative shell 94.08 KiB. Fresh 390x844 ten-second sample transferred 95,730 B, with no external/player requests. Single throttled placeholder sample LCP 568 ms and CLS 0.00713; not field or real-photo results. See 07:15:22Z preview report and 07:15:35Z budget JSON. |
| REVIEW-01 | Independent code review of the actual candidate and relevant state/data boundaries | Pass, scoped | Independent review of current controller, motion policy, enquiry, layout and route source; four actionable source findings corrected and re-inspected, with targeted Chromium evidence. See review notes and defect register. This is not a complete security audit. |
| REVIEW-02 | Independent rendered review at phone and desktop sizes against direction A and D01 through D07 | Pass, scoped | Homepage, both stories, checklist and settled viewer reviewed at 1440/390 through supplied captures and native-size crops. No open blocking composition finding in those screens. Later copy and opaque-entry source changes re-inspected. Wider state/device coverage and real-media review remain open. |

## Prebuild findings to close against the implementation

| Finding | Required rendered or code evidence | Result |
|---|---|---|
| D01 | Two visible story choices and matching routes/content; no invented third assignment or unnecessary filtering | Pass, scoped: two homepage choices and matching source routes; Chromium journey coverage. No third assignment is shown. |
| D02 | Mobile first-view brand/service context and work link around one lead image; companion afterward; short-height and missing-image states usable | Partial: brand, service context, work link, one lead and later companion inspected at 390/1440. Mobile lead begins around y=570 in the supplied capture; short-height visual review remains open. |
| D03 | Play/focus precedence and inspection pause work without an immediate cancellation or unwanted resume | Pass, scoped: source correction plus Chromium focused Play, later inspection pause and no unwanted restart checks. |
| D04 | Placeholder composition reviewed separately from original-image/crop/colour quality | Pass for separation of evidence: placeholder composition reviewed and recorded independently. Real-image crop, colour and fidelity remain untested. |
| D05 | Story sequences reflect supported moments; no invented chronology, client anecdote or padding to a frame quota | Partial: source uses labelled placeholders and provisional sequence rather than invented client facts. Real sequence selection remains an owner-content task. |
| D06 | Clear occasion labels, compact local requests and detailed shared checklist; plain and factual copy | Partial: home/both-story/checklist labels and local requests visually reviewed; checklist count/search/deep-link tests pass. Remaining route/state copy still needs review. |
| D07 | Visible optional story reference, removal/change control and a small provisional enquiry request | Partial: optional story select has valid options and clears in Chromium; non-sending form and small request visually reviewed. Live validation is outside this draft. |

## Browser and device coverage

The [responsive specification](RESPONSIVE-AND-RELIABILITY-SPEC.md) owns the tiered matrix. Add one evidence row per tested environment or attach a complete machine result with individual failures. Browser families are not exact tested versions.

| Environment | Exact OS/browser/device and viewport | Critical routes/states | Result | Evidence / remaining gap |
|---|---|---|---|---|
| Automated Chromium | macOS 27.0.1; Chromium 156.0.8078.4 | All 17 journeys and recorded viewport matrix | Pass: 17/17 | Final browser JSON. Does not establish Windows Chrome/Edge. |
| Automated Firefox | macOS 27.0.1; Firefox 157.0 | All 17 journeys and recorded viewport matrix | Pass: 17/17 | Scratch app-data launch fix and Play race fixed; final browser JSON. |
| Automated WebKit | macOS 27.0.1; WebKit 27.2 | All 17 journeys and recorded viewport matrix | Pass: 17/17 | Transient menu contrast corrected. This is not real iPhone/iPad Safari. |
| Windows Chrome and Edge | Not recorded | Mouse/keyboard, zoom, forced colours and critical journey | Not run | Real desktop coverage pending. |
| macOS Chrome and Safari | Not recorded | Trackpad/keyboard, zoom, VoiceOver sample and critical journey | Not run | Record each actual browser separately. |
| Firefox desktop | Not recorded | Keyboard, layout and critical journey | Not run | Name tested OS and browser build. |
| Real iPhone Safari | Not recorded | Portrait/landscape, safe areas, touch, virtual keyboard, motion preferences and recovery | Not run | No physical-device claim from viewport emulation. |
| Real iPad Safari | Not recorded | Rotation, Split View, touch/keyboard and critical journey | Not run | Exact model/OS and window dimensions required. |
| Real Android Chrome | Not recorded | Midrange performance, touch, keyboard/autofill, rotation and recovery | Not run | Record physical device, network and browser. |

## Checks that require later content or integration

Keep these rows open while reviewing the private draft. They do not block useful placeholder layout/control checks, but they prevent a claim of public readiness.

| ID | Later acceptance | Result | Prerequisite or limit |
|---|---|---|---|
| MEDIA-01 | Cleared original selection, public facts, source credits and intended full-frame/cover crops | Not run | Owner-supplied material and clearance; a public reference screenshot is not a production asset. |
| MEDIA-02 | Skin, colour, fabric, low light and normal/high-density quality of real derivatives | Not run | Representative originals and actual display-size comparisons. |
| MEDIA-03 | Real-image critical/cold/full-scroll budgets and lazy/eager request behavior | Not run | Actual delivery assets; placeholder results remain separate. |
| FILM-01 | Real permitted film playback, captions/accessibility, intent loading and failure state | Not run | Confirmed film/player and rights. Do not create a pretend play action. |
| LIVE-ENQ-01 | ENQ-01 durable receipt and designated responder retrieval | Not run | B03 receiving system and authorized test destination. |
| LIVE-ENQ-02 | ENQ-02 server validation and safe handling | Not run | Actual server handler and controlled invalid/oversized input. |
| LIVE-ENQ-03 | ENQ-03 atomic same-key deduplication, conflict and notification behavior | Not run | Transactional store, provider idempotency and controlled concurrency. |
| LIVE-ENQ-04 | ENQ-04 offline/timeouts/lost acknowledgement and safe recovery | Not run | Controlled failure injection against the real integration contract. |
| LIVE-ENQ-05 | ENQ-05 failed/uncertain notification, visible attempts and bounded recovery | Not run | Named operator, outbox/provider and tested recovery. |
| LIVE-ENQ-06 | ENQ-06 failed storage/transaction/dispatch without premature receipt or loss | Not run | Real store and safe failure-injection environment. |
| LIVE-ENQ-07 | ENQ-07 abuse limits and understandable legitimate-visitor recovery | Not run | Bounded authorized test; no public-site traffic attack. |
| LIVE-ENQ-08 | ENQ-08 malformed/provider/outage errors with safe UI and operator signal | Not run | Actual provider integration. |
| COPY-04 | Final public content cleared; review notes/routes/private fields absent | Not run | Exact public release candidate and resolved content checks. No publication authorized now. |
| FIELD-01 | Real-user LCP/INP/CLS at the 75th percentile with sufficient data | Not run | Authorized release and sufficient field data. Lab scores cannot substitute. |
| RELEASE-01 | Intended host/domain, permissions, routing, security headers, rollback and public smoke checks | Not run | Separate release/account/domain authorization and confirmed ownership. |

## Defects and retests

The four independent source findings and three browser-discovered issues below are closed in the re-inspected source and reported/preserved Chromium scope. This does not close their wider browser or real-device acceptance. Earlier failing output is attributed where it was not independently retained.

| Defect ID | Candidate / severity | Observed behavior and reproduction | Expected behavior / source | Fix reference | Retest evidence and result |
|---|---|---|---|---|---|
| SRC-01 | Private draft / P2 | Story context options used malformed closing tags, so choices were not represented correctly | D07: visible removable/changeable story context | `site/src/components/Enquiry.astro:12`, three valid options | Re-inspected source; Chromium draft enquiry test selects the empty option and confirms context clears. Closed in scope. |
| SRC-02 | Private draft / P2 | Observer watched the whole demo, allowing the image window to leave view while lower controls stayed visible | D03 and motion lifecycle: pause when the image window leaves view | `site/src/scripts/ui.ts:213`, observer target is `viewport`; current visibility is also calculated at Play | Re-inspected target and later visibility calculation; Chromium offscreen/return test pauses and does not auto-resume. Precise partial-visibility threshold is source-reviewed, not a separate browser assertion. Closed in scope. |
| SRC-03 | Private draft / P2 | Crossing the menu breakpoint could leave focus in newly hidden navigation | D02 and keyboard continuity | `site/src/scripts/ui.ts:37`, transfer focus to menu or matching visible desktop link | Chromium exercises focus transfer across narrow/wide boundaries and Escape return. Closed in scope. |
| SRC-04 | Private draft / P2 | No-JS narrow layout hid the Approach link | Usable ordinary navigation with scripts unavailable | `site/src/styles/global.css:1901`, no-JS header/nav override restores wrapping and link | Chromium no-JS check at 320x740 confirms Work and Approach visible and story navigation usable. Closed in scope. |
| BROWSER-01 | Private draft / contrast | Implementation agent reported contrast ratios 4.32 and 4.44 from translucent placeholder text | Applicable text contrast threshold | `site/src/styles/global.css:453`, placeholder text opacity is 1 | Initial failure attributed to implementation agent; later Chromium axe route/state checks pass. Closed in that scope. |
| BROWSER-02 | Private draft / narrow layout | Implementation agent reported grid min-content overflow at 320 px | No document overflow at minimum supported width | `site/src/styles/global.css:905`, `min-width: 0`, plus responsive minmax(0, ...) tracks | Chromium width matrix passes on home/wedding/checklist, including 320 px. Closed in scope. |
| BROWSER-03 | Private draft / modal focus | Implementation agent reported inconsistent initial modal focus and wrapping | Viewer starts on Close, traps focus and restores opener | `site/src/scripts/ui.ts:99` and `:109`, explicit initial focus and Tab boundary handling | Chromium confirms Close focus, Shift+Tab wrap, Escape and return to opener. Closed in scope. |

## Closeout when evidence exists

Record the candidate reviewed, completed checks, actual browser/device coverage, failures fixed, remaining defects and input gaps. State whether the local draft is ready for private review. Keep that conclusion separate from live enquiry readiness and public release readiness. Do not report universal device support, cleared photographs, security certification or business uplift from this draft's checks.
