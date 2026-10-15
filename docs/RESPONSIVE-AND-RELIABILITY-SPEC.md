# Responsive experience and reliability acceptance specification

Prepared 15 October 2026. **Status: future acceptance criteria; no website implementation or website test results.** This document turns the requirement for a professional experience across screens, operating systems and browsers into work that can be designed, implemented and verified. It does not select a framework, hosting provider, enquiry service or paid testing service. Scope and authorization remain in [the execution plan](../EXECUTION-PLAN.md); the proposed experience remains in [the design brief](../DESIGN.md).

## 1. Experience contract

A visitor must be able to understand the photographer's work, read relevant complete stories, assess truthful service/proof information and make an enquiry that reaches the agreed receiving system. The experience should retain its visual identity at every supported size. Smaller screens get a deliberate composition and useful reading order; large screens get controlled hierarchy and image quality. Responsive design is more than fitting the desktop layout inside a phone.

Use fluid sizing, flexible composition and breakpoints chosen where real content needs to change. The widths below are **test samples, not eleven prescribed CSS breakpoints**. Test intermediate widths and resizing continuously, including one pixel either side of each implemented breakpoint. Long names, long headings, real review text, missing media and form errors must influence layout decisions. Never choose breakpoints from a particular phone model alone. [S1]

OS, browser engine/version, viewport, input method and device capability are separate test dimensions. Passing one Chrome desktop screenshot does not establish Windows, macOS, Safari, touch or mobile support. The matrix is deliberately tiered rather than an impractical guarantee of every historical browser/device combination. Declare the tested envelope and record omissions honestly. [S2]

## 2. Viewport and composition checks

All dimensions below are **CSS pixels**, not physical screen resolution. Record device pixel ratio separately. Every implemented route must have a layout review at all eleven widths; critical journeys also receive interaction checks across the browser/device matrix.

| Width samples | Required composition checks |
|---|---|
| 320, 360, 390, 430 | Readable story and review text; complete headings; practical touch navigation; coherent image order and meaningful crops; single-column form where needed; no page-level horizontal scrolling. The enquiry action, labels and errors must fit without shrinking text. |
| 768, 820 | Portrait tablet and intermediate window widths; spacing must not become an enlarged phone with arbitrary empty areas. Use extra columns only when actual image/text content supports them. Navigation must change before links overlap. |
| 1024 | Tablet landscape and compact desktop windows; inspect competing navigation, text and image widths, sticky controls and modal size. Input may be touch, mouse, keyboard or a combination. |
| 1280, 1440 | Full desktop composition, hierarchy, reading measure and access to primary actions; check browser zoom and a resized window as well as the maximized window. |
| 1920, 2560 | Preserve readable line length, purposeful margins and photographic resolution. Do not stretch body copy across the screen, inflate controls indefinitely or upscale a small source image to fill a huge hero. Whitespace and image scale need a design reason. |

Additional geometry checks:

- Test representative portrait and landscape devices, including short viewports such as 640 × 360 and 844 × 390. A form or menu that fits a tall phone can fail on a short landscape screen.
- On a real iPad, test portrait, landscape and the available Split View/window-resizing modes. Record the actual resulting viewport; do not label an emulated narrow desktop window as a passed iPad test.
- Test browser toolbars expanding/collapsing, the onscreen keyboard opening, notched displays and bottom home indicators. Safe-area padding must protect controls without leaving unexplained gaps on ordinary screens. Full-height sections cannot hide essential content when available height changes. [S3]
- Do not lock orientation. Rotation, browser resizing and Split View changes must preserve the current task, entered values, useful scroll position and access to controls. [S4]
- At 200% text enlargement and 200%/400% desktop browser zoom, there must be no loss of content or functionality. Verify reflow at a 320 CSS-pixel effective viewport, such as a 1280-pixel viewport at 400% zoom. Avoid two-direction scrolling for ordinary navigation, copy and forms. Any essential two-dimensional content needs a specific documented exception, not a blanket gallery exemption. Do not disable pinch zoom. [S5][S6]
- Decorative overlap, masks and unconventional layouts may express the chosen concept, but cannot obscure copy, important faces, focus outlines or controls. A typography/crop/spacing review is required for each route, not only the homepage.

## 3. Browser, OS and real-device coverage

“Current” means the stable versions available **when the test is executed**. Record exact OS version/build, browser version, device and date in the ledger. Do not fill them from today's assumptions or use “latest” as permanent evidence.

