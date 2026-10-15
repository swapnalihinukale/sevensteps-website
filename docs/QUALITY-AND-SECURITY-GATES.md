Seven Steps: future quality, dependency and security verification

Prepared 15 October 2026. **Status: executable future protocol; all website checks are Not run.** No website code, dependency installation, security scan or test against the current business sites was performed for this document. The [execution plan](../EXECUTION-PLAN.md) owns authorization and task status. Research/planning is current scope; implementation, deployment and business-account changes require their applicable authorization.

This protocol covers a public photography/marketing website and an enquiry workflow. It does not add authentication, payments, a client portal or public file uploads. If the real scope later requires them, assess their additional threats and tests before implementing them. The research/design tooling is a separate dependency surface; its [completed dependency audit](../.design-tooling/DEPENDENCY-AUDIT-2026-10-15.md) places the OpenDesign runtime on security hold. That audit is not a result for the future website.

**Read with these specifications**

- [Responsive and reliability specification](RESPONSIVE-AND-RELIABILITY-SPEC.md): viewport, browser/OS/device tiers, accessibility, enquiry states and receiving semantics.
- [International and performance research](INTERNATIONAL-AND-PERFORMANCE-RESEARCH.md): proposed byte budgets, image-quality tradeoffs, field versus lab measurements and controlled test conditions.
- [Motion and interaction specification](MOTION-AND-INTERACTION-SPEC.md): intended state changes, motion controls and reduced-motion behavior.
- [Content replacement UX](CONTENT-REPLACEMENT-UX.md): visible owner-review placeholders, stable slots, replacement status and public cleanup.
- [Copy and voice specification](COPY-AND-VOICE-SPEC.md): stop-slop review and COPY-01 through COPY-04 for authored text, rendered states, accessible names and metadata. Use no em dashes in UX copy.

These documents define outcomes to verify. This checklist is not evidence of passing them and cannot guarantee the absence of every defect or security vulnerability.

**Start before implementation**

Record the selected runtime/package manager, exact versions, supported browsers, routes, reusable interactions, receiving-system contract and intended hosting arrangement. Receiving-system details can remain provisional during B02 private layout/stub work; confirm the actual recipient, responder and data handling before B03 live integration. Create a small threat model covering: malicious form input, spam/resource exhaustion, exposed credentials, third-party failure, supply-chain compromise, content/privacy leakage and enquiry loss/duplication. Include the build/deploy environment as well as the public runtime. Do not turn this into an unrelated enterprise-security programme.

Keep the dependency inventory, test fixtures, build scripts and result ledger with the eventual application. Test fixtures use invented non-sensitive names/contact data and an agreed test recipient when a real delivery test is authorized. Public research sites and real client enquiries are not test targets.

**Dependency and package acceptance**

| Check | Required action and evidence | Failure or unresolved condition |
|---|---|---|
| Necessity | For each direct package, record the job it performs and why native/browser/platform capability is insufficient. Keep the production footprint proportionate to the site. | A template bringing unused packages is not justification. Remove unnecessary packages before spending effort securing them. |
| Provenance | Verify exact package identity, official registry/repository, release history, maintainers and integrity metadata. Record direct and transitive versions and source through the resolved lockfile; include CI actions/build images if used. | Unknown/lookalike packages, unexplained registry changes, mutable unreviewed references or unexpected install scripts need investigation before use. Popularity alone is not provenance. |
| Reproducibility | Commit one lockfile for the selected manager, pin the supported runtime/manager and perform a clean frozen/immutable installation in CI. Review lockfile diffs and lifecycle scripts when dependencies change. | Lockfile drift, unsupported runtime, installation from a stale/untrusted cache or unexplained script execution is not a reproducible build. |
| Maintenance | Check supported release lines, recent maintenance/security handling and known deprecations. Record why a stable but quiet dependency remains appropriate instead of judging by commit frequency alone. | Unsupported/EOL critical components need replacement or an explicit remediation plan before relying on them. |
| Licences | Inventory direct/transitive licences, commercial fonts, icon/image sources and any required attribution/distribution obligations. Preserve notices and resolve unknown or incompatible terms. | Unknown licence or an unmet obligation remains open. Do not infer permission from a public repository, npm listing or a visible photograph. |
| Vulnerabilities | Run software-composition analysis (SCA) against the actual lockfile and available advisory data. Review the complete tree and production subset separately. Record scanner/version/date and database freshness. | A failed/unavailable scan is not “zero vulnerabilities.” A production-only pass does not clear exploitable build/dev dependencies. |
| Reachability | For each finding, identify exact dependency path, affected versions, vulnerable behavior, whether our code/build exposes it, attack prerequisites and available fixes. Consider CI/developer/build exposure as well as public requests. | “Dev dependency” or “we do not call it directly” is not sufficient dismissal. Unknown reachability remains unresolved. |
| Remediation | Prefer a maintained compatible upgrade, removing the dependency or eliminating the vulnerable path. Review the lockfile and rerun affected functionality/build/security checks. | Do not run automatic force-fixes or broad version overrides without understanding compatibility and what actually changed. |

