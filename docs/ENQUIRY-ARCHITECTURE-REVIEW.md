# Enquiry, hosting and media architecture review

Prepared 15 October 2026. **Status: researched proposal, not an implementation or a delivery test.** The review used read-only HTTP requests to primary documentation. No account, deployment, form submission, message, purchase or website code was created. OpenDesign remained stopped. The final architecture decision belongs in the project's technical decision record.

Read this with the [ENQ-01 through ENQ-08 contract](QUALITY-AND-SECURITY-GATES.md), [responsive and reliability specification](RESPONSIVE-AND-RELIABILITY-SPEC.md), [media budgets](INTERNATIONAL-AND-PERFORMANCE-RESEARCH.md) and [content replacement rules](CONTENT-REPLACEMENT-UX.md). Those requirements remain intact.

## Recommended default

Use Astro to produce static pages and pre-generated responsive images. Netlify is a viable hosting candidate, with no Astro adapter needed for that baseline. Its documentation and Astro's guide support adding an independent Netlify Function without converting the content site to server rendering. Provider ownership, plan and domain configuration still need confirmation. [S1][S2]

For the private review version, use the specified non-sending enquiry states and confirmed contact links where available. Unknown destinations remain labelled placeholders. Receiving-system selection does not block an authorized private layout build.

When the form is activated, use **one same-origin receipt boundary, a managed transactional store and a notification outbox**. A small serverless handler validates the request and commits the enquiry plus its pending notification together. Only then does it confirm receipt. A worker sends the notification; a repair process finds unfinished work. Use an existing provider console or approved operating tool for retrieval. Do not build a custom admin portal, visitor accounts, payments or file uploads.

This is the smallest proposed form architecture that preserves the current atomic deduplication, validation and recovery contract. The exact store, notification provider and operating access are named B03 prerequisites. Netlify Functions plus managed PostgreSQL is a documented candidate, not a selected account or a claim that its default settings are suitable. [S3][S4][S5]

**Do not select direct Netlify Forms under the current contract.** It provides useful managed storage and notifications, but the reviewed documentation does not establish atomic request-key deduplication, the required server-side business schema, or recoverable notification failures. Its documented honeypot behavior quietly discards submissions. These gaps must not be hidden by weakening ENQ-01 through ENQ-08. [S6][S7][S8][S9]

## Options compared

| Option | What it provides | What it leaves unresolved | Recommendation |
|---|---|---|---|
| Netlify Forms directly from static HTML | Deploy-time form recognition; verified/spam submission lists; export/API access; sanitization; managed email/webhook notifications | No documented atomic logical-request deduplication or full custom validation contract; quiet honeypot rejection; notification retry/failure visibility is not established by the reviewed docs | Not selected for the present receipt contract. A useful comparison, not a drop-in implementation of all ENQ gates. |
| Static pages plus one serverless receipt handler, transactional store and outbox | An explicit schema, recoverable record, unique request key, stable acknowledgement and owned notification recovery | Requires tested code, provider configuration, cost limits, an operator and a usable retrieval process | Recommended live-form boundary. Keep the content site static. |
| The same boundary plus a managed queue | Separate retry processing and workload buffering | Queue delivery can repeat; database write plus queue publish is still a two-system failure boundary; retry exhaustion needs recovery | Add only if delivery volume, latency or provider capabilities justify it. A queue does not replace the record, outbox or deduplication. |
| Confirmed email, phone or messaging links | A small, resilient route to an existing business channel | Opening a composer/app does not send a message or prove receipt; handling and measurement happen in that channel | Keep as an alternative and no-JavaScript contact path. It cannot be reported as a passed website-form receipt journey. |

MDN documents `mailto:` and `tel:` link behavior, including device-dependent handling. Use visible confirmed contact details so a visitor can copy them if their device has no suitable handler. Do not generate a success message after a link click, and do not prefill sensitive enquiry content into URLs. [S10]

## What the Netlify Forms documentation establishes