| Tier | Required environments | Depth |
|---|---|---|
| A: release-critical desktop | Current Chrome and Edge on Windows; current Chrome and Safari on macOS; current Firefox on one recorded desktop OS | Complete discovery → story → enquiry journey; navigation and relevant overlay/film interactions; form states; keyboard; zoom/reflow; layout samples distributed across sizes. Chrome and Edge remain separate browser runs even though they share an engine. |
| A: release-critical mobile/tablet | Safari on a real iPhone; Safari on a real iPad; Chrome on a real Android phone, including a representative midrange device where available | Complete critical journey with touch, actual keyboards/autofill, rotation, safe areas, media playback and network recovery. Include iPad Split View and at least one small handset viewport. |
| B: compatibility and risk sampling | Firefox on the second desktop OS; an older still-supported iOS/iPadOS or Android/device combination; additional small/large phones and browser-in-app arrivals where relevant | Navigation, story readability, primary media, enquiry and visual checks. Choose versions from audience evidence and the support policy before release; do not arbitrarily drop a needed group. |
| C: evidence-led extension | Linux desktop, additional Android browsers, unusual devices or older versions outside the declared baseline | Add coverage when actual audience, owner requirements or a reproduced issue justify it. Provide a usable core experience where browser capabilities permit; distinguish untested from unsupported or failed. |

The full cross-product is not required on every edit. Exercise high-risk combinations deliberately: Safari + real touch + onscreen keyboard; small width + long validation errors; desktop keyboard + zoom; wide viewport + high pixel density; midrange Android + slower network. Maintain broad automated viewport coverage and the real-device release checks. A missing device is a coverage gap, not a pass.

## 4. Journey and screen acceptance matrix

Inventory every implemented route and reusable interaction before testing. The names below describe visitor jobs; they do not impose a sitemap or add unapproved features. Where a feature is omitted from the chosen scope, record it as not applicable with a reason.

| Screen/journey | Required successful experience | Required difficult states and review notes |
|---|---|---|
| Entry/home, including social and search arrivals | Recognisable work, truthful context, readable opening and an obvious next step. Meaningful content must appear without waiting for every image or an animation. | Missing/slow hero, blocked script/font, long headline, direct landing with attribution parameters, tiny landscape height. Review crop, contrast over photographs, menu and primary action at every width. |
| Work index or story selection | Understand the available work and open the intended assignment. If filters exist, their labels and results are clear and operable without hover. | Empty/no-match result, missing thumbnail, long title, return from story, filter state/back behavior. No dead cards or controls that merely look interactive. |
| Complete story/project | Read a coherent photographic sequence with relevant context and a useful onward/enquiry path. Mobile sequencing and crops must preserve the story, including family/ceremony context. | One or several failed images, portrait/landscape mix, long captions, slow late images, direct deep link, browser back/forward. Review the full page, not just its first viewport. |
| Film or image viewer, if selected | Actual playback/viewing; visible controls; understandable close/back behavior; keyboard and touch alternatives to gestures. | Unsupported/blocked media, loading failure, retry, muted/autoplay restrictions, third-party cookies blocked, fullscreen/orientation changes. A poster or play icon is not proof of playback. |
| Services, process, biography and genuine reviews | A visitor can assess fit and trust from accurate, readable information. Only approved real claims/reviews appear. | Long names/quotes, missing approved proof, collapsed/expanded text if used. Do not truncate away meaning, invent testimonials or replace a missing section with fake social proof. |
| Enquiry/contact | Fields are understandable; required information is proportionate; entered data survives ordinary corrections; next action and receipt semantics are clear. | Pristine, focus, valid, invalid, submitting, received, rejected, rate-limited, offline, timeout/unknown and retry states. Test actual keyboard/autofill, long/multilingual names, phone/email formats and missing optional values. |
| Receipt and recovery | A confirmation corresponds to durable receipt in the agreed system. Failure gives an actionable way forward without pretending success. | Lost acknowledgement, duplicate click/retry, receiving-service failure, browser navigation and return. An alternate contact method is offered only if real and approved. |
| Global navigation, footer, 404 and any overlays | Visitors can recover from a wrong URL, reach contact, understand their location and exit menus/overlays. Links and focus order are consistent. | Direct refresh/deep link, missing route, open menu during resize, sticky elements over content, external link behavior and blocked third parties. Review these shared elements on every relevant page. |

