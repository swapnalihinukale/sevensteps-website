# Launch your Seven Steps website

Finish your review of the placeholder site first. Then use this checklist with your developer to add your photos, test the finished pages and publish them. Approve publishing, paid services, DNS changes and live email as separate actions. We have completed local tests; we have not tested a live release.

## 1. Choose the right build

Run these commands from `site/`:

| Purpose | Command | Output |
|---|---|---|
| Review your layout and Add/Replace notes | `npm run build` | `dist/`; non-sending form; preview on port 4321 |
| Test images and public layouts | `npm run build:fixture` | `dist-fixture/`; labelled test images; `npm run preview:fixture` on port 4324 |
| Test the designed enquiry form | `npm run build:integration` | `dist-integration/`; `npm run lab:site` on port 4323; temporary database, no email |
| Build your approved public site | `npm run build:public` | `dist/`; requires your content and completed release checks |

Deploy only the successful public build. Review and public builds share the `dist/` name, so record the command, commit and file hashes. A failed public build removes the previous output. Do not substitute either test folder.

GitHub Actions checks `feat/sevensteps-rebuild`; it does not publish. Astro builds static pages, sharp prepares your images and Netlify bundles Functions. You do not need Docker or a container registry.

For remote review, follow [Preview sharing](PREVIEW-SHARING.md). Localhost works on the computer running it. A hosted private preview needs your approval, access control and a non-sending form. An obscure URL or `noindex` does not protect private content. Keep production enquiry data out of previews.

## 2. Set up access and enquiry handling

Fill [Owner inputs](OWNER-INPUTS.md) once. Keep passwords, keys, client messages and permission correspondence out of Git.

| You need to confirm | Record |
|---|---|
| Content decisions | Your public brand, services, photo permissions, credits and person approving changes |
| Domain and hosting | Exact domain, registrar, DNS zone, Netlify team/site, renewal owner and recovery access |
| Enquiries | Receiving mailbox, person answering, backup person and any promised response time |
| Maintenance | Developer responsible for updates, release checks and recovery |
| Spending | Billing owner, current plan/quotas, monthly ceiling, alert recipients and auto-recharge decision |
| Personal data | Privacy contact, accepted providers/regions, retention periods and person handling deletion |

Your first public site can use the confirmed email link. With permission, send a sample and check it reaches your mailbox. Opening the email app does not confirm receipt. Enabling the live form requires section 6.

## 3. Prepare the real candidate after the placeholder review