| Area | Verified capability or limit | Consequence for this project |
|---|---|---|
| Recognition | Form detection must be enabled, then a deploy must occur. Netlify scans built HTML for a named form marked for handling. Client-rendered forms require a static HTML definition containing matching named fields. [S6] | Inspect the actual generated and deployed HTML and the detected form in the chosen account. An Astro development screen or generic static preview cannot demonstrate provider recognition. |
| Submission format | Ordinary HTML POST works without additional JavaScript. AJAX submissions use URL-encoded fields and `form-name`; JSON form data is not supported. [S6] | A form enhancement must preserve the real submission contract. A client-only component is unnecessary for a static form. |
| Receipt and retrieval | The dashboard defaults to verified submissions, with a separate spam view. Verified submissions can be exported to CSV; APIs support retrieval and management. Data is stored in Netlify's user database. [S7] | There is an actual recoverable system, but browser success must still be checked against the intended record and responder's access. A generic thank-you page is not that evidence. |
| Validation | Netlify documents automatic sanitization of harmful submitted code. [S7] | Sanitization is not proof of required fields, allowed fields, maximum lengths, cross-field rules or safe handling in later email/export consumers. No complete project-specific server schema contract was found in the reviewed pages. |
| Deduplication | The reviewed setup, submission, notification and troubleshooting pages do not document a client-supplied idempotency key with an atomic uniqueness guarantee. [S6][S7][S9][S11] | A hidden UUID and a disabled submit button would not establish ENQ-03. No deduplication or lost-acknowledgement recovery was tested. |
| Spam | Akismet-filtered submissions remain available in the spam list and can be marked verified. Honeypot or reCAPTCHA failures are rejected and are not included even in that list; the honeypot section explicitly describes quiet rejection. [S8] | Responder checks must include spam. Do not infer that autofill and assistive technology can never trigger a honeypot. Quiet rejection is incompatible with the current requirement for truthful recovery from protection failures. |
| Notifications | Notifications apply to verified submissions. Email and webhook destinations can be configured. An input named `email` supplies the email notification's Reply-To; `%{submissionId}` can identify a notification. [S9] | Email is an alerting path, separate from storage. Destination access and Reply-To need an authorized delivery test. The reviewed page does not establish an operator-visible retry/dead-letter process for failed notifications. |
| Form-triggered functions | The event handler fires when a submission is verified. [S12] | A function triggered after receipt cannot make the original managed receipt atomic or prevent a duplicate at ingress. It also does not cover quietly rejected input. |
| Retention | Netlify recommends regularly exporting and deleting submissions containing personal information. Deletion is permanent. No automatic verified/spam retention duration was specified in the reviewed submissions page. Uploaded files can remain at their direct URL for 24 hours after form deletion. [S7] | Define retention and deletion rather than assuming automatic expiry. Public uploads are outside this site's scope. Exports, inbox copies and backups need their own handling. |
| Schema changes | Renaming or changing a field can hide old values from the dashboard because it shows the last deployed schema; older data remains retrievable through the API. [S11] | A renamed field needs a retrieval/migration check. A prettier current form must not make older enquiries practically inaccessible. |
| Billing | The current Forms page says Forms are free and unlimited on credit-based plans. Legacy plans use different metering and may change service levels with usage. Other site resources remain metered. [S13][S14] | Do not repeat historical free-tier submission quotas as current universal limits. Verify the actual account's plan and total hosting cost before selection. |

Netlify's AJAX examples use a resolved `fetch()` promise to continue to success. MDN confirms that `fetch()` also resolves for HTTP error responses. Any implementation must check the status and agreed response body, handle malformed responses and confirm the intended receiving condition. Copying an example's `.then()` is insufficient. [S6][S15]

## Minimal live receipt design

The following is a proposed contract, not website code or an executed test.