Severity is a starting signal, not the whole risk decision:

- **Reachable critical/high findings fail the release gate**, including exploitable build/CI paths, exposed credentials and known-exploited applicable issues. Fix/remove/mitigate and verify the exposed path is resolved before release. A tool's low severity label cannot excuse an observed serious exploit path.
- A critical/high advisory judged **not applicable or unreachable** needs explicit technical evidence for that classification, the exact locked version/path and a review trigger. This is a disposition to verify, not a blanket exception or a reason to ignore it forever.
- A **medium-risk temporary exception** needs a named responsible technical owner, affected component/path, assessed impact/reachability, compensating control if relevant, remediation task, specific expiry/review date and scope. Reassess on the earlier of expiry, a new applicable advisory, scope change or dependency change. Do not invent an owner or expiry now; an unowned exception is not valid.
- Track low findings and support/licence issues with proportionate remediation. False-positive decisions also need evidence. Do not accumulate an unexplained audit baseline that silently excludes new problems.

No `audit fix --force` by default. An override is not a verified fix merely because it hides an advisory from a summary.

**Meaningful test layers**

| Layer | What to test | What not to manufacture |
|---|---|---|
| Static/build checks | Lint, applicable type checks, invalid links/content references, selected schema/config validation and reproducible production build. | Tests that only repeat static markup or assert the implementation's internal arrangement. |
| Focused unit tests | Nontrivial shared validation/normalisation, bounded source attribution, receipt-state transitions, idempotency-key handling, retry/backoff or image/content transformations when these contain actual logic. Include Unicode/long input and edge cases. | A unit-test quota for every presentational component. Server validation cannot be replaced by a browser-only validator test. |
| Integration tests | Real application request handling with controlled receiving/storage/provider doubles; durable writes, provider errors, timeout, notification failure, retrieval, deduplication, rate limiting and safe errors. | Calling the live photographer inbox for every test or treating mocked success as production delivery evidence. |
| End-to-end tests | Entry → work/story → contact; direct story deep link; menu/viewer controls; meaningful form validation, success/failure/uncertain states; back/forward/refresh. Use the selected supported engines. | Hundreds of duplicate screenshots or asserting every CSS class. A browser automation engine is not proof of real iOS/Android behavior. |
| Human and device checks | Photographic quality/crops, full reading sequence, real Safari/iOS/Android inputs, accessibility, touch/keyboard, zoom, media playback and operating recovery. | Calling an emulated viewport a tested physical device or a high automated score an accessibility certification. |

Use deliberate failure injection in local/test environments. Repeat the checks affected by a change; broaden when a new risk or failure justifies it. A flaky run must be investigated, fixed or explicitly blocked; rerunning until green is not passing evidence.

**Enquiry correctness is a release-critical contract**

Define what durable receipt means for the chosen system: a recoverable record/queue/provider system accessible to the responsible responder. This need not be a custom database, but it must be real and retrievable. Distinguish **saved/received**, **notification pending**, **notification accepted by provider**, **final delivery where observable**, **qualified** and **booked**. An HTTP 200, email API acknowledgement, analytics event or WhatsApp tap alone proves none of the later states.