1. Review the layout, navigation and story order. Leave unknown facts marked for replacement.
2. Supply your permitted web masters through [Image preparation](../site/docs/MEDIA-PIPELINE.md). Keep them in ignored `site/.local/media-masters/`; keep camera archives and permissions in your restricted storage. Describe the selected photos in `site/content/media.json`.
3. Add your copy to `site/content/public.json` and update `site/src/data/content.ts` with the checked content and retain/omit decisions. Film, team and logo-artwork sections need implementation before you can retain them.
4. Run `node scripts/prepare-media-public.mjs` from `site/`. Review your photos' crops, orientation, skin tones, fabric detail and full frames. Check metadata removal and real download sizes. Geometric test images cannot establish photo quality.
5. **We still need to build the local preview for your final real-content pages.** The public build requires completed release evidence, while the current review and test builds cannot show that final version. Your developer must implement and test this isolated preview before release. Do not invent approvals or disable the public-build checks to obtain it.
6. Test those exact pages using the [device checklist](RESPONSIVE-AND-RELIABILITY-SPEC.md). Complete the remaining Windows, physical phone/tablet, screen-reader and real-photo checks. Existing automated browser tests and the limited Safari zoom check do not cover them.
7. Check your mailbox with an approved test message. Review privacy text, claims, captions, page titles, social preview, canonical domain, sitemap, redirects and missing-page recovery. Save the results.
8. After testing and your approval to publish, complete `site/content/release-approval.json` using [the required fields](../site/content/README.md#release-approval). Record the approver/time, evidence references and exact content/media hashes. No approval file exists yet.

## 4. Build and record the version you will release

Use a clean checkout of the reviewed commit, Node 22.23.2 and npm 10.9.8. Your developer still needs to implement and verify how a remote build retrieves your permitted web masters from controlled storage. Record input hashes; keep credentials out of the build record.

Install [the test prerequisites](MAINTAINER-GUIDE.md#install-test-prerequisites), including native PostgreSQL and Playwright browsers. Stop manual servers on ports 4321 to 4325 so Playwright can start its own. Then run from `site/`:

```sh
npm ci --ignore-scripts
npm run check
npm run test:unit
npm run test:media
npm run test:review-package
npm run test:server
npm run build:fixture
npm run build:integration
npm run build
npm run test:e2e
npm run test:build
```

Extend the browser checks to the real preview from step 3.5. `test:build` restores review output after testing refusals, so build the public site last:

```sh
npm run build:public
node scripts/check-public-artifact.mjs public
npm run budget
npm audit
```

From the repository root, run `node scripts/check-shareable.mjs`. Fix failures and relevant dependency vulnerabilities. Preserve licence notices and record missing tests as unfinished.

Save the commit, lockfile/input hashes, runtime versions, test results, approval, complete output-file hashes, target site, contact mode and previous working deploy ID. Inspect the output for private files, originals, test labels and review notes. Measure the real photos' performance.

Deploy the version you tested. If Netlify rebuilds it, compare its output hashes before promotion; validate any differences. Include Function bundles and configuration where used, not just the static folder.

## 5. Check hosting and security

[netlify.toml](../netlify.toml) sets base `site`, publish folder `dist` and Functions folder `netlify/functions`. Production runs `npm run check && npm run build:public`. Enquiries default to disabled. Check the site's production branch and settings so a branch push cannot publish your draft.

Before release, your developer must verify:

- **Domain:** HTTPS and redirects to your chosen host. Save existing DNS/mail records and rollback values before an approved DNS change. Preserve existing email delivery.
- **Preview isolation:** disable production Deploy Previews, branch deploys, database cloning and Agent Runner access before storing enquiries. Use a separate empty test site/database for provider checks.
- **Headers:** inspect home, story, 404, assets and API responses. Confirm the configured `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` and API `Cache-Control: no-store`; check Function responses too.
- **Content Security Policy:** test self-hosted scripts, images, fonts and connections; deny objects/framing and restrict form actions/base URLs. Account for the templates' inline styles. Use reviewed hashes/nonces for any inline script instead of broad script exceptions.
- **Caching:** revalidate HTML, cache content-hashed assets as immutable and keep token/submission/webhook responses uncached. Verify new photos get new URLs.
- **HSTS:** configure it after HTTPS works. Add `includeSubDomains` or preload only after checking every affected subdomain.

We still need to test the deployed policy against the finished site.

## 6. Set up the live enquiry form

Skip this section for the email-link release. For an approved live form, follow the [provider setup and ENQ-01 to ENQ-08 tests](LIVE-ENQUIRY-PROVIDER-DECISION.md):

1. Set up your business accounts with Netlify Functions/Database in Singapore and Resend sending from Tokyo. Verify the regions. Resend account data, logs and API records remain in the US under the reviewed policy. Confirm you accept that handling; an India-only requirement needs a different plan.
2. Create a separate empty test database. Apply the migration and [operator views](../site/server/operator-views.sql) in the correct schema. Keep migration, application, read-only responder and privileged deletion roles separate.
3. Verify your sender domain's SPF/DKIM/DMARC records without breaking existing mail. Fix the receiving address and disable open/click tracking.
4. Store separate random signing, fingerprint and rate keys in server-secret settings. Keep old signing keys during verification overlap; retain the fingerprint key while duplicate-check records exist unless you perform a reviewed migration.
5. Check [server configuration](../site/server/config.ts): one `sslmode=verify-full`, the reviewed database driver, production runtime/context and trusted client IP. Verify the complete activation settings together. Keep secrets out of Git, shell history and browser output.
6. Test receipt, duplicates, lost responses, signed webhooks, failed mail, quotas, connection exhaustion and backup restoration with approved synthetic submissions. Check the deployed repair schedule and have your responder retrieve a test enquiry.
7. Implement and test public form activation. The local test server's script injection is not a production activation method. After approval, deploy the tested form and Functions together and confirm one known enquiry at your receiving mailbox.

No real-account tests above have run. A receipt confirms database storage; provider delivery confirms recipient-server acceptance. Neither confirms that your team has read the enquiry.

## 7. Publish, check and roll back

Keep your developer available during release. Record the deploy ID/time and previous working version. Check HTTPS, redirects, home, both stories, deep links, 404, photos/viewer, mobile navigation, keyboard/motion, metadata, headers and the approved contact test. Confirm private routes/files are absent.

For a site defect, stop further deployments and restore the previous compatible Netlify deploy. Verify its contact behavior and security settings. Before a first launch, agree whether to restore the old site or use an approved maintenance page with your confirmed contact. Save fixes as revert/new commits on `feat/sevensteps-rebuild`; preserve `master`, shared history and the original `website/` files.

For database changes, add compatible migrations and prove the previous app can use the updated schema. Keep a migration record. Prefer a corrective migration over dropping data. Do not restore an old database to undo a visual change: you could lose newer enquiries or resend notifications.

## 8. Back up, restore and delete data

Set retention periods for your enquiry emails, exports and backups. Include database and provider records if you enable the live form. Confirm your services' backup windows and agree how much data loss and downtime you can accept.

Keep source in Git, photo backups in your controlled storage and secrets in the approved secret store. Restrict exports and release records, and set expiry dates.

Test restoring your website and photos. Remove enquiry emails and exports when their agreed retention period ends.

The following database procedures apply only to the live form:

**Restore drill:** back up synthetic enquiries, restore into a separate empty target and compare receipts, unique tokens, enquiry/outbox pairs and operator views. Disable senders and repair jobs during the drill. Measure recovery against your agreed limits and record the checks and cleanup.

**Real recovery:** use an approved restricted recovery environment, not the review/test site. Keep sending disabled while checking newer receipts, provider acceptance IDs, deletions and uncertain notifications. Reapply deletions before reopening access. Do not retry uncertain mail after the 22-hour limit. Confirm the data gap and recovery checks before switching the site to the restored database.

**Deletion:** verify the request or retention date using existing records. The privileged deletion operator calls `purge_enquiry_pii` for the correct receipt/schema, then checks that both enquiry and notification payloads are gone. The function refuses an active send lease and keeps duplicate-check metadata for at least seven further days. Do not grant this operation to the application or read-only responder.

Remove related mailbox/export/provider copies under your policy. Let backups expire on schedule and keep the minimum restricted deletion journal needed to prevent a restore from reviving deleted data. Prune expired rate/event/duplicate-check records under the documented rules. We still need a tested privileged maintenance job; the four-hour mail repair job does not perform retention cleanup.

## 9. Handle enquiries and incidents

Set who checks your mailbox, how often, and who covers absence. For a live form, use `enquiry_operator_inbox` in the approved SQL client and record the human reply/next action. Keep its personal data out of tickets and shared spreadsheets.

For the live form, check `enquiry_operator_recovery` after alerts and at your agreed review time. Watch old pending rows, failed/reconciliation counts, credits and missed repair executions. We still need to configure alerts and access. The four-hour retry interval is not a promised human response time.

Live-form problems:

| Problem | Action |
|---|---|
| Receipt exists, email missing | Read the stored enquiry and respond from it. Inspect notification state before replacing mail; preserve its payload/key. |
| Pending/sending beyond the next repair run | Check scheduler, 90-second lease, provider health and credits with your developer. Do not clear locks or start competing sends. |
| `needs_reconciliation` or uncertain acceptance | Check the existing provider ID/key. Automatic sends stop after six attempts or 22 hours. Require evidence of non-acceptance before an approved replacement. |
| Bounce, complaint or suppression | Verify mailbox/provider health. Use the stored enquiry for permitted follow-up; do not rewrite its notification destination. |
| Failure before receipt | Keep the tested retry/unavailable state and verified contact fallback. Do not claim receipt. |

For either contact option:

| Problem | Action |
|---|---|
| Credit exhaustion | Check whether Netlify paused the whole team. Contact your billing owner; obtain approval before increasing spend or auto-recharge. |
| Suspected exposure or leaked key | Use the agreed incident procedure to contain access, preserve restricted evidence and notify your account administrator. Rotate affected keys and assess required notifications with qualified advice. |

Record incident ID, times, deploy, responsible person, data gap, recovery check and follow-up without raw client messages. Fix the cause and repeat affected tests before the next deployment.

## 10. Hand over access and maintenance

Practise replacing a photo, reviewing its crop and restoring a deploy with your developer. For a live form, practise retrieval and deletion too. Confirm your team's access and account recovery.

Keep the release record, rollback ID, response process, test evidence, budget alerts, backup/deletion policy and incident contacts together. Agree dates for content, dependency, access and cost reviews. Use [Measurement](MEASUREMENT.md) to review enquiries and bookings. No recurring automation has been installed.