1. **Issue a logical request key.** Each new enquiry gets a high-entropy key scoped to this form/version. Keep it for retries of that enquiry. A key is not a person's identity. Do not deduplicate separate legitimate enquiries merely because they share an email address or similar text.
2. **Validate on the server.** Allow only the agreed fields, bound body/field sizes, preserve legitimate Unicode names and international contact details, and normalize consistently. Treat source/story references as bounded untrusted input. Apply abuse limits with an understandable error, not a false receipt. Never accept a caller's destination email or arbitrary forwarding URL.
3. **Commit once.** In one database transaction, create the enquiry and its pending notification record. Enforce uniqueness on a non-null scoped request key in the database. A prior read followed by an unprotected insert is not atomic. Store a canonical request fingerprint so reuse of the same key with different data returns a safe conflict instead of overwriting a received enquiry. PostgreSQL documents unique constraints and all-or-nothing transactions; the Netlify Database API documents using one pooled connection for a transaction. [S5][S16][S17]
4. **Acknowledge the committed record.** Return a stable opaque reference and the agreed receipt state. A retry with the same key and same data returns that existing outcome. Confirmation means received, not available, quoted, booked or read by a person. Do not wait for inbox delivery to establish the record, and do not confirm before commit.
5. **Send from the outbox.** An outbox is simply stored pending notification work in the same managed database. Claim work atomically so concurrent workers do not send it together. Persist attempts, provider identifiers, safe error codes and next-retry state. A post-commit dispatch can start delivery promptly; a bounded repair sweep catches failed dispatches and abandoned work. Keep the record if the mail provider fails.
6. **Make failures actionable.** The responder or designated operator must be able to find received records and failed/pending notifications using the selected provider's existing console or approved tool. Demonstrate retrieval without relying on an engineer to reconstruct logs. If the chosen console cannot support that workflow, provider selection is incomplete. Do not solve it by quietly adding a custom account system.

Before activation, choose and test the request-key lifetime, record retention, retry horizon, worker claim/lease behavior and deliberate new-enquiry action. Keep the key record for the entire supported retry window. An expired key must not silently turn an uncertain retry into a new enquiry. Do not silently persist names, phone numbers or message text in browser storage; input can stay in the current interaction while the visitor recovers.

For a no-JavaScript form, the same isolated handler can serve a small HTML form with a fresh per-form key, then accept its POST and render safe validation/receipt states. A static key embedded once at build time is invalid for this purpose. The main pages still remain static. If this form route is deferred, confirmed direct contact links remain the no-JavaScript route and the limitation must be stated in the B03 result.

### Notification and queue boundaries

Netlify Background Functions return an initial `202` when invoked, before processing completes. The docs describe retries after one minute and then two minutes following invocation errors. This is useful execution machinery, but that initial response does not establish the project's durable enquiry receipt and is not a replacement for the stored outbox. [S18]

Netlify Scheduled Functions run automatically only for published deploys. Local development and Deploy Previews require explicit invocation for testing; scheduled functions have a 30-second execution limit. Test the worker independently, then verify the authorized production schedule and recovery separately. A successful manual invocation does not prove that scheduling works. [S19]

A separate queue is optional. Cloudflare Queues documents at-least-once delivery, so consumers can receive duplicates. Its dead-letter documentation states that exhausted messages are permanently deleted when no dead-letter queue is configured. If a queue is introduced, retain the database outbox until dispatch is established, carry the same notification identifier through retries, and configure recovery. Sending a queue message after a database commit without repair leaves a loss window. [S20][S21]

Choose a mail provider with documented idempotency or a demonstrable equivalent. For example, Resend documents replay of the same response without sending again for an idempotency key used within the previous **24 hours**, and a conflict when that key is reused with different content. This is a viable primitive with a limited window, not a provider selection. Bound automatic retries within the chosen provider's guarantee. An uncertain outcome beyond that window needs provider reconciliation or operator recovery, not a blind resend. [S22]

Keep notification states precise. Resend's `email.delivered` means delivery to the recipient's mail server; it does not establish placement in the inbox or a human reading it. Delivery-delayed, bounced and failed events are distinct. If such webhooks are used, verify their authenticity, handle duplicate events and retain only necessary operational data. These integration checks have not run. [S23]

If stronger bot protection is needed, verify it server-side and keep an accessible fallback. Turnstile, for example, documents five-minute, single-use tokens and a separate idempotency key for retrying validation. That token is not the enquiry's idempotency key. The implementation must account for a saved enquiry being retried after a challenge token has already been consumed. No CAPTCHA product is selected by this review. [S24]

## Hosting and media proposal