| Case ID | Failure or success condition | Required observable result |
|---|---|---|
| ENQ-01 | Valid request | Agreed durable record exists once, required context is correct and the designated responder can retrieve it. UI wording matches this receipt state. |
| ENQ-02 | Missing/invalid/oversized/unexpected fields | Server rejects or safely handles them according to the schema; specific safe field feedback; other entered values preserved. No stack traces, credential leakage or injection into messages/views. |
| ENQ-03 | Double click, concurrent same-key requests, retry after lost acknowledgement | One logical enquiry; the existing outcome returned consistently. Notification side effects also avoid unintended duplicates. Define key scope, lifetime and a deliberate new-submission path. |
| ENQ-04 | Offline, slow server, timeout before save or unknown response after save | Bounded pending state; no fake receipt. Safe retry or status recovery does not lose the request or create duplicates. No form contents in URL/query strings or silent persistent storage. |
| ENQ-05 | Notification fails after durable receipt | The saved enquiry remains accessible; notification status/failure is visible to the operator; bounded retry/dead-letter/manual recovery is documented and tested for the selected service. |
| ENQ-06 | Storage/receiving system unavailable or partially fails | No confirmation without the agreed durable condition. Transaction/queue semantics prevent a hidden lost request. A real alternative contact method may be offered. |
| ENQ-07 | Spam/rate limit/protection trigger | Limits work server-side; valid visitors get understandable recovery. Account for shared networks and accessibility; no silent discard of legitimate requests. Test bounded traffic in the authorized test environment, not a public-site load attack. |
| ENQ-08 | Non-JSON/provider exception/third-party outage | Predictable safe error state, useful operator signal and preserved core site. Retrying is bounded; no endless spinner or unhandled crash. |

Provide a designated owner for delivery failures before the form goes live. “We saved it somewhere” is not an adequate handoff if no one can find or respond to it. A draft without configured delivery follows the explicit non-sending placeholder behavior in the content-replacement specification.

**Security and privacy controls to verify in the selected architecture**

- Validate server-side field types, allowed fields, reasonable lengths and permitted formats; handle real Unicode names and international contact details. Validation, output escaping and safe parameterised storage are different jobs. Treat enquiry text and campaign/referrer values as untrusted wherever displayed or included in messages. Bound and allowlist useful attribution; do not store arbitrary full tracking URLs.
- Keep provider keys, deployment credentials and tokens server-side in the selected secret mechanism. Scan source, lock/config changes and built artifacts; check client bundles, source maps, logs and preview output for exposure. A discovered real secret requires revocation/rotation through the authorized owner and removal of the leak; deleting a line is not sufficient remediation.
- Use HTTPS and architecture-appropriate headers. Test a Content Security Policy based on actual script/style/image/connect/frame hosts; distinguish `frame-src` (what this site embeds) from `frame-ancestors` (who can embed this site). Avoid wildcard permissions or broad unsafe exceptions added merely to silence errors. Use report-only evaluation where useful, redact/report safely, then verify the enforced policy still permits the real enquiry and media flows.
- Check MIME/content-type handling, `X-Content-Type-Options`, a suitable Referrer Policy and framing policy. Introduce HSTS only with the chosen domain/subdomain HTTPS configuration understood; do not blindly preload a domain. If cookies are needed, use appropriate Secure/HttpOnly/SameSite and scope settings. Do not invent cookies or a login system for a site that needs neither.
- Apply precise CORS behavior to browser API calls where relevant; CORS is not authentication or bot protection. Assess CSRF when cookies/session authority make it relevant. A public enquiry endpoint still needs abuse controls; origin checks alone are not a complete defence.
- Collect the minimum enquiry data needed. Define access, retention/deletion and the responder's handling. Keep names, email, phone, message text and credentials out of ordinary error logs, analytics events and query strings. Prefer bounded request/receipt identifiers and safe error codes. Verify realistic failures do not accidentally log raw provider requests.
- Keep third-party scripts/embeds minimal and include their data/performance impact. Core work and contact remain usable when analytics, optional cookies, fonts, maps/social services or a video provider fail. An approved provider list is specific to the selected site; it is not an instruction to add those services.
- Do not introduce public uploads for this version. Owner media handoff follows the manifest/folder process. Before producing public derivatives, inspect/remove unintended EXIF GPS, device serials and private embedded metadata; handle orientation and colour management deliberately so stripping metadata does not damage the photograph. Preserve agreed attribution/rights information appropriately outside sensitive metadata. Confirm publication rights separately from technical processing.
- Keep preview access and production data separate. `noindex` is not access control. Do not put real client enquiries or uncleared sensitive material in a publicly reachable test environment. Use synthetic data for verification and restrict preview access where required by the material.