For each row, save a short visual review note: composition, image crop/order, type/readability, spacing, controls and observed defects. A responsive homepage does not excuse a broken review block, story footer, validation message or 404. Keep internal implementation notes and research uncertainty out of the eventual visitor interface; communicate only information that helps the visitor act.

## 5. Input, accessibility and interaction quality

Use WCAG 2.2 AA as the implementation target, supplemented by the usability checks here. This specification and automated scanners are not a completed accessibility audit.

- All functionality works with keyboard alone. Provide a useful focus order, visible focus and no keyboard traps. Menus/viewers manage focus on opening and return it on closing; Escape closes dismissible overlays without losing the task. Sticky UI and the mobile keyboard must not entirely cover a focused control. [S7][S8]
- Use semantic links, buttons, headings and form labels. Labels persist after typing; help/errors are associated with their field. Status and validation changes are available to assistive technology without repeated noisy announcements. Error summaries, where used, link to the relevant field. [S9]
- Touch, mouse, trackpad and keyboard work independently. Hover can enhance an action but cannot be its only explanation or access path. Swipes, dragging, custom cursors and precision gestures require ordinary operable alternatives when used.
- Use comfortable touch targets, aiming for at least 44 × 44 CSS pixels for principal controls where practical. This is a project usability target; WCAG 2.2 AA's minimum target criterion is 24 × 24 CSS pixels or its documented spacing/exceptions, not a universal 44-pixel rule. [S10]
- Verify contrast against the actual photograph/background in every state, including disabled/error/focus states. Do not encode errors or selected state through colour alone. Test Windows forced-colour/high-contrast behavior and representative screen-reader use, including VoiceOver on Safari and a desktop or Android screen reader.
- Respect reduced-motion preferences: remove nonessential parallax, scroll-linked motion and animated transitions; keep the same information and controls. No scroll hijacking or animation gate may block reading or enquiry. Use intentional interaction feedback without making every section move. [S11]
- Test blocked custom fonts, larger text and longer content. Fallback fonts must preserve access and legibility. Use normal browser controls and affordances where they solve the task well.

## 6. Media, loading and performance

- Use authentic, permitted photographs with a documented export/crop decision. Responsive image candidates must match rendered size and pixel density; art direction may need a different mobile crop or image order. Never cut important faces/actions merely to preserve a desktop aspect ratio. Retain a way to see a complete image where a crop would change its meaning. [S12]
- Reserve image/video dimensions to avoid layout jumps. Give the principal visible image appropriate loading priority; defer offscreen media. Do not download an entire high-resolution gallery or film before the visitor asks for it.
- Review colour, compression artifacts and sharpness using representative real work at phone and large-screen sizes. Choose the smallest acceptable delivery variant from a visual comparison, not a blanket quality number. Test high-density and ordinary displays; respect the limits of the source material.
- Loading placeholders preserve layout and are recognisable as loading states. Failed media leaves the page navigable, with appropriate text/context and a bounded retry path where useful. Never leave an endless spinner or replace the photographer's missing work with generated portfolio imagery.
- Respect reduced-data signals such as `Save-Data` when available; support is not universal. Do not interpret its absence as permission for aggressive downloads. Prefer click-to-play film and conservative media loading regardless. Essential information and enquiry cannot depend on autoplay. [S13]
- Test cache-cold and repeat visits, slow/high-latency mobile conditions, network loss during browsing/submission and recovery. Record throughput, latency, throttling method and device/CPU conditions. Inspect work on a real midrange phone; desktop emulation alone cannot establish its speed or memory behavior.
- Aim for good Core Web Vitals: LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile where field data exists. Before launch, report lab results with their conditions and interaction traces; do not describe a Lighthouse score or a single run as field performance, or substitute another metric for measured INP. Set page/media budgets from the chosen content and delivery approach before implementation is considered complete. [S14]
- If optional scripts, a media provider, a tracking request or an animation fails, navigation, story context and contact must remain usable. Choose progressive enhancement for nonessential effects. Any essential dependency must have a documented failure/recovery path and be included in testing.

## 7. Enquiry integrity and operational reliability

The primary conversion is **a received, suitable enquiry**, followed later by qualification and booking. A button tap, WhatsApp open, browser event or generic HTTP 200 does not prove receipt or a booking.

Before B03 live delivery integration, confirm the receiving system, durable receipt condition, designated responder, failure visibility, retry behavior and retention policy. B02 private layout and interaction work can use a provisional contract and local test double with explicitly non-sending draft states. “Received” must mean the enquiry has entered an agreed recoverable system accessible to the responsible business process. A mail provider accepting a request is not proof that a message arrived in the final inbox. Any stated response time needs owner confirmation.