| Concern | Default proposal | Gate or reason to change it |
|---|---|---|
| Page delivery | Pre-render home, work, story, process and contact content to static HTML. Keep small enhancements separate from the receipt boundary. Netlify can build Astro to `dist` without an adapter for this scope. [S1][S2] | Pin supported build tools later, audit the actual dependency graph, and verify deep links, headers, caching and rollback on the selected host. Existing draft ownership does not authorize reusing its account. |
| Photography | Generate a finite set of responsive sizes/formats at build time using Astro image components, with explicit crop/art-direction decisions. Astro documents build-time processing for pre-rendered pages and multiple sizes/formats through its image components. [S25] | Use supplied, cleared material. Inspect skin, textiles, low light and large-screen quality against the existing byte budgets. Do not treat a single quality setting as acceptance. |
| Asset placement | Use processable source assets for the build and publish only intended web exports. Astro recommends `src/` for processing; files in `public/` are copied as-is. [S25] | Inspect the final output for uncompressed originals, GPS/private metadata, unused assets and broken references. Do not assume that moving a file into a source directory alone guarantees its exclusion from the public build. |
| Image CDN | Do not require runtime image transformation for the first curated portfolio. Netlify Image CDN is a documented option if build time or frequent remote edits justify it; it supports transformations, content negotiation and caching. [S26] | Adding the Netlify adapter automatically uses Image CDN for Astro images. Review that intentional change, its source allowlist, crop behavior, cold requests and actual plan cost. Remote sources add availability dependencies. [S2][S26] |
| Film | Show a permitted, optimized poster and a clear play action. Load the chosen player/media on intent, preserving the current zero automatic video/player-byte mobile proposal. | Confirm film rights, actual player source, captions/accessibility, provider privacy behavior and fallback before integration. Do not add a social feed, map or video iframe to initial page load merely because the host supports it. |
| Failure independence | Browsing and confirmed contact details remain usable if the receipt endpoint, optional player or analytics fails. | Test network failures and absent JavaScript using the saved route/device matrix. A static host improves separation but does not establish availability by itself. |

Static media has predictable public artifacts and fewer runtime dependencies, at the cost of image work during builds and a rebuild when content changes. A runtime CDN reduces build work and can suit a frequently edited remote library, but the actual editing process has not been confirmed. Keep the first decision proportional to the curated portfolio and revise it with measured build/content needs.

## Provider, privacy and cost gates

Netlify Database is a documented managed PostgreSQL candidate with transaction support, but two defaults need attention before choosing it:

- **Preview data:** its documentation says a Deploy Preview database branch starts with a copy of production data. Isolation from production writes does not remove the personal-data copy. Keep real enquiries out of previews and agent runs. Verify a supported synthetic-data/environment separation before using that workflow; do not assume an opt-out exists. [S4]
- **Idle cost:** database compute is metered while active, with sleep-on-inactivity behavior. Frequent polling can keep a small database awake. Select the worker schedule and post-commit dispatch with this cost in view. The billing page still contains a July 1, 2026 storage-price transition without a settled storage rate in the inspected text. It cannot establish an October fixed monthly quote. [S27]

Before B03, record the selected host/store/mail plan, owner, region where applicable, processor/data terms, storage and backup retention, deletion process, access roles, recovery capability, usage alerts and behavior at limits. Estimate ordinary and abuse traffic, notification retries, build/deploy volume, media transfer and repair-worker activity. No traffic baseline or account bill was inspected here. Do not enable paid upgrades, change an existing plan or promise a free operating total from public documentation.

Collect only the enquiry fields the responder needs. Keep personal data out of URLs, analytics and ordinary logs. An enquiry database, notification inbox, exported CSV, preview copy and backup are separate retention surfaces. Keep preview credentials and recipients separate from production; use synthetic test content and an agreed test destination when integration is authorized.

## Activation and verification gates

All website checks below are **Not run**. Documentation establishes candidate capabilities, not a passing implementation.