**Deterministic CI and release sequence**

Do not configure or run this pipeline during the current no-coding phase. Once the application approach is selected and implementation authorized, create scripts for these stages and record their exact invocation/output against one release candidate.

| Stage / ID | Required execution | Evidence / gate |
|---|---|---|
| Q01: clean inputs | Check out the exact candidate; use the pinned supported runtime and manager; frozen/immutable install; verify no unexpected lockfile drift. Review lifecycle scripts and avoid exposing deploy secrets to untrusted code. | Install log, versions and lockfile identity. Failure blocks later “tested build” claims. |
| Q02: static checks | Lint, applicable types, content/config/route checks and COPY-01 source-text checks. | Actual errors resolved; unused/absent checks labelled N/A with reason, not green by omission. |
| Q03: focused tests | Run meaningful unit and integration cases including ENQ-01–08 using local fixtures/provider doubles. | Deterministic results and relevant failure-path evidence. |
| Q04: dependency/security checks | Full dependency scan plus production subset; secret scan; licence/provenance/support checks; investigate findings. | No reachable critical/high or unresolved serious exposure; valid recorded dispositions/medium exceptions where applicable. Scanner failure is blocked. |
| Q05: production artifact | Build the deployable artifact with production configuration; inspect asset/output references, secrets, source maps, placeholder leakage and bundle/media budgets. | Exact artifact/version recorded; tested artifact is the one intended for release. |
| Q06: browser/lab | Run E2E on the actual production build in selected Chromium, Firefox and WebKit versions; responsive states, accessible interactions, failures and controlled performance traces. | Pass/fail per route/state; screenshots reviewed. No blanket device or field-performance claim. |
| Q07: permitted preview/manual | Deploy a controlled preview when authorized; complete the responsive specification's Tier A real browsers/devices, selected assistive-technology checks, photographic review and a real receiving-system test to an agreed destination. | Exact preview build plus actual browser/OS/device versions and redacted receipt/retrieval evidence. Missing device/destination is a gap, not a pass. |
| Q08: public content/release review | Run COPY-04 and reconcile content slots; verify true identity/services/contact, cleared work, licence/rights obligations, actual external destinations, semantic headings, metadata/canonical/structured data, sitemap/robots and redirects/404s. Review CSP/headers and operational recovery. | No draft notes, dummy proof, broken primary links, false promises or unready critical content. Deployment authority/domain target verified. |
| Q09: authorized launch/recovery | Release the same approved candidate; perform bounded smoke checks of public routes, assets, headers and authorized receipt. Confirm rollback/recovery access and response ownership. | Public build identity, result, operator and rollback record. Preview success alone does not establish launch success. |

Future **npm-only examples**, if npm is selected and the application defines these scripts; these were not executed. Use the equivalent frozen-lockfile commands if another package manager is chosen. Run in the eventual application root, not in the research tooling checkout.

```text
npm ci
npm run lint
npm run typecheck       # only if applicable and defined
npm run test:unit
npm run test:integration
npm audit --json        # complete locked tree
npm audit --omit=dev --json
npm run build
npm run test:e2e
```

Add the chosen licence and secret scanners explicitly; no scanner is implied to exist by this example. Preserve audit exit status and machine-readable results, including failures. Prefer validated upgrades and targeted retesting to `npm audit fix --force`. Clean-install success is not a security verdict.

**Visual, interaction and content release checks**

Use the detailed responsive/motion specifications rather than a homepage-only screenshot. At minimum verify: readable initial work without an animation gate; all implemented routes at the documented width samples; long/error/missing-content states; menu open/close during resize; visible keyboard focus; Escape and focus return in dismissible viewers; ordinary controls alongside gestures; pause controls for persistent automatic motion; equivalent reduced-motion content; text zoom/reflow; real film playback and its failure path; back/forward/deep-link recovery.

Measure actual image/font/JS requests under the proposed performance conditions, including nearby lazy images and every font subset. Review skin, fabric, low-light detail and colour at intended display sizes. Keep lab runs, physical-device observations and field Core Web Vitals separate. No artificially low image weight or automated accessibility score can substitute for those outcomes.