| Condition | Required behavior and later verification |
|---|---|
| Client or server validation rejects a field | Show a specific correction, preserve other values, focus/announce appropriately and allow resubmission. Server validation remains authoritative. Do not use narrow name/phone assumptions that exclude legitimate clients. |
| Request is pending | Indicate progress accessibly; prevent accidental repeated submission without hiding the button's purpose or removing focus. Use a documented bounded timeout. |
| Durable receipt succeeds | Show truthful confirmation associated with a stable receipt/reference where appropriate. Distinguish receipt from booking or availability confirmation. |
| Double tap or retry after a lost acknowledgement | Use server-side idempotency/deduplication for the same logical enquiry, including the case where the server saved it but the browser never got the response. Return the existing outcome; do not create duplicate enquiries or send repeated notifications blindly. Define key lifetime and when a deliberate new enquiry starts. |
| Offline, timeout or uncertain result | Never show unverified success. Retain input safely within the current interaction and explain retry/uncertainty. Avoid exposing personal details in URLs or silently persisting form content on a shared device. |
| Receiving notification fails after durable receipt | Keep the enquiry recoverable, expose failure to the designated operator and retry through the documented process. A saved record with no practical way for the responder to find it is not a complete handoff. |
| Rate limiting or spam protection triggers | Preserve useful input and provide an understandable recovery route. Controls must not silently discard valid enquiries or require an inaccessible interaction. |

Future testing starts with local stubs and deliberate failure injection, then uses an authorized test destination. Verify the submitted data at the receiving end and the responder's retrieval path. Test validation, delayed response, timeout after save, service rejection, notification failure and repeated retries. This document does not authorize sending messages, altering accounts or submitting current live enquiry forms.

## 8. Privacy, attribution and basic security

- Collect only information needed for the agreed enquiry workflow. Document access, retention and deletion before launch. Keep form text, email addresses, phone numbers and personal names out of analytics, query strings and ordinary error logs.
- Attribute received enquiries using bounded, allowlisted campaign/source fields where useful. Sanitize them and distinguish known source from unknown. Do not preserve arbitrary full URLs/referrers or tracking identifiers by default. A source click and a received enquiry are different events.
- Make essential journeys work when analytics, third-party cookies or optional tracking are blocked. Configure any required consent behavior for the actual deployment; do not invent legal/compliance claims in visitor copy.
- Use HTTPS, server-side validation, appropriate output escaping, nonexposed secrets, safe error responses, reasonable abuse controls and security headers suited to the chosen architecture. Assess cross-origin requests and CSRF where the architecture makes them relevant. Do not put provider credentials in client bundles or rely on browser validation for integrity. [S15]
- Test deep-link refreshes, missing routes, unavailable APIs and non-JSON/error responses. Avoid stack traces, private identifiers and misleading fallback success in the UI. Keep deployment/recovery steps proportionate and documented when a platform is selected.

These are future implementation requirements. No cloud account changes, DNS changes, service purchases, new authentication system or production security configuration is selected or authorized here.

## 9. Test stages and release gate

1. **Before coding:** review real content lengths, portrait/landscape crops, mobile reading order, critical states and the enquiry contract. Record intended support tiers and available test devices. Resolve content/operating unknowns separately from our implementation work.
2. **During implementation:** automate critical navigation/form cases and viewport checks in Chromium, Firefox and WebKit using an appropriate runner. Capture representative screenshots for human review and run focused accessibility/console/network checks. A WebKit automation build approximates Safari's engine behavior; it does not establish real Safari/iOS, native keyboard, safe-area or device performance support. [S2][S16]
3. **Before release:** complete Tier A real-browser/device journeys, the selected Tier B checks, assistive-technology/zoom checks, realistic media/network checks and actual authorized enquiry-receipt tests. Fix observed defects and repeat the affected cases on the same candidate build.
4. **After an authorized release:** smoke-test the public build, media, deep links and enquiry path; record actual environment/version. Monitor actionable delivery failures and field performance if suitable measurement is configured. Do not equate successful preview tests with a verified public release.

Release blockers include inaccessible primary actions, obscured form/focus at required sizes, false receipt messages, unrecoverable enquiry loss/duplication, broken critical navigation/media, exposed secrets or a failing supported critical journey. Record lesser visual defects and explicit coverage gaps with their impact and next action. Never turn an unavailable device or flaky run into a pass. Retest where a fix or new finding justifies it; avoid repeating broad checks without a reason.

