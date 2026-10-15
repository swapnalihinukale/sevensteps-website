# Release and operating runbook

Prepared on 15 October 2026. This document prepares future work. It does not authorize a deployment, paid account, DNS change, live submission or message to the photographer. The current milestone is the owner's review of the placeholder website. Keep that review moving while original photographs and business facts remain pending.

The [execution plan](../EXECUTION-PLAN.md) owns task status. Use [current implementation evidence](CONTENT-READY-IMPLEMENTATION-2026-10-15.md), [content input instructions](../site/content/README.md) and the [fixed provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md) with this runbook. Recorded local tests do not establish a successful production launch.

## 1. Keep the four build surfaces distinct

| Surface | Command from `site/` | Output and permitted use |
|---|---|---|
| Owner review | `npm run build` | `dist/`, with Add/Replace notes and a non-sending form. Current local preview is port 4321. |
| Image and public-template test | `npm run build:fixture` | `dist-fixture/`, with labelled geometric images, an invalid example domain and inactive contact. `npm run preview:fixture` uses port 4324. Never deploy this output. |
| Designed enquiry test | `npm run build:integration` | `dist-integration/`. `npm run lab:site` uses port 4323, a temporary local database and synthetic notifications. Only this loopback server activates the form. Never deploy this output. |
| Future public release | `npm run build:public` | `dist/`, only after the real content and release gates pass. The command removes any previous `dist/` before it attempts the build. A refusal must stop deployment. |

The current CI workflow validates commits on `feat/sevensteps-rebuild`. It does not deploy. Astro produces static files; Netlify bundles the separate Functions. Neither requires a Docker image, container registry or a continuously running application server. The image pipeline prepares responsive photograph files during the build.

Do not use directory name alone as proof of a public artifact: review and public modes both use `dist/`. Preserve the build command, source commit, approval references and complete file-hash manifest with each candidate. Test output must not become a substitute when a public build fails.

For the current owner review, use the local website and its content checklist. Localhost does not give the photographer remote access. A future remote review preview needs explicit hosting authorization, access control and a non-sending configuration. `noindex` and an obscure URL do not provide access control. Never connect that preview to production enquiry data.

## 2. Record people and external inputs once

Use [Owner inputs](OWNER-INPUTS.md) as the collection sheet. Do not put passwords, API keys, client messages or private permission correspondence in this repository.

| Responsibility | Required before the relevant release step |
|---|---|
| Business/content owner | Confirm the trading name, services, permitted assignments, public credits, published claims and who approves changes. |
| Domain and hosting administrator | Confirm the exact domain, registrar, DNS zone and business-controlled Netlify team/site. Record existing website and mail DNS records, renewal owner and recovery access. |
| Responder and backup | Confirm the receiving mailbox, the person who answers, the backup contact and any response-time wording. Verify they can access the mailbox. |
| Technical maintainer | Own the repository, candidate validation, deploy/rollback access, dependency updates and incident response. |
| Billing administrator | Accept the chosen tier, current quotas, monthly spending ceiling, alert recipients and auto-recharge policy. |
| Data/deletion operator | Approve privacy text, processors and regions, numeric retention periods, deletion requests, backup expiry and restricted operator access. |

The public renderer currently supports a confirmed direct-email contact link. Test it with the owner and verify an authorized sample reaches the mailbox before publishing. Opening an email application is not proof of receipt. The live website form has separate activation requirements; publishing the email contact path does not activate it.

For a live form, retain the selected Netlify Functions and Database in Singapore, with Resend sending from Tokyo. Verify the resulting regions in the actual accounts. Resend account data, API records and logs remain in the United States under the reviewed provider policy. Obtain processor and cross-border acceptance before collecting real enquiries. An India-only requirement would require revisiting this decision.

## 3. Prepare the real candidate after the placeholder review

