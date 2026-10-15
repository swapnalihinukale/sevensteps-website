# Live enquiry provider decision

15 October 2026. **Select Netlify static hosting, Netlify Functions, Netlify Database PostgreSQL and Resend for B03.** Keep Astro static output and the current browser modules. This decision closes the provider candidates in [Technical decisions](TECHNICAL-DECISIONS.md) and [Enquiry architecture review](ENQUIRY-ARCHITECTURE-REVIEW.md). The engineering choice is fixed; no account, live receiver or public deployment exists through this decision.

The reviewed documentation supplies the required transaction, unique-key and mail-idempotency primitives. The implementer must still pass ENQ-01 through ENQ-08. No provider documentation constitutes a passed enquiry test.

## Fixed implementation

| Boundary | B03 decision |
|---|---|
| Hosting and runtime | Netlify serves the Astro static artifact. Separate TypeScript/ES-module Functions receive enquiries and process notifications. Use the supported Node 22 runtime already selected for the app; set its Functions runtime explicitly and verify the deployed version. No Astro server adapter is needed for these separate functions. |
| Region | Set Netlify Functions to `sin` (Singapore) before database creation; create Netlify Database in that same region. The Database API defaults to the site's Functions region. Verify the resulting database region during provisioning and fail activation if it differs. Use Resend's Tokyo `ap-northeast-1` sending region. These choices do not establish India-only storage or processing. [S2][S3][S8] |
| Database access | Use the official `@netlify/database` package and a checked-out pooled connection for each transaction. Pin and audit the added runtime dependencies at B03. Parameterize SQL; release connections in a `finally` path. Keep migration credentials separate from the least-privilege runtime role. [S2] |
| Receipt | A same-origin `POST /api/enquiries` validates the request, commits one enquiry plus one outbox row, then returns a stable opaque receipt. Only a committed record permits the received state. Mail acceptance has no bearing on receipt. |
| Notification | Send one operator email per enquiry through the Resend API, using its maintained SDK for sending and signed webhook verification. Keep the recipient in server configuration and the notification payload immutable. Disable open/click tracking. B03 does not send a separate customer acknowledgement email. [S6][S7][S14] |
| Recovery | Keep pending, accepted, delivered-to-server, failed and reconciliation-required notification states in PostgreSQL. The named operator uses a restricted PostgreSQL read-only role with pgAdmin desktop and saved enquiry/recovery views. Supply the saved views and a short runbook; demonstrate retrieval with the operator. Do not require log reconstruction or build a custom account portal. |
| Preview data | Use a separate Netlify integration site and empty synthetic database. Disable Deploy Previews and branch deploys on the production site; prohibit production Agent Runner runs and production database cloning into review environments. Test that restriction before storing personal data. Ordinary owner-review previews retain the current non-sending form. [S1][S5] |
| Billing baseline | Plan production around a paid Netlify credit-based account and Resend's transactional service. The owner supplies the billing account and spending limit; the implementer verifies the current tier/quotas against the workload before activation. No free-tier assumption or paid plan change follows from this document. |

Use Netlify Functions and the database outbox without an added queue, background-function dependency or Netlify Forms submission path. Netlify Background Functions acknowledge invocation before processing; that acknowledgement would not satisfy the durable receipt condition. A managed queue would add another recovery boundary without removing the database transaction. [S10]

## Idempotency and retry rules

These are implementation constants, not further product choices:

