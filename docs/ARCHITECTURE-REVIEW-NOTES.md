# Seven Steps architecture review notes

15 October 2026. Independent architecture recommendation for the current research and planning phase. The user has requested the architecture and review work possible now. The agent has not generated website code, installed an application, run website tests or started OpenDesign. The coordinating agent has recorded final decisions in [TECHNICAL-DECISIONS.md](TECHNICAL-DECISIONS.md) and the execution plan. That record resolves the alternatives below, including the isolated transactional receiver required by the retained enquiry contract.

## Recommendation

Use **Astro with static output, Astro components, TypeScript for content contracts and small browser modules, and native CSS** as the default for the first review site. Start without a React adapter, client router, animation framework, CMS service or server-rendered portfolio routes. Use ordinary links between pre-rendered pages. Add native browser enhancements for the menu, image viewer, arrows, motion controls and enquiry state where needed.

This is a proposed technical default, not a claim that Astro guarantees the performance targets. The selected concept can change composition, crops and motion without changing this architecture. A later request for accounts, a private client portal or a substantial application would justify a fresh decision.

Keep any live enquiry receiver outside the static page-rendering path. Prefer a managed form service with a recoverable submission inbox and verified behavior. If that service cannot meet the chosen receipt and deduplication contract, compare a small isolated server endpoint with storage against a simpler approved direct-contact scope. Do not turn the whole portfolio into a server application to receive one form.

## Evidence and comparison

The nine primary documentation pages below returned HTTP 200 on 15 October 2026. Their documentation supports the capability statements. No candidate website was built or benchmarked. Release versions, dependency security, actual transfer sizes, browser results and hosting costs remain unverified until their relevant checks run.