Test owner-review placeholders as a supported draft state. Run COPY-01 through COPY-04 using stop-slop, source checks and rendered-state review. Reject em dashes in authored UX, including decoded HTML entities/Unicode escapes, accessible names, image descriptions, metadata and structured data. Review clarity, facts and the meaning of each error/receipt message by hand. Retain raw source quotations and upstream licence/audit records outside this UX check.

Before public release, reconcile visible copy and generated routes with the content register. Supply missing required identity, representative work and a working contact path. Omit or redesign optional unavailable sections. Hiding a replacement note does not resolve the unverified content beneath it.

**Release decisions and recovery**

Blocking defects include exposed secrets; reachable critical/high vulnerabilities; false receipt, unrecoverable enquiry loss/duplication or an unowned receiving process; inaccessible primary controls; broken critical supported journeys; unreadable/obscured required content; public fabricated proof; uncleared required assets; and unsupported/incompatible essential dependencies. Record lesser visual defects and medium-risk exceptions with impact, owner, next action and review date. Do not silently redefine an environment as unsupported after a test fails.

Before an authorized launch, record the last known good artifact, the exact rollback command/process for the selected platform and who can execute it. Verify using a harmless preview/recovery exercise where feasible. Preserve already received enquiries through code rollback; assess storage/schema changes if any are introduced. Keep existing domain/mail records and the fallback contact route intact. An untested restore procedure must be labelled as such.

After release, verify the public build and retrieve an authorized test enquiry. Respond to actionable delivery failures and new applicable advisories through the designated maintenance process. Do not create scheduled jobs, send messages or alter business accounts solely because this plan mentions monitoring. Record any actual incident, affected version, recovery and targeted regression check.

**Ready-to-use result ledger**

Keep one record per check/environment/candidate. Required fields: check ID; build/commit/artifact; run date; exact tool/runtime/browser/OS/device versions; route/input/network conditions; result; redacted evidence; defect/advisory ID; responsible person; next action. Results are **Not run, Pass, Fail, Blocked, or N/A with reason**. A documented vulnerability exception remains visible with its scope and expiry; it is not silently converted into a clean scan.

| Check group | Current result | Evidence needed before changing it |
|---|---|---|
| Q01 clean install/runtime/lockfile | **Not run** | Eventual app manifest/lockfile, exact clean-install run and output |
| Q02 static/type/content checks | **Not run** | Selected scripts, candidate and actual results |
| Q03 unit/integration; ENQ-01–08 | **Not run** | Meaningful fixtures/cases, durable receipt and injected-failure outcomes |
| Q04 dependency/secret/licence/support checks | **Not run** | Full + production findings, provenance/licence inventory, scan health and dispositions |
| Q05 artifact/output review | **Not run** | Production build identity, asset/content/secrets review |
| Q06 automated engines/accessibility/performance | **Not run** | Per-route/state results, exact conditions, reviewed screenshots and traces |
| Q07 real browsers/devices/receiving system | **Not run** | Physical-device and assistive-technology notes; agreed test destination; redacted retrieval evidence |
| Q08 final public content/headers/release readiness | **Not run** | Cleared slots, true claims/contact, actual response headers and recovery plan |
| COPY-01 to COPY-04 source/voice/rendered/public copy | **Not run** | Authored source and decoded output checks, page/state reading review, accurate claims and zero em dashes in UX |
| Q09 public smoke/rollback | **Not run** | Authorized deployment identity, public verification and recovery evidence |

Owner-independent work can prepare fixtures, threat modelling, dependency-selection criteria and this test contract. The final receiving destination, business promises, rights, domain authority and operating owner remain specific inputs to resolve before the dependent live/public checks. They do not justify skipping implementation tests we can run locally once coding is authorized.

**Reference basis**

The linked responsive, performance, motion and replacement specifications contain their own evidence and limits. These additional primary documentation URLs returned HTTP 200 on 15 October 2026; they guide the future protocol and are not website test results:

- [npm: clean installation with npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).
- [npm: security auditing](https://docs.npmjs.com/cli/v11/commands/npm-audit/).
- [MDN: Content Security Policy implementation](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP).
- [MDN: secure cookie configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies).
- [MDN: TLS configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/TLS).