| Gate | Evidence required before the live form is enabled |
|---|---|
| B03 operating inputs | Confirmed recipient, responsible responder/operator, usable retrieval method, retention/deletion, failure escalation and any response-time copy. Unknown owner answers remain input gaps, not reasons to halt private layout work. |
| Static versus provider preview | Production build inspected; sending disabled in ordinary owner-review previews. An authorized integration environment uses separate data and recipient. If managed Forms is ever reconsidered, prove deploy-time detection and exact fields there. |
| ENQ-01 | One retrievable durable record with the correct context; acknowledgement/reference reflects that record. The responsible person demonstrates access. |
| ENQ-02 | Server validation of missing, unexpected, invalid and oversized fields; safe output; preserved usable input. Sanitization and browser validation alone do not pass. |
| ENQ-03 | Concurrent same-key requests, double tap and lost acknowledgement produce one record/outbox item. Same-key changed content conflicts safely. Worker/provider deduplication and expired-key handling are tested. |
| ENQ-04 | Offline, timeout before commit and timeout after commit preserve honest states. A same-key retry recovers the existing outcome. No personal form content leaks into URLs or persistent browser storage. |
| ENQ-05 | Inject notification failure after commit and a crash after provider acceptance. The record stays accessible; attempts/unknown outcomes are visible; bounded retry and manual recovery work without unintended duplicate notifications. |
| ENQ-06 | Inject unavailable storage, failed transaction and failed post-commit dispatch. No premature receipt; no lost pending work. Restore/recovery expectations are documented and tested to the agreed extent. |
| ENQ-07 | Bounded server-side rate/abuse tests in the authorized test environment; legitimate visitor recovery, shared-network behavior and assistive-technology use. No quiet false-success discard. |
| ENQ-08 | Non-JSON response, wrong content type, provider exception and third-party outage produce safe errors and operator signals while the static site remains usable. |
| Release candidate | Re-run relevant COPY, responsive, security, dependency and performance checks against the actual build. Verify real receipt through an authorized test at the final destination. A preview test does not prove the final domain's routing or production worker schedule. |

The next architecture decision can adopt this boundary without choosing a paid plan now. The private draft remains non-sending until the live prerequisites and tests are complete.

## Primary sources

All sources below returned HTTP 200 and were read on **15 October 2026**. Netlify sources use the provider's published Markdown endpoints. Astro, MDN, PostgreSQL, Cloudflare and Resend pages were read over HTTP and their document text extracted without executing page scripts or downloading media. Statements of missing guarantees mean they were not established in this bounded documentation review, not that every provider implementation path has been disproved. Account settings, contracts, current invoices and end-to-end behavior were not inspected.

- **S1:** Astro, [Deploy your Astro Site to Netlify](https://docs.astro.build/en/guides/deploy/netlify/).
- **S2:** Netlify, [Astro on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro.md).
- **S3:** Netlify, [Functions overview](https://docs.netlify.com/build/functions/overview.md).
- **S4:** Netlify, [Netlify Database](https://docs.netlify.com/build/data-and-storage/netlify-database/index.md).
- **S5:** Netlify, [Netlify Database API reference](https://docs.netlify.com/build/data-and-storage/netlify-database/api.md).
- **S6:** Netlify, [Forms setup](https://docs.netlify.com/manage/forms/setup.md).
- **S7:** Netlify, [Form submissions](https://docs.netlify.com/manage/forms/submissions.md).
- **S8:** Netlify, [Spam filters](https://docs.netlify.com/manage/forms/spam-filters.md).
- **S9:** Netlify, [Form notifications](https://docs.netlify.com/manage/forms/notifications.md).
- **S10:** MDN, [The Anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a).
- **S11:** Netlify, [Form troubleshooting tips](https://docs.netlify.com/manage/forms/troubleshooting-tips.md).
- **S12:** Netlify, [Trigger functions on events](https://docs.netlify.com/build/functions/trigger-on-events.md).
- **S13:** Netlify, [Forms usage and billing](https://docs.netlify.com/manage/forms/usage-and-billing.md).
- **S14:** Netlify, [Billing FAQ for credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans.md).
- **S15:** MDN, [Window: fetch() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch).
- **S16:** PostgreSQL, [Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).
- **S17:** PostgreSQL, [Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html).
- **S18:** Netlify, [Background Functions overview](https://docs.netlify.com/build/functions/background-functions.md).
- **S19:** Netlify, [Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions.md).
- **S20:** Cloudflare, [Delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/).
- **S21:** Cloudflare, [Dead Letter Queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/).
- **S22:** Resend, [Idempotency Keys](https://resend.com/docs/dashboard/emails/idempotency-keys).
- **S23:** Resend, [Event Types](https://resend.com/docs/webhooks/event-types).
- **S24:** Cloudflare, [Validate the token](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- **S25:** Astro, [Images](https://docs.astro.build/en/guides/images/).
- **S26:** Netlify, [Netlify Image CDN](https://docs.netlify.com/build/image-cdn/overview.md).
- **S27:** Netlify, [Netlify Database billing and usage](https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage.md).