| Candidate | Verified capabilities | Fit for this site | Costs and decision |
|---|---|---|---|
| **Astro static + native modules** | [Astro components](https://docs.astro.build/en/basics/astro-components/) render to HTML without adding a client runtime by default. The developer can add scripts or framework islands where needed. [Content collections](https://docs.astro.build/en/guides/content-collections/) support schemas and content-generated routes. [Images](https://docs.astro.build/en/guides/images/) documents image processing and responsive output. | Shared layouts, a small work index, two initial stories, optional privacy information, a draft checklist and selective interactions. The developer can keep navigation and most content independent of browser JS. | Adds a build toolchain and image-processing dependencies that need a lockfile, licence/security review and supported runtime. The site still ships any scripts the developer adds. **Recommended default.** |
| **Next.js / React** | [Static export](https://nextjs.org/docs/app/guides/static-exports) supports build-time Server Components, static HTML and a payload for client navigation. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) separates server work from interactive client components. Static export excludes features such as Server Actions and default-loader image optimisation. | Stronger case if the project grows into an application, the maintainer already operates a React system, or a verified integration requires it. It can also serve a portfolio. | Client navigation, React boundaries and any client components compete for the same JS budget. Static export still needs a separate live receiver; server features require an appropriate runtime. More concepts and dependency surface than the current page set needs. **Retain as an alternative with a concrete reason, not the default.** |
| **Plain HTML/TypeScript/CSS with Vite** | [Vite production builds](https://vite.dev/guide/build.html) support multiple HTML entries and asset bundling. [Static deployment](https://vite.dev/guide/static-deploy.html) serves the generated files; the local preview server is not a production server. | Good for a very small site with few repeated structures, or a maintainer who prefers hand-authored HTML and has a proven content workflow. | Vite supplies a build pipeline. The developer still needs conventions for shared page structure, content validation, project-page generation and image variants. Adding a custom template/data generator recreates work Astro already covers. **Viable simpler alternative if the scope shrinks; avoid repeated manual pages or an invented mini-framework.** |

Do not call Next's Server Components a zero-JavaScript architecture, or claim that Next must exceed 80 KiB without measuring a candidate. Do not claim that plain Vite is faster than Astro from package names alone. Astro's [islands model](https://docs.astro.build/en/concepts/islands/) permits a small interactive footprint; it does not make every carousel, animation or integration free.

## Minimum page and component contracts

Use the proposed routes and 27 content groups in the [existing slot inventory](CONTENT-SLOT-INVENTORY.md). Do not create a second readiness register. The initial route proposal is a home page, two real story pages, a 404 and any required privacy information. The owner checklist belongs to the private review output. Final project slugs follow confirmed public names/titles; draft route names must not become public by accident.

| Component or boundary | Minimum contract | State and failure requirement |
|---|---|---|
| Page shell and navigation | Route title, description, language, selected navigation item, canonical/public-share data when confirmed, header/footer and contact links. | Ordinary links and useful HTML without scripts. Menu disclosure keeps focus and expanded state correct. No canonical URL derived from a preview host by accident. |
| Photograph frame | Approved public image ID, width/height or aspect ratio, responsive variants, intended crop/focal point, alt text, optional caption and credit. | Reserve space. Keep the lead photograph available before enhancement. Failed images retain useful context. Avoid rendering a private source reference into a URL or alt text. |
| Project summary and work rail | Stable project ID, public slug/title/context, cover reference and optional category. | Each item links to an actual story. Native horizontal overflow, buttons and keyboard access work without a custom scroll engine. |
| Story page | Ordered references to photographs from one assignment, confirmed public context, optional factual note and useful enquiry link. | Native vertical reading. Missing draft content has slot notes; public output validates the required content. No forced chapter count or generic narrative inserted to fill space. |
| Image viewer | Current image ID/index, ordered public image references, captions, opener reference and close behavior. | Finite next/previous controls by default, gesture alternatives, focus return, correct announcements, bounded adjacent-image loading and failure recovery. Load viewer code on intent if this helps the budget. |
| Motion controller | Global Full/Still preference, reduced-motion setting and per-component playing/paused/selected state. | Stop on pause, focus/hover inspection, background, offscreen state and route departure. Resume only as specified in the motion contract. No global state framework is required for this small state set. |
| Enquiry UI | Current form values, optional selected-story context, validation, request identity and explicit idle/pending/received/uncertain/error states. | Draft mode never sends. Public mode uses the verified receiving boundary. Preserve input during correction and uncertain outcomes; do not store PII in URLs or ordinary analytics. |
| Draft content slot and checklist | Stable slot ID, requested material, status, issue note and reference to the existing register. | Derive the local Add/Replace note and checklist row from the same data. No Upload button without real save behavior. Exclude draft-only data and routes from public output. |

Keep component inputs small. Do not serialize the complete private content record into a browser island or a script merely to obtain an image URL. Whitelist the fields the public component needs. With ordinary multi-page navigation, the browser handles most page lifecycle work; optional View Transitions still need focus/history tests and paused-state restoration. A client router is not a prerequisite for those transitions.

## Minimum data contracts

These are schema responsibilities to implement later, not new data files or an approved CMS model.

| Record | Fields that matter | Boundary |
|---|---|---|
| Site facts | Cleared display name, service descriptor, public person/role where used, language, confirmed contact destinations, actual service/process facts and public domain when chosen. | Unconfirmed values can produce marked draft slots. Required missing facts fail a public build. No invented founding year, rating or response promise. |
| Project | Stable ID, public slug/title, occasion/location where confirmed, cover image ID, ordered image IDs, optional factual note and publication status. | Validate uniqueness and cross-references. Preserve stable IDs through edits. A Behance publication date does not become an event date. |
| Public photograph | Stable image ID, permitted web asset reference, intrinsic dimensions, variants/crop information, alt text, optional caption/credit and clearance outcome. | Export only public fields. Keep private permission records, original filenames that expose personal information and source-storage credentials outside the served data. |
| Content slot | Existing group ID, display location, required/optional decision, status, requested material, supplied reference and remaining issue. | One readiness source drives draft UI and public validation. Child image IDs do not inflate the group-completion denominator. |
| Film | Approved viewing source, title/type, poster, credits and required caption/descriptive support. | Validate allowed URL schemes/providers. Render a poster before explicit playback; do not accept arbitrary embed HTML. |
| Enquiry request and result | Bounded contact/event fields, optional visible story context, bounded attribution, logical request identifier and a documented result state. | This record belongs to the receiving system. It never enters a public content collection, static JSON file or repository as real client data. |

Use schema validation for structure and cross-references, then human review for photographic quality, facts, clearance and copy. A schema cannot prove that a testimonial is genuine or an image is permitted. COPY-01 through COPY-04 cover source strings, decoded output, labels, metadata and difficult UI states.

## Preview and public output

Use one set of components and content contracts with **explicit private-review and public build modes**. Require the build command/configuration to identify its output mode. Avoid a URL parameter or browser toggle that can reveal draft-only information on a public deployment.

| Private review | Public release |
|---|---|
| Display useful Add/Replace notes at the intended locations, including missing optional slots. Show the shared checklist and truthful status. | Exclude the checklist, draft notes and unready optional sections from generated HTML, JS, JSON, metadata and routes. Do not hide them with CSS. |
| Use intentional empty compositions or labelled example structure. Use actual photographs only within their permitted review scope. | Require cleared identity, representative work and a working confirmed contact path. Validate actual route and asset references. |
| Keep the form non-sending until its integration is authorized and configured. Local test doubles can demonstrate validation and error states with synthetic data. | Enable a form only after the receiving contract passes its checks. A confirmed direct-contact path can replace a form if the selected scope permits it; mark omitted form-specific checks N/A with the decision recorded. |
| Keep the review local initially. If a shared preview is authorized, apply access restrictions appropriate to the material. | Deploy only the identified public artifact. Review headers, external destinations, canonical data and rollback for the actual host. |

`noindex` is not access control. A public preview with a hidden menu can still expose routes and assets. Separate output directories/artifact identities prevent uploading an earlier draft by mistake. Build validation should catch missing required data, leaked notes and placeholder metadata before release, while permitting the intended incomplete private state.

## Content and media workflow

**Default:** a developer-managed content workflow with the existing slot register, a structured file collection and an agreed folder handoff. Choose JSON for structured records and plain Markdown only where a longer approved note needs it. Keep arbitrary HTML disabled in owner-provided text. Do not accept owner-supplied MDX as content because it can execute components/code during the build.

1. Receive originals and fact/credit/permission information through an agreed handoff. Keep confidential originals and permissions outside the public web directory. The current user need not know private business facts or operate Git.
2. Curate a small set of permitted web masters. Record the source reference, crop decision and export process. Generate responsive derivatives with the chosen build pipeline or a documented image preparation step. Inspect skin tones, fabrics, low-light detail, orientation and colour handling.
3. Store the approved public assets and their references so a clean build can reproduce the site. For the small initial portfolio, versioned web assets can be practical; do not put the full camera archive in the repository. If assets live outside the repository, define the authorized build-access and integrity/reproducibility mechanism.
4. Update the same slot records, rebuild a private preview and check the actual crops and text. The owner can review the web result without using a custom editor.
5. Publish the identified public artifact only after content and functional checks. Record who will make later updates and what inputs that person needs.

Astro's image tools can assist with derivatives, but files copied to a public directory are not automatically a private source archive or an optimisation policy. Confirm which asset paths the build processes and which it copies unchanged. Strip unintended GPS/device/private metadata from public exports while preserving orientation, intended colour and required attribution through the approved workflow. Request only the variants the composition needs.

Defer a hosted CMS until the maintainer and update frequency establish a need. A CMS can give the photographer a usable editor, but it introduces accounts, permissions, media handling, preview access, build triggers, subscription limits and another failure path. It does not replace clearance or review. Frequent owner-led publishing would justify comparing a managed editor against the file workflow. A few assisted updates do not require one. The public site can keep the same data contracts if a CMS is added later.

Defer an image CDN until volume, editing workflow or image-service requirements justify its cost and provider coupling. Use click-to-play hosted films where appropriate rather than building a video transcoding/streaming service. Hosting and media provider selections require their actual terms, limits, account authority and tested behavior; the old Netlify draft URLs do not settle those decisions.

## Enquiry architecture: resolve the actual tradeoff

Astro's [rendering documentation](https://docs.astro.build/en/guides/on-demand-rendering/) states that pages, routes and API endpoints are pre-rendered by default. A static endpoint created at build time cannot receive a visitor's later enquiry. An incoming POST needs a managed service or an on-demand server function with the appropriate deployment support. This boundary is independent of the portfolio page framework.

The saved quality contract asks for a recoverable record, responder retrieval, failure visibility and protection against duplicate retries. A frontend success toast or an email provider's accepted response does not establish those outcomes. Conversely, a recoverable managed submission inbox can satisfy receipt without a bespoke database, if its actual guarantees, retention and retrieval meet the contract.

| Receiving option | Advantage | Cost / decision requirement |
|---|---|---|
| Managed form service with submission inbox | Small integration and less custom operational work; service may provide storage, abuse controls and notifications. | Verify save/acknowledgement semantics, retention, export/retrieval, idempotency or duplicate handling, spam visibility, outage behavior and accessible no-JS fallback. Do not assume those features from a “forms supported” label. This is the first option to evaluate. |
| One server endpoint with managed durable storage | Developer controls validation, logical request identity, response states and notification recovery. Static pages remain portable. | Adds secrets, schema/retention decisions, abuse protection, monitoring and operating responsibility. Use only if a provider cannot meet the selected contract or another concrete requirement warrants it. |
| Confirmed email/phone/WhatsApp path without a site form | Lowest integration and stored-data burden on the website; can be a valid approved launch scope. | The site must not claim a click was sent, received or booked. The business still needs response ownership. This changes the form scope and measurement; do not silently present it as equivalent to tested durable form receipt. |

B02 private UI work needs a provisional contract and non-sending test double. B03 live integration needs the confirmed recipient/responder, selected provider and actual retention/data handling. Keep this distinction; missing inbox details must not block an authorized private layout.

For a retained form, prefer a standard HTML POST path where the selected receiver supports honest receipt/error pages, then enhance it with in-page state handling. If only a JS API is available, provide a confirmed direct-contact fallback and document that limitation. Do not put secrets or real submission data into a static bundle. Retry safety belongs at the receiving boundary, not only in a disabled button. A managed provider that lacks the required deduplication behavior creates a decision to revisit, not permission to claim the test passed.

## Performance and dependency consequences

Preserve the existing proposed envelope: **350 KiB critical transfer, 900 KiB cold entry, 80 KiB initial compressed JS, 30 KiB CSS, 35 KiB HTML and 100 KiB combined initial fonts**. Preserve the image-quality, full-story, no-automatic-player and field-vitals targets in [the performance research](INTERNATIONAL-AND-PERFORMANCE-RESEARCH.md). The per-resource ceilings cannot all be consumed if their sum breaches the critical total.

Astro makes a small client footprint a credible design target. The developer must still measure the actual output, request order, nearby image loading, font subsets and optional interactions. React hydration, a client router, global animation library, analytics, a consent manager or an embedded form can each consume that allowance. None should appear by template inheritance. Do not add a hidden prefetch queue for every story or all future hero slides.

Keep the build and production dependency inventories separate but audit both. Static serving removes the need for a continuously running page-rendering server; it does not remove build-tool, image-processor, CI or supply-chain risk. Pin the chosen supported runtime, package manager and package versions when preparing the application. Review the current advisories and licences before installation/execution, then run the full checks against the actual locked tree. Do not claim a version is secure from this architecture review.

Create the eventual application dependency tree separately from `.design-tooling/open-design` and its installed packages. The OpenDesign security hold remains in force. Its offline references can inform design, but the application must not inherit its runtime, manifest, lockfile or transitive dependencies as a shortcut.

## Review findings and decisions to carry forward

| Finding | Recommendation / consequence |
|---|---|
| Static pages and a reliable enquiry receiver are different responsibilities. | Choose static Astro for pages; define and verify the independent receiving boundary. Do not place a build-time API route in the plan as a live form backend. |
| The 80 KiB JS target constrains the sum of features, not just framework code. | Start with no client framework/router. Measure any later exception against the full cold-entry result and interaction traces. Do not promise a number before a build exists. |
| Placeholder review and public validation need different acceptance rules. | Permit incomplete private content, exclude draft-only output from public artifacts and fail public generation on unresolved required identity/work/contact. Do not make every absent optional item block the private build. |
| A folder/manifest workflow needs an actual maintainer, but the project has not established owner editing needs. | Use assisted file updates as the initial technical default; record the maintainer before operational handoff. Evaluate a CMS when an editing requirement appears, not because other photography sites have one. |
| Strict retry/durable-receipt requirements may exceed a cheap form provider's guarantees. | Verify the provider against ENQ-01 through ENQ-08. Record a scope/architecture change if it fails. Do not add a database and queue before investigating the provider, and do not weaken the claim without a recorded decision. |
| Rich motion does not require a single-page application. | Use native overflow, CSS transitions, small controllers and optional supported View Transitions. Keep story navigation and reading usable without enhancement. |
| A proposed structure is not a code review result. | This document reviews architecture and contracts. Build, static analysis, dependency scans, E2E, accessibility, device, receipt and performance results remain Not run for the future website. |

The remaining decisions that can refine this architecture are the selected concept, retained routes/features and the preferred editing workflow. The actual live receiving provider, hosting account/domain and business promises depend on their confirmed facts and authority. Those gaps do not prevent documenting the default architecture or later building an authorized private review site with marked content and a non-sending form.