1. Close the owner's review of layout, reading order and navigation. Keep unknown business facts labelled until confirmed.
2. Follow [Image preparation](../site/docs/MEDIA-PIPELINE.md). Keep cleared web masters in ignored `site/.local/media-masters/`; keep original archives and permission correspondence in the owner's restricted storage. Populate `content/media.json` with the selected records and genuine rights evidence.
3. Prepare `content/public.json` and update the canonical slot statuses and retain/omit decisions. Keep unsupported features omitted. In particular, the current public renderer does not implement retained film, team or logo-artwork sections.
4. Run `node scripts/prepare-media-public.mjs` from `site/`. Inspect the actual derivatives, orientation, colour, skin tones, clothing detail, small-screen crops, full frames, metadata removal and actual transfer sizes with the photographer. Inspecting geometric fixtures does not complete this step.
5. **Close the remaining candidate-review implementation prerequisite.** The present public gate requires completed release evidence before rendering real public content; review and fixture modes do not provide the final real-content candidate. The maintainer must provide an isolated local real-content candidate path and run its checks before the first release. This is unfinished engineering work, not missing information from the owner. Do not fabricate approval evidence, mark fixtures as real work, or disable the production gate to get a preview.
6. Review that exact unpublished candidate on the required real browsers/devices and assistive technologies in the [coverage ledger](RESPONSIVE-AND-RELIABILITY-SPEC.md). Complete the remaining Windows, physical mobile/tablet, screen-reader and real-media checks. A prior WebKit automation pass or limited native Safari zoom check does not complete the matrix.
7. Verify the approved contact destination with a separately authorized synthetic message. Confirm privacy wording, factual copy, captions, titles, social preview, canonical origin, sitemap, redirects and the 404 journey. Record human review as well as automated results.
8. After the checks and explicit publication authorization, complete `content/release-approval.json` using [its schema](../site/content/README.md#release-approval). Hash the exact public content and generated media manifest. Reference real evidence and the approving person/time. No approval file exists now.

## 4. Produce and identify the release artifact

Use a clean checkout of the reviewed branch commit with the pinned Node and npm versions. Provision the permitted web masters from controlled storage before a remote build; they are intentionally absent from Git. Record their hashes and the retrieval method without recording storage credentials. Source provisioning for a production build still needs implementation and validation.

Run the established gates from `site/` with native PostgreSQL available for the synthetic server tests:

```sh
npm ci --ignore-scripts
npm run check
npm run test:unit
npm run test:media
npm run test:server
npm run build:fixture
npm run build:integration
npm run build
npm run test:e2e
npm run test:build
```

The current browser suite checks review, synthetic public and local enquiry surfaces. It must be extended to the real candidate from step 3 before release. `test:build` exercises rejection paths and restores review output. Run the actual public build last:

```sh
npm run build:public
node scripts/check-public-artifact.mjs public
npm run budget
npm audit
```

Then run the repository sharing check from the repository root: `node scripts/check-shareable.mjs`. Resolve relevant failures and known vulnerabilities against the installed lockfile. Preserve licence notices. Do not hide failing checks with an old artifact or silently omit unavailable tests.

Save a restricted release record containing the source SHA, clean working-tree status, lockfile hash, build/runtime versions, exact content/media hashes, file-by-file artifact hashes, test report references, account/site identity, contact mode and previous known-good deploy ID. Inspect the public output for private source paths, review notes, fixture labels, originals, secrets and unexpected files. Review the actual candidate's performance budget, not the placeholder-only number.

An approval references source and content; the artifact manifest identifies the bytes to deploy. If the deployment platform rebuilds from Git, provision the same inputs and compare the resulting artifact manifest before promotion. If those bytes differ, inspect and validate the new candidate. Preserve the complete deploy package, including function bundles/configuration where used, rather than assuming a static folder contains the backend.

## 5. Configure hosting before promotion

The committed [Netlify configuration](../netlify.toml) uses `site/` as the base, `dist/` as the publish directory and `netlify/functions` for Functions. Production runs `npm run check && npm run build:public`. Enquiry mode defaults to disabled. Branch and pull-request deployments are skipped. Verify the actual site's production branch and deployment settings; a successful branch push must not publish the draft.

Before promotion, compare the effective hosting configuration with the repository and record:

- HTTPS, the exact canonical host and a tested redirect from its alternate host. Inspect existing DNS and preserve mail records. Prepare a record-level DNS diff and rollback values before an authorized change. Domain purchase, delegation and DNS edits still require authority.
- Production Deploy Previews, branch deploys, database clones and Agent Runner access disabled before personal data exists. Use a separate empty synthetic integration site for provider tests. Do not clone production data into it.
- Actual response headers on the homepage, story, 404, assets and APIs. The committed baseline sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` and API `Cache-Control: no-store`. Hosting success alone does not establish their presence on Function responses.
- A tested Content Security Policy for the real artifact. Start from self-hosted scripts, styles, images, fonts and connections; deny objects and framing, and restrict form actions/base URLs. Current templates use inline styles, so account for them explicitly. Any inline script requires a reviewed hash or nonce. Do not add broad script exceptions to silence errors. CSP is a release configuration task, not a claim about today's headers.
- Cache policy by resource: revalidate HTML; cache only content-hashed static assets as immutable; never cache enquiry token/submission/webhook responses. Check changed content selects its new asset URLs.
- HSTS after HTTPS works on the intended host. Do not add `includeSubDomains` or preload until all affected subdomains are reviewed. Record the deployed value and recovery implications.

These configuration checks are not completed by this document. The maintainer must test the chosen policy against navigation, image viewing, fonts, error states and the authorized contact path on the final artifact.

## 6. Activate the live form only through its separate gate

A live form is optional for the first email-contact release. If approved, follow the [provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md) and ENQ-01 through ENQ-08. The following steps remain unperformed in real accounts:

1. Provision the business-controlled accounts, regions and an empty synthetic integration database. Keep migration, runtime, operator and privileged retention roles separate. Apply the migration and [operator views](../site/server/operator-views.sql) in the intended schema; verify restricted grants.
2. Verify domain/sender authority and the current provider's SPF, DKIM and DMARC instructions with the domain administrator. Preserve existing mail setup. Set the fixed receiving address and disable open/click tracking.
3. Install separate random signing, fingerprint and rate keys through server-secret settings. Preserve signing verification overlap during rotation. Preserve the fingerprint key while deduplication records remain, unless a reviewed migration changes it. Do not store secrets in the approval JSON, shell history or build artifact.
4. Verify strict TLS with exactly one `sslmode=verify-full`, the reviewed database driver, explicit production runtime/context and the adapter's trusted client IP. Confirm all activation settings together against [the config validator](../site/server/config.ts). The blank environment example is not an activation recipe.
5. Run authorized real-provider synthetic tests for receipt, duplicate/timeout recovery, signed webhooks, rate/credit limits, failed notification, connection exhaustion and backup restore. Verify the actual scheduler after a published integration deploy, then demonstrate retrieval with the named operator.
6. Implement and test the public form activation path on the real candidate. The current public renderer uses email contact; the loopback injection mechanism must never serve as production activation.
7. Obtain final activation approval with the verified evidence. Deploy the tested Functions and public form configuration together. Confirm one known submission at the actual receiver, then record its opaque receipt and the responder's confirmation without copying message contents.

A database receipt means the application committed the enquiry. It does not mean the operator received or read an email. A provider delivery event means recipient-server acceptance. Preserve these distinctions in the interface and operating notes.

## 7. Promote, smoke-test and roll back

Promotion requires the authorized owner, tested candidate identity, current account/target, known-good predecessor and a maintainer available to recover it. Record the deploy ID and time. After promotion, inspect HTTPS/redirects, home and both stories, direct deep links, 404, images/full-frame view, mobile navigation, keyboard/motion, metadata, headers and the authorized contact test. Check that private routes and files are absent. A later automated build must pass the same gates before it can replace this artifact.

For a static defect, stop further promotions and restore the recorded previous complete Netlify deploy when compatible. Verify its source/artifact identity, contact behavior and current security configuration. A first release needs an agreed fallback: preserve the previous site or prepare an owner-approved static maintenance page with verified contact. Do not improvise a guessed recipient during an incident. Create a normal revert/fix commit on `feat/sevensteps-rebuild` for source history; do not reset, force-push or merge into `master` as a rollback shortcut.

Database rollback is separate. Use additive, backward-compatible migrations, keep a migration ledger and prove the previous application version can use the new schema before release. Restore the earlier application only if that compatibility holds. Prefer a forward corrective migration to dropping columns/tables or undoing accepted enquiries. Do not restore an old database snapshot merely to undo a visual deploy: that can lose newer receipts and restart already accepted notifications.

## 8. Back up, restore and delete data

Before real enquiries, the data operator records numeric retention for active enquiries, mailbox copies, exports, provider records/events and backups; the billing administrator confirms the plan's actual backup window. Agree the acceptable recovery point and recovery time, then measure them in a synthetic restore drill. Provider marketing claims do not establish the site's recovery result.

Keep application/content source in Git, permitted master backups in owner-controlled storage and secrets in the approved secret store. Record how the authorized maintainer recovers each without copying secrets into Git. Production source archives, database exports and release manifests need restricted access and an owner-approved expiry.

For a restore drill, create synthetic records in integration, take a supported backup, restore to a separate empty target, and compare expected receipts, unique tokens, enquiry/outbox pairs and operator views. Keep senders and scheduled repair disabled. Repeated notifications must not result from a restore. Record backup time, recovery time, verification and cleanup.

For a real incident, restore only into an authorized restricted recovery environment. A production-data restore is not an ordinary integration preview. Keep outbound sending disabled while reconciling newer receipts, provider acceptance IDs, deletion records and uncertain outbox state. Older backups can reintroduce erased information and forget a completed send. Reapply required deletions before reopening access; do not retry uncertain notifications outside the 22-hour safe window. Promote the recovered target only after the owner and maintainer accept the measured data gap and checks.

For routine deletion:

1. The designated operator verifies the request or retention due date using existing authorized records, without collecting extra identity documents by default.
2. The privileged retention operator invokes `purge_enquiry_pii` for the verified receipt in the correct schema. Its implementation clears the enquiry and notification payload, refuses an active send lease and retains deduplication metadata for at least seven further days. Do not grant this privilege to the runtime or read-only responder.
3. Verify both personal-data copies are absent. Remove applicable recipient-mailbox, export and provider copies under the approved policy. Record only the minimum deletion evidence in restricted storage.
4. Let backup copies expire under the disclosed schedule; prevent a restore from putting deleted data back into service. Maintain the minimum restricted deletion journal needed for that purpose, with its own retention.
5. Prune expired deduplication/rate/event metadata only under the documented role, reference and retention rules. The current four-hour repair worker does not implement the owner's retention schedule. A privileged maintenance job and its evidence remain a production prerequisite.

## 9. Responder and incident runbook

During the agreed working hours, the primary responder checks the confirmed mailbox and the restricted `enquiry_operator_inbox` view. The view contains personal information and belongs in the approved SQL client, not a shared spreadsheet or issue tracker. Record the first meaningful human response and next action. The backup covers absence. The owner must set the actual review cadence and any promised response window; the four-hour retry interval is not a response promise.

For an active form, review `enquiry_operator_recovery` whenever a provider/scheduler alert fires and at the agreed operating check. Watch oldest pending age, failed/reconciliation counts, credit/quota alerts and missed repair executions. Alert routing and maintenance access still need provisioning; this document does not create monitoring.

| Signal | First response and recovery |
|---|---|
| Enquiry has a receipt but no notification | Retrieve it from the restricted inbox and let the responder act from that record. Inspect its notification state before sending a replacement. Keep the stored payload/key unchanged. |
| Pending/sending exceeds the next expected repair execution | Check scheduler execution, lease expiry, provider health and credits. Escalate to the maintainer. Do not run competing manual sends or clear locks to force progress. |
| `needs_reconciliation`, provider timeout after acceptance, or retry cutoff | Check provider evidence with the existing ID/key and the durable enquiry. After six attempts or 22 hours, automatic resend stops. Create a replacement notification only with evidence of non-acceptance and an authorized operator action. |
| Bounce, complaint or suppressed mail | Verify recipient/account health and provider reason with the owner. Keep the enquiry available for authorized direct follow-up. Do not silently change an immutable outbox destination. |
| API fails before receipt | Show the tested unavailable/retry state. Use the already verified contact fallback if present. Do not tell the visitor an uncommitted enquiry arrived. |
| Credits exhausted or hosting unavailable | Notify the billing administrator and maintainer through the pre-agreed channel. Check whether the whole Netlify team is paused. Increasing spend or auto-recharge requires the owner's authority. |
| Suspected data exposure or credential leak | Contain the affected route/account under the approved incident authority, preserve access-restricted evidence, notify the owner and rotate affected credentials through the proper administrator. Assess required notifications with the owner and qualified advice. Do not paste secrets or enquiry data into tickets. |

For each incident, record a restricted incident ID, times, affected deploy, symptoms, action owner, known data gap, recovery check and follow-up. Keep raw personal payloads out. After recovery, fix the cause and rerun the affected acceptance tests before resuming normal deployment.

## 10. Handoff and recurring ownership

The maintainer demonstrates content replacement, crop review, exact-build validation, deployment recovery and, if activated, operator retrieval/deletion with the owner. Give each named person the least access they need and verify account recovery. Keep the repository, domain, hosting, mail and billing under agreed ownership.

The handoff includes the release record, known-good rollback deploy, approved contact process, device/accessibility evidence, budget/credit settings, current backup/deletion policy, incident contacts and a short content-update procedure. Use [Measurement](MEASUREMENT.md) for the separate business register. Schedule dependency, account-access, content and cost reviews through the owner's agreed operating process; no recurring automation is installed by this document.

The owner still needs to name the people, numeric policies and account details above. The engineering prerequisites are also explicit: local real-content candidate review, controlled build-input provisioning, deployed security/cache policy verification, and, only if enabling the form, production activation, live-provider acceptance, monitoring and retention maintenance. None is a completed live test today.