## 10. Ready-to-use coverage ledger

Copy rows for each actual environment and build. Keep all rows **not run** until evidence exists. Add actual device/OS/browser versions at test time; “Chrome,” “iPhone” or “latest” alone is insufficient. Link screenshots, interaction notes, receipt evidence and defects without including client personal data.

| Check ID / build or commit / date | Tier / real device or emulator | Exact OS + build / browser + version | Viewport CSS px / DPR / orientation or window mode | Input / zoom / accessibility / network condition | Routes, journey and states exercised | Result: pass, fail, blocked, not run, N/A | Evidence / defect / limitation / next action |
|---|---|---|---|---|---|---|---|
| LAYOUT-… / TBD / TBD | Automated viewport sweep; engine TBD | TBD | 320, 360, 390, 430, 768, 820, 1024, 1280, 1440, 1920, 2560; separate rows or attached complete matrix | Normal + breakpoint boundary/short-height samples | Every implemented route; normal + long/error/missing-media states | Not run | Record individual failures rather than one blanket responsive pass |
| WIN-… / TBD / TBD | A / real Windows desktop | Exact OS/build; separate Chrome, Edge and applicable Firefox rows | Actual viewport/DPR | Mouse + keyboard; 200%/400% zoom; forced colours | Complete discovery/story/enquiry and recovery | Not run | TBD |
| MAC-… / TBD / TBD | A / real Mac | Exact macOS/build; separate Safari and Chrome rows | Actual viewport/DPR | Trackpad + keyboard; zoom; VoiceOver sample | Complete critical journey; real film if included | Not run | TBD |
| IOS-… / TBD / TBD | A / real iPhone model TBD | Exact iOS/build + Safari version | Portrait/landscape, actual viewport/DPR | Touch; keyboard/autofill; reduced motion; network recovery | Critical journey; safe areas; validation/receipt/retry | Not run | TBD |
| IPAD-… / TBD / TBD | A / real iPad model TBD | Exact iPadOS/build + Safari version | Portrait/landscape + actual Split View sizes | Touch and external keyboard if available | Navigation/story/enquiry during resize and keyboard display | Not run | TBD |
| ANDROID-… / TBD / TBD | A / real Android model TBD | Exact Android/build + Chrome version | Actual viewport/DPR; portrait/landscape | Touch; autofill; midrange performance; slower network | Critical journey and failure recovery | Not run | TBD |
| COMPAT-… / TBD / TBD | B or C / justify selected environment | Exact versions TBD | Actual dimensions | State rationale | Specific risk/secondary coverage | Not run | Explain inclusion, omissions and any declared support boundary |
| RECEIPT-… / TBD / TBD | Selected supported clients + authorized receiving system | Exact client/backend version | Applicable viewport | Double submit, delayed/lost acknowledgement, rejection, notification failure | Durable receipt, deduplication, responder retrieval | Not run | Redacted receiving evidence; no real client data |

The final verification report must name the build tested, completed coverage, defects and residual gaps. It must not claim “works on all screens/OS/browsers” from this plan or from an incomplete matrix.

## Primary references

The following links were checked by HTTP on **15 October 2026** and returned **200**. These sources support the requirements; they are not evidence that the future website meets them. Redirected MDN links below use the resolved current URL.

- **S1:** web.dev, [Responsive web design basics](https://web.dev/articles/responsive-web-design-basics).
- **S2:** MDN, [Introduction to cross-browser testing](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Introduction).
- **S3:** MDN, [env() CSS function, including safe-area environment variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env).
- **S4:** W3C WAI, [Understanding SC 1.3.4: Orientation](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html).
- **S5:** W3C WAI, [Understanding SC 1.4.4: Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).
- **S6:** W3C WAI, [Understanding SC 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- **S7:** W3C WAI, [Understanding SC 2.1.1: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html).
- **S8:** W3C WAI, [Understanding SC 2.4.11: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
- **S9:** W3C WAI, [Forms tutorial: User notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).
- **S10:** W3C WAI, [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- **S11:** MDN, [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- **S12:** MDN, [Using responsive images in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images).
- **S13:** MDN, [Save-Data header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data).
- **S14:** web.dev, [Web Vitals](https://web.dev/articles/vitals).
- **S15:** MDN, [Practical security implementation guides](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides).
- **S16:** MDN, [Introduction to automated testing](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Automated_testing).