1. Issue a server-signed submission token containing a random 128-bit-or-stronger identifier, form version and 24-hour expiry. Persist no personal form content in browser storage. The browser reuses that token for an uncertain retry and requests a new token only for a deliberate new enquiry. Reject expired or invalid tokens without creating a record. Keep token signing keys in server secrets, with verification overlap during rotation.
2. Enforce a non-null unique `(form_version, token_id)` key in PostgreSQL. Store a canonical request fingerprint. A same-key/same-content retry returns the stored receipt; changed content returns a safe conflict. Insert the enquiry and its one notification outbox row on the same connection between `BEGIN` and `COMMIT`; roll back both on failure. [S2][S11]
3. Retain the deduplication record for at least seven days and longer if the enquiry record remains. The signed expiry prevents a deleted old key from turning an uncertain retry into a new submission. Deduplication metadata must not contain the visitor's name, address or message. The owner's retention policy still governs personal enquiry data.
4. Claim an outbox row with an atomic lock/update and a 90-second lease. Commit the claim before calling Resend; do not hold a database transaction during a network call. Persist `first_attempt_at`, attempt count, lease owner/expiry, next attempt and the fixed notification payload before the first send. Use one stable provider key, `enquiry-notification/<outbox-id>`, and a conditional lease-owner update when saving the outcome.
5. Make one post-commit send attempt with a four-second provider deadline, then return the committed receipt even if notification fails. The scheduled function repairs missed dispatches and expired leases every four hours. Claim at most four rows per run and stop work before the 30-second scheduled-function limit; do not start another provider call after a 20-second work deadline. Unclaimed rows stay pending. [S4]
6. Schedule repair at `0 */4 * * *` UTC. A failed attempt becomes eligible for the next sweep, subject to any provider `Retry-After`. Allow at most six sends including the immediate attempt. Stop automatic sends **22 hours after `first_attempt_at`**, including delayed workers. A retry that reaches a sweep after that deadline goes to reconciliation. This leaves margin inside Resend's documented **24-hour** idempotency lifetime. Any retry uses the identical key and payload. [S6]
7. Retry a transport timeout, 429, 5xx or `concurrent_idempotent_requests` within that limit. Respect a provider `Retry-After` value without extending the deadline. Treat invalid payload/key, credential/domain errors and `invalid_idempotent_request` as actionable failures. Do not generate a fresh key to bypass a conflict. [S6][S7]
8. A crash after provider acceptance leaves an uncertain outbox item. A same-key retry within the safe window can recover the provider result without a second send. After the deadline, mark the item `needs_reconciliation`; the operator checks the provider's record and the stored enquiry. A missing response alone never justifies a new send outside the guarantee. Require evidence of non-acceptance before an operator creates a replacement notification. Keep unresolved cases visible for direct follow-up from the durable record.

Verify Resend webhooks from the raw body and signature/timestamp headers through the SDK, with replay protection. Handle duplicate event IDs and out-of-order events. A delivery event means the recipient's mail server accepted the email; it does not mean inbox placement or human reading. A bounced/failed notification must remain visible to the operator. Do not expose a public receipt lookup that returns personal data. [S9][S14]

## Operating constraints

Netlify creates Deploy Preview database branches with a copy of production data. Branch write isolation does not remove that personal-data copy. The separate synthetic integration site is a required part of this selection, including migration and failure tests. The production site must use only its intended production deploy workflow. [S1][S5]

The four-hour repair schedule limits idle cost. With a five-minute sleep timeout, six database wakes per day represent about **15 active hours in a 30-day month**, before real traffic, work time, scaling or cold-start overhead. Netlify's reviewed Free database allowance is 48 compute units per billing period; the schedule calculation does not prove that Free can support the site. Estimate the chosen account's actual units, media transfer, production deploys and notification volume. Watch remaining credits and oldest pending notification age. Netlify documents that exhausted team credits can pause all sites in that account, so credit exhaustion can also stop the static portfolio. The owner must supply the budget and escalation contact before activation. [S12][S13]

Normal submissions receive an immediate notification attempt after the durable commit. A failed or interrupted attempt can wait up to the next four-hour sweep, plus execution delay; sustained outages can take longer. The visitor still receives the committed receipt. This repair interval is an engineering recovery choice, not a promise that the photographer has read or will answer within four hours. The operator must check the recovery view when the provider or scheduler raises an alert.

The database billing page still describes a July 1, 2026 storage-price transition without a settled October storage rate in the inspected text. Do not quote a monthly total from it. Confirm current account pricing and limits during provisioning; record that evidence with B03. Keep spending alerts active and auto-recharge disabled unless the owner authorizes it. [S12]

Netlify documents PostgreSQL snapshots and restoration, with backup retention depending on the plan. Record the actual backup schedule/window and prove a synthetic restore into the isolated integration environment. A committed enquiry is durable application storage; this decision does not promise zero data loss through a provider disaster. Use additive migrations and a rollback/recovery runbook. [S2][S12]

Resend states that region selection controls where email is routed/sent. Its account data, metadata, logs and API records remain in the **United States** regardless of sending region. The owner must accept the processors and cross-border handling before real submissions. An India-only requirement would invalidate this default; do not conceal that incompatibility or change regions as a pretend remedy. Avoid enquiry text in subject lines, logs, analytics and URLs. Retention must cover the database, provider data, recipient mailbox, exports and backups. [S8]

## External inputs, kept separate from engineering choices

Record these in [Owner inputs](OWNER-INPUTS.md) and the B03 integration record. The user has said they do not know the photographer personally; public research cannot supply these confirmations.

