# Local enquiry backend

15 October 2026. The user authorized local B03 implementation and saving the work on the supplied repository. The backend now runs against a temporary native PostgreSQL database with synthetic notification responses. The website draft still cannot send enquiries. No business account, live database, email delivery or deployment was used to establish these results.

## Implemented

- `GET /api/enquiry-token` issues a signed, random submission reference with a 24-hour lifetime and key-rotation verification support.
- `POST /api/enquiries` checks the exact origin, trusted adapter IP, request method, JSON type, 64 KiB byte bound and strict field schema. The store commits an enquiry and immutable notification outbox together before the API returns a receipt.
- A unique form-version/token key and a separate HMAC fingerprint return the original receipt for an identical retry. Changed content under the same key returns a conflict.
- The browser keeps only the opaque retry token/state or receipt in session storage. It never persists names, email addresses or message text. After an uncertain reload it requests the same details and reuses the token. A deliberate Start a new enquiry action resets it. If the browser cannot store the reference, it stops before submission and explains the limitation. The ordinary private draft and motion controls still work without storage.
- PostgreSQL workers claim rows with a 90-second lease and row locks. They release the transaction before calling the mail service. Retries keep the original payload/key, stop after six attempts or 22 hours, and expose uncertain outcomes for reconciliation.
- The scheduled repair checks at most four records per run. Failed work becomes eligible at the next UTC four-hour boundary, or later if Retry-After requires it. The worker does not start a provider call after its 20-second work budget. It bounds each call to four seconds.
- The Resend adapter uses its maintained SDK with an explicit destination, base URL, request signal and idempotency key. It sends plain text to the fixed operator address. A changed configured recipient cannot reroute an already stored notification.
- The webhook verifier checks the raw signature and timestamp window, deduplicates events, and handles events arriving before the send response. It preserves delivery/failure ordering and handles suppressed mail as a failure. A delivered event means recipient-server acceptance, not reading or inbox placement.
- Restricted SQL views support operator retrieval and recovery. A separate privileged deletion function clears both copies of personal data while retaining deduplication metadata for at least seven further days. Runtime and operator roles cannot perform that deletion.
- API and scheduled-function defaults refuse activation. Production builds run the public-content gate, which currently refuses release. Branch and pull-request preview builds are skipped in the Netlify configuration.

## Packages

Added exact runtime pins: `@netlify/database` 2.0.1, `@netlify/functions` 6.0.2 and `resend` 6.33.0. Tests use `pg` 8.16.3 and `@types/pg` 8.15.6. PostgreSQL 16.13 ran locally. Astro, TypeScript, the selected palette and the existing browser modules remain the chosen foundation. The server packages do not enter the static browser bundle.

## Run and review

From `site/`, use Node 22.23.2 and npm 10.9.8:

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run test:server
npm run test:e2e
npm run lab
```

The test runner requires native PostgreSQL 16 or newer. Set `SEVENSTEPS_PG_BIN` to its binary directory if discovery cannot find it. Each run creates a fresh loopback database, ignores inherited connection settings, and stops/removes that database afterwards. It refuses to substitute a remote database or silently skip database tests. The lab starts at `http://127.0.0.1:4322/`; use sample data only and stop it with Ctrl+C. The normal website remains at port 4321.

The local run currently passes 99 server tests and 19 UI logic tests. The sharing guard passes 8 regression tests. The final browser run passes 84 of 84 checks across Chromium, Firefox and WebKit, with no skipped tests or retries. It includes a fixed breakpoint-focus race and regressions for intentional focus elsewhere. See the summary for exact source/artifact hashes.

The CI workflow repeats type/build/content, real local PostgreSQL, three-engine browser, byte-budget, package-audit and sharing checks. It uses pinned GitHub Actions, read-only repository permissions and no live secrets. CI publishes no website.

## Verification boundaries

Local tests cover committed receipt, same-key races and conflicts, lost acknowledgements, page reload recovery, Unicode limits, malformed bodies, transaction rollback, lock expiry, stale workers, retry deadlines, signed events, role permissions and personal-data deletion. Browser tests also retain the existing navigation, motion, responsive, keyboard and accessibility coverage. See the current machine-readable evidence in [B03 summary](../site/docs/audits/b03-summary.json) and the accompanying logs.

Full and production dependency audits on 15 October report zero known advisories for the installed lockfile. The current static artifact still contains 3.21 KiB compressed JavaScript, 6.34 KiB compressed CSS and a 94.27 KiB conservative shell. These figures exclude real portfolio photographs and do not establish field performance or live provider delivery.

The earlier B02 verification ledger is a historical baseline. Its browser JSON was redacted to remove inherited process environment variables before sharing; test outcomes remain unchanged. The new environment allowlist and sharing guard check staged blobs, working copies and unignored additions. They report locations without printing matched credentials.

## Next integration gates

| Gate | Local evidence | Still required before activation |
|---|---|---|
| ENQ-01 | Atomic receipt/outbox, operator SQL retrieval | The actual operator retrieves a known enquiry in the chosen account. |
| ENQ-02 | Strict validation, safe plain text and accessible form errors | Review the owner-approved fields and final wording. |
| ENQ-03 | Concurrent deduplication, token expiry, fixed payload/key | Confirm provider idempotency in the separate synthetic integration site. |
| ENQ-04 | Offline, lost acknowledgement, reload and retry | Test deployed networking and confirmed fallback contact. |
| ENQ-05 | Leases, bounded retries, cutoff, signed duplicate/out-of-order events | Exercise the real provider and verify scheduler timing. |
| ENQ-06 | Transaction rollback, database errors, role restrictions, recovery views | Connection exhaustion in the chosen service and an actual synthetic backup restore. |
| ENQ-07 | Atomic local rate limits and honest rejection | Shared-network abuse tests and agreed operating thresholds in integration. |
| ENQ-08 | Synthetic malformed/quota/transport errors | Account credit limits, alerts, actual provider outage handling and owner escalation. |

Before provisioned integration, confirm the business account, domain authority, sender/recipient, approved spending, numeric retention, processor/data-region acceptance and named operator. Follow [the provider decision](LIVE-ENQUIRY-PROVIDER-DECISION.md). The production connection must use exactly one `sslmode=verify-full` parameter and the reviewed server driver. Keep migration privileges separate from the runtime and read-only roles, disable mail tracking in the provider, and verify that production previews cannot clone personal data.

Set cryptographically random, separate signing/fingerprint/rate keys in server secrets. Keep old signing keys for verification overlap. Preserve the fingerprint key while old enquiry deduplication records remain; changing it needs a documented migration. Do not place keys in browser code or checked-in files. The blank `.env.example` is a field reference, not an activation recipe.

The next visual/content step is unchanged: collect the photographer's permitted originals and actual business information through the 27-slot checklist. Check real image crops and performance, physical devices and screen readers before a public release. Local backend results do not establish those checks.