| Input | Exact evidence required |
|---|---|
| Account authority | Business-controlled Netlify team/site and Resend account; named billing administrator and approved operator access. Do not reuse a preview owner's account by inference. |
| Sending authority | Owned domain/subdomain, authorized DNS access, verified sender address and required SPF/DKIM/DMARC configuration. The implementer can prepare records before the authorized DNS change. |
| Receiving and response | Confirmed fixed recipient, backup escalation contact, named person who responds and any permitted response-time wording. Demonstrate recipient receipt and read-only database recovery. |
| Spending | Approved monthly operating ceiling, current paid tier/limits, alert recipients and the owner's policy on auto-recharge. Test safe quota/rate-limit failure states with synthetic data. |
| Data handling | Owner-approved fields, privacy contact, processor/cross-border acceptance, numeric active-enquiry retention, mailbox/export deletion, actual backup expiry and a deletion operator. No researched phone/email proves permission to activate receiving. |
| Integration test | Authorized synthetic destination and account; permission for a final known test at the intended recipient before public activation. Keep ordinary review previews non-sending. |

## B03 acceptance, local results and integration gates

| Gate | Required test |
|---|---|
| ENQ-01 | Commit one record/outbox pair; show a matching receipt; have the operator retrieve the stored enquiry and notification state. |
| ENQ-02 | Reject invalid, extra and oversized fields on the server, use safe output, and preserve a usable form state. |
| ENQ-03 | Race same-key requests, change content under the same key, simulate lost acknowledgement, duplicate worker claims, token expiry and provider conflicts. Prove one logical record and no unintended duplicate notification. |
| ENQ-04 | Exercise offline, pre-commit timeout and post-commit timeout; retry the same token. Check that personal content stays out of browser storage and URLs. |
| ENQ-05 | Fail sending after commit; crash after provider acceptance; cross the 22-hour cutoff. Show bounded recovery and reconciliation without a blind resend. Test webhook signatures, duplicates and ordering. |
| ENQ-06 | Fail the transaction, exhaust connections and interrupt dispatch. Retain pending work; show no premature receipt. Restore synthetic data and verify the documented recovery process. |
| ENQ-07 | Exercise server rate limits and abuse handling in the integration environment, including shared networks and accessible recovery. Do not acknowledge discarded submissions. |
| ENQ-08 | Inject malformed provider responses, quota/credit limits and third-party outages. Keep honest client states and operator signals; distinguish provider outage from account-wide site suspension. |

The [local B03 implementation](BACKEND-IMPLEMENTATION-2026-10-15.md) now exercises the receiving code against isolated PostgreSQL and synthetic provider responses. The table above still defines the full provider integration gates; local tests do not complete account, operator or live delivery checks.

Run the repair worker by explicit invocation in integration tests, then verify its production schedule after an authorized deployment. Netlify schedules run only on published deploys. Complete the [quality/security gates](QUALITY-AND-SECURITY-GATES.md), including locked dependencies and secrets checks, before activation. This document adds no application code or packages. [S4]

## Official sources read on 15 October 2026

The following provider pages returned HTTP 200 during this decision review. S11 identifies PostgreSQL material read in the preceding review. The agent read documentation without creating accounts, invoking provider functions or sending mail.

- **S1:** [Netlify Database overview](https://docs.netlify.com/build/data-and-storage/netlify-database/index.md).
- **S2:** [Netlify Database API and transactions](https://docs.netlify.com/build/data-and-storage/netlify-database/api.md).
- **S3:** [Netlify Functions configuration, regions and runtime](https://docs.netlify.com/build/functions/configuration.md).
- **S4:** [Netlify Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions.md).
- **S5:** [Netlify Deploy Previews and disabling previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews.md).
- **S6:** [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys.md).
- **S7:** [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email.md).
- **S8:** [Resend regions and data residency](https://resend.com/docs/dashboard/domains/regions.md).
- **S9:** [Resend webhook event types](https://resend.com/docs/webhooks/event-types.md).
- **S10:** [Netlify Background Functions](https://docs.netlify.com/build/functions/background-functions.md).
- **S11:** PostgreSQL [unique constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) and [transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html), read during the preceding enquiry review; the current Netlify API transaction example supplies the provider-specific connection requirement.
- **S12:** [Netlify Database billing, limits and backup retention](https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage.md).
- **S13:** [Netlify credits and exhaustion behavior](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work.md).
- **S14:** [Resend webhook verification with its SDK](https://resend.com/docs/webhooks/verify-webhooks-requests.md).
